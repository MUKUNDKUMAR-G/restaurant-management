import React, { useState } from "react";
import "./ProfilePage.css";
import { http } from "../../../helpers/http";
import { toast } from "react-toastify";

export const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("personal-info");
  const [avatar, setAvatar] = useState(
    "https://cdn-icons-png.flaticon.com/256/5894/5894085.png"
  );
  const [isEditing, setIsEditing] = useState(false);

  // fetch user info
  const [userInfo, setUserInfo] = useState({
    // avatar: "",
    name: "",
    email: "",
    address: "",
    phoneNumber: "",
    memberCard: "",
  });

  React.useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await http(`/user`, "GET");
        const data = await response.data;
        setUserInfo({
          // avatar: null,
          name: data.user_name,
          email: data.user_email,
          address: data.user_address,
          phoneNumber: data.user_phone_number,
          memberCard: data.card_level
        });
        // setAvatar(avatar);
      } catch (error) {
        console.error("Error fetching user information:", error);
      }
    };
    fetchUserInfo();
    // avatar = setAvatar();
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      // Gọi API khi nhấn nút Save
      const updatedInfo = {
        user_name: userInfo.name,
        user_email: userInfo.email,
        user_address: userInfo.address,
        user_phone_number: userInfo.phoneNumber,
      };

      await updateUserInfo(updatedInfo); // Thay thế `your-user-id` bằng id của người dùng.
    }

    setIsEditing(!isEditing);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserInfo((prevInfo) => ({ ...prevInfo, [name]: value }));
  };

  const updateUserInfo = async (updatedInfo) => {
    try {
      const fetchUpdateUserInfo = await http(`/user`, "PATCH", updatedInfo);

      if (fetchUpdateUserInfo.status === 200) {
        toast.success(`Update successful!`, {
          position: "top-right",
          autoClose: 1500,
        });
      }
    } catch (error) {
      console.error("Error updating user information:", error);
    }
  };

  const updateUserPassword = async (currentPassword, newPassword) => {
    try {
      const fetchUpdatePassword = await http(`/user/update_password`, "PATCH", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      if (fetchUpdatePassword.status === 200) {
        toast.success(`Update passwwork successful!`, {
          position: "top-right",
          autoClose: 1500,
        });
      }
    } catch (error) {
      console.error("Error updating password:", error);
      return { error: error.message };
    }
  };

  const handlePasswordUpdate = async () => {
    const currentPassword = document.querySelector(
      'input[placeholder="Enter current password"]'
    ).value;
    const newPassword = document.querySelector(
      'input[placeholder="Enter new password"]'
    ).value;
    const confirmPassword = document.querySelector(
      'input[placeholder="Confirm new password"]'
    ).value;

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    const result = await updateUserPassword(currentPassword, newPassword); // Thay thế `your-user-id` bằng id của người dùng.

    if (result?.error) {
      alert(result.error);
    }

    setActiveTab("personal-info");
  };

  return (
    <div className="profile-container" style={{ minHeight: "90vh" }}>
      <h1>Manage Profile</h1>
      <div className="tabs">
        <button
          className={activeTab === "personal-info" ? "active-tab" : ""}
          onClick={() => handleTabClick("personal-info")}
        >
          Personal Information
        </button>
        <button
          className={activeTab === "security" ? "active-tab" : ""}
          onClick={() => handleTabClick("security")}
        >
          Account and Security
        </button>
      </div>

      {activeTab === "personal-info" && (
        <div className="tab-content" style={{ minHeight: "80vh" }}>
          <h2>Personal Information</h2>
          <div className="personal-info-container">
            {/* Avatar Section */}
            <div className="avatar-section">
              <img src={avatar} alt="Avatar" className="avatar-img" />
            </div>

            {/* Form Section */}
            <div className="form-section">
              <div className="form-group-prfcus">
                <label>Name</label>
                <input
                  type="text"
                  value={userInfo.name}
                  name="name"
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </div>
              <div className="form-group-prfcus">
                <label>Email</label>
                <input
                  type="email"
                  value={userInfo.email}
                  name="email"
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </div>
              <div className="form-group-prfcus">
                <label>Address</label>
                <input
                  type="text"
                  value={userInfo.address}
                  name="address"
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </div>
              <div className="form-group-prfcus">
                <label>Phone Number</label>
                <input
                  type="text"
                  value={userInfo.phoneNumber}
                  name="phoneNumber"
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </div>
              <div className="form-group-prfcus">
                <label>Member Card</label>
                <input
                  type="text"
                  value={userInfo.memberCard}
                  name="memberCard"
                  disabled
                />
              </div>
              <button className="edit-button" onClick={handleEditToggle}>
                {isEditing ? "Save" : "Edit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="tab-content">
          <h2>Account and Security</h2>
          <div className="form-group-prfcus">
            <label>Current Password</label>
            <input type="password" placeholder="Enter current password" />
          </div>
          <div className="form-group-prfcus">
            <label>New Password</label>
            <input type="password" placeholder="Enter new password" />
          </div>
          <div className="form-group-prfcus">
            <label>Confirm New Password</label>
            <input type="password" placeholder="Confirm new password" />
          </div>
          <div className="form-actions">
            <button className="save-button" onClick={handlePasswordUpdate}>
              Update
            </button>
            <button className="cancel-button">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};
