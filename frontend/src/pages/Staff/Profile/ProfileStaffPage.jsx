import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaBriefcase,
  FaDollarSign,
  FaCalendarAlt,
  FaUsers,
  FaEdit,
} from "react-icons/fa";
import "./ProfileStaffPage.css";
import { http } from "../../../helpers/http";
import { toast } from "react-toastify";

export const ProfileStaffPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    photo: null,
    name: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    address: "",
    salary: "",
    department: "",
    branch: "",
  });

  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(
    "https://cdn-icons-png.flaticon.com/512/3789/3789820.png"
  );

  const departments = [
    "Engineering",
    "Marketing",
    "Sales",
    "Human Resources",
    "Finance",
    "Operations",
  ];

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      const response = await http("/employee/profile", "GET");
      const data = response.data;
      if (!data) {
        toast.error("No employee data found. Please contact admin.");
        return;
      }
      const formattedDate = new Date(data.date_of_birth).toLocaleDateString(
        "en-GB"
      );
      setFormData({
        photo: null,
        name: data.employee_name,
        dateOfBirth: formattedDate,
        gender: data.gender,
        phone: data.employee_phone_number,
        address: data.employee_address,
        salary: data.salary !== null && data.salary !== undefined ? data.salary : 'N/A',
        department: data.department_name || 'N/A',
        branch: data.current_branch_name || 'N/A',
      });

      if (data.photo) {
        setPreview(data.photo);
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
      toast.error("Failed to fetch employee data");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const updateData = {
        employee_name: formData.name,
        employee_phone_number: formData.phone,
        employee_address: formData.address,
      };

      await http(`/employee/${formData.employee_id}`, "PATCH", updateData);
      toast.success("Profile updated successfully");
      setIsEditing(false);
      fetchEmployeeData(); // Refresh data after update
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const renderField = (label, name, value, icon, type = "text") => {
    return (
      <div className="field-container">
        <div className="field-icon">{icon}</div>
        <div className="field-label">{label}:</div>
        {isEditing ? (
          <div className="field-input-container">
            {type === "select" ? (
              <select
                name={name}
                value={value}
                onChange={handleInputChange}
                className={`field-input ${errors[name] ? "input-error" : ""}`}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <input
                type={type}
                name={name}
                value={value}
                onChange={handleInputChange}
                className={`field-input ${errors[name] ? "input-error" : ""}`}
                readOnly={!isEditing}
              />
            )}
            {errors[name] && <div className="error-message">{errors[name]}</div>}
          </div>
        ) : (
        <div className="field-value">{value || 'N/A'}</div>
        )}
      </div>
    );
  };

  return (
    <div className="employee-form-container">
      <div className="employee-form-box">
        <div className="form-header">
          <h2 className="form-title">Employee Information</h2>
          <button
            className={`edit-button ${isEditing ? "save-button" : ""}`}
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
          >
            {isEditing ? "Save" : "Edit"}
          </button>
        </div>

        <div className="employee-details">
          <div className="employee-photo-edit">
            <img src={preview} alt="Employee" className="employee-photo" />
          </div>
          {renderField(
            "Name",
            "name",
            formData.name,
            <FaUser className="field-icon-style" />
          )}
          {renderField(
            "Date of Birth",
            "dateOfBirth",
            formData.dateOfBirth,
            <FaCalendarAlt className="field-icon-style" />
          )}
          {renderField(
            "Gender",
            "gender",
            formData.gender,
            <FaUsers className="field-icon-style" />,
            "select"
          )}
          {renderField(
            "Phone",
            "phone",
            formData.phone,
            <FaPhone className="field-icon-style" />
          )}
          {renderField(
            "Address",
            "address",
            formData.address,
            <FaMapMarkerAlt className="field-icon-style" />
          )}
          {renderField(
            "Salary",
            "salary",
            `₹${formData.salary}`,
            <FaDollarSign className="field-icon-style" />
          )}
          {renderField(
            "Department",
            "department",
            formData.department,
            <FaBriefcase className="field-icon-style" />
          )}
          {renderField(
            "Branch",
            "branch",
            formData.branch,
            <FaMapMarkerAlt className="field-icon-style" />
          )}
        </div>
      </div>
    </div>
  );
};
