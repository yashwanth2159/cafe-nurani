import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<Booking />} />
          <Route path="/nurani-secure-admin" element={<AdminLogin />} />
          <Route path="/admin-forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/admin-dashboard" element={<Admin />} />
        </Routes>

        {/* Footer (Shared across pages) */}
        <footer className="footer">
          <div className="container">
            <span className="logo footer-logo">CAFE NURANI</span>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 30px' }}>
              Elevating your late-night coffee experience with premium beans and a sanctuary for the soul.
            </p>
            <div className="nav-links" style={{ justifyContent: 'center', marginBottom: '30px' }}>
              <a href="#">Instagram</a>
              <a href="#">Twitter</a>
              <a href="#">Facebook</a>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <a href="/nurani-secure-admin" style={{ fontSize: '0.7rem', color: '#333', textDecoration: 'none', opacity: 0.5 }}>Staff Access</a>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#555' }}>&copy; 2026 Cafe Nurani. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
