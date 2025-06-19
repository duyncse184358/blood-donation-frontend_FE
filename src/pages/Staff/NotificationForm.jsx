import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/Api';
import NotificationSend from './NotificationSend';
function NotificationForm() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/Notification')
      .then(res => {
        setNotifications(res.data);
      })
      .catch(() => setError('Không thể tải danh sách thông báo.'))
      .finally(() => setLoading(false));
  }, []);

  // Khi ấn nút sẽ chuyển sang trang NotificationSend
  const handleCreateNotification = () => {
    navigate('/staff/notification-send');
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Danh sách thông báo</h4>
        <button
          className="btn btn-primary"
          onClick={handleCreateNotification}
        >
          Tạo thông báo mới
        </button>
      </div>
      {loading ? (
        <div>Đang tải...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Người nhận</th>
              <th>Loại</th>
              <th>Nội dung</th>
              <th>Ngày gửi</th>
              <th>Đã đọc</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map(n => (
              <tr key={n.notificationId}>
                <td>{n.recipientUserId === 'ALL' ? 'Tất cả' : n.recipientUserId}</td>
                <td>{n.type}</td>
                <td>{n.message}</td>
                <td>{n.sentDate ? new Date(n.sentDate).toLocaleString('vi-VN') : ''}</td>
                <td>{n.isRead ? '✔️' : ''}</td>
              </tr>
            ))}
            {notifications.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-muted">Không có thông báo</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default NotificationForm;