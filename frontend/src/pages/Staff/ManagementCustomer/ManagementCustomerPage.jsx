import React, { useState, useEffect } from "react";
import { FaSearch, FaTimes, FaEye, FaEdit } from "react-icons/fa";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./ManagementCustomerPage.css";
import { http } from "../../../helpers/http";
import { toast } from "react-toastify";

// Hàm lấy rank của member card từ card_type_id
const getMemberCardRank = (typeId) => {
  switch (typeId) {
    case 1:
      return "Membership";
    case 2:
      return "Silver";
    case 3:
      return "Gold";
    default:
      return "Unknown";
  }
};

export const ManagementCustomerPage = () => {
  // State để lưu trữ member cards và thông tin phân trang
  const [memberCards, setMemberCards] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    hasMore: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  // Modal state cho Detail View
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Modal state cho Staff Detail
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  // Modal state cho Edit Customer
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState({
    member_card_id: null,
    member_id: "",
    member_name: "",
    member_phone_number: "",
    member_gender: "Male",
    user_email: "",
  });

  // Modal state cho Add Card
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [newMemberCard, setNewMemberCard] = useState({
    member_id: "",
    member_name: "",
    member_phone_number: "",
    member_gender: "Male",
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Đồng bộ với pageSize từ API

  // State để lưu trữ dữ liệu nhân viên đã lấy từ API
  const [staffMap, setStaffMap] = useState({});

  // Hàm fetch member cards từ API
  const fetchMemberCards = async (
    page = 1,
    limit = itemsPerPage,
    query = ""
  ) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page,
        limit,
        query,
      });

      const response = await http(`/card/search?${params.toString()}`, "GET");
      const data = response.data;
      if (data) {
        setMemberCards(data.memberCards);
        setPagination({
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
          pageSize: data.pagination.pageSize,
          hasMore: data.pagination.hasMore,
        });
      } else {
        throw new Error("No data received from API");
      }
    } catch (error) {
      console.error("Error fetching member cards:", error);
      setError("Failed to fetch member cards. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Gọi fetchMemberCards khi component mount và khi currentPage hoặc searchQuery thay đổi
  useEffect(() => {
    fetchMemberCards(currentPage, itemsPerPage, searchQuery);
  }, [currentPage, searchQuery]);

  // Hàm xử lý thay đổi trang
  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= pagination.totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Hàm mở modal xem chi tiết khách hàng
  const handleViewDetailClick = (card) => {
    setSelectedCustomer(card);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedCustomer(null);
    setIsDetailModalOpen(false);
  };

  // Hàm mở modal xem chi tiết nhân viên
  const handleViewStaffDetail = async (staffId) => {
    if (staffMap[staffId]) {
      setSelectedStaff(staffMap[staffId]);
      setIsStaffModalOpen(true);
      return;
    }

    // Nếu chưa có, fetch từ API
    try {
      const response = await http(`/employee/get-info/${staffId}`, "GET");
      const data = response.data;
      console.log(data);
      if (data) {
        const staff = {
          staff_id: data.employee_id,
          name: data.employee_name,
          gender: data.gender,
          phone: data.employee_phone_number,
          department: data.department_name,
          branch: data.branch_name,
        };
        setStaffMap((prev) => ({ ...prev, [staffId]: staff }));
        setSelectedStaff(staff);
        setIsStaffModalOpen(true);
      } else {
        throw new Error("No staff data received from API");
      }
    } catch (error) {
      console.error("Error fetching staff data:", error);
      toast.error("Failed to fetch staff information.", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const closeStaffModal = () => {
    setSelectedStaff(null);
    setIsStaffModalOpen(false);
  };

  // Hàm mở modal chỉnh sửa khách hàng
  const handleEditClick = (card) => {
    setEditCustomer({
      member_card_id: card.member_card_id,
      member_id: card.member_id,
      member_name: card.member_name,
      member_phone_number: card.member_phone_number,
      member_gender: card.member_gender,
      user_email: card.user_email || "",
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  // Hàm lưu chỉnh sửa khách hàng
  const handleSaveEdit = async () => {
    try {
      const data = {
        member_name: editCustomer.member_name,
        member_phone_number: editCustomer.member_phone_number,
        member_gender: editCustomer.member_gender,
        user_email: editCustomer.user_email,
      };
      await updateMemberCard(editCustomer.member_card_id, data);

      setMemberCards((prev) =>
        prev.map((card) =>
          card.member_card_id === editCustomer.member_card_id
            ? {
                ...card,
                member_name: editCustomer.member_name,
                member_phone_number: editCustomer.member_phone_number,
                member_gender: editCustomer.member_gender,
                user_email: editCustomer.user_email,
              }
            : card
        )
      );

      closeEditModal();
    } catch (error) {
      console.error("Failed to save edit:", error.message);
      toast.error("Failed to save changes. Please try again.", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  // Hàm cập nhật member card
  const updateMemberCard = async (member_card_id, data) => {
    try {
      const response = await http(`/card/${member_card_id}`, "PATCH", data);
      if (response) {
        toast.success("Member card updated successfully!", {
          position: "top-right",
          autoClose: 1000,
        });
      }
    } catch (error) {
      console.error("Error updating member card:", error.message);
      toast.error(`Error: ${error.message}`, {
        position: "top-right",
        autoClose: 1500,
      });
      throw error;
    }
  };

  // Hàm xử lý thêm thẻ mới
  const handleAddCard = async () => {
    const { member_id, member_name, member_phone_number, member_gender } =
      newMemberCard;

    // Kiểm tra thông tin đầy đủ
    if (!member_id || !member_name || !member_phone_number || !member_gender) {
      toast.error("Vui lòng điền đầy đủ thông tin.", {
        position: "top-right",
        autoClose: 2000,
      });
      return;
    }

    // // Kiểm tra định dạng CCCD (ở đây giả sử là 12 chữ số)
    // const cccdRegex = /^\d{12}$/;
    // if (!cccdRegex.test(member_id)) {
    //   toast.error("Member ID (CCCD) phải là 12 chữ số.", {
    //     position: "top-right",
    //     autoClose: 2000,
    //   });
    //   return;
    // }

    const dataAdd = {
      member_id,
      member_name,
      member_phone_number,
      member_gender,
    };

    try {
      const branchId = localStorage.getItem("staff_branch");
      const response = await http(`/card/${branchId}`, "POST", dataAdd);
      if (response) {
        toast.success("Added member card successfully!", {
          position: "top-right",
          autoClose: 1000,
        });

        fetchMemberCards(currentPage, itemsPerPage, searchQuery);

        // Đóng modal và reset form
        setIsAddCardModalOpen(false);
        setNewMemberCard({
          member_id: "",
          member_name: "",
          member_phone_number: "",
          member_gender: "Male",
        });
      }
    } catch (error) {
      console.error("Error adding member card:", error.message);
      toast.error(`Error: ${error.message}`, {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  return (
    <div className="management-customer-container">
      {error && <div className="error-message">{error}</div>}
      {memberCards.length === 0 && !error && (
        <div className="empty-message">No customers found.</div>
      )}
      <div className="customer-list-container">
        <div className="customer-list-wrapper">
          <h1 className="customer-title">Customer Management</h1>

          {/* Search Bar và Add Card Button */}
          <div
            className="search-and-add-container"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by Card ID"
                className="search-input"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Search by Card ID"
              />
            </div>
            <button
              onClick={() => setIsAddCardModalOpen(true)}
              className="add-card-button"
            >
              Add Card
            </button>
          </div>

          {/* Customer Table */}
          <div className="table-container">
            {loading ? (
              <div className="loading">Loading member cards...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : (
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>Card ID</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Total Points</th>
                    <th>Level Card</th>
                    <th>Issuer</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {memberCards.length > 0 ? (
                    memberCards.map((card) => (
                      <tr key={card.member_card_id}>
                        <td>{card.member_card_id}</td>
                        <td>{card.member_name}</td>
                        <td>{card.member_phone_number}</td>
                        <td style={{ textAlign: "center" }}>
                          {card.total_points}
                        </td>
                        <td
                          className={`member-card ${getMemberCardRank(
                            card.card_type_id
                          )}`}
                        >
                          {card.card_type_name}
                        </td>
                        <td>
                          <button
                            onClick={() =>
                              handleViewStaffDetail(card.card_issuer)
                            }
                            className="staff-detail-button"
                          >
                            {staffMap[card.card_issuer]
                              ? staffMap[card.card_issuer].name
                              : "Loading..."}
                          </button>
                        </td>
                        <td style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            onClick={() => handleViewDetailClick(card)}
                            className="view-detail-button"
                            aria-label={`View details for ${card.member_name}`}
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleEditClick(card)}
                            className="edit-button"
                            style={{ margin: 0, padding: 8 }}
                            aria-label={`Edit ${card.member_name}`}
                          >
                            <FaEdit />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-results">
                        No member cards found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
                aria-label="Previous page"
              >
                <FiChevronLeft className="pagination-icon" />
              </button>
              <span className="pagination-info">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="pagination-button"
                aria-label="Next page"
              >
                <FiChevronRight className="pagination-icon" />
              </button>
            </div>
          )}

          {/* Detail Modal */}
          {isDetailModalOpen && selectedCustomer && (
            <div className="modal-overlay">
              <div className="modal-content" role="dialog" aria-modal="true">
                <div className="modal-header">
                  <h2 className="modal-title">
                    Member Card Detail - {selectedCustomer.member_name}
                  </h2>
                  <button
                    onClick={closeDetailModal}
                    className="modal-close-button"
                    aria-label="Close modal"
                  >
                    <FaTimes className="modal-close-icon" />
                  </button>
                </div>

                <div className="modal-body">
                  <h3 className="modal-subtitle">Member Card Info</h3>
                  <div className="modal-section">
                    <p>
                      <strong>Member Card ID:</strong>{" "}
                      {selectedCustomer.member_card_id}
                    </p>
                    <p>
                      <strong>Created At:</strong>{" "}
                      {new Date(selectedCustomer.created_at).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Updated At:</strong>{" "}
                      {new Date(selectedCustomer.updated_at).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Total Points:</strong>{" "}
                      {selectedCustomer.total_points}
                    </p>
                    <p>
                      <strong>Card Issuer (Staff):</strong>{" "}
                      <button
                        onClick={() =>
                          handleViewStaffDetail(selectedCustomer.card_issuer)
                        }
                        className="staff-detail-button"
                      >
                        {staffMap[selectedCustomer.card_issuer]
                          ? staffMap[selectedCustomer.card_issuer].name
                          : "Loading..."}
                      </button>
                    </p>
                    <p>
                      <strong>Branch Created:</strong>{" "}
                      {selectedCustomer.branch_created}
                    </p>
                    <p>
                      <strong>Card Type:</strong>{" "}
                      {selectedCustomer.card_type_name} (
                      {getMemberCardRank(selectedCustomer.card_type_id)})
                    </p>
                    <p>
                      <strong>Member ID (CCCD):</strong>{" "}
                      {selectedCustomer.member_id}
                    </p>
                    <p>
                      <strong>Member Name:</strong> {selectedCustomer.member_name}
                    </p>
                    <p>
                      <strong>Member Phone Number:</strong>{" "}
                      {selectedCustomer.member_phone_number}
                    </p>
                    <p>
                      <strong>Member Gender:</strong>{" "}
                      {selectedCustomer.member_gender}
                    </p>
                    <p>
                      <strong>Is Active:</strong>{" "}
                      {selectedCustomer.is_active ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Staff Detail Modal */}
          {isStaffModalOpen && selectedStaff && (
            <div className="modal-overlay">
              <div className="modal-content" role="dialog" aria-modal="true">
                <div className="modal-header">
                  <h2 className="modal-title">
                    Staff Detail - {selectedStaff.name}
                  </h2>
                  <button
                    onClick={closeStaffModal}
                    className="modal-close-button"
                    aria-label="Close modal"
                  >
                    <FaTimes className="modal-close-icon" />
                  </button>
                </div>

                <div className="modal-body">
                  <div className="modal-section">
                    <p>
                      <strong>Name:</strong> {selectedStaff.name}
                    </p>
                    <p>
                      <strong>Gender:</strong> {selectedStaff.gender}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedStaff.phone}
                    </p>
                    <p>
                      <strong>Department:</strong> {selectedStaff.department}
                    </p>
                    <p>
                      <strong>Branch:</strong> {selectedStaff.branch}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Customer Modal */}
          {isEditModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content" role="dialog" aria-modal="true">
                <div className="modal-header">
                  <h2 className="modal-title">Edit Customer Info</h2>
                  <button
                    onClick={closeEditModal}
                    className="modal-close-button"
                    aria-label="Close modal"
                  >
                    <FaTimes className="modal-close-icon" />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="modal-section">
                    <label>Member ID (CCCD):</label>
                    <input
                      type="text"
                      value={editCustomer.member_id || selectedCustomer.member_id}
                      onChange={(e) =>
                        setEditCustomer((prev) => ({
                          ...prev,
                          member_id: e.target.value,
                        }))
                      }
                      className="modal-input"
                    />
                  </div>
                  <div className="modal-section">
                    <label>Name:</label>
                    <input
                      type="text"
                      value={editCustomer.member_name}
                      onChange={(e) =>
                        setEditCustomer((prev) => ({
                          ...prev,
                          member_name: e.target.value,
                        }))
                      }
                      className="modal-input"
                    />
                  </div>
                  <div className="modal-section">
                    <label>Email:</label>
                    <input
                      type="email"
                      value={editCustomer.user_email}
                      onChange={(e) =>
                        setEditCustomer((prev) => ({
                          ...prev,
                          user_email: e.target.value,
                        }))
                      }
                      className="modal-input"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="modal-section">
                    <label>Phone:</label>
                    <input
                      type="text"
                      value={editCustomer.member_phone_number}
                      onChange={(e) =>
                        setEditCustomer((prev) => ({
                          ...prev,
                          member_phone_number: e.target.value,
                        }))
                      }
                      className="modal-input"
                    />
                  </div>
                  <div className="modal-section">
                    <label>Gender:</label>
                    <select
                      value={editCustomer.member_gender}
                      onChange={(e) =>
                        setEditCustomer((prev) => ({
                          ...prev,
                          member_gender: e.target.value,
                        }))
                      }
                      className="modal-input"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div className="modal-actions">
                    <button onClick={handleSaveEdit} className="save-button">
                      Save
                    </button>
                    <button
                      onClick={() => {
                        closeEditModal();
                        setEditCustomer({
                          member_card_id: null,
                          member_name: "",
                          member_phone_number: "",
                          member_gender: "Male",
                        });
                      }}
                      className="cancel-button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Card Modal */}
          {isAddCardModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content" role="dialog" aria-modal="true">
                <div className="modal-header">
                  <h2 className="modal-title">Add New Member Card</h2>
                  <button
                    onClick={() => setIsAddCardModalOpen(false)}
                    className="modal-close-button"
                    aria-label="Close modal"
                  >
                    <FaTimes className="modal-close-icon" />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="modal-section">
                    <label>Member ID (CCCD):</label>
                    <input
                      type="text"
                      value={newMemberCard.member_id}
                      onChange={(e) =>
                        setNewMemberCard((prev) => ({
                          ...prev,
                          member_id: e.target.value,
                        }))
                      }
                      className="modal-input"
                      placeholder="Enter 12-digit CCCD"
                      maxLength={12}
                    />
                  </div>
                  <div className="modal-section">
                    <label>Member Name:</label>
                    <input
                      type="text"
                      value={newMemberCard.member_name}
                      onChange={(e) =>
                        setNewMemberCard((prev) => ({
                          ...prev,
                          member_name: e.target.value,
                        }))
                      }
                      className="modal-input"
                      placeholder="Enter member name"
                    />
                  </div>
                  <div className="modal-section">
                    <label>Member Phone Number:</label>
                    <input
                      type="text"
                      value={newMemberCard.member_phone_number}
                      onChange={(e) =>
                        setNewMemberCard((prev) => ({
                          ...prev,
                          member_phone_number: e.target.value,
                        }))
                      }
                      className="modal-input"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="modal-section">
                    <label>Member Gender:</label>
                    <select
                      value={newMemberCard.member_gender}
                      onChange={(e) =>
                        setNewMemberCard((prev) => ({
                          ...prev,
                          member_gender: e.target.value,
                        }))
                      }
                      className="modal-input"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      {/* Thêm các lựa chọn khác nếu cần */}
                    </select>
                  </div>

                  <div className="modal-actions">
                    <button onClick={handleAddCard} className="save-button">
                      Submit
                    </button>
                    <button
                      onClick={() => {
                        setIsAddCardModalOpen(false);
                        setNewMemberCard({
                          member_id: "",
                          member_name: "",
                          member_phone_number: "",
                          member_gender: "Male",
                        });
                      }}
                      className="cancel-button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
