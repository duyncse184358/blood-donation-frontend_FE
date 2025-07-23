import React, { useEffect, useState } from 'react';
import api from '../../services/Api';

const PAGE_SIZE = 10;
const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'Pending', label: 'Đang chờ' },
  { value: 'Accepted', label: 'Chấp nhận' },
  { value: 'Rejected', label: 'Từ chối' },
  { value: 'Scheduled', label: 'Đã xếp lịch' },
  { value: 'Completed', label: 'Đã hiến' },
  { value: 'Cancelled', label: 'Đã hủy' }
];
const SHIFTS = [
  { value: '', label: 'Tất cả ca' },
  { value: '08:00 - 09:30', label: '08:00 - 09:30' },
  { value: '09:30 - 11:00', label: '09:30 - 11:00' },
  { value: '13:30 - 15:00', label: '13:30 - 15:00' },
  { value: '15:00 - 16:30', label: '15:00 - 16:30' }
];

function DonationRequestManager({ openModal }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/DonationRequest')
      .then(res => {
        const sorted = [...res.data].sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
        setRequests(sorted);
      })
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  // Lọc theo trạng thái, ngày, ca
  const filteredRequests = requests.filter(r =>
    (statusFilter === '' || r.status === statusFilter) &&
    (dateFilter === '' || (r.preferredDate && r.preferredDate.slice(0, 10) === dateFilter)) &&
    (shiftFilter === '' || r.preferredTimeSlot === shiftFilter)
  );

  const pagedRequests = filteredRequests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filteredRequests.length / PAGE_SIZE);

  // Khi chọn lọc, về trang 1
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };
  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
    setPage(1);
  };
  const handleShiftFilterChange = (e) => {
    setShiftFilter(e.target.value);
    setPage(1);
  };

  // Khi bấm "Xem chi tiết", chỉ cho phép cập nhật trạng thái (BỎ phần thành phần)
  const handleShowDetail = async (requestId) => {
    try {
      const res = await api.get(`/DonationRequest/${requestId}`);
      const { componentId, componentName, ...rest } = res.data;
      openModal('detail', {
        ...rest,
        staffNotes: res.data.staffNotes || '',
        onUpdateStatus: async (newStatus, newStaffNotes, onDone) => {
          try {
            const updateBody = {
              bloodTypeId: res.data.bloodTypeId,
              componentId: res.data.componentId ?? 1, // Mặc định là 1 nếu không có
              preferredDate: res.data.preferredDate,
              preferredTimeSlot: res.data.preferredTimeSlot,
              status: newStatus,
              staffNotes: newStaffNotes,
              donorUserId: res.data.donorUserId,
            };
            const updateRes = await api.put(`/DonationRequest/${requestId}`, updateBody);
            setRequests(reqs =>
              reqs.map(r =>
                r.requestId === requestId ? { ...r, ...updateRes.data } : r
              )
            );
            setSuccessMessage('Cập nhật trạng thái thành công!');
            if (onDone) onDone(null, updateRes.data);
          } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
              setErrorMessage(err.response.data.message);
              if (onDone) onDone(err.response.data.message);
            } else {
              setErrorMessage('Cập nhật trạng thái thất bại!');
              if (onDone) onDone('Cập nhật trạng thái thất bại!');
            }
          }
        }
      });
    } catch {
      console.error('Không thể tải chi tiết đơn.');
    }
  };

  // Khi bấm "Lịch sử", mở modal ghi nhận thực tế hiến máu
  const handleShowHistory = async (requestId) => {
    setErrorMessage('');
    try {
      // Lấy thông tin request để biết donorUserId
      const res = await api.get(`/DonationRequest/${requestId}`);
      const donorUserId = res.data.donorUserId;
      if (!donorUserId) {
        setErrorMessage('Không tìm thấy người hiến máu cho yêu cầu này.');
        return;
      }
      // Lấy lịch sử hiến máu của user
      const historyRes = await api.get(`/DonationHistory/by-donor/${donorUserId}`);
      const histories = Array.isArray(historyRes.data) ? historyRes.data : [];

      // Kiểm tra có lần nào bị từ chối hoặc thất bại không
      const hasRejectedOrFailed = histories.some(
        h =>
          (h.status && (h.status.toLowerCase() === 'rejected' || h.status.toLowerCase() === 'failed' || h.status.toLowerCase() === 'cancelled'))
      );
      if (hasRejectedOrFailed) {
        setErrorMessage('Người hiến máu này có lần hiến máu bị từ chối hoặc thất bại. Không thể ghi nhận hiến máu mới.');
        return;
      }

      // Kiểm tra ngày hiến máu gần nhất (Complete/Completed)
      const completed = histories
        .filter(h => h.status === 'Complete' || h.status === 'Completed')
        .sort((a, b) => new Date(b.donationDate) - new Date(a.donationDate));
      if (completed.length > 0) {
        const lastDate = new Date(completed[0].donationDate);
        const now = new Date();
        const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays < 90) {
          setErrorMessage(`Người hiến máu này đã hiến máu cách đây ${diffDays} ngày. Cần tối thiểu 90 ngày giữa 2 lần hiến máu.`);
          return;
        }
      }
      // Nếu đủ điều kiện, mở modal ghi nhận thực tế
      openModal('history', { requestId });
    } catch (err) {
      setErrorMessage('Không thể kiểm tra lịch sử hiến máu.');
    }
  };

  // Khi bấm "Hồ sơ", mở modal hồ sơ người hiến
  const handleShowProfile = (donorUserId) => {
    openModal('profile', { userId: donorUserId });
  };

  return (
    <div>
      <h4 className="mb-3">Quản lý yêu cầu hiến máu</h4>
      <div className="row mb-3">
        <div className="col-md-4 mb-2">
          <select
            className="form-select"
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4 mb-2">
          <input
            type="date"
            className="form-control"
            value={dateFilter}
            onChange={handleDateFilterChange}
            placeholder="Lọc theo ngày"
          />
        </div>
        <div className="col-md-4 mb-2">
          <select
            className="form-select"
            value={shiftFilter}
            onChange={handleShiftFilterChange}
          >
            {SHIFTS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>
      {errorMessage && (
        <div className="alert alert-danger">{errorMessage}</div>
      )}
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <>
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th>STT</th>
                <th>Người hiến</th>
                <th>Trạng thái</th>
                <th>Ngày yêu cầu</th>
                <th>Ngày muốn hiến</th>
                <th>Ca</th> {/* Thêm cột Ca */}
                <th>Chức năng</th>
              </tr>
            </thead>
            <tbody>
              {pagedRequests.map((r, idx) => (
                <tr key={r.requestId}>
                  <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td>{r.donorUserName || r.donorUserId}</td>
                  <td>
                    {(() => {
                      switch (r.status) {
                        case 'Accepted': return 'Chấp nhận';
                        case 'Rejected': return 'Từ chối';
                        case 'Pending': return 'Đang chờ';
                        case 'Scheduled': return 'Đã xếp lịch';
                        case 'Completed': return 'Đã hiến';
                        case 'Cancelled': return 'Đã hủy';
                        default: return r.status || '';
                      }
                    })()}
                  </td>
                  <td>{r.requestDate ? new Date(r.requestDate).toLocaleString('vi-VN') : ''}</td>
                  <td>
                    {r.preferredDate
                      ? new Date(r.preferredDate).toLocaleDateString('vi-VN')
                      : ''}
                  </td>
                  <td>{r.preferredTimeSlot || ''}</td> {/* Hiển thị ca */}
                  <td>
                    <button
                      className="btn btn-sm btn-primary me-1"
                      onClick={() => handleShowDetail(r.requestId)}
                    >
                      Cập nhật trạng thái
                    </button>
                    <button
                      className="btn btn-sm btn-info me-1"
                      onClick={() => handleShowHistory(r.requestId)}
                    >
                      Ghi nhận hiến máu
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleShowProfile(r.donorUserId)}
                    >
                      Hồ sơ người hiến
                    </button>
                  </td>
                </tr>
              ))}
              {pagedRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted">Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
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
        </>
      )}
    </div>
  );
}

export default DonationRequestManager;
