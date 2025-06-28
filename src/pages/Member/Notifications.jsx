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
  const markAsRead = async (notificationId, notificationType) => {
    // Nếu là thông báo chung thì không cần update isRead
    if (notificationType === 'Chung' || notificationType === 'chung' || !notificationType) return;
    try {
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

  // Phân loại thông báo
  const thongBaoChung = notifications.filter(n =>
    n.type === 'Chung' || n.type === 'chung' || n.recipientUserId === 'ALL'
  );
  const thongBaoDon = notifications.filter(n =>
    n.type !== 'Chung' && n.type !== 'chung' && n.recipientUserId !== 'ALL'
  );

  return (
    <div className="page-wrapper">
      <Header />
      <Navbar />
      <main className="container my-5 notification-page-main">
        <h1 className="text-center mb-4 text-info animate__animated animate__fadeInDown">Thông báo của tôi</h1>
        <p className="text-center lead text-muted animate__animated animate__fadeIn">
          Chỉ hiển thị các thông báo gửi cho bạn hoặc thông báo chung.
        </p>

        {error && (
          <div className="alert alert-danger text-center animate__animated animate__shakeX">{error}</div>
        )}

        {/* Thông báo chung */}
        <h4 className="mt-4 mb-2 text-primary">Thông báo chung</h4>
        {thongBaoChung.length === 0 ? (
          <div className="alert alert-secondary text-center mt-2 animate__animated animate__fadeIn">
            Không có thông báo chung.
          </div>
        ) : (
          <div className="list-group mb-4 shadow-sm notification-list-container animate__animated animate__fadeInUp">
            {thongBaoChung.map((notification) => (
              <div
                key={notification.notificationId}
                className={`list-group-item notification-item notification-read`}
                aria-current="false"
                style={{ cursor: 'default' }}
              >
                <div className="d-flex w-100 justify-content-between align-items-center mb-1">
                  <h5 className="mb-0 notification-type text-primary">
                    {notification.type || 'Thông báo chung'}
                  </h5>
                  <small className="notification-date text-muted">
                    {notification.sentDate
                      ? new Date(notification.sentDate).toLocaleDateString('vi-VN') +
                        ' ' +
                        new Date(notification.sentDate).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'N/A'}
                  </small>
                </div>
                <p className="mb-1 notification-message">{notification.message}</p>
                {notification.detail && (
                  <div className="notification-detail alert alert-info mt-2 mb-1 py-2 px-3">
                    <strong>Chi tiết:</strong> {notification.detail}
                  </div>
                )}
                <small className="notification-status-text text-muted d-flex align-items-center">
                  <i className="fas fa-bullhorn me-1"></i> <em>Thông báo chung</em>
                </small>
              </div>
            ))}
          </div>
        )}

        {/* Thông báo đơn */}
        <h4 className="mt-4 mb-2 text-success">Thông báo cá nhân</h4>
        {thongBaoDon.length === 0 ? (
          <div className="alert alert-secondary text-center mt-2 animate__animated animate__fadeIn">
            Không có thông báo cá nhân.
          </div>
        ) : (
          <div className="list-group mb-4 shadow-lg notification-list-container animate__animated animate__fadeInUp">
            {thongBaoDon.map((notification) => (
              <div
                key={notification.notificationId}
                className={`list-group-item notification-item ${!notification.isRead ? 'notification-unread' : 'notification-read'}`}
                aria-current={!notification.isRead ? 'true' : 'false'}
                onClick={() => !notification.isRead && markAsRead(notification.notificationId, notification.type)}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex w-100 justify-content-between align-items-center mb-1">
                  <h5 className={`mb-0 notification-type ${notification.type === 'Emergency' ? 'text-danger' : 'text-primary'}`}>
                    {notification.type === 'Emergency' ? '❗ Khẩn cấp' : notification.type}
                  </h5>
                  <small className="notification-date text-muted">
                    {notification.sentDate
                      ? new Date(notification.sentDate).toLocaleDateString('vi-VN') +
                        ' ' +
                        new Date(notification.sentDate).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'N/A'}
                  </small>
                </div>
                <p className="mb-1 notification-message">{notification.message}</p>
                {notification.detail && (
                  <div className="notification-detail alert alert-info mt-2 mb-1 py-2 px-3">
                    <strong>Chi tiết:</strong> {notification.detail}
                  </div>
                )}
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