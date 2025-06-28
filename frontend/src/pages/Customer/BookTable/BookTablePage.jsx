import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiClock,
  FiUser,
  FiPhone,
  FiCalendar,
  FiMessageSquare,
  FiMapPin,
  FiInfo,
} from "react-icons/fi";
import { BsCheckCircle, BsClock, BsPeople, BsTelephone } from "react-icons/bs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import "./BookTable.css";

export const BookTablePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    guests: "",
    date: new Date(),
    time: new Date(),
    specialRequests: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const restaurantImages = [
    "images.unsplash.com/photo-1517248135467-4c7edcad34c4",
    "images.unsplash.com/photo-1414235077428-338989a2e8c0",
    "images.unsplash.com/photo-1559339352-11d035aa65de",
  ];

  useEffect(() => {
    const branchId = localStorage.getItem("selectedBranchId");
    if (branchId) {
      fetchBranchDetails(branchId);
    }
  }, []);

  const fetchBranchDetails = async (branchId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/branch/${branchId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch branch details");
      }
      
      const data = await response.json();
      setSelectedBranch(data);
    } catch (error) {
      console.error("Error fetching branch details:", error);
      toast.error("Failed to load branch details. Please try again later.");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.guests) newErrors.guests = "Number of guests is required";
    if (!formData.time) newErrors.time = "Time is required";
    if (!formData.date) newErrors.date = "Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const branchId = localStorage.getItem("selectedBranchId");
      if (!branchId) {
        throw new Error("No selected branch ID found. Please select a branch first.");
      }
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/reservation/${branchId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          cus_name: formData.name,
          phone_number: formData.phone,
          guests_number: parseInt(formData.guests, 10),
          arrival_time: formData.time.toTimeString().split(" ")[0],
          arrival_date: formData.date.toISOString().split("T")[0],
          notes: formData.specialRequests,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create reservation");
      }

      setIsSuccess(true);
      toast.success("Reservation created successfully!");
    } catch (error) {
      console.error("Error creating reservation:", error);
      toast.error(error.message || "Failed to create reservation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  if (isSuccess) {
    return (
      <div className="booking-container">
        <div className="success-message">
          <BsCheckCircle className="success-icon" />
          <h2>Reservation Confirmed!</h2>
          <p>Thank you for choosing our restaurant. We look forward to serving you.</p>
          <button 
            className="new-reservation-btn"
            onClick={() => {
              setIsSuccess(false);
              setFormData({
                name: "",
                phone: "",
                date: new Date(),
                time: new Date(),
                guests: "",
                specialRequests: ""
              });
            }}
          >
            Make Another Reservation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-container">
      <div className="booking-hero">
        <h1>Book a Table</h1>
        <p>Reserve your perfect dining experience</p>
      </div>

      <div className="booking-grid">
        <div className="booking-main">
          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-section">
              <h2>Personal Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">
                    <FiUser className="label-icon" />
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={`input-field ${errors.name ? "error-border" : ""}`}
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                  />
                  {errors.name && <p className="error-message">{errors.name}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">
                    <BsTelephone className="label-icon" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className={`input-field ${errors.phone ? "error-border" : ""}`}
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && <p className="error-message">{errors.phone}</p>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Reservation Details</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="date">
                    <FiCalendar className="label-icon" />
                    Date
                  </label>
                  <DatePicker
                    selected={formData.date}
                    onChange={(date) => {
                      setFormData({ ...formData, date });
                      if (errors.date) {
                        setErrors({ ...errors, date: "" });
                      }
                    }}
                    className={`input-field ${errors.date ? "error-border" : ""}`}
                    minDate={new Date()}
                    dateFormat="MMMM d, yyyy"
                  />
                  {errors.date && <p className="error-message">{errors.date}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="time">
                    <FiClock className="label-icon" />
                    Time
                  </label>
                  <DatePicker
                    selected={formData.time}
                    onChange={(time) => {
                      setFormData({ ...formData, time });
                      if (errors.time) {
                        setErrors({ ...errors, time: "" });
                      }
                    }}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className={`input-field ${errors.time ? "error-border" : ""}`}
                  />
                  {errors.time && <p className="error-message">{errors.time}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="guests">
                    <BsPeople className="label-icon" />
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    id="guests"
                    name="guests"
                    className={`input-field ${errors.guests ? "error-border" : ""}`}
                    value={formData.guests}
                    onChange={handleInputChange}
                    placeholder="Enter number of guests"
                    min="1"
                    max="20"
                  />
                  {errors.guests && <p className="error-message">{errors.guests}</p>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Additional Information</h2>
              <div className="form-group">
                <label htmlFor="special-requests">
                  <FiMessageSquare className="label-icon" />
                  Special Requests
                </label>
                <textarea
                  id="special-requests"
                  name="specialRequests"
                  className="input-field"
                  rows="4"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  placeholder="Any special requests or dietary requirements?"
                ></textarea>
              </div>
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Book Table"}
            </button>
          </form>
        </div>

        <div className="booking-sidebar">
          {selectedBranch && (
            <div className="branch-info">
              <h3>{selectedBranch.branch_name}</h3>
              <div className="info-item">
                <FiMapPin />
                <span>{selectedBranch.address}</span>
              </div>
              <div className="info-item">
                <BsTelephone />
                <span>{selectedBranch.phone}</span>
              </div>
              <div className="info-item">
                <BsClock />
                <span>{selectedBranch.open_time} - {selectedBranch.close_time}</span>
              </div>
            </div>
          )}

          <div className="policies">
            <h3>
              <FiInfo className="policy-icon" />
              Reservation Policies
            </h3>
            <ul>
              <li>Please arrive 15 minutes before your reservation time</li>
              <li>Cancellations must be made at least 2 hours in advance</li>
              <li>Tables are held for 15 minutes after the reservation time</li>
              <li>Maximum party size is 20 people</li>
            </ul>
          </div>

          <div className="gallery">
            {restaurantImages.map((image, index) => (
              <img
                key={index}
                src={`https://${image}`}
                alt={`Restaurant ambiance ${index + 1}`}
                className="gallery-image"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
