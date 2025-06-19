import React, { useEffect, useState } from 'react';
import api from '../../services/Api';

// Lấy lại phần hiển thị user từ ManageUserAccount
const roleOptions = [
  { value: 1, label: 'Admin' },
  { value: 2, label: 'Staff' },
  { value: 3, label: 'Member' },
];

function UserTable({ users, onSend, sendingUserId, message }) {
  return (
    <table className="table table-bordered">
      <thead>
        <tr>
          <th>ID</th>
          <th>Tên</th>
          <th>Email</th>
          <th>Vai trò</th>
          <th className="text-center">Hoạt động</th>
          <th>Gửi</th>
        </tr>
      </thead>
      <tbody>
        {users.length === 0 ? (
          <tr>
            <td colSpan={6} className="text-center text-muted">Không có user</td>
          </tr>
        ) : (
          users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username || u.name || u.fullName || '---'}</td>
              <td>{u.email}</td>
              <td>
                {roleOptions.find(r => r.value === (u.roleId || u.RoleId))?.label || u.role || '---'}
              </td>
              <td className="text-center">
                {(u.isActive ?? u.IsActive)
                  ? <i className="fa fa-check" style={{ color: 'green', fontWeight: 'bold' }}></i>
                  : <i className="fa fa-times" style={{ color: 'red', fontWeight: 'bold' }}></i>
                }
              </td>
              <td>
                <button
                  className="btn btn-success btn-sm"
                  disabled={!message || sendingUserId === u.id}
                  onClick={() => onSend(u.id)}
                >
                  {sendingUserId === u.id ? 'Đang gửi...' : 'Gửi'}
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function NotificationSend() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    message: '',
    sentDate: '',
    isRead: false
  });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [sendingUserId, setSendingUserId] = useState('');

  useEffect(() => {
    api.get('/ManageUserAccounts')
      .then(res => setUsers(res.data || []))
      .catch(() => setUsers([]));
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
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
      <h4>Tạo và gửi thông báo cá nhân</h4>
      <form className="row g-3 mb-4" onSubmit={e => e.preventDefault()}>
        <div className="col-md-8">
          <label className="form-label">Nội dung thông báo</label>
          <textarea
            className="form-control"
            name="message"
            value={form.message}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Ngày gửi (tùy chọn)</label>
          <input
            type="datetime-local"
            className="form-control"
            name="sentDate"
            value={form.sentDate}
            onChange={handleChange}
          />
          <div className="form-check mt-2">
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
        </div>
        {msg && <div className="text-success mt-2">{msg}</div>}
        {err && <div className="text-danger mt-2">{err}</div>}
      </form>

      <h5>Danh sách user</h5>
      <UserTable
        users={users}
        onSend={handleSendToUser}
        sendingUserId={sendingUserId}
        message={form.message}
      />
    </div>
  );
}

export default NotificationSend;