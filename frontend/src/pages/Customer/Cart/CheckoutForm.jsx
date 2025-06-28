import React, { useEffect, useState } from "react";
import { BsArrowRight, BsCreditCard } from "react-icons/bs";
import { FaShippingFast, FaMoneyBill } from "react-icons/fa";
import { http } from "../../../helpers/http";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
const CheckoutForm = ({ setStep, cart, clearCart, setShippingData }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    name: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    address: "",
  });
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [errors, setErrors] = useState({});
  // Fetch provinces (regions) from backend on mount
  useEffect(() => {
    http("/region", "GET")
      .then((response) => {
        // The backend returns { data: [ { region_id, region_name }, ... ] }
        setProvinces(response.data || []);
      })
      .catch((error) => {
        setProvinces([]);
        console.error("Error fetching regions:", error);
      });
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (formData.province) {
      const selectedRegion = provinces.find(
        (item) => item.region_name === formData.province
      );
      if (selectedRegion) {
        http(`/district?region_id=${selectedRegion.region_id}`, "GET")
          .then((response) => setDistricts(response.data || []))
          .catch(() => setDistricts([]));
      }
      setFormData((prev) => ({ ...prev, district: "", ward: "" }));
      setWards([]);
    } else {
      setDistricts([]);
      setWards([]);
      setFormData((prev) => ({ ...prev, district: "", ward: "" }));
    }
  }, [formData.province]);

  // Fetch wards when district changes
  useEffect(() => {
    if (formData.district) {
      const selectedDistrict = districts.find(
        (item) => item.district_name === formData.district
      );
      if (selectedDistrict) {
        http(`/ward?district_id=${selectedDistrict.district_id}`, "GET")
          .then((response) => setWards(response.data || []))
          .catch(() => setWards([]));
      }
      setFormData((prev) => ({ ...prev, ward: "" }));
    } else {
      setWards([]);
      setFormData((prev) => ({ ...prev, ward: "" }));
    }
  }, [formData.district]);

  // useEffect(() => {
  //   window.scrollTo({
  //     top: 0,
  //     behavior: "smooth",
  //   });
  // }, [step]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value }); // Sử dụng hàm cập nhật trạng thái dạng hàm
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let newErrors = { ...errors };
    switch (name) {
      case "phone":
        newErrors.phone = /^[0-9]{10}$/.test(value)
          ? ""
          : "Phone number must be exactly 10 digits";
        break;
      case "province":
        newErrors.province = value ? "" : "Province is required";
        break;
      case "district":
        newErrors.district = value ? "" : "District is required";
        break;
      case "ward":
        newErrors.ward = value ? "" : "Ward is required";
        break;
      default:
        if (!value.trim()) {
          newErrors[name] = "This field is required";
        } else {
          delete newErrors[name];
        }
    }
    setErrors(newErrors);
  };

  const validateCartWithMenu = async () => {
    try {
      // Fetch the current menu for branch 1
      const menuRes = await http("/menu/1", "GET");
      const menu = (menuRes.data && menuRes.data.listDish) ? menuRes.data.listDish : [];
      const availableDishIds = new Set(menu.map((item) => item.dish_id));
      // Filter cart items that are not in the menu
      const unavailableItems = cart.filter((item) => !availableDishIds.has(item.id));
      if (unavailableItems.length > 0) {
        // Remove unavailable items from cart
        unavailableItems.forEach((item) => clearCart(item.id));
        toast.error(
          `Some items were removed from your cart as they are no longer available. Please review your cart.`,
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
        return false;
      }
      return true;
    } catch (error) {
      toast.error("Failed to validate cart. Please try again later.", {
        position: "top-right",
        autoClose: 3000,
      });
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Require name, phone, province, district, ward, address
    const requiredFields = [
      "name",
      "phone",
      "province",
      "district",
      "ward",
      "address",
    ];
    let hasError = false;
    requiredFields.forEach((field) => {
      if (!formData[field].trim()) {
        validateField(field, formData[field]);
        hasError = true;
      }
    });
    if (hasError || Object.values(errors).some((error) => error)) {
      alert("Please fix the errors in the form before submitting.");
      return;
    }
    // Validate cart with menu before submitting
    const isValid = await validateCartWithMenu();
    if (!isValid) return;
    // Instead of submitOrder, go to payment step
    setShippingData(formData);
    setStep(3);
  };

  const submitOrder = async () => {
    try {
      // Chuẩn bị dữ liệu body từ formData và cart
      const orderData = {
        cus_name: formData.name,
        phone_number: formData.phone,
        address: `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.province}`,
        notes: "No additional notes",
        listDish: cart.map((item) => ({
          dish_id: item.id,
          dish_name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      };
      
      const fetchOrder = await http("/order/submit-online/1", "POST", orderData);
      
      if (fetchOrder.status === 201) {
        toast.success(`Checkout Successful!`, {
          position: "top-right",
          autoClose: 1500,
        });
        clearCart();
        navigate("/activity-history", { state: { fromCheckout: true } });
      }
    } catch (error) {
      console.error("Order submission error:", error);
      
      // Handle specific error cases
      if (error.message && error.message.includes("foreign key constraint fails")) {
        toast.error("Some items in your cart are no longer available. Please refresh your cart and try again.", {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        toast.error("Failed to submit order. Please try again later.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };
  return (
    <div>
      <form className="checkout-form" onSubmit={handleSubmit}>
        <h2 className="section-title">Check Out</h2>
        <div className="payment-method-section">
          <div className="shipping-info">
            <h3 className="section-subtitle">
              <FaShippingFast className="icon" /> Shipping Information
            </h3>
            <div className="form-group-checkout">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
              {errors.name && <p className="error-message">{errors.name}</p>}
            </div>
            <div className="form-group-checkout">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="1234567890"
              />
              {errors.phone && <p className="error-message">{errors.phone}</p>}
            </div>
            <div className="form-group-checkout">
              <label htmlFor="province">Province/City</label>
              <select
                id="province"
                name="province"
                value={formData.province}
                onChange={handleInputChange}
              >
                <option value="">-- Select Province/City --</option>
                {provinces.map((province) => (
                  <option key={province.region_id} value={province.region_name}>
                    {province.region_name}
                  </option>
                ))}
              </select>
              {errors.province && (
                <p className="error-message">{errors.province}</p>
              )}
            </div>
            <div className="form-group-checkout">
              <label htmlFor="district">District</label>
              <select
                id="district"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                disabled={!formData.province}
              >
                <option value="">-- Select District --</option>
                {districts.map((district) => (
                  <option key={district.district_id} value={district.district_name}>
                    {district.district_name}
                  </option>
                ))}
              </select>
              {errors.district && (
                <p className="error-message">{errors.district}</p>
              )}
            </div>
            <div className="form-group-checkout">
              <label htmlFor="ward">Ward</label>
              <select
                id="ward"
                name="ward"
                value={formData.ward}
                onChange={handleInputChange}
                disabled={!formData.district}
              >
                <option value="">-- Select Ward --</option>
                {wards.map((ward) => (
                  <option key={ward.ward_id} value={ward.ward_name}>
                    {ward.ward_name}
                  </option>
                ))}
              </select>
              {errors.ward && <p className="error-message">{errors.ward}</p>}
            </div>
            <div className="form-group-checkout">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main St, Apartment 4B"
              ></input>
              {errors.address && (
                <p className="error-message">{errors.address}</p>
              )}
            </div>
          </div>
        </div>

        <div className="checkout-actions">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="back-button"
          >
            <BsArrowRight className="icon rotate-180" /> Back to Cart
          </button>
          <button type="submit" className="place-order-button">
            Check Out
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;
