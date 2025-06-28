import React, { useEffect, useState, useContext } from "react";
import { RxAvatar } from "react-icons/rx";
import {
  FaShoppingCart,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";
import "./MainLayout.css";
import { Link, useLocation } from "react-router-dom";
import { CartContext } from "../../component/CardContext/CardContext";

export const MainLayout = ({ children, title }) => {
  const location = useLocation();
  const { clearCart } = useContext(CartContext);
  const [isAuthen, setIsAuthen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthen(!!token);
  }, []);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.length);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    clearCart();
    localStorage.removeItem("selectedBranchId");
    setIsAuthen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="container">
      <header>
        <div className="logo-main">
          <Link to="/">
            <img
              src="..//public/logo.png"
              alt="SushiX"
            />
          </Link>
        </div>
        <div className="nav-bar">
          <Link to="/" className={isActive("/") ? "active" : ""}>
            Home
          </Link>
          <Link to="/menu" className={isActive("/menu") ? "active" : ""}>
            Menu
          </Link>
          <Link to="/booktable" className={isActive("/booktable") ? "active" : ""}>
            Book Table
          </Link>
          <Link to="/contact" className={isActive("/contact") ? "active" : ""}>
            Contact Us
          </Link>
        </div>
        <div className="handle-user">
          <div className="avatar-container">
            <div className="avatar-user">
              <RxAvatar />
            </div>
            {isAuthen ? (
              <ul className="option-user">
                <li>
                  <Link to="/profile">Profile</Link>
                </li>
                <li>
                  <Link to="/activity-history">Activity History</Link>
                </li>
                <li>
                  <Link to="/login" onClick={handleLogout}>
                    Log Out
                  </Link>
                </li>
              </ul>
            ) : (
              <ul className="option-user">
                <li>
                  <Link to="/login">Log In</Link>
                </li>
                <li>
                  <Link to="/login?tab=register">Register</Link>
                </li>
              </ul>
            )}
          </div>
          <div className="cart-icon">
            <Link to="/cart">
              <FaShoppingCart />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </header>
      <div className="content-main">{children}</div>
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>About Us</h3>
            <p>
              Welcome to SushiX! We provide the best dining experience
              with delicious food and excellent service. Our restaurant offers a
              perfect blend of traditional and modern cuisine in a warm and
              inviting atmosphere.
            </p>
          </div>
          <div className="footer-section">
            <h3>Contact Info</h3>
            <p>
              <FaPhone /> +91 123 456 7890
            </p>
            <p>
              <FaEnvelope /> info@SushiX.com
            </p>
            <p>
              <FaMapMarkerAlt /> Connaught Place, New Delhi
            </p>
            <p>
              <FaClock /> Mon-Sun: 11:00 AM - 11:00 PM
            </p>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/menu">Our Menu</Link></li>
              <li><Link to="/booktable">Reservations</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/profile">My Account</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Follow Us</h3>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <FaFacebook />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <FaTwitter />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>Made with 🖥 and ❤ by Vidya Shree</p>
        </div>
      </footer>
    </div>
  );
};
