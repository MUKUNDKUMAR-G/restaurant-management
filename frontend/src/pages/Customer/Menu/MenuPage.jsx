import React, { useState, useEffect } from "react";
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { BsFilterLeft, BsSortDownAlt, BsGrid, BsList } from "react-icons/bs";
import { MdOutlineCategory } from "react-icons/md";
import "./MenuPage.css";
import { CardFood } from "../../../component/CardFood/CardFood";
import { http } from "../../../helpers/http";
import { useLocation } from "react-router-dom";

const MenuPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 6;

  const [dishes, setDishes] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);

  const location = useLocation();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // On mount, check for ?category= in the URL
    const params = new URLSearchParams(location.search);
    const cat = params.get("category");
    if (cat) {
      setSelectedCategory(cat.trim().toLowerCase());
    }
  }, [location.search]);

  const fetchCategories = async () => {
    try {
      const response = await http("/dish", "GET");
      const data = response.data;
      if (data) {
        const formattedCategories = [
          { value: "all", label: "All Categories" },
          ...data.map((cat) => ({
            value: cat.category_name.toLowerCase(),
            label: cat.category_name,
          })),
        ];
        setCategories(formattedCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to fetch categories.");
    }
  };

  const fetchMenu = async (branchId) => {
    const res = await http(`/menu/${branchId}`, "GET");
    setDishes(res.data.listDish);
  };

  const fetchDishes = async (
    page = 1,
    limit = itemsPerPage,
    sort = "price,asc",
    query = "",
    category = "all"
  ) => {
    setLoading(true);
    setError("");
    try {
      const branchId = localStorage.getItem("selectedBranchId");
      if (!branchId) throw new Error("Branch ID not found in localStorage");

      const params = new URLSearchParams({
        limit,
        sort,
        page,
        query,
      });

      if (category !== "all") {
        params.append("category", category);
      }

      const fetchMenu = await http(
        `/menu/${branchId}?${params.toString()}`,
        "GET"
      );

      const data = fetchMenu.data;
      if (data) {
        setDishes(data.listDish);
        setPagination({
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
        });
      } else {
        throw new Error("No data received from API");
      }
    } catch (error) {
      console.error("Error fetching dishes:", error);
      setError("Failed to fetch dishes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDishes(
      currentPage,
      itemsPerPage,
      `${sortOrder === "asc" ? "price,asc" : "price,desc"}`,
      searchQuery,
      selectedCategory
    );
  }, [currentPage, sortOrder, searchQuery, selectedCategory]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
    setCurrentPage(1);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid");
  };

  return (
    <div className="menu-container">
      {/* Hero Section */}
      <div className="menu-hero">
        <h1>Our Menu</h1>
        <p>Discover our delicious dishes and culinary delights</p>
      </div>

      {/* Search and Controls Section */}
      <div className="menu-controls">
        <div className="search-section">
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search dishes..."
              className="search-input"
              aria-label="Search dishes"
            />
          </div>
        </div>

        <div className="view-controls">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="filter-toggle"
            aria-label="Toggle filters"
          >
            <BsFilterLeft />
            <span>Filters</span>
          </button>
          <div className="view-mode-toggle">
            <button
              onClick={toggleViewMode}
              className={`view-mode-btn ${viewMode === "grid" ? "active" : ""}`}
              aria-label="Grid view"
            >
              <BsGrid />
            </button>
            <button
              onClick={toggleViewMode}
              className={`view-mode-btn ${viewMode === "list" ? "active" : ""}`}
              aria-label="List view"
            >
              <BsList />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className={`filters-section ${showFilters ? "show" : ""}`}>
        <div className="filter-group">
          <div className="filter-item">
            <MdOutlineCategory className="filter-icon" />
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="filter-select"
              aria-label="Filter by category"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <BsSortDownAlt className="filter-icon" />
            <select
              value={sortOrder}
              onChange={handleSortChange}
              className="filter-select"
              aria-label="Sort by price"
            >
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dishes Grid/List */}
      <div className={`dishes-container ${viewMode}`}>
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading dishes...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
          </div>
        ) : dishes.length > 0 ? (
          dishes.map((dish) => (
            <CardFood
              dish={{
                id: dish.dish_id,
                name: dish.dish_name,
                category: dish.category_name,
                price: dish.price,
                description: dish.description,
                image: dish.image_link,
              }}
              key={dish.dish_id}
              viewMode={viewMode}
            />
          ))
        ) : (
          <div className="no-results">
            <h3>No dishes found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && dishes.length > 0 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-button"
            aria-label="Previous page"
          >
            <FiChevronLeft />
          </button>
          <span className="pagination-info">
            Page {currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages))
            }
            disabled={currentPage === pagination.totalPages}
            className="pagination-button"
            aria-label="Next page"
          >
            <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
