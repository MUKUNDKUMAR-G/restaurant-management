import React, { useContext, useState } from "react";
import { CartContext } from "../../../component/CardContext/CardContext";
import { CartItem } from "./CartItem";
import CheckoutForm from "./CheckoutForm";
import PaymentStep from "./PaymentStep";
import "./CartPage.css";
const CartPage = () => {
  const [input, setInput] = useState("");
  const [step, setStep] = useState(1);
  const { cart, removeFromCart, updateQuantity, calculateSubtotal, clearCart } =
    useContext(CartContext); // Sử dụng Context
  const [shippingData, setShippingData] = useState(null);
  return (
    <div>
      {step == 1 ? (
        <div className="shopping-cart">
          <h2 className="section-title">Shopping Cart</h2>
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => (
                  <CartItem
                    item={item}
                    updateQuantity={updateQuantity}
                    removeFromCart={removeFromCart}
                    key={item.id}
                  />
                ))}
              </div>
              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>$0.00</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>${(calculateSubtotal()).toFixed(2)}</span>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="proceed-button"
                  disabled={cart.length === 0}
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      ) : step == 2 ? (
        <CheckoutForm setStep={setStep} cart={cart} clearCart={clearCart} setShippingData={setShippingData} />
      ) : (
        <PaymentStep setStep={setStep} cart={cart} clearCart={clearCart} shippingData={shippingData} />
      )}
    </div>
  );
};

export default CartPage;
