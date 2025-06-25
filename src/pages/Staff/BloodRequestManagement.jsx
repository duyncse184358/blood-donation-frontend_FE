import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        // Gọi đúng endpoint mới, có thể truyền status nếu muốn lọc
        const res = await api.get('/EmergencyRequest/list?status=Pending');
        setRequests(res.data);
      } catch {
        setRequests([]);
      }
      setLoading(false);
    };
    fetchRequests();
  }, []);

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
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr><td colSpan="7" className="text-center">Không có dữ liệu</td></tr>
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default BloodRequestManagement;