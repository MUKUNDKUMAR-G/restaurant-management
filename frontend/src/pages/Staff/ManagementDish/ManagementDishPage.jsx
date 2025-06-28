import React, { useState, useEffect } from "react";
import { FiEdit2, FiTrash2, FiSearch, FiPlus } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Select from "react-select";
import { http } from "../../../helpers/http";
import "./ManagementDishPage.css"; // Import file CSS
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const ManagementDishPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDish, setSelectedDish] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    image: "",
    isShip: false,
    isVegetarian: false,
    spiceLevel: "medium",
  });
  const [dishes, setDishes] = useState([]);

  const [availableDishes, setAvailableDishes] = useState([]);

  //sửa chỗ này
  const [currentPage, setCurrentPage] = useState(1);
  // ----------------

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    { value: "starters", label: "Starters" },
    { value: "main_course", label: "Main Course" },
    { value: "breads", label: "Breads" },
    { value: "rice_biryani", label: "Rice & Biryani" },
    { value: "desserts", label: "Desserts" },
    { value: "beverages", label: "Beverages" }
  ];

  const spiceLevels = [
    { value: "mild", label: "Mild" },
    { value: "medium", label: "Medium" },
    { value: "hot", label: "Hot" },
    { value: "extra_hot", label: "Extra Hot" }
  ];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  useEffect(() => {
    if (isModalOpen && formMode === "add") {
      fetchAvailableDishes();
    }
  }, [isModalOpen, formMode]);

  const fetchDishes = async (
    page = 1,
    limit = 6,
    sort = "price,desc",
    query = ""
  ) => {
    setLoading(true);
    setError("");
    try {
      const branchId = localStorage.getItem("staff_branch");
      const response = await http(
        `/menu/${branchId}?limit=${limit}&sort=${sort}&page=${page}&query=${query}`,
        "GET"
      );

      const data = response.data;
      if (data) {
        setDishes(data.listDish);
        setPagination({
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
        });
      } else {
        throw new Error("No data received from API");
      }
    } catch (err) {
      setError("Unable to fetch menu items.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDishes(currentPage, 6, "price,desc", searchTerm);
  }, [currentPage, searchTerm]);

  const fetchAvailableDishes = async (query = "", page = 1, limit = 10) => {
    try {
      const response = await http(
        `/dish/search?query=${query}&page=${page}&limit=${limit}`,
        "GET"
      );

      const data = response.data;
      setAvailableDishes(data.dishes);
    } catch (err) {
      toast.error("Unable to fetch available dishes.", {
        position: "top-right",
        autoClose: 1500,
      });
    }
  };

  const handleDishSelect = (selectedOption) => {
    const selectedDish = availableDishes.find(
      (dish) => dish.dish_name === selectedOption.value
    );
    setFormData({
      ...selectedDish,
      isShip: formData.isShip,
      isVegetarian: formData.isVegetarian,
      spiceLevel: formData.spiceLevel,
    });
  };

  const options = availableDishes.map((dish) => ({
    value: dish.dish_name,
    label: dish.dish_name,
  }));

  const filteredDishes = dishes;

  const handleAddDish = () => {
    setFormMode("add");
    setFormData({
      name: "",
      price: "",
      description: "",
      category: "",
      image: "",
      isShip: false,
      isVegetarian: false,
      spiceLevel: "medium",
    });
    // setAvailableDishes(DishesFromDB);
    setIsModalOpen(true);
  };

  const handleEditDish = (dish) => {
    setFormMode("edit");
    setSelectedDish(dish);
    setFormData({
      name: dish.dish_name,
      price: dish.price,
      description: dish.description,
      category: dish.category_name,
      image: dish.image_link,
      isShip: dish.isShip || false,
      isVegetarian: dish.isVegetarian || false,
      spiceLevel: dish.spiceLevel || "medium",
    });
    setIsModalOpen(true);
  };

  const handleDeleteDish = (dish) => {
    setSelectedDish(dish);
    setIsDeleteModalOpen(true);
  };

  const handleSelectInputChange = (inputValue) => {
    fetchAvailableDishes(inputValue);
  };

  const confirmDelete = () => {
    if (selectedDish) {
      deleteDishFromBranch(selectedDish.id); // Thay 9 bằng branchId tương ứng
      setDishes(dishes.filter((dish) => dish.id !== selectedDish.id));
      setIsDeleteModalOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newDish = {
      ...formData,
      id: formMode === "add" ? dishes.length + 1 : selectedDish.dish_id,
      price: parseFloat(formData.price),
    };

    if (formMode === "add") {
      setDishes([...dishes, newDish]);
      await addDishToBranch(newDish.id, formData.isShip);
    } else {
      await editDish(selectedDish.dish_id, newDish);
      setDishes(
        dishes.map((dish) =>
          dish.dish_id === selectedDish.dish_id ? newDish : dish
        )
      );
      // edit dish
    }

    setIsModalOpen(false);
  };

  const handleViewDetails = (dish) => {
    setSelectedDish(dish);
    setIsViewModalOpen(true);
  };

  const editDish = async (idDish, updatedData) => {
    try {
      const response = await http(`/dish/${idDish}`, "PATCH", updatedData);
      if (response) {
        toast.success(`Dish updated successfully!`, {
          position: "top-right",
          autoClose: 1500,
        });
      } else {
        console.error("Failed to update dish:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating dish:", error);
    }
  };

  const addDishToBranch = async (idDish, isShip) => {
    try {
      const branchId = localStorage.getItem("staff_branch");
      const response = await http(
        `/dish/${idDish}/branch/${branchId}`,
        "POST",
        {
          is_ship: isShip,
        }
      );

      if (response) {
        toast.success(`Dish added successfully!`, {
          position: "top-right",
          autoClose: 1500,
        });
      } else {
        console.error("Failed to add dish:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding dish:", error);
    }
  };

  const deleteDishFromBranch = async (dishId) => {
    try {
      const branchId = localStorage.getItem("staff_branch");
      const response = await http(
        `/dish/${dishId}/branch/${branchId}`,
        "DELETE"
      );

      if (response) {
        toast.success(`Dish deleted successfully!`, {
          position: "top-right",
          autoClose: 1500,
        });
      } else {
        console.error("Failed to delete dish:", response.statusText);
        toast.error("Failed to delete dish.", {
          position: "top-right",
          autoClose: 1500,
        });
      }
    } catch (error) {
      console.error("Error deleting dish:", error);
      toast.error("Error deleting dish.", {
        position: "top-right",
        autoClose: 1500,
      });
    }
  };

  return (
    <div className="restaurant-dish-manager">
      <div className="container">
        <div className="header">
          <h1 className="title">Spice Garden Menu Management</h1>
          <button
            onClick={handleAddDish}
            className="add-dish-button"
            aria-label="Add new dish"
          >
            <FiPlus /> Add Dish
          </button>
        </div>

        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search dishes by name, category, or spice level..."
            className="search-input"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="dishes-grid">
          <AnimatePresence>
            {filteredDishes.map((dish, index) => (
              <motion.div
                key={dish.dish_id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="dish-card"
              >
                <img
                  src={dish.image_link}
                  alt={dish.name}
                  className="dish-image"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
                  }}
                />
                <div className="dish-info">
                  <h3 className="dish-name">{dish.dish_name}</h3>
                  <div className="item-footer">
                    <span className="item-status">{dish.isShip ? "Shippable" : "Dine-in Only"}</span>
                    <p className="dish-price">₹{dish.price.toFixed(2)}</p>
                  </div>
                  <p className="dish-description">{dish.description}</p>
                  <div className="dish-actions">
                    <button
                      onClick={() => handleViewDetails(dish)}
                      className="view-details-button"
                      style={{ margin: 0 }}
                      aria-label={`View details for ${dish.name}`}
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => handleEditDish(dish)}
                      className="edit-button"
                      style={{ margin: 0 }}
                      aria-label={`Edit ${dish.name}`}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDeleteDish(dish)}
                      className="delete-button"
                      style={{ margin: 0, fontSize: 20 }}
                      aria-label={`Delete ${dish.name}`}
                    >
                      <FiTrash2 style={{ fontSize: 20 }} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Modal components */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-title">
                {formMode === "add" ? "Add New Dish" : "Edit Dish"}
              </h2>
              <form onSubmit={handleSubmit} className="form">
                {formMode === "add" && (
                  <>
                    <div className="form-group-adddish">
                      <label htmlFor="availableDishes">Select a Dish</label>
                      <Select
                        options={availableDishes.map((dish) => ({
                          value: dish.dish_name,
                          label: dish.dish_name,
                        }))}
                        onChange={handleDishSelect}
                        onInputChange={handleSelectInputChange}
                        placeholder="Search or select a dish..."
                      />
                    </div>
                    <div className="form-group-adddish checkbox-group">
                      <label htmlFor="isShip" className="checkbox-label">
                        <input
                          type="checkbox"
                          id="isShip"
                          checked={formData.isShip}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isShip: e.target.checked,
                            })
                          }
                        />
                        Available for Delivery
                      </label>
                    </div>
                    <div className="form-group-adddish checkbox-group">
                      <label htmlFor="isVegetarian" className="checkbox-label">
                        <input
                          type="checkbox"
                          id="isVegetarian"
                          checked={formData.isVegetarian}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isVegetarian: e.target.checked,
                            })
                          }
                        />
                        Vegetarian
                      </label>
                    </div>
                    <div className="form-group-adddish">
                      <label htmlFor="spiceLevel">Spice Level</label>
                      <Select
                        options={spiceLevels}
                        value={spiceLevels.find(level => level.value === formData.spiceLevel)}
                        onChange={(option) =>
                          setFormData({
                            ...formData,
                            spiceLevel: option.value,
                          })
                        }
                        placeholder="Select spice level..."
                      />
                    </div>
                  </>
                )}

                {formMode === "edit" && (
                  <>
                    <div className="form-group-adddish">
                      <label htmlFor="name">Name</label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group-adddish">
                      <label htmlFor="price">Price</label>
                      <input
                        type="number"
                        id="price"
                        required
                        step="0.01"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group-adddish">
                      <label htmlFor="description">Description</label>
                      <textarea
                        id="description"
                        required
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-group-adddish">
                      <label htmlFor="image">Image URL</label>
                      <input
                        type="text"
                        id="image"
                        required
                        value={formData.image}
                        onChange={(e) =>
                          setFormData({ ...formData, image: e.target.value })
                        }
                      />
                    </div>
                  </>
                )}
                <div className="form-actions">
                  <button type="submit" className="submit-button">
                    {formMode === "add" ? "Add Dish" : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-title">Confirm Delete</h2>
              <p>Are you sure you want to delete {selectedDish?.name}?</p>
              <div className="confirm-delete-modal">
                <div className="form-actions">
                  <button onClick={confirmDelete} className="delete-button">
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {isViewModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-title">Dish Details</h2>
              <div className="view-dish-details">
                <img
                  src={selectedDish?.image_link}
                  alt={selectedDish?.dish_name}
                  className="dish-image"
                />
                <div className="dish-info">
                  <h3>{selectedDish?.name}</h3>
                  <p>{selectedDish?.description}</p>
                  <p>Price: ₹{selectedDish?.price}</p>
                </div>
                <div className="form-actions">
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="cancel-button"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-button"
            aria-label="Previous page"
          >
            <FiChevronLeft className="pagination-icon" />
          </button>
          <span className="pagination-info">
            Page {currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, pagination.totalPages)
              )
            }
            disabled={currentPage === pagination.totalPages}
            className="pagination-button"
            aria-label="Next page"
          >
            <FiChevronRight className="pagination-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagementDishPage;
