import React, { createContext, useState, useEffect } from "react";
import { FaDollarSign } from "react-icons/fa";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (dish) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === dish.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === dish.id
            ? {
                ...item,
                quantity:
                  item.quantity + ("quantity" in dish ? dish.quantity : 1),
              }
            : item
        );
      } else {
        return [
          ...prevCart,
          { ...dish, quantity: "quantity" in dish ? dish.quantity : 1 },
        ];
      }
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart"); // Xóa giỏ hàng trong localStorage
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        calculateSubtotal,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
