// src/pages/Member/RegisterDonation.jsx
import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import useAuth from '../../hooks/useAuth';
import api from '../../services/Api';

function RegisterDonation() {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    bloodTypeId: '',
    componentId: '',
    preferredDate: '',
    preferredTimeSlot: '',
    staffNotes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Các tùy chọn nhóm máu và thành phần máu
  const bloodTypes = [
    { id: 1, name: 'A+' }, { id: 2, name: 'A-' },
    { id: 3, name: 'B+' }, { id: 4, name: 'B-' },
    { id: 5, name: 'O+' }, { id: 6, name: 'O-' },
    { id: 7, name: 'AB+' }, { id: 8, name: 'AB-' },
  ];
  const bloodComponents = [
    { id: 1, name: 'Máu toàn phần' },
    { id: 2, name: 'Hồng cầu' },
    { id: 3, name: 'Huyết tương' },
    { id: 4, name: 'Tiểu cầu' },
  ];

  // Regex kiểm tra khung giờ (ví dụ: 8:00 - 11:00 hoặc 08:00-11:00)
  const timeSlotRegex = /^([01]?\d|2[0-3]):[0-5]\d\s*-\s*([01]?\d|2[0-3]):[0-5]\d$/;

  // Validate form trước khi gửi
  const validate = () => {
    const errs = {};
    if (!formData.bloodTypeId) errs.bloodTypeId = 'Vui lòng chọn nhóm máu.';
    if (!formData.componentId) errs.componentId = 'Vui lòng chọn thành phần máu.';
    if (!formData.preferredDate) errs.preferredDate = 'Vui lòng chọn ngày hiến máu.';
    else if (formData.preferredDate < new Date().toISOString().split('T')[0])
      errs.preferredDate = 'Không được chọn ngày trong quá khứ.';
    if (!formData.preferredTimeSlot) errs.preferredTimeSlot = 'Vui lòng nhập khung giờ mong muốn.';
    else if (!timeSlotRegex.test(formData.preferredTimeSlot.trim()))
      errs.preferredTimeSlot = 'Định dạng khung giờ phải là HH:mm - HH:mm (VD: 08:00 - 11:00)';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (!isAuthenticated || !user?.userId) {
      setError('Bạn cần đăng nhập để đăng ký hiến máu.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        donorUserId: user.userId,
        bloodTypeId: parseInt(formData.bloodTypeId),
        componentId: parseInt(formData.componentId),
        preferredDate: formData.preferredDate, // luôn là string yyyy-MM-dd
        preferredTimeSlot: formData.preferredTimeSlot,
        status: "Pending",
        staffNotes: formData.staffNotes
      };

      const res = await api.post('/DonationRequest/RegisterDonationRequest', payload);
      setMessage('Yêu cầu hiến máu của bạn đã được gửi thành công!');
      setFormData({
        bloodTypeId: '',
        componentId: '',
        preferredDate: '',
        preferredTimeSlot: '',
        staffNotes: '',
      });
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError('Bạn chưa đăng nhập hoặc không có quyền.');
      } else {
        setError('Đã xảy ra lỗi khi gửi yêu cầu.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Header />
      <Navbar />
      <main className="container my-5">
        <h1 className="text-center mb-4 text-danger">Đăng ký Hiến máu</h1>
        <p className="text-center lead">
          Vui lòng điền thông tin để đăng ký hiến máu tình nguyện.
        </p>
        <div className="card shadow-lg p-4 mx-auto donation-card">
          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="mb-3">
              <label htmlFor="bloodTypeId" className="form-label">Nhóm máu <span style={{color:'red'}}>*</span></label>
              <select
                className={`form-select ${fieldErrors.bloodTypeId ? 'is-invalid' : ''}`}
                id="bloodTypeId"
                name="bloodTypeId"
                value={formData.bloodTypeId}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Chọn nhóm máu</option>
                {bloodTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              {fieldErrors.bloodTypeId && <div className="invalid-feedback">{fieldErrors.bloodTypeId}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="componentId" className="form-label">Thành phần máu hiến <span style={{color:'red'}}>*</span></label>
              <select
                className={`form-select ${fieldErrors.componentId ? 'is-invalid' : ''}`}
                id="componentId"
                name="componentId"
                value={formData.componentId}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Chọn thành phần</option>
                {bloodComponents.map(component => (
                  <option key={component.id} value={component.id}>{component.name}</option>
                ))}
              </select>
              {fieldErrors.componentId && <div className="invalid-feedback">{fieldErrors.componentId}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="preferredDate" className="form-label">Ngày hiến máu mong muốn <span style={{color:'red'}}>*</span></label>
              <input
                type="date"
                className={`form-control ${fieldErrors.preferredDate ? 'is-invalid' : ''}`}
                id="preferredDate"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
                disabled={loading}
              />
              {fieldErrors.preferredDate && <div className="invalid-feedback">{fieldErrors.preferredDate}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="preferredTimeSlot" className="form-label">Khung giờ mong muốn <span style={{color:'red'}}>*</span></label>
              <input
                type="text"
                className={`form-control ${fieldErrors.preferredTimeSlot ? 'is-invalid' : ''}`}
                id="preferredTimeSlot"
                name="preferredTimeSlot"
                value={formData.preferredTimeSlot}
                onChange={handleChange}
                placeholder="Ví dụ: 08:00 - 11:00"
                required
                disabled={loading}
              />
              {fieldErrors.preferredTimeSlot && <div className="invalid-feedback">{fieldErrors.preferredTimeSlot}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="staffNotes" className="form-label">Ghi chú thêm (tùy chọn)</label>
              <textarea
                className="form-control"
                id="staffNotes"
                name="staffNotes"
                value={formData.staffNotes}
                onChange={handleChange}
                rows="3"
                placeholder="Ví dụ: Có thể hiến vào cuối tuần."
                disabled={loading}
              ></textarea>
            </div>

            <button type="submit" className="btn btn-danger btn-lg w-100" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi yêu cầu hiến máu'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
      {/* CSS nội bộ cho đẹp hơn */}
      <style>{`
        .donation-card {
          max-width: 600px;
          border-radius: 18px;
          border: 1px solid #e3e6ea;
          background: #fff;
        }
        .form-control:focus, .form-select:focus {
          border-color: #dc3545;
          box-shadow: 0 0 0 0.2rem rgba(220,53,69,.15);
        }
        .btn-danger {
          background: linear-gradient(90deg, #dc3545 0%, #b52a37 100%);
          border: none;
        }
        .btn-danger:active, .btn-danger:focus {
          background: #b52a37;
        }
      `}</style>
    </div>
  );
}

export default RegisterDonation;
