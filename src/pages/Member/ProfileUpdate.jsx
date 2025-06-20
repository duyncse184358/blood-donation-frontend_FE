// src/pages/Member/ProfileUpdate.jsx
import React, { useState, useEffect } from 'react';
//import Header from '../../components/Header/Header';
//import Navbar from '../../components/Navbar/Navbar';
//import Footer from '../../components/Footer/Footer';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import useAuth from '../../hooks/useAuth';
import api from '../../services/Api';

function ProfileUpdate() {
  const { user, isAuthenticated } = useAuth();
  const [profileData, setProfileData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    latitude: '',
    longitude: '',
    bloodTypeId: '',
    rhFactor: '',
    medicalHistory: '',
    lastBloodDonationDate: '',
    cccd: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [addressError, setAddressError] = useState('');
  const [isCreateMode, setIsCreateMode] = useState(false);

  // Static data for dropdowns
  const genders = [
    { value: 'Male', label: 'Nam' },
    { value: 'Female', label: 'Nữ' },
    { value: 'Other', label: 'Khác' }
  ];
  const rhFactors = ['Rh+', 'Rh-'];
  const bloodTypes = [
    { id: 1, name: 'A+' }, { id: 2, name: 'A-' },
    { id: 3, name: 'B+' }, { id: 4, name: 'B-' },
    { id: 5, name: 'O+' }, { id: 6, name: 'O-' },
    { id: 7, name: 'AB+' }, { id: 8, name: 'AB-' },
  ];

  // Lấy profile khi mở trang
  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      const fetchProfile = async () => {
        setLoading(true);
        setError('');
        setIsCreateMode(false);
        try {
          const res = await api.get(`/UserProfile/by-user/${user.userId}`);
          // Có profile: hiển thị form cập nhật
          setProfileData({
            fullName: res.data.fullName || '',
            dateOfBirth: res.data.dateOfBirth ? res.data.dateOfBirth.split('T')[0] : '',
            gender: res.data.gender || '',
            address: res.data.address || '',
            latitude: res.data.latitude !== null && res.data.latitude !== undefined ? String(res.data.latitude) : '',
            longitude: res.data.longitude !== null && res.data.longitude !== undefined ? String(res.data.longitude) : '',
            bloodTypeId: res.data.bloodTypeId ? String(res.data.bloodTypeId) : '',
            rhFactor: res.data.rhFactor || '',
            medicalHistory: res.data.medicalHistory || '',
            lastBloodDonationDate: res.data.lastBloodDonationDate ? res.data.lastBloodDonationDate.split('T')[0] : '',
            cccd: res.data.cccd || '',
            phoneNumber: res.data.phoneNumber || '',
          });
          setIsCreateMode(false);
        } catch (err) {
          if (err.response && err.response.status === 404) {
            // Không có profile: hiển thị form tạo mới
            setIsCreateMode(true);
            setProfileData({
              fullName: '',
              dateOfBirth: '',
              gender: '',
              address: '',
              latitude: '',
              longitude: '',
              bloodTypeId: '',
              rhFactor: '',
              medicalHistory: '',
              lastBloodDonationDate: '',
              cccd: '',
              phoneNumber: '',
            });
          } else {
            setError('Lỗi hệ thống hoặc không thể lấy thông tin hồ sơ.');
          }
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    } else if (!isAuthenticated) {
      setLoading(false);
      setError('Vui lòng đăng nhập để xem và cập nhật hồ sơ.');
    }
  }, [isAuthenticated, user?.userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    if (name === 'address') {
      setAddressError('');
    }
  };

  const handleAddressBlur = (e) => {
    const address = e.target.value.trim();
    if (!address) {
      setAddressError('Vui lòng nhập địa chỉ chính xác.');
      setProfileData(prev => ({
        ...prev,
        latitude: '',
        longitude: ''
      }));
      return;
    }
    // Nếu backend đã tự lấy tọa độ thì có thể bỏ dòng dưới
    // fetchLatLngFromAddress(address);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    // Validate cơ bản
    if (!profileData.fullName.trim()) {
      setError('Họ và tên là bắt buộc.');
      setSubmitting(false);
      return;
    }
    if (!profileData.address.trim()) {
      setError('Địa chỉ là bắt buộc và phải chính xác.');
      setSubmitting(false);
      return;
    }
    if (profileData.phoneNumber && !/^(\+84|0)[0-9]{9,10}$/.test(profileData.phoneNumber)) {
      setError('Số điện thoại không hợp lệ.');
      setSubmitting(false);
      return;
    }
    if (profileData.cccd && !/^\d{12}$/.test(profileData.cccd)) {
      setError('CCCD phải đủ 12 số.');
      setSubmitting(false);
      return;
    }
    if (profileData.dateOfBirth && new Date(profileData.dateOfBirth) > new Date()) {
      setError('Ngày sinh không được lớn hơn ngày hiện tại.');
      setSubmitting(false);
      return;
    }

    try {
      const submitData = {
        userId: user.userId,
        fullName: profileData.fullName,
        dateOfBirth: profileData.dateOfBirth || null,
        gender: profileData.gender || null,
        address: profileData.address || null,
        latitude: profileData.latitude ? parseFloat(profileData.latitude) : null,
        longitude: profileData.longitude ? parseFloat(profileData.longitude) : null,
        bloodTypeId: profileData.bloodTypeId ? parseInt(profileData.bloodTypeId) : null,
        rhFactor: profileData.rhFactor || null,
        medicalHistory: profileData.medicalHistory || null,
        lastBloodDonationDate: profileData.lastBloodDonationDate || null,
        cccd: profileData.cccd || null,
        phoneNumber: profileData.phoneNumber || null,
      };

      let res, data;
      if (isCreateMode) {
        res = await api.post(`/UserProfile`, submitData);
      } else {
        res = await api.put(`/UserProfile/by-user/${user.userId}`, submitData);
      }
      data = res.data;

      setMessage(isCreateMode ? 'Hồ sơ của bạn đã được tạo thành công!' : 'Hồ sơ của bạn đã được cập nhật thành công!');
      setIsCreateMode(false); // Sau khi tạo mới thành công, chuyển về chế độ cập nhật
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && err.response.status === 404) {
        setError('Không tìm thấy hồ sơ người dùng.');
      } else if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError('Bạn chưa đăng nhập hoặc không có quyền cập nhật.');
      } else {
        setError('Đã xảy ra lỗi khi cập nhật hồ sơ.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="profile-page-wrapper" style={{ background: '#f6f8fa', minHeight: '100vh' }}>
  
      <main className="container my-5">
        <h1 className="text-center mb-4 text-primary">{isCreateMode ? 'Tạo Hồ sơ cá nhân' : 'Cập nhật Hồ sơ cá nhân'}</h1>
        <p className="text-center lead">
          Quản lý thông tin cá nhân, y tế và lịch sử hiến máu của bạn.
        </p>
        <div className="card shadow p-4 mx-auto" style={{ maxWidth: '700px', borderRadius: '18px', border: '1px solid #e3e6ea' }}>
          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="fullName" className="form-label">Họ và tên <span style={{ color: 'red' }}>*</span></label>
                <input type="text" className="form-control" id="fullName" name="fullName"
                  value={profileData.fullName} onChange={handleChange} disabled={submitting} autoFocus />
              </div>
              <div className="col-md-6">
                <label htmlFor="phoneNumber" className="form-label">Số điện thoại</label>
                <input type="tel" className="form-control" id="phoneNumber" name="phoneNumber"
                  value={profileData.phoneNumber} onChange={handleChange} disabled={submitting} />
              </div>
              <div className="col-md-6">
                <label htmlFor="cccd" className="form-label">CCCD/CMND</label>
                <input type="text" className="form-control" id="cccd" name="cccd"
                  value={profileData.cccd} onChange={handleChange} disabled={submitting} />
              </div>
              <div className="col-md-6">
                <label htmlFor="dateOfBirth" className="form-label">Ngày sinh</label>
                <input type="date" className="form-control" id="dateOfBirth" name="dateOfBirth"
                  value={profileData.dateOfBirth} onChange={handleChange} disabled={submitting} />
              </div>
              <div className="col-md-6">
                <label htmlFor="gender" className="form-label">Giới tính</label>
                <select className="form-select" id="gender" name="gender"
                  value={profileData.gender} onChange={handleChange} disabled={submitting}>
                  <option value="">Chọn giới tính</option>
                  {genders.map(g => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label htmlFor="address" className="form-label">Địa chỉ <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  className={`form-control ${addressError ? 'is-invalid' : ''}`}
                  id="address"
                  name="address"
                  value={profileData.address}
                  onChange={handleChange}
                  onBlur={handleAddressBlur}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                  disabled={submitting}
                  required
                />
                {addressError && <div className="invalid-feedback">{addressError}</div>}
              </div>
              <div className="col-md-6">
                <label htmlFor="latitude" className="form-label">Vĩ độ (Latitude)</label>
                <input
                  type="number"
                  step="0.000001"
                  className="form-control"
                  id="latitude"
                  name="latitude"
                  value={profileData.latitude}
                  readOnly
                  disabled
                  placeholder="Tự động lấy từ địa chỉ"
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="longitude" className="form-label">Kinh độ (Longitude)</label>
                <input
                  type="number"
                  step="0.000001"
                  className="form-control"
                  id="longitude"
                  name="longitude"
                  value={profileData.longitude}
                  readOnly
                  disabled
                  placeholder="Tự động lấy từ địa chỉ"
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="bloodTypeId" className="form-label">Nhóm máu</label>
                <select className="form-select" id="bloodTypeId" name="bloodTypeId"
                  value={profileData.bloodTypeId} onChange={handleChange} disabled={submitting}>
                  <option value="">Chọn nhóm máu</option>
                  {bloodTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label htmlFor="rhFactor" className="form-label">Yếu tố Rh</label>
                <select className="form-select" id="rhFactor" name="rhFactor"
                  value={profileData.rhFactor} onChange={handleChange} disabled={submitting}>
                  <option value="">Chọn yếu tố Rh</option>
                  {rhFactors.map(factor => <option key={factor} value={factor}>{factor}</option>)}
                </select>
              </div>
              <div className="col-12">
                <label htmlFor="medicalHistory" className="form-label">Lịch sử bệnh án/y tế (nếu có)</label>
                <textarea className="form-control" id="medicalHistory" name="medicalHistory" rows="3"
                  value={profileData.medicalHistory} onChange={handleChange} placeholder="Ví dụ: Tiểu đường, cao huyết áp, dị ứng thuốc..." disabled={submitting} />
              </div>
              <div className="col-md-6">
                <label htmlFor="lastBloodDonationDate" className="form-label">Ngày hiến máu gần nhất</label>
                <input type="date" className="form-control" id="lastBloodDonationDate" name="lastBloodDonationDate"
                  value={profileData.lastBloodDonationDate} onChange={handleChange} disabled={submitting} />
              </div>
            </div>
            <div className="d-grid gap-2 mt-4">
              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                {submitting ? (isCreateMode ? 'Đang tạo...' : 'Đang cập nhật...') : (isCreateMode ? 'Tạo Hồ sơ' : 'Cập nhật Hồ sơ')}
              </button>
            </div>
          </form>
        </div>
      </main>
 
      {/* CSS nội bộ cho đẹp hơn */}
      <style>{`
        .profile-page-wrapper {
          background: #f6f8fa;
        }
        .card {
          border-radius: 18px;
          border: 1px solid #e3e6ea;
        }
        .form-control:focus, .form-select:focus {
          border-color: #86b7fe;
          box-shadow: 0 0 0 0.2rem rgba(13,110,253,.15);
        }
        .btn-primary {
          background: linear-gradient(90deg, #007bff 0%, #0056b3 100%);
          border: none;
        }
        .btn-primary:active, .btn-primary:focus {
          background: #0056b3;
        }
      `}</style>
    </div>
  );
}

export default ProfileUpdate;
