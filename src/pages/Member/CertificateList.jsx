import React, { useEffect, useState, useRef } from 'react';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import BloodDonationCertificate from '../../components/Certificate/BloodDonationCertificate';
import './CertificateList.css';
import api from '../../services/Api';
import useAuth from '../../hooks/useAuth';



// Danh sách nhóm máu chuẩn để lọc hoặc hiển thị
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


// Map blood type ID to blood group label (the same as BLOOD_TYPES)
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

// Hàm Việt hóa trạng thái
function renderStatus(status) {
  if (!status) return '';
  const s = status.toLowerCase();
  if (s === 'complete' || s === 'completed') return 'Hoàn thành';
  if (s === 'certificated') return 'Đã cấp chứng nhận';
  if (s === 'used') return 'Đã sử dụng';
  if (s === 'pending') return 'Chờ xác nhận';
  if (s === 'ineligible') return 'Không đủ điều kiện';
  return status;
}

function getBloodTypeName(bloodTypeId, bloodTypeName) {
  // Ưu tiên label từ API nếu có
  if (bloodTypeName && typeof bloodTypeName === 'string') return bloodTypeName;
  if (!bloodTypeId) return 'Không rõ';
  // eslint-disable-next-line no-console
  console.log('bloodTypeId:', bloodTypeId, 'bloodTypeName:', bloodTypeName);
  // Nếu là số hoặc string số
  const id = typeof bloodTypeId === 'string' ? parseInt(bloodTypeId, 10) : bloodTypeId;
  return BLOOD_TYPE_MAP[id] || 'Không rõ';
}



function CertificateList() {
  const certRef = useRef();
  const { user, isAuthenticated } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [donationDetail, setDonationDetail] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);


  useEffect(() => {
    if (!isAuthenticated || !user?.userId) {
      setLoading(false);
      setError('Bạn cần đăng nhập để xem chứng chỉ.');
      return;
    }
    const fetchAndUpdateHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/DonationHistory/by-donor/${user.userId}`);
        let historyData = Array.isArray(response.data) ? response.data : [];
        // Tìm các lần hiến máu đã hoàn thành nhưng chưa có trạng thái Certificated
        const needUpdate = historyData.filter(item => {
          const s = (item.status || '').toLowerCase();
          return (s === 'complete' || s === 'completed') && s !== 'certificated';
        });
        // Gọi API cập nhật trạng thái cho từng lần hiến máu cần update
        await Promise.all(needUpdate.map(item =>
          api.put(`/DonationHistory/${item.donationId}`, { ...item, status: 'Certificated' })
        ));
        // Sau khi cập nhật, lấy lại lịch sử mới nhất
        const refreshed = await api.get(`/DonationHistory/by-donor/${user.userId}`);
        setHistory(Array.isArray(refreshed.data) ? refreshed.data : []);
      } catch (err) {
        setError('Không thể tải dữ liệu chứng chỉ từ lịch sử hiến máu.');
      } finally {
        setLoading(false);
      }
    };
    fetchAndUpdateHistory();
  }, [isAuthenticated, user?.userId]);


  // For PDF export


  // When opening modal, fetch donation detail only (profile is fetched in BloodDonationCertificate)
  const handleView = async (cert) => {
    setSelectedCert(cert);
    setModalLoading(true);
    setShowModal(true);
    try {
      const donationRes = await api.get(`/DonationHistory/${cert.donationId}`);
      setDonationDetail(donationRes.data);
    } catch {
      setDonationDetail(null);
    }
    setModalLoading(false);
  };

  const handleExportPDF = async () => {
    if (!certRef.current) return;
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;
    const canvas = await html2canvas(certRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    pdf.addImage(imgData, 'PNG', 10, 10, 277, 190);
    pdf.save(`GiayChungNhanHienMau_${selectedCert?.certificateNo || 'export'}.pdf`);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedCert(null);
  };


  // Only show completed donations as certificates
  const completedCertificates = history.filter(item => {
    const s = item.status?.toLowerCase();
    return s === 'complete' || s === 'completed' || s === 'certificated' || s === 'used';
  });

  // Build certificate data for modal
  // Merge all info for certificate
  const getCertData = (item) => {
    const d = donationDetail || item || {};
    return {
      userId: user.userId || d.userId || '',
      fullName: d.fullName || user.fullName || user.username || '',
      birthDate: d.birthDate || user.dateOfBirth || '',
      idNumber: d.idNumber || user.cccd || '',
      address: d.address || user.address || '',
      location: d.location || d.organization || '',
      quantity: d.quantityMl || d.quantity,
      donationDate: d.donationDate,
      certificateNo: 'B' + d.donationId,
      organization: d.organization || 'Hệ thống hỗ trợ hiến máu',
      signerTitle: 'PHÓ CHỦ TỊCH HỘI CHỮ THẬP ĐỎ TP HÀ NỘI',
      signerName: 'Đào Ngọc Triệu',
      qrValue: 'https://yourdomain.com/certificate/' + d.donationId,
      bloodType: getBloodTypeName(d.bloodTypeId || d.bloodType, d.bloodTypeName),
    };
  };
  // Handler to send user profile when using certificate
  async function handleUseCertificate() {
    try {
      // Cập nhật trạng thái donation sang 'Used'
      if (selectedCert?.donationId) {
        await api.put(`/DonationHistory/${selectedCert.donationId}`, {
          ...selectedCert,
          status: 'Use',
        });
        // Cập nhật lại local state để phản ánh thay đổi ngay
        setHistory(his => his.map(h => h.donationId === selectedCert.donationId ? { ...h, status: 'Used' } : h));
      }
      alert('Đã cập nhật trạng thái chứng nhận thành công!');
    } catch (e) {
      alert('Cập nhật trạng thái thất bại.');
    }
  }

  return (
    <div className="certificate-list-wrapper">
      <Header />
      <Navbar />
      <div className="certificate-list-container">
        <h2 style={{margin: '24px 0 16px'}}>Danh sách chứng chỉ hiến máu</h2>
        {loading ? (
          <div>Đang tải dữ liệu...</div>
        ) : error ? (
          <div style={{color: 'red'}}>{error}</div>
        ) : completedCertificates.length === 0 ? (
          <div>Bạn chưa có chứng chỉ hiến máu nào (chỉ hiển thị các lần hiến máu đã hoàn thành).</div>
        ) : (
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Số chứng nhận</th>
                <th>Ngày hiến máu</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {completedCertificates.map(item => (
                <tr key={item.donationId}>
                  <td>{'B' + item.donationId}</td>
                  <td>{item.donationDate ? new Date(item.donationDate).toLocaleDateString('vi-VN') : ''}</td>
                  <td>{renderStatus(item.status)}</td>
                  <td>
                    <button className="btn btn-primary me-2" onClick={() => handleView(item)}>Xem chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
      </div>
      {showModal && selectedCert && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflowY: 'auto',
            padding: 16
          }}
          onClick={handleClose}
        >
          <div
            style={{
              background: '#fff',
              padding: 0,
              borderRadius: 12,
              maxWidth: 900,
              width: '100%',
              boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
              position: 'relative',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={handleClose}
              aria-label="Đóng"
              style={{position:'absolute',top:12,right:18,fontSize:28,background:'none',border:'none',color:'#b30000',zIndex:2,cursor:'pointer'}}
            >
              &times;
            </button>
            <div style={{overflowY:'auto', padding: 24, flex: 1, minHeight: 0}}>
              {modalLoading ? (
                <div style={{textAlign:'center',padding:'60px 0',fontSize:20}}>Đang tải thông tin chứng chỉ...</div>
              ) : (
                <div ref={certRef}>
                  <BloodDonationCertificate data={getCertData(selectedCert)} onUse={handleUseCertificate} />
                </div>
              )}
            </div>
            <div style={{textAlign:'center',marginTop:0, borderTop:'1px solid #eee', padding:'16px 0', background:'#fafafa'}}>
              {!(selectedCert?.status === 'Use' || selectedCert?.status === 'Used') && (
                <button className="btn btn-warning me-2" onClick={handleUseCertificate}>Sử dụng</button>
              )}
              <button className="btn btn-danger me-2" onClick={handleExportPDF}>Xuất PDF</button>
              <button className="btn btn-secondary" onClick={handleClose}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CertificateList;
