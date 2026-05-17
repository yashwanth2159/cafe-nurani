import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Admin() {
  const [isAccepting, setIsAccepting] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const configRes = await fetch(`${API_URL}/config`, {
        credentials: 'include'
      });

      if (configRes.status === 401 || configRes.status === 400) {
        navigate('/nurani-secure-admin');
        return;
      }

      const configData = await configRes.json();
      setIsAccepting(configData.isAcceptingBookings);

      const bookingsRes = await fetch(`${API_URL}/bookings`, {
        credentials: 'include'
      });

      if (bookingsRes.status === 401 || bookingsRes.status === 400) {
        navigate('/nurani-secure-admin');
        return;
      }

      const bookingsData = await bookingsRes.json();

      setBookings(
        Array.isArray(bookingsData)
          ? bookingsData
          : []
      );
    } catch (err) {
      setError("Failed to connect to server");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    try {
      const res = await fetch(`${API_URL}/config/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: !isAccepting })
      });
      const data = await res.json();
      setIsAccepting(data.status);
    } catch (err) {
      alert("Toggle failed");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/admin/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
    navigate('/');
  };

  if (loading) return <div style={{ padding: '100px', textAlign: 'center', color: 'white', background: 'var(--bg-primary)', minHeight: '100vh' }}>Loading Admin Panel...</div>;

  return (
    <div className="admin-page" style={{ paddingTop: '120px', minHeight: '100vh', background: 'var(--bg-primary)', color: 'white', padding: '120px 5%' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '50px' }}>
          <div>
            <h1 style={{ fontSize: '3rem', color: 'var(--accent-gold)', marginBottom: '10px' }}>Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage your table availability and view recent reservations.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ marginBottom: '5px', fontSize: '0.8rem', opacity: 0.7 }}>STATUS</div>
              <div style={{ fontWeight: 700, color: isAccepting ? '#00C851' : '#ff4444' }}>
                {isAccepting ? '● ACCEPTING BOOKINGS' : '● TABLES FULL'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleToggle}
                style={{
                  background: isAccepting ? 'rgba(255, 68, 68, 0.1)' : 'rgba(0, 200, 81, 0.1)',
                  color: isAccepting ? '#ff4444' : '#00C851',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  border: `1px solid ${isAccepting ? '#ff4444' : '#00C851'}`,
                  cursor: 'pointer'
                }}
              >
                {isAccepting ? 'Mark as Full' : 'Open Bookings'}
              </button>
              <button
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {error && <div style={{ color: '#ff4444', marginBottom: '20px' }}>{error}</div>}

        <div className="bookings-table" style={{ background: 'var(--bg-secondary)', borderRadius: '24px', padding: '40px', border: '1px solid var(--border-subtle)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '1.8rem' }}>Recent Reservations</h2>
            <span style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--accent-gold)', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem' }}>
              Total: {bookings.length}
            </span>
          </div>

          {bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📋</div>
              <p>No reservations found yet.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '20px' }}>Date & Time</th>
                    <th style={{ padding: '20px' }}>Customer Details</th>
                    <th style={{ padding: '20px' }}>Guests</th>
                    <th style={{ padding: '20px' }}>Seating</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(bookings) &&
                    bookings.map((booking) => (
                      <tr key={booking.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.3s ease' }} className="table-row-hover">
                        <td style={{ padding: '20px' }}>
                          <div style={{ fontWeight: 600 }}>{booking.date}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--accent-gold)' }}>{booking.time}</div>
                        </td>
                        <td style={{ padding: '20px' }}>
                          <div style={{ fontWeight: 600 }}>{booking.name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{booking.phone}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.8 }}>{booking.email}</div>
                        </td>
                        <td style={{ padding: '20px' }}>
                          <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '4px' }}>{booking.guests}</span>
                        </td>
                        <td style={{ padding: '20px' }}>
                          <span style={{ fontSize: '0.9rem' }}>{booking.preference}</span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;

