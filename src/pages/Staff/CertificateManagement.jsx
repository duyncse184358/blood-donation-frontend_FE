import React, { useEffect, useState } from 'react';
import api from '../../services/Api';
import BloodDonationCertificate from '../../components/Certificate/BloodDonationCertificate';

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
  // State cho modal blood unit
  const [bloodUnitDetail, setBloodUnitDetail] = useState(null);
  const [showBloodUnitModal, setShowBloodUnitModal] = useState(false);
  const [bloodUnitLoading, setBloodUnitLoading] = useState(false);
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
                      setBloodUnitLoading(true);
                      setShowBloodUnitModal(true);
                      setBloodUnitDetail(null);
                      try {
                        const res = await api.get(`/BloodUnit/by-donation/${cert.donationId}`);
                        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                          setBloodUnitDetail(res.data[0]);
                        } else {
                          setBloodUnitDetail({ error: 'Không tìm thấy blood unit liên quan!' });
                        }
                      } catch {
                        setBloodUnitDetail({ error: 'Không thể lấy thông tin blood unit!' });
                      } finally {
                        setBloodUnitLoading(false);
                      }
                    }}>Xem blood unit</button>
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
      {/* Modal xem blood unit */}
      {showBloodUnitModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.25)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', borderRadius: 10, minWidth: 340, maxWidth: 420, padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.18)', position: 'relative' }}>
            <button style={{ position: 'absolute', top: 8, right: 12, fontSize: 26, background: 'none', border: 'none', color: '#b30000', cursor: 'pointer' }} onClick={() => setShowBloodUnitModal(false)}>&times;</button>
            <h5 style={{ marginBottom: 18, color: '#b30000', fontWeight: 700 }}>Chi tiết Blood Unit</h5>
            {bloodUnitLoading ? (
              <div>Đang tải thông tin...</div>
            ) : bloodUnitDetail && !bloodUnitDetail.error ? (
              <table className="table table-bordered">
                <tbody>
                  <tr><th>Mã đơn vị</th><td>{bloodUnitDetail.unitId}</td></tr>
                  <tr><th>Nhóm máu</th><td>{bloodUnitDetail.bloodTypeName}</td></tr>
                  <tr><th>Thành phần</th><td>{bloodUnitDetail.componentName}</td></tr>
                  <tr><th>Thể tích</th><td>{bloodUnitDetail.volumeMl} ml</td></tr>
                  <tr><th>Ngày lấy</th><td>{bloodUnitDetail.collectionDate}</td></tr>
                  <tr><th>Trạng thái</th><td>{bloodUnitDetail.status}</td></tr>
                </tbody>
              </table>
            ) : (
              <div style={{ color: 'red', minHeight: 60 }}>{bloodUnitDetail?.error || 'Không có dữ liệu'}</div>
            )}
            <div style={{ textAlign: 'center', marginTop: 18 }}>
              <button className="btn btn-secondary" onClick={() => setShowBloodUnitModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CertificateManagement;
