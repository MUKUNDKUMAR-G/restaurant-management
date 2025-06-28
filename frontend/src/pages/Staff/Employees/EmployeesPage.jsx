import React, { useState, useEffect } from "react";
import { FaEnvelope, FaPhone, FaBuilding, FaBriefcase } from "react-icons/fa";
import "./EmployeesPage.css";
import { http } from "../../../helpers/http.js";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { FaSearch } from "react-icons/fa";

export const EmployeesPage = () => {
  const [expandedEmployee, setExpandedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
    pageSize: 0,
  });
  const [filters, setFilters] = useState({
    query: "",
    branch_id: localStorage.getItem("staff_branch_id"),
    department_id: "",
    page: 1,
    limit: 5,
  });

  const [searchTerm, setSearchTerm] = useState(""); // Thêm trạng thái tìm kiếm

  const fetchEmployees = async () => {
    try {
      const queryParams = new URLSearchParams({
        query: searchTerm || filters.query, // Ưu tiên search term nếu có
        branch_id: filters.branch_id || "",
        department_id: filters.department_id || "",
        page: filters.page.toString(),
        limit: filters.limit.toString(),
      });

      const response = await http(
        `/employee/search?${queryParams.toString()}`,
        "GET"
      );

      const data = response.data;
      console.log(data);
      setEmployees(data.employees || []); // Cập nhật danh sách employees
      setPagination({
        currentPage: data.pagination?.currentPage || 1,
        totalPages: data.pagination?.totalPages || 1,
        hasMore: data.pagination?.hasMore || false,
        pageSize: data.pagination?.pageSize || 0,
      });
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to fetch employees.");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [filters, searchTerm]);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      query: searchTerm,
    }));
  }, [searchTerm]);

  const handleExpandCard = (employeeId) => {
    setExpandedEmployee(expandedEmployee === employeeId ? null : employeeId);
  };

  return (
    <div className="container">
      <h1 className="heading">Employee Directory</h1>
      {/* Search Bar */}
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search by employee id"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input-emp"
        />
        {searchTerm && (
          <button
            className="clear-search"
            onClick={() => {
              setSearchTerm("");
              setFilters((prev) => ({ ...prev, query: "" }));
            }}
            aria-label="Clear Search"
          ></button>
        )}
      </div>
      <div className="grid-content employees-grid-modern">
        {employees.map((employee) => (
          <div
            key={employee.employee_id}
            className="card employee-card-modern"
            role="article"
            aria-label={`Employee card for ${employee.name}`}
          >
            <div className="card-content">
              <div className="employee-header">
                <img
                  src={`https://cdn-icons-png.flaticon.com/512/3789/3789820.png`}
                  alt={employee.name}
                  className="avatar"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1633332755192-727a05c4013d";
                  }}
                />
                <div>
                  <p style={{ color: "black", fontWeight: "bold" }}>
                    ID_Employee: {employee.employee_id}
                  </p>
                  <h2 className="employee-name">{employee.employee_name}</h2>
                  <p className="employee-department">
                    {employee.department_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleExpandCard(employee.employee_id)}
                className="btn-toggle"
                aria-expanded={expandedEmployee === employee.employee_id}
                aria-controls={`details-${employee.employee_id}`}
              >
                {expandedEmployee === employee.employee_id
                  ? "Hide Details"
                  : "View Details"}
              </button>
              {expandedEmployee === employee.employee_id && (
                <div id={`details-${employee.employee_id}`} className="details">
                  <div className="detail-item">
                    <FaBriefcase className="icon" />
                    <span>{employee.department_name}</span>
                  </div>
                  <div className="detail-item">
                    <FaEnvelope className="icon" />
                    <span>{employee.employee_email}</span>
                  </div>
                  <div className="detail-item">
                    <FaPhone className="icon" />
                    <span>{employee.employee_phone_number}</span>
                  </div>
                  <div className="detail-item">
                    <FaBuilding className="icon" />
                    <span>{employee.employee_address}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="pagination">
        <button
          onClick={() =>
            setFilters((prev) => ({
              ...prev,
              page: Math.max(prev.page - 1, 1),
            }))
          }
          disabled={pagination.currentPage === 1}
          className="pagination-button"
          aria-label="Previous page"
        >
          <FiChevronLeft className="pagination-icon" />
        </button>
        <span className="pagination-info">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <button
          onClick={() =>
            setFilters((prev) => ({
              ...prev,
              page: Math.min(prev.page + 1, pagination.totalPages),
            }))
          }
          disabled={pagination.currentPage === pagination.totalPages}
          className="pagination-button"
          aria-label="Next page"
        >
          <FiChevronRight className="pagination-icon" />
        </button>
      </div>
    </div>
  );
};
