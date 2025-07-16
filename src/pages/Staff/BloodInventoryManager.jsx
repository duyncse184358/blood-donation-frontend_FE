import React, { useEffect, useState } from 'react';
import api from '../../services/Api';

const PAGE_SIZE = 10;

// Nếu có sẵn danh sách nhóm máu và thành phần, bạn có thể import hoặc định nghĩa ở đây
const BLOOD_TYPES = [
  { value: '', label: '--Tất cả--' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];
const COMPONENTS = [
  { value: '', label: '--Tất cả--' },
  { value: 'Hồng cầu', label: 'Hồng cầu' },
  { value: 'Tiểu cầu', label: 'Tiểu cầu' },
  { value: 'Huyết tương', label: 'Huyết tương' },
  { value: 'Bạch cầu', label: 'Bạch cầu' },
];
const STATUSES = [
  { value: '', label: '--Tất cả--' },
  { value: 'Available', label: 'Có sẵn' },
  { value: 'Reserved', label: 'Đã đặt' },
  { value: 'Discarded', label: 'Đã loại bỏ' },
  { value: 'Used', label: 'Đã sử dụng' },
  { value: 'Testing', label: 'Đang kiểm tra' },
  { value: 'Separating', label: 'Đang tách' },
  { value: 'Separated', label: 'Đã tách' },
  { value: 'Usable', label: 'Có thể sử dụng' },
  { value: 'Pending', label: 'Đang chờ xử lý' },
];

function BloodInventoryManager({ onEditUnit, reloadFlag, reloadInventory }) {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState('');
  // Thêm state cho filter
  const [filterBloodType, setFilterBloodType] = useState('');
  const [filterComponent, setFilterComponent] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchUnits();
    // eslint-disable-next-line
  }, [reloadFlag]);

  const fetchUnits = () => {
    setLoading(true);
    api.get('/BloodUnit')
      .then(res => {
        const sorted = [...res.data].sort((a, b) => new Date(b.collectionDate) - new Date(a.collectionDate));
        setUnits(sorted);
      })
      .catch(() => setUnits([]))
      .finally(() => setLoading(false));
  };

  // Lọc dữ liệu theo filter
  const filteredUnits = units.filter(u =>
    (filterBloodType === '' || u.bloodTypeName === filterBloodType) &&
    (filterComponent === '' || u.componentName === filterComponent) &&
    (filterStatus === '' || u.status === filterStatus)
  );

  const pagedUnits = filteredUnits.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filteredUnits.length / PAGE_SIZE);

  // Xóa đơn vị máu
  const handleDelete = async (unitId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa đơn vị máu này?')) return;
    try {
      await api.delete(`/BloodUnit/${unitId}`);
      setMessage('Đã xóa đơn vị máu!');
      if (reloadInventory) reloadInventory();
    } catch {
      setMessage('Xóa thất bại!');
    }
  };

  // Khi thay đổi filter thì về trang 1
  useEffect(() => {
    setPage(1);
  }, [filterBloodType, filterComponent, filterStatus]);

  const getEmptyBloodTypes = () => {
    const bloodTypesWithUnits = units.map(u => u.bloodTypeName);
    return BLOOD_TYPES.filter(b => b.value && !bloodTypesWithUnits.includes(b.value)).map(b => b.label);
  };

  return (
    <div>
      <h4 className="mb-3">Quản lý kho máu</h4>

      {/* Hiển thị nhóm máu đang hết */}
      <div className="card border-danger mb-3">
        <div className="card-header bg-danger text-white text-center">
          <h5 className="mb-0">Nhóm máu đang hết</h5>
        </div>
        <div className="card-body">
          {getEmptyBloodTypes().length > 0 ? (
            <ul className="list-group">
              {getEmptyBloodTypes().map((bloodType, idx) => (
                <li key={idx} className="list-group-item d-flex justify-content-between align-items-center list-group-item-danger">
                  <span className="fw-bold">{bloodType}</span>
                  <i className="bi bi-droplet-half text-danger"></i>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center">
              <i className="bi bi-check-circle-fill text-success me-2"></i>
              <span className="badge bg-success p-3">Tất cả các nhóm máu đều có sẵn</span>
            </div>
          )}
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="row mb-3">
        <div className="col-md-3">
          <label className="form-label mb-1">Lọc theo nhóm máu</label>
          <select
            className="form-select"
            value={filterBloodType}
            onChange={e => setFilterBloodType(e.target.value)}
          >
            {BLOOD_TYPES.map(b => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label mb-1">Lọc theo thành phần</label>
          <select
            className="form-select"
            value={filterComponent}
            onChange={e => setFilterComponent(e.target.value)}
          >
            {COMPONENTS.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label mb-1">Lọc theo trạng thái</label>
          <select
            className="form-select"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            {STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>
      {message && <div className="alert alert-info">{message}</div>}
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <>
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã đơn vị</th>
                <th>Nhóm máu</th>
                <th>Thành phần</th>
                <th>Thể tích (ml)</th>
                <th>Ngày lấy</th>
                <th>Trạng thái</th>
                <th>Chức năng</th>
              </tr>
            </thead>
            <tbody>
              {pagedUnits.map((u, idx) => (
                <tr key={u.unitId}>
                  <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td>{u.unitId}</td>
                  <td>{u.bloodTypeName}</td>
                  <td>{u.componentName}</td>
                  <td>{u.volumeMl}</td>
                  <td>{u.collectionDate}</td>
                  <td>
                    <span
                      className={
                        "badge " +
                        (u.status === 'Available' ? "bg-success" :
                        u.status === 'Reserved' ? "bg-primary" :
                        u.status === 'Discarded' ? "bg-danger" :
                        u.status === 'Used' ? "bg-secondary" :
                        u.status === 'Testing' ? "bg-warning text-dark" :
                        u.status === 'Separating' ? "bg-info text-dark" :
                        u.status === 'Separated' ? "bg-dark" :
                        u.status === 'Usable' ? "bg-success" :
                        u.status === 'Pending' ? "bg-light text-dark" :
                        "bg-light text-dark")
                      }
                      style={{ fontSize: '0.95em', padding: '0.4em 0.8em' }}
                    >
                      {u.status === 'Available' && 'Có sẵn'}
                      {u.status === 'Reserved' && 'Đã đặt'}
                      {u.status === 'Discarded' && 'Đã loại bỏ'}
                      {u.status === 'Used' && 'Đã sử dụng'}
                      {u.status === 'Testing' && 'Đang kiểm tra'}
                      {u.status === 'Separating' && 'Đang tách'}
                      {u.status === 'Separated' && 'Đã tách'}
                      {u.status === 'Usable' && 'Có thể sử dụng'}
                      {u.status === 'Pending' && 'Đang chờ xử lý'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-warning me-1" onClick={() => onEditUnit(u)}>Sửa</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.unitId)}>Xóa</button>
                  </td>
                </tr>
              ))}
              {pagedUnits.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-muted">Không có dữ liệu</td>
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

export default BloodInventoryManager;