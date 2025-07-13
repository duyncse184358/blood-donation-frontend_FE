import React, { useState, useContext } from 'react';
import api from '../../services/Api';
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext để lấy thông tin user

const bloodTypes = [
  { id: 1, name: 'A+' },
  { id: 2, name: 'A-' },
  { id: 3, name: 'B+' },
  { id: 4, name: 'B-' },
  { id: 5, name: 'O+' },
  { id: 6, name: 'O-' },
  { id: 7, name: 'AB+' },
  { id: 8, name: 'AB-' }
];

const initialForm = {
  donorUserId: '',
  donationDate: '',
  bloodTypeId: '',
  componentId: '1',
  quantityMl: '',
  eligibilityStatus: 'Eligible',
  reasonIneligible: '',
  testingResults: '',
  staffUserId: '', // Sẽ được tự động gán từ token
  status: 'Complete',
  emergencyId: '',
  descriptions: '',
  donationRequestId: ''
};

const initialCreateAccountForm = {
  username: '',
  email: '',
  password: '',
  roleId: 3,
  isActive: true
};

function DonationRecordForm() {
  const { user } = useContext(AuthContext); // Lấy thông tin user từ AuthContext
  const [form, setForm] = useState({ ...initialForm, staffUserId: user?.userId || '' }); // Gán staffUserId từ token
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showCreateFields, setShowCreateFields] = useState(false);
  const [createAccountForm, setCreateAccountForm] = useState(initialCreateAccountForm);
  const [createAccountError, setCreateAccountError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);

    let donorUserId = form.donorUserId;

    // Validate required fields
    if (!form.donationDate) {
      setError('Trường Ngày hiến máu là bắt buộc.');
      setLoading(false);
      return;
    }
    if (!form.bloodTypeId) {
      setError('Trường Nhóm máu (BloodTypeId) là bắt buộc.');
      setLoading(false);
      return;
    }
    if (!form.quantityMl || form.quantityMl <= 0) {
      setError('Trường Số ml máu phải lớn hơn 0.');
      setLoading(false);
      return;
    }

    // Kiểm tra nếu `donorUserId` chưa được nhập
    if (!donorUserId) {
      const confirmCreate = window.confirm(
        'Mã người hiến chưa được nhập. Bạn có muốn tạo tài khoản mới không?'
      );
      if (!confirmCreate) {
        setError('Vui lòng nhập mã người hiến hoặc tạo tài khoản mới.');
        setLoading(false);
        return;
      }

      try {
        // Tạo tài khoản tạm nếu không có `donorUserId`
        const autoUsername = 'guest_' + Date.now();
        const autoEmail = 'guest_' + Date.now() + '@gmail.com';
        const createUserRes = await api.post('/ManageUserAccounts', {
          username: autoUsername,
          password: '12345',
          email: autoEmail,
          roleId: 3 // Role ID cho người hiến máu
        });
        donorUserId = createUserRes.data.userId; // Lấy `userId` từ tài khoản mới tạo
        setForm(f => ({ ...f, donorUserId })); // Cập nhật `donorUserId` trong form
        setSuccess('Tài khoản mới đã được tạo và gán vào mã người hiến.');
      } catch (err) {
        console.error('Lỗi khi tạo tài khoản tạm:', err.response?.data || err.message);
        setError('Không thể tạo tài khoản tạm. Vui lòng thử lại!');
        setLoading(false);
        return;
      }
    }

    // Gửi dữ liệu trực tiếp dưới dạng các trường riêng lẻ
    const requestBody = {
      donorUserId,
      donationDate: form.donationDate,
      bloodTypeId: parseInt(form.bloodTypeId),
      componentId: parseInt(form.componentId),
      quantityMl: form.quantityMl ? parseInt(form.quantityMl) : null,
      eligibilityStatus: form.eligibilityStatus || null,
      reasonIneligible: form.reasonIneligible || null,
      testingResults: form.testingResults || null,
      staffUserId: form.staffUserId || null, // Lấy từ token
      status: form.status || null,
      emergencyId: form.emergencyId || null,
      descriptions: form.descriptions || null,
      donationRequestId: form.donationRequestId || null
    };

    try {
      console.log('Dữ liệu gửi đi:', requestBody);
      await api.post('/DonationHistory', requestBody); // Gửi trực tiếp các trường
      setSuccess('Ghi nhận hiến máu thành công!');
      setForm({ ...initialForm, staffUserId: user?.userId || '' }); // Reset form và giữ lại staffUserId
    } catch (err) {
      console.error('Lỗi khi gửi dữ liệu:', err.response?.data || err.message);
      if (err.response?.data?.errors) {
        console.log('Validation Errors:', err.response.data.errors);
      }
      setError('Ghi nhận thất bại. Vui lòng kiểm tra lại thông tin!');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccountChange = e => {
    const { name, value } = e.target;
    setCreateAccountForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateAccountSubmit = async () => {
    setCreateAccountError('');
    setSuccess('');
    try {
      const response = await api.post('/ManageUserAccounts', createAccountForm);
      console.log('UserId trả về:', response.data.userId);
      setSuccess('Tạo tài khoản thành công!');
      setForm(prev => ({ ...prev, donorUserId: response.data.userId }));
      setShowCreateFields(false);
    } catch (err) {
      console.error('Lỗi khi tạo tài khoản:', err.response?.data || err.message);
      setCreateAccountError('Tạo tài khoản thất bại. Vui lòng kiểm tra lại thông tin!');
    }
  };

  return (
    <>
      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-md-6">
          <label className="form-label">Mã người hiến (DonorUserId)</label>
          <input
            type="text"
            className="form-control"
            name="donorUserId"
            value={form.donorUserId}
            onChange={handleChange}
            placeholder="Nhập mã người hiến (để trống nếu muốn tạo tài khoản mới)"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Ngày hiến máu</label>
          <input
            type="date"
            className="form-control"
            name="donationDate"
            value={form.donationDate}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Nhóm máu (BloodTypeId)</label>
          <select
            className="form-select"
            name="bloodTypeId"
            value={form.bloodTypeId}
            onChange={handleChange}
            required
          >
            <option value="">Chọn nhóm máu</option>
            {bloodTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Thành phần máu (ComponentId)</label>
          <select
            className="form-select"
            name="componentId"
            value={form.componentId}
            onChange={handleChange}
          >
            <option value="1">Toàn Phần</option>
            <option value="2">Hồng Cầu</option>
            <option value="3">Tiểu cầu</option>
            <option value="4">Huyết tương</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Số ml máu</label>
          <input
            type="number"
            className="form-control"
            name="quantityMl"
            value={form.quantityMl}
            onChange={handleChange}
            placeholder="Nhập số ml máu"
            required
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Trạng thái đủ điều kiện</label>
          <select
            className="form-select"
            name="eligibilityStatus"
            value={form.eligibilityStatus}
            onChange={handleChange}
          >
            <option value="Eligible">Đủ điều kiện</option>
            <option value="Ineligible">Không đủ điều kiện</option>
          </select>
        </div>
        <div className="col-md-8">
          <label className="form-label">Lý do không đủ điều kiện (nếu có)</label>
          <input
            type="text"
            className="form-control"
            name="reasonIneligible"
            value={form.reasonIneligible}
            onChange={handleChange}
            placeholder="Nhập lý do (nếu có)"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Kết quả xét nghiệm</label>
          <input
            type="text"
            className="form-control"
            name="testingResults"
            value={form.testingResults}
            onChange={handleChange}
            placeholder="Nhập kết quả xét nghiệm"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Mã nhân viên ghi nhận (StaffUserId)</label>
          <input
            type="text"
            className="form-control"
            name="staffUserId"
            value={form.staffUserId}
            onChange={handleChange}
            placeholder="Nhập mã nhân viên"
            disabled // Không cho phép chỉnh sửa vì lấy từ token
          />
        </div>
        <div className="col-md-12">
          <label className="form-label">Ghi chú thêm</label>
          <textarea
            className="form-control"
            name="descriptions"
            value={form.descriptions}
            onChange={handleChange}
            rows="3"
            placeholder="Nhập ghi chú (nếu có)"
          ></textarea>
        </div>
        <div className="col-md-12">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Ghi nhận hiến máu'}
          </button>
          {!showCreateFields && (
            <button
              type="button"
              className="btn btn-secondary ms-3"
              onClick={() => setShowCreateFields(true)}
            >
              Tạo tài khoản
            </button>
          )}
        </div>
        {success && <div className="col-md-12 alert alert-success">{success}</div>}
        {error && <div className="col-md-12 alert alert-danger">{error}</div>}
      </form>

      {/* Hiển thị các trường tạo tài khoản */}
      {showCreateFields && (
        <div className="mt-4 p-3 border rounded">
          <h5>Tạo tài khoản mới</h5>
          <div className="mb-3">
            <label className="form-label">Tên đăng nhập</label>
            <input
              type="text"
              className="form-control"
              name="username"
              value={createAccountForm.username}
              onChange={handleCreateAccountChange}
              placeholder="Nhập tên đăng nhập"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={createAccountForm.email}
              onChange={handleCreateAccountChange}
              placeholder="Nhập email"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Mật khẩu</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={createAccountForm.password}
              onChange={handleCreateAccountChange}
              placeholder="Nhập mật khẩu"
            />
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowCreateFields(false)}
            >
              Hủy
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreateAccountSubmit}
            >
              Tạo tài khoản
            </button>
          </div>
          {createAccountError && <div className="alert alert-danger mt-3">{createAccountError}</div>}
        </div>
      )}
    </>
  );
}

export default DonationRecordForm;