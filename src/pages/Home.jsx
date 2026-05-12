import React from 'react';
import heroImg from '../assets/hero-premium.png';
import coffeeImg from '../assets/signature-coffee.png';

function Home() {
  return (
    <>
      {/* Hero Section */}
      <header id="home" className="hero" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="hero-content">
          <span className="subtitle" style={{ color: 'var(--accent-gold)', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Authentic Taste & Atmosphere</span>
          <h1>Your Midnight Sanctuary</h1>
          <p>Experience the finest artisan coffee and gourmet delicacies in the heart of the neighborhood, open late for your comfort.</p>
          <div className="hero-btns">
            <a href="/book" className="btn-primary">Reserve a Table</a>
            <a href="#menu" className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', marginLeft: '15px' }}>Explore Menu</a>
          </div>
        </div>
      </header>

      {/* Experience Section */}
      <section id="experience" className="section container">
        <div className="experience-grid">
          <div className="experience-image">
            <img src={coffeeImg} alt="Signature Coffee" />
          </div>
          <div className="experience-text">
            <span className="subtitle">The Craft</span>
            <h3>More Than Just Coffee</h3>
            <p>At Cafe Nurani, we believe in the art of slow living. Our beans are ethically sourced and roasted to perfection, ensuring every cup tells a story of heritage and passion.</p>
            <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Whether it's a late-night study session or a quiet conversation with friends, our warm ambiance provides the perfect backdrop for your moments.</p>
          </div>
        </div>
      </section>

      {/* Signature Menu Preview */}
      <section id="menu" className="section container" style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)', padding: '60px 40px' }}>
        <div className="section-title">
          <span className="subtitle">Curated Selection</span>
          <h2>Signature Menu</h2>
        </div>
        <div className="menu-grid">
          <div className="menu-item glass">
            <h4>Veg Puff <span className="price">-Rs.20</span></h4>
            <p>Our signature dark roast with charcoal-infused milk and gold flakes.</p>
          </div>
          <div className="menu-item glass">
            <h4>Single Tea <span className="price">-RS.30</span></h4>
            <p>A delicate blend of premium saffron and aromatic herbs.</p>
          </div>
          <div className="menu-item glass">
            <h4>Fine Biscuits <span className="price">-Rs.25</span></h4>
            <p>Flaky, buttery pastry served with house-made honey butter.</p>
          </div>
          <div className="menu-item glass">
            <h4>Nurani Special <span className="price">-Rs.50</span></h4>
            <p>A secret blend of middle-eastern spices and smooth espresso.</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)' }}>View Full Menu</button>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section container">
        <div className="section-title">
          <span className="subtitle">Find Us</span>
          <h2>Visit Cafe Nurani</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div className="glass" style={{ padding: '40px', borderRadius: 'var(--border-radius)' }}>
            <h3>Hours</h3>
            <ul style={{ marginTop: '20px' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Mon - Thu</span>
                <span>4:00 PM - 12:00 AM</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--accent-gold)' }}>
                <span>Fri - Sat</span>
                <span>4:00 PM - 2:00 AM</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Sunday</span>
                <span>10:00 AM - 10:00 PM</span>
              </li>
            </ul>
          </div>
          <div className="glass" style={{ padding: '40px', borderRadius: 'var(--border-radius)' }}>
            <h3>Location</h3>
            <p style={{ marginTop: '20px' }}>opposite to California Burrito,<br />old MLA Quarters, Vittalwadii,<br /> Himayatnagar, Hyderabad</p>
            <p style={{ marginTop: '10px', color: 'var(--accent-gold)' }}>hello@cafenurani.com</p>
            <p>+72 7207131197</p>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
