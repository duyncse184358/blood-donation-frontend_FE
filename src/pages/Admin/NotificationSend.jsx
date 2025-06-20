import React, { useEffect, useState } from 'react';
import api from '../../services/Api';

const NOTI_TYPES = [
  { value: 'General', label: 'Chung (gửi tất cả)' },
  { value: 'Personal', label: 'Cá nhân' },
  { value: 'Emergency', label: 'Khẩn cấp' },
  { value: 'Reminder', label: 'Nhắc nhở' }
];

function NotificationSend() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    type: 'General',
    message: '',
    sentDate: '',
    isRead: false
  });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [sendingUserId, setSendingUserId] = useState('');

  useEffect(() => {
    api.get('/User')
      .then(res => setUsers(res.data))
      .catch(() => setUsers([]));
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Gửi thông báo chung cho tất cả user
  const handleSendAll = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    try {
      await api.post('/Notification', {
        recipientUserId: 'ALL',
        message: form.message,
        type: 'General',
        sentDate: form.sentDate ? form.sentDate : undefined,
        isRead: form.isRead
      });
      setMsg('Đã gửi thông báo chung cho tất cả user!');
      setForm({ ...form, message: '' });
    } catch {
      setErr('Gửi thất bại!');
    }
  };

  // Gửi thông báo cá nhân cho từng user
  const handleSendToUser = async (userId) => {
    setSendingUserId(userId);
    setMsg('');
    setErr('');
    try {
      await api.post('/Notification', {
        recipientUserId: userId,
        message: form.message,
        type: 'Personal',
        sentDate: form.sentDate ? form.sentDate : undefined,
        isRead: form.isRead
      });
      setMsg(`Đã gửi thông báo cho user ${userId}`);
    } catch {
      setErr('Gửi thất bại!');
    }
    setSendingUserId('');
  };

  return (
    <div className="container my-4">
      <h4>Tạo và gửi thông báo</h4>
      <form className="row g-3 mb-4" onSubmit={handleSendAll}>
        <div className="col-md-6">
          <label className="form-label">Loại thông báo</label>
          <select className="form-select" name="type" value={form.type} onChange={handleChange}>
            {NOTI_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Ngày gửi (tùy chọn)</label>
          <input
            type="datetime-local"
            className="form-control"
            name="sentDate"
            value={form.sentDate}
            onChange={handleChange}
          />
        </div>
        <div className="col-12">
          <label className="form-label">Nội dung</label>
          <textarea
            className="form-control"
            name="message"
            value={form.message}
            onChange={handleChange}
            rows={2}
            required
          />
        </div>
        <div className="col-12 d-flex align-items-center">
          <div className="form-check me-3">
            <input
              className="form-check-input"
              type="checkbox"
              name="isRead"
              checked={form.isRead}
              onChange={handleChange}
              id="isReadCheck"
            />
            <label className="form-check-label" htmlFor="isReadCheck">
              Đã đọc
            </label>
          </div>
          <button type="submit" className="btn btn-primary" disabled={!form.message}>
            Gửi thông báo chung (tất cả)
          </button>
        </div>
        {msg && <div className="text-success mt-2">{msg}</div>}
        {err && <div className="text-danger mt-2">{err}</div>}
      </form>

      <h5>Gửi thông báo cá nhân</h5>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>UserId</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Gửi</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.userId}>
              <td>{u.userId}</td>
              <td>{u.fullName || u.userName || ''}</td>
              <td>{u.email || ''}</td>
              <td>
                <button
                  className="btn btn-success btn-sm"
                  disabled={!form.message || sendingUserId === u.userId}
                  onClick={() => handleSendToUser(u.userId)}
                >
                  {sendingUserId === u.userId ? 'Đang gửi...' : 'Gửi'}
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center text-muted">Không có user</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default NotificationSend;