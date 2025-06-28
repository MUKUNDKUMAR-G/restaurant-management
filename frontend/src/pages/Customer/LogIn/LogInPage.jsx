import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser } from "react-icons/fi";
import { toast } from "react-toastify";

import "./LogInPage.css";
import { http } from "../../../helpers/http";

export const LogInPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(0); // 0: initial, 1: email, 2: OTP, 3: new password
  const [formData, setFormData] = useState({
    username: "", // Changed from 'name' to 'username' for signup
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
    newPassword: "",
    confirmNewPassword: "",
    phone: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    let newErrors = { ...errors };
    switch (name) {
      case "username":
        if (isLogin) {
          if (value.trim() === "") {
            newErrors.username = "Email is required";
          } else {
            delete newErrors.username;
          }
        } else {
          if (value.length < 2) {
            newErrors.username = "Username must be at least 2 characters long";
          } else {
            delete newErrors.username;
          }
        }
        break;
      case "email":
        if (!validateEmail(value)) {
          newErrors.email = "Please enter a valid email address";
        } else {
          delete newErrors.email;
        }
        break;
      case "password":
      case "newPassword":
        if (value.length < 8) {
          newErrors[name] = "Password must be at least 8 characters long";
        } else {
          delete newErrors[name];
        }
        break;
      case "confirmPassword":
      case "confirmNewPassword":
        if (
          value !==
          (name === "confirmPassword"
            ? formData.password
            : formData.newPassword)
        ) {
          newErrors[name] = "Passwords do not match";
        } else {
          delete newErrors[name];
        }
        break;
      case "otp":
        if (value.length !== 6) {
          newErrors.otp = "OTP must be 6 digits";
        } else {
          delete newErrors.otp;
        }
        break;
      case "phone":
        if (value.length < 10 || value.length > 10) {
          newErrors.phone = "Phone number must be 10 digits";
        } else {
          delete newErrors.phone;
        }
        break;
      case "address":
        if (value.length < 5) {
          newErrors.address = "Address must be at least 5 characters long";
        } else {
          delete newErrors.address;
        }
        break;
      default:
        break;
    }
    setErrors(newErrors);
  };

  const [searchParams] = useSearchParams(); // Lấy query params từ URL

  useEffect(() => {
    const tab = searchParams.get("tab"); // Lấy giá trị 'tab' từ query params
    if (tab === "register") {
      setIsLogin(false); // Chuyển sang màn hình Register nếu tab=register
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (forgotPasswordStep > 0) {
        handleForgotPasswordSubmit();
      } else {
        if (isLogin) {
          const fetchData = await http("/auth/login", "POST", {
            user_email: formData.username,
            user_password: formData.password,
          });

          if (!fetchData || !fetchData.data) {
            throw new Error("Invalid response from server");
          }

          // Store tokens
          localStorage.setItem("token", fetchData.data.access_token);
          localStorage.setItem("refresh_token", fetchData.data.refresh_token);

          if (fetchData.status === 200) {
            toast.success("Login Successful!", {
              position: "top-right",
              autoClose: 1500,
            });

            // Check user type and redirect
            const user = fetchData.data.user;
            if (user.is_staff === 1) {
              navigate("/staff/dashboard");
              localStorage.setItem("staff_branch", user.staff_branch);
            } else if (user.is_admin === 1) {
              navigate("/admin/dashboard");
            } else {
              navigate("/");
            }
          } else {
            toast.error(fetchData.data?.message || "Login failed", {
              position: "top-right",
              autoClose: 1500,
            });
          }
        } else {
          // Registration logic
          const fetchRegister = await http("/auth/register", "POST", {
            user_name: formData.username,
            user_email: formData.email,
            user_password: formData.password,
            user_phone_number: formData.phone || "1234567890",
            user_address: formData.address || "Default Address",
          });

          if (fetchRegister.status === 201) {
            toast.success("Registration Successful!", {
              position: "top-right",
              autoClose: 1500,
            });
            toggleForm();
          } else {
            toast.error(fetchRegister.data?.message || "Registration failed", {
              position: "top-right",
              autoClose: 1500,
            });
          }
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "An error occurred during login", {
        position: "top-right",
        autoClose: 1500,
      });
    }
  };

  const handleForgotPasswordSubmit = () => {
    switch (forgotPasswordStep) {
      case 1:
        // Verify email and send OTP
        console.log("Sending OTP to", formData.email);
        setForgotPasswordStep(2);
        break;
      case 2:
        // Verify OTP
        console.log("Verifying OTP", formData.otp);
        setForgotPasswordStep(3);
        break;
      case 3:
        // Update password
        console.log("Updating password");
        setForgotPasswordStep(0);
        setIsLogin(true);
        // Implement actual password update logic here
        break;
      default:
        break;
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setForgotPasswordStep(0);
    setFormData({
      username: "", // Reset username
      email: "",
      password: "",
      confirmPassword: "",
      otp: "",
      newPassword: "",
      confirmNewPassword: "",
      phone: "",
      address: "",
    });
    setErrors({});
  };

  const renderForgotPasswordForm = () => {
    switch (forgotPasswordStep) {
      case 1:
        return (
          <div className="auth-form-fields">
            <div className="auth-form-field">
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="auth-form-input-wrapper">
                <FiMail className="auth-form-icon" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="auth-form-input"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  aria-label="Email address"
                />
              </div>
              {errors.email && (
                <p className="auth-form-error">{errors.email}</p>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="auth-form-fields">
            <div className="auth-form-field">
              <label htmlFor="otp" className="sr-only">
                Enter OTP
              </label>
              <div className="auth-form-input-wrapper">
                <FiLock className="auth-form-icon" />
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  maxLength="6"
                  className="auth-form-input"
                  placeholder="Enter 6-digit OTP"
                  value={formData.otp}
                  onChange={handleChange}
                  aria-label="Enter OTP"
                />
              </div>
              {errors.otp && <p className="auth-form-error">{errors.otp}</p>}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="auth-form-fields">
            <div className="auth-form-field">
              <label htmlFor="newPassword" className="sr-only">
                New Password
              </label>
              <div className="auth-form-input-wrapper">
                <FiLock className="auth-form-icon" />
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  className="auth-form-input"
                  placeholder="New Password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  aria-label="New Password"
                />
                <button
                  type="button"
                  className="auth-form-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FiEyeOff className="auth-form-icon-toggle" />
                  ) : (
                    <FiEye className="auth-form-icon-toggle" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="auth-form-error">{errors.newPassword}</p>
              )}
            </div>
            <div className="auth-form-field">
              <label htmlFor="confirmNewPassword" className="sr-only">
                Confirm New Password
              </label>
              <div className="auth-form-input-wrapper">
                <FiLock className="auth-form-icon" />
                <input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  className="auth-form-input"
                  placeholder="Confirm New Password"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  aria-label="Confirm New Password"
                />
              </div>
              {errors.confirmNewPassword && (
                <p className="auth-form-error">{errors.confirmNewPassword}</p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getForgotPasswordTitle = () => {
    switch (forgotPasswordStep) {
      case 1:
        return "Reset Password";
      case 2:
        return "Enter OTP";
      case 3:
        return "Create New Password";
      default:
        return isLogin ? "Sign in to your account" : "Create a new account";
    }
  };

  const getForgotPasswordButtonText = () => {
    switch (forgotPasswordStep) {
      case 1:
        return "Send OTP";
      case 2:
        return "Verify OTP";
      case 3:
        return "Update Password";
      default:
        return isLogin ? "Sign in" : "Sign up";
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-wrapper">
        <div>
          <h2 className="auth-form-title">{getForgotPasswordTitle()}</h2>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          {forgotPasswordStep === 0 ? (
            <div className="auth-form-fields">
              {isLogin ? (
                <div className="auth-form-field">
                  <label htmlFor="username" className="sr-only">
                    Email
                  </label>
                  <div className="auth-form-input-wrapper">
                    <FiUser className="auth-form-icon" />
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="auth-form-input"
                      placeholder="Email@gmail.com"
                      value={formData.username}
                      onChange={handleChange}
                      aria-label="Username"
                    />
                  </div>
                  {errors.username && (
                    <p className="auth-form-error">{errors.username}</p>
                  )}
                </div>
              ) : (
                // **Signup Form: Username Instead of Name**
                <div className="auth-form-field">
                  <label htmlFor="username" className="sr-only">
                    Username
                  </label>
                  <div className="auth-form-input-wrapper">
                    <FiUser className="auth-form-icon" />
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required={!isLogin}
                      className="auth-form-input"
                      placeholder="Username"
                      value={formData.username}
                      onChange={handleChange}
                      aria-label="Username"
                    />
                  </div>
                  {errors.username && (
                    <p className="auth-form-error">{errors.username}</p>
                  )}
                </div>
              )}

              {!isLogin && (
                <div className="auth-form-field">
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <div className="auth-form-input-wrapper">
                    <FiMail className="auth-form-icon" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="auth-form-input"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={handleChange}
                      aria-label="Email address"
                    />
                  </div>
                  {errors.email && (
                    <p className="auth-form-error">{errors.email}</p>
                  )}
                </div>
              )}

              <div className="auth-form-field">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="auth-form-input-wrapper">
                  <FiLock className="auth-form-icon" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="auth-form-input auth-form-password-input"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    className="auth-form-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FiEyeOff className="auth-form-icon-toggle" />
                    ) : (
                      <FiEye className="auth-form-icon-toggle" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="auth-form-error">{errors.password}</p>
                )}
              </div>
              {!isLogin && (
                <div className="auth-form-field">
                  <label htmlFor="confirmPassword" className="sr-only">
                    Confirm Password
                  </label>
                  <div className="auth-form-input-wrapper">
                    <FiLock className="auth-form-icon" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      required={!isLogin}
                      className="auth-form-input"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      aria-label="Confirm Password"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="auth-form-error">{errors.confirmPassword}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            renderForgotPasswordForm()
          )}

          {isLogin && forgotPasswordStep === 0 && (
            <div className="auth-form-forgot-password">
              <button
                type="button"
                className="auth-form-forgot-button"
                onClick={() => setForgotPasswordStep(1)}
              >
                Forgot your password?
              </button>
            </div>
          )}

          <div className="auth-form-submit">
            <button type="submit" className="auth-form-submit-button">
              {getForgotPasswordButtonText()}
            </button>
          </div>

          {forgotPasswordStep === 0 && (
            <div className="auth-form-toggle">
              <button
                type="button"
                className="auth-form-toggle-button"
                onClick={toggleForm}
              >
                {isLogin
                  ? "Create a new account"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          )}

          {forgotPasswordStep > 0 && (
            <div className="auth-form-toggle">
              <button
                type="button"
                className="auth-form-toggle-button"
                onClick={() => {
                  setForgotPasswordStep(0);
                  setFormData({
                    ...formData,
                    otp: "",
                    newPassword: "",
                    confirmNewPassword: "",
                  });
                }}
              >
                Back to Sign In
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
