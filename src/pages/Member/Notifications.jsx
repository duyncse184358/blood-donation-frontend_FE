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
    const fetchAll = async () => {
      if (!isAuthenticated || !user?.userId) {
        setLoading(false);
        setError('Vui lòng đăng nhập để xem thông báo.');
        return;
      }
      setLoading(true);
      setError('');
      try {
        // Lấy tất cả notification, lọc theo userId hoặc ALL
        const res = await api.get('/Notification');
        const list = (res.data || []).filter(
          n => n.recipientUserId === user.userId || n.recipientUserId === 'ALL'
        );
        setNotifications(list.sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate)));
      } catch (err) {
        setError('Không thể tải thông báo.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [isAuthenticated, user?.userId]);

  // Đánh dấu đã đọc notification
  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/Notification/${notificationId}`, { isRead: true });
      setNotifications(prev =>
        prev.map(n => n.notificationId === notificationId ? { ...n, isRead: true } : n)
      );
    } catch {}
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-wrapper">
      <Header />
      <Navbar />
      <main className="container my-5">
        <h1 className="text-center mb-4 text-info">Thông báo của tôi</h1>
        <p className="text-center lead">Chỉ hiển thị các thông báo gửi cho bạn hoặc thông báo chung.</p>
        {error && <div className="alert alert-danger text-center">{error}</div>}

        {/* Thông báo */}
        {(!notifications || notifications.length === 0) ? (
          <div className="alert alert-secondary text-center mt-2">
            Bạn chưa có thông báo nào.
          </div>
        ) : (
          <div className="list-group mt-2 shadow-sm">
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
