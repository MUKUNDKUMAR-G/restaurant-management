import React, { useState } from "react";
import { toast } from "react-toastify";
import { http } from "../../../helpers/http";

const QR_CODE_IMAGE = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAY-TO-RESTAURANT";

const PaymentStep = ({ setStep, cart, clearCart, shippingData }) => {
  const [paymentMethod, setPaymentMethod] = useState("qr");
  const [qrScreenshot, setQrScreenshot] = useState(null);
  const [tid, setTid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    setQrScreenshot(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (paymentMethod === "qr" && (!qrScreenshot || !tid.trim())) {
      toast.error("Please upload QR code screenshot and enter TID.");
      return;
    }
    setIsSubmitting(true);
    try {
      // Prepare order data
      const orderData = {
        cus_name: shippingData.name,
        phone_number: shippingData.phone,
        address: `${shippingData.address}, ${shippingData.ward}, ${shippingData.district}, ${shippingData.province}`,
        notes: paymentMethod === "qr" ? `Paid via QR. TID: ${tid}` : "Cash on delivery",
        listDish: cart.map((item) => ({
          dish_id: item.id,
          dish_name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        payment_method: paymentMethod,
      };
      // If QR, upload screenshot (simulate, as backend may not support file upload)
      // In real app, use FormData and backend endpoint for file upload
      // For now, just submit order
      const res = await http("/order/submit-online/1", "POST", orderData);
      if (res.status === 201) {
        toast.success("Order placed successfully!");
        clearCart();
        setStep(1); // Go back to cart or redirect as needed
      } else {
        toast.error("Order failed. Please try again.");
      }
    } catch (err) {
      toast.error("Order failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-form">
      <h2 className="section-title">Payment</h2>
      <form onSubmit={handleSubmit}>
        <div className="payment-method-section">
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="qr"
              checked={paymentMethod === "qr"}
              onChange={() => setPaymentMethod("qr")}
            />
            Pay via QR Code
          </label>
          <label style={{ marginLeft: 20 }}>
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={() => setPaymentMethod("cod")}
            />
            Cash on Delivery
          </label>
        </div>
        {paymentMethod === "qr" && (
          <div style={{ marginTop: 20 }}>
            <div style={{ marginBottom: 10 }}>
              <img src={QR_CODE_IMAGE} alt="QR Code" style={{ width: 200, height: 200 }} />
            </div>
            <div className="form-group-checkout">
              <label>Upload QR Payment Screenshot</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
            <div className="form-group-checkout">
              <label>Transaction ID (TID)</label>
              <input type="text" value={tid} onChange={e => setTid(e.target.value)} />
            </div>
          </div>
        )}
        <div className="checkout-actions">
          <button type="button" className="back-button" onClick={() => setStep(2)}>
            Back to Shipping
          </button>
          <button type="submit" className="place-order-button" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Submit Payment & Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentStep; 