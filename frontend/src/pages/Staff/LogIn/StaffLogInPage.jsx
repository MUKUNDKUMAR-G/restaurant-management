import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import "./StaffLogInPage.css";
import { http } from "../../../helpers/http";
import { toast } from "react-toastify";

export const StaffLogInPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "password") {
      validatePassword(value);
    }
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      setErrors((prev) => ({
        ...prev,
        password: "Password must be at least 8 characters long",
      }));
    } else {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!errors.password && formData.username && formData.password) {
      setIsLoading(true);
      try {
        const fetchData = await http("/auth/login", "POST", {
          user_email: formData.username,
          user_password: formData.password,
        });
        setIsLoading(false);
        if (!fetchData || !fetchData.data) {
          throw new Error("Invalid response from server");
        }
        // Store tokens
        localStorage.setItem("token", fetchData.data.access_token);
        localStorage.setItem("refresh_token", fetchData.data.refresh_token);
        // Check user type and redirect
        const user = fetchData.data.user;
        if (user.is_staff === 1) {
          if (user.staff_branch) {
            localStorage.setItem("staff_branch", user.staff_branch);
          }
          toast.success("Staff Login Successful!", { position: "top-right", autoClose: 1500 });
          navigate("/staff/dashboard");
        } else {
          toast.error("You are not a staff member!", { position: "top-right", autoClose: 1500 });
        }
      } catch (error) {
        setIsLoading(false);
        toast.error(error.message || "Login failed", { position: "top-right", autoClose: 1500 });
      }
    }
  };

  return (
    <div className="staff-login-container">
      <div className="staff-login-box">
        <h2 className="staff-login-title">Staff Login</h2>
        <form onSubmit={handleSubmit} className="staff-login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Email
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your email"
              aria-label="Email"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input ${errors.password ? "input-error" : ""}`}
                placeholder="Enter your password"
                aria-label="Password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-button"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="error-message" role="alert" aria-live="polite">
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`submit-button ${isLoading ? "button-disabled" : ""}`}
          >
            {isLoading ? (
              <>
                <FaSpinner className="spinner" />
                Loading...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
