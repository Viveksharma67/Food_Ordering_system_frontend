import { Link } from 'react-router-dom'
import { Instagram, Twitter, Facebook, Mail, Phone, MapPin, Heart } from 'lucide-react'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-glow" />
      <div className="container footer-inner">

        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-logo">
            <span>🌶</span>
            <span className="footer-logo-text">Spice<span className="accent-text">Lane</span></span>
          </div>
          <p className="footer-tagline">
            Freshly cooked vegetarian meals, delivered hot to your doorstep. Every bite tells a story.
          </p>
          <div className="footer-socials">
            <a href="#" className="social-btn" aria-label="Instagram"><Instagram size={16} /></a>
            <a href="#" className="social-btn" aria-label="Twitter"><Twitter size={16} /></a>
            <a href="#" className="social-btn" aria-label="Facebook"><Facebook size={16} /></a>
            <a href="#" className="social-btn" aria-label="Email"><Mail size={16} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4 className="footer-col-title">Quick Links</h4>
          <div className="footer-links">
            <Link to="/" className="footer-link">Home</Link>
            <Link to="/orders" className="footer-link">My Orders</Link>
            <a href="#menu-section" className="footer-link">Menu</a>
            <a href="#" className="footer-link">About Us</a>
          </div>
        </div>

        {/* Categories */}
        <div className="footer-col">
          <h4 className="footer-col-title">Categories</h4>
          <div className="footer-links">
            <a href="#" className="footer-link">Starters</a>
            <a href="#" className="footer-link">Main Course</a>
            <a href="#" className="footer-link">Breads</a>
            <a href="#" className="footer-link">Rice & Biryani</a>
            <a href="#" className="footer-link">Desserts</a>
            <a href="#" className="footer-link">Drinks</a>
          </div>
        </div>

        {/* Contact */}
        <div className="footer-col">
          <h4 className="footer-col-title">Contact Us</h4>
          <div className="footer-contacts">
            <div className="footer-contact-item">
              <Phone size={14} />
              <span>+91 98765 43210</span>
            </div>
            <div className="footer-contact-item">
              <Mail size={14} />
              <span>hello@spicelane.in</span>
            </div>
            <div className="footer-contact-item">
              <MapPin size={14} />
              <span>Indore, Madhya Pradesh</span>
            </div>
          </div>

          {/* Timings */}
          <div className="footer-timings">
            <span className="timing-label">Open Daily</span>
            <span className="timing-val">10:00 AM — 11:00 PM</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="footer-copy">
            © {new Date().getFullYear()} SpiceLane. All rights reserved.
          </p>
          <p className="footer-made">
            Made with <Heart size={12} className="heart-icon" /> in Indore
          </p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}