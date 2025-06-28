import React, { useState, useEffect } from 'react';
import { 
  MdRestaurant, 
  MdPeople, 
  MdTableBar, 
  MdAttachMoney,
  MdTrendingUp,
  MdCalendarToday,
  MdNotifications,
  MdSettings,
  MdMenu
} from 'react-icons/md';
import { FaUsers, FaChartLine, FaBell } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './Dashboard.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBranches: 0,
    totalEmployees: 0,
    totalTables: 0,
    totalRevenue: 0,
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Sample data for the chart
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Revenue',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  useEffect(() => {
    // Fetch dashboard data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Replace with actual API calls
      setStats({
        totalBranches: 5,
        totalEmployees: 120,
        totalTables: 50,
        totalRevenue: 150000,
      });

      setRecentActivities([
        {
          id: 1,
          type: 'reservation',
          message: 'New reservation for Table 5',
          time: '5 minutes ago',
        },
        {
          id: 2,
          type: 'order',
          message: 'New order #1234 received',
          time: '15 minutes ago',
        },
        {
          id: 3,
          type: 'employee',
          message: 'New employee joined',
          time: '1 hour ago',
        },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Restaurant MS</h2>
          <button 
            className="toggle-sidebar"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <MdMenu />
          </button>
        </div>
        <nav className="sidebar-nav">
          <a href="#" className="active">
            <MdRestaurant /> Dashboard
          </a>
          <a href="#">
            <MdPeople /> Employees
          </a>
          <a href="#">
            <MdTableBar /> Tables
          </a>
          <a href="#">
            <MdAttachMoney /> Revenue
          </a>
          <a href="#">
            <MdSettings /> Settings
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="search-bar">
            <input type="text" placeholder="Search..." />
          </div>
          <div className="top-bar-actions">
            <button className="notification-btn">
              <FaBell />
              <span className="notification-badge">3</span>
            </button>
            <div className="user-profile">
              <img src="https://via.placeholder.com/40" alt="User" />
              <span>Admin</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <MdRestaurant />
              </div>
              <div className="stat-info">
                <h3>Total Branches</h3>
                <p>{stats.totalBranches}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-info">
                <h3>Total Employees</h3>
                <p>{stats.totalEmployees}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <MdTableBar />
              </div>
              <div className="stat-info">
                <h3>Total Tables</h3>
                <p>{stats.totalTables}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <MdAttachMoney />
              </div>
              <div className="stat-info">
                <h3>Total Revenue</h3>
                <p>${stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Charts and Activities */}
          <div className="dashboard-grid">
            {/* Revenue Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Revenue Overview</h3>
                <div className="chart-actions">
                  <button className="active">Monthly</button>
                  <button>Weekly</button>
                  <button>Daily</button>
                </div>
              </div>
              <div className="chart-container">
                <Line data={revenueData} options={chartOptions} />
              </div>
            </div>

            {/* Recent Activities */}
            <div className="activities-card">
              <div className="card-header">
                <h3>Recent Activities</h3>
                <button className="view-all">View All</button>
              </div>
              <div className="activities-list">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      {activity.type === 'reservation' && <MdTableBar />}
                      {activity.type === 'order' && <MdAttachMoney />}
                      {activity.type === 'employee' && <MdPeople />}
                    </div>
                    <div className="activity-info">
                      <p>{activity.message}</p>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
              <button className="action-card">
                <MdTableBar />
                <span>Manage Tables</span>
              </button>
              <button className="action-card">
                <MdPeople />
                <span>Add Employee</span>
              </button>
              <button className="action-card">
                <MdCalendarToday />
                <span>View Schedule</span>
              </button>
              <button className="action-card">
                <MdTrendingUp />
                <span>View Reports</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 