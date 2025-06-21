import React, { useEffect, useState } from 'react';
import api from '../../services/Api';

function BloodDiscardForm() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // Lấy tất cả đơn vị máu
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

  // Lọc các đơn vị máu quá hạn (expirationDate < hôm nay)
  const expiredUnits = units.filter(u => new Date(u.expirationDate) < new Date());

  // Xem chi tiết
  const handleSelect = (unit) => {
    setSelected(unit);
    setForm(unit);
    setEdit(false);
    setMsg('');
    setErr('');
  };

  // Đóng modal chi tiết
  const handleClose = () => {
    setSelected(null);
    setEdit(false);
    setMsg('');
    setErr('');
  };

  // Cập nhật trạng thái và lý do loại bỏ
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
      <h4 className="mb-3">Danh sách đơn vị máu quá hạn</h4>
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
                <th>Hạn sử dụng</th>
                <th>Trạng thái</th>
                <th>Lý do loại bỏ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {expiredUnits.map(unit => (
                <tr key={unit.unitId}>
                  <td>{unit.unitId}</td>
                  <td>{unit.bloodTypeName}</td>
                  <td>{unit.componentName}</td>
                  <td>{unit.volumeMl}</td>
                  <td>{unit.collectionDate}</td>
                  <td>{unit.expirationDate}</td>
                  <td>
                    {unit.status === 'Available' && <span className="badge bg-success">Có sẵn</span>}
                    {unit.status === 'Reserved' && <span className="badge bg-primary">Đã đặt</span>}
                    {unit.status === 'Discarded' && <span className="badge bg-danger">Đã loại bỏ</span>}
                    {unit.status === 'Used' && <span className="badge bg-secondary">Đã sử dụng</span>}
                    {unit.status !== 'Available' && unit.status !== 'Reserved' && unit.status !== 'Discarded' && unit.status !== 'Used' && (
                      <span className="badge bg-secondary">{unit.status}</span>
                    )}
                  </td>
                  <td>{unit.discardReason}</td>
                  <td>
                    <button className="btn btn-sm btn-info" onClick={() => handleSelect(unit)}>
                      Xem / Cập nhật
                    </button>
                  </td>
                </tr>
              ))}
              {expiredUnits.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-muted">Không có đơn vị máu quá hạn</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal chi tiết & cập nhật */}
      {selected && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              {!edit ? (
                <>
                  <div className="modal-header">
                    <h5 className="modal-title">Chi tiết đơn vị máu quá hạn</h5>
                    <button type="button" className="btn-close" onClick={handleClose}></button>
                  </div>
                  <div className="modal-body">
                    <div><b>Mã đơn vị:</b> {selected.unitId}</div>
                    <div><b>Nhóm máu:</b> {selected.bloodTypeName}</div>
                    <div><b>Thành phần:</b> {selected.componentName}</div>
                    <div><b>Thể tích (ml):</b> {selected.volumeMl}</div>
                    <div><b>Ngày lấy:</b> {selected.collectionDate}</div>
                    <div><b>Hạn sử dụng:</b> {selected.expirationDate}</div>
                    <div><b>Kết quả xét nghiệm:</b> {selected.testResults}</div>
                    <div><b>Trạng thái:</b> 
                      {selected.status === 'Available' && <span className="badge bg-success ms-2">Có sẵn</span>}
                      {selected.status === 'Reserved' && <span className="badge bg-primary ms-2">Đã đặt</span>}
                      {selected.status === 'Discarded' && <span className="badge bg-danger ms-2">Đã loại bỏ</span>}
                      {selected.status === 'Used' && <span className="badge bg-secondary ms-2">Đã sử dụng</span>}
                      {selected.status !== 'Available' && selected.status !== 'Reserved' && selected.status !== 'Discarded' && selected.status !== 'Used' && (
                        <span className="badge bg-secondary ms-2">{selected.status}</span>
                      )}
                    </div>
                    <div><b>Lý do loại bỏ:</b> {selected.discardReason}</div>
                    {msg && <div className="alert alert-success mt-2">{msg}</div>}
                    {err && <div className="alert alert-danger mt-2">{err}</div>}
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-warning" onClick={() => setEdit(true)}>Cập nhật trạng thái/Lý do</button>
                    <button className="btn btn-secondary" onClick={handleClose}>Đóng</button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleUpdate}>
                  <div className="modal-header">
                    <h5 className="modal-title">Cập nhật trạng thái/Lý do loại bỏ</h5>
                    <button type="button" className="btn-close" onClick={handleClose}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-2"><b>Trạng thái:</b>
                      <select className="form-select" name="status" value={form.status || ''} onChange={handleChange}>
                        <option value="Available">Có sẵn</option>
                        <option value="Reserved">Đã đặt</option>
                        <option value="Discarded">Đã loại bỏ</option>
                        <option value="Used">Đã sử dụng</option>
                      </select>
                    </div>
                    <div className="mb-2"><b>Lý do loại bỏ:</b>
                      <input type="text" className="form-control" name="discardReason" value={form.discardReason || ''} onChange={handleChange} placeholder="Nhập lý do loại bỏ (nếu có)" />
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

export default BloodDiscardForm;