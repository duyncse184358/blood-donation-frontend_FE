import React, { useEffect, useState, useContext } from 'react';
import api from '../../services/Api';
import { AuthContext } from '../../context/AuthContext';

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
        setForm(res.data);
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
    try {
      const payload = {
        donorUserId: form.donorUserId,
        donationDate: form.donationDate,
        bloodTypeId: form.bloodTypeId,
        componentId: form.componentId,
        quantityMl: form.quantityMl,
        eligibilityStatus: form.eligibilityStatus,
        reasonIneligible: form.reasonIneligible,
        testingResults: form.testingResults,
        staffUserId: user?.userId || form.staffUserId,
        status: form.status,
        emergencyId: form.emergencyId,
        descriptions: form.descriptions,
        donationRequestId: form.donationRequestId,
      };
      const res = await api.put(`/DonationHistory/${form.donationId}`, payload);
      setHistory(res.data);
      setForm(res.data);
      setMsg('Cập nhật thành công!');
      setEdit(false);
    } catch {
      setErr('Cập nhật thất bại!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.2)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <form onSubmit={handleSave}>
            <div className="modal-header">
              <h5 className="modal-title">Lịch sử hiến máu thực tế</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {loading && <div>Đang tải...</div>}
              {notFound && <div className="alert alert-warning">Chưa có ghi nhận hiến máu thực tế cho yêu cầu này.</div>}
              {history && !edit && (
                <div>
                  <div><b>Ngày hiến máu:</b> {history.donationDate ? new Date(history.donationDate).toLocaleString() : ''}</div>
                  <div><b>Nhóm máu:</b> {history.bloodTypeName}</div>
                  <div><b>Thành phần:</b> {history.componentName}</div>
                  <div><b>Số ml máu:</b> {history.quantityMl}</div>
                  <div><b>Kết quả xét nghiệm:</b> {history.testingResults}</div>
                  <div><b>Trạng thái:</b> {history.status}</div>
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
                  <div className="mb-2"><b>Số ml máu:</b>
                    <input type="number" className="form-control" name="quantityMl" value={form.quantityMl || ''} onChange={handleChange} />
                  </div>
                  <div className="mb-2"><b>Kết quả xét nghiệm:</b>
                    <input type="text" className="form-control" name="testingResults" value={form.testingResults || ''} onChange={handleChange} />
                  </div>
                  <div className="mb-2"><b>Trạng thái:</b>
                    <select className="form-select" name="status" value={form.status || ''} onChange={handleChange}>
                      <option value="Complete">Hoàn thành</option>
                      <option value="Pending">Đang xử lý</option>
                      <option value="Cancelled">Hủy</option>
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
    </div>
  );
}

export default DonationHistoryByRequestModal;
