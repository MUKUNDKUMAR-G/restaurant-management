import React, { useState, useEffect } from "react";
import { MdEdit, MdDelete, MdSave, MdCancel, MdList, MdAdd, MdFilterList, MdSearch } from "react-icons/md";
import { FaSpinner, FaParking, FaSnowflake, FaUmbrellaBeach, FaDoorOpen } from "react-icons/fa";
import "./BranchPage.css"; // Import the CSS file
import { toast } from "react-toastify";
import { http } from "../../../helpers/http";
import { FiChevronLeft, FiChevronRight, FiMapPin, FiPhone, FiMail, FiClock } from "react-icons/fi";
import Select from "react-select";

const BranchPage = () => {
  const [formData, setFormData] = useState({
    area: "",
    branchName: "",
    address: "",
    phone: "",
    email: "",
    operationHours: {
      opening: "11:00",
      closing: "23:00",
    },
    tableCount: 0,
    hasCarParking: false,
    hasBikeParking: false,
    hasValetParking: false,
    hasAC: true,
    hasOutdoorSeating: false,
    hasPrivateDining: false,
    cuisineType: "multi", // multi, north-indian, south-indian, etc.
    specialFeatures: [], // buffet, live-cooking, etc.
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [areas, setAreas] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showAddEditForm, setShowAddEditForm] = useState(false);
  const [branchList, setBranchList] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  //123
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
    pageSize: 0,
  });

  const [filters, setFilters] = useState({
    query: "",
    area: "",
    page: 1,
    limit: 4,
    hasParking: false,
    hasAC: false,
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const cuisineTypes = [
    { value: "multi", label: "Multi-Cuisine" },
    { value: "north-indian", label: "North Indian" },
    { value: "south-indian", label: "South Indian" },
    { value: "mumbai-street", label: "Mumbai Street Food" },
    { value: "punjabi", label: "Punjabi" },
    { value: "gujarati", label: "Gujarati" },
    { value: "bengali", label: "Bengali" },
    { value: "hyderabadi", label: "Hyderabadi" }
  ];

  const specialFeatures = [
    { value: "buffet", label: "Buffet Service" },
    { value: "live-cooking", label: "Live Cooking" },
    { value: "tandoor", label: "Live Tandoor" },
    { value: "bar", label: "Bar Service" },
    { value: "catering", label: "Catering Service" },
    { value: "party-hall", label: "Party Hall" },
    { value: "rooftop", label: "Rooftop Dining" }
  ];

  useEffect(() => {
    fetchRegions();
    fetchBranches();
  }, [filters]);

  useEffect(() => {
    fetchBranches();
  }, [filters]);

  const fetchRegions = async () => {
    setIsLoading(true);
    try {
      const response = await http(`/region`, "GET");
      const data = response.data;
      setAreas(data || []);
    } catch (error) {
      console.error("Error fetching regions:", error);
      toast.error("Failed to fetch regions.", {
        position: "top-right",
        autoClose: 1500,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBranches = async () => {
    setIsLoading(true);
    try {
      const response = await http(
        `/branch/search?query=${encodeURIComponent(filters.query)}&area=${encodeURIComponent(filters.area)}&page=${filters.page}&limit=${filters.limit}`,
        "GET"
      );
      const data = response.data;
      setBranchList(data.branches || []);
      setPagination({
        currentPage: data.pagination?.currentPage || 1,
        totalPages: data.pagination?.totalPages || 1,
        hasMore: data.pagination?.hasMore || false,
        pageSize: data.pagination?.pageSize || 4,
      });
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error("Failed to fetch branches.", {
        position: "top-right",
        autoClose: 1500,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditBranch = (branch) => {
    setSelectedBranch(branch); // Lưu branch đang được chỉnh sửa
    setFormData({
      area: branch.region_id || "", // Cập nhật `area` nếu có
      branchName: branch.branch_name || "",
      address: branch.address || "",
      phone: branch.phone_number || "",
      email: branch.email || "",
      operationHours: {
        opening: branch.open_time ? branch.open_time.slice(0, 5) : "07:00",
        closing: branch.close_time ? branch.close_time.slice(0, 5) : "22:00",
      },
      tableCount: branch.table_amount || 0,
      hasCarParking: !!branch.has_car_park,
      hasBikeParking: !!branch.has_motorbike_park,
      hasValetParking: !!branch.has_valet_park,
      hasAC: !!branch.has_ac,
      hasOutdoorSeating: !!branch.has_outdoor_seating,
      hasPrivateDining: !!branch.has_private_dining,
      cuisineType: branch.cuisine_type || "multi",
      specialFeatures: Array.isArray(branch.special_features) ? branch.special_features : [],
    });
    setEditMode(true); // Kích hoạt chế độ chỉnh sửa
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setFilters((prev) => ({
      ...prev,
      query: value,
      page: 1,
    }));
  };

  const handleAreaFilter = (e) => {
    const value = e.target.value;
    setFilters((prev) => ({
      ...prev,
      area: value,
      page: 1,
    }));
  };

  const goToPage = (page) => {
    setFilters((prev) => ({
      ...prev,
      page: Math.max(1, Math.min(page, pagination.totalPages)), // Giới hạn trong khoảng hợp lệ
    }));
  };

  const handleDeleteBranch = async (branchId) => {
    if (window.confirm("Are you sure you want to delete this branch?")) {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setBranchList((prev) =>
          prev.filter((branch) => branch.id !== branchId)
        );
        toast.success(`"Branch deleted successfully!`, {
          position: "top-right",
          autoClose: 1000,
        });
      } catch (error) {
        console.error("Error deleting branch:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.area) newErrors.area = "Area is required";
    if (!formData.branchName) newErrors.branchName = "Branch name is required";
    if (!formData.address) newErrors.address = "Address is required";

    const phoneRegex = /^(0\d{9})$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (formData.tableCount <= 0)
      newErrors.tableCount = "Table count must be greater than 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
        if (editMode && selectedBranch) {
          await updateBranch(selectedBranch.branch_id);
        } else {
          await addBranch();
        }
        resetForm();
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      area: "", // Reset to empty string
      branchName: "",
      address: "",
      phone: "",
      email: "",
      operationHours: {
        opening: "11:00",
        closing: "23:00",
      },
      tableCount: 0,
      hasCarParking: false,
      hasBikeParking: false,
      hasValetParking: false,
      hasAC: true,
      hasOutdoorSeating: false,
      hasPrivateDining: false,
      cuisineType: "multi",
      specialFeatures: [],
    });
    setErrors({});
    setEditMode(false);
    setSelectedBranch(null);
    setShowAddEditForm(false); // Ensure the form is hidden when reset
  };

  const handleAreaChange = async (e) => {
    const selectedRegion = e.target.value; // Lấy region_id được chọn
    setFormData((prev) => ({ ...prev, area: selectedRegion })); // Cập nhật state formData.area

    // Cập nhật filters.area để gọi lại API fetchBranches
    setFilters((prev) => ({
      ...prev,
      area: selectedRegion,
      page: 1, // Reset về trang đầu khi thay đổi khu vực
    }));
  };

  const addBranch = async () => {
    try {
      const response = await http("/branch", "POST", {
        region_id: formData.area,
        branch_name: formData.branchName,
        address: formData.address,
        phone_number: formData.phone,
        email: formData.email,
        open_time: formData.operationHours.opening,
        close_time: formData.operationHours.closing,
        table_amount: formData.tableCount,
        has_car_park: formData.hasCarParking,
        has_motorbike_park: formData.hasBikeParking,
        has_valet_park: formData.hasValetParking,
        has_ac: formData.hasAC,
        has_outdoor_seating: formData.hasOutdoorSeating,
        has_private_dining: formData.hasPrivateDining,
        cuisine_type: formData.cuisineType,
        special_features: formData.specialFeatures,
      });
      console.log(response.data);
      toast.success("Branch added successfully!", {
        position: "top-right",
        autoClose: 1500,
      });
      fetchBranches(); // Refetch branches to update the list
    } catch (error) {
      console.error("Error adding branch:", error);
      toast.error("Failed to add branch.", {
        position: "top-right",
        autoClose: 1500,
      });
    }
  };

  const updateBranch = async (idBranch) => {
    try {
      const response = await http(`/branch/${idBranch}`, "PATCH", {
        region_id: formData.area,
        branch_name: formData.branchName,
        address: formData.address,
        phone_number: formData.phone,
        email: formData.email,
        open_time: formData.operationHours.opening,
        close_time: formData.operationHours.closing,
        table_amount: formData.tableCount,
        has_car_park: formData.hasCarParking,
        has_motorbike_park: formData.hasBikeParking,
        has_valet_park: formData.hasValetParking,
        has_ac: formData.hasAC,
        has_outdoor_seating: formData.hasOutdoorSeating,
        has_private_dining: formData.hasPrivateDining,
        cuisine_type: formData.cuisineType,
        special_features: formData.specialFeatures,
      });
      console.log(response.data);
      toast.success("Branch updated successfully!", {
        position: "top-right",
        autoClose: 1500,
      });
      fetchBranches(); // Refetch branches to update the list
    } catch (error) {
      console.error("Error updating branch:", error);
      toast.error("Failed to update branch.", {
        position: "top-right",
        autoClose: 1500,
      });
    }
  };

  const renderBranchCard = (branch) => {
    const area = areas.find((area) => area.region_id === branch.region_id);
    
    return (
      <div className="branch-card" key={branch.branch_id}>
        <div className="branch-card-header">
          <h3>{branch.branch_name}</h3>
          <div className="branch-actions">
            <button
              onClick={() => {
                handleEditBranch(branch);
                setShowAddEditForm(true);
              }}
              className="icon-button edit"
              title="Edit Branch"
            >
              <MdEdit />
            </button>
            <button
              onClick={() => handleDeleteBranch(branch.branch_id)}
              className="icon-button delete"
              title="Delete Branch"
            >
              <MdDelete />
            </button>
          </div>
        </div>
        
        <div className="branch-info">
          <div className="info-item">
            <FiMapPin className="icon" />
            <span>{branch.address}</span>
          </div>
          <div className="info-item">
            <FiPhone className="icon" />
            <span>{branch.phone_number}</span>
          </div>
          <div className="info-item">
            <FiMail className="icon" />
            <span>{branch.email}</span>
          </div>
          <div className="info-item">
            <FiClock className="icon" />
            <span>{branch.open_time} - {branch.close_time}</span>
          </div>
        </div>

        <div className="branch-features">
          {branch.has_car_park && <span className="feature-tag"><FaParking /> Parking</span>}
          {branch.has_ac && <span className="feature-tag"><FaSnowflake /> AC</span>}
          {branch.has_outdoor_seating && <span className="feature-tag"><FaUmbrellaBeach /> Outdoor</span>}
          {branch.has_private_dining && <span className="feature-tag"><FaDoorOpen /> Private</span>}
        </div>

        <div className="branch-footer">
          <span className="area-badge">{area?.region_name || "N/A"}</span>
          <span className="tables-badge">{branch.table_amount} Tables</span>
        </div>
      </div>
    );
  };

  return (
    <div className="branch-container">
      <div className="branch-content">
        <div className="page-header">
          <h1>Restaurant Branch Management</h1>
          <div className="header-actions">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="view-toggle"
              title={`Switch to ${viewMode === 'grid' ? 'List' : 'Grid'} View`}
            >
              {viewMode === 'grid' ? <MdList /> : <MdAdd />}
            </button>
            <button
              onClick={() => {
                resetForm();
                setEditMode(false);
                setShowAddEditForm(true);
              }}
              className="add-button"
            >
              <MdAdd /> Add Branch
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        {!showAddEditForm && (
          <div className="search-filter-section">
            <div className="search-bar">
              <MdSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search branches..."
                value={filters.query}
                onChange={handleSearch}
                className="search-input"
              />
            </div>
            
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="filter-toggle"
            >
              <MdFilterList /> Filters
            </button>

            {isFilterOpen && (
              <div className="filter-panel">
                <div className="filter-group">
                  <label>Area</label>
                  <Select
                    options={areas.map(area => ({
                      value: area.region_id,
                      label: area.region_name
                    }))}
                    value={areas.find(area => area.region_id === filters.area)}
                    onChange={(option) => handleAreaFilter({ target: { value: option?.value || '' } })}
                    isClearable
                    placeholder="Select Area"
                  />
                </div>
                
                <div className="filter-group">
                  <label>Features</label>
                  <div className="feature-filters">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={filters.hasParking}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          hasParking: e.target.checked
                        }))}
                      />
                      Parking
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={filters.hasAC}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          hasAC: e.target.checked
                        }))}
                      />
                      AC
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Branch List/Grid */}
        {!showAddEditForm && (
          <div className={`branch-display ${viewMode}`}>
            {isLoading ? (
              <div className="loading-state">
                <FaSpinner className="spinner" />
                <span>Loading branches...</span>
              </div>
            ) : branchList.length > 0 ? (
              branchList.map(branch => renderBranchCard(branch))
            ) : (
              <div className="no-data">
                <MdList className="no-data-icon" />
                <p>No branches found</p>
                <button
                  onClick={() => {
                    resetForm();
                    setEditMode(false);
                    setShowAddEditForm(true);
                  }}
                  className="add-first-button"
                >
                  Add Your First Branch
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!showAddEditForm && branchList.length > 0 && (
          <div className="pagination">
            <button
              onClick={() => goToPage(filters.page - 1)}
              disabled={filters.page === 1}
              className="pagination-button"
            >
              <FiChevronLeft />
            </button>
            <span className="page-info">
              Page {filters.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => goToPage(filters.page + 1)}
              disabled={filters.page === pagination.totalPages}
              className="pagination-button"
            >
              <FiChevronRight />
            </button>
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddEditForm && (
          <div className="form-container">
            <h2>{editMode ? "Edit Branch" : "Add New Branch"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-fields">
                <div className="field">
                  <label>Area</label>
                  <select
                    value={formData.area}
                    onChange={handleAreaChange}
                    className="input"
                  >
                    <option value="">Select an Area</option>
                    {areas.map((area) => (
                      <option key={area.region_id} value={area.region_id}>
                        {area.region_name}
                      </option>
                    ))}
                  </select>
                  {errors.area && <span className="error">{errors.area}</span>}
                </div>
                <div className="field">
                  <label>Branch Name</label>
                  <input
                    type="text"
                    value={formData.branchName}
                    onChange={(e) =>
                      setFormData({ ...formData, branchName: e.target.value })
                    }
                    className="input"
                  />
                  {errors.branchName && (
                    <span className="error">{errors.branchName}</span>
                  )}
                </div>
                <div className="field">
                  <label>Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="input"
                  />
                  {errors.address && (
                    <span className="error">{errors.address}</span>
                  )}
                </div>
                <div className="field">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="input"
                  />
                  {errors.phone && (
                    <span className="error">{errors.phone}</span>
                  )}
                </div>
                <div className="field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="input"
                  />
                  {errors.email && (
                    <span className="error">{errors.email}</span>
                  )}
                </div>
                <div className="field-group">
                  <label>Operation Hours</label>
                  <div className="time-inputs">
                    <input
                      type="time"
                      value={formData.operationHours.opening}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          operationHours: {
                            ...prev.operationHours,
                            opening: e.target.value,
                          },
                        }))
                      }
                      className="input"
                    />
                    <span>-</span>
                    <input
                      type="time"
                      value={formData.operationHours.closing}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          operationHours: {
                            ...prev.operationHours,
                            closing: e.target.value,
                          },
                        }))
                      }
                      className="input"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Table Count</label>
                  <input
                    type="number"
                    value={formData.tableCount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tableCount: parseInt(e.target.value, 10),
                      }))
                    }
                    className="input"
                  />
                </div>
                <div className="field">
                  <label>Car Parking</label>
                  <select
                    value={formData.hasCarParking ? "yes" : "no"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hasCarParking: e.target.value === "yes",
                      }))
                    }
                    className="input"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div className="field">
                  <label>Bike Parking</label>
                  <select
                    value={formData.hasBikeParking ? "yes" : "no"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hasBikeParking: e.target.value === "yes",
                      }))
                    }
                    className="input"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div className="field">
                  <label>Cuisine Type</label>
                  <Select
                    options={cuisineTypes}
                    value={cuisineTypes.find(type => type.value === formData.cuisineType)}
                    onChange={(option) =>
                      setFormData({
                        ...formData,
                        cuisineType: option.value,
                      })
                    }
                    placeholder="Select cuisine type..."
                  />
                </div>

                <div className="field">
                  <label>Special Features</label>
                  <Select
                    isMulti
                    options={specialFeatures}
                    value={specialFeatures.filter(feature =>
                      (Array.isArray(formData.specialFeatures) ? formData.specialFeatures : []).includes(feature.value)
                    )}
                    onChange={(options) =>
                      setFormData({
                        ...formData,
                        specialFeatures: options.map(option => option.value),
                      })
                    }
                    placeholder="Select special features..."
                  />
                </div>

                <div className="field">
                  <label>Valet Parking</label>
                  <select
                    value={formData.hasValetParking ? "yes" : "no"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hasValetParking: e.target.value === "yes",
                      }))
                    }
                    className="input"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div className="field">
                  <label>Air Conditioning</label>
                  <select
                    value={formData.hasAC ? "yes" : "no"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hasAC: e.target.value === "yes",
                      }))
                    }
                    className="input"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div className="field">
                  <label>Outdoor Seating</label>
                  <select
                    value={formData.hasOutdoorSeating ? "yes" : "no"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hasOutdoorSeating: e.target.value === "yes",
                      }))
                    }
                    className="input"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div className="field">
                  <label>Private Dining</label>
                  <select
                    value={formData.hasPrivateDining ? "yes" : "no"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hasPrivateDining: e.target.value === "yes",
                      }))
                    }
                    className="input"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={isLoading}>
                  {isLoading ? <FaSpinner className="spinner" /> : <MdSave />} {" "}
                  Save
                </button>
                <button type="button" onClick={resetForm} className="cancel-btn">
                  <MdCancel /> Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchPage;
