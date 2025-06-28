import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FiClock, FiUser, FiPhone, FiCalendar, FiMessageSquare } from 'react-icons/fi';
import { BsCheckCircle, BsClock, BsPeople, BsTelephone } from 'react-icons/bs';
import './CreateSlip.css';

export const CreateSlipPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: new Date(),
    time: new Date(),
    guests: '',
    specialRequests: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.guests) newErrors.guests = 'Number of guests is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.date) newErrors.date = 'Date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const branchId = localStorage.getItem('staff_branch');
      const response = await fetch(`http://localhost:3000/api/reservation/branch/${branchId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cus_name: formData.name,
          phone_number: formData.phone,
          guests_number: formData.guests,
          arrival_time: formData.time.toTimeString().split(' ')[0],
          arrival_date: formData.date.toISOString().split('T')[0],
          notes: formData.specialRequests
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create reservation');
      }

      setIsSuccess(true);
      toast.success('Reservation created successfully!');
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error('Failed to create reservation. Please try again.');
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
        [name]: ''
      }));
    }
  };

  if (isSuccess) {
    return (
      <div className="create-slip-container">
        <div className="success-message">
          <BsCheckCircle className="success-icon" />
          <h2>Reservation Created!</h2>
          <p>Thank you for creating the reservation.</p>
          <button 
            className="new-reservation-btn"
            onClick={() => {
              setIsSuccess(false);
              setFormData({
                name: '',
                phone: '',
                date: new Date(),
                time: new Date(),
                guests: '',
                specialRequests: ''
              });
            }}
          >
            Create Another Reservation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-slip-container">
      <div className="create-slip-hero">
        <h1>Create Reservation</h1>
        <p>Create a new reservation for a customer</p>
      </div>

      <div className="create-slip-main">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Customer Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>
                  <FiUser className="label-icon" />
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`input-field ${errors.name ? 'error-border' : ''}`}
                  placeholder="Enter customer name"
                />
                {errors.name && <div className="error-message">{errors.name}</div>}
              </div>

              <div className="form-group">
                <label>
                  <FiPhone className="label-icon" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`input-field ${errors.phone ? 'error-border' : ''}`}
                  placeholder="Enter phone number"
                />
                {errors.phone && <div className="error-message">{errors.phone}</div>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Reservation Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>
                  <FiCalendar className="label-icon" />
                  Date
                </label>
                <DatePicker
                  selected={formData.date}
                  onChange={(date) => {
                    setFormData(prev => ({ ...prev, date }));
                    if (errors.date) {
                      setErrors(prev => ({ ...prev, date: '' }));
                    }
                  }}
                  minDate={new Date()}
                  className={`input-field ${errors.date ? 'error-border' : ''}`}
                  dateFormat="MMMM d, yyyy"
                />
                {errors.date && <div className="error-message">{errors.date}</div>}
              </div>

              <div className="form-group">
                <label>
                  <FiClock className="label-icon" />
                  Time
                </label>
                <DatePicker
                  selected={formData.time}
                  onChange={(time) => {
                    setFormData(prev => ({ ...prev, time }));
                    if (errors.time) {
                      setErrors(prev => ({ ...prev, time: '' }));
                    }
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  className={`input-field ${errors.time ? 'error-border' : ''}`}
                />
                {errors.time && <div className="error-message">{errors.time}</div>}
              </div>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Create Reservation'}
          </button>
        </form>
      </div>
    </div>
  );
};