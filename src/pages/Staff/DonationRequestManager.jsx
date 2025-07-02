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

function DonationRequestManager({ openModal }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/DonationRequest')
      .then(res => {
        // Sắp xếp giảm dần theo requestDate (mới nhất lên đầu)
        const sorted = [...res.data].sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
        setRequests(sorted);
      })
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  // Lọc theo trạng thái
  const filteredRequests = statusFilter
    ? requests.filter(r => r.status === statusFilter)
    : requests;

  const pagedRequests = filteredRequests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filteredRequests.length / PAGE_SIZE);

  // Khi bấm "Xem chi tiết", chỉ cho phép cập nhật trạng thái (BỎ phần thành phần)
  const handleShowDetail = async (requestId) => {
    try {
      const res = await api.get(`/DonationRequest/${requestId}`);
      // Bỏ phần componentId/componentName khi truyền vào modal
      const { componentId, componentName, ...rest } = res.data;
      openModal('detail', {
        ...rest,
        onUpdateStatus: async (newStatus, onDone) => {
          try {
            const updateBody = {
              bloodTypeId: res.data.bloodTypeId,
              // componentId: res.data.componentId, // Bỏ thành phần
              preferredDate: res.data.preferredDate,
              preferredTimeSlot: res.data.preferredTimeSlot,
              status: newStatus,
              staffNotes: res.data.staffNotes,
              donorUserId: res.data.donorUserId,
            };
            const updateRes = await api.put(`/DonationRequest/${requestId}`, updateBody);
            setRequests(reqs =>
              reqs.map(r =>
                r.requestId === requestId ? { ...r, ...updateRes.data } : r
              )
            );
            if (onDone) onDone(null, updateRes.data);
          } catch (err) {
            if (onDone) onDone(err);
          }
        }
      });
    } catch {
      console.error('Không thể tải chi tiết đơn.');
    }
  };

  // Khi bấm "Lịch sử", mở modal ghi nhận thực tế hiến máu
  const handleShowHistory = (requestId) => {
    openModal('history', { requestId });
  };

  // Khi bấm "Hồ sơ", mở modal hồ sơ người hiến
  const handleShowProfile = (donorUserId) => {
    openModal('profile', { userId: donorUserId });
  };

  // Khi chọn lọc trạng thái, về trang 1
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  return (
    <div>
      <h4 className="mb-3">Quản lý yêu cầu hiến máu</h4>
      <div className="row mb-3">
        <div className="col-md-4">
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
      </div>
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
                <th>Chức năng</th>
              </tr>
            </thead>
            <tbody>
              {pagedRequests.map((r, idx) => (
                <tr key={r.requestId}>
                  <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td>{r.donorUserName || r.donorUserId}</td>
                  <td>
                    {r.status === 'Accepted' && 'Chấp nhận'}
                    {r.status === 'Rejected' && 'Từ chối'}
                    {r.status === 'Pending' && 'Đang chờ'}
                    {r.status === 'Scheduled' && 'Đã xếp lịch'}
                    {r.status === 'Completed' && 'Đã hiến'}
                    {r.status === 'Cancelled' && 'Đã hủy'}
                  </td>
                  <td>{r.requestDate ? new Date(r.requestDate).toLocaleString('vi-VN') : ''}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary me-1"
                      onClick={() => handleShowDetail(r.requestId)}
                    >
                      Xem chi tiết
                    </button>
                    <button
                      className="btn btn-sm btn-info me-1"
                      onClick={() => handleShowHistory(r.requestId)}
                    >
                      Lịch sử
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleShowProfile(r.donorUserId)}
                    >
                      Hồ sơ
                    </button>
                  </td>
                </tr>
              ))}
              {pagedRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted">Không có dữ liệu</td>
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
