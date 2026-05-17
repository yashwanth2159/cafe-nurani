require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const winston = require('winston');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error('CRITICAL ERROR: JWT_SECRET is not defined in environment variables.');
    process.exit(1);
}

// Security Logging (Winston)
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/security.log' }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// Security Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(cors({
    origin: [
        'https://cafe-nurani.vercel.app',
        'http://localhost:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    logger.error('CRITICAL ERROR: MONGO_URI is not defined in .env');
    // We don't exit here to allow local dev if needed, but in production it's mandatory
} else {
    mongoose.connect(MONGO_URI)
        .then(() => logger.info('✅ Connected to MongoDB Atlas'))
        .catch(err => logger.error(`❌ MongoDB Connection Error: ${err.message}`));
}

// Schemas & Models
const AdminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    resetTokenHash: String,
    resetTokenExpiry: Date
});

const ConfigSchema = new mongoose.Schema({
    isAcceptingBookings: { type: Boolean, default: true }
});

const BookingSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    guests: String,
    date: String,
    time: String,
    preference: String,
    timestamp: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', AdminSchema);
const Config = mongoose.model('Config', ConfigSchema);
const Booking = mongoose.model('Booking', BookingSchema);

// Database Initialization
const initDB = async () => {
    try {
        const adminCount = await Admin.countDocuments();
        if (adminCount === 0) {
            if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD_HASH) {
                logger.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD_HASH in .env');
                return;
            }
            await Admin.create({
                email: process.env.ADMIN_EMAIL,
                passwordHash: process.env.ADMIN_PASSWORD_HASH
            });
            logger.info('✅ Admin user created');
        }

        const configCount = await Config.countDocuments();
        if (configCount === 0) {
            await Config.create({ isAcceptingBookings: true });
            logger.info('✅ Default config created');
        }
    } catch (err) {
        logger.error(`DB Init Error: ${err.message}`);
    }
};
initDB();

// Rate Limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Strictly 5 requests per 15 mins
    message: { success: false, message: "Too many login attempts, please try again after 15 minutes" }
});

const bookingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // Moderate: 20 requests per 15 mins
    message: { success: false, message: "Booking limit reached. Please try again later." }
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // General API limit
    message: { success: false, message: "Too many requests, please try again later" }
});

app.use('/api/', apiLimiter);

// Password Policy Regex (Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;



// Nodemailer Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify Transporter
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Transporter Error:', error.message);
    } else {
        console.log('✅ Server is ready to take our messages');
    }
});

// Authentication Middleware
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split("")[1];
    if (!token) {
        logger.warn(`Unauthorized access attempt to ${req.originalUrl} from ${req.ip}`);
        return res.status(401).json({ success: false, message: "Access denied. Please login." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const admin = await Admin.findOne({ email: decoded.email });
        if (!admin) throw new Error('Admin not found');
        req.admin = admin;
        next();
    } catch (err) {
        logger.error(`Invalid token attempt from ${req.ip}: ${err.message}`);
        res.status(400).json({ success: false, message: "Invalid session. Please login again." });
    }
};

// Routes

// 1. Admin Login
app.post('/api/admin/login', authLimiter, async (req, res) => {
    let { email, password } = req.body;
    email = email ? email.trim() : '';
    password = password ? password.trim() : '';

    const admin = await Admin.findOne({ email });

    if (!admin) {
        logger.warn(`Failed login attempt (email mismatch) for ${email} from ${req.ip}`);
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!validPassword) {
        logger.warn(`Failed login attempt (password mismatch) for ${email} from ${req.ip}`);
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    logger.info(`Successful login for ${email} from ${req.ip}`);
    const token = jwt.sign({ email: admin.email }, JWT_SECRET, { expiresIn: '2h' });

    // Set JWT as HTTP-only cookie
    res.json({
        success: true,
        token,
        message: "Login successful"
    });
});

// 1.1 Admin Logout
app.post('/api/admin/logout', (req, res) => {
    res.clearCookie('adminToken');
    res.json({ success: true, message: "Logged out successfully" });
});

// 1.5 Admin: Forgot Password
app.post('/api/admin/forgot-password', authLimiter, async (req, res) => {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
        // Return success even if email doesn't exist for security
        return res.json({ success: true, message: "If this email is registered, a reset link will be sent." });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    admin.resetTokenHash = resetTokenHash;
    admin.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 mins
    await admin.save();

    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: admin.email,
        subject: 'Reset Your Admin Password – Cafe Nurani',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 25px; color: #333; background-color: #fdfdfd; border: 1px solid #ddd; border-radius: 12px; max-width: 600px;">
                <h2 style="color: #008080; border-bottom: 2px solid #008080; padding-bottom: 10px;">Password Reset Request</h2>
                <p>Hello Admin,</p>
                <p>You requested to reset your password. Click the link below to set a new password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #008080; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
                </div>
                <p>This link will expire in 15 minutes.</p>
                <p>If you didn't request this, you can safely ignore this email.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Reset link sent to your email" });
    } catch (err) {
        logger.error(`Reset email failed: ${err.message}`);
        res.status(500).json({ success: false, message: "Failed to send reset email" });
    }
});

// 1.6 Admin: Reset Password
app.post('/api/admin/reset-password/:token', authLimiter, async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || !passwordRegex.test(password)) {
        logger.warn(`Failed password reset attempt (weak password) from ${req.ip}`);
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
        });
    }

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const admin = await Admin.findOne({
        resetTokenHash,
        resetTokenExpiry: { $gt: Date.now() }
    });

    if (!admin) {
        logger.warn(`Failed password reset attempt (invalid token) from ${req.ip}`);
        return res.status(400).json({ success: false, message: "Token is invalid or has expired" });
    }

    // Update Password
    admin.passwordHash = await bcrypt.hash(password, 10);
    admin.resetTokenHash = undefined;
    admin.resetTokenExpiry = undefined;
    await admin.save();

    logger.info(`Password reset successfully for ${admin.email} from ${req.ip}`);

    // Optional: Send alert email
    const alertMail = {
        from: process.env.EMAIL_USER,
        to: admin.email,
        subject: 'Password Changed Successfully – Cafe Nurani',
        text: 'Your admin password was changed successfully. If you did not do this, please contact support immediately.'
    };
    transporter.sendMail(alertMail).catch(err => logger.error(`Alert Email Error: ${err.message}`));

    res.json({ success: true, message: "Password updated successfully" });
});

// 2. Public Config (for form state)
app.get('/api/config', async (req, res) => {
    try {
        let config = await Config.findOne();

        if (!config) {
            config = await Config.create({
                isAcceptingBookings: true
            });
        }

        res.json({
            isAcceptingBookings:
                config.isAcceptingBookings
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Config load failed"
        });
    }
});

// 3. Admin: Toggle Booking Status (Protected)
app.post('/api/config/toggle', verifyToken, async (req, res) => {
    const { status } = req.body;
    try {
        let config = await Config.findOne();
        if (!config) config = new Config();
        config.isAcceptingBookings = status;
        await config.save();

        logger.info(`Booking status toggled to ${status ? 'OPEN' : 'CLOSED'} by admin from ${req.ip}`);
        res.json({ success: true, status: config.isAcceptingBookings });
    } catch (err) {
        res.status(500).json({ success: false, message: "Update failed" });
    }
});

// 4. Admin: View Bookings (Protected)
app.get('/api/bookings', verifyToken, async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ timestamp: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// 5. Public: Create Booking
app.post('/api/book',
    bookingLimiter,
    [
        body('name').trim().escape().notEmpty().withMessage('Name is required'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('phone').trim().escape().notEmpty().withMessage('Phone is required'),
        body('guests').trim().escape().notEmpty().withMessage('Number of guests is required'),
        body('date').trim().escape().notEmpty().withMessage('Date is required'),
        body('time').trim().escape().notEmpty().withMessage('Time is required')
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const {
            name,
            email,
            phone,
            guests,
            date,
            time,
            preference
        } = req.body;

        const config = await Config.findOne();

        if (config && !config.isAcceptingBookings) {
            return res.status(403).json({ success: false, message: "Tables are currently full. Please try again later." });
        }

        const newBooking = new Booking({
            name,
            email,
            phone,
            guests,
            date,
            time,
            preference
        });

        await newBooking.save();

        logger.info(`New booking created by ${name} (${email}) for ${date} at ${time}`);
        console.log("Booking saved");

        // 1. Owner Notification Email
        const ownerMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.OWNER_EMAIL || 'gangishettiyashwanth@gmail.com',
            subject: 'New Table Booking – Cafe Nurani',
            html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #008080;">New Table Booking Received</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Guests:</strong> ${guests}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Time:</strong> ${time}</p>
                <p><strong>Seating:</strong> ${preference || 'No Preference'}</p>
                <hr>
                <p style="color: #666;"><strong>Action required:</strong> Please reserve a table accordingly.</p>
                <p style="font-size: 0.8rem; color: #999;">Received on ${newBooking.timestamp}</p>
            </div>
        `
        };

        // 2. Customer Confirmation Email
        const customerMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Table is Booked – Cafe Nurani ☕',
            html: `
            <div style="font-family: Arial, sans-serif; padding: 25px; color: #333; background-color: #fdfdfd; border: 1px solid #ddd; border-radius: 12px; max-width: 600px;">
                <h2 style="color: #008080; border-bottom: 2px solid #008080; padding-bottom: 10px;">Hello ${name},</h2>
                <p style="font-size: 1.1rem;">Your table has been successfully reserved at <strong>Cafe Nurani</strong>.</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #555;">Booking Details:</h3>
                    <p><strong>Date:</strong> ${date}</p>
                    <p><strong>Time:</strong> ${time}</p>
                    <p><strong>Guests:</strong> ${guests}</p>
                </div>

                <p>We look forward to serving you.</p>
                
                <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                    <p style="margin: 5px 0;">📍 <strong>Location:</strong> Himayatnagar, Hyderabad</p>
                    <p style="margin: 5px 0;">⏰ <strong>Open:</strong> 5 AM – 1 AM</p>
                </div>
                
                <p style="font-size: 1.2rem; margin-top: 20px;">See you soon ☕</p>
            </div>
        `
        };

        // Send emails without blocking response
        const sendNotifications = async () => {
            try {
                await transporter.sendMail(ownerMailOptions);
                console.log("Owner email sent");
            } catch (err) {
                console.log("Email failed:", err);
                logger.error(`Owner email failed: ${err.message}`);
            }
            try {
                await transporter.sendMail(customerMailOptions);
                console.log("Customer email sent");
            } catch (err) {
                console.log("Email failed:", err);
                logger.error(`Customer email failed: ${err.message}`);
            }
        };

        // Fire and forget email notifications (runs in background)
        sendNotifications();

        res.json({ success: true, message: "Your table is reserved! Confirmation sent to your email ☕" });
    });

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

    const status = err.status || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Something went wrong. Please try again later.'
        : err.message;

    res.status(status).json({
        success: false,
        message: message
    });
});

app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});
