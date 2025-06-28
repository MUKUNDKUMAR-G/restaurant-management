import React, { useState, useEffect } from "react";
import {
  FaFileInvoice,
  FaDesktop,
  FaGlobe,
  FaTimes,
  FaSearch,
} from "react-icons/fa";
import "./BillPage.css";
import { http } from "../../../helpers/http";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { format } from "date-fns";

export const BillPage = () => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);

  const [bills, setBills] = useState([]);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  const branchId = localStorage.getItem("staff_branch");
  if (!branchId) {
    return <div className="error-message">Branch ID not found. Please log in again.</div>;
  }

  useEffect(() => {
    fetchBill();
  }, []);

  useEffect(() => {
    fetchBill(currentPage, 5, searchQuery);
  }, [currentPage, searchQuery, activeTab]);

  const fetchBill = async (page = 1, limit = 5, query = "") => {
    const category = activeTab === "online" ? "delivery" : "dine-in";
    try {
      const params = new URLSearchParams({
        limit,
        page,
        query,
        category,
        branch_id: branchId,
      });

      const response = await http(`/order/bill?${params.toString()}`, "GET");

      const data = response.data;
      if (data) {
        setBills(data.bills);
        setPagination({
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
        });
      } else {
        throw new Error("No data received from API");
      }
    } catch (error) {
      console.error("Error fetching dishes:", error);
    }
  };

  const handleViewDetails = (invoice) => {
    fetchBillDetails(invoice.bill_id);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    fetchBill(1, 5, searchQuery);
  };

  const fetchBillDetails = async (billID) => {
    try {
      const response = await http(`/bill/${billID}`, "GET");
      if (response) {
        setSelectedInvoice(response.data);
        setIsModalOpen(true);
      } else {
        throw new Error("No data received for bill details.");
      }
    } catch (error) {
      console.error("Error fetching bill details:", error);
    }
  };

  return (
    <div className="invoice-list-container">
      <div className="invoice-list-wrapper">
        <h1 className="invoice-title">Invoices</h1>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === "table" ? "active" : ""}`}
            onClick={() => {
              handleTabChange("table");
            }}
          >
            Invoice Table
          </button>
          <button
            className={`tab-button ${activeTab === "online" ? "active" : ""}`}
            onClick={() => {
              handleTabChange("online");
            }}
          >
            Online Invoices
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by Invoice ID"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Invoice Table */}
        <div className="table-container">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Order ID</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.length > 0 ? (
                bills.map((invoice) => (
                  <tr key={invoice.bill_id}>
                    <td>{invoice.bill_id}</td>
                    <td>{invoice.order_id}</td>
                    <td>
                      {format(new Date(invoice.created_at), "dd/MM/yyyy HH:mm")}
                    </td>
                    <td>₹{invoice.total_amount}</td>
                    <td>
                      <button
                        onClick={() => handleViewDetails(invoice)}
                        className="view-details-button"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No invoices found for the current tab.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

        {/* Modal */}
        {isModalOpen && selectedInvoice && (
          <div className="modal-overlay">
            <div className="modal-content" role="dialog" aria-modal="true">
              <div className="modal-header">
                <h2 className="modal-title">
                  Invoice Details - {selectedInvoice.bill_id}
                </h2>
                <button
                  onClick={closeModal}
                  className="modal-close-button"
                  aria-label="Close modal"
                >
                  <FaTimes className="modal-close-icon" />
                </button>
              </div>

              <div className="modal-body">
                <div className="modal-section">
                  <span className="modal-label">Customer</span>
                  {/* <span className="modal-value">
                    {selectedInvoice.customerName}
                  </span> */}
                </div>

                <div className="modal-items">
                  <h3 className="modal-subtitle">Items:</h3>
                  {selectedInvoice.dishes.map((item, index) => (
                    <div key={index} className="modal-item">
                      <div className="modal-item-details">
                        <p className="item-name">{item.dish_name}</p>
                        <p className="item-quantity">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="item-price">₹{item.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="modal-total">
                  <span className="total-label">Total:</span>
                  <span className="total-amount">
                    ₹
                    {selectedInvoice.dishes
                      .reduce(
                        (total, dish) => total + dish.price * dish.quantity,
                        0
                      )
                      .toFixed(2)}
                  </span>
                </div>

                {/* Add Discount and Final Amount */}
                {/* <div className="modal-discount">
                  <span className="discount-label">Discount Applied:</span>
                  <span className="discount-amount">
                    {selectedInvoice.discount * 100}% (
                    {(
                      selectedInvoice.amount * selectedInvoice.discount
                    ).toFixed(2)}
                    )
                  </span>
                </div> */}

                <div className="modal-final">
                  <span className="final-label">Final Amount:</span>
                  <span className="final-amount">
                    ₹
                    {selectedInvoice.dishes
                      .reduce(
                        (total, dish) => total + dish.price * dish.quantity,
                        0
                      )
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
