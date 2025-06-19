import React, { useState } from 'react';
import api from '../../services/Api';

const initialForm = {
  donorUserId: '',
  donationDate: '',
  bloodTypeId: '',
  componentId: '',
  quantityMl: '',
  eligibilityStatus: 'Eligible',
  reasonIneligible: '',
  testingResults: '',
  staffUserId: '',
  status: 'Complete',
  emergencyId: '',
  descriptions: '',
  donationRequestId: ''
};

function DonationRecordForm() {
  const [form, setForm] = useState(initialForm);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Xử lý thay đổi input
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // Gửi form ghi nhận hiến máu
  const handleSubmit = async e => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);

    // Chỉ gửi 1 trong 2 trường: donationRequestId hoặc emergencyId
    const payload = { ...form };
    if (!payload.donationRequestId) payload.donationRequestId = null;
    if (!payload.emergencyId) payload.emergencyId = null;

    try {
      await api.post('/DonationHistory', payload);
      setSuccess('Ghi nhận hiến máu thành công!');
      setForm(initialForm);
    } catch (err) {
      setError('Ghi nhận thất bại. Vui lòng kiểm tra lại thông tin!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="row g-3" onSubmit={handleSubmit}>
      <div className="col-md-6">
        <label className="form-label">Mã người hiến (DonorUserId)</label>
        <input type="text" className="form-control" name="donorUserId" value={form.donorUserId} onChange={handleChange} required />
      </div>
      <div className="col-md-6">
        <label className="form-label">Ngày hiến máu</label>
        <input type="date" className="form-control" name="donationDate" value={form.donationDate} onChange={handleChange} required />
      </div>
      <div className="col-md-4">
        <label className="form-label">Nhóm máu (BloodTypeId)</label>
        <input type="number" className="form-control" name="bloodTypeId" value={form.bloodTypeId} onChange={handleChange} required />
      </div>
      <div className="col-md-4">
        <label className="form-label">Thành phần máu (ComponentId)</label>
        <input type="number" className="form-control" name="componentId" value={form.componentId} onChange={handleChange} required />
      </div>
      <div className="col-md-4">
        <label className="form-label">Số ml máu</label>
        <input type="number" className="form-control" name="quantityMl" value={form.quantityMl} onChange={handleChange} required />
      </div>
      <div className="col-md-4">
        <label className="form-label">Trạng thái đủ điều kiện</label>
        <select className="form-select" name="eligibilityStatus" value={form.eligibilityStatus} onChange={handleChange}>
          <option value="Eligible">Đủ điều kiện</option>
          <option value="Ineligible">Không đủ điều kiện</option>
        </select>
      </div>
      <div className="col-md-8">
        <label className="form-label">Lý do không đủ điều kiện (nếu có)</label>
        <input type="text" className="form-control" name="reasonIneligible" value={form.reasonIneligible} onChange={handleChange} />
      </div>
      <div className="col-md-6">
        <label className="form-label">Kết quả xét nghiệm</label>
        <input type="text" className="form-control" name="testingResults" value={form.testingResults} onChange={handleChange} />
      </div>
      <div className="col-md-6">
        <label className="form-label">Mã nhân viên ghi nhận (StaffUserId)</label>
        <input type="text" className="form-control" name="staffUserId" value={form.staffUserId} onChange={handleChange} />
      </div>
      <div className="col-md-6">
        <label className="form-label">Trạng thái</label>
        <select className="form-select" name="status" value={form.status} onChange={handleChange}>
          <option value="Complete">Hoàn thành</option>
          <option value="Pending">Đang chờ</option>
          <option value="Cancelled">Đã hủy</option>
        </select>
      </div>
      <div className="col-md-6">
        <label className="form-label">Mã tình huống khẩn cấp (nếu có)</label>
        <input type="text" className="form-control" name="emergencyId" value={form.emergencyId} onChange={handleChange} />
      </div>
      <div className="col-md-12">
        <label className="form-label">Ghi chú thêm (nếu có)</label>
        <textarea className="form-control" name="descriptions" value={form.descriptions} onChange={handleChange} rows="3"></textarea>
      </div>
      <div className="col-md-12">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Ghi nhận hiến máu'}
        </button>
      </div>
      {success && <div className="col-md-12 alert alert-success">{success}</div>}
      {error && <div className="col-md-12 alert alert-danger">{error}</div>}
    </form>
  );
}

export default DonationRecordForm;