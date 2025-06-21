import React, { useEffect, useState } from 'react';
import api from '../../services/Api';

const PAGE_SIZE = 10;

function DonationRequestManager({ openModal }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

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

  const pagedRequests = requests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(requests.length / PAGE_SIZE);

  // Khi bấm "Xem chi tiết", chỉ cho phép cập nhật trạng thái
  const handleShowDetail = async (requestId) => {
    try {
      const res = await api.get(`/DonationRequest/${requestId}`);
      openModal('detail', {
        ...res.data,
        onUpdateStatus: async (newStatus, onDone) => {
          try {
            const updateRes = await api.put(`/DonationRequest/${requestId}`, {
              ...res.data,
              status: newStatus,
            });
            // Cập nhật lại danh sách
            setRequests(reqs =>
              reqs.map(r =>
                r.requestId === requestId ? { ...r, ...updateRes.data } : r
              )
            );
            // Nếu trạng thái mới là Completed, cập nhật UserProfile
            if (newStatus === 'Complete' && updateRes.data.preferredDate && res.data.donorUserId) {
              await api.put(`/UserProfile/by-user/${res.data.donorUserId}`, {
                dto: { lastBloodDonationDate: updateRes.data.preferredDate }
              });
            }
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

  return (
    <div>
      <h4 className="mb-3">Quản lý yêu cầu hiến máu</h4>
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
