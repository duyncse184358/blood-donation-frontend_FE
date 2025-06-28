import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import các trang chính của ứng dụng
import HomePage from './pages/Home/HomePage';
import LoginPage from './components/Auth/Login.jsx'; 
import RegisterPage from './components/Auth/Register';
import ForgotPasswordPage from './components/Auth/ForgotPassword'; 

// Import các trang placeholder
import BlogPage from './pages/BlogPage';
import DocumentationPage from './pages/DocumentationPage';
import NotFoundPage from './pages/NotFoundPage';

// Import trang quản lý chiến dịch (Admin)

// Import các trang mới dành cho Member
import MemberDashboardPage from './pages/Member/MemberDashboard'; 
import RegisterDonationPage from './pages/Member/RegisterDonation'; 
import DonationHistoryPage from './pages/Member/DonationHistory'; 
import RemindersPage from './pages/Member/Reminders'; 
import ProfileUpdatePage from './pages/Member/ProfileUpdate';

// Import các trang thông báo mới
import MemberNotificationsPage from './pages/Member/Notifications'; // Thông báo chung cho Member
import EmergencyNotificationsPage from './pages/Member/EmergencyNotifications'; // Thông báo khẩn cấp cho Member

// Staff
import StaffDashboardpage from './pages/Staff/StaffDashboard.jsx';
import NotificationForm from './pages/Staff/NotificationForm.jsx';
import NotificationSend from './pages/Staff/NotificationSend.jsx';
import DonorProfile from './pages/Staff/DonorProfileModal.jsx';
import BloodRequestManagement from './pages/Staff/BloodRequestManagement.jsx';
import EmergencyNotificationSend from './pages/Staff/EmergencyNotificationSend';

// Admin
import AdminDashboard from './pages/Admin/AdminDashboard';
import DashboardPage from './pages/Admin/DashboardPage';
import Report from './pages/Admin/Report';
import ManageUserAccount from './pages/Admin/ManageUserAccount.jsx';

// AuthContext và PrivateRoute
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/Router/PrivateRoute';
import './styles/App.css'; 

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="App">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/blog" element={<BlogPage />} />
                        <Route path="/documentation" element={<DocumentationPage />} />
                        <Route path="/unauthorized" element={<h2>Bạn không có quyền truy cập trang này.</h2>} />

                        {/* Private Routes */}
                        <Route element={<PrivateRoute />}>
                            <Route path="/notifications" element={<MemberNotificationsPage />} />
                        </Route>

                        {/* Member Routes */}
                        <Route element={<PrivateRoute roles={['Member', 'User']} />}> 
                            <Route path="/member/dashboard" element={<MemberDashboardPage />} />
                            <Route path="/member/register-donation" element={<RegisterDonationPage />} />
                            <Route path="/member/donation-history" element={<DonationHistoryPage />} />
                            <Route path="/member/reminders" element={<RemindersPage />} />
                            <Route path="/member/profile" element={<ProfileUpdatePage />} />
                            <Route path="/member/emergency-notifications" element={<EmergencyNotificationsPage />} />
                        </Route>

                        {/* Staff Routes */}
                        <Route element={<PrivateRoute roles={['Staff']} />}>
                            <Route path="/staff/dashboard" element={<StaffDashboardpage />} />
                            <Route path="/staff/notifications" element={<NotificationForm />} />
                            <Route path="/staff/notification-send" element={<NotificationSend />} />
                            <Route path="/staff/donor/:userId" element={<DonorProfile />} />
                            <Route path="/staff/blood-request-management" element={<BloodRequestManagement />} />
                            <Route path="/staff/emergency-notification/:id" element={<EmergencyNotificationSend />} />
                        </Route>

                        {/* Admin Routes */}
                        <Route element={<PrivateRoute roles={['Admin']} />}>
                            <Route path="/admin" element={<AdminDashboard />}>
                                <Route path="dashboard" element={<DashboardPage />} />
                                <Route path="manage-users" element={<DashboardPage />} />
                                <Route path="Report" element={<Report />} />
                            </Route>
                        </Route>
                        
                        {/* Fallback Route */}
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
