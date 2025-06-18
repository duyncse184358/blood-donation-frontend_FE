// src/components/Router/PrivateRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth'; // Import useAuth hook
import LoadingSpinner from '../Shared/LoadingSpinner'; // ĐÃ SỬA ĐƯỜNG DẪN: Nếu PrivateRoute ở src/components/Router, LoadingSpinner ở src/components/Shared

/**
 * A private route component that checks for user authentication and role.
 * If not authenticated, redirects to login.
 * If authenticated but unauthorized (wrong role), redirects to /unauthorized.
 * Displays child routes (Outlet) if authorized.
 * @param {object} props - Component props.
 * @param {Array<string>} [props.roles] - An array of roles allowed to access this route (e.g., ['Admin', 'Staff']).
 * If not provided, only checks for authentication.
 */
function PrivateRoute({ roles }) {
  const { isAuthenticated, user, loading } = useAuth(); // Lấy trạng thái từ useAuth

  console.log("PrivateRoute Debug: Loading:", loading);
  console.log("PrivateRoute Debug: isAuthenticated:", isAuthenticated);
  console.log("PrivateRoute Debug: User object:", user);
  console.log("PrivateRoute Debug: Required roles for this route:", roles);


  // Hiển thị spinner khi đang tải trạng thái xác thực ban đầu
  if (loading) {
    console.log("PrivateRoute Debug: Still loading authentication state...");
    return <LoadingSpinner />;
  }

  // Nếu chưa xác thực, chuyển hướng đến trang đăng nhập
  if (!isAuthenticated) {
    console.warn("PrivateRoute Warn: User is not authenticated. Redirecting to /login.");
    return <Navigate to="/login" replace />;
  }

  // Nếu có yêu cầu về vai trò
  if (roles && roles.length > 0) {
    // Kiểm tra xem người dùng có vai trò phù hợp không
    // user?.role?.toLowerCase() để đảm bảo so sánh không phân biệt hoa thường
    const userRole = user?.role?.toLowerCase();
    const requiredRoles = (roles || []).map(r => r.toLowerCase());
    const hasRole = requiredRoles.length === 0 || requiredRoles.includes(userRole);

    console.log("PrivateRoute Debug: User's actual role from AuthContext:", userRole);
    console.log("PrivateRoute Debug: User has required role?:", hasRole);

    if (!hasRole) {
      // Nếu không có vai trò phù hợp, chuyển hướng đến trang không có quyền
      console.warn("PrivateRoute Warn: User does not have required role. Redirecting to /unauthorized.");
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Nếu đã xác thực và có vai trò phù hợp (nếu có yêu cầu), hiển thị nội dung route con
  console.log("PrivateRoute Debug: User is authorized. Rendering Outlet.");
  return <Outlet />;
}

export default PrivateRoute;
