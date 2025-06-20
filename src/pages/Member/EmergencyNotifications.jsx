// src/pages/Member/EmergencyNotifications.jsx
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import useAuth from '../../hooks/useAuth';
import api from '../../services/Api';

function EmergencyNotifications() {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState('');
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
        // Lấy tất cả emergency notifications, lọc theo user
        const res = await api.get('/EmergencyNotification');
        const list = (res.data || []).filter(n => n.recipientUserId === user.userId);
        setNotifications(list.sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate)));
      } catch {
        setError('Không thể tải thông báo khẩn cấp.');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [isAuthenticated, user?.userId]);

  // Phản hồi notification khẩn cấp
  const respondEmergency = async (notificationId, responseStatus) => {
    setResponding(notificationId + responseStatus);
    try {
      await api.post('/EmergencyNotification/respond', {
        notificationId,
        responseStatus
      });
      setNotifications(prev =>
        prev.map(n =>
          n.notificationId === notificationId
            ? { ...n, responseStatus }
            : n
        )
      );
    } catch {}
    setResponding('');
  };

  return (
    <div className="page-wrapper">
      <Header />
      <Navbar />
      <main className="container my-5">
        <h1 className="text-center mb-4 text-danger">Thông báo Hiến máu Khẩn cấp</h1>
        <p className="text-center lead">
          Bạn có thể phản hồi các yêu cầu hiến máu khẩn cấp tại đây.
        </p>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="p-4 bg-light rounded shadow-sm mt-4">
            {error && <div className="alert alert-danger text-center">{error}</div>}
            {(!notifications || notifications.length === 0) ? (
              <div className="alert alert-secondary text-center mt-2">
                Không có thông báo khẩn cấp nào.
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.notificationId}
                  className={`card mb-3 ${n.responseStatus === 'No Response' ? 'border-warning' : 'border-secondary'}`}
                >
                  <div className="card-body">
                    <h5 className="card-title text-danger">
                      Yêu cầu khẩn cấp: {n.emergencyId}
                    </h5>
                    <p className="card-text mb-1">
                      <b>Thời gian gửi:</b> {new Date(n.sentDate).toLocaleString('vi-VN')}
                    </p>
                    <p className="card-text mb-1">
                      <b>Trạng thái phản hồi:</b>{' '}
                      {n.responseStatus === 'Interested' && <span className="text-success">Đã chấp nhận</span>}
                      {n.responseStatus === 'Declined' && <span className="text-secondary">Đã từ chối</span>}
                      {n.responseStatus === 'No Response' && <span className="text-warning">Chưa phản hồi</span>}
                    </p>
                    {n.responseStatus === 'No Response' && (
                      <div>
                        <button
                          className="btn btn-success me-2"
                          disabled={responding === n.notificationId + 'Interested'}
                          onClick={() => respondEmergency(n.notificationId, 'Interested')}
                        >
                          {responding === n.notificationId + 'Interested' ? 'Đang gửi...' : 'Chấp nhận'}
                        </button>
                        <button
                          className="btn btn-outline-secondary"
                          disabled={responding === n.notificationId + 'Declined'}
                          onClick={() => respondEmergency(n.notificationId, 'Declined')}
                        >
                          {responding === n.notificationId + 'Declined' ? 'Đang gửi...' : 'Từ chối'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default EmergencyNotifications;
