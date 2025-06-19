// src/pages/Member/Notifications.jsx
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import useAuth from '../../hooks/useAuth';
import api from '../../services/Api';

function Notifications() {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isAuthenticated || !user?.userId) {
        setLoading(false);
        setError('Vui lòng đăng nhập để xem thông báo.');
        return;
      }

      setLoading(true);
      setError('');
      try {
        // Giả định API endpoint để lấy thông báo cho người dùng hiện tại
        // Thay thế bằng endpoint thực tế của bạn
        const response = await api.get(`/api/Notifications/GetByRecipientId/${user.userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` // Gửi token
          }
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Không thể tải thông báo.');
        }

        // Sắp xếp thông báo theo ngày gửi giảm dần
        const sortedNotifications = data.sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate));
        setNotifications(sortedNotifications);
      } catch (err) {
        setError(err.message || 'Đã xảy ra lỗi khi tải thông báo.');
        console.error("Fetch Notifications Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [isAuthenticated, user?.userId]); // Dependency array để gọi lại khi user hoặc isAuthenticated thay đổi

  const markAsRead = async (notificationId) => {
    try {
      // Giả định API endpoint để đánh dấu thông báo đã đọc
      const response = await fetch(`/api/Notifications/MarkAsRead/${notificationId}`, {
        method: 'PUT', // Hoặc PATCH
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Không thể đánh dấu đã đọc.');
      }

      // Cập nhật trạng thái trong UI
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.notificationId === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      setError(err.message || 'Lỗi khi đánh dấu thông báo đã đọc.');
      console.error("Mark as read error:", err);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="page-wrapper">
      <Header />
      <Navbar />
      <main className="container my-5">
        <h1 className="text-center mb-4 text-info">Thông báo của tôi</h1>
        <p className="text-center lead">
          Kiểm tra các thông báo chung từ hệ thống.
        </p>

        {error && <div className="alert alert-danger text-center">{error}</div>}

        {!notifications || notifications.length === 0 ? (
          <div className="alert alert-secondary text-center mt-4">
            Bạn chưa có thông báo nào.
          </div>
        ) : (
          <div className="list-group mt-4 shadow-sm">
            {notifications.map((notification) => (
              <div
                key={notification.notificationId}
                className={`list-group-item list-group-item-action ${!notification.isRead ? 'list-group-item-light fw-bold' : ''}`}
                aria-current={!notification.isRead ? 'true' : 'false'}
                style={{ cursor: 'pointer' }}
                onClick={() => !notification.isRead && markAsRead(notification.notificationId)}
              >
                <div className="d-flex w-100 justify-content-between align-items-center">
                  <h5 className="mb-1 text-primary">{notification.type || 'Thông báo chung'}</h5>
                  <small className={!notification.isRead ? 'text-danger' : 'text-muted'}>
                    {new Date(notification.sentDate).toLocaleDateString('vi-VN')} {new Date(notification.sentDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </small>
                </div>
                <p className="mb-1">{notification.message}</p>
                {!notification.isRead && (
                  <small className="text-success">
                    <em>Chưa đọc</em>
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
