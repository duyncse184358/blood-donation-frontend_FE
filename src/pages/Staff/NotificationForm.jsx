// src/pages/Staff/NotificationForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/Api';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import useAuth from '../../hooks/useAuth';
import { 
  translateNotificationType, 
  translateMessage, 
  translateDate, 
  translateBoolean,
  translateRole 
} from '../../utils/translationUtils';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/Notification.css';

// Các hàm dịch đã được chuyển sang translationUtils.js

function NotificationForm() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  // BỎ: const [showSendModal, setShowSendModal] = useState(false); // Xóa state này
  const navigate = useNavigate();
  const { user, isAdmin, isStaff } = useAuth(); // Lấy thông tin user và quyền

  // Hàm fetch danh sách thông báo (sử dụng useCallback để tối ưu)
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // API này yêu cầu quyền Admin, nếu Staff gọi sẽ bị 403
      const res = await api.get('/Notification'); 
      // Sắp xếp thông báo theo ngày gửi mới nhất (nếu Backend chưa làm)
      const sortedNotifications = (res.data || []).sort((a, b) => {
        const dateA = new Date(a.sentDate || 0); // Xử lý null
        const dateB = new Date(b.sentDate || 0);
        return dateB.getTime() - dateA.getTime();
      });
      setNotifications(sortedNotifications);
    } catch (err) {
      console.error("Lỗi khi tải danh sách thông báo:", err.response || err);
      if (err.response && err.response.status === 403) {
        setError('Bạn không có quyền xem danh sách tất cả thông báo (chỉ quản trị viên).');
      } else if (err.response && err.response.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login'); // Điều hướng về trang đăng nhập
      } else {
        setError('Không thể tải danh sách thông báo. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]); // navigate là dependency của useCallback

  // Effect để gọi fetchNotifications khi component mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]); // fetchNotifications là dependency của useEffect

  // Xử lý tạo thông báo mới (CHUYỂN HƯỚNG SANG TRANG KHÁC)
  const handleCreateNotification = () => {
    navigate('/staff/notification-send'); // Điều hướng sang trang tạo thông báo
  };

  // Thêm nút về dashboard
  const handleGoDashboard = () => {
    navigate('/staff/dashboard');
  };

  // Hàm gọi lại khi modal đóng hoặc gửi thành công (KHÔNG CẦN NỮA)
  /* const handleModalClose = (success = false) => {
    setShowSendModal(false);
    if (success) {
      fetchNotifications(); // Refresh danh sách thông báo sau khi gửi thành công
    }
  }; */

  // Kiểm tra quyền truy cập trang này
  // Nếu không phải Admin hoặc Staff, chuyển hướng hoặc hiển thị thông báo lỗi
  if (!user || (!isAdmin && !isStaff)) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-danger text-center">
        <h2 className="mb-3">Bạn không có quyền truy cập trang này.</h2>
        <p className="lead">Chỉ quản trị viên hoặc nhân viên mới có thể quản lý thông báo.</p>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/login')}>Đăng nhập</button>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* BỎ Header và Navbar */}
      <main className="container my-5 notification-admin-main">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-primary mb-0">Quản lý Thông báo</h1>
          <button className="btn btn-outline-secondary" onClick={handleGoDashboard}>
            Về Dashboard
          </button>
        </div>
        {/* Nút tạo thông báo */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Danh sách thông báo hiện tại</h4>
          {(isAdmin || isStaff) && (
            <button
              className="btn btn-success notification-create-btn"
              onClick={handleCreateNotification}
              disabled={loading}
            >
              Tạo thông báo mới
            </button>
          )}
        </div>
        {loading ? (
          <div className="text-center my-5">
            <LoadingSpinner />
            <p className="mt-2">Đang tải danh sách thông báo...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center">{error}</div>
        ) : (
          <div className="table-responsive shadow-sm rounded-lg">
            <table className="table table-hover table-striped notification-table">
              <thead className="thead-dark">
                <tr>
                  <th>ID Người nhận</th>
                  <th>Loại</th>
                  <th>Nội dung</th>
                  <th>Ngày gửi</th>
                  <th>Đã đọc</th>
                </tr>
              </thead>
              <tbody>
                {notifications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">Không có thông báo nào.</td>
                  </tr>
                ) : (
                  notifications
                    .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
                    .map(n => (
                      <tr key={n.notificationId} className={!n.isRead ? 'table-warning' : ''}>
                        <td>{translateRole(n.recipientUserId)}</td>
                        <td>{translateNotificationType(n.type)}</td>
                        <td>{translateMessage(n.message)}</td>
                        <td>{translateDate(n.sentDate)}</td>
                        <td>{translateBoolean(n.isRead) ? 'Đã đọc' : 'Chưa đọc'}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
            {/* Pagination */}
            {notifications.length > PAGE_SIZE && (
              <nav className="mt-3">
                <ul className="pagination justify-content-center">
                  <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 1}>Trước</button>
                  </li>
                  {Array.from({ length: Math.ceil(notifications.length / PAGE_SIZE) }, (_, i) => (
                    <li key={i + 1} className={`page-item${page === i + 1 ? ' active' : ''}`}>
                      <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                    </li>
                  ))}
                  <li className={`page-item${page === Math.ceil(notifications.length / PAGE_SIZE) ? ' disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(page + 1)} disabled={page === Math.ceil(notifications.length / PAGE_SIZE)}>Sau</button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        )}
      </main>
      {/* BỎ Footer */}
    </div>
  );
}

export default NotificationForm;