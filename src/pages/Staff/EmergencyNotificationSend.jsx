import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import api from '../../services/Api';

const BLOOD_TYPES = [
  { id: 1, name: 'A+' }, { id: 2, name: 'A-' },
  { id: 3, name: 'B+' }, { id: 4, name: 'B-' },
  { id: 5, name: 'AB+' }, { id: 6, name: 'AB-' },
  { id: 7, name: 'O+' }, { id: 8, name: 'O-' }
];

function EmergencyNotificationSend() {
  const { id } = useParams();
  const location = useLocation();
  const [notification, setNotification] = useState(null);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Donor search state
  const [bloodTypeId, setBloodTypeId] = useState('');
  const [radius, setRadius] = useState(5);
  const [donors, setDonors] = useState([]);
  const [donorMessage, setDonorMessage] = useState('');
  const [selectedDonors, setSelectedDonors] = useState([]);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState('');
  const [showResultModal, setShowResultModal] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('App Notification'); // hoặc 'Email'

  // Đã gửi thông báo cho ai
  const [sentUserIds, setSentUserIds] = useState([]);

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

  // Lấy danh sách userId đã gửi thông báo cho emergency này
  useEffect(() => {
    if (!notification?.emergencyId) return;
    api.get(`/EmergencyNotification/by-emergency/${notification.emergencyId}`)
      .then(res => {
        if (Array.isArray(res.data)) {
          setSentUserIds(res.data.map(n => n.recipientUserId));
        }
      });
  }, [notification?.emergencyId]);

  // Hàm tìm kiếm thông báo khẩn cấp theo từ khóa
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/EmergencyNotification/search?keyword=${encodeURIComponent(search)}`);
      setSearchResults(res.data || []);
    } catch {
      setError('Không tìm thấy kết quả phù hợp.');
      setSearchResults([]);
    }
    setLoading(false);
  };

  // Donor search
  const handleDonorSearch = async (e) => {
    e.preventDefault();
    setDonorMessage('');
    setDonors([]);
    setSendResult('');
    if (!bloodTypeId || !radius) {
      setDonorMessage('Vui lòng chọn nhóm máu và bán kính.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/DonorSearch/search', {
        bloodTypeId: Number(bloodTypeId),
        radiusInKm: Number(radius)
      });
      setDonorMessage(res.data.message);
      setDonors(res.data.data || []);
    } catch {
      setDonorMessage('Có lỗi xảy ra khi tìm kiếm.');
    }
    setLoading(false);
  };

  // Chọn donor: Khi chọn user thì tự động tạo 1 thông báo mới cho user đó dựa trên notification hiện tại
  const handleSelectDonor = (userId) => {
    setSelectedDonors(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Gửi thông báo cho danh sách đã chọn (nếu muốn gửi lại cho nhiều người)
  const handleSendNotification = async () => {
    if (selectedDonors.length === 0) {
      setSendResult('error:Vui lòng chọn ít nhất một người nhận.');
      return;
    }
    setSending(true);
    setSendResult('');
    try {
      let successCount = 0;
      let skipCount = 0;
      
      for (const userId of selectedDonors) {
        if (sentUserIds.includes(userId)) {
          skipCount++;
          continue; // Đảm bảo không gửi lại
        }
        await api.post('/EmergencyNotification', {
          emergencyId: notification?.emergencyId,
          recipientUserId: userId,
          sentDate: new Date().toISOString(),
          deliveryMethod,
          isRead: false,
          message: notification?.message || notification?.content || 'Hiến máu khẩn cấp',
          responseStatus: 'No Response'
        });
        successCount++;
      }
      
      if (successCount > 0) {
        setSendResult(`success:Đã gửi thông báo thành công cho ${successCount} người!${skipCount > 0 ? ` (Bỏ qua ${skipCount} người đã được gửi trước đó)` : ''}`);
        // Cập nhật danh sách đã gửi
        setSentUserIds(prev => [...prev, ...selectedDonors.filter(id => !prev.includes(id))]);
        setShowResultModal(true); // Hiển thị modal thông báo
      } else {
        setSendResult('warning:Không có thông báo nào được gửi. Tất cả người được chọn đã nhận thông báo trước đó.');
        setShowResultModal(true);
      }
      setSelectedDonors([]);
    } catch (error) {
      console.error('Send notification error:', error);
      setSendResult('error:Gửi thông báo thất bại. Vui lòng thử lại.');
      setShowResultModal(true);
    }
    setSending(false);
  };

  // Gửi email thông báo (KHÔNG CẦN DÙNG NỮA, đã chuyển sang BE xử lý)
  // const handleSendEmailNotification = async () => {
  //   if (!notificationId) return;
  //   setLoading(true);
  //   setError('');
  //   try {
  //     // Lặp qua danh sách người nhận đã chọn
  //     for (const userId of selectedDonors) {
  //       // Lấy thông tin người nhận
  //       const userRes = await api.get(`/User/${userId}`);
  //       const user = userRes.data;

  //       // Gửi email thông báo
  //       const emailRes = await api.post('/Email/SendEmergencyNotification', {
  //         toEmail: user.email,
  //         subject: 'Yêu cầu hiến máu khẩn cấp',
  //         htmlMessage: `
  //           <p>Bạn nhận được yêu cầu hiến máu khẩn cấp.</p>
  //           <p>
  //               <a href='https://yourdomain.com/emergency-response/accept/${notificationId}'>Tôi đồng ý hiến máu</a> |
  //               <a href='https://yourdomain.com/emergency-response/decline/${notificationId}'>Tôi không thể tham gia</a>
  //           </p>
  //         `
  //       });
  //     }
  //     setSendResult('Đã gửi thông báo qua email thành công!');
  //   } catch {
  //     setSendResult('Gửi thông báo qua email thất bại.');
  //   }
  //   setLoading(false);
  // };

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
              <strong>Tiêu đề:</strong> {'Hiến máu khẩn cấp'}
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

        {/* Tìm kiếm người hiến máu phù hợp */}
        <div className="mt-5">
          <h4>Tìm kiếm người hiến máu phù hợp</h4>
          <form className="row g-3 mb-3" onSubmit={handleDonorSearch}>
            <div className="col-md-4">
              <label className="form-label">Nhóm máu</label>
              <select
                className="form-select"
                value={bloodTypeId}
                onChange={e => setBloodTypeId(e.target.value)}
                required
              >
                <option value="">Chọn nhóm máu...</option>
                {BLOOD_TYPES.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Bán kính (km)</label>
              <input
                type="number"
                className="form-control"
                min={1}
                value={radius}
                onChange={e => setRadius(e.target.value)}
                required
              />
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button className="btn btn-success w-100" type="submit" disabled={loading}>
                {loading ? 'Đang tìm...' : 'Tìm kiếm người hiến'}
              </button>
            </div>
          </form>
          {donorMessage && <div className="alert alert-info">{donorMessage}</div>}
          {donors.length > 0 && (
            <div>
              <h5>Kết quả:</h5>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th></th>
                    <th>Họ tên</th>
                    <th>Ngày sinh</th>
                    <th>Giới tính</th>
                    <th>Địa chỉ</th>
                    <th>Nhóm máu</th>
                    <th>SĐT</th>
                    <th>Lần hiến gần nhất</th>
                  </tr>
                </thead>
                <tbody>
                  {donors
                    .filter(d => {
                      // 1. Kiểm tra tuổi từ 18 đến 60
                      if (!d.dateOfBirth) return false;
                      const dob = new Date(d.dateOfBirth);
                      const now = new Date();
                      let age = now.getFullYear() - dob.getFullYear();
                      const m = now.getMonth() - dob.getMonth();
                      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
                        age--;
                      }
                      if (age < 18 || age > 60) return false;

                      // 2. Kiểm tra lần hiến máu gần nhất cách đây ít nhất 90 ngày
                      if (d.lastDonationDate) {
                        const last = new Date(d.lastDonationDate);
                        const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
                        if (diffDays < 90) return false;
                      }

                      // 3. Kiểm tra lịch sử có bị reject không
                      if (Array.isArray(d.donationHistory) && d.donationHistory.some(h => h.status && h.status.toLowerCase() === 'reject')) {
                        return false;
                      }

                      return true;
                    })
                    .map(d => {
                      const isSent = sentUserIds.includes(d.userId);
                      return (
                        <tr key={d.profileId}>
                          <td>
                            {isSent ? (
                              <span className="text-success" title="Đã gửi">&#10003;</span>
                            ) : (
                              <input
                                type="checkbox"
                                checked={selectedDonors.includes(d.userId)}
                                onChange={() => handleSelectDonor(d.userId)}
                                disabled={isSent}
                              />
                            )}
                          </td>
                          <td>{d.fullName}</td>
                          <td>{d.dateOfBirth}</td>
                          <td>
                            {d.gender === 1 || d.gender === 'Nam'
                              ? 'Nam'
                              : d.gender === 2 || d.gender === 'Nữ'
                              ? 'Nữ'
                              : d.gender === 3 || d.gender === 'Khác'
                              ? 'Khác'
                              : ''}
                          </td>
                          <td>{d.address}</td>
                          <td>{BLOOD_TYPES.find(b => b.id === d.bloodTypeId)?.name || ''}</td>
                          <td>{d.phoneNumber}</td>
                          <td>{d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleString('vi-VN') : 'Chưa có'}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Gửi thông báo cho người hiến máu */}
        {selectedDonors.length > 0 && (
          <div className="mt-4">
            <h4>Gửi thông báo cho người hiến máu đã chọn</h4>
            <div className="alert alert-warning">
              <i className="bi bi-info-circle"></i> {selectedDonors.length} người sẽ nhận được thông báo.
            </div>
            <button
              className="btn btn-danger"
              onClick={handleSendNotification}
              disabled={sending}
            >
              {sending ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Đang gửi...
                </>
              ) : (
                <>
                  <i className="bi bi-send"></i> Gửi thông báo
                </>
              )}
            </button>
            
            {/* Hiển thị kết quả gửi thông báo */}
            {sendResult && (
              <div className="mt-3">
                {sendResult.startsWith('success:') && (
                  <div className="alert alert-success">
                    <i className="bi bi-check-circle"></i> {sendResult.replace('success:', '')}
                  </div>
                )}
                {sendResult.startsWith('error:') && (
                  <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle"></i> {sendResult.replace('error:', '')}
                  </div>
                )}
                {sendResult.startsWith('warning:') && (
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-circle"></i> {sendResult.replace('warning:', '')}
                  </div>
                )}
                {!sendResult.includes(':') && (
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle"></i> {sendResult}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* Modal thông báo kết quả */}
      {showResultModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {sendResult.startsWith('success:') && (
                    <>
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Gửi thông báo thành công
                    </>
                  )}
                  {sendResult.startsWith('error:') && (
                    <>
                      <i className="bi bi-x-circle text-danger me-2"></i>
                      Gửi thông báo thất bại
                    </>
                  )}
                  {sendResult.startsWith('warning:') && (
                    <>
                      <i className="bi bi-exclamation-triangle text-warning me-2"></i>
                      Cảnh báo
                    </>
                  )}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowResultModal(false)}></button>
              </div>
              <div className="modal-body">
                <p className="mb-0">
                  {sendResult.startsWith('success:') && sendResult.replace('success:', '')}
                  {sendResult.startsWith('error:') && sendResult.replace('error:', '')}
                  {sendResult.startsWith('warning:') && sendResult.replace('warning:', '')}
                  {!sendResult.includes(':') && sendResult}
                </p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className={`btn ${
                    sendResult.startsWith('success:') ? 'btn-success' :
                    sendResult.startsWith('error:') ? 'btn-danger' :
                    'btn-warning'
                  }`}
                  onClick={() => setShowResultModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}

export default EmergencyNotificationSend;