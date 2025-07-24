import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/Api';
import { AuthContext } from '../../context/AuthContext';
import DonorProfileModal from './DonorProfileModal'; // Thêm dòng này nếu chưa import

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

const COMPONENTS = [
  { id: 1, name: 'Máu toàn phần' },
  { id: 2, name: 'Huyết tương' },
  { id: 3, name: 'Tiểu cầu' },
  { id: 4, name: 'Hồng cầu ' }
];

function ReponseEmergencyRequesr() {
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
      const res = await api.get(`/DonationHistory/by-request/${requestId}`);
      setHistory(res.data);
      setModalForm({
        donationDate: res.data.donationDate ? res.data.donationDate.substring(0, 16) : '',
        bloodTypeId: res.data.bloodTypeId || (emergencyRequest?.bloodTypeId || ''),
        componentId: res.data.componentId || '',
        quantityMl: res.data.quantityMl || '',
        eligibilityStatus: res.data.eligibilityStatus === true || res.data.eligibilityStatus === 'true' ? 'true'
          : res.data.eligibilityStatus === false || res.data.eligibilityStatus === 'false' ? 'false' : '',
        reasonIneligible: res.data.reasonIneligible || '',
        testingResults: res.data.testingResults || '',
        descriptions: res.data.descriptions || '',
        status: res.data.status || 'Complete'
      });
    } catch {
      // Nếu chưa có, lấy nhóm máu và ngày hiến mặc định từ yêu cầu khẩn cấp
      let defaultBloodTypeId = emergencyRequest?.bloodTypeId || '';
      let defaultDate = '';
      if (emergencyRequest?.neededDate) {
        // Nếu có hạn cần máu, lấy ngày đầu tiên trong khoảng đó
        // neededDate có thể là chuỗi ISO hoặc yyyy-MM-dd, lấy đúng định dạng cho input type="datetime-local"
        const date = new Date(emergencyRequest.neededDate);
        if (!isNaN(date.getTime())) {
          // Định dạng yyyy-MM-ddTHH:mm cho input datetime-local
          defaultDate = date.toISOString().slice(0, 16);
        }
      }
      setModalForm({
        donationDate: defaultDate,
        bloodTypeId: defaultBloodTypeId,
        componentId: '',
        quantityMl: '',
        eligibilityStatus: '',
        reasonIneligible: '',
        testingResults: '',
        descriptions: '',
        status: 'Complete'
      });
    }
    setShowModal(true);
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

  // Lưu ghi nhận thực tế (tạo mới hoặc cập nhật)
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
        componentId: modalForm.componentId,
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
    <div className="container mt-4">
      <h4>Danh sách phản hồi cho yêu cầu máu #{requestId}</h4>
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
        Quay lại
      </button>
      {noResponseAlert && (
        <div className="alert alert-warning">
          Đã quá 15 phút nhưng chưa có phản hồi nào từ người nhận!
        </div>
      )}
      {loading ? (
        <div>Đang tải...</div>
      ) : responses.length === 0 ? (
        <div className="alert alert-secondary">Chưa có phản hồi nào.</div>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Mã phản hồi</th>
              <th>Người nhận</th>
              <th>Phương thức</th>
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
                <td>{resp.deliveryMethod}</td>
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
                  {resp.responseStatus === 'Interested' && (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleOpenModal(resp.recipientUserId, resp.fullName)}
                    >
                      Ghi nhận thực tế
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                    <label className="form-label">Ngày hiến máu</label>
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
                  <div className="mb-2">
                    <label className="form-label">Thành phần máu</label>
                    <select
                      className="form-select"
                      name="componentId"
                      value={modalForm.componentId}
                      onChange={handleModalChange}
                      required
                    >
                      <option value="">Chọn thành phần máu</option>
                      {COMPONENTS.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Số lượng (ml)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="quantityMl"
                      value={modalForm.quantityMl}
                      onChange={handleModalChange}
                      min={1}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Tình trạng đủ điều kiện</label>
                    <select
                      className="form-select"
                      name="eligibilityStatus"
                      value={modalForm.eligibilityStatus}
                      onChange={handleModalChange}
                      required
                    >
                      <option value="">Chọn tình trạng</option>
                      <option value="true">Đủ điều kiện</option>
                      <option value="false">Không đủ điều kiện</option>
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
                      <option value="Âm tính">Âm tính</option>
                      <option value="Dương tính">Dương tính</option>
                      <option value="Đang chờ">Đang chờ</option>
                      <option value="Không xác định">Không xác định</option>
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
    </div>
  );
}

export default ReponseEmergencyRequesr;