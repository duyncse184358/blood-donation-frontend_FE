import React, { useEffect, useState } from 'react';
import api from '../../services/Api';

function BloodInventoryManager() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [deleteMsg, setDeleteMsg] = useState('');
  const [deleteErr, setDeleteErr] = useState('');

  // Lấy danh sách kho máu
  const fetchUnits = () => {
    setLoading(true);
    api.get('/BloodUnit')
      .then(res => setUnits(res.data))
      .catch(() => setUnits([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  // Xem chi tiết
  const handleSelect = (unit) => {
    setSelected(unit);
    setForm(unit);
    setEdit(false);
    setMsg('');
    setErr('');
    setDeleteMsg('');
    setDeleteErr('');
  };

  // Đóng modal chi tiết
  const handleClose = () => {
    setSelected(null);
    setEdit(false);
    setMsg('');
    setErr('');
    setDeleteMsg('');
    setDeleteErr('');
  };

  // Cập nhật đơn vị máu
  const handleUpdate = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    try {
      const payload = {
        donationId: form.donationId,
        bloodTypeId: form.bloodTypeId,
        componentId: form.componentId,
        volumeMl: form.volumeMl,
        collectionDate: form.collectionDate,
        testResults: form.testResults,
        status: form.status,
        discardReason: form.discardReason,
      };
      const res = await api.put(`/BloodUnit/${form.unitId}`, payload);
      setSelected(res.data);
      setForm(res.data);
      setMsg('Cập nhật thành công!');
      setEdit(false);
      fetchUnits();
    } catch {
      setErr('Cập nhật thất bại!');
    }
  };

  // Xóa đơn vị máu
  const handleDelete = async () => {
    setDeleteMsg('');
    setDeleteErr('');
    try {
      await api.delete(`/BloodUnit/${selected.unitId}`);
      setDeleteMsg('Đã xóa đơn vị máu thành công!');
      setSelected(null);
      fetchUnits();
    } catch {
      setDeleteErr('Không thể xóa đơn vị máu này!');
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  useEffect(() => {
    if (selected) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [selected]);

  return (
    <div>
      <h4 className="mb-3">Quản lý kho máu</h4>
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead>
              <tr>
                <th>Mã đơn vị</th>
                <th>Nhóm máu</th>
                <th>Thành phần</th>
                <th>Thể tích (ml)</th>
                <th>Ngày lấy</th>
                <th>Hạn dùng</th>
                <th>Vị trí lưu trữ</th>
                <th>Kết quả xét nghiệm</th>
                <th>Trạng thái</th>
                <th>Lý do loại bỏ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {units.map(unit => (
                <tr key={unit.unitId}>
                  <td>{unit.unitId}</td>
                  <td>{unit.bloodTypeName}</td>
                  <td>{unit.componentName}</td>
                  <td>{unit.volumeMl}</td>
                  <td>{unit.collectionDate}</td>
                  <td>{unit.expirationDate}</td>
                  <td>{unit.storageLocation}</td>
                  <td>{unit.testResults}</td>
                  <td>
                    {unit.status === 'Available' && <span className="badge bg-success">Có sẵn</span>}
                    {unit.status === 'Reserved' && <span className="badge bg-primary">Đã đặt</span>}
                    {unit.status === 'Discarded' && <span className="badge bg-danger">Đã loại bỏ</span>}
                    {unit.status !== 'Available' && unit.status !== 'Reserved' && unit.status !== 'Discarded' && (
                      <span className="badge bg-secondary">{unit.status}</span>
                    )}
                  </td>
                  <td>{unit.discardReason}</td>
                  <td>
                    <button className="btn btn-sm btn-info" onClick={() => handleSelect(unit)}>
                      Xem / Sửa / Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {units.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center text-muted">Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal chi tiết & chỉnh sửa */}
      {selected && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              {!edit ? (
                <>
                  <div className="modal-header">
                    <h5 className="modal-title">Chi tiết đơn vị máu</h5>
                    <button type="button" className="btn-close" onClick={handleClose}></button>
                  </div>
                  <div className="modal-body">
                    <div><b>Mã đơn vị:</b> {selected.unitId}</div>
                    <div><b>Nhóm máu:</b> {selected.bloodTypeName}</div>
                    <div><b>Thành phần:</b> {selected.componentName}</div>
                    <div><b>Thể tích (ml):</b> {selected.volumeMl}</div>
                    <div><b>Ngày lấy:</b> {selected.collectionDate}</div>
                    <div><b>Hạn dùng:</b> {selected.expirationDate}</div>
                    <div><b>Vị trí lưu trữ:</b> {selected.storageLocation}</div>
                    <div><b>Kết quả xét nghiệm:</b> {selected.testResults}</div>
                    <div><b>Trạng thái:</b> {selected.status}</div>
                    <div><b>Lý do loại bỏ:</b> {selected.discardReason}</div>
                    {msg && <div className="alert alert-success mt-2">{msg}</div>}
                    {err && <div className="alert alert-danger mt-2">{err}</div>}
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-warning" onClick={() => setEdit(true)}>Chỉnh sửa</button>
                    <button className="btn btn-outline-danger" onClick={handleDelete}>Xóa đơn vị máu</button>
                    <button className="btn btn-secondary" onClick={handleClose}>Đóng</button>
                    {deleteMsg && <div className="text-success mt-2">{deleteMsg}</div>}
                    {deleteErr && <div className="text-danger mt-2">{deleteErr}</div>}
                  </div>
                </>
              ) : (
                <form onSubmit={handleUpdate}>
                  <div className="modal-header">
                    <h5 className="modal-title">Chỉnh sửa đơn vị máu</h5>
                    <button type="button" className="btn-close" onClick={handleClose}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-2"><b>Nhóm máu:</b>
                      <input type="number" className="form-control" name="bloodTypeId" value={form.bloodTypeId || ''} onChange={handleChange} />
                    </div>
                    <div className="mb-2"><b>Thành phần:</b>
                      <input type="number" className="form-control" name="componentId" value={form.componentId || ''} onChange={handleChange} />
                    </div>
                    <div className="mb-2"><b>Thể tích (ml):</b>
                      <input type="number" className="form-control" name="volumeMl" value={form.volumeMl || ''} onChange={handleChange} />
                    </div>
                    <div className="mb-2"><b>Ngày lấy:</b>
                      <input type="date" className="form-control" name="collectionDate" value={form.collectionDate || ''} onChange={handleChange} />
                    </div>
                    <div className="mb-2"><b>Kết quả xét nghiệm:</b>
                      <input type="text" className="form-control" name="testResults" value={form.testResults || ''} onChange={handleChange} />
                    </div>
                    <div className="mb-2"><b>Trạng thái:</b>
                      <select className="form-select" name="status" value={form.status || ''} onChange={handleChange}>
                        <option value="Available">Có sẵn</option>
                        <option value="Reserved">Đã đặt</option>
                        <option value="Discarded">Đã loại bỏ</option>
                        <option value="Used">Đã sử dụng</option>
                      </select>
                    </div>
                    <div className="mb-2"><b>Lý do loại bỏ:</b>
                      <input type="text" className="form-control" name="discardReason" value={form.discardReason || ''} onChange={handleChange} />
                    </div>
                    {msg && <div className="alert alert-success mt-2">{msg}</div>}
                    {err && <div className="alert alert-danger mt-2">{err}</div>}
                  </div>
                  <div className="modal-footer">
                    <button type="submit" className="btn btn-success">Lưu thay đổi</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setEdit(false)}>Hủy</button>
                  </div>
                </form>
              )}
            </div>
          </div>
          <style>{`
            .modal-content { animation: fadeInModal 0.3s; }
            @keyframes fadeInModal {
              from { opacity: 0; transform: translateY(40px);}
              to { opacity: 1; transform: none;}
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

export default BloodInventoryManager;