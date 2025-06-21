import React, { useEffect, useState } from 'react';
import api from '../../services/Api';

function DonorProfileModal({ userId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setErr('');
    Promise.all([
      api.get(`/UserProfile/by-user/${userId}`).catch(() => ({ data: null })),
      api.get(`/DonationHistory/by-donor/${userId}`).catch(() => ({ data: [] }))
    ])
      .then(([profileRes, historyRes]) => {
        setProfile(profileRes.data);
        setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
      })
      .catch(() => {
        setErr('Không thể lấy thông tin hồ sơ hoặc lịch sử hiến máu.');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Hồ sơ người hiến máu</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {loading ? (
              <div>Đang tải...</div>
            ) : err ? (
              <div className="alert alert-danger">{err}</div>
            ) : (
              <>
                {/* Thông tin cá nhân */}
                <h6 className="mb-3 text-primary">Thông tin cá nhân</h6>
                {profile && profile.fullName ? (
                  <ul>
                    <li><b>Họ tên:</b> {profile.fullName}</li>
                    <li><b>Email:</b> {profile.email}</li>
                    <li><b>Số điện thoại:</b> {profile.phoneNumber}</li>
                    <li><b>Ngày sinh:</b> {profile.dob ? new Date(profile.dob).toLocaleDateString('vi-VN') : ''}</li>
                    <li><b>Nhóm máu:</b> {profile.bloodTypeName}</li>
                    <li><b>Địa chỉ:</b> {profile.address}</li>
                  </ul>
                ) : (
                  <div className="alert alert-warning mb-3">Không tìm thấy hồ sơ cá nhân cho người hiến máu này.</div>
                )}

                {/* Lịch sử hiến máu */}
                <h6 className="mt-4 mb-2 text-danger">Lịch sử hiến máu</h6>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Ngày hiến</th>
                      <th>Thành phần</th>
                      <th>Số lượng (ml)</th>
                      <th>Kết quả xét nghiệm</th>
                      <th>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-muted">Chưa có lịch sử hiến máu</td>
                      </tr>
                    ) : (
                      history.map(h => (
                        <tr key={h.donationId}>
                          <td>{h.donationDate ? new Date(h.donationDate).toLocaleDateString('vi-VN') : ''}</td>
                          <td>{h.componentName}</td>
                          <td>{h.quantityMl}</td>
                          <td>{h.testingResults}</td>
                          <td>{h.descriptions || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Đóng</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DonorProfileModal;