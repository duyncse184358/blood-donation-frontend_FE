// src/pages/Member/RegisterDonation.jsx
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import useAuth from '../../hooks/useAuth';
import api from '../../services/Api';

const TIME_SLOTS = [
  '08:00 - 09:30',
  '09:30 - 11:00',
  '13:30 - 15:00',
  '15:00 - 16:30'
];
const MAX_PER_SLOT = 10; // Số lượng tối đa mỗi khung giờ

function RegisterDonation() {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    bloodTypeId: '',
    preferredDate: '',
    preferredTimeSlot: '',
    staffNotes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [slotCounts, setSlotCounts] = useState({});
  const [disabledSlots, setDisabledSlots] = useState([]);
  const [disabledDates, setDisabledDates] = useState([]);
  
  const [profile, setProfile] = useState(null);
  const [hasRejectedHistory, setHasRejectedHistory] = useState(false);

  // Các tùy chọn nhóm máu
  const bloodTypes = [
    { id: 1, name: 'A+' }, { id: 2, name: 'A-' },
    { id: 3, name: 'B+' }, { id: 4, name: 'B-' },
    { id: 5, name: 'O+' }, { id: 6, name: 'O-' },
    { id: 7, name: 'AB+' }, { id: 8, name: 'AB-' },
  ];

  // Lấy ngày hôm nay (yyyy-MM-dd)
  const today = new Date().toISOString().split('T')[0];

  // Lấy số lượng đăng ký từng khung giờ trong ngày đã chọn
  useEffect(() => {
    if (formData.preferredDate) {
      api.get(`/DonationRequest/SlotCounts?date=${formData.preferredDate}`)
        .then(res => {
          setSlotCounts(res.data || {});
          // Disable slot nếu đủ số lượng
          const fullSlots = TIME_SLOTS.filter(slot => (res.data?.[slot] || 0) >= MAX_PER_SLOT);
          setDisabledSlots(fullSlots);
          // Nếu tất cả slot đều full thì disable ngày này
          if (fullSlots.length === TIME_SLOTS.length) {
            setDisabledDates(prev => [...new Set([...prev, formData.preferredDate])]);
          }
        })
        .catch(() => {
          setSlotCounts({});
          setDisabledSlots([]);
        });
    }
  }, [formData.preferredDate]);

  // Lấy profile và kiểm tra lịch sử bị từ chối
  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      api.get(`/UserProfile/by-user/${user.userId}`)
        .then(res => setProfile(res.data))
        .catch(() => setProfile(null));
      api.get(`/DonationHistory/by-donor/${user.userId}`)
        .then(res => {
          const rejected = (res.data || []).some(h => h.status === 'Rejected');
          setHasRejectedHistory(rejected);
        })
        .catch(() => setHasRejectedHistory(false));
    }
  }, [isAuthenticated, user?.userId]);

  // Validate form trước khi gửi
  const validate = () => {
    const errs = {};
    if (!formData.bloodTypeId) errs.bloodTypeId = 'Vui lòng chọn nhóm máu.';
    if (!formData.preferredDate) errs.preferredDate = 'Vui lòng chọn ngày hiến máu.';
    else if (formData.preferredDate < today)
      errs.preferredDate = 'Không được chọn ngày trong quá khứ.';
    if (!formData.preferredTimeSlot) errs.preferredTimeSlot = 'Vui lòng chọn khung giờ.';
    // Kiểm tra slot đã đủ người chưa
    if (disabledSlots.includes(formData.preferredTimeSlot))
      errs.preferredTimeSlot = 'Khung giờ này đã đủ số lượng đăng ký, vui lòng chọn khung giờ khác.';
    // Kiểm tra ngày đã full chưa
    if (disabledDates.includes(formData.preferredDate))
      errs.preferredDate = 'Ngày này đã đủ số lượng đăng ký, vui lòng chọn ngày khác.';
    // Kiểm tra khoảng cách 90 ngày
    const lastDate = profile && profile.lastBloodDonationDate ? profile.lastBloodDonationDate : null;
    if (lastDate && formData.preferredDate) {
      const last = new Date(lastDate);
      const next = new Date(formData.preferredDate);
      const diffDays = Math.floor((next - last) / (1000 * 60 * 60 * 24));
      if (diffDays < 90) {
        errs.preferredDate = `Bạn cần chờ ít nhất 90 ngày giữa 2 lần hiến máu. Lần gần nhất: ${lastDate}`;
      }
    }
    // Kiểm tra tuổi
    if (profile && profile.dob) {
      const dob = new Date(profile.dob);
      const now = new Date();
      let age = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
        age--;
      }
      if (age < 18 || age > 60) {
        errs.bloodTypeId = 'Bạn phải từ 18 đến 60 tuổi mới được đăng ký hiến máu.';
      }
    }
    // Kiểm tra lịch sử bị từ chối
    if (hasRejectedHistory) {
      errs.bloodTypeId = 'Bạn đã từng bị từ chối hiến máu, không thể đăng ký hiến máu mới.';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    // Nếu đổi ngày thì reset slot
    if (name === 'preferredDate') {
      setFormData(prev => ({ ...prev, preferredTimeSlot: '' }));
    }
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
        preferredDate: formData.preferredDate,
        preferredTimeSlot: formData.preferredTimeSlot,
        status: "Pending",
        staffNotes: formData.staffNotes
      };

      await api.post('/DonationRequest/RegisterDonationRequest', payload);
      setMessage('Yêu cầu hiến máu của bạn đã được gửi thành công!');
      setFormData({
        bloodTypeId: '',
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

  // Disable ngày đã full slot
  const isDateDisabled = (dateStr) => disabledDates.includes(dateStr);

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
              <label htmlFor="preferredDate" className="form-label">Ngày hiến máu mong muốn <span style={{color:'red'}}>*</span></label>
              <input
                type="date"
                className={`form-control ${fieldErrors.preferredDate ? 'is-invalid' : ''}`}
                id="preferredDate"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                min={today}
                required
                disabled={loading}
              />
              {fieldErrors.preferredDate && <div className="invalid-feedback">{fieldErrors.preferredDate}</div>}
              {isDateDisabled(formData.preferredDate) && (
                <div className="text-danger mt-1">Ngày này đã đủ số lượng đăng ký, vui lòng chọn ngày khác.</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="preferredTimeSlot" className="form-label">Khung giờ mong muốn <span style={{color:'red'}}>*</span></label>
              <select
                className={`form-select ${fieldErrors.preferredTimeSlot ? 'is-invalid' : ''}`}
                id="preferredTimeSlot"
                name="preferredTimeSlot"
                value={formData.preferredTimeSlot}
                onChange={handleChange}
                required
                disabled={loading || !formData.preferredDate || isDateDisabled(formData.preferredDate)}
              >
                <option value="">Chọn khung giờ</option>
                {TIME_SLOTS.map(slot => (
                  <option
                    key={slot}
                    value={slot}
                    disabled={disabledSlots.includes(slot)}
                  >
                    {slot} {slotCounts[slot] ? `(${slotCounts[slot]}/${MAX_PER_SLOT})` : ''}
                    {disabledSlots.includes(slot) ? ' - Đã đầy' : ''}
                  </option>
                ))}
              </select>
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
