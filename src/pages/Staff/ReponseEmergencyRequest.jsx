import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/Api';
import { AuthContext } from '../../context/AuthContext';
import DonorProfileModal from './DonorProfileModal';
import '../../styles/EmergencyResponse.css';

const BLOOD_TYPES = [
  { id: 1, name: 'A+' },
  { id: 2, name: 'A-' },
  { id: 3, name: 'B+' },
  { id: 4, name: 'B-' },
  { id: 5, name: 'O+' },
  { id: 6, name: 'O-' },
  { id: 7, name: 'AB+' },
  { id: 8, name: 'AB-' }
];

const COMPONENTS = [
  { id: 1, name: 'Máu toàn phần' },
  { id: 2, name: 'Huyết tương' },
  { id: 3, name: 'Tiểu cầu' },
  { id: 4, name: 'Hồng cầu ' }
];

function ReponseEmergencyRequesr() {
  const styles = {
    emergencyResponseContainer: {
      padding: '2rem',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 0 20px rgba(0, 0, 0, 0.05)',
      margin: '2rem auto',
    },
    pageHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      padding: '0 0 1rem',
      borderBottom: '2px solid #f8d7da'
    },
    pageTitle: {
      color: '#dc3545',
      fontSize: '1.5rem',
      fontWeight: '600',
      margin: 0
    },
    customTable: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: '0',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      overflow: 'hidden'
    },
    tableContainer: {
      margin: '1.5rem 0',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      overflow: 'hidden',
      background: '#ffffff'
    },
    thead: {
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      color: '#495057'
    },
    th: {
      padding: '1.25rem 1rem',
      fontWeight: '600',
      borderBottom: '2px solid #dee2e6',
      textTransform: 'uppercase',
      fontSize: '0.875rem',
      letterSpacing: '0.5px'
    },
    td: {
      padding: '1.25rem 1rem',
      borderBottom: '1px solid #edf2f7',
      verticalAlign: 'middle',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: '#f8f9fa'
      }
    },
    statusBadge: {
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: '500',
      display: 'inline-block'
    },
    actionButton: {
      padding: '0.5rem 1.25rem',
      borderRadius: '8px',
      border: 'none',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginRight: '0.75rem',
      background: 'linear-gradient(135deg, #dc3545 0%, #ff4757 100%)',
      color: '#fff',
      boxShadow: '0 2px 4px rgba(220, 53, 69, 0.2)',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 8px rgba(220, 53, 69, 0.3)',
      },
      '&:active': {
        transform: 'translateY(0)',
        boxShadow: '0 2px 4px rgba(220, 53, 69, 0.2)',
      }
    },
    loadingState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '4rem',
      color: '#6c757d',
      background: 'linear-gradient(135deg, #fff5f5 0%, #ffffff 100%)',
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
      margin: '1rem 0'
    },
    loadingSpinner: {
      width: '3rem',
      height: '3rem',
      color: '#dc3545'
    },
    loadingText: {
      marginTop: '1.25rem',
      fontSize: '1.1rem',
      fontWeight: '500',
      color: '#495057',
      textAlign: 'center',
      animation: 'pulse 2s infinite'
    },
    customAlert: {
      padding: '1.25rem',
      borderRadius: '8px',
      marginBottom: '1.5rem',
      fontSize: '0.95rem',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      borderLeft: '4px solid',
      alignItems: 'center',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
    },
    successAlert: {
      background: 'linear-gradient(135deg, #e6f4ea 0%, #f0fff4 100%)',
      borderColor: '#28a745',
      color: '#155724'
    },
    errorAlert: {
      background: 'linear-gradient(135deg, #fde8e8 0%, #fff5f5 100%)',
      borderColor: '#dc3545',
      color: '#721c24'
    }
  };
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noResponseAlert, setNoResponseAlert] = useState(false);

  // Lưu thông tin yêu cầu khẩn cấp
  const [emergencyRequest, setEmergencyRequest] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalDonor, setModalDonor] = useState(null);
  const [modalForm, setModalForm] = useState({
    donationDate: '',
    bloodTypeId: '',
    componentId: '',
    quantityMl: '',
    eligibilityStatus: '',
    reasonIneligible: '',
    testingResults: '',
    descriptions: '',
    status: 'Complete'
  });
  const [saving, setSaving] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [modalErr, setModalErr] = useState('');
  const [history, setHistory] = useState(null);

  // Modal xem hồ sơ người hiến máu
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null);

  useEffect(() => {
    if (!requestId) return;
    let timer = null;
    setLoading(true);
    setNoResponseAlert(false);

    // Lấy thông tin yêu cầu khẩn cấp để lấy nhóm máu và hạn cần máu
    api.get(`/EmergencyRequest/${requestId}`)
      .then(res => setEmergencyRequest(res.data))
      .catch(() => setEmergencyRequest(null));
//
    // Lấy danh sách phản hồi cho yêu cầu khẩn cấp
    api.get(`/EmergencyNotification/by-emergency/${requestId}`)
      .then(async res => {
        let data = Array.isArray(res.data) ? res.data : [res.data];
        const updatedData = await Promise.all(
          data
            .filter(resp => resp.recipientUserId !== 'ALL')
            .map(async resp => {
              let fullName = '';
              try {
                const profileRes = await api.get(`/UserProfile/by-user/${resp.recipientUserId}`);
                fullName = profileRes.data.fullName || '';
              } catch {}
              return { ...resp, fullName };
            })
        );
        setResponses(updatedData);

        if (updatedData.length > 0) {
          const sentDate = updatedData[0].sentDate;
          const sentTime = sentDate ? new Date(sentDate).getTime() : null;
          const now = Date.now();
          const fifteenMinutes = 15 * 60 * 1000;
          const allNoResponse = updatedData.every(
            resp => resp.responseStatus === 'No Response'
          );
          if (sentTime && now - sentTime >= fifteenMinutes && allNoResponse) {
            setNoResponseAlert(true);
          } else if (sentTime && allNoResponse) {
            timer = setTimeout(() => setNoResponseAlert(true), fifteenMinutes - (now - sentTime));
          }
        }
      })
      .catch(() => setResponses([]))
      .finally(() => setLoading(false));

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [requestId]);

  // Khi mở modal, kiểm tra đã có history chưa
  const handleOpenModal = async (donorUserId, fullName) => {
    setModalDonor({ donorUserId, fullName });
    setModalMsg('');
    setModalErr('');
    setSaving(false);
    setHistory(null);

    try {
      // Lấy tất cả lịch sử hiến máu thực tế cho yêu cầu này
      const res = await api.get(`/DonationHistory/by-request/${requestId}`);
      // Nếu đã có ghi nhận hiến máu thực tế cho người này thì không cho ghi nhận lại
      if (Array.isArray(res.data)) {
        const found = res.data.find(h => h.donorUserId === donorUserId);
        if (found) {
          setModalErr('Người này đã được ghi nhận hiến máu thực tế cho yêu cầu này. Không thể ghi nhận lại!');
          return;
        }
      } else if (res.data && res.data.donorUserId === donorUserId) {
        setModalErr('Người này đã được ghi nhận hiến máu thực tế cho yêu cầu này. Không thể ghi nhận lại!');
        return;
      }
      setHistory(null);
      // Nếu chưa có, lấy nhóm máu và ngày hiến mặc định từ yêu cầu khẩn cấp
      let defaultBloodTypeId = emergencyRequest?.bloodTypeId || '';
      let defaultDate = '';
      if (emergencyRequest?.neededDate) {
        const date = new Date(emergencyRequest.neededDate);
        if (!isNaN(date.getTime())) {
          defaultDate = date.toISOString().slice(0, 16);
        }
      }
      setModalForm({
        donationDate: defaultDate,
        bloodTypeId: defaultBloodTypeId,
        componentId: 1,
        quantityMl: '',
        eligibilityStatus: '',
        reasonIneligible: '',
        testingResults: '',
        descriptions: '',
        status: 'Complete'
      });
      setShowModal(true);
    } catch {
      // Nếu chưa có, lấy nhóm máu và ngày hiến mặc định từ yêu cầu khẩn cấp
      let defaultBloodTypeId = emergencyRequest?.bloodTypeId || '';
      let defaultDate = '';
      if (emergencyRequest?.neededDate) {
        const date = new Date(emergencyRequest.neededDate);
        if (!isNaN(date.getTime())) {
          defaultDate = date.toISOString().slice(0, 16);
        }
      }
      setModalForm({
        donationDate: defaultDate,
        bloodTypeId: defaultBloodTypeId,
        componentId: 1,
        quantityMl: '',
        eligibilityStatus: '',
        reasonIneligible: '',
        testingResults: '',
        descriptions: '',
        status: 'Complete'
      });
      setShowModal(true);
    }
  };

  // Đóng modal
  const handleCloseModal = () => {
    setShowModal(false);
    setModalDonor(null);
    setModalMsg('');
    setModalErr('');
    setHistory(null);
  };

  // Xử lý thay đổi form modal
  const handleModalChange = e => {
    const { name, value } = e.target;
    setModalForm(f => ({ ...f, [name]: value }));
  };
//
  // Lưu ghi nhận thực tế
  const handleModalSave = async e => {
    e.preventDefault();
    setSaving(true);
    setModalMsg('');
    setModalErr('');
    try {
      let payload = {
        donorUserId: modalDonor.donorUserId,
        donationDate: modalForm.donationDate,
        bloodTypeId: modalForm.bloodTypeId,
        componentId: 1,
        quantityMl: modalForm.quantityMl,
        eligibilityStatus: modalForm.eligibilityStatus,
        reasonIneligible: modalForm.reasonIneligible,
        testingResults: modalForm.testingResults,
        staffUserId: user?.userId,
        status: modalForm.status,
        descriptions: modalForm.descriptions,
        emergencyId: requestId
      };

      if (history && history.donationId) {
        // Cập nhật
        await api.put(`/DonationHistory/${history.donationId}`, payload);
        setModalMsg('Cập nhật thành công!');
      } else {
        // Tạo mới
        await api.post('/DonationHistory', payload);
        setModalMsg('Ghi nhận thành công!');
      }
      
      // Cập nhật trạng thái emergency request nếu donation hoàn thành
      if (modalForm.status === 'Complete') {
        try {
          await api.put(`/EmergencyRequest/${requestId}/status`, JSON.stringify('Approved'), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.log('Error updating emergency request status:', error);
        }
      }
    } catch {
      setModalErr('Ghi nhận thất bại!');
    }
    setSaving(false);
  };

  return (
    <div className="emergency-response-container">
      <div className="page-header">
        <h4 className="page-title">
          <i className="fa-solid fa-clock-rotate-left text-danger me-2"></i>
          Danh sách phản hồi cho yêu cầu máu #{requestId}
        </h4>
        <button className="btn btn-outline-danger" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-left me-2"></i>
          Quay lại
        </button>
      </div>
{/* Bỏ thông báo quá 15 phút không có phản hồi */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <span className="loading-text">Đang tải dữ liệu...</span>
        </div>
      ) : responses.length === 0 ? (
        <div className="alert custom-alert-secondary">
          <i className="fa-solid fa-inbox me-2"></i>
          Chưa có phản hồi nào.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table custom-table">
            <thead>
              <tr>
                <th>Mã phản hồi</th>
                <th>Người nhận</th>
                <th>Đã đọc</th>
                <th>Thời gian gửi</th>
                <th>Trạng thái</th>
                <th>Nội dung</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
            {responses.map((resp, idx) => (
              <tr key={resp.notificationId || idx}>
                <td>{resp.notificationId}</td>
                <td>{resp.fullName || resp.recipientUserId}</td>
                {/* Bỏ cột Phương thức */}
                <td>
                  {resp.isRead ? (
                    <span className="badge bg-success">Đã đọc</span>
                  ) : (
                    <span className="badge bg-secondary">Chưa đọc</span>
                  )}
                </td>
                <td>{resp.sentDate ? new Date(resp.sentDate).toLocaleString('vi-VN') : ''}</td>
                <td>
                  {resp.responseStatus === 'Interested' && <span className="badge bg-success">Đồng ý</span>}
                  {resp.responseStatus === 'Declined' && <span className="badge bg-danger">Từ chối</span>}
                  {resp.responseStatus === 'No Response' && <span className="badge bg-secondary">Chưa phản hồi</span>}
                </td>
                <td>{resp.message}</td>
                <td>
                  <button
                    className="btn btn-sm btn-info me-2"
                    onClick={() => {
                      setProfileUserId(resp.recipientUserId);
                      setShowProfileModal(true);
                    }}
                  >
                    Xem hồ sơ
                  </button>
                  {resp.responseStatus === 'Interested' ? (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleOpenModal(resp.recipientUserId, resp.fullName)}
                    >
                      Ghi nhận thực tế
                    </button>
                  ) : resp.responseStatus === 'Declined' ? (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => setModalErr('Đơn đã bị từ chối không ghi nhận được việc hiến máu!')}
                    >
                      Ghi nhận thực tế
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {/* Modal ghi nhận thực tế */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleModalSave}>
                <div className="modal-header">
                  <h5 className="modal-title">Ghi nhận thực tế hiến máu</h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label">Người hiến</label>
                    <input className="form-control" value={modalDonor.fullName || modalDonor.donorUserId} disabled />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Ngày và giờ hiến máu</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      name="donationDate"
                      value={modalForm.donationDate}
                      onChange={handleModalChange}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Nhóm máu</label>
                    <select
                      className="form-select"
                      name="bloodTypeId"
                      value={modalForm.bloodTypeId}
                      onChange={handleModalChange}
                      required
                    >
                      <option value="">Chọn nhóm máu</option>
                      {BLOOD_TYPES.map(bt => (
                        <option key={bt.id} value={bt.id}>{bt.name}</option>
                      ))}
                    </select>
                  </div>
                  {/* BỎ hiển thị trường thành phần máu, giá trị mặc định là 1 */}
                  <div className="mb-2">
                    <label className="form-label">Số lượng (ml) (tối đa 450ml)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="quantityMl"
                      value={modalForm.quantityMl}
                      onChange={handleModalChange}
                      min={1}
                      max={450}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Tình trạng đủ điều kiện</label>
                    <select
                      className="form-select"
                      name="eligibilityStatus"
                      value={modalForm.eligibilityStatus}
                      onChange={e => {
                        const value = e.target.value;
                        setModalForm(f => ({ ...f, eligibilityStatus: value }));
                      }}
                      required
                    >
                      <option value="">Chọn tình trạng</option>
                      <option value="Eligible">Đủ điều kiện</option>
                      <option value="Not Eligible">Không đủ điều kiện</option>
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Lý do không đủ điều kiện</label>
                    <input
                      type="text"
                      className="form-control"
                      name="reasonIneligible"
                      value={modalForm.reasonIneligible}
                      onChange={handleModalChange}
                    />
                  </div>
                  {/* Đổi "Kết quả xét nghiệm" thành "Kết quả đủ điều kiện" */}
                  <div className="mb-2">
                    <label className="form-label">Kết quả xét nghiệm</label>
                    <select
                      className="form-select"
                      name="testingResults"
                      value={modalForm.testingResults}
                      onChange={handleModalChange}
                      required
                    >
                      <option value="">Chọn kết quả</option>
                      <option value="Đủ điều kiện">Đủ điều kiện</option>
                      <option value="Không đủ điều kiện">Không đủ điều kiện</option>
                      
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Ghi chú</label>
                    <textarea
                      className="form-control"
                      name="descriptions"
                      value={modalForm.descriptions}
                      onChange={handleModalChange}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Trạng thái</label>
                    <select
                      className="form-select"
                      name="status"
                      value={modalForm.status}
                      onChange={handleModalChange}
                      required
                    >
                      <option value="Complete">Hoàn thành</option>
                      <option value="Pending">Đang xử lý</option>
                      <option value="Cancelled">Đã hủy</option>
                    </select>
                  </div>
                  {modalMsg && <div className="alert alert-success">{modalMsg}</div>}
                  {modalErr && <div className="alert alert-danger">{modalErr}</div>}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal} disabled={saving}>
                    Đóng
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Đang lưu...' : 'Lưu ghi nhận'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal xem hồ sơ người hiến máu */}
      {showProfileModal && profileUserId && (
        <DonorProfileModal
          userId={profileUserId}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      <style>{`
        .emergency-response-container {
          padding: 2rem;
          background: linear-gradient(to bottom right, #ffffff, #f8f9fa);
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(220, 53, 69, 0.1);
          margin: 2rem;
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(220, 53, 69, 0.05);
          border-left: 4px solid #dc3545;
        }

        .page-title {
          color: #dc3545;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .page-title i {
          font-size: 1.75rem;
          color: #dc3545;
          opacity: 0.9;
        }

        .table-responsive {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
          padding: 1rem;
          margin-top: 1.5rem;
        }

        .custom-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          border: 1px solid rgba(222, 226, 230, 0.8);
          border-radius: 8px;
          overflow: hidden;
        }

        .custom-table th {
          background: linear-gradient(to bottom, #f8f9fa, #ffffff);
          padding: 1.25rem 1rem;
          font-weight: 600;
          color: #495057;
          border-bottom: 2px solid #f1f1f1;
          text-transform: uppercase;
          font-size: 0.85rem;
          letter-spacing: 0.5px;
        }

        .custom-table td {
          padding: 1.25rem 1rem;
          border-bottom: 1px solid #f1f1f1;
          vertical-align: middle;
          transition: all 0.2s ease;
        }

        .custom-table tbody tr {
          transition: all 0.2s ease;
        }

        .custom-table tbody tr:hover {
          background-color: #f8f9fa;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 4rem;
          color: #6c757d;
          background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          margin: 1rem 0;
        }

        .loading-spinner .spinner-border {
          width: 3rem;
          height: 3rem;
          color: #dc3545 !important;
        }

        .loading-text {
          margin-top: 1.25rem;
          font-size: 1.1rem;
          font-weight: 500;
          color: #495057;
          text-align: center;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }

        .custom-alert-warning {
          background-color: #fff3cd;
          border: 1px solid #ffeeba;
          color: #856404;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .custom-alert-secondary {
          background-color: #e2e3e5;
          border: 1px solid #d6d8db;
          color: #383d41;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .badge {
          padding: 0.6rem 1rem;
          border-radius: 50px;
          font-weight: 500;
          font-size: 0.85rem;
          letter-spacing: 0.3px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }

        .badge i {
          font-size: 0.75rem;
        }

        .btn {
          padding: 0.7rem 1.5rem;
          border-radius: 8px;
          transition: all 0.3s ease;
          font-weight: 500;
          letter-spacing: 0.3px;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        }

        .btn-outline-danger {
          border: 2px solid #dc3545;
          color: #dc3545;
          background: transparent;
        }

        .btn-outline-danger:hover {
          background: #dc3545;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.2);
        }

        .btn-info, .btn-primary {
          border: none;
          font-size: 0.9rem;
        }

        .btn-info {
          background: linear-gradient(135deg, #17a2b8, #0f7a8a);
          color: white;
        }

        .btn-primary {
          background: linear-gradient(135deg, #0d6efd, #0a58ca);
          color: white;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .modal-content {
          border-radius: 12px;
          border: none;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          border-bottom: 2px solid #f8d7da;
          padding: 1rem 1.5rem;
        }

        .modal-footer {
          border-top: 1px solid #dee2e6;
          padding: 1rem 1.5rem;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: #dc3545;
          box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
        }

        @media (max-width: 768px) {
          .emergency-response-container {
            margin: 1rem;
            padding: 1rem;
          }

          .page-header {
            flex-direction: column;
            gap: 1rem;
          }

          .btn {
            width: 100%;
            margin-bottom: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}

export default ReponseEmergencyRequesr;