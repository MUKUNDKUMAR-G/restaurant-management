import React, { useState, useEffect } from "react";
import { FiDownload } from "react-icons/fi";
import { FaStore, FaChartLine, FaUsers, FaFileInvoice } from "react-icons/fa";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./DashboardPage.css"; // Importing the CSS
import { http } from "../../../helpers/http";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  const [region, setRegion] = useState("all");
  const [branch, setBranch] = useState("main");
  const [periodType, setPeriodType] = useState("daily");

  const [regions, setRegions] = useState([]);
  const [branches, setBranches] = useState([]);
  const [appliedBranch, setAppliedBranch] = useState(null); // Branch được áp dụng
  const [appliedPeriodType, setAppliedPeriodType] = useState("daily"); // PeriodType được áp dụng

  const [dailyFilters, setDailyFilters] = useState({ month: "", year: "" });
  const [monthlyFilters, setMonthlyFilters] = useState({
    year: "",
    quarter: "",
  });
  const [quarterlyFilters, setQuarterlyFilters] = useState({ year: "" });
  const [overallFilters, setOverallFilters] = useState({
    startYear: "",
    endYear: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    totalRevenue: 0,
    orders: 0,
    customers: 0,
    revenueStats: { labels: [], datasets: [] },
    servicesRate: { labels: [], datasets: [] },
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const response = await http(`/region`, "GET");
      const data = response.data;
      setRegions(data || []); // Lưu danh sách region vào state
    } catch (error) {
      console.error("Error fetching regions:", error);
      toast.error("Failed to fetch regions.", {
        position: "top-right",
        autoClose: 1500,
      });
    }
  };

  const fetchBranches = async (selectedRegion) => {
    if (selectedRegion !== "all") {
      try {
        const queryParams = new URLSearchParams({
          region_id: selectedRegion,
          page: 1,
          limit: 100,
        }).toString();

        const response = await http(`/branch/search?${queryParams}`, "GET");
        const data = response.data;
        setBranches(data.branches || []);
      } catch (error) {
        console.error("Error fetching branches for region:", error);
        toast.error("Failed to fetch branches for selected region.", {
          position: "top-right",
          autoClose: 1500,
        });
      }
    } else {
      setBranches([]);
    }
  };

  const fetchData = async (branchId, period) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      // Xây dựng query dựa trên periodType
      if (period === "daily") {
        const { month, year } = dailyFilters;
        queryParams.append("time_type", "Daily");
        queryParams.append("month", month);
        queryParams.append("year", year);
      } else if (period === "monthly") {
        const { year, quarter } = monthlyFilters;
        queryParams.append("time_type", "Monthly");
        queryParams.append("year", year);
        queryParams.append("quarter", quarter);
      } else if (period === "quarterly") {
        const { year } = quarterlyFilters;
        queryParams.append("time_type", "Quarterly");
        queryParams.append("year", year);
      } else if (period === "overall") {
        let { startYear, endYear } = overallFilters;
        const currentYear = new Date().getFullYear();
        if (!startYear) startYear = currentYear;
        if (!endYear) endYear = currentYear;
        queryParams.append("time_type", "Overall");
        queryParams.append("start_year", startYear);
        queryParams.append("end_year", endYear);
      }

      queryParams.append("branch_id", branchId);
      console.log("Query Params:", queryParams.toString());
      const response = await http(`/analysis?${queryParams.toString()}`, "GET");
      const result = response.data;
      if (result) {
        const { totalRevenue, orders, customers, revenueStats, ServicesRate } =
          result;
        console.log("Revenue Stats:", revenueStats);
        setData({
          totalRevenue,
          orders,
          customers,
          revenueStats: {
            labels: revenueStats.label,
            datasets: [
              {
                label: revenueStats.datasets.label,
                data: revenueStats.datasets.data,
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1,
              },
            ],
          },
          servicesRate: {
            labels: ServicesRate.label,
            datasets: [
              {
                label: ServicesRate.datasets.label,
                data: ServicesRate.datasets.data,
                backgroundColor: "rgba(53, 162, 235, 0.5)",
              },
            ],
          },
        });
        setError(null);
      } else {
        throw new Error(result.message || "Failed to fetch data");
      }
    } catch (err) {
      setError(err.message || "Lỗi khi lấy dữ liệu từ API.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    setAppliedBranch(branch);
    setAppliedPeriodType(periodType);
    console.log("Applied Branch:", branch);
    console.log("Applied Period Type:", periodType);
    fetchData(branch, periodType);
  };

  const StatCard = React.memo(({ icon: Icon, title, value, color }) => (
    <div className="stat-card">
      <div className="stat-card-header">
        <div>
          <p className="stat-card-title">{title}</p>
          <p className="stat-card-value">{value}</p>
        </div>
        <div className={`${color} stat-card-icon`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  ));

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <div className="error-message">
          <strong>Error!</strong>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="revenue-dashboard">
      <div className="dashboard-container">
        <div className="header-dashboard">
          <h1 className="title">Revenue Dashboard</h1>
          <div className="filters">
            <select
              value={region}
              onChange={(e) => {
                const selectedRegion = e.target.value;
                setRegion(selectedRegion);
                fetchBranches(selectedRegion);
              }}
              className="filter-select"
              aria-label="Select Region"
            >
              <option value="all">All Regions</option>
              {regions.map((region) => (
                <option key={region.region_id} value={region.region_id}>
                  {region.region_name}
                </option>
              ))}
            </select>

            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)} // Cập nhật trực tiếp state branch
              className="filter-select"
              aria-label="Select Branch"
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.branch_id} value={branch.branch_id}>
                  {branch.branch_name}
                </option>
              ))}
            </select>

            <select
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value)} // Cập nhật trực tiếp state periodType
              className="filter-select"
              aria-label="Select Period Type"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="overall">Overall</option>
            </select>

            {/* Time-specific filters */}
            {periodType === "daily" && (
              <div className="time-filters">
                <select
                  value={dailyFilters.month}
                  onChange={(e) =>
                    setDailyFilters({ ...dailyFilters, month: e.target.value })
                  }
                  className="filter-select"
                  aria-label="Select Month"
                >
                  <option value="">Select Month</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {`Month ${i + 1}`}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={dailyFilters.year}
                  onChange={(e) =>
                    setDailyFilters({ ...dailyFilters, year: e.target.value })
                  }
                  className="filter-input"
                  placeholder="Year"
                  aria-label="Enter Year"
                />
              </div>
            )}

            {periodType === "monthly" && (
              <div className="time-filters">
                <input
                  type="number"
                  value={monthlyFilters.year}
                  onChange={(e) =>
                    setMonthlyFilters({
                      ...monthlyFilters,
                      year: e.target.value,
                    })
                  }
                  className="filter-input"
                  placeholder="Year"
                  aria-label="Enter Year"
                />
                <select
                  value={monthlyFilters.quarter}
                  onChange={(e) =>
                    setMonthlyFilters({
                      ...monthlyFilters,
                      quarter: e.target.value,
                    })
                  }
                  className="filter-select"
                  aria-label="Select Quarter"
                >
                  <option value="">Select Quarter</option>
                  <option value="1">Q1</option>
                  <option value="2">Q2</option>
                  <option value="3">Q3</option>
                  <option value="4">Q4</option>
                </select>
              </div>
            )}

            {periodType === "quarterly" && (
              <div className="time-filters">
                <input
                  type="number"
                  value={quarterlyFilters.year}
                  onChange={(e) =>
                    setQuarterlyFilters({
                      ...quarterlyFilters,
                      year: e.target.value,
                    })
                  }
                  className="filter-input"
                  placeholder="Year"
                  aria-label="Enter Year"
                />
              </div>
            )}

            {periodType === "overall" && (
              <div className="time-filters">
                <input
                  type="number"
                  value={overallFilters.startYear}
                  onChange={(e) =>
                    setOverallFilters({
                      ...overallFilters,
                      startYear: e.target.value,
                    })
                  }
                  className="filter-input"
                  placeholder="Start Year"
                  aria-label="Enter Start Year"
                />
                <input
                  type="number"
                  value={overallFilters.endYear}
                  onChange={(e) =>
                    setOverallFilters({
                      ...overallFilters,
                      endYear: e.target.value,
                    })
                  }
                  className="filter-input"
                  placeholder="End Year"
                  aria-label="Enter End Year"
                />
              </div>
            )}

            <button onClick={handleApply} className="apply-button">
              Apply
            </button>
          </div>
        </div>

        <div className="stats">
          <StatCard
            icon={FaStore}
            title="Total Revenue"
            value={`$${data.totalRevenue.toLocaleString()}`}
            color="bg-blue-500"
          />
          <StatCard
            icon={FaFileInvoice}
            title="Orders"
            value={data.orders.toLocaleString()}
            color="bg-green-500"
          />
          <StatCard
            icon={FaUsers}
            title="Customers"
            value={data.customers.toLocaleString()}
            color="bg-purple-500"
          />
        </div>

        <div className="charts">
          <div className="chart-container">
            <h2 className="chart-title">Revenue Statistics</h2>
            <Line data={data.revenueStats} options={{ responsive: true }} />
          </div>
          <div className="chart-container">
            <h2 className="chart-title">Service Rate</h2>
            <Bar
              data={data.servicesRate}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: { display: true, text: "Rate" },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
