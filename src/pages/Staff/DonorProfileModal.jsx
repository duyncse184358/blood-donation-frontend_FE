import React, { useEffect, useState } from 'react';
import api from '../../services/Api';

const BLOOD_TYPES = [
  { id: 1, name: 'A+' }, { id: 2, name: 'A-' },
  { id: 3, name: 'B+' }, { id: 4, name: 'B-' },
  { id: 5, name: 'AB+' }, { id: 6, name: 'AB-' },
  { id: 7, name: 'O+' }, { id: 8, name: 'O-' }
];

const PAGE_SIZE = 5;

function DonorProfileModal({ userId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [page, setPage] = useState(1);

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
        setPage(1); // reset về trang 1 khi đổi user
      })
      .catch(() => {
        setErr('Không thể lấy thông tin hồ sơ hoặc lịch sử hiến máu.');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const totalPages = Math.ceil(history.length / PAGE_SIZE);
  const pagedHistory = history.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
                {profile && (profile.fullName || profile.phoneNumber || profile.bloodTypeName || profile.dob || profile.dateOfBirth) ? (
                  <div>
                    <div className="mb-2"><b>Họ tên:</b> {profile.fullName || 'Chưa có'}</div>
                    <div className="mb-2"><b>Ngày sinh:</b> 
                      {profile.dob
                        ? new Date(profile.dob).toLocaleDateString('vi-VN')
                        : profile.dateOfBirth
                          ? new Date(profile.dateOfBirth).toLocaleDateString('vi-VN')
                          : 'Chưa có'}
                    </div>
                    <div className="mb-2"><b>Giới tính:</b> {profile.gender || 'Chưa có'}</div>
                    <div className="mb-2"><b>CCCD/CMND:</b> {profile.cccd || profile.cmnd || 'Chưa có'}</div>
                    <div className="mb-2"><b>Nhóm máu:</b> {
                      profile.bloodTypeName ||
                      (profile.bloodTypeId
                        ? (BLOOD_TYPES.find(bt => String(bt.id) === String(profile.bloodTypeId))?.name || 'Chưa có')
                        : 'Chưa có')
                    }</div>
                    <div className="mb-2"><b>Số điện thoại:</b> {profile.phoneNumber || 'Chưa có'}</div>
                    <div className="mb-2"><b>Địa chỉ:</b> {profile.address || 'Chưa có'}</div>
                    <div className="mb-2"><b>Lịch sử bệnh án/y tế:</b> {profile.medicalHistory || 'Chưa có'}</div>
                    <div className="mb-2"><b>Ngày hiến máu gần nhất:</b> 
                      {profile.lastBloodDonationDate
                        ? new Date(profile.lastBloodDonationDate).toLocaleDateString('vi-VN')
                        : 'Chưa có'}
                    </div>
                  </div>
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
                      <th>Trạng thái</th>
                      
                      <th>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-muted">Chưa có lịch sử hiến máu</td>
                      </tr>
                    ) : (
                      pagedHistory.map(h => (
                        <tr key={h.donationId}>
                          <td>{h.donationDate ? new Date(h.donationDate).toLocaleDateString('vi-VN') : ''}</td>
                          <td>{h.componentName}</td>
                          <td>{h.quantityMl}</td>
                          <td>{h.testingResults}</td>
                          <td>
                            {h.status === 'Complete' ? 'Hoàn thành' :
                             h.status === 'Pending' ? 'Đang xử lý' :
                             h.status === 'Cancelled' ? 'Đã hủy' :
                             h.status || ''}
                          </td>
                          <td>{h.descriptions || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {totalPages > 1 && (
                  <nav>
                    <ul className="pagination justify-content-center">
                      <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
                        <button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 1}>Trước</button>
                      </li>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <li key={i + 1} className={`page-item${page === i + 1 ? ' active' : ''}`}>
                          <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                        </li>
                      ))}
                      <li className={`page-item${page === totalPages ? ' disabled' : ''}`}>
                        <button className="page-link" onClick={() => setPage(page + 1)} disabled={page === totalPages}>Sau</button>
                      </li>
                    </ul>
                  </nav>
                )}
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