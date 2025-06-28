import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import api from '../../services/Api';

function EmergencyNotificationSend() {
  const { id } = useParams();
  const location = useLocation();
  const [notification, setNotification] = useState(null);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lấy id từ state nếu chuyển trang bằng navigate và truyền state
  const notificationId = id || location.state?.notificationId;

  useEffect(() => {
    if (!notificationId) return;
    setLoading(true);
    setError('');
    api.get(`/EmergencyNotification/${notificationId}`)
      .then(res => {
        setNotification(res.data);
      })
      .catch(() => setError('Không thể tải nội dung thông báo.'))
      .finally(() => setLoading(false));
  }, [notificationId]);

  // Hàm tìm kiếm thông báo khẩn cấp theo từ khóa
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    setLoading(true);
    setError('');
    try {
      // Giả sử backend có API tìm kiếm, ví dụ: /EmergencyNotification/search?keyword=...
      const res = await api.get(`/EmergencyNotification/search?keyword=${encodeURIComponent(search)}`);
      setSearchResults(res.data || []);
    } catch {
      setError('Không tìm thấy kết quả phù hợp.');
      setSearchResults([]);
    }
    setLoading(false);
  };

  return (
    <div className="page-wrapper">
      <Header />
      <Navbar />
      <main className="container my-5">
        <h2 className="mb-4 text-danger">Chi tiết thông báo khẩn cấp</h2>
        {/* Search form */}
        <form className="mb-4 d-flex" onSubmit={handleSearch}>
          <input
            type="text"
            className="form-control me-2"
            placeholder="Tìm kiếm thông báo khẩn cấp..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">Tìm kiếm</button>
        </form>
        {error && <div className="alert alert-danger">{error}</div>}
        {loading && <div>Đang tải...</div>}

        {/* Hiển thị nội dung thông báo */}
        {notification && (
          <div className="card mb-4">
            <div className="card-header">
              <strong>Tiêu đề:</strong> {notification.title || notification.message || 'Hiến máu khẩn cấp'}
            </div>
            <div className="card-body">
              <p><strong>Nội dung:</strong> {notification.content || notification.message}</p>
              <p><strong>Ngày gửi:</strong> {notification.sentDate ? new Date(notification.sentDate).toLocaleString('vi-VN') : 'N/A'}</p>
              {notification.detail && (
                <div className="alert alert-info mt-2">
                  <strong>Chi tiết:</strong> {notification.detail}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hiển thị kết quả tìm kiếm */}
        {searchResults.length > 0 && (
          <div>
            <h5>Kết quả tìm kiếm:</h5>
            <ul className="list-group">
              {searchResults.map((n, idx) => (
                <li key={n.notificationId ? n.notificationId : `search-${idx}`} className="list-group-item">
                  <strong>{n.title || n.message}</strong>
                  <div>{n.content || n.message}</div>
                  <div>
                    <small>Ngày gửi: {n.sentDate ? new Date(n.sentDate).toLocaleString('vi-VN') : 'N/A'}</small>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default EmergencyNotificationSend;