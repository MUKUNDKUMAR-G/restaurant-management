import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
// nofication
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// scroll to top
import ScrollToTop from "./component/ScrollToTop/ScrollToTop";

// customer
import { MainLayout } from "./layouts/MainLayout/MainLayout";
import HomePage from "./pages/Customer/Home/HomePage";
import MenuPage from "./pages/Customer/Menu/MenuPage";
import DetailPage from "./pages/Customer/Detail/DetailPage";
import CartPage from "./pages/Customer/Cart/CartPage";
import { BookTablePage } from "./pages/Customer/BookTable/BookTablePage";
import { ContactPage } from "./pages/Customer/Contact/ContactPage";
import { ProfilePage } from "./pages/Customer/Profile/ProfilePage";
import { HistoryPage } from "./pages/Customer/History/HistoryPage";
import { LogInPage } from "./pages/Customer/LogIn/LogInPage";
import { OrderDetailPage } from "./pages/Customer/OrderDetail/OrderDetailPage";
// end customer
// staff
import { StaffLayout } from "./layouts/StaffLayout/StaffLayout";
import { ProfileStaffPage } from "./pages/Staff/Profile/ProfileStaffPage";
import { ListReservationPage } from "./pages/Staff/ListReservation/ListReservationPage";
import { OrderPage } from "./pages/Staff/Order/OrderPage";
import { OrderOnlinePage } from "./pages/Staff/OrderOnline/OrderOnlinePage";
import { BillPage } from "./pages/Staff/Bill/BillPage";
import { CreateSlipPage } from "./pages/Staff/CreateSlip/CreateSlipPage";
import { AnalyticPage } from "./pages/Staff/Analytic/AnalyticPage";
import { EmployeesPage } from "./pages/Staff/Employees/EmployeesPage";
import { CartProvider } from "./component/CardContext/CardContext";
import { StaffLogInPage } from "./pages/Staff/LogIn/StaffLogInPage";
import ManagementDishPage from "./pages/Staff/ManagementDish/ManagementDishPage";
import { ManagementCustomerPage } from "./pages/Staff/ManagementCustomer/ManagementCustomerPage";

// end staff

// admin
import { AdminLayout } from "./layouts/AdminLayout/AdminLayout";
import { AdminLogInPage } from "./pages/Admin/LogIn/AdminLogInPage";
import ManagementEmployeePage from "./pages/Admin/ManagementEmployee/ManagementEmployeePage";
import DepartmentPage from "./pages/Admin/Department/DepartmentPage";
import DashboardPage from "./pages/Admin/Dashboard/DashboardPage";
import BranchPage from "./pages/Admin/Branch/BranchPage";
import DishPage from "./pages/Admin/Dish/DishPage";

function App() {
  return (
    <>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Customer */}
            <Route
              path="/"
              element={
                <MainLayout title="Home">
                  <HomePage />
                </MainLayout>
              }
            />
            <Route
              path="/menu"
              element={
                <MainLayout title="Menu">
                  <MenuPage />
                </MainLayout>
              }
            />
            <Route
              path="/detail/:id"
              element={
                <MainLayout title="Detail">
                  <DetailPage />
                </MainLayout>
              }
            />
            <Route
              path="/cart"
              element={
                <MainLayout title="Cart">
                  <CartPage />
                </MainLayout>
              }
            />
            <Route
              path="/booktable"
              element={
                <MainLayout title="Book Table">
                  <BookTablePage />
                </MainLayout>
              }
            />
            <Route
              path="/contact"
              element={
                <MainLayout title="Contact">
                  <ContactPage />
                </MainLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <MainLayout title="Profile">
                  <ProfilePage />
                </MainLayout>
              }
            />
            <Route
              path="/activity-history"
              element={
                <MainLayout title="History">
                  <HistoryPage />
                </MainLayout>
              }
            />
            {/* <Route path="/login" element={<LogInPage />} /> */}
            <Route
              path="/login"
              element={
                <MainLayout title="Log In">
                  <LogInPage />
                </MainLayout>
              }
            />
            <Route
              path="/order-detail/:id"
              element={
                <MainLayout title="Order Detail">
                  <OrderDetailPage />
                </MainLayout>
              }
            />

            {/* End Customer */}

            {/* Staff */}
            <Route
              path="/staff/dashboard"
              element={
                <StaffLayout title="Dashboard">
                  <ProfileStaffPage />
                </StaffLayout>
              }
            />
            <Route
              path="/staff/profile"
              element={
                <StaffLayout title="Profile">
                  <ProfileStaffPage />
                </StaffLayout>
              }
            />
            <Route
              path="/staff/reservation-list"
              element={
                <StaffLayout title="Reservation">
                  <ListReservationPage />
                </StaffLayout>
              }
            />
            <Route
              path="/staff/order"
              element={
                <StaffLayout title="Order">
                  <OrderPage />
                </StaffLayout>
              }
            />
            <Route
              path="/staff/order-online-list"
              element={
                <StaffLayout title="Order Online">
                  <OrderOnlinePage />
                </StaffLayout>
              }
            />
            <Route
              path="/staff/bill"
              element={
                <StaffLayout title="Bill">
                  <BillPage />
                </StaffLayout>
              }
            />
            <Route
              path="/staff/customer"
              element={
                <StaffLayout title="Customer">
                  <ManagementCustomerPage />
                </StaffLayout>
              }
            />
            <Route
              path="/staff/create-slip"
              element={
                <StaffLayout title="Create SLip">
                  <CreateSlipPage />
                </StaffLayout>
              }
            />
            <Route
              path="/staff/dish"
              element={
                <StaffLayout title="Dish">
                  <ManagementDishPage />
                </StaffLayout>
              }
            />
            <Route
              path="/staff/analytic"
              element={
                <StaffLayout title="Analytic">
                  <AnalyticPage />
                </StaffLayout>
              }
            />
            <Route
              path="/staff/employee"
              element={
                <StaffLayout title="Employees">
                  <EmployeesPage />
                </StaffLayout>
              }
            />
            <Route path="/staff" element={<StaffLogInPage />} />

            {/* End Staff */}

            {/* Admin */}
            <Route path="/admin/" element={<AdminLogInPage />} />
            <Route
              path="/admin/dashboard"
              element={
                <AdminLayout title="Dashboard">
                  <DashboardPage />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/employee"
              element={
                <AdminLayout title="Employee">
                  <ManagementEmployeePage />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/department"
              element={
                <AdminLayout title="Department">
                  <DepartmentPage />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/dish"
              element={
                <AdminLayout title="Dish">
                  <DishPage />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/branch"
              element={
                <AdminLayout title="Branch">
                  <BranchPage />
                </AdminLayout>
              }
            />
            {/* End Admin */}
          </Routes>
        </Router>
      </CartProvider>
      <div>
        {/* ToastContainer quản lý hiển thị thông báo */}
        <ToastContainer />
        {/* Các component khác */}
      </div>
    </>
  );
}
export default App;
