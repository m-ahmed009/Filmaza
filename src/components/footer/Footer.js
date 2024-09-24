import React from 'react';
import './Footer.css';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <h1><img src="/images/logo.png" alt="Filmaza Logo" className="footer__logo img-fluid" /></h1>
        </div>
        <div className="footer-links">
          <a href="/">POPULAR</a>
          <a href="/top-rated">Top Rated</a>
          <a href="/upcoming">Upcoming</a>
        </div>
        <div className="footer-social">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <FaFacebookF />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <FaTwitter />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <FaInstagram />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            <FaLinkedinIn />
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Filmaza. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
