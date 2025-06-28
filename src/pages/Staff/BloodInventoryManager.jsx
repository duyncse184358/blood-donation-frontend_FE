import React, { useEffect, useState } from 'react';
import api from '../../services/Api';

const PAGE_SIZE = 10;

function BloodInventoryManager() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [editUnit, setEditUnit] = useState(null); // Đơn vị máu đang sửa
  const [editForm, setEditForm] = useState({});
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

  // Khi bấm "Sửa"
  const handleEdit = (unit) => {
    setEditUnit(unit);
    setEditForm({ ...unit });
    setMessage('');
  };

  // Đóng modal
  const handleCloseModal = () => {
    setEditUnit(null);
    setEditForm({});
    setMessage('');
  };

  // Lưu chỉnh sửa
  const handleSave = async () => {
    try {
      const payload = {
        unitId: editForm.unitId,
        bloodTypeId: editForm.bloodTypeId,
        componentId: editForm.componentId,
        volumeMl: editForm.volumeMl,
        collectionDate: editForm.collectionDate,
        expirationDate: editForm.expirationDate,
        storageLocation: editForm.storageLocation,
        testResults: editForm.testResults,
        status: editForm.status,
        discardReason: editForm.discardReason,
      };
      const res = await api.put(`/BloodUnit/${editForm.unitId}`, payload);
      setUnits(units =>
        units.map(u =>
          u.unitId === editForm.unitId ? { ...u, ...res.data } : u
        )
      );
      setMessage('Cập nhật thành công!');
      handleCloseModal();
    } catch {
      setMessage('Cập nhật thất bại!');
    }
  };

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
                    <button className="btn btn-sm btn-warning me-1" onClick={() => handleEdit(u)}>Sửa</button>
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

      {/* Modal sửa */}
      {editUnit && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.2)' }} onClick={handleCloseModal}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Sửa đơn vị máu</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-2"><b>Mã đơn vị:</b> {editForm.unitId}</div>
                <div className="mb-2"><b>Nhóm máu:</b> {editForm.bloodTypeName}</div>
                <div className="mb-2"><b>Thành phần:</b> {editForm.componentName}</div>
                <div className="mb-2">
                  <b>Thể tích (ml):</b>
                  <input
                    type="number"
                    className="form-control"
                    value={editForm.volumeMl || ''}
                    onChange={e => setEditForm(f => ({ ...f, volumeMl: e.target.value }))}
                  />
                </div>
                <div className="mb-2">
                  <b>Trạng thái:</b>
                  <select
                    className="form-select"
                    value={editForm.status || ''}
                    onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                  >
                    <option value="Available">Có sẵn</option>
                    <option value="Reserved">Đã đặt</option>
                    <option value="Discarded">Đã loại bỏ</option>
                    <option value="Used">Đã sử dụng</option>
                  </select>
                </div>
                <div className="mb-2">
                  <b>Lý do loại bỏ:</b>
                  <input
                    type="text"
                    className="form-control"
                    value={editForm.discardReason || ''}
                    onChange={e => setEditForm(f => ({ ...f, discardReason: e.target.value }))}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-success" type="button" onClick={handleSave}>Lưu</button>
                <button className="btn btn-secondary" type="button" onClick={handleCloseModal}>Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {editUnit && <div className="modal-backdrop fade show"></div>}
    </div>
  );
}

export default BloodInventoryManager;