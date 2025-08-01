import React, { useEffect, useState } from 'react';
import api from '../../services/Api';
import BloodDonationCertificate from '../../components/Certificate/BloodDonationCertificate';
// Danh sách nhóm máu, thành phần, trạng thái dùng cho select
const BLOOD_TYPES = [
  { value: '', label: '--Chọn nhóm máu--' },
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
  { value: '', label: '--Chọn thành phần--' },
  { value: 'Hồng cầu', label: 'Hồng cầu' },
  { value: 'Tiểu cầu', label: 'Tiểu cầu' },
  { value: 'Huyết tương', label: 'Huyết tương' },
  { value: 'Bạch cầu', label: 'Bạch cầu' },
];
const STATUSES = [
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

// Map blood type ID to blood group label (the same as CertificateList)
const BLOOD_TYPE_MAP = {
  1: 'A',
  2: 'B',
  3: 'O',
  4: 'AB',
  5: 'A+',
  6: 'A-',
  7: 'B+',
  8: 'B-',
  9: 'O+',
 10: 'O-',
 11: 'AB+',
 12: 'AB-'
};

function getBloodTypeName(bloodTypeId, bloodTypeName) {
  if (bloodTypeName && typeof bloodTypeName === 'string') return bloodTypeName;
  if (!bloodTypeId) return 'Không rõ';
  const id = typeof bloodTypeId === 'string' ? parseInt(bloodTypeId, 10) : bloodTypeId;
  return BLOOD_TYPE_MAP[id] || 'Không rõ';
}


function CertificateManagement() {
  const [certList, setCertList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCert, setSelectedCert] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);
  // State cho modal blood unit (mini inventory)
  const [bloodUnits, setBloodUnits] = useState([]); // Danh sách blood unit liên quan
  const [showBloodUnitTable, setShowBloodUnitTable] = useState(false);
  const [bloodUnitLoading, setBloodUnitLoading] = useState(false);
  const [bloodUnitError, setBloodUnitError] = useState('');
  // Filter & paging cho mini inventory
  const [filterBloodType, setFilterBloodType] = useState('');
  const [filterComponent, setFilterComponent] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCertCode, setFilterCertCode] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  // State for editing blood unit
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  // Reset filter & page khi mở bảng kho máu
  useEffect(() => {
    if (showBloodUnitTable) {
      setFilterBloodType('');
      setFilterComponent('');
      setFilterStatus('');
      setPage(1);
    }
  }, [showBloodUnitTable]);
  // Không cần donorNames nữa, sẽ cập nhật trực tiếp certList

  useEffect(() => {
    const fetchAllCertificates = async () => {
      setLoading(true);
      setError('');
      try {
        // Lấy toàn bộ lịch sử hiến máu
        const res = await api.get('/DonationHistory');
        // Lọc các bản ghi có status == 'Use'
        const filtered = (Array.isArray(res.data) ? res.data : []).filter(
          h => h.status && h.status.toLowerCase() === 'use'
        );
        // Fetch profile cho từng bản ghi, cập nhật vào mảng tạm, setCertList một lần duy nhất
        const certsWithName = await Promise.all(filtered.map(async (cert) => {
          const donorId = cert.donorUserId || cert.userId;
          if (donorId) {
            try {
              const resUser = await api.get(`/UserProfile/by-user/${donorId}`);
              return { ...cert, fullName: (resUser.data && resUser.data.fullName) ? resUser.data.fullName : '' };
            } catch (err) {
              return { ...cert, fullName: '' };
            }
          } else {
            return cert;
          }
        }));
        setCertList(certsWithName);
      } catch (e) {
        setError('Không thể tải danh sách chứng chỉ.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllCertificates();
  }, []);

  return (
    <div className="container mt-4">
      <h3>Quản lý chứng chỉ hiến máu đã sử dụng</h3>
      {loading && <div>Đang tải dữ liệu...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && (
        <table className="table table-bordered mt-3">
          <thead>
            <tr>
              <th>Mã chứng chỉ</th>
              <th>Người hiến máu</th>
              <th>Ngày hiến</th>
              <th>Thể tích (ml)</th>
              <th>Địa điểm</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {certList.length === 0 ? (
              <tr><td colSpan={6} className="text-center">Không có chứng chỉ nào đã sử dụng.</td></tr>
            ) : certList.map(cert => {
              let fullNameDisplay = '-';
              if (typeof cert.fullName === 'string' && cert.fullName.trim()) {
                fullNameDisplay = cert.fullName.trim();
              } else if (!(cert.donorUserId || cert.userId)) {
                fullNameDisplay = 'Không rõ';
              }
              return (
                <tr key={cert.donationId}>
                  <td>{'B' + cert.donationId}</td>
                  <td>{fullNameDisplay}</td>
                  <td>{cert.donationDate ? new Date(cert.donationDate).toLocaleDateString('vi-VN') : ''}</td>
                  <td>{cert.quantityMl}</td>
                  <td>{cert.location || cert.organization || ''}</td>
                  <td style={{display:'flex',gap:4,flexDirection:'column'}}>
                    <button className="btn btn-sm btn-info mb-1" onClick={() => {
                      // Lấy bản mới nhất từ certList (theo donationId)
                      const latest = certList.find(c => c.donationId === cert.donationId) || cert;
                      setSelectedCert(latest);
                      setShowCertModal(true);
                    }}>Xem chứng chỉ</button>
                    <button className="btn btn-sm btn-success mb-1" onClick={async () => {
                      try {
                        await api.put(`/DonationHistory/${cert.donationId}`, { ...cert, status: 'Used' });
                        setCertList(list => list.filter(c => c.donationId !== cert.donationId));
                        alert('Đã cập nhật trạng thái sang Used!');
                      } catch {
                        alert('Cập nhật trạng thái thất bại!');
                      }
                    }}>Đánh dấu đã sử dụng</button>
                    <button className="btn btn-sm btn-warning" onClick={async () => {
                      setShowBloodUnitTable(true);
                      setBloodUnitLoading(true);
                      setBloodUnits([]);
                      setBloodUnitError('');
                      try {
                        const res = await api.get(`/BloodUnit`);
                        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                          setBloodUnits(res.data);
                        } else {
                          setBloodUnitError('Không có blood unit nào trong hệ thống!');
                        }
                      } catch (err) {
                        console.error('Lỗi lấy blood unit:', err);
                        let msg = 'Không thể lấy thông tin blood unit!';
                        if (err && err.response && err.response.data && err.response.data.message) {
                          msg += `\n${err.response.data.message}`;
                        } else if (err && err.message) {
                          msg += `\n${err.message}`;
                        }
                        setBloodUnitError(msg);
                      } finally {
                        setBloodUnitLoading(false);
                      }
                    }}>Xử lý kho máu</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {showCertModal && selectedCert && (() => {
        // Lấy fullName từ certList dựa vào donorUserId (ưu tiên), nếu không có thì userId
        let fullNameDisplay = '-';
        const donorId = selectedCert.donorUserId || selectedCert.userId;
        const certFromList = certList.find(c => String(c.donationId) === String(selectedCert.donationId));
        if (certFromList && typeof certFromList.fullName === 'string' && certFromList.fullName.trim()) {
          fullNameDisplay = certFromList.fullName.trim();
        } else if (!donorId) {
          fullNameDisplay = 'Không rõ';
        }
        return (
          <div style={{
            margin: '32px auto',
            maxWidth: 900,
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 2px 16px rgba(0,0,0,0.13)',
            padding: 32,
            border: '1.5px solid #eee',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4 style={{ margin: 0, color: '#b30000', fontWeight: 700 }}>Chứng chỉ hiến máu</h4>
              <button className="btn-close" style={{ fontSize: 28 }} onClick={() => setShowCertModal(false)} aria-label="Đóng"></button>
            </div>
            <BloodDonationCertificate
              data={{
                userId: selectedCert.userId || selectedCert.donorUserId || '',
                fullName: fullNameDisplay,
                birthDate: selectedCert.birthDate || '',
                idNumber: selectedCert.idNumber || '',
                address: selectedCert.address || 'Đường Lê Văn Việt, Phường Long Thạnh Mỹ, Quận 9, TP.HCM',
                location: selectedCert.location || selectedCert.organization || '',
                quantity: selectedCert.quantityMl,
                donationDate: selectedCert.donationDate,
                certificateNo: 'B' + selectedCert.donationId,
                organization: selectedCert.organization || 'Hệ thống hỗ trợ hiến máu',
                signerTitle: 'PHÓ CHỦ TỊCH HỘI CHỮ THẬP ĐỎ TP HÀ NỘI',
                signerName: 'Đào Ngọc Triệu',
                qrValue: 'https://yourdomain.com/certificate/' + selectedCert.donationId,
                bloodType: getBloodTypeName(selectedCert.bloodTypeId || selectedCert.bloodType, selectedCert.bloodTypeName),
              }}
              onClose={() => setShowCertModal(false)}
              onProfileNameLoaded={fullName => {
                // Đồng bộ lại certList nếu tên profile khác với cert.fullName
                setCertList(list => list.map(c =>
                  c.donationId === selectedCert.donationId && fullName && fullName.trim() && c.fullName !== fullName.trim()
                    ? { ...c, fullName: fullName.trim() }
                    : c
                ));
              }}
            />
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button className="btn btn-secondary" onClick={() => setShowCertModal(false)}>Đóng</button>
            </div>
          </div>
        );
      })()}
      {/* Bảng kho máu hiển thị trực tiếp */}
      {showBloodUnitTable && (
        <div style={{ background: '#fff', borderRadius: 10, maxWidth: 1200, margin: '32px auto', padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.13)', border: '1.5px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h5 style={{ margin: 0, color: '#b30000', fontWeight: 700 }}>Kho máu</h5>
            <button className="btn-close" style={{ fontSize: 28 }} onClick={() => setShowBloodUnitTable(false)} aria-label="Đóng"></button>
          </div>
          {/* Bộ lọc mini inventory */}
          <div className="row mb-2">
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={filterBloodType} onChange={e => { setFilterBloodType(e.target.value); setPage(1); }}>
                <option value="">--Tất cả nhóm máu--</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={filterComponent} onChange={e => { setFilterComponent(e.target.value); setPage(1); }}>
                <option value="">--Tất cả thành phần--</option>
                <option value="Hồng cầu">Hồng cầu</option>
                <option value="Tiểu cầu">Tiểu cầu</option>
                <option value="Huyết tương">Huyết tương</option>
                <option value="Bạch cầu">Bạch cầu</option>
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
                <option value="">--Tất cả trạng thái--</option>
                <option value="Available">Có sẵn</option>
                <option value="Reserved">Đã đặt</option>
                <option value="Discarded">Đã loại bỏ</option>
                <option value="Used">Đã sử dụng</option>
                <option value="Testing">Đang kiểm tra</option>
                <option value="Separating">Đang tách</option>
                <option value="Separated">Đã tách</option>
                <option value="Usable">Có thể sử dụng</option>
                <option value="Pending">Đang chờ xử lý</option>
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Lọc theo mã chứng chỉ (B...)"
                value={filterCertCode}
                onChange={e => { setFilterCertCode(e.target.value); setPage(1); }}
              />
            </div>
          </div>
          {bloodUnitLoading ? (
            <div>Đang tải thông tin...</div>
          ) : bloodUnitError ? (
            <div style={{ color: 'red', minHeight: 60 }}>{bloodUnitError}</div>
          ) : bloodUnits.length > 0 ? (
            (() => {
              // Lọc và phân trang
              // Map trạng thái sang tiếng Việt
              const STATUS_VI = {
                'Available': 'Có sẵn',
                'Reserved': 'Đã đặt',
                'Discarded': 'Đã loại bỏ',
                'Used': 'Đã sử dụng',
                'Testing': 'Đang kiểm tra',
                'Separating': 'Đang tách',
                'Separated': 'Đã tách',
                'Usable': 'Có thể sử dụng',
                'Pending': 'Đang chờ xử lý',
                'Deleted': 'Đã xóa',
              };
              const filtered = bloodUnits.filter(u => {
                // Ẩn các đơn vị máu có status là Deleted
                if (u.status && u.status.toLowerCase() === 'deleted') return false;
                // Lọc theo mã chứng chỉ nếu có
                let matchCert = true;
                if (filterCertCode.trim()) {
                  // Mã chứng chỉ là B + donationId, so sánh với certCode hoặc donationId nếu có
                  const certCode = u.certificateNo || (u.donationId ? ('B' + u.donationId) : '');
                  matchCert = certCode.toLowerCase().includes(filterCertCode.trim().toLowerCase());
                }
                return (
                  (filterBloodType === '' || u.bloodTypeName === filterBloodType) &&
                  (filterComponent === '' || u.componentName === filterComponent) &&
                  (filterStatus === '' || u.status === filterStatus) &&
                  matchCert
                );
              });
              const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
              const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
              return (
                <>
                  <table className="table table-bordered table-sm">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Mã đơn vị</th>
                        <th>Nhóm máu</th>
                        <th>Thành phần</th>
                        <th>Thể tích</th>
                        <th>Ngày lấy</th>
                        <th>Trạng thái</th>
                        <th>Chi tiết</th>
                        <th>Sửa</th>
                        <th>Xóa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map((u, idx) => {
                        const isEditing = editId === u.unitId;
                        return (
                          <React.Fragment key={u.unitId}>
                            <tr style={isEditing ? { background: '#fffbe6' } : {}}>
                              <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                              <td>{u.unitId}</td>
                              <td>{u.bloodTypeName}</td>
                              <td>{u.componentName}</td>
                              <td>{u.volumeMl} ml</td>
                              <td>{u.collectionDate}</td>
                              <td>{STATUS_VI[u.status] || u.status || '-'}</td>
                              <td>
                                <button className="btn btn-sm btn-info" onClick={async () => {
                                  try {
                                    const res = await api.get(`/BloodUnit/${u.unitId}`);
                                    if (res.data) {
                                      alert(
                                        `Mã: ${res.data.unitId}\n` +
                                        `Nhóm máu: ${res.data.bloodTypeName}\n` +
                                        `Thành phần: ${res.data.componentName}\n` +
                                        `Thể tích: ${res.data.volumeMl} ml\n` +
                                        `Ngày lấy: ${res.data.collectionDate}\n` +
                                        `Trạng thái: ${res.data.status}`
                                      );
                                    } else {
                                      alert('Không tìm thấy thông tin chi tiết!');
                                    }
                                  } catch {
                                    alert('Không thể lấy thông tin chi tiết!');
                                  }
                                }}>Xem chi tiết</button>
                              </td>
                              <td>
                                <button className="btn btn-sm btn-warning" onClick={() => {
                                  setEditId(u.unitId);
                                  setEditData({ ...u });
                                }}>Sửa</button>
                                {u.status === 'Separating' && (
                                  <button
                                    className="btn btn-sm btn-outline-primary ms-1"
                                    onClick={async () => {
                                      try {
                                        const res = await api.post(`/BloodUnit/separate/${u.unitId}`);
                                        alert('Đã tách thành phần máu thành công!');
                                        // Cập nhật lại trạng thái đơn vị máu trong state
                                        setBloodUnits(prev => prev.map(bu => bu.unitId === u.unitId ? { ...bu, status: 'Separated' } : bu));
                                      } catch {
                                        alert('Tách thành phần máu thất bại!');
                                      }
                                    }}
                                  >
                                    Tách thành phần
                                  </button>
                                )}
                              </td>
                              <td>
                                <button className="btn btn-sm btn-danger" onClick={async () => {
                                  if (!window.confirm('Bạn chắc chắn muốn xóa đơn vị máu này?')) return;
                                  try {
                                    await api.delete(`/BloodUnit/${u.unitId}`);
                                    alert('Đã xóa đơn vị máu!');
                                    setBloodUnits(prev => prev.filter(bu => bu.unitId !== u.unitId));
                                  } catch {
                                    alert('Xóa thất bại!');
                                  }
                                }}>Xóa</button>
                              </td>
                            </tr>
                            {isEditing && (
                              <tr style={{ background: '#fffbe6' }}>
                                <td colSpan={15}>
                                  <div className="row g-2">
                                    <div className="col-md-2">
                                      <label className="form-label form-label-sm">Nhóm máu</label>
                                      <select className="form-select form-select-sm" value={editData.bloodTypeName || ''} onChange={e => setEditData(d => ({ ...d, bloodTypeName: e.target.value }))}>
                                        {BLOOD_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                                      </select>
                                    </div>
                                    <div className="col-md-2">
                                      <label className="form-label form-label-sm">Thành phần</label>
                                      <select className="form-select form-select-sm" value={editData.componentName || ''} onChange={e => setEditData(d => ({ ...d, componentName: e.target.value }))}>
                                        {COMPONENTS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                      </select>
                                    </div>
                                    <div className="col-md-1">
                                      <label className="form-label form-label-sm">Thể tích</label>
                                      <input className="form-control form-control-sm" value={editData.volumeMl || ''} onChange={e => setEditData(d => ({ ...d, volumeMl: e.target.value }))} />
                                    </div>
                                    <div className="col-md-2">
                                      <label className="form-label form-label-sm">Ngày lấy</label>
                                      <input className="form-control form-control-sm" value={editData.collectionDate || ''} onChange={e => setEditData(d => ({ ...d, collectionDate: e.target.value }))} />
                                    </div>
                                    <div className="col-md-2">
                                      <label className="form-label form-label-sm">Trạng thái</label>
                                      <select className="form-select form-select-sm" value={editData.status || ''} onChange={e => setEditData(d => ({ ...d, status: e.target.value }))}>
                                        {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                      </select>
                                    </div>

                                    <div className="col-md-2">
                                      <label className="form-label form-label-sm">Ngày hết hạn</label>
                                      <input 
                                        type="datetime-local"
                                        className="form-control form-control-sm" 
                                        value={editData.expirationDate || ''} 
                                        onChange={e => setEditData(d => ({ ...d, expirationDate: e.target.value }))} 
                                      />
                                    </div>
                                    <div className="col-md-2">
                                      <label className="form-label form-label-sm">Ghi chú</label>
                                      <input 
                                        className="form-control form-control-sm" 
                                        value={editData.remarks || ''} 
                                        onChange={e => setEditData(d => ({ ...d, remarks: e.target.value }))} 
                                      />
                                    </div>
                                    <div className="col-md-12 mt-2">
                                      <button className="btn btn-sm btn-success me-2" onClick={async () => {
                                        try {
                                          await api.put(`/BloodUnit/${u.unitId}`, editData);
                                          alert('Cập nhật thành công!');
                                          setBloodUnits(prev => prev.map(bu => bu.unitId === u.unitId ? { ...bu, ...editData } : bu));
                                          setEditId(null);
                                        } catch {
                                          alert('Cập nhật thất bại!');
                                        }
                                      }}>Lưu</button>
                                      <button className="btn btn-sm btn-secondary me-2" onClick={() => setEditId(null)}>Hủy</button>
                                      <button className="btn btn-sm btn-danger" onClick={async () => {
                                        if (!window.confirm('Bạn chắc chắn muốn xóa đơn vị máu này?')) return;
                                        try {
                                          await api.put(`/BloodUnit/${u.unitId}`, { ...editData, status: 'Deleted' });
                                          alert('Đã chuyển trạng thái đơn vị máu thành Deleted!');
                                          setBloodUnits(prev => prev.map(bu => bu.unitId === u.unitId ? { ...bu, status: 'Deleted' } : bu));
                                          setEditId(null);
                                        } catch {
                                          alert('Xóa thất bại!');
                                        }
                                      }}>Xóa</button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                      {paged.length === 0 && (
                        <tr>
                          <td colSpan={10} className="text-center text-muted">Không có dữ liệu</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {/* Phân trang */}
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
              );
            })()
          ) : (
            <div style={{ color: 'gray', minHeight: 60 }}>Không có blood unit trong hệ thống.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default CertificateManagement;
