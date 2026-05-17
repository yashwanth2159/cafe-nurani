import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Required to send/receive cookies
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem(
          'adminToken',
          data.token
        );
      }

      if (data.success) {
        // Token is now stored in an HTTP-only cookie by the server
        navigate('/admin-dashboard');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection failed. Please check your internet.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '20px'
    }}>
      <div className="login-card" style={{
        width: '100%',
        maxWidth: '400px',
        background: 'var(--bg-secondary)',
        padding: '40px',
        borderRadius: '24px',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--accent-gold)', marginBottom: '10px' }}>Admin Login</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Staff Access Only</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255, 68, 68, 0.1)',
            color: '#ff4444',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.9rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 68, 68, 0.2)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ color: 'var(--accent-gold)', display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@cafenurani.com"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white'
              }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label style={{ color: 'var(--accent-gold)', display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              background: 'var(--accent-gold)',
              color: 'var(--bg-primary)',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.3s ease',
              marginBottom: '15px'
            }}
          >
            {isLoading ? 'Authenticating...' : 'Login to Dashboard'}
          </button>
          <div style={{ textAlign: 'center' }}>
            <Link to="/admin-forgot-password" style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', textDecoration: 'none', opacity: 0.8 }}>Forgot Password?</Link>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <a href="/" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textDecoration: 'none' }}>← Return to Homepage</a>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
