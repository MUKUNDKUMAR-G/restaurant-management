import React, { useState, useEffect } from "react";
import {
  FaPhone,
  FaEnvelope,
  FaClock,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { GoLocation } from "react-icons/go";
import { IoSend } from "react-icons/io5";
import "./ContactPage.css";
import { http } from "../../../helpers/http";
import { toast } from 'react-toastify';

export const ContactPage = () => {
  const [contactInfo, setContactInfo] = useState({
    address: "",
    phone: "",
    email: "",
    workingHours: [],
    socialMedia: [
      {
        platform: "Facebook",
        icon: <FaFacebookF />,
        link: "https://facebook.com",
      },
      { platform: "Twitter", icon: <FaTwitter />, link: "https://twitter.com" },
      {
        platform: "Instagram",
        icon: <FaInstagram />,
        link: "https://instagram.com",
      },
    ],
    parkingInfo: {
      motorbike: "",
      car: "",
    },
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    getContactInfo();
  }, []);

  const getContactInfo = async () => {
    try {
      const branchId = localStorage.getItem("selectedBranchId");
      console.log("Fetching contact info for branchId:", branchId);
      if (!branchId) {
        toast.error("Please select a branch to view contact information.");
        return;
      }
      const response = await http(`/branch/${branchId}`, "GET");
      const data = response.data;
      setContactInfo({
        address: data.address,
        phone: data.phone_number,
        email: `${data.branch_name}@gmail.com`,
        workingHours: [
          {
            hours: `${formatTime(data.open_time)} - ${formatTime(
              data.close_time
            )}`,
          },
        ],
        socialMedia: [
          {
            platform: "Facebook",
            icon: <FaFacebookF />,
            link: "https://facebook.com",
          },
          {
            platform: "Twitter",
            icon: <FaTwitter />,
            link: "https://twitter.com",
          },
          {
            platform: "Instagram",
            icon: <FaInstagram />,
            link: "https://instagram.com",
          },
        ],
        parkingInfo: {
          motorbike: data.has_motorbike_park ? "Available" : "Not available",
          car: data.has_car_park ? "Available" : "Not available",
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch contact information.");
    }
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(hours, minutes);

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Add form submission logic here
    // For now, just log the data and show a toast
    console.log("Form submitted:", formData);
    toast.success("Your message has been sent!");
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
  };

  return (
    <div className="contact-page-container">
      <div className="contact-hero">
        <h1>Get in Touch</h1>
        <p>We'd love to hear from you. Reach out to us for any inquiries or feedback.</p>
      </div>

      <div className="contact-content">
        <div className="contact-info-section">
          <h2>Our Contact Details</h2>
          <div className="info-grid">
            <div className="info-card">
              <FaMapMarkerAlt className="card-icon" />
              <h3>Address</h3>
              <p>{contactInfo.address || "N/A"}</p>
            </div>
            <div className="info-card">
              <FaPhone className="card-icon" />
              <h3>Phone</h3>
              <a href={`tel:${contactInfo.phone}`}>{contactInfo.phone || "N/A"}</a>
            </div>
            <div className="info-card">
              <FaEnvelope className="card-icon" />
              <h3>Email</h3>
              <a href={`mailto:${contactInfo.email}`}>{contactInfo.email || "N/A"}</a>
            </div>
            <div className="info-card">
              <FaClock className="card-icon" />
              <h3>Working Hours</h3>
              {contactInfo.workingHours.length > 0 ? (
                contactInfo.workingHours.map((schedule, index) => (
                  <p key={index}>{schedule.hours}</p>
                ))
              ) : (
                <p>N/A</p>
              )}
            </div>
          </div>

          <div className="parking-info">
            <h3>Parking Information</h3>
            <p><strong>Motorbike:</strong> {contactInfo.parkingInfo.motorbike || "N/A"}</p>
            <p><strong>Car:</strong> {contactInfo.parkingInfo.car || "N/A"}</p>
          </div>

          <div className="social-media-section">
            <h3>Follow Us</h3>
            <div className="social-icons-contact">
              {contactInfo.socialMedia.map((social, index) => (
                <a
                  key={index}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit our ${social.platform} page`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="contact-form-section">
          <h2>Send Us a Message</h2>
          <form className="contact-form" onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Your Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleFormChange}
                rows="5"
                required
              ></textarea>
            </div>
            <button type="submit" className="submit-button">
              Send Message <IoSend className="send-icon" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
