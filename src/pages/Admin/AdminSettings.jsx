import React, { useState } from 'react';

function AdminSettings() {
  // State cho các cài đặt mẫu (FE-only)
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('vi');
  const [notification, setNotification] = useState(true);
  const [responseTimeout, setResponseTimeout] = useState(15);

  // Lưu vào localStorage (FE-only)
  const handleSave = () => {
    localStorage.setItem('admin_theme', theme);
    localStorage.setItem('admin_language', language);
    localStorage.setItem('admin_notification', notification ? '1' : '0');
    localStorage.setItem('admin_responseTimeout', responseTimeout);
    alert('Đã lưu cài đặt (chỉ áp dụng trên trình duyệt này)');
  };

  // Khôi phục mặc định
  const handleReset = () => {
    setTheme('light');
    setLanguage('vi');
    setNotification(true);
    setResponseTimeout(15);
  };

  return (
    <div className="card shadow-sm mx-auto" style={{ maxWidth: 600 }}>
      <div className="card-header bg-danger text-white">
        <h5 className="mb-0"><i className="fa fa-cog me-2"></i>Cài đặt hệ thống (FE)</h5>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <label className="form-label">Giao diện</label>
          <select className="form-select" value={theme} onChange={e => setTheme(e.target.value)}>
            <option value="light">Sáng</option>
            <option value="dark">Tối</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Ngôn ngữ</label>
          <select className="form-select" value={language} onChange={e => setLanguage(e.target.value)}>
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="mb-3 form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="notificationSwitch"
            checked={notification}
            onChange={e => setNotification(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="notificationSwitch">
            Bật thông báo trên trình duyệt
          </label>
        </div>
        <div className="mb-3">
          <label className="form-label">Thời gian chờ phản hồi (phút)</label>
          <input
            type="number"
            className="form-control"
            min={1}
            value={responseTimeout}
            onChange={e => setResponseTimeout(e.target.value)}
          />
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-secondary" onClick={handleReset}>
            Khôi phục mặc định
          </button>
          <button className="btn btn-danger" onClick={handleSave}>
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;