import React, { useState, useEffect } from "react";
import { FiLogOut, FiUsers } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { FaComputer, FaCodeBranch } from "react-icons/fa6";
import { BiFoodMenu } from "react-icons/bi";

import "./AdminLayout.css";

export const AdminLayout = ({ children, title }) => {
  useEffect(() => {
    document.title = title;
  }, [title]);

  const navigationItems = [
    {
      icon: MdDashboard,
      label: "Dashboard",
      id: "dashboard",
      path: "/admin/dashboard",
    },
    {
      icon: FiUsers,
      label: "Employee Management",
      id: "employees",
      path: "/admin/employee",
    },
    {
      icon: FaComputer,
      label: "Department Management",
      id: "departments",
      path: "/admin/department",
    },
    {
      icon: BiFoodMenu,
      label: "Menu Management",
      id: "dishs",
      path: "/admin/dish",
    },
    {
      icon: FaCodeBranch,
      label: "Branch Management",
      id: "branchs",
      path: "/admin/branch",
    },
  ];
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Xóa token
    localStorage.removeItem("refresh_token");
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
            <h1 className="dashboard-title">ADMIN</h1>
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
                  {item.id === "profile" && <hr className="sidebar-divider" />}
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
