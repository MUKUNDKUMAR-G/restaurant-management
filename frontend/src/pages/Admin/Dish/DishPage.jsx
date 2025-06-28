import React, { useState, useEffect } from "react";
import { FiEdit2, FiTrash2, FiSearch, FiPlus } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { http } from "../../../helpers/http";
import "./DishPage.css"; // Import file CSS
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const DishPage = () => {
  const [dishes, setDishes] = useState([]);

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
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  const ITEMS_PER_PAGE = 9;

  const fetchDishes = async (query = "", page = 1, limit = ITEMS_PER_PAGE) => {
    try {
      const params = new URLSearchParams({
        query,
        page,
        limit,
      });

      const response = await http(`/dish/search?${params.toString()}`, "GET");
      if (response) {
        const data = response.data;
        setDishes(data.dishes);
        setPagination({
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
        });
      }
    } catch (error) {
      console.error("Error fetching dishes:", error);
      toast.error("Failed to fetch dishes. Please try again later.");
    } finally {
    }
  };

  useEffect(() => {
    fetchDishes(searchTerm, pagination.currentPage, ITEMS_PER_PAGE);
  }, [searchTerm, pagination.currentPage]);

  const handleAddDish = () => {
    setFormMode("add");
    setFormData({
      name: "",
      price: "",
      description: "",
      category: "",
      image: "",
    });
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
    });
    setIsModalOpen(true);
  };

  const handleDeleteDish = (dish) => {
    setSelectedDish(dish);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setDishes(dishes.filter((dish) => dish.id !== selectedDish.id));
    setIsDeleteModalOpen(false);
  };
  // 123
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate Form Data
    if (
      !formData.name.trim() ||
      !formData.price ||
      !formData.description.trim() ||
      !formData.category.trim() ||
      !formData.image.trim()
    ) {
      toast.error("Please fill in all fields.", {
        position: "top-right",
        autoClose: 1500,
      });
      return;
    }

    const payload = {
      dish_name: formData.name,
      price: parseFloat(formData.price),
      description: formData.description,
      category_name: formData.category,
      image_link: formData.image,
    };

    try {
      if (formMode === "add") {
        await http(`/dish`, "POST", payload);
        toast.success("Dish added successfully!", {
          position: "top-right",
          autoClose: 1500,
        });
      } else if (formMode === "edit") {
        await http(`/dish/${selectedDish.dish_id}`, "PATCH", payload);
        toast.success("Dish updated successfully!", {
          position: "top-right",
          autoClose: 1500,
        });
      }
      setIsModalOpen(false);
      fetchDishes(searchTerm, pagination.currentPage);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit form. Please try again later.");
    }
  };

  const handleViewDetails = (dish) => {
    setSelectedDish(dish);
    setIsViewModalOpen(true);
  };

  return (
    <div className="restaurant-dish-manager">
      <div className="container">
        <div className="header">
          <h1 className="title">Restaurant Dish Manager</h1>
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
            placeholder="Search dishes by name"
            className="search-input"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPagination({ ...pagination, currentPage: 1 }); // Reset về trang đầu khi tìm kiếm
            }}
          />
        </div>

        <div className="dishes-grid">
          <AnimatePresence>
            {dishes.map((dish, idx) => (
              <motion.div
                key={dish.dish_id || idx}
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
                  <p className="dish-price">${dish.price.toFixed(2)}</p>
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
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div className="form-group-adddish">
                  <label htmlFor="category">Category</label>
                  <input
                    type="text"
                    id="category"
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
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
                  alt={selectedDish?.name}
                  className="dish-image"
                />
                <div className="dish-info">
                  <h3>{selectedDish?.dish_name}</h3>
                  <p>{selectedDish?.description}</p>
                  <p>Price: ${selectedDish?.price}</p>
                  <p>Category: {selectedDish?.category_name}</p>
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
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                currentPage: Math.max(prev.currentPage - 1, 1),
              }))
            }
            disabled={pagination.currentPage === 1}
            className="pagination-button"
            aria-label="Previous page"
          >
            <FiChevronLeft className="pagination-icon" />
          </button>
          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                currentPage: Math.min(
                  prev.currentPage + 1,
                  pagination.totalPages
                ),
              }))
            }
            disabled={pagination.currentPage === pagination.totalPages}
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

export default DishPage;
