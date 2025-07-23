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

const PAGE_SIZE = 5; // Số lượng mỗi trang

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageByStatus, setPageByStatus] = useState({
    Pending: 1,
    Responded: 1,
    Approved: 1,
    Rejected: 1,
  });
  const pageSize = 10;
  const noResponseTimer = useRef(null);
  const navigate = useNavigate();

  // Hàm để map status từ database thành status hiển thị
  const mapStatusToDisplay = (status) => {
    if (!status) return 'Pending';
    
    // Kiểm tra exact match trước
    if (status === 'Pending' || status === 'Responded' || status === 'Approved' || status === 'Rejected') {
      return status;
    }
    
    const normalizedStatus = status.toLowerCase();
    
    if (normalizedStatus.includes('pending') || normalizedStatus.includes('no response')) {
      return 'Pending';
    }
    if (normalizedStatus.includes('interested') || normalizedStatus.includes('responded')) {
      return 'Responded';
    }
    if (normalizedStatus.includes('approved') || normalizedStatus.includes('completed') || normalizedStatus.includes('complete')) {
      return 'Approved';
    }
    if (normalizedStatus.includes('rejected') || normalizedStatus.includes('declined')) {
      return 'Rejected';
    }
    
    return 'Pending'; // Mặc định là Pending
  };

  // Lấy toàn bộ danh sách yêu cầu máu khẩn cấp
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/EmergencyRequest/list');
      console.log('Raw API response:', res.data);
      
      // Lấy thông tin phản hồi cho từng yêu cầu để xác định trạng thái thực tế
      const mappedWithStatus = await Promise.all(
        res.data.map(async (item) => {
          let actualStatus = item.status || 'Pending';
          
          try {
            // Lấy danh sách phản hồi cho yêu cầu này
            const notificationRes = await api.get(`/EmergencyNotification/by-emergency/${item.emergencyId}`);
            const notifications = Array.isArray(notificationRes.data) ? notificationRes.data : [notificationRes.data];
            
            // Lọc các phản hồi từ người dùng (không phải 'ALL')
            const userResponses = notifications.filter(n => n.recipientUserId !== 'ALL');
            
            if (userResponses.length > 0) {
              // Kiểm tra trạng thái phản hồi
              const hasInterested = userResponses.some(n => n.responseStatus === 'Interested');
              const hasDeclined = userResponses.some(n => n.responseStatus === 'Declined');
              const hasNoResponse = userResponses.some(n => n.responseStatus === 'No Response');
              const allDeclined = userResponses.length > 0 && userResponses.every(n => n.responseStatus === 'Declined');
              
              console.log(`Request ${item.emergencyId} responses:`, {
                hasInterested,
                hasDeclined,
                hasNoResponse,
                allDeclined,
                responses: userResponses.map(r => ({ userId: r.recipientUserId, status: r.responseStatus }))
              });
              
              // Logic ưu tiên:
              // 1. Nếu có ít nhất 1 người đồng ý → "Responded" (Đã có phản hồi)
              // 2. Nếu tất cả đều từ chối → "Rejected" (Từ chối)
              // 3. Nếu còn người chưa phản hồi → giữ nguyên "Pending"
              
              if (hasInterested) {
                actualStatus = 'Responded'; // Ưu tiên: có người đồng ý
                console.log(`Request ${item.emergencyId}: Set to Responded (has interested)`);
              } else if (allDeclined) {
                actualStatus = 'Rejected'; // Tất cả đều từ chối
                console.log(`Request ${item.emergencyId}: Set to Rejected (all declined)`);
              }
              // Nếu còn người chưa phản hồi (hasNoResponse), giữ nguyên Pending
              
              // Nếu status trong database là 'Approved', luôn giữ nguyên (cao nhất)
              if (item.status === 'Approved') {
                actualStatus = 'Approved';
                console.log(`Request ${item.emergencyId}: Kept as Approved from database`);
              }
            }
          } catch (error) {
            console.log('Error fetching notifications for request:', item.emergencyId, error);
          }
          
          return {
            ...item,
            id: item.emergencyId,
            actualStatus,
            displayStatus: mapStatusToDisplay(actualStatus)
          };
        })
      );
      
      console.log('Mapped requests with actual status:', mappedWithStatus);
      setRequests(mappedWithStatus);
    } catch {
      setRequests([]);
      setMessage('Không thể tải danh sách yêu cầu máu khẩn cấp.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Thêm refresh khi quay lại trang từ trang khác
  useEffect(() => {
    const handleFocus = () => {
      fetchRequests();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
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
      status: request.actualStatus || request.status // Sử dụng actualStatus nếu có
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Cập nhật trạng thái (chỉ status)
  const handleUpdateRequest = async () => {
    if (!editingRequest) return;
    setUpdating(true);
    try {
      await api.put(`/EmergencyRequest/${editingRequest.id}/status`, JSON.stringify(editForm.status), {
        headers: { 'Content-Type': 'application/json' }
      });
      setRequests(prev =>
        prev.map(r =>
          r.id === editingRequest.id
            ? { 
                ...r, 
                ...editForm,
                actualStatus: editForm.status,
                displayStatus: mapStatusToDisplay(editForm.status)
              }
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
      await api.put(`/EmergencyRequest/${id}/status`, JSON.stringify('Deleted'), {
        headers: { 'Content-Type': 'application/json' }
      });
      setRequests(prev => prev.filter(r => r.id !== id && r.status !== 'Deleted' && r.actualStatus !== 'Deleted'));
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

  // Nhóm các yêu cầu theo status
  const groupedRequests = STATUS_OPTIONS.reduce((acc, opt) => {
    acc[opt.value] = requests.filter(r => r.actualStatus === opt.value);
    return acc;
  }, {});

  // Hàm đổi trang cho từng status
  const handleChangePage = (status, newPage) => {
    setPageByStatus(prev => ({
      ...prev,
      [status]: newPage,
    }));
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
          <>
            {STATUS_OPTIONS.map(statusOpt => {
              const allRequests = groupedRequests[statusOpt.value] || [];
              const totalPages = Math.ceil(allRequests.length / PAGE_SIZE);
              const currentPage = pageByStatus[statusOpt.value] || 1;
              const pagedRequests = allRequests.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

              return (
                <div key={statusOpt.value} className="mb-5">
                  <h5>
                    {statusOpt.label} ({allRequests.length})
                  </h5>
                  <table className="table table-bordered mt-2">
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
                      {pagedRequests.length > 0 ? (
                        pagedRequests.map((r, i) => (
                          <tr key={r.id}>
                            <td>{(currentPage - 1) * PAGE_SIZE + i + 1}</td>
                            <td>{BLOOD_TYPES.find(b => b.id === r.bloodTypeId)?.name}</td>
                            <td>{r.quantityNeededMl}</td>
                            <td>{PRIORITIES.find(p => p.value === r.priority)?.label}</td>
                            <td>{r.dueDate?.slice(0, 10)}</td>
                            <td>{r.description}</td>
                            <td>
                              <span className={
                                r.actualStatus === 'Pending' ? "badge bg-warning text-dark" :
                                r.actualStatus === 'Responded' ? "badge bg-info text-dark" :
                                r.actualStatus === 'Approved' ? "badge bg-success" :
                                r.actualStatus === 'Rejected' ? "badge bg-danger" :
                                "badge bg-secondary"
                              }>
                                {STATUS_OPTIONS.find(s => s.value === r.actualStatus)?.label || r.actualStatus}
                              </span>
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
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center text-muted">Không có dữ liệu</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {totalPages > 1 && (
                    <nav>
                      <ul className="pagination justify-content-center">
                        <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
                          <button className="page-link" onClick={() => handleChangePage(statusOpt.value, currentPage - 1)} disabled={currentPage === 1}>Trước</button>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => (
                          <li key={i} className={`page-item${currentPage === i + 1 ? ' active' : ''}`}>
                            <button className="page-link" onClick={() => handleChangePage(statusOpt.value, i + 1)}>
                              {i + 1}
                            </button>
                          </li>
                        ))}
                        <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
                          <button className="page-link" onClick={() => handleChangePage(statusOpt.value, currentPage + 1)} disabled={currentPage === totalPages}>Tiếp</button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </div>
              );
            })}
          </>
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
