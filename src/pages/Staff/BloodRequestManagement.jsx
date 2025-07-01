import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/Api';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';

const BLOOD_TYPES = [
  { id: 1, name: 'A+' }, { id: 2, name: 'A-' },
  { id: 3, name: 'B+' }, { id: 4, name: 'B-' },
  { id: 5, name: 'AB+' }, { id: 6, name: 'AB-' },
  { id: 7, name: 'O+' }, { id: 8, name: 'O-' }
];
const COMPONENTS = [
  { id: 1, name: 'Hồng cầu' },
  { id: 2, name: 'Huyết tương' },
  { id: 3, name: 'Tiểu cầu' },
  { id: 4, name: 'Máu toàn phần' }
];
const PRIORITIES = [
  { value: 'High', label: 'Khẩn cấp' },
  { value: 'Medium', label: 'Cao' },
  { value: 'Low', label: 'Bình thường' }
];
const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Chờ xử lý' },
  { value: 'Responded', label: 'Đã có phản hồi' },
  { value: 'Approved', label: 'Hoàn thành' },
  { value: 'Rejected', label: 'Từ chối' }
];

function BloodRequestManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingRequest, setEditingRequest] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [updating, setUpdating] = useState(false);
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  const [responses, setResponses] = useState([]);
  const [responsesLoading, setResponsesLoading] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [noResponseAlert, setNoResponseAlert] = useState(false);
  const [statusEdits, setStatusEdits] = useState({});
  const noResponseTimer = useRef(null);
  const navigate = useNavigate();

  // Lấy danh sách yêu cầu máu khẩn cấp
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/EmergencyRequest/list?status=Pending');
      const mapped = res.data.map(item => ({
        ...item,
        id: item.emergencyId // Gán id = emergencyId để dùng thống nhất
      }));
      setRequests(mapped);
    } catch {
      setRequests([]);
      setMessage('Không thể tải danh sách yêu cầu máu khẩn cấp.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Xem chi tiết thông báo: chuyển trang sang EmergencyNotificationSend
  const handleViewNotification = async (requestId) => {
    if (!requestId) {
      setMessage('Không xác định được yêu cầu máu.');
      return;
    }
    try {
      const res = await api.get(`/EmergencyNotification/by-emergency/${requestId}`);
      let notification = res.data;
      // Nếu trả về mảng, lấy phần tử đầu tiên
      if (Array.isArray(notification)) {
        notification = notification[0];
      }
      if (notification && notification.notificationId) {
        // Chuyển sang trang chi tiết thông báo
        navigate(`/staff/emergency-notification/${notification.notificationId}`);
      } else {
        setMessage('Không tìm thấy thông báo liên kết với yêu cầu này.');
      }
    } catch (error) {
      setMessage('Không tìm thấy thông báo liên kết với yêu cầu này.');
    }
  };

  // Sửa yêu cầu máu khẩn cấp (hiển thị modal cập nhật)
  const handleEditRequest = (request) => {
    setEditingRequest(request);
    setEditForm({
      bloodTypeId: request.bloodTypeId,
      componentId: request.componentId,
      quantityNeededMl: request.quantityNeededMl,
      priority: request.priority,
      dueDate: request.dueDate ? request.dueDate.slice(0, 10) : '',
      description: request.description,
      status: request.status // Thêm trường status vào form sửa
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateRequest = async () => {
    if (!editingRequest) return;
    setUpdating(true);
    try {
      await api.put(`/EmergencyRequest/${editingRequest.id}`, {
        ...editForm,
        quantityNeededMl: Number(editForm.quantityNeededMl),
        bloodTypeId: Number(editForm.bloodTypeId),
        componentId: Number(editForm.componentId),
        priority: editForm.priority,
        dueDate: editForm.dueDate,
        description: editForm.description,
        status: editForm.status // Gửi status lên BE
      });
      setRequests(prev =>
        prev.map(r =>
          r.id === editingRequest.id
            ? { ...r, ...editForm }
            : r
        )
      );
      setMessage('Cập nhật yêu cầu thành công.');
      setEditingRequest(null);
    } catch {
      setMessage('Cập nhật yêu cầu thất bại.');
    }
    setUpdating(false);
  };

  const handleCancelEdit = () => {
    setEditingRequest(null);
  };

  // Xóa yêu cầu máu khẩn cấp
  const handleDeleteRequest = async (id) => {
    if (!id) {
      setMessage('Không xác định được yêu cầu máu để xóa.');
      return;
    }
    if (!window.confirm('Bạn có chắc chắn muốn xóa yêu cầu này?')) return;
    try {
      await api.delete(`/EmergencyRequest/${id}`);
      setRequests(prev => prev.filter(r => r.id !== id));
      setMessage('Đã xóa yêu cầu thành công.');
    } catch {
      setMessage('Xóa yêu cầu thất bại.');
    }
  };

  // Khi mở modal phản hồi, kiểm tra nếu sau 15 phút chưa có phản hồi thì thông báo cho staff
  const handleShowResponses = async (requestId) => {
    setSelectedRequestId(requestId);
    setShowResponsesModal(true);
    setResponses([]);
    setResponsesLoading(true);
    setNoResponseAlert(false);

    try {
      const res = await api.get(`/EmergencyNotification/by-emergency/${requestId}`);
      let data = Array.isArray(res.data) ? res.data : [res.data];

      // Lấy profile cho từng recipientUserId (nếu không phải 'ALL')
      const updatedData = await Promise.all(
        data
          .filter(resp => resp.recipientUserId !== 'ALL')
          .map(async resp => {
            let fullName = '';
            try {
              const profileRes = await api.get(`/UserProfile/by-user/${resp.recipientUserId}`);
              fullName = profileRes.data.fullName || '';
            } catch {}
            return { ...resp, fullName };
          })
      );
      setResponses(updatedData);

      // Kiểm tra nếu chưa có phản hồi nào sau 15 phút kể từ khi gửi thông báo
      if (updatedData.length > 0) {
        const sentDate = updatedData[0].sentDate;
        const sentTime = sentDate ? new Date(sentDate).getTime() : null;
        const now = Date.now();
        const fifteenMinutes = 15 * 60 * 1000;

        // Nếu đã quá 15 phút và tất cả đều chưa phản hồi
        const allNoResponse = updatedData.every(
          resp => resp.responseStatus === 'No Response'
        );
        if (sentTime && now - sentTime >= fifteenMinutes && allNoResponse) {
          setNoResponseAlert(true);
        } else if (sentTime && allNoResponse) {
          // Đặt timer để thông báo đúng lúc 15 phút
          if (noResponseTimer.current) clearTimeout(noResponseTimer.current);
          noResponseTimer.current = setTimeout(() => {
            setNoResponseAlert(true);
          }, fifteenMinutes - (now - sentTime));
        }
      }
    } catch {
      setResponses([]);
    }
    setResponsesLoading(false);
  };

  // Xóa timer khi đóng modal
  const handleCloseResponsesModal = () => {
    setShowResponsesModal(false);
    setResponses([]);
    setSelectedRequestId(null);
    setNoResponseAlert(false);
    if (noResponseTimer.current) clearTimeout(noResponseTimer.current);
  };

  // Hàm xử lý thay đổi trạng thái tạm thời
  const handleStatusChange = (id, value) => {
    setStatusEdits(prev => ({ ...prev, [id]: value }));
  };

  // Hàm cập nhật trạng thái lên server
  const handleUpdateStatus = async (id) => {
    const newStatus = statusEdits[id];
    if (!newStatus) return;
    try {
      await api.put(`/EmergencyRequest/${id}`, { status: newStatus });
      setRequests(prev =>
        prev.map(r =>
          r.id === id
            ? { ...r, status: newStatus }
            : r
        )
      );
      setMessage('Cập nhật trạng thái thành công.');
    } catch {
      setMessage('Cập nhật trạng thái thất bại.');
    }
  };

  return (
    <>
      <Header />
      <Navbar />
      <div className="container mt-4">
        <h4>Danh sách yêu cầu máu khẩn cấp</h4>

        {loading ? (
          <div>Đang tải...</div>
        ) : (
          <table className="table table-bordered mt-3">
            <thead>
              <tr>
                <th>#</th>
                <th>Nhóm máu</th>
                <th>Số lượng (ml)</th>
                <th>Ưu tiên</th>
                <th>Hạn cần</th>
                <th>Mô tả</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">Không có dữ liệu</td>
                </tr>
              ) : (
                requests.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td>{BLOOD_TYPES.find(b => b.id === r.bloodTypeId)?.name}</td>
                    <td>{r.quantityNeededMl}</td>
                    <td>{PRIORITIES.find(p => p.value === r.priority)?.label}</td>
                    <td>{r.dueDate?.slice(0, 10)}</td>
                    <td>{r.description}</td>
                    <td>
                      <span className={
                        r.status === 'Pending' ? "badge bg-warning text-dark" :
                        r.status === 'Responded' ? "badge bg-info text-dark" :
                        r.status === 'Approved' ? "badge bg-success" :
                        r.status === 'Rejected' ? "badge bg-danger" :
                        "badge bg-secondary"
                      }>
                        {STATUS_OPTIONS.find(s => s.value === r.status)?.label || r.status}
                      </span>
                      {/* Đã bỏ dropdown và nút cập nhật trạng thái tại đây */}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => handleViewNotification(r.id)}
                      >
                        Xem thông báo
                      </button>
                      <button
                        className="btn btn-sm btn-info me-2"
                        onClick={() => navigate(`/staff/emergency-responses/${r.id}`)}
                      >
                        Danh sách phản hồi
                      </button>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEditRequest(r)}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteRequest(r.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {message && (
          <div className="alert alert-warning mt-3">{message}</div>
        )}

        {/* Modal chỉnh sửa yêu cầu máu khẩn cấp */}
        {editingRequest && (
          <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Cập nhật yêu cầu máu khẩn cấp</h5>
                  <button type="button" className="btn-close" onClick={handleCancelEdit}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label">Nhóm máu</label>
                    <select
                      className="form-select"
                      name="bloodTypeId"
                      value={editForm.bloodTypeId}
                      onChange={handleEditFormChange}
                    >
                      {BLOOD_TYPES.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Thành phần</label>
                    <select
                      className="form-select"
                      name="componentId"
                      value={editForm.componentId}
                      onChange={handleEditFormChange}
                    >
                      {COMPONENTS.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Số lượng (ml)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="quantityNeededMl"
                      value={editForm.quantityNeededMl}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Ưu tiên</label>
                    <select
                      className="form-select"
                      name="priority"
                      value={editForm.priority}
                      onChange={handleEditFormChange}
                    >
                      {PRIORITIES.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Hạn cần</label>
                    <input
                      type="date"
                      className="form-control"
                      name="dueDate"
                      value={editForm.dueDate}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Mô tả</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={editForm.description}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Trạng thái</label>
                    <select
                      className="form-select"
                      name="status"
                      value={editForm.status}
                      onChange={handleEditFormChange}
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={handleCancelEdit}
                    disabled={updating}
                  >
                    Hủy
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleUpdateRequest}
                    disabled={updating}
                  >
                    {updating ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal hiển thị danh sách phản hồi */}
        {showResponsesModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Danh sách phản hồi - Đơn #{selectedRequestId}</h5>
                  <button type="button" className="btn-close" onClick={handleCloseResponsesModal}></button>
                </div>
                <div className="modal-body">
                  {noResponseAlert && (
                    <div className="alert alert-warning">
                      Đã quá 15 phút nhưng chưa có phản hồi nào từ người nhận!
                    </div>
                  )}
                  {responsesLoading ? (
                    <div>Đang tải...</div>
                  ) : responses.length === 0 ? (
                    <div className="alert alert-secondary">Chưa có phản hồi nào.</div>
                  ) : (
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Mã phản hồi</th>
                          <th>Người nhận</th>
                          <th>Phương thức</th>
                          <th>Đã đọc</th>
                          <th>Thời gian gửi</th>
                          <th>Trạng thái</th>
                          <th>Nội dung</th>
                        </tr>
                      </thead>
                      <tbody>
                        {responses
                          .filter(resp => resp.recipientUserId !== 'ALL')
                          .map((resp, idx) => (
                            <tr key={resp.notificationId || idx}>
                              <td>{resp.notificationId}</td>
                              <td>{resp.fullName || resp.recipientUserId}</td>
                              <td>{resp.deliveryMethod}</td>
                              <td>
                                {resp.isRead ? (
                                  <span className="badge bg-success">Đã đọc</span>
                                ) : (
                                  <span className="badge bg-secondary">Chưa đọc</span>
                                )}
                              </td>
                              <td>{resp.sentDate ? new Date(resp.sentDate).toLocaleString('vi-VN') : ''}</td>
                              <td>
                                {resp.responseStatus === 'Interested' && <span className="badge bg-success">Đồng ý</span>}
                                {resp.responseStatus === 'Declined' && <span className="badge bg-danger">Từ chối</span>}
                                {resp.responseStatus === 'No Response' && <span className="badge bg-secondary">Chưa phản hồi</span>}
                              </td>
                              <td>{resp.message}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={handleCloseResponsesModal}>Đóng</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default BloodRequestManagement;
