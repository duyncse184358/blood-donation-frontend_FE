// src/pages/Member/Notifications.jsx
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar'; // Điều chỉnh đường dẫn chính xác
import Footer from '../../components/Footer/Footer';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import useAuth from '../../hooks/useAuth';
import api from '../../services/Api';
import './Notifications.css'; // Import CSS tùy chỉnh cho Notifications

function Notifications() {
  // SỬA ĐỔI: Dùng `user` thay vì `currentUser`
  const { isAuthenticated, user } = useAuth(); 
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserNotifications = async () => {
      // SỬA ĐỔI: Kiểm tra `user?.userId`
      if (!isAuthenticated || !user?.userId) { 
        setLoading(false);
        setError('Vui lòng đăng nhập để xem thông báo.');
        return;
      }
      setLoading(true);
      setError('');
      try {
        // SỬA ĐỔI: Gọi API `/Notification/by-user/${user.userId}`
        const res = await api.get(`/Notification/by-user/${user.userId}`); 
        setNotifications(res.data || []); 
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        setError('Không thể tải thông báo. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserNotifications();
  }, [isAuthenticated, user?.userId]); // Dependency: `user?.userId`

  // Đánh dấu đã đọc notification
  const markAsRead = async (notificationId) => {
    try {
      // SỬA ĐỔI: Bao gồm `user.userId` trong body
      await api.put(`/Notification/${notificationId}`, { isRead: true, recipientUserId: user.userId }); 
      setNotifications(prev =>
        prev.map(n => n.notificationId === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (err) {
        console.error("Failed to mark notification as read:", err);
        setError('Không thể đánh dấu đã đọc. Vui lòng thử lại.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-wrapper">
      <Header />
      {/* SỬA ĐỔI: Đảm bảo đường dẫn đến Navbar là components/Shared/Navbar */}
      <Navbar /> 
      <main className="container my-5 notification-page-main"> {/* Thêm class cho main content */}
        <h1 className="text-center mb-4 text-info animate__animated animate__fadeInDown">Thông báo của tôi</h1>
        <p className="text-center lead text-muted animate__animated animate__fadeIn">Chỉ hiển thị các thông báo gửi cho bạn hoặc thông báo chung.</p>
        
        {error && <div className="alert alert-danger text-center animate__animated animate__shakeX">{error}</div>}

        {(!notifications || notifications.length === 0) ? (
          <div className="alert alert-secondary text-center mt-4 animate__animated animate__fadeIn">
            Bạn chưa có thông báo nào.
          </div>
        ) : (
          <div className="list-group mt-4 shadow-lg notification-list-container animate__animated animate__fadeInUp">
            {notifications.map((notification) => (
              <div
                key={notification.notificationId}
                className={`list-group-item notification-item ${!notification.isRead ? 'notification-unread' : 'notification-read'}`}
                aria-current={!notification.isRead ? 'true' : 'false'}
                onClick={() => !notification.isRead && markAsRead(notification.notificationId)}
              >
                <div className="d-flex w-100 justify-content-between align-items-center mb-1">
                  <h5 className={`mb-0 notification-type ${notification.type === 'Emergency' ? 'text-danger' : 'text-primary'}`}>
                    {notification.type === 'Emergency' ? '❗ Khẩn cấp' : notification.type || 'Thông báo chung'}
                  </h5>
                  <small className="notification-date text-muted">
                    {notification.sentDate ? 
                        new Date(notification.sentDate).toLocaleDateString('vi-VN') + ' ' + 
                        new Date(notification.sentDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                        : 'N/A'}
                  </small>
                </div>
                <p className="mb-1 notification-message">{notification.message}</p>
                {!notification.isRead && (
                  <small className="notification-status-text text-success d-flex align-items-center">
                    <i className="fas fa-eye-slash me-1"></i> <em>Chưa đọc</em>
                  </small>
                )}
                {notification.isRead && (
                    <small className="notification-status-text text-muted d-flex align-items-center">
                        <i className="fas fa-eye me-1"></i> <em>Đã đọc</em>
                    </small>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default Notifications;