import React, { useEffect, useState } from 'react';
import api from '../../services/Api';
import DonationHistoryByRequestModal from './DonationHistoryByRequestModal'; // Thêm dòng này

const PAGE_SIZE = 10;

function DonationRequestManager() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null); // đơn đang xem chi tiết
  const [showDetail, setShowDetail] = useState(false);
  const [showHistory, setShowHistory] = useState(false); // Thêm state này
  const [total, setTotal] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateMsg, setUpdateMsg] = useState('');

  // Lấy danh sách đơn hiến máu
  useEffect(() => {
    setLoading(true);
    api.get('/DonationRequest')
      .then(res => {
        setRequests(res.data);
        setTotal(res.data.length);
      })
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  // Phân trang
  const pagedRequests = requests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(requests.length / PAGE_SIZE);

  // Xem chi tiết đơn
  const handleShowDetail = async (requestId) => {
    setShowDetail(true);
    setUpdateError('');
    setUpdateMsg('');
    setUpdating(false);
    try {
      const res = await api.get(`/DonationRequest/${requestId}`);
      setSelected(res.data);
    } catch {
      setSelected(null);
    }
  };

  // Đóng modal chi tiết
  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelected(null);
    setUpdateError('');
    setUpdateMsg('');
  };

  // Cập nhật trạng thái đơn
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateError('');
    setUpdateMsg('');
    try {
      const payload = {
        bloodTypeId: selected.bloodTypeId,
        componentId: selected.componentId,
        preferredDate: selected.preferredDate,
        preferredTimeSlot: selected.preferredTimeSlot,
        status: selected.status,
        staffNotes: selected.staffNotes,
      };
      const res = await api.put(`/DonationRequest/${selected.requestId}`, payload);
      setSelected(res.data);
      setUpdateMsg('Cập nhật thành công!');
      // Cập nhật lại danh sách
      setRequests(reqs =>
        reqs.map(r => r.requestId === selected.requestId ? { ...r, ...res.data } : r)
      );
    } catch (err) {
      setUpdateError('Cập nhật thất bại!');
    } finally {
      setUpdating(false);
    }
  };

  // Xem lịch sử hiến máu (mở modal)
  const handleViewHistory = () => {
    setShowHistory(true);
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
                <th>Mã đơn</th>
                <th>Người hiến</th>
                <th>Trạng thái</th>
                <th>Ngày yêu cầu</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pagedRequests.map((r, idx) => (
                <tr key={r.requestId}>
                  <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td>{r.requestId}</td>
                  <td>{r.donorUserName || r.donorUserId}</td>
                  <td>{r.status}</td>
                  <td>{r.requestDate ? new Date(r.requestDate).toLocaleString() : ''}</td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={() => handleShowDetail(r.requestId)}>
                      Xem chi tiết
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
          {/* Phân trang */}
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

      {/* Modal chi tiết đơn */}
      {showDetail && selected && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={handleUpdate}>
                <div className="modal-header">
                  <h5 className="modal-title">Chi tiết đơn hiến máu: {selected.requestId}</h5>
                  <button type="button" className="btn-close" onClick={handleCloseDetail}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-2"><b>Người hiến:</b> {selected.donorUserName || selected.donorUserId}</div>
                  <div className="mb-2"><b>Nhóm máu:</b> {selected.bloodTypeName}</div>
                  <div className="mb-2"><b>Thành phần:</b> {selected.componentName}</div>
                  <div className="mb-2"><b>Ngày mong muốn:</b> {selected.preferredDate}</div>
                  <div className="mb-2"><b>Khung giờ:</b> {selected.preferredTimeSlot}</div>
                  <div className="mb-2"><b>Trạng thái:</b>
                    <select
                      className="form-select d-inline w-auto ms-2"
                      value={selected.status}
                      onChange={e => setSelected(s => ({ ...s, status: e.target.value }))}
                      disabled={updating}
                    >
                      <option value="Pending">Đang chờ</option>
                      <option value="Scheduled">Đã xếp lịch</option>
                      <option value="Completed">Đã hiến</option>
                      <option value="Cancelled">Hủy</option>
                      <option value="Rejected">Từ chối</option>
                    </select>
                  </div>
                  <div className="mb-2">
                    <b>Ghi chú nhân viên:</b>
                    <textarea
                      className="form-control"
                      value={selected.staffNotes || ''}
                      onChange={e => setSelected(s => ({ ...s, staffNotes: e.target.value }))}
                      rows={2}
                      disabled={updating}
                    />
                  </div>
                  {updateError && <div className="alert alert-danger">{updateError}</div>}
                  {updateMsg && <div className="alert alert-success">{updateMsg}</div>}
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-success" disabled={updating}>
                    {updating ? 'Đang cập nhật...' : 'Cập nhật'}
                  </button>
                  {selected.status === 'Completed' && (
                    <button
                      type="button"
                      className="btn btn-info"
                      onClick={() => setShowHistory(true)}
                    >
                      Xem lịch sử hiến máu
                    </button>
                  )}
                  <button type="button" className="btn btn-secondary" onClick={handleCloseDetail}>Đóng</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal xem lịch sử hiến máu thực tế */}
      {showHistory && selected && (
        <DonationHistoryByRequestModal
          requestId={selected.requestId}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}

export default DonationRequestManager;