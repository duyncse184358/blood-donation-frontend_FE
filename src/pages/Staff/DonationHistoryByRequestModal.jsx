import React, { useEffect, useState, useContext } from 'react';
import api from '../../services/Api';
import { AuthContext } from '../../context/AuthContext';

const BLOOD_TYPES = [
  { id: 1, name: 'A+' },
  { id: 2, name: 'A-' },
  { id: 3, name: 'B+' },
  { id: 4, name: 'B-' },
  { id: 5, name: 'AB+' },
  { id: 6, name: 'AB-' },
  { id: 7, name: 'O+' },
  { id: 8, name: 'O-' }
];

function DonationHistoryByRequestModal({ requestId, onClose }) {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setMsg('');
    setErr('');
    api.get(`/DonationHistory/by-request/${requestId}`)
      .then(res => {
        setHistory(res.data);
        setForm(f => ({
          ...res.data,
          donorUserId: res.data.donorUserId || res.data.DonorUserId || (history && history.donorUserId) || '', // fallback nếu thiếu
        }));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [requestId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setErr('');

    // --- VALIDATION: Không cho phép hiến quá 450ml ---
    if (Number(form.quantityMl) > 450) {
      setErr('Số lượng hiến máu mỗi lần không được vượt quá 450ml.');
      setSaving(false);
      return;
    }

    try {
      let donorUserId = form.donorUserId;

      // Nếu chưa có donorUserId, tạo tài khoản tạm cho người hiến máu thực tế
      if (!donorUserId) {
        // Bạn có thể bổ sung các trường nhập nhanh như tên, số điện thoại ở form
        // Ở đây ví dụ sinh username/email tự động, mật khẩu mặc định
        const autoUsername = 'guest_' + Date.now();
        const autoEmail = 'guest_' + Date.now() + '#gmail.com';
        const createUserRes = await api.post('/ManageUserAccounts', {
          username: autoUsername,
          password: '12345',
          email: autoEmail,
          roleId: 3 // hoặc roleId mặc định cho người hiến máu
        });
        donorUserId = createUserRes.data.userId;
      }

      const payload = {
        DonorUserId: donorUserId,
        DonationDate: form.donationDate,
        BloodTypeId: form.bloodTypeId,
        ComponentId: 1, // Luôn là 1
        QuantityMl: form.quantityMl,
        EligibilityStatus:
          form.eligibilityStatus === true || form.eligibilityStatus === 'true'
            ? 'true'
            : form.eligibilityStatus === false || form.eligibilityStatus === 'false'
            ? 'false'
            : '',
        ReasonIneligible: form.reasonIneligible,
        TestingResults: form.testingResults,
        StaffUserId: user?.userId || form.staffUserId,
        Status: form.status,
        EmergencyId: form.emergencyId,
        Descriptions: form.descriptions,
        DonationRequestId: form.donationRequestId,
        // Add all possible fields for completeness
        donationId: form.donationId,
        donorName: form.donorName,
        donorPhone: form.donorPhone,
        donorEmail: form.donorEmail,
        // Add more fields if backend requires
      };
      const res = await api.put(`/DonationHistory/${form.donationId}`, payload);
      setHistory(res.data);
      setForm(res.data);
      setMsg('Cập nhật thành công!');
      setEdit(false);

      // Nếu trạng thái là Complete hoặc Completed, cập nhật lastBloodDonationDate cho UserProfile
      if (
        (payload.Status === 'Complete' || payload.Status === 'Completed') &&
        payload.DonationDate &&
        payload.DonorUserId
      ) {
        try {
          const profileRes = await api.get(`/UserProfile/by-user/${payload.DonorUserId}`);
          const profile = profileRes.data;
          const updatedProfile = {
            ...profile,
            lastBloodDonationDate: payload.DonationDate
          };
          await api.put(`/UserProfile/by-user/${payload.DonorUserId}`, updatedProfile);
        } catch (e) {
          console.error('Không thể cập nhật ngày hiến máu gần nhất cho user profile');
        }
      }
    } catch {
      setErr('Cập nhật thất bại!');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.2)' }}>
      <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-content">
          <form onSubmit={handleSave}>
            <div className="modal-header">
              <h5 className="modal-title">Ghi nhận thực tế hiến máu</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Đóng"></button>
            </div>
            <div className="modal-body">
              {loading && <div>Đang tải dữ liệu...</div>}
              {notFound && <div className="alert alert-warning">Chưa có ghi nhận hiến máu thực tế cho yêu cầu này.</div>}
              {history && !edit && (
                <div>
                  <div><b>Ngày hiến máu:</b> {history.donationDate ? new Date(history.donationDate).toLocaleString('vi-VN') : ''}</div>
                  <div><b>Nhóm máu:</b> {history.bloodTypeName}</div>
                  <div><b>Số lượng (ml):</b> {history.quantityMl}</div>
                  <div><b>Tình trạng đủ điều kiện:</b>{' '}
                    {history.eligibilityStatus === 'true'
                      ? 'Đủ điều kiện'
                      : history.eligibilityStatus === 'false'
                      ? 'Không đủ điều kiện'
                      : ''}
                  </div>
                  <div><b>Lý do không đủ điều kiện:</b> {history.reasonIneligible}</div>
                  <div><b>Kết quả xét nghiệm:</b> {history.testingResults}</div>
                  <div><b>Trạng thái:</b> {history.status === 'Complete' ? 'Hoàn thành'
                    : history.status === 'Pending' ? 'Đang xử lý'
                    : history.status === 'Cancelled' ? 'Đã hủy'
                    : history.status}</div>
                  <div><b>Ghi chú:</b> {history.descriptions}</div>
                  <button type="button" className="btn btn-warning mt-3" onClick={() => setEdit(true)}>
                    Chỉnh sửa
                  </button>
                </div>
              )}
              {history && edit && (
                <div>
                  <div className="mb-2"><b>Ngày hiến máu:</b>
                    <input type="datetime-local" className="form-control" name="donationDate"
                      value={form.donationDate ? form.donationDate.substring(0, 16) : ''} onChange={handleChange} />
                  </div>
                  <div className="mb-2"><b>Nhóm máu:</b>
                    <select className="form-select" name="bloodTypeId" value={form.bloodTypeId || ''} onChange={handleChange}>
                      <option value="">Chọn nhóm máu</option>
                      {BLOOD_TYPES.map(bt => (
                        <option key={bt.id} value={bt.id}>{bt.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-2"><b>Số lượng (ml):</b>
                    <input type="number" className="form-control" name="quantityMl" value={form.quantityMl || ''} onChange={handleChange} />
                  </div>
                  <div className="mb-2"><b>Tình trạng đủ điều kiện:</b>
                    <select className="form-select" name="eligibilityStatus" value={form.eligibilityStatus === true ? 'true' : form.eligibilityStatus === false ? 'false' : ''} onChange={e => setForm(f => ({ ...f, eligibilityStatus: e.target.value === 'true' ? true : e.target.value === 'false' ? false : '' }))}>
                      <option value="">Chọn tình trạng</option>
                      <option value="true">Đủ điều kiện</option>
                      <option value="false">Không đủ điều kiện</option>
                    </select>
                  </div>
                  <div className="mb-2"><b>Lý do không đủ điều kiện:</b>
                    <input type="text" className="form-control" name="reasonIneligible" value={form.reasonIneligible || ''} onChange={handleChange} />
                  </div>
                  <div className="mb-2"><b>Kết quả xét nghiệm:</b>
                    <select
                      className="form-select"
                      name="testingResults"
                      value={form.testingResults || ''}
                      onChange={handleChange}
                    >
                      <option value="">Chọn kết quả</option>
                      <option value="Đủ điều kiện">Đủ điều kiện</option>
                      <option value="Không đủ điều kiện">Không đủ điều kiện</option>
                    </select>
                  </div>
                  <div className="mb-2"><b>Trạng thái:</b>
                    <select className="form-select" name="status" value={form.status || ''} onChange={handleChange}>
                      <option value="Complete">Hoàn thành</option>
                      <option value="Pending">Đang xử lý</option>
                      <option value="Cancelled">Đã hủy</option>
                    </select>
                  </div>
                  <div className="mb-2"><b>Ghi chú:</b>
                    <textarea className="form-control" name="descriptions" value={form.descriptions || ''} onChange={handleChange} rows={2} />
                  </div>
                  <button type="submit" className="btn btn-success" disabled={saving}>
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                  <button type="button" className="btn btn-secondary ms-2" onClick={() => setEdit(false)} disabled={saving}>
                    Hủy
                  </button>
                </div>
              )}
              {msg && <div className="alert alert-success mt-2">{msg}</div>}
              {err && <div className="alert alert-danger mt-2">{err}</div>}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Đóng</button>
            </div>
          </form>
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
  );
}

export default DonationHistoryByRequestModal;
