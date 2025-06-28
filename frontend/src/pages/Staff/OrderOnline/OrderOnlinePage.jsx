import React, { useState, useEffect } from "react";
import { AiOutlineSearch, AiOutlineEdit } from "react-icons/ai";
import { BiSortAlt2 } from "react-icons/bi";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./StatusModal.css";
import "./OrderOnlinePage.css";
import { http } from "../../../helpers/http";
import { toast } from "react-toastify";

export const OrderOnlinePage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("orderTime");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 6;

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  const [error, setError] = useState("");

  const branchId = localStorage.getItem("staff_branch");
  if (!branchId) {
    return <div className="error-message">Branch ID not found. Please log in again.</div>;
  }

  useEffect(() => {
    fetchOrder();
  }, [orders]);

  useEffect(() => {
    fetchOrder(currentPage, 5, searchQuery);
  }, [currentPage, searchQuery]);

  const fetchOrder = async (page = 1, limit = 5, query = "") => {
    try {
      setError("");
      const branchId = localStorage.getItem("staff_branch");
      if (!branchId) throw new Error("Branch ID not found in localStorage");

      const params = new URLSearchParams({
        limit,
        page,
        query,
      });

      const fetchMenu = await http(
        `/order/branch/${branchId}?${params.toString()}`,
        "GET"
      );

      const data = fetchMenu.data;
      if (data) {
        setOrders(data.orders);
        setPagination({
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
        });
      } else {
        setOrders([]);
        setError("No orders found for this branch.");
      }
    } catch (error) {
      console.error("Error fetching dishes:", error);
      setError("Failed to fetch orders. Please try again later.");
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await http(`/order/${orderId}`, "GET");
      if (response) {
        setSelectedOrder(response.data);
      } else {
        throw new Error("Failed to fetch order details.");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Failed to load order details.");
    }
  };

  const totalAmount = (selectedOrder?.dishes || []).reduce(
    (acc, dish) => acc + (dish.price || 0) * (dish.quantity || 0),
    0
  );

  useEffect(() => {}, [orders]);
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const fetchUpdateOrderStatus = await http(`/order/${orderId}`, "PATCH", {
        order_status: newStatus,
      });
      console.log(fetchUpdateOrderStatus);
      if (fetchUpdateOrderStatus) {
        toast.success(`Update status order online successfully!`, {
          position: "top-right",
          autoClose: 1500,
        });
      }
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === orderId
            ? { ...order, status: fetchUpdateOrderStatus.order_status }
            : order
        )
      );
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  };

  const StatusModal = ({ order, onClose }) => {
    const [newStatus, setNewStatus] = useState(order.status);

    return (
      <div className="modal-overlay">
        <div className="modal-content" role="dialog" aria-modal="true">
          <h2 className="modal-title">Update Order Status</h2>
          <div className="modal-details">
            <p>
              <span className="modal-label">Order ID:</span> {order.id}
            </p>
            <p>
              <span className="modal-label">Customer:</span>{" "}
              {order.customerName}
            </p>
            <p>
              <span className="modal-label">Total Amount:</span> ₹
              {order.totalAmount}
            </p>
          </div>
          <div className="modal-select">
            <label htmlFor="status">Select New Status:</label>
            <select
              id="status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="billed">Billed</option>
              <option value="in_delivery">In Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="modal-actions">
            <button onClick={onClose} className="modal-button cancel-button">
              Cancel
            </button>
            <button
              onClick={() => handleStatusUpdate(order.order_id, newStatus)}
              className="modal-button update-button"
            >
              Update Status
            </button>
          </div>
        </div>
      </div>
    );
  };

  const StatusBadge = ({ status }) => {
    const statusStyles = {
      billed: "badge-billed",
      "in-delivery": "badge-in-delivery",
      delivered: "badge-delivered",
      cancelled: "badge-cancelled",
    };

    return (
      <span className={`status-badge ${statusStyles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
      </span>
    );
  };

  return (
    <div className="order-management-container">
      <h1 className="order-management-title">Order Management</h1>

      <div className="order-management-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <AiOutlineSearch className="search-icon" />
        </div>
      </div>

      <div className="orders-table-container">
        {error && <div className="error-message">{error}</div>}
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer ID</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.order_id}>
                <td>{order.order_id}</td>
                <td>{order.online_user_id}</td>
                <td>₹{order.total}</td>
                <td>
                  <StatusBadge status={order.status} />
                </td>
                <td
                  style={{
                    display: "flex",
                    gap: "10px",
                    padding: "10px",
                    boxSizing: "border-box",
                  }}
                >
                  <button
                    onClick={() => {
                      fetchOrderDetails(order.order_id);
                      setIsModalOpen("details");
                    }}
                    className="details-button-orderonline"
                    style={{
                      color: "white",
                      padding: "0 10px",
                      borderRadius: "7px",
                      border: "none",
                      background: "#3182ce",
                    }}
                    aria-label="View order details"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsModalOpen(true);
                    }}
                    className="edit-button"
                    style={{ margin: 0 }}
                    aria-label="Edit order status"
                  >
                    <AiOutlineEdit />
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && !error && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No online orders found for this branch.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* pagination */}
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-button"
            aria-label="Previous page"
          >
            <FiChevronLeft className="pagination-icon" />
          </button>
          <span className="pagination-info">
            Page {currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, pagination.totalPages)
              )
            }
            disabled={currentPage === pagination.totalPages}
            className="pagination-button"
            aria-label="Next page"
          >
            <FiChevronRight className="pagination-icon" />
          </button>
        </div>
      </div>

      {isModalOpen && selectedOrder && (
        <StatusModal
          order={selectedOrder}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {isModalOpen === "details" && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content" role="dialog" aria-modal="true">
            <div className="modal-header">
              <h2 className="modal-title">
                Order Details - {selectedOrder.order_id}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedOrder(null);
                }}
                className="close-button"
                aria-label="Close modal"
              >
                x
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <span className="modal-label">Customer</span>
                <span className="modal-value">
                  {selectedOrder.online_user_id}
                </span>
              </div>

              <div className="modal-items">
                <h3 className="modal-subtitle">Items:</h3>
                {selectedOrder.dishes.map((dish, index) => (
                  <div key={index} className="modal-item">
                    <div className="item-info">
                      <h4 className="item-name">{dish.dish_name}</h4>
                      <p className="item-price">₹{dish.price.toFixed(2)}</p>
                      <p className="item-quantity">Quantity: {dish.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary">
                <div className="summary-item">
                  <span className="summary-label">Subtotal:</span>
                  <span className="summary-value">₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Amount:</span>
                  <span className="final-amount">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
