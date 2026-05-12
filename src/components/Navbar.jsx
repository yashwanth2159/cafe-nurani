import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';

  return (
    <nav className={`navbar ${scrolled || !isHome ? 'glass' : ''}`}>
      <div className="container">
        <Link to="/" className="logo">CAFE NURANI</Link>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><a href="/#experience">Experience</a></li>
          <li><a href="/#menu">Menu</a></li>
          <li><Link to="/book">Reservations</Link></li>
          <li><a href="/#contact">Contact</a></li>
        </ul>
        <Link to="/book" className="btn-primary" style={{ padding: '10px 25px', fontSize: '0.8rem' }}>
          Book a Table
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
