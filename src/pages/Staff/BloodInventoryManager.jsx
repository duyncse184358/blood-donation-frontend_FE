import React, { useEffect, useState } from 'react';
import api from '../../services/Api';

const PAGE_SIZE = 10;

function BloodInventoryManager({ onEditUnit }) {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUnits();
    // eslint-disable-next-line
  }, []);

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

  const pagedUnits = units.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(units.length / PAGE_SIZE);

  // Xóa đơn vị máu
  const handleDelete = async (unitId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa đơn vị máu này?')) return;
    try {
      await api.delete(`/BloodUnit/${unitId}`);
      setUnits(units => units.filter(u => u.unitId !== unitId));
      setMessage('Đã xóa đơn vị máu!');
    } catch {
      setMessage('Xóa thất bại!');
    }
  };

  return (
    <div>
      <h4 className="mb-3">Quản lý kho máu</h4>
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
                    {u.status === 'Available' && 'Có sẵn'}
                    {u.status === 'Reserved' && 'Đã đặt'}
                    {u.status === 'Discarded' && 'Đã loại bỏ'}
                    {u.status === 'Used' && 'Đã sử dụng'}
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