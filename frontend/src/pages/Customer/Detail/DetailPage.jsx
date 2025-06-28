import React, { useState, useContext } from "react";
import { FiMinus, FiPlus, FiShoppingCart } from "react-icons/fi";
import { IoMdStar, IoMdStarHalf } from "react-icons/io";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "./DetailPage.css";
import { CardFood } from "../../../component/CardFood/CardFood";
import { CartContext } from "../../../component/CardContext/CardContext";
import { useEffect } from "react";
import { http } from "../../../helpers/http";
import { useParams } from "react-router-dom";
// import { set } from "react-datepicker/dist/date_utils";

const DishDetail = () => {
  const { addToCart } = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dish, setDish] = useState({
    name: "",
    price: 0,
    description: "",
    image: "",
    stock: 0,
  });
  const { id } = useParams();
  useEffect(() => {
    GetDishDetail();
  }, []);
  const GetDishDetail = async () => {
    try {
      const response = await http(`/dish/${id}`, "GET");
      const data = {
        name: response.data.dish_name,
        price: response.data.price,
        description: response.data.description,
        image: response.data.image_link,
      };
      setDish(data);
    } catch (err) {
      console.log(err);
    }
  };

  // const dish = {
  //   name: "Grilled Salmon with Asparagus",
  //   price: 24.99,
  //   description:
  //     "Fresh Atlantic salmon fillet grilled to perfection, served with sautéed asparagus and lemon butter sauce.",
  //   image:
  //     "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800",
  //   stock: 20,
  // };

  const reviews = [
    {
      id: 1,
      user: "John Doe",
      rating: 5,
      comment: "Absolutely delicious! The salmon was cooked perfectly.",
      date: "2024-01-15",
    },
    {
      id: 2,
      user: "Sarah Smith",
      rating: 4.5,
      comment: "Great flavor combination. Will order again!",
      date: "2024-01-14",
    },
  ];

  const relatedDishes = [
    {
      id: 1,
      name: "Grilled Tuna Steak",
      price: 22.99,
      image:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800",
    },
    {
      id: 2,
      name: "Seafood Pasta",
      price: 19.99,
      image:
        "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800",
    },
  ];

  const handleQuantityChange = (action) => {
    if (action === "increase" && quantity < dish.stock) {
      setQuantity((prev) => prev + 1);
      setError("");
    } else if (action === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
      setError("");
    } else if (quantity >= dish.stock) {
      setError("Maximum stock limit reached");
    }
  };

  const handleAddToCart = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      dish.quantity = quantity;
      addToCart(dish);
      toast.success(`${dish.name} added to cart!`, {
        position: "top-right",
        autoClose: 1500,
      });

      console.log(`Added ${quantity} ${dish.name} to cart`);
    }, 500);
  };

  return (
    <div className="dish-detail-container">
      <div className="dish-detail-grid">
        <div className="dish-image-container">
          <img
            src={dish.image}
            alt={dish.name}
            style={{ height: "400px" }}
            className="dish-image"
          />
        </div>

        <div className="dish-info">
          <h1 className="dish-name">{dish.name}</h1>
          <p className="dish-price">₹{dish.price.toFixed(2)}</p>
          <p className="dish-description">{dish.description}</p>

          <div className="quantity-selector">
            <button
              onClick={() => handleQuantityChange("decrease")}
              className="quantity-button"
              aria-label="Decrease quantity"
            >
              <FiMinus />
            </button>
            <span className="quantity">{quantity}</span>
            <button
              onClick={() => handleQuantityChange("increase")}
              className="quantity-button"
              aria-label="Increase quantity"
            >
              <FiPlus />
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="error-message"
            >
              {error}
            </motion.p>
          )}

          <div className="action-buttons">
            <button
              onClick={handleAddToCart}
              disabled={loading}
              className="add-to-cart-button"
            >
              {loading ? (
                <div className="spinner" />
              ) : (
                <>
                  <FiShoppingCart
                    style={{ fontSize: "20px" }}
                    className="cart-icon"
                  />
                  <span style={{ width: "max-content" }}>Add to Cart</span>
                </>
              )}
            </button>
            <button className="checkout-button">Checkout</button>
          </div>
        </div>
      </div>

      <div className="reviews-section">
        <h2 className="section-title">Reviews</h2>
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <h3 className="review-user">{review.user}</h3>
                <div className="review-rating">
                  {[...Array(Math.floor(review.rating))].map((_, i) => (
                    <IoMdStar key={i} className="star-icon" />
                  ))}
                  {review.rating % 1 !== 0 && (
                    <IoMdStarHalf className="star-icon" />
                  )}
                </div>
              </div>
              <p className="review-comment">{review.comment}</p>
              <p className="review-date">{review.date}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="related-dishes-section">
        <h2 className="section-title">Related Dishes</h2>
        <div className="related-dishes-container">
          <button className="carousel-button prev-button" aria-label="Previous">
            <BsArrowLeft />
          </button>
          <div className="related-dishes-list">
            {relatedDishes.map((dish) => (
              <CardFood key={dish.id} dish={dish} />
            ))}
          </div>
          <button className="carousel-button next-button" aria-label="Next">
            <BsArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DishDetail;
