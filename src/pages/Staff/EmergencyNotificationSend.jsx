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

  const cleanText = (text) => {
    if (!text) return '';
    try {
      let cleaned = decodeURIComponent(text);
      cleaned = cleaned.replace(/\?\?/g, '').replace(/\?/g, '');
      cleaned = cleaned.replace(/á»?/g, 'ư').replace(/á»±/g, 'ứ').replace(/á»?/g, 'ều');
      return cleaned.trim();
    } catch (e) {
      return text.replace(/\?\?/g, '').replace(/\?/g, '').trim();
    }
  };

  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [bloodTypeId, setBloodTypeId] = useState('');
  const [radius, setRadius] = useState(5);
  const [donors, setDonors] = useState([]);
  const [donorMessage, setDonorMessage] = useState('');
  const [selectedDonors, setSelectedDonors] = useState([]);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState('');
  const [showResultModal, setShowResultModal] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('App Notification');
  const [sentUserIds, setSentUserIds] = useState([]);

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

  useEffect(() => {
    if (!notification?.emergencyId) return;
    api.get(`/EmergencyNotification/by-emergency/${notification.emergencyId}`)
      .then(res => {
        if (Array.isArray(res.data)) {
          setSentUserIds(res.data.map(n => n.recipientUserId));
        }
      });
  }, [notification?.emergencyId]);

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

  const handleSelectDonor = (userId) => {
    setSelectedDonors(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

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
          continue;
        }
        await api.post('/EmergencyNotification', {
          emergencyId: notification?.emergencyId,
          recipientUserId: userId,
          sentDate: new Date().toISOString(),
          deliveryMethod,
          isRead: false,
          message: cleanText(notification?.message || notification?.content || 'Hiến máu khẩn cấp'),
          responseStatus: 'No Response'
        });
        successCount++;
      }

      if (successCount > 0) {
        setSendResult(`success:Đã gửi thông báo thành công cho ${successCount} người!${skipCount > 0 ? ` (Bỏ qua ${skipCount} người đã được gửi trước đó)` : ''}`);
        setSentUserIds(prev => [...prev, ...selectedDonors.filter(id => !prev.includes(id))]);
        setShowResultModal(true);
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

  return (
    <div className="page-wrapper">
      <Header />
      <Navbar />
      <main className="container my-5">
        <h2 className="mb-4 text-danger">Chi tiết thông báo khẩn cấp</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {loading && <div>Đang tải...</div>}

        {notification && (
          <div className="card mb-4">
            <div className="card-header">
              <strong>Tiêu đề:</strong> {'Hiến máu khẩn cấp'}
            </div>
            <div className="card-body">
              <p><strong>Nội dung:</strong> {cleanText(notification.content || notification.message)}</p>
              <p><strong>Ngày gửi:</strong> {notification.sentDate ? new Date(notification.sentDate).toLocaleString('vi-VN') : 'N/A'}</p>
              {notification.detail && (
                <div className="alert alert-info mt-2">
                  <strong>Chi tiết:</strong> {cleanText(notification.detail)}
                </div>
              )}
            </div>
          </div>
        )}

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
                  {donors.map(d => {
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
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default EmergencyNotificationSend;