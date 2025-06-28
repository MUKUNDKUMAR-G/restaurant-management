import React, { useState, useEffect } from "react";
import { FiDownload } from "react-icons/fi";
import { FaStore, FaUsers, FaFileInvoice } from "react-icons/fa";
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
import "./AnalyticPage.css";
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

export const AnalyticPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await http("/analysis/modern", "GET");
        setData(response);
        setError(null);
      } catch (err) {
        setError("Failed to fetch analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }
  if (error) {
    return <div className="error"><strong>Error!</strong> <span>{error}</span></div>;
  }
  if (!data) {
    return <div className="empty-analytics"><h2>No analytics data available.</h2></div>;
  }

  // Defensive checks for all analytics arrays
  const revenueOverTime = Array.isArray(data?.revenue_over_time) ? data.revenue_over_time : [];
  const ordersByBranch = Array.isArray(data?.orders_by_branch) ? data.orders_by_branch : [];
  const topDishes = Array.isArray(data?.top_dishes) ? data.top_dishes : [];
  const ordersList = Array.isArray(data?.orders_list) ? data.orders_list : [];
  const summaryArray = Array.isArray(data?.summary) ? data.summary : [];

  // Prepare chart data
  const revenueChartData = {
    labels: revenueOverTime.map((row) => row.date),
    datasets: [
      {
        label: "Revenue",
        data: revenueOverTime.map((row) => row.revenue),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
      },
    ],
  };
  const branchChartData = {
    labels: ordersByBranch.map((row) => row.branch_name),
    datasets: [
      {
        label: "Orders",
        data: ordersByBranch.map((row) => row.orders),
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  return (
    <div className="modern-analytics-dashboard">
      <div className="dashboard-cards">
        <div className="stat-card">
          <div className="stat-card-title">Total Revenue</div>
          <div className="stat-card-value">₹{summaryArray.reduce((total, branch) => total + (branch.total_revenue ?? 0), 0)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">Total Orders</div>
          <div className="stat-card-value">{summaryArray.reduce((total, branch) => total + (branch.total_orders ?? 0), 0)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">Total Customers</div>
          <div className="stat-card-value">{summaryArray.reduce((total, branch) => total + (branch.total_customers ?? 0), 0)}</div>
        </div>
      </div>
      <div className="dashboard-charts">
        <div className="chart-container">
          <h3>Revenue Over Time (Last 30 Days)</h3>
          <Line data={revenueChartData} />
        </div>
        <div className="chart-container">
          <h3>Orders by Branch</h3>
          <Bar data={branchChartData} />
        </div>
      </div>
      <div className="dashboard-tables">
        <div className="table-container">
          <h3>Branch Summary</h3>
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Branch</th>
                <th>Total Orders</th>
                <th>Total Revenue</th>
                <th>Total Customers</th>
              </tr>
            </thead>
            <tbody>
              {summaryArray.map((branch, idx) => (
                <tr key={idx}>
                  <td>{branch.branch_name}</td>
                  <td>{branch.total_orders}</td>
                  <td>₹{branch.total_revenue ?? 0}</td>
                  <td>{branch.total_customers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-container">
          <h3>Top Dishes (Last 30 Days)</h3>
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Dish</th>
                <th>Orders</th>
              </tr>
            </thead>
            <tbody>
              {topDishes.map((dish, idx) => (
                <tr key={idx}>
                  <td>{dish.dish_name}</td>
                  <td>{dish.total_orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-container">
          <h3>Recent Orders (Last 30 Days)</h3>
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Branch</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {ordersList.map((order, idx) => (
                <tr key={idx}>
                  <td>{order.order_id}</td>
                  <td>{order.branch_name}</td>
                  <td>₹{order.amount}</td>
                  <td>{order.status}</td>
                  <td>{new Date(order.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
