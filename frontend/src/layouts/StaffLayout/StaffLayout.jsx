import React, { useState, useEffect } from "react";
import {
  FiLogOut,
  FiUsers,
  FiBarChart2,
  FiList,
  FiShoppingCart,
  FiFileText,
} from "react-icons/fi";
import { IoIosAddCircle } from "react-icons/io";
import { FaUser, FaEdit, FaAddressCard } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./StaffLayout.css";

export const StaffLayout = ({ children, title }) => {
  const [isManager, setIsManager] = useState(true);

  useEffect(() => {
    document.title = title;
  }, [title]);
  // 123123
  const navigationItems = [
    { icon: FaUser, label: "Profile", id: "profile", path: "/staff/profile" },
    {
      icon: FiList,
      label: "Reservations",
      id: "reservations",
      path: "/staff/reservation-list",
    },
    {
      icon: FiShoppingCart,
      label: "Online Orders",
      id: "orders",
      path: "/staff/order-online-list",
    },
    {
      icon: IoIosAddCircle,
      label: "Create Reservation",
      id: "createslip",
      path: "/staff/create-slip",
    },
    { icon: FiFileText, label: "Bills", id: "bills", path: "/staff/bill" },
    {
      icon: FaAddressCard,
      label: "Customer Management",
      id: "customer",
      path: "/staff/customer",
    },
  ];

  const navigationStaffItems = [
    {
      icon: FaEdit,
      label: "Menu Management",
      id: "dish",
      path: "/staff/dish",
      hidden: true,
    },
    {
      icon: FiBarChart2,
      label: "Analytics",
      id: "analytics",
      path: "/staff/analytic",
      hidden: true,
    },
    {
      icon: FiUsers,
      label: "Employee Management",
      id: "employees",
      path: "/staff/employee",
      hidden: true,
    },
  ];
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Xóa token
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("staff_branch");
    navigate("/login");
  };

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="header">
        <div
          className="header-container"
          style={{ justifyContent: "space-between", width: "100%" }}
        >
          <div className="header-left">
            <img
              src="https://e7.pngegg.com/pngimages/326/328/png-clipart-computer-icons-organization-desktop-sales-person-silhouette-share-icon-thumbnail.png"
              alt="Company Logo"
              className="company-logo"
            />
            <h1 className="dashboard-title">STAFF</h1>
          </div>
          <div className="header-right">
            <button className="logout-button" onClick={handleLogout}>
              <FiLogOut size={20} className="icon" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar and Main Content */}
      <div className="content" style={{ marginTop: "60px" }}>
        {/* Sidebar */}
        <div className="sidebar" style={{ gridColumn: "1 / 3" }}>
          <nav>
            {navigationItems.map((item, index) => {
              return (
                <React.Fragment key={item.id}>
                  <Link to={item.path} className="nav-item">
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                  {/* {item.id === "profile" && <hr className="sidebar-divider" />} */}
                </React.Fragment>
              );
            })}
            {navigationStaffItems.map((item, index) => {
              if (item.hidden && !isManager) return null;

              return (
                <React.Fragment key={item.id}>
                  <Link to={item.path} className="nav-item">
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="content-main">{children}</div>
      </div>
    </div>
  );
};
