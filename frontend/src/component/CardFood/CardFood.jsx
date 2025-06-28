import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MdAddShoppingCart } from "react-icons/md";
import "./CardFood.css";
import { CartContext } from "../CardContext/CardContext";

export const CardFood = ({ dish, viewMode = "grid" }) => {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const handleAddCart = (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");

    if (!token) {
      toast.warning("Please log in to add items to the cart.", {
        position: "top-right",
        autoClose: 2000,
      });
      navigate("/login");
      return;
    }

    addToCart(dish);
    toast.success(`${dish.name} added to cart!`, {
      position: "top-right",
      autoClose: 1500,
    });
  };

  return (
    <div 
      className={`dish-card ${viewMode}`} 
      onClick={() => navigate(`/detail/${dish.id}`)}
    >
      <div className="dish-image-container">
        <img
          src={dish.image}
          alt={dish.name}
          className="dish-image"
          loading="lazy"
        />
        {viewMode === "grid" && (
          <div className="dish-category-tag">
            {dish.category}
          </div>
        )}
      </div>
      <div className="dish-details">
        <div className="dish-info">
          <h3 className="dish-name">{dish.name}</h3>
          {viewMode === "list" && (
            <span className="dish-category">{dish.category}</span>
          )}
          <p className="dish-description">{dish.description}</p>
        </div>
        <div className="dish-footer">
          <span className="dish-price">₹{dish.price}</span>
          <button 
            className="order-button" 
            onClick={handleAddCart}
            aria-label={`Add ${dish.name} to cart`}
          >
            <MdAddShoppingCart className="cart-icon" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
