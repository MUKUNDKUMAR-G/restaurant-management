import React, { useState, useEffect } from "react";
import {
  FaSort,
  FaSpinner,
  FaExclamationTriangle,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import { AiOutlineSearch } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import "./ListReservationPage.css";
import { toast } from "react-toastify";
import { http } from "../../../helpers/http";
export const ListReservationPage = () => {
  // State variables
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const [filters, setFilters] = useState({
    query: "",
    page: 1,
    limit: 10,
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    hasMore: false,
  });

  const branchId = localStorage.getItem("staff_branch");
  if (!branchId) {
    return <div className="error-message">Branch ID not found. Please log in again.</div>;
  }

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await http(
        `/reservation/branch/${branchId}?page=${filters.page}&limit=${filters.limit}&query=${filters.query}`,
        "GET"
      );

      setReservations(response.data.reservationSlips);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError("Failed to load reservations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle sorting logic

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        query: searchTerm,
        page: 1, // Reset về trang đầu khi tìm kiếm mới
      }));
    }, 500); // Độ trễ 500ms

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handlePreviousPage = () => {
    setFilters((prev) => ({
      ...prev,
      page: Math.max(prev.page - 1, 1),
    }));
  };

  const handleNextPage = () => {
    setFilters((prev) => ({
      ...prev,
      page: Math.min(prev.page + 1, pagination.totalPages),
    }));
  };

  const handleStatusClick = (e, id) => {
    e.stopPropagation();
    const reservation = reservations.find(
      (res) => res.reservation_slip_id === id
    );
    if (reservation.status === "waiting_for_guest") {
      const confirmChange = window.confirm(
        `Are you sure you want to confirm reservation RES${reservation.reservation_slip_id}?`
      );
      if (confirmChange) {
        updateReservationStatus(reservation.reservation_slip_id, "Confirmed");
      }
    }
  };

  const handleRowClick = (id, status) => {
    if (status === "waiting_for_guest" || status === "completed") {
      toast.warning(`Table in use to add dish`, {
        position: "top-right",
        autoClose: 1500,
      });
      return;
    }
    navigate("/staff/order", { state: { reservationId: id } });
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-container" role="status">
        <FaSpinner className="loading-icon" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="error-container" role="alert">
        <FaExclamationTriangle className="error-icon" />
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  const deleteReservation = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/reservation/${id}`,
        {
          method: "DELETE",
          headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete reservation");
      }
      // Gọi lại API để cập nhật danh sách sau khi xóa
      setFilters((prev) => ({
        ...prev,
        // Giữ lại các filter hiện tại, có thể thêm reset page nếu cần
      }));
      toast.success(`Reservation ${id} has been deleted successfully.`, {
        position: "top-right",
        autoClose: 1500,
      });
    } catch (error) {
      console.error("Error deleting reservation:", error);
      alert("Failed to delete the reservation. Please try again.");
    }
  };

  const updateReservationStatus = async (id, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/reservation/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update reservation status");
      }

      // Gọi lại API để cập nhật danh sách sau khi thay đổi
      setFilters((prev) => ({
        ...prev,
        // Giữ lại các filter hiện tại
      }));

      toast.success(`Reservation ${id} has been updated to ${newStatus}.`, {
        position: "top-right",
        autoClose: 1500,
      });
    } catch (error) {
      console.error("Error updating reservation status:", error);
      alert("Failed to update reservation status. Please try again.");
    }
  };

  return (
    <div className="reservation-container">
      <h1 className="reservation-title">Reservations</h1>

      {/* Search Bar */}
      <div className="search-bar-rs">
        <input
          type="text"
          placeholder="Search by Reservation Code or ID..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
          aria-label="Search Reservations"
        />
        <AiOutlineSearch className="search-icon-rs" />
      </div>
      {/* Reservations Table */}
      <div className="table-wrapper">
        <table className="reservation-table">
          <thead>
            <tr>
              {[
                { field: "code", label: "Reservation Code" },
                { field: "date", label: "Date" },
                { field: "time", label: "Time" }, // New Time column
                { field: "tableNumber", label: "Table Number" }, // New Table Number column
                { field: "customerName", label: "Customer Name" },
                { field: "guestCount", label: "Guests" },
                { field: "status", label: "Status" },
                { field: "action", label: "Action" },
              ].map(({ field, label }) => (
                <th key={field}>
                  <button
                    className="sort-button"
                    aria-label={`Sort by ${label}`}
                  >
                    {label}
                    {/* <FaSort
                      className={`sort-icon ${
                        sortField === field
                          ? `active-sort ${sortDirection}`
                          : ""
                      }`}
                    /> */}
                  </button>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {reservations.length > 0 ? (
              reservations.map((reservation) => (
                <tr
                  key={reservation.reservation_slip_id}
                  className="reservation-row"
                  onClick={() =>
                    handleRowClick(
                      reservation.reservation_slip_id,
                      reservation.status
                    )
                  }
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleRowClick(
                        reservation.reservation_slip_id,
                        reservation.status
                      );
                    }
                  }}
                  aria-label={`View details for reservation ${reservation.reservation_slip_id}`}
                >
                  <td>
                    <span className="code-badge">
                      RES{reservation.reservation_slip_id}
                    </span>
                  </td>
                  <td>
                    {new Date(reservation.arrival_date).toLocaleDateString()}
                  </td>
                  <td>{reservation.arrival_time}</td>
                  <td>{reservation.table_number}</td>
                  <td>
                    <div>{reservation.cus_name}</div>
                  </td>
                  <td>{reservation.guests_number}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        reservation.status === "waiting_for_guest"
                          ? "status-waiting"
                          : reservation.status === "table_in_use"
                          ? "status-in-use"
                          : reservation.status === "completed"
                          ? "status-completed"
                          : "status-canceled"
                      } ${
                        reservation.status === "waiting_for_guest"
                          ? "clickable-status"
                          : ""
                      }`}
                      onClick={(e) => {
                        if (reservation.status === "waiting_for_guest") {
                          handleStatusClick(e, reservation.reservation_slip_id);
                        }
                      }}
                      role={
                        reservation.status === "waiting_for_guest"
                          ? "button"
                          : "text"
                      }
                      tabIndex={
                        reservation.status === "waiting_for_guest" ? 0 : -1
                      }
                      onKeyPress={(e) => {
                        if (
                          e.key === "Enter" &&
                          reservation.status === "waiting_for_guest"
                        ) {
                          handleStatusClick(e, reservation.reservation_slip_id);
                        }
                      }}
                      aria-label={
                        reservation.status === "waiting_for_guest"
                          ? `Click để xác nhận hoặc hủy reservation ${reservation.reservation_slip_id}`
                          : ""
                      }
                    >
                      {reservation.status.replaceAll("_", " ")}
                    </span>
                  </td>
                  {/* Action */}
                  <td>
                    {reservation.status === "waiting_for_guest" && (
                      <>
                        <button
                          className="confirm-res-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const confirmAction = window.confirm(
                              `Confirm table-in-use for reservation RES${reservation.reservation_slip_id}?`
                            );
                            if (confirmAction) {
                              updateReservationStatus(
                                reservation.reservation_slip_id,
                                "table_in_use"
                              );
                            }
                          }}
                        >
                          Confirm
                        </button>
                        <button
                          className="cancel-res-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const cancelAction = window.confirm(
                              `Cancel reservation RES${reservation.reservation_slip_id}?`
                            );
                            if (cancelAction) {
                              deleteReservation(
                                reservation.reservation_slip_id
                              );
                            }
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-results">
                  No reservations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="pagination">
        <button
          onClick={handlePreviousPage}
          disabled={pagination.currentPage === 1}
          className="pagination-button"
          aria-label="Previous page"
        >
          <FaArrowLeft className="pagination-icon" />
        </button>
        <span className="pagination-info">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={pagination.currentPage === pagination.totalPages}
          className="pagination-button"
          aria-label="Next page"
        >
          <FaArrowRight className="pagination-icon" />
        </button>
      </div>
    </div>
  );
};
