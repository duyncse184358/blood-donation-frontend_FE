
import React, { useEffect, useState } from 'react';
import api from '../../services/Api';
import BloodDonationCertificate from '../../components/Certificate/BloodDonationCertificate';

function CertificateManagement() {
  const [certList, setCertList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCert, setSelectedCert] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);

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
        setCertList(filtered);
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
            ) : certList.map(cert => (
              <tr key={cert.donationId}>
                <td>{'B' + cert.donationId}</td>
                <td>{cert.fullName || cert.donorName || cert.donorUserId}</td>
                <td>{cert.donationDate ? new Date(cert.donationDate).toLocaleDateString('vi-VN') : ''}</td>
                <td>{cert.quantityMl}</td>
                <td>{cert.location || cert.organization || ''}</td>
                <td style={{display:'flex',gap:4,flexDirection:'column'}}>
                  <button className="btn btn-sm btn-info mb-1" onClick={() => { setSelectedCert(cert); setShowCertModal(true); }}>Xem chứng chỉ</button>
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
                    try {
                      // Gọi API lấy blood unit theo donationId (giả sử có endpoint này)
                      const res = await api.get(`/BloodUnit/by-donation/${cert.donationId}`);
                      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                        alert('Blood Unit liên quan:\n' + res.data.map(u => `Mã: ${u.unitId}, Nhóm máu: ${u.bloodTypeName}, Thành phần: ${u.componentName}, Thể tích: ${u.volumeMl}`).join('\n'));
                      } else {
                        alert('Không tìm thấy blood unit liên quan!');
                      }
                    } catch {
                      alert('Không thể lấy thông tin blood unit!');
                    }
                  }}>Xem blood unit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showCertModal && selectedCert && (
        <BloodDonationCertificate
          data={{
            fullName: selectedCert.fullName || selectedCert.donorName || '',
            birthDate: selectedCert.birthDate || '',
            idNumber: selectedCert.idNumber || '',
            address: selectedCert.address || '',
            location: selectedCert.location || selectedCert.organization || '',
            quantity: selectedCert.quantityMl,
            donationDate: selectedCert.donationDate,
            certificateNo: 'B' + selectedCert.donationId,
            organization: selectedCert.organization || 'Hệ thống hỗ trợ hiến máu',
            signerTitle: 'PHÓ CHỦ TỊCH HỘI CHỮ THẬP ĐỎ TP HÀ NỘI',
            signerName: 'Đào Ngọc Triệu',
            qrValue: 'https://yourdomain.com/certificate/' + selectedCert.donationId
          }}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </div>
  );
}

export default CertificateManagement;
