import React, { useEffect, useState } from 'react';
import api from '../../services/Api';

const PAGE_SIZE = 5;

function BloodDiscardForm({ onSelectUnit }) {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [discardUnit, setDiscardUnit] = useState(null);
  const [discardEdit, setDiscardEdit] = useState(false);
  const [discardForm, setDiscardForm] = useState({});
  const [discardMsg, setDiscardMsg] = useState('');
  const [discardErr, setDiscardErr] = useState('');
  const [page, setPage] = useState(1);

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

  // Lọc các đơn vị máu quá hạn (expirationDate < hôm nay) và loại bỏ các đơn vị đã bị xóa (status === 'Deleted')
  const expiredUnits = units.filter(
    u => new Date(u.expirationDate) < new Date() && u.status !== 'Deleted'
  );
  const totalPages = Math.ceil(expiredUnits.length / PAGE_SIZE);
  const pagedUnits = expiredUnits.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    // Reset về trang 1 nếu dữ liệu thay đổi
    setPage(1);
  }, [units.length]);

  const handleDiscardClose = () => {
    setDiscardUnit(null);
    setDiscardEdit(false);
    setDiscardForm({});
    setDiscardMsg('');
    setDiscardErr('');
  };

  const handleDiscardFormChange = (e) => {
    const { name, value } = e.target;
    setDiscardForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDiscardUpdate = (e) => {
    e.preventDefault();
    // Gọi API cập nhật trạng thái/Lý do loại bỏ ở đây
    // api.put(`/BloodUnit/${discardUnit.unitId}`, discardForm)
    //   .then(() => {
    //     setDiscardMsg('Cập nhật thành công');
    //     fetchUnits();
    //   })
    //   .catch(() => setDiscardErr('Cập nhật thất bại'))
    //   .finally(() => setDiscardEdit(false));
  };

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
              {pagedUnits.map(unit => (
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
                    <button className="btn btn-sm btn-info" onClick={() => onSelectUnit(unit)}>
                      Xem / Cập nhật
                    </button>
                  </td>
                </tr>
              ))}
              {pagedUnits.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-muted">Không có đơn vị máu quá hạn</td>
                </tr>
              )}
            </tbody>
          </table>
          {totalPages > 1 && (
            <nav>
              <ul className="pagination justify-content-center">
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(page - 1)}>Trước</button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                  </li>
                ))}
                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(page + 1)}>Tiếp</button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      )}

      {discardUnit && (
        <div className="modal show d-block" tabIndex="-1" style={{
          background: 'rgba(0,0,0,0.2)',
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 1050,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="modal-dialog" style={{ margin: 0 }}>
            <div className="modal-content">
              {!discardEdit ? (
                <>
                  <div className="modal-header">
                    <h5 className="modal-title">Chi tiết đơn vị máu quá hạn</h5>
                    <button type="button" className="btn-close" onClick={handleDiscardClose}></button>
                  </div>
                  <div className="modal-body">
                    <div><b>Mã đơn vị:</b> {discardUnit.unitId}</div>
                    <div><b>Nhóm máu:</b> {discardUnit.bloodTypeName}</div>
                    <div><b>Thành phần:</b> {discardUnit.componentName}</div>
                    <div><b>Thể tích (ml):</b> {discardUnit.volumeMl}</div>
                    <div><b>Ngày lấy:</b> {discardUnit.collectionDate}</div>
                    <div><b>Hạn sử dụng:</b> {discardUnit.expirationDate}</div>
                    <div><b>Kết quả xét nghiệm:</b> {discardUnit.testResults}</div>
                    <div><b>Trạng thái:</b> {discardUnit.status}</div>
                    <div><b>Lý do loại bỏ:</b> {discardUnit.discardReason}</div>
                    {discardMsg && <div className="alert alert-success mt-2">{discardMsg}</div>}
                    {discardErr && <div className="alert alert-danger mt-2">{discardErr}</div>}
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-warning" onClick={() => setDiscardEdit(true)}>Cập nhật trạng thái/Lý do</button>
                    <button className="btn btn-secondary" onClick={handleDiscardClose}>Đóng</button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleDiscardUpdate}>
                  <div className="modal-header">
                    <h5 className="modal-title">Cập nhật trạng thái/Lý do loại bỏ</h5>
                    <button type="button" className="btn-close" onClick={handleDiscardClose}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-2"><b>Trạng thái:</b>
                      <select className="form-select" name="status" value={discardForm.status || ''} onChange={handleDiscardFormChange}>
                        <option value="Available">Có sẵn</option>
                        <option value="Reserved">Đã đặt</option>
                        <option value="Discarded">Đã loại bỏ</option>
                        <option value="Used">Đã sử dụng</option>
                      </select>
                    </div>
                    <div className="mb-2"><b>Lý do loại bỏ:</b>
                      <input type="text" className="form-control" name="discardReason" value={discardForm.discardReason || ''} onChange={handleDiscardFormChange} placeholder="Nhập lý do loại bỏ (nếu có)" />
                    </div>
                    {discardMsg && <div className="alert alert-success mt-2">{discardMsg}</div>}
                    {discardErr && <div className="alert alert-danger mt-2">{discardErr}</div>}
                  </div>
                  <div className="modal-footer">
                    <button type="submit" className="btn btn-success">Lưu thay đổi</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setDiscardEdit(false)}>Hủy</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BloodDiscardForm;