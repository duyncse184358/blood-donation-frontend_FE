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
  const [thankYou, setThankYou] = useState('');

  // Lấy danh sách thông báo khẩn cấp của user
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
        // Gọi API mới lấy danh sách notification theo userId
        const res = await api.get(`/EmergencyNotification/by-user/${user.userId}`);
        let list = [];
        if (res && res.data) {
          if (Array.isArray(res.data)) list = res.data;
          else if (Object.keys(res.data).length > 0) list = [res.data];
        }
        setNotifications(list.sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate)));
      } catch (err) {
        // Nếu là 404 thì coi như không có thông báo, không phải lỗi
        if (err.response && err.response.status === 404) {
          setNotifications([]);
          setError('');
        } else {
          setError('Không thể tải thông báo khẩn cấp.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [isAuthenticated, user?.userId]);

  // Phản hồi notification khẩn cấp
  const respondEmergency = async (notificationId, responseStatus) => {
    setResponding(notificationId + responseStatus);
    setThankYou('');
    try {
      await api.post('/EmergencyNotification/respond', {
        notificationId,
        responseStatus
      });

      // Nếu phản hồi là "Interested" thì tạo lịch sử hiến máu mới theo emergencyId
      if (responseStatus === 'Interested') {
        // Tìm notification để lấy emergencyId
        const notification = notifications.find(n => n.notificationId === notificationId);
        if (notification && notification.emergencyId) {
          try {
            await api.post('/DonationHistory', {
              userId: user.userId,
              emergencyId: notification.emergencyId,
              donationDate: new Date().toISOString(),
              status: 'Pending'
            });
          } catch (err) {
            // Có thể hiển thị thông báo lỗi nếu cần
          }
        }
        setThankYou('Cảm ơn bạn đã sẵn sàng tham gia hiến máu khẩn cấp!');
      }

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
            {thankYou && (
              <div className="alert alert-success text-center">{thankYou}</div>
            )}
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
                      <b>Nội dung:</b>{' '}
                      {n.message
                        ? n.message
                            // Lọc thông tin: chỉ lấy phần sau dấu ":" và bỏ icon nếu có
                            .replace(/^.*?:\s?/, '') // Bỏ phần đầu đến dấu ":"
                            .replace(/(<([^>]+)>)/gi, '') // Bỏ thẻ HTML nếu có
                            .replace(/(?:\r\n|\r|\n)/g, ' ') // Bỏ xuống dòng
                            .replace(/[\[\]\{\}"]/g, '') // Bỏ [, ], {, }
                            .trim()
                        : ''}
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
