import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaStar, FaTimes } from "react-icons/fa";
import { BsFillChatSquareTextFill } from "react-icons/bs";
import "./OrderDetailPage.css";
import { toast } from "react-toastify";
import { http } from "../../../helpers/http"; // Import http helper

export const OrderDetailPage = () => {
  const { id } = useParams(); // Get id from URL to match route parameter
  console.log("OrderDetailPage component mounted. Order ID from URL:", id);
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);

  useEffect(() => {
    console.log("useEffect for id triggered. Current id:", id);
    const fetchOrderDetails = async () => {
      console.log("fetchOrderDetails function invoked for id:", id);
      try {
        setIsLoading(true);
        setError(null);
        console.log("Attempting HTTP request for order details...");
        const response = await http(`/order/${id}`, "GET");
        console.log("HTTP response status:", response.status);
        console.log("HTTP response data:", response.data);

        if (response.status === 200 && response.data) {
          setOrder(response.data);
          console.log("Fetched order data:", response.data);
          console.log("Dishes in order:", response.data.dishes);
        } else {
          console.error("Response not OK or data missing:", response);
          throw new Error(response.message || "Failed to fetch order details.");
        }
      } catch (err) {
        console.error("Error fetching order details in catch block:", err);
        setError("Failed to load order details. Please try again.");
        toast.error("Failed to load order details.", {
          position: "top-right",
          autoClose: 3000,
        });
      } finally {
        console.log("Setting isLoading to false");
        setIsLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const calculateTotal = () => {
    if (!order || !order.dishes) return 0;
    return order.dishes.reduce(
      (total, dish) => total + dish.price * dish.quantity,
      0
    );
  };

  const handleReviewClick = (dish) => {
    setSelectedDish(dish);
    setIsModalOpen(true);
  };

  const handleBack = () => {
    navigate("/activity-history");
  };

  const ReviewModal = ({ dish, onClose }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [review, setReview] = useState("");

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!rating || !review.trim()) {
        alert("Please fill in both rating and comment.");
        return;
      }
      const body = {
        rating: rating.toString(),
        comment: review,
      };
      console.log(body);
      try {
        const response = await http(`dish/${dish.id}/review`, "POST", body);

        if (response.status === 200) {
          toast.success(`Review submitted successfully!`, {
            position: "top-right",
            autoClose: 1500,
          });

          onClose();
        } else {
          throw new Error(response.message || "Failed to submit review");
        }
      } catch (error) {
        console.error("Error submitting review:", error.message);
        toast.error("Failed to submit review.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };

    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <h3>Review {dish.name}</h3>
            <button
              onClick={onClose}
              className="close-button"
              aria-label="Close"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="rating">
              {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                  <button
                    type="button"
                    key={ratingValue}
                    className={`star ${
                      ratingValue <= (hover || rating) ? "active" : ""
                    }`}
                    onClick={() => setRating(ratingValue)}
                    onMouseEnter={() => setHover(ratingValue)}
                    onMouseLeave={() => setHover(rating)}
                    aria-label={`Rate ${ratingValue} stars`}
                  >
                    <FaStar />
                  </button>
                );
              })}
            </div>

            <textarea
              className="review-text"
              rows="4"
              placeholder="Write your review here..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              required
            ></textarea>

            <button type="submit" className="submit-button">
              Submit Review
            </button>
          </form>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="invoice-container">Loading order details...</div>;
  }

  if (error) {
    return <div className="invoice-container" style={{ color: 'red' }}>{error}</div>;
  }

  if (!order) {
    return <div className="invoice-container">Order not found.</div>;
  }

  return (
    <div className="invoice-container">
      <div className="invoice-card">
        <div className="invoice-header">
          <h1>Order Invoice #{order.order_id}</h1>
          <button onClick={handleBack} className="back-button">
            &#8592; Back to Orders
          </button>
        </div>

        <div className="invoice-content">
          <div className="invoice-items">
            {order.dishes.map((dish, idx) => (
              <div key={dish.dish_id ? dish.dish_id : idx} className="dish-item">
                <img
                  src={dish.image_link || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} // Fallback image
                  alt={dish.dish_name}
                  className="dish-image"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
                  }}
                />

                <div className="dish-info">
                  <h3>{dish.dish_name}</h3>
                  <p>{dish.description || 'No description available.'}</p>
                  <div className="dish-details">
                    <div className="dish-pricing">
                      <p>Price: ₹{parseFloat(dish.price).toFixed(2)}</p>
                      <p>Quantity: {dish.quantity}</p>
                      <p>
                        Subtotal: ₹{(parseFloat(dish.price) * dish.quantity).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleReviewClick(dish)}
                      className="review-button"
                    >
                      <BsFillChatSquareTextFill />
                      Review
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="invoice-summary">
            <h2>
              Total Amount <span>₹{parseFloat(order.total_amount_with_benefits).toFixed(2)}</span>
            </h2>
          </div>
        </div>

        {isModalOpen && (
          <ReviewModal dish={selectedDish} onClose={() => setIsModalOpen(false)} />
        )}
      </div>
    </div>
  );
};
