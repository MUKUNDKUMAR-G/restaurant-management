import React, { useState, useEffect } from "react";
import {
  FiTrash2,
  FiPlus,
  FiX,
  FiEdit,
  FiFilter,
  // FiSort,
} from "react-icons/fi";
import { FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import "./ManagementEmployeePage.css"; // Import the external CSS file
import { http } from "../../../helpers/http.js";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const ManagementEmployeePage = () => {
  const [selectedBranch, setSelectedBranch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailedEmployee, setDetailedEmployee] = useState(null);
  // 123
  const [formData, setFormData] = useState({
    branchName: "",
    name: "",
    department: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    hire_date: "",
    quit_date: "",
    date_of_birth: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const [filterOptions, setFilterOptions] = useState({
    branchName: "",
    position: "",
  });

  const [isFilterApplied, setIsFilterApplied] = useState(false);

  const [searchTerm, setSearchTerm] = useState(""); // Thêm trạng thái tìm kiếm

  const [currentPage, setCurrentPage] = useState(1);

  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
    pageSize: 0,
  });
  const [filters, setFilters] = useState({
    query: "",
    branch_id: "",
    department_id: "",
    page: 1,
    limit: 5,
  });

    const fetchBranchesAndDepartments = async () => {
      try {
        const fetchBranch = await http(`/branch`, "GET");
        const fetchDepartment = await http(`/department`, "GET");

        const branchData = fetchBranch.data;
        const departmentData = fetchDepartment.data;

        setBranches(branchData);
        setDepartments(departmentData);
      } catch (error) {
        console.error("Error fetching branch/department data:", error);
      }
    };

  useEffect(() => {
    fetchBranchesAndDepartments();
  }, []);

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
      query: searchTerm, // Gán giá trị search term vào query
    }));
  }, [searchTerm]);

  const [displayEmployees, setDisplayEmployees] = useState([]);

  useEffect(() => {
    setDisplayEmployees(employees);
  }, [employees]);

  const applyFilter = () => {
    const branch = branches.find(
      (b) => b.branch_name === filterOptions.branchName
    );
    const department = departments.find(
      (d) => d.department_name === filterOptions.position
    );

    setFilters((prev) => ({
      ...prev,
      branch_id: branch?.branch_id || "",
      department_id: department?.department_id || "",
      query: searchTerm, // Gán giá trị tìm kiếm hiện tại
      page: 1, // Reset trang
    }));
    setIsFilterApplied(true);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const validateForm = () => {
    const errors = {};

    // Common validations for both Add and Edit
    if (!formData.name || !formData.name.trim()) errors.name = "Name is required";

    if (!formData.email || !formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (!formData.phone || !formData.phone.trim()) {
      errors.phone = "Phone is required";
    } else if (!/^(0\d{9})$/.test(formData.phone)) {
      errors.phone =
        "Invalid phone format (should be 10 digits starting with 0)";
    }

    if (!formData.address || !formData.address.trim()) errors.address = "Address is required";

    if (!formData.gender) errors.gender = "Gender is required";

    if (!formData.date_of_birth)
      errors.date_of_birth = "Date of birth is required";

    if (!formData.branchName) errors.branchName = "Branch is required";
    if (!formData.department) errors.department = "Department is required";

    // Specific Validation for Update - This logic seems overly complex and might be simplified
    // For now, I'm just focusing on the .trim() error, but this section might need re-evaluation
    if (selectedEmployee) {
      const isBranchEmpty = !formData.branchName || !formData.branchName.trim();
      const isDepartmentEmpty = !formData.department || !formData.department.trim(); // Changed from position

      const isBranchUpdated =
        formData.branchName !== selectedEmployee.branchName;
      const isDepartmentUpdated = formData.department !== selectedEmployee.department; // Changed from position

      if (
        !(
          (isBranchEmpty && isDepartmentEmpty) ||
          (isBranchUpdated && isDepartmentUpdated)
        )
      ) {
        errors.form =
          "You must either clear branch and department or update both to new values.";
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return; // Stop submission if there are errors
    }

    if (selectedEmployee) {
      // Edit Employee
      const isBranchUpdated =
        formData.branchName !== selectedEmployee.branchName;
      const isDepartmentUpdated = formData.department !== selectedEmployee.department; // Changed from position

      // Xác định branch name để gửi
      const branchNameToSend =
        (formData.branchName && formData.branchName.trim() !== "")
          ? isBranchUpdated
            ? formData.branchName // Nếu đã cập nhật, gửi giá trị mới
            : selectedEmployee.branchName // Nếu không cập nhật, giữ giá trị cũ
          : null; // Nếu không có branchName, gửi null

      // Xác định department name để gửi
      const departmentNameToSend =
        (formData.department && formData.department.trim() !== "") // Changed from position
          ? isDepartmentUpdated
            ? formData.department // Nếu đã cập nhật, gửi giá trị mới
            : selectedEmployee.department // Nếu không cập nhật, giữ giá trị cũ (changed from position)
          : null; // Nếu không có department, gửi null

      const updateData = {
        employee_name: formData.name,
        employee_email: formData.email,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        employee_phone_number: formData.phone,
        employee_address: formData.address,
        branch_name: branchNameToSend,
        department_name: departmentNameToSend,
        hire_date: formData.hire_date,
        quit_date: formData.quit_date || null,
      };

      try {
        const response = await http(
          `/employee/${selectedEmployee.employee_id}`, // Use employee_id for update
          "PATCH",
          updateData
        );

        toast.success("Employee updated successfully!", {
          position: "top-right",
          autoClose: 1500,
        });
        fetchEmployees(); // Re-fetch employees to update the list
      } catch (error) {
        console.error("Error updating employee:", error);
        alert("Failed to update employee. Please try again.");
      }
    } else {
      // Add New Employee
      try {
        const response = await http(`/employee`, "POST", {
          employee_name: formData.name,
          employee_email: formData.email,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          employee_phone_number: formData.phone,
          employee_address: formData.address,
          branch_name: formData.branchName,
          department_name: formData.department,
        });

        const newEmployee = response.data;
        fetchEmployees();
        toast.success("Employee added successfully!", {
          position: "top-right",
          autoClose: 1500,
        });
      } catch (error) {
        console.error("Error adding employee:", error);
        alert("Failed to add employee. Please try again.");
      }
    }

    // Reset form and close modal
    setShowAddForm(false);
    setFormData({
      branchName: "",
      name: "",
      department: "", // Change from 'position' to 'department'
      email: "",
      phone: "",
      address: "",
      gender: "",
      hire_date: "",
      quit_date: "",
      date_of_birth: "",
    });
    setSelectedEmployee(null); // Clear selected employee
    setFormErrors({});
  };

  const handleDelete = async () => {
    if (!selectedEmployee) return;
    await deleteEmployee(selectedEmployee.employee_id); // Change from selectedEmployee.id
    setEmployees(employees.filter((emp) => emp.employee_id !== selectedEmployee.employee_id)); // Immediately update the list
    setShowDeleteModal(false);
    setSelectedEmployee(null);
  };

  const deleteEmployee = async (employeeId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/employee/${employeeId}`,
        {
          method: "DELETE",
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to delete employee with ID: ${employeeId}`);
      }

      toast.success(`Employee with ID: ${employeeId} deleted successfully!`, {
        position: "top-right",
        autoClose: 1500,
      });
      fetchEmployees(); // Re-fetch employees to update the list after deletion
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Error deleting employee. Please try again.");
    }
  };

  return (
    <div className="employee-management-container">
      <div className="employee-management-content">
        <h1 className="heading">Restaurant Employee Management</h1>

        {/* Filter and Sort Section */}
        <div className="filter-sort-section">
          {/* Search Bar */}
          <div className="search-bar-emp">
            <FaSearch className="search-icon-emp" />
            <input
              type="text"
              placeholder="Search by id..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-emp"
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm("")}
                aria-label="Clear Search"
              >
                <FiX />
              </button>
            )}
          </div>
          <div className="filter-sort-controls">
            <div className="filter-field">
              <label htmlFor="filter-branch" className="label">
                Branch
              </label>
              <select
                id="filter-branch"
                className="select"
                value={filterOptions.branchName}
                onChange={(e) =>
                  setFilterOptions({
                    ...filterOptions,
                    branchName: e.target.value,
                  })
                }
              >
                <option value="">--All Branches--</option>
                {branches.map((branch) => (
                  <option key={branch.branch_id} value={branch.branch_name}>
                    {branch.branch_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-field">
              <label htmlFor="filter-position" className="label">
                Department
              </label>
              <select
                id="filter-position"
                className="select"
                value={filterOptions.position}
                onChange={(e) =>
                  setFilterOptions({
                    ...filterOptions,
                    position: e.target.value,
                  })
                }
              >
                <option value="">--All Departments--</option>
                {departments.map((department) => (
                  <option
                    key={department.department_id}
                    value={department.department_name}
                  >
                    {department.department_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={applyFilter} className="filter-button">
            <FiFilter className="icon" /> Apply Filter
          </button>
        </div>

        {/* Employee List */}
        <div className="employee-list">
          <div className="header">
            <h2>Employees</h2>
            <button
              onClick={async () => {
                await fetchBranchesAndDepartments(); // Re-fetch branches and departments
                setShowAddForm(true);
                setSelectedEmployee(null); // Đặt lại trạng thái để chuyển sang chế độ thêm mới
                setFormData({
                  branchName: "",
                  name: "",
                  department: "", // Changed from 'position'
                  email: "",
                  phone: "",
                  address: "",
                  gender: "",
                  hire_date: "",
                  quit_date: "",
                  date_of_birth: "",
                });
              }}
              className="add-button"
            >
              <FiPlus className="icon" /> Add Employee
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Emp ID</th>
                  <th>Name</th>
                  <th>Branch</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayEmployees.length > 0 ? (
                  displayEmployees.map((employee) => (
                    <tr key={employee.employee_id}>
                      <td>{employee.employee_id}</td>
                      <td>{employee.employee_name}</td>
                      <td>{branches.find((branch) => branch.branch_id === employee.branch_id)?.branch_name || "N/A"}</td>
                      <td>{departments.find((dept) => dept.department_id === employee.department_id)?.department_name || "N/A"}</td>
                      <td>{employee.employee_email}</td>
                      <td>{employee.employee_phone_number}</td>
                      <td>
                        <button onClick={() => {
                            setSelectedEmployee(employee);
                            setFormData({
                            ...employee,
                              branchName: branches.find(b => b.branch_id === employee.branch_id)?.branch_name || "",
                              department: departments.find(d => d.department_id === employee.department_id)?.department_name || "",
                              quit_date: employee.quit_date
                              ? new Date(employee.quit_date).toISOString().split("T")[0]
                                : "",
                              date_of_birth: employee.date_of_birth
                              ? new Date(employee.date_of_birth).toISOString().split("T")[0]
                                : "",
                            });
                          setShowAddForm(true);
                        }} className="edit-button" style={{ margin: 0 }}>
                          <FiEdit className="icon" />
                        </button>
                        <button onClick={() => {
                            setSelectedEmployee(employee);
                            setShowDeleteModal(true);
                        }} className="delete-button">
                          <FiTrash2 className="icon" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
      </div>

      {/* Add/Edit Employee Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{selectedEmployee ? "Edit Employee" : "Add New Employee"}</h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setFormErrors({});
                }}
                className="close-button"
              >
                <FiX className="icon" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              {/* Common Fields for Add and Edit */}
              <div className="form-field">
                <label className="label">Name</label>
                <input
                  type="text"
                  className={`input ${formErrors.name ? "input-error" : ""}`}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                {formErrors.name && <p className="error">{formErrors.name}</p>}
              </div>
              <div className="form-field">
                <label className="label">Email</label>
                <input
                  type="email"
                  className={`input ${formErrors.email ? "input-error" : ""}`}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                {formErrors.email && (
                  <p className="error">{formErrors.email}</p>
                )}
              </div>
              <div className="form-field">
                <label className="label">Date of Birth</label>
                <input
                  type="date"
                  className={`input ${formErrors.date_of_birth ? "input-error" : ""}`}
                  value={formData.date_of_birth}
                  onChange={(e) =>
                    setFormData({ ...formData, date_of_birth: e.target.value })
                  }
                />
                {formErrors.date_of_birth && (
                  <p className="error">{formErrors.date_of_birth}</p>
                )}
              </div>
              <div className="form-field">
                <label className="label">Gender</label>
                <select
                  className={`select ${formErrors.gender ? "input-error" : ""}`}
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                >
                  <option value="">--Select Gender--</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {formErrors.gender && <p className="error">{formErrors.gender}</p>}
              </div>
              <div className="form-field">
                <label className="label">Phone</label>
                <input
                  type="text"
                  className={`input ${formErrors.phone ? "input-error" : ""}`}
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
                {formErrors.phone && <p className="error">{formErrors.phone}</p>}
              </div>
              <div className="form-field">
                <label className="label">Address</label>
                <input
                  type="text"
                  className={`input ${formErrors.address ? "input-error" : ""}`}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
                {formErrors.address && <p className="error">{formErrors.address}</p>}
              </div>
              {/* Branch Dropdown */}
                    <div className="form-field">
                      <label className="label">Branch</label>
                      <select
                  className={`select ${formErrors.branchName ? "input-error" : ""}`}
                        value={formData.branchName}
                        onChange={(e) =>
                    setFormData({ ...formData, branchName: e.target.value })
                        }
                      >
                        <option value="">--Select Branch--</option>
                        {branches.map((branch) => (
                    <option key={branch.branch_id} value={branch.branch_name}>
                            {branch.branch_name}
                          </option>
                        ))}
                      </select>
                {formErrors.branchName && <p className="error">{formErrors.branchName}</p>}
                    </div>
              {/* Department Dropdown */}
                    <div className="form-field">
                      <label className="label">Department</label>
                      <select
                  className={`select ${formErrors.department ? "input-error" : ""}`}
                  value={formData.department}
                        onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                        }
                      >
                        <option value="">--Select Department--</option>
                        {departments.map((dept) => (
                    <option key={dept.department_id} value={dept.department_name}>
                            {dept.department_name}
                          </option>
                        ))}
                      </select>
                {formErrors.department && <p className="error">{formErrors.department}</p>}
                    </div>
              {selectedEmployee && (
                <>
                    <div className="form-field">
                      <label className="label">Hire Date</label>
                      <input
                        type="date"
                        className={`input ${
                          formErrors.hire_date ? "input-error" : ""
                        }`}
                        value={formData.hire_date || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hire_date: e.target.value,
                          })
                        }
                      />
                      {formErrors.hire_date && (
                        <p className="error">{formErrors.hire_date}</p>
                      )}
                    </div>

                    <div className="form-field">
                      <label className="label">Quit Date</label>
                      <input
                        type="date"
                        className={`input ${
                          formErrors.quit_date ? "input-error" : ""
                        }`}
                        value={formData.quit_date || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            quit_date: e.target.value,
                          })
                        }
                      />
                      {formErrors.quit_date && (
                        <p className="error">{formErrors.quit_date}</p>
                      )}
                  </div>
                </>
              )}
              <button type="submit" className="submit-button">
                {selectedEmployee ? "Update Employee" : "Add Employee"}
                </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedEmployee && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Delete Employee</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="close-button"
              >
                <FiX className="icon" />
              </button>
            </div>
            <p>
              Are you sure you want to delete {selectedEmployee.employee_name} from the
              list?
            </p>
            <div className="modal-buttons">
              <button onClick={handleDelete} className="confirm-button">
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && detailedEmployee && (
        <div className="modal-detail-employee-overlay">
          <div className="modal-detail-employee-content">
            <div className="modal-detail-employee-header">
              <h3>Employee Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)} // Close modal
                className="modal-detail-employee-close-button"
              >
                <FiX className="icon" />
              </button>
            </div>

            {/* Infomation */}
            <div className="form-section">
              <h4 className="section-title">Personal Information</h4>
              <p>
                <strong>Name:</strong> {detailedEmployee.employee_name}
              </p>
              <p>
                <strong>Email:</strong> {detailedEmployee.employee_email}
              </p>
              <p>
                <strong>Phone:</strong> {detailedEmployee.employee_phone_number}
              </p>
              <p>
                <strong>Address:</strong> {detailedEmployee.employee_address}
              </p>
              <p>
                <strong>Gender:</strong> {detailedEmployee.gender}
              </p>
              <p>
                <strong>Date of Birth:</strong>{" "}
                {new Date(detailedEmployee.date_of_birth).toLocaleDateString()}
              </p>
            </div>

            {/* Infomation work */}
            <div className="form-section">
              <h4 className="section-title" style={{ marginTop: "15px" }}>
                Work Information
              </h4>
              <p>
                <strong>Branch:</strong>{" "}
                {branches.find(
                  (branch) => branch.branch_id === detailedEmployee.branch_id
                )?.branch_name || "N/A"}
              </p>
              <p>
                <strong>Department:</strong>{" "}
                {departments.find(
                  (dept) =>
                    dept.department_id === detailedEmployee.department_id
                )?.department_name || "N/A"}
              </p>
              <p>
                <strong>Hire Date:</strong>{" "}
                {new Date(detailedEmployee.hire_date).toLocaleDateString()}
              </p>
              <p>
                <strong>Quit Date:</strong>{" "}
                {detailedEmployee.quit_date
                  ? new Date(detailedEmployee.quit_date).toLocaleDateString()
                  : "N/A"}
              </p>
              <p>
                <strong>Salary:</strong>{" "}
                {detailedEmployee.employee_salary.toLocaleString()} VND
              </p>
              <p>
                <strong>Rating:</strong> {detailedEmployee.employees_rating}
              </p>
              <p>
                <strong>Start Date at Branch:</strong>{" "}
                {new Date(
                  detailedEmployee.start_date_branch
                ).toLocaleDateString()}
              </p>
              <p>
                <strong>End Date at Branch:</strong>{" "}
                {detailedEmployee.end_date_branch
                  ? new Date(
                      detailedEmployee.end_date_branch
                    ).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementEmployeePage;
