import React, { useState, useEffect } from "react";
import {
  FiShoppingCart,
  FiSearch,
  FiMinus,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { IoIosCloseCircle } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import "./OrderPage.css";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { http } from "../../../helpers/http";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export const OrderPage = () => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [discount, setDiscount] = useState(0);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
  });
  const [quantities, setQuantities] = useState({});

  // thong tin sau nay se lay param hay url
  const [customerName, setCustomerName] = useState("dn quoc dat"); // Tên khách hàng
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Số mục hiển thị mỗi trang
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const location = useLocation();
  const { reservationId } = location.state || {};

  const [menuCategories, setMenuCategories] = useState([]);
  useEffect(() => {
    fetchMenu();
  }, []);

  useEffect(() => {
    fetchMenu(currentPage, itemsPerPage, "price,asc", searchQuery);
  }, [currentPage, searchQuery]);

  const fetchMenu = async (
    page = 1,
    limit = itemsPerPage,
    sort = "price,asc",
    query = ""
  ) => {
    try {
      const branchId = localStorage.getItem("staff_branch");
      if (!branchId) throw new Error("Branch ID not found in localStorage");

      const params = new URLSearchParams({
        limit,
        sort,
        page,
        query, // Truyền query trực tiếp vào API
      });

      const response = await http(
        `/menu/${branchId}?${params.toString()}`,
        "GET"
      );
      const data = response.data;

      if (data) {
        setMenuCategories(data.listDish);
        setPagination({
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
        });
      } else {
        throw new Error("No data received from API");
      }
    } catch (error) {
      console.error("Error fetching menu:", error);
    }
  };

  const updateItemQuantity = (itemId, change) => {
    setQuantities((prev) => {
      const currentQuantity = prev[itemId] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);
      return { ...prev, [itemId]: newQuantity };
    });
  };

  const addToCart = (item) => {
    const quantity = quantities[item.dish_id] || 1;
    const existingItem = cart.find(
      (cartItem) => cartItem.dish_id === item.dish_id
    );
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.dish_id === item.dish_id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...item,
          quantity,
          name: item.dish_name, // Thêm thuộc tính name
          image: item.image_link, // Thêm thuộc tính image
        },
      ]);
    }
    setQuantities((prev) => ({ ...prev, [item.dish_id]: 0 }));
    showNotification(`${item.dish_name} added to cart`);
  };

  const showNotification = (message) => {
    setNotification({ show: true, message });
    setTimeout(() => setNotification({ show: false, message: "" }), 2000);
  };

  const updateQuantity = (itemId, change) => {
    setCart(
      cart.map((item) => {
        if (item.dish_id === itemId) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      })
    );
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((item) => item.dish_id !== itemId));
  };

  const getTotalAmount = () => {
    const subtotal = cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const discountAmount = subtotal * (discount / 100);
    return subtotal - discountAmount;
  };

  const handleCheckout = async () => {
    const branchId = localStorage.getItem("staff_branch");
    const body = {
      cus_name: customerName,
      member_card_id: memberId || null,
      branch_id: branchId,
      listDish: cart.map((item) => ({
        dish_id: item.dish_id,
        quantity: item.quantity,
        price: item.price,
      })),
    };
    console.log(body);
    try {
      const response = await http(
        `/order/submit-dine-in/${reservationId}`,
        "POST",
        body
      );

      if (response) {
        showNotification("Order submitted successfully!");
        setCart([]);
        navigate("/staff/reservation-list");
      } else {
        showNotification("Failed to submit the order.");
      }
    } catch (error) {
      showNotification("Error submitting the order.");
    }
  };

  return (
    <div className="container-order">
      <div className="content">
        {/* Header */}
        <div className="header">
          <h1 className="title">Food Menu</h1>
          <div className="header-controls">
            <div className="search-box">
              <FiSearch className="search-icon-order" />
              <input
                type="text"
                placeholder="Search menu..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <button className="cart-button" onClick={() => setIsCartOpen(true)}>
              <FiShoppingCart size={24} />
              {cart.length > 0 && (
                <span className="cart-count">{cart.length}</span>
              )}
            </button>
          </div>
        </div>

        {/* Menu Categories */}
        <div className="menu-grid">
          <div className="items-grid">
            {menuCategories.map((item) => (
              <motion.div
                key={item.dish_id}
                className="menu-item"
                whileHover={{ scale: 1.02 }}
              >
                <img
                  src={item.image_link}
                  alt={item.dish_name}
                  className="item-image"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
                  }}
                />
                <div className="item-details">
                  <div>
                    <h3 className="item-name">{item.dish_name}</h3>
                    <p className="item-description">{item.description}</p>
                  </div>
                  <div className="item-footer">
                    <span className="item-price">₹{item.price}</span>
                    <div className="item-actions">
                      <div className="quantity-controls">
                        <button
                          onClick={() => updateItemQuantity(item.dish_id, -1)}
                          className="quantity-button"
                          disabled={!quantities[item.dish_id]}
                        >
                          <FiMinus size={16} />
                        </button>
                        <span className="quantity-display">
                          {quantities[item.dish_id] || 0}
                        </span>
                        <button
                          onClick={() => updateItemQuantity(item.dish_id, 1)}
                          className="quantity-button"
                        >
                          <FiPlus size={16} />
                        </button>
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        className="add-to-cart-button"
                        disabled={!quantities[item.dish_id]}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cart Sidebar */}
        <AnimatePresence>
          {isCartOpen && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="cart-sidebar"
            >
              <div className="cart-content">
                <div className="cart-header">
                  <h2 className="cart-title">Your Cart</h2>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="close-cart-button"
                  >
                    <IoIosCloseCircle />
                  </button>
                </div>

                <div className="cart-items">
                  {cart.length === 0 ? (
                    <p className="empty-cart-message">Your cart is empty</p>
                  ) : (
                    <div className="cart-item-list">
                      {cart.map((item) => (
                        <div key={item.dish_id} className="cart-item">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="cart-item-image"
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
                            }}
                          />
                          <div className="cart-item-details">
                            <h3 className="cart-item-name">{item.name}</h3>
                            <p className="cart-item-price">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                            <div className="cart-item-actions">
                              <button
                                onClick={() => updateQuantity(item.dish_id, -1)}
                                className="cart-quantity-button"
                              >
                                <FiMinus size={16} />
                              </button>
                              <span className="cart-quantity-display">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.dish_id, 1)}
                                className="cart-quantity-button"
                              >
                                <FiPlus size={16} />
                              </button>
                              <button
                                onClick={() => removeFromCart(item.dish_id)}
                                className="remove-item-button"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Member ID Search for Discount */}
                <div className="discount-section">
                  <label htmlFor="memberId" className="discount-label">
                    Enter Member ID for Discount:
                  </label>
                  <input
                    type="text"
                    id="memberId"
                    className="discount-input"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    placeholder="Enter Member ID"
                  />
                  {/* <button
                    onClick={toast.success(`go!`, {
                      position: "top-right",
                      autoClose: 1500,
                    })}
                    className="apply-discount-button"
                  >
                    Apply
                  </button> */}
                </div>

                <div className="cart-footer">
                  {/* Tổng giá ban đầu */}
                  <div className="cart-total">
                    <p className="total-label">Subtotal:</p>
                    <p className="total-value">
                      ₹{cart
                        .reduce(
                          (total, item) => total + item.price * item.quantity,
                          0
                        )
                        .toFixed(2)}
                    </p>
                  </div>

                  {/* Hiển thị mức giảm giá nếu có */}
                  {discount > 0 && (
                    <div className="cart-discount">
                      <p className="total-label">Discount ({discount}%):</p>
                      <p className="total-value">
                        -₹{(
                          cart.reduce(
                            (total, item) => total + item.price * item.quantity,
                            0
                          ) *
                          (discount / 100)
                        ).toFixed(2)}
                      </p>
                    </div>
                  )}

                  {/* Tổng giá sau giảm */}
                  <div className="cart-total-final">
                    <p className="total-label">Total:</p>
                    <p className="total-value">
                      ₹{getTotalAmount().toFixed(2)}
                    </p>
                  </div>

                  {/* Nút Thanh Toán */}
                  <button
                    className="checkout-button"
                    disabled={cart.length === 0}
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

        {/* Notification */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="notification"
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
