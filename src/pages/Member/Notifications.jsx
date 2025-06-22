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
  const { isAuthenticated, currentUser } = useAuth(); 
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserNotifications = async () => {
      if (!isAuthenticated || !currentUser?.userId) { 
        setLoading(false);
        setError('Vui lòng đăng nhập để xem thông báo.');
        return;
      }
      setLoading(true);
      setError('');
      try {
        // Gọi API mới từ Backend để lọc theo userId
        const res = await api.get(`/Notification/by-user/${currentUser.userId}`); 
        // Backend đã sắp xếp và lọc, nên không cần .filter() và .sort() ở FE nữa
        setNotifications(res.data || []); 
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        setError('Không thể tải thông báo. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserNotifications();
  }, [isAuthenticated, currentUser?.userId]);

  // Đánh dấu đã đọc notification
  const markAsRead = async (notificationId) => {
    try {
      // Gửi request PUT để cập nhật IsRead
      // Bao gồm cả RecipientUserId trong body nếu API PUT yêu cầu (Backend của bạn có thể cần)
      await api.put(`/Notification/${notificationId}`, { isRead: true, recipientUserId: currentUser.userId }); 
      setNotifications(prev =>
        prev.map(n => n.notificationId === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (err) {
        console.error("Failed to mark notification as read:", err);
        // Có thể hiển thị lỗi nhỏ hoặc không làm gì
        setError('Không thể đánh dấu đã đọc. Vui lòng thử lại.'); // Thêm lỗi cho người dùng
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-wrapper">
      <Header />
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
                // Class dựa trên trạng thái đọc
                className={`list-group-item notification-item ${!notification.isRead ? 'notification-unread' : 'notification-read'}`}
                aria-current={!notification.isRead ? 'true' : 'false'}
                onClick={() => !notification.isRead && markAsRead(notification.notificationId)}
              >
                <div className="d-flex w-100 justify-content-between align-items-center mb-1">
                  {/* Loại thông báo */}
                  <h5 className={`mb-0 notification-type ${notification.type === 'Emergency' ? 'text-danger' : 'text-primary'}`}>
                    {notification.type === 'Emergency' ? '❗ Khẩn cấp' : notification.type || 'Thông báo chung'}
                  </h5>
                  {/* Ngày gửi */}
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