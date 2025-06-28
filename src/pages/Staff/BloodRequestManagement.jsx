import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/Api';

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

function BloodRequestManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
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

  // Sửa yêu cầu máu khẩn cấp (cần triển khai modal hoặc trang chỉnh sửa)
  const handleEditRequest = (request) => {
    alert('Chức năng sửa chưa được triển khai.\nID: ' + request.id);
    // TODO: Hiển thị modal hoặc chuyển sang trang chỉnh sửa với dữ liệu request
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

  return (
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
              <th>Thành phần</th>
              <th>Số lượng (ml)</th>
              <th>Ưu tiên</th>
              <th>Hạn cần</th>
              <th>Mô tả</th>
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
                  <td>{COMPONENTS.find(c => c.id === r.componentId)?.name}</td>
                  <td>{r.quantityNeededMl}</td>
                  <td>{PRIORITIES.find(p => p.value === r.priority)?.label}</td>
                  <td>{r.dueDate?.slice(0, 10)}</td>
                  <td>{r.description}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary me-2"
                      onClick={() => handleViewNotification(r.id)}
                    >
                      Xem thông báo
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
    </div>
  );
}

export default BloodRequestManagement;
