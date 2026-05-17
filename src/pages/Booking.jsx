import React, { useState, useEffect } from 'react';
import bookingBg from '../assets/booking-bg.png';

function Booking() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAccepting, setIsAccepting] = useState(true);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guests: '1',
    date: '',
    time: '4:00 PM',
    preference: 'No Preference'
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  console.log(API_URL);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${API_URL}/config`);
        const data = await res.json();
        setIsAccepting(data.isAcceptingBookings);
      } catch (err) {
        console.error("Failed to fetch config:", err);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchConfig();
  }, []);

  const handleBooking = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Booking failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="booking-page" style={{ paddingTop: '120px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="booking-header" style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span className="subtitle" style={{ color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 600 }}>Reserve Your Table</span>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '20px' }}>Book Your Table</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Skip the wait. Reserve your spot at Cafe Nurani and enjoy your artisan coffee and delicacies in comfort.
          </p>
        </div>

        <div className="booking-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px', background: 'var(--bg-secondary)', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
          <div className="booking-visual" style={{ backgroundImage: `url(${bookingBg})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '400px' }}>
            <div style={{ height: '100%', width: '100%', background: 'linear-gradient(to right, rgba(0, 43, 43, 0.4), transparent)' }}></div>
          </div>

          <div className="booking-form-container" style={{ padding: '40px', position: 'relative' }}>
            {loadingConfig ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--accent-gold)' }}>Checking table availability...</p>
              </div>
            ) : !isAccepting ? (
              <div className="full-message" style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🚫</div>
                <h3 style={{ fontSize: '2rem', marginBottom: '15px' }}>Tables are Full</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Sorry, tables are currently full. Please visit us directly or try again later.
                </p>
                <a href="/" className="btn-primary" style={{ marginTop: '30px', display: 'inline-block' }}>Return Home</a>
              </div>
            ) : isSuccess ? (
              <div className="success-overlay" style={{ background: 'var(--bg-secondary)', padding: '40px', textAlign: 'center' }}>
                <div className="success-icon" style={{ fontSize: '4rem', marginBottom: '20px' }}>☕</div>
                <h3 style={{ fontSize: '2rem', marginBottom: '15px' }}>Reservation Confirmed!</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Your table is reserved! Confirmation sent to your email ☕
                </p>
                <button onClick={() => setIsSuccess(false)} className="btn-primary" style={{ marginTop: '30px' }}>Book Another</button>
              </div>
            ) : (
              <form onSubmit={handleBooking}>
                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label style={{ color: 'var(--accent-gold)' }}>Full Name</label>
                    <input name="name" type="text" placeholder="Your Name" value={formData.name} onChange={handleChange} required style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ color: 'var(--accent-gold)' }}>Email Address</label>
                    <input name="email" type="email" placeholder="your@email.com" value={formData.email} onChange={handleChange} required style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ color: 'var(--accent-gold)' }}>Phone Number</label>
                    <input name="phone" type="tel" placeholder="Your Phone" value={formData.phone} onChange={handleChange} required style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                      <label style={{ color: 'var(--accent-gold)' }}>Guests</label>
                      <select name="guests" value={formData.guests} onChange={handleChange} style={{ background: 'rgba(255,255,255,0.05)', color: 'black', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <option value="1">1 Guest</option>
                        <option value="2">2 Guests</option>
                        <option value="3">3 Guests</option>
                        <option value="4">4 Guests</option>
                        <option value="5+">5+ Guests</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label style={{ color: 'var(--accent-gold)' }}>Date</label>
                      <input name="date" type="date" value={formData.date} onChange={handleChange} required style={{ background: 'rgba(255,255,255,0.05)', color: 'black', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label style={{ color: 'var(--accent-gold)' }}>Time Slot</label>
                    <select name="time" value={formData.time} onChange={handleChange} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <option>4:00 PM</option>
                      <option>6:00 PM</option>
                      <option>8:00 PM</option>
                      <option>10:00 PM</option>
                      <option>11:00 PM</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn-book" disabled={isSubmitting} style={{ marginTop: '30px' }}>
                  {isSubmitting ? 'Reserving...' : 'Book My Table'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Takes 1-3 seconds. Instant confirmation.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px', paddingBottom: '60px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Walk-ins are always welcome, but we recommend booking during peak hours (8 PM - 11 PM).</p>
        </div>
      </div>
    </div>
  );
}

export default Booking;
