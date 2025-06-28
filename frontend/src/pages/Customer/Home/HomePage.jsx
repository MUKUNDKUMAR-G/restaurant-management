import React, { useState, useEffect } from "react";
import {
  FaUtensils,
  FaPizzaSlice,
  FaLeaf,
  FaGlobeAsia,
  FaSearch,
} from "react-icons/fa";
import {
  MdSearch,
  MdLocationOn,
  MdStar,
  MdAccessTime,
  MdDirectionsCar,
  MdLocalParking,
  MdAir,
  MdOutdoorGrill
} from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import "./HomePage.css";
import { CardFood } from "../../../component/CardFood/CardFood";
import { http } from "../../../helpers/http";
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [error, setError] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState('');
  const [areas, setAreas] = useState([]);
  const [filters, setFilters] = useState({
    hasParking: false,
    hasAC: false,
    hasOutdoor: false,
    cuisineType: ''
  });

  const banners = [
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80",
      alt: "Modern restaurant interior with warm lighting and elegant dining setup",
    },
  ];

  const categoryIconMap = {
    "Appetizers": <FaPizzaSlice />,
    "Dessert": <FaLeaf />,
    "Fusion Roll": <FaUtensils />,
    "Fusion Specials": <FaUtensils />,
    "Innovative": <FaUtensils />,
    "Nigiri": <FaGlobeAsia />,
    "Rice Bowls": <FaUtensils />,
    "Salads": <FaLeaf />,
    "Sashimi": <FaUtensils />,
    "Starters": <FaPizzaSlice />,
    "Street Food Fusion": <FaUtensils />,
    "Wraps": <FaUtensils />,
  };

  function capitalizeWords(str) {
    return str.replace(/\b\w/g, c => c.toUpperCase());
  }

  const [categories, setCategories] = useState([]);

  const [bestSellers, setBestSellers] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchBranches();
    fetchAreas();
  }, [searchQuery, selectedArea, filters]);

  const fetchCategories = async () => {
    try {
      const response = await http("/dish", "GET");
      const data = response.data;
      if (data) {
        // Deduplicate and normalize
        const seen = new Set();
        const formattedCategories = [];
        data.forEach((cat) => {
          const rawName = cat.category_name || cat.name || "Unnamed Category";
          const name = capitalizeWords(rawName.trim().toLowerCase());
          if (!seen.has(name)) {
            seen.add(name);
            formattedCategories.push({
              name,
              icon: categoryIconMap[name] || <FaUtensils />,
            });
          }
        });
        setCategories(formattedCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await http(
        `/branch/search?query=${searchQuery}&area=${selectedArea}`,
        'GET'
      );
      let filteredBranches = response.data.branches || response.data || [];

      // Apply filters
      if (filters.hasParking) {
        filteredBranches = filteredBranches.filter(branch => 
          branch.has_car_park || branch.has_motorbike_park
        );
      }
      if (filters.hasAC) {
        filteredBranches = filteredBranches.filter(branch => branch.has_ac);
      }
      if (filters.hasOutdoor) {
        filteredBranches = filteredBranches.filter(branch => branch.has_outdoor_seating);
      }
      if (filters.cuisineType) {
        filteredBranches = filteredBranches.filter(branch => 
          branch.cuisine_type === filters.cuisineType
        );
      }

      setBranches(filteredBranches);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Failed to fetch branches');
      setError("Failed to load branches. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAreas = async () => {
    try {
      const response = await http('/region', 'GET');
      setAreas(response.data || []);
    } catch (error) {
      console.error('Error fetching areas:', error);
      setError("Failed to load areas. Please try again later.");
    }
  };

  const fetchBestSellers = async () => {
    try {
      const branchId = localStorage.getItem("selectedBranchId");
      if (!branchId) {
        setBestSellers([]);
        return;
      }

      const limit = 4;
      const page = 1;
      const sort = "price,desc";

      const response = await http(
        `/menu/${branchId}?limit=${limit}&sort=${sort}&page=${page}`,
        "GET"
      );

      if (response && response.data && response.data.listDish) {
        const formattedDishes = response.data.listDish.map((dish) => ({
          id: dish.dish_id,
          name: dish.dish_name,
          price: dish.price,
          description: dish.description,
          image: dish.image_link,
        }));
        setBestSellers(formattedDishes);
      }
    } catch (error) {
      console.error("Error fetching best sellers:", error);
      setError("Failed to load best sellers. Please try again later.");
    }
  };

  useEffect(() => {
    if (selectedBranchId) {
      fetchBestSellers();
    }
  }, [selectedBranchId]);

  useEffect(() => {
    const storedBranchId = localStorage.getItem("selectedBranchId");
    if (storedBranchId) {
      setSelectedBranchId(parseInt(storedBranchId, 10));
    } else {
      setIsOpen(true); // Open modal if no branch selected
    }
  }, []);

  const handleBranchSelect = (branchId) => {
    setSelectedBranchId(branchId);
    localStorage.setItem("selectedBranchId", branchId.toString());
    setIsOpen(false);
  };

  const openModal = () => {
    setIsOpen(true);
  };

  const selectedBranch = Array.isArray(branches) ? branches.find(
    (branch) => branch.branch_id === selectedBranchId
  ) : null;

  const filteredBestSellers = bestSellers.filter(
    (dish) =>
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const renderBranchCard = (branch) => {
    const area = areas.find(a => a.region_id === branch.region_id);
    
    return (
      <div className="branch-card" key={branch.branch_id}>
        <div className="branch-image">
          <img 
            src={branch.image_url || 'https://via.placeholder.com/400x300?text=Restaurant+Image'} 
            alt={branch.branch_name}
          />
          <div className="branch-rating">
            <MdStar className="star-icon" />
            <span>4.5</span>
          </div>
        </div>
        
        <div className="branch-content">
          <h3>{branch.branch_name}</h3>
          
          <div className="branch-info">
            <div className="info-item">
              <MdLocationOn />
              <span>{area?.region_name || 'N/A'}</span>
            </div>
            <div className="info-item">
              <MdAccessTime />
              <span>{branch.open_time} - {branch.close_time}</span>
            </div>
          </div>

          <div className="branch-features">
            {branch.has_car_park && (
              <span className="feature-tag">
                <MdDirectionsCar /> Parking
              </span>
            )}
            {branch.has_ac && (
              <span className="feature-tag">
                <MdAir /> AC
              </span>
            )}
            {branch.has_outdoor_seating && (
              <span className="feature-tag">
                <MdOutdoorGrill /> Outdoor
              </span>
            )}
          </div>

          <div className="branch-actions">
            <button className="reserve-btn">Reserve Table</button>
            <button className="view-menu-btn">View Menu</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="homepage min-h-screen bg-gray-50">
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2
              style={{
                display: "flex",
                justifyContent: "center",
                color: "red",
                fontSize: "35px",
              }}
            >
              Select Branch
            </h2>
            <ul className="branch-list">
              {Array.isArray(branches) && branches.map((branch) => (
                <li
                  key={branch.branch_id}
                  onClick={() => handleBranchSelect(branch.branch_id)}
                >
                  <h3>{branch.branch_name}</h3>
                  <p>{branch.address}</p>
                </li>
              ))}
            </ul>
            {selectedBranchId && (
              <button
                className="close-modal-button"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      <div className="banner relative h-60vh overflow-hidden">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`banner-slide absolute w-full h-full transition-opacity duration-1000 ${
              index === currentBanner ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={banner.image}
              alt={banner.alt}
              className="banner-image w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
        <div className="banner-overlay absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center space-y-6">
          {selectedBranchId && selectedBranch && (
            <div
              className="selected-branch-info"
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                padding: "10px 15px",
                borderRadius: "5px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              <button
                onClick={openModal}
                className="change-branch-button"
                style={{
                  backgroundColor: "#2196F3",
                  color: "#fff",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                {selectedBranch.branch_name}
              </button>
            </div>
          )}
          {/* <h1 className="banner-title">Discover Culinary Excellence</h1>
          <div className="search-bar relative w-full max-w-xl mx-auto px-4">
            <input
              type="text"
              placeholder="Search for dishes, restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <FaSearch className="search-icon" />
          </div> */}
        </div>
      </div>

      <div className="categories-section-modern">
        <h2 className="categories-title-modern">Categories</h2>
        <div className="categories-grid-modern">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className="category-card-modern"
              onClick={() => navigate(`/menu?category=${encodeURIComponent(cat.name)}`)}
              aria-label={`View ${cat.name} dishes`}
            >
              <span className="category-icon-modern">{cat.icon}</span>
              <span className="category-name-modern">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* <div className="branches-section max-w-7xl mx-auto px-4 py-12">
        <h2 className="section-title">Our Branches</h2>
        <div className="filter-controls">
          <div className="search-input-group">
            <MdSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search branches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="area-select"
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
          >
            <option value="">All Areas</option>
            {areas.map((area) => (
              <option key={area.region_id} value={area.region_name}>
                {area.region_name}
              </option>
            ))}
          </select>
          <div className="filter-checkboxes">
            <label>
              <input
                type="checkbox"
                checked={filters.hasParking}
                onChange={(e) => handleFilterChange('hasParking', e.target.checked)}
              />
              Parking
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.hasAC}
                onChange={(e) => handleFilterChange('hasAC', e.target.checked)}
              />
              AC
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.hasOutdoor}
                onChange={(e) => handleFilterChange('hasOutdoor', e.target.checked)}
              />
              Outdoor Seating
            </label>
            <select
              value={filters.cuisineType}
              onChange={(e) => handleFilterChange('cuisineType', e.target.value)}
            >
              <option value="">All Cuisines</option>
              <option value="Italian">Italian</option>
              <option value="Indian">Indian</option>
              <option value="Chinese">Chinese</option>
              <option value="Mexican">Mexican</option>
            </select>
          </div>
        </div>
        {loading ? (
          <div className="loading-spinner">
            <FaSpinner className="spinner-icon" />
            <p>Loading branches...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
          </div>
        ) : branches.length > 0 ? (
          <div className="branches-grid">
            {Array.isArray(branches) && branches.map((branch) => (
              renderBranchCard(branch)
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No branches found matching your criteria.</p>
          </div>
        )}
      </div> */}

      <div className="best-sellers max-w-7xl mx-auto px-4 py-12">
        <h2 className="section-title">Best Sellers</h2>
        <div className="best-sellers-grid">
          {filteredBestSellers.map((dish) => (
            <CardFood key={dish.id} dish={dish} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
