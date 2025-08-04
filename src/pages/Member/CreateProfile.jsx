// src/pages/Member/ProfileUpdate.jsx
import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import useAuth from '../../hooks/useAuth';
import api from '../../services/Api';
import { useNavigate } from 'react-router-dom';

import { translateBloodType } from '../../utils/translationUtils';
// Import dữ liệu quận/huyện và phường/xã từ file riêng
import { districtsData, wardsData } from '../../components/Data/hcm-address-data';

// Dữ liệu tỉnh, đường/phố, nhóm máu, giới tính, Rh...
const provinces = [
  { code: '79', name: 'TP. Hồ Chí Minh' },
];

const bloodTypes = [
  { id: 1, name: 'A+', displayName: translateBloodType('A+') },
  { id: 2, name: 'A-', displayName: translateBloodType('A-') },
  { id: 3, name: 'B+', displayName: translateBloodType('B+') },
  { id: 4, name: 'B-', displayName: translateBloodType('B-') },
  { id: 5, name: 'O+', displayName: translateBloodType('O+') },
  { id: 6, name: 'O-', displayName: translateBloodType('O-') },
  { id: 7, name: 'AB+', displayName: translateBloodType('AB+') },
  { id: 8, name: 'AB-', displayName: translateBloodType('AB-') }
];

const genders = [
  { value: 'Male', label: 'Nam' }, { value: 'Female', label: 'Nữ' }, { value: 'Other', label: 'Khác' }
];
const rhFactors = [
  { value: 'Positive', label: 'RH+' },
  { value: 'Negative', label: 'RH-' }
];
const genderMap = {
  Male: 'Nam',
  Female: 'Nữ',
  Other: 'Khác'
};

const MEDICAL_OPTIONS = [
  "Viêm gan B/C",
  "HIV/AIDS",
  "Bệnh tim mạch",
  "Tiểu đường",
  "Cao huyết áp",
  "Ung thư",
  "Đang mang thai",
  "Đang dùng thuốc chống đông máu",
  "Khác"
];



function CreateProfile({ onClose }) { 
  const { user, isAuthenticated } = useAuth(); 
  const navigate = useNavigate(); // Thêm dòng này
  const [formData, setFormData] = useState({
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
    houseNumber: '', 
  });
  const [loading, setLoading] = useState(true); 
  const [submitting, setSubmitting] = useState(false); 
  const [error, setError] = useState(''); 
  const [message, setMessage] = useState(''); 
  const [fieldErrors, setFieldErrors] = useState({}); 
  const [isCreateMode, setIsCreateMode] = useState(false); 

  const [provinceCode, setProvinceCode] = useState('');
  const [districtCode, setDistrictCode] = useState('');
  const [wardName, setWardName] = useState(''); 
  
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');

  const [medicalChecks, setMedicalChecks] = useState([]);
  const [otherMedical, setOtherMedical] = useState('');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i).sort((a,b) => b - a);
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));


  // SỬA LỖI: fetchProfile phải nằm ngoài try-catch
  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated || !user?.userId) { 
      setLoading(false);
      setError('Vui lòng đăng nhập để xem và cập nhật hồ sơ.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      // 1. Lấy profile hiện tại
      const res = await api.get(`/UserProfile/by-user/${user.userId}`);
      let profile = res.data;

      // 2. Lấy lịch sử hiến máu, lọc các lần 'Complete' hoặc 'Certificated'
      let latestDonationDate = '';
      try {
        const historyRes = await api.get(`/DonationHistory/by-donor/${user.userId}`);
        if (Array.isArray(historyRes.data)) {
          const completed = historyRes.data.filter(
            h => (
              (h.status === 'Complete' || h.status === 'Certificated')
              && h.donationDate
            )
          );
          if (completed.length > 0) {
            const latest = completed.reduce((a, b) =>
              new Date(a.donationDate) > new Date(b.donationDate) ? a : b
            );
            latestDonationDate = latest.donationDate.split('T')[0];
          }
        }
      } catch {}

      // 3. Luôn cập nhật lại profile bằng API PUT, lấy tất cả thông tin hiện tại + ngày hiến máu gần nhất
      const payload = {
        userId: user.userId,
        fullName: profile?.fullName || '',
        dateOfBirth: profile?.dateOfBirth || '',
        gender:
          profile?.gender === 'Nam' || profile?.gender === 'Nữ' || profile?.gender === 'Khác'
            ? profile?.gender
            : (profile?.gender?.toLowerCase() === 'male'
                ? 'Nam'
                : profile?.gender?.toLowerCase() === 'female'
                  ? 'Nữ'
                  : profile?.gender?.toLowerCase() === 'other'
                    ? 'Khác'
                    : ''),
        address: profile?.address || '',
        latitude: profile?.latitude !== null && profile?.latitude !== undefined ? profile.latitude : null,
        longitude: profile?.longitude !== null && profile?.longitude !== undefined ? profile.longitude : null,
        bloodTypeId: profile?.bloodTypeId ? profile.bloodTypeId : null,
        rhFactor: profile?.rhFactor === 'Positive' ? 'Positive' : profile?.rhFactor === 'Negative' ? 'Negative' : '',
        medicalHistory: profile?.medicalHistory || '',
        lastBloodDonationDate: latestDonationDate,
        cccd: profile?.cccd || '',
        phoneNumber: profile?.phoneNumber || '',
      };
      await api.put(`/UserProfile/by-user/${user.userId}`, payload);

      // 4. Reload lại profile sau khi cập nhật
      try {
        const updatedRes = await api.get(`/UserProfile/by-user/${user.userId}`);
        profile = updatedRes.data;
      } catch {}

      if (profile) {
        if (profile.dateOfBirth) {
          const [year, month, day] = profile.dateOfBirth.split('T')[0].split('-');
          setBirthDay(day);
          setBirthMonth(month);
          setBirthYear(year);
        } else {
          setBirthDay(''); setBirthMonth(''); setBirthYear('');
        }

        if (profile.address) {
          const parts = profile.address.split(',').map(s => s.trim());
          let foundHouseNumber = '';
          let foundWard = '';
          let foundDistrict = '';
          let foundProvince = '';

          if (parts.length >= 5) {
            foundHouseNumber = parts[0];
            foundWard = parts[2];
            foundDistrict = parts[3];
            foundProvince = parts[4];
          } else if (parts.length === 4) { 
            foundWard = parts[1];
            foundDistrict = parts[2];
            foundProvince = parts[3];
          }
          const p = provinces.find(p => p.name === foundProvince);
          if (p) setProvinceCode(p.code);
          const d = districtsData[p?.code]?.find(d => d.name === foundDistrict);
          if (d) setDistrictCode(d.code);
          setWardName(foundWard); 
          setFormData(prev => ({ ...prev, houseNumber: foundHouseNumber }));
        }

        setFormData(prev => ({
          ...prev,
          fullName: profile.fullName || '',
          dateOfBirth: profile.dateOfBirth || '', 
          gender:
            profile.gender === 'Nam' || profile.gender === 'Nữ' || profile.gender === 'Khác'
              ? profile.gender
              : (profile.gender?.toLowerCase() === 'male'
                  ? 'Nam'
                  : profile.gender?.toLowerCase() === 'female'
                    ? 'Nữ'
                    : profile.gender?.toLowerCase() === 'other'
                      ? 'Khác'
                      : ''),
          address: profile.address || '',
          latitude: profile.latitude !== null && profile.latitude !== undefined ? String(profile.latitude) : '',
          longitude: profile.longitude !== null && profile.longitude !== undefined ? String(profile.longitude) : '',
          bloodTypeId: profile.bloodTypeId ? String(profile.bloodTypeId) : '', 
          rhFactor: profile.rhFactor === 'Positive' ? 'Positive' : profile.rhFactor === 'Negative' ? 'Negative' : '',
          medicalHistory: profile.medicalHistory || '',
          lastBloodDonationDate: latestDonationDate,
          cccd: profile.cccd || '',
          phoneNumber: profile.phoneNumber || '',
        }));
        setIsCreateMode(false);
      } else { 
        setIsCreateMode(true);
        setFormData({ 
          fullName: '', dateOfBirth: '', gender: '', address: '',
          latitude: '', longitude: '', bloodTypeId: '', rhFactor: '',
          medicalHistory: '', lastBloodDonationDate: '', cccd: '', phoneNumber: '',
          houseNumber: '', 
        });
        setProvinceCode(''); setDistrictCode(''); setWardName(''); 
        setBirthDay(''); setBirthMonth(''); setBirthYear('');
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setIsCreateMode(true);
        setFormData({ 
          fullName: '', dateOfBirth: '', gender: '', address: '',
          latitude: '', longitude: '', bloodTypeId: '', rhFactor: '',
          medicalHistory: '', lastBloodDonationDate: '', cccd: '', phoneNumber: '',
          houseNumber: '', 
        });
        setProvinceCode(''); setDistrictCode(''); setWardName(''); 
        setBirthDay(''); setBirthMonth(''); setBirthYear('');
        setError('');
      } else {
        console.error('Error fetching profile:', err);
        setError('Lỗi khi tải thông tin hồ sơ. Vui lòng thử lại.');
        setIsCreateMode(true); 
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.userId]); // SỬA ĐỔI: Dùng user?.userId cho dependencies

  useEffect(() => {
      fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); 
    setMessage(''); 
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const buildAddress = useCallback(() => {
    const provinceName = provinces.find(p => p.code === provinceCode)?.name || '';
    const districtName = districtsData[provinceCode]?.find(d => d.code === districtCode)?.name || '';
    const wardNameVal = wardsData[districtCode]?.find(w => w.name === wardName)?.name || wardName || '';

    let addrParts = [];
    if (formData.houseNumber?.trim()) addrParts.push(formData.houseNumber.trim());
    if (wardNameVal?.trim()) addrParts.push(wardNameVal.trim());
    if (districtName?.trim()) addrParts.push(districtName.trim());
    if (provinceName?.trim()) addrParts.push(provinceName.trim());

    return addrParts.join(', ');
  }, [formData.houseNumber, wardName, districtCode, provinceCode]);

  const fetchLatLngFromAddress = async (address) => {
    if (!address) return { lat: null, lng: null };
    if (address.includes('Hà Nội')) return { lat: '21.0285', lng: '105.8542' };
    if (address.includes('Hồ Chí Minh')) return { lat: '10.7769', lng: '106.7009' };
    return { lat: null, lng: null }; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    setFieldErrors({}); 

    const currentErrors = {};

    if (!formData.fullName.trim()) {
      currentErrors.fullName = 'Họ và tên là bắt buộc.';
    }
    // Bỏ kiểm tra streetName, chỉ kiểm tra tỉnh, quận, phường
    if (!provinceCode || !districtCode || !wardName) {
      currentErrors.address = 'Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã.';
    }
    if (formData.phoneNumber && !/^(\+84|0)?[0-9]{9,10}$/.test(formData.phoneNumber)) { 
      currentErrors.phoneNumber = 'Số điện thoại không hợp lệ (ví dụ: 0912345678 hoặc +84912345678).';
    }
    if (formData.cccd && !/^\d{12}$/.test(formData.cccd)) {
      currentErrors.cccd = 'CCCD phải chứa đúng 12 chữ số.';
    }

    const dateOfBirthCombined = (birthYear && birthMonth && birthDay)
        ? `${birthYear}-${birthMonth}-${birthDay}`
        : null; 

    if (dateOfBirthCombined) {
        try {
            const dobDate = new Date(dateOfBirthCombined);
            const todayDate = new Date();
            todayDate.setHours(0,0,0,0); 

            if (dobDate > todayDate) {
                currentErrors.dateOfBirth = 'Ngày sinh không được lớn hơn ngày hiện tại.';
            }
            const age = currentYear - parseInt(birthYear);
            if (age < 0 || age > 100) {
                 currentErrors.dateOfBirth = 'Tuổi phải lớn hơn 0 và nhỏ hơn 100 .';
            }

        } catch (e) {
            currentErrors.dateOfBirth = 'Ngày sinh không hợp lệ.';
        }
    } else {
        if (birthDay || birthMonth || birthYear) { 
            currentErrors.dateOfBirth = 'Vui lòng chọn đầy đủ Ngày, Tháng, Năm sinh.';
        }
    }
    
    setFieldErrors(currentErrors);

    if (Object.keys(currentErrors).length > 0) {
      setError('Vui lòng kiểm tra lại các thông tin bị lỗi.');
      setSubmitting(false);
      return;
    }


    const finalAddress = buildAddress();
    const { lat, lng } = await fetchLatLngFromAddress(finalAddress);

    const payload = {
      userId: user.userId,
      fullName: formData.fullName.trim(),
      dateOfBirth: dateOfBirthCombined,
      gender: genderMap[formData.gender] || null, // Map FE value sang BE value
      address: finalAddress || null,
      latitude: lat !== null ? parseFloat(lat) : null,
      longitude: lng !== null ? parseFloat(lng) : null,
      bloodTypeId: formData.bloodTypeId ? parseInt(formData.bloodTypeId) : null,
      rhFactor: formData.rhFactor || null,
      medicalHistory: formData.medicalHistory || null,
      // lastBloodDonationDate bị bỏ qua - chỉ được cập nhật tự động từ hệ thống
      cccd: formData.cccd.trim() || null,
      phoneNumber: formData.phoneNumber.trim() || null,
    };

    try {
      if (isCreateMode) {
        await api.post(`/UserProfile`, payload); // Tạo mới
      } else {
        await api.put(`/UserProfile/by-user/${user.userId}`, payload); // Cập nhật
      }
      setMessage(isCreateMode ? 'Hồ sơ của bạn đã được tạo thành công!' : 'Hồ sơ của bạn đã được cập nhật thành công!');
      setIsCreateMode(false); 

      fetchProfile(); 
      if (onClose) onClose(); 

      // Nếu cập nhật xong thì về trang chủ
      if (!isCreateMode) {
        setTimeout(() => {
          navigate('/');
        }, 1000); // Đợi 1s để hiển thị message, có thể chỉnh lại thời gian nếu muốn
      }

    } catch (err) {
      console.error('Error submitting profile:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message); 
      } else {
        setError('Đã xảy ra lỗi khi cập nhật hồ sơ. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Cập nhật medicalChecks và otherMedical từ formData.medicalHistory
  useEffect(() => {
    if (formData.medicalHistory) {
      const arr = formData.medicalHistory.split(',').map(s => s.trim());
      setMedicalChecks(arr.filter(opt => MEDICAL_OPTIONS.includes(opt)));
      if (arr.some(opt => !MEDICAL_OPTIONS.includes(opt))) {
        setOtherMedical(arr.filter(opt => !MEDICAL_OPTIONS.includes(opt)).join(', '));
      } else {
        setOtherMedical('');
      }
    } else {
      setMedicalChecks([]);
      setOtherMedical('');
    }
  }, [formData.medicalHistory]);

  // Cập nhật formData.medicalHistory khi medicalChecks hoặc otherMedical thay đổi
  useEffect(() => {
    let medicalHistoryArray = [...medicalChecks];
    if (otherMedical.trim()) {
      medicalHistoryArray.push(otherMedical.trim());
    }
    const newMedicalHistory = medicalHistoryArray.join(', ');
    
    if (newMedicalHistory !== formData.medicalHistory) {
      setFormData(prev => ({ ...prev, medicalHistory: newMedicalHistory }));
    }
  }, [medicalChecks, otherMedical]);

  if (loading) { 
    return <LoadingSpinner />;
  }
  if (!isAuthenticated || !user?.userId) {
      return (
          <div className="alert alert-danger text-center p-3">
              Bạn cần đăng nhập để xem và cập nhật hồ sơ cá nhân.
          </div>
      );
  }

  const districts = provinceCode ? (districtsData[provinceCode] || []) : [];
  const wards = districtCode ? (wardsData[districtCode] || []) : [];

  return (
    <div className="profile-page-container p-4">
      <h2 className="text-center mb-4 text-primary">{isCreateMode ? 'Tạo Hồ sơ cá nhân' : 'Cập nhật Hồ sơ cá nhân'}</h2>
      <p className="text-center text-muted mb-4">
        Quản lý thông tin cá nhân, y tế và lịch sử hiến máu của bạn.
      </p>

      {/* Nút về trang chủ chỉ hiển thị khi đã có userprofile */}
      {!isCreateMode && (
        <div className="mb-3 text-end">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate('/')}
            type="button"
          >
            &larr; Về trang chủ
          </button>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {/* Hiển thị thông tin profile nếu đã có */}
      {!isCreateMode && (
        <div className="mb-4 text-start">
          <h5>Thông tin hồ sơ cá nhân</h5>
          <ul className="list-group">
            <li className="list-group-item"><strong>Họ và tên:</strong> {formData.fullName}</li>
            <li className="list-group-item"><strong>Số điện thoại:</strong> {formData.phoneNumber}</li>
            <li className="list-group-item"><strong>CCCD/CMND:</strong> {formData.cccd}</li>
            <li className="list-group-item"><strong>Ngày sinh:</strong> {formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}</li>
            <li className="list-group-item"><strong>Giới tính:</strong> {
              formData.gender === 'Male' ? 'Nam' :
              formData.gender === 'Female' ? 'Nữ' :
              formData.gender === 'Other' ? 'Khác' : formData.gender
            }</li>
            <li className="list-group-item"><strong>Địa chỉ:</strong> {formData.address}</li>
            <li className="list-group-item"><strong>Vĩ độ:</strong> {formData.latitude}</li>
            <li className="list-group-item"><strong>Kinh độ:</strong> {formData.longitude}</li>
            <li className="list-group-item"><strong>Nhóm máu:</strong> {bloodTypes.find(b => String(b.id) === formData.bloodTypeId)?.name || ''}</li>
            <li className="list-group-item"><strong>Yếu tố Rh:</strong> {
              formData.rhFactor === 'Positive' ? 'RH+' :
              formData.rhFactor === 'Negative' ? 'RH-' : ''
            }</li>
            <li className="list-group-item"><strong>Lịch sử bệnh án/y tế:</strong> {formData.medicalHistory}</li>
            <li className="list-group-item"><strong>Ngày hiến máu gần nhất:</strong> {formData.lastBloodDonationDate}</li>
          </ul>
          <div className="d-grid gap-2 mt-3">
            <button
              className="btn btn-warning btn-lg"
              onClick={() => navigate('/member/profile/update', { state: { userId: user.userId } })}
            >
              Cập nhật hồ sơ
            </button>
          </div>
        </div>
      )}

      {/* Form tạo/cập nhật hồ sơ */}
      {isCreateMode && (
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="fullName" className="form-label">Họ và tên <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                className={`form-control ${fieldErrors.fullName ? 'is-invalid' : ''}`}
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                disabled={submitting}
                autoFocus
              />
              {fieldErrors.fullName && <div className="invalid-feedback">{fieldErrors.fullName}</div>}
            </div>
            <div className="col-md-6">
              <label htmlFor="phoneNumber" className="form-label">Số điện thoại</label>
              <input
                type="tel"
                className={`form-control ${fieldErrors.phoneNumber ? 'is-invalid' : ''}`}
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                disabled={submitting}
                placeholder="Ví dụ: 0912345678"
              />
              {fieldErrors.phoneNumber && <div className="invalid-feedback">{fieldErrors.phoneNumber}</div>}
            </div>
            <div className="col-md-6">
              <label htmlFor="cccd" className="form-label">CCCD/CMND</label>
              <input
                type="text"
                className={`form-control ${fieldErrors.cccd ? 'is-invalid' : ''}`}
                id="cccd"
                name="cccd"
                value={formData.cccd}
                onChange={handleChange}
                disabled={submitting}
                placeholder="12 số CCCD"
              />
              {fieldErrors.cccd && <div className="invalid-feedback">{fieldErrors.cccd}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label">Ngày sinh</label>
              <div className="d-flex gap-2">
                <select className={`form-select ${fieldErrors.dateOfBirth ? 'is-invalid' : ''}`} value={birthDay} onChange={e => setBirthDay(e.target.value)} disabled={submitting}>
                  <option value="">Ngày</option>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select className={`form-select ${fieldErrors.dateOfBirth ? 'is-invalid' : ''}`} value={birthMonth} onChange={e => setBirthMonth(e.target.value)} disabled={submitting}>
                  <option value="">Tháng</option>
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select className={`form-select ${fieldErrors.dateOfBirth ? 'is-invalid' : ''}`} value={birthYear} onChange={e => setBirthYear(e.target.value)} disabled={submitting}>
                  <option value="">Năm</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              {fieldErrors.dateOfBirth && <div className="invalid-feedback">{fieldErrors.dateOfBirth}</div>}
            </div>
            <div className="col-md-6">
              <label htmlFor="gender" className="form-label">Giới tính</label>
              <select className="form-select" id="gender" name="gender"
                value={formData.gender} onChange={handleChange} disabled={submitting}>
                <option value="">Chọn giới tính</option>
                {genders.map(g => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}

              </select>
            </div>
            {/* Địa chỉ chi tiết */}
            <div className="col-md-6">
              <label className="form-label">Tỉnh/Thành phố <span style={{ color: 'red' }}>*</span></label>
              <select className={`form-select ${fieldErrors.address ? 'is-invalid' : ''}`} value={provinceCode} onChange={e => setProvinceCode(e.target.value)} disabled={submitting}>
                <option value="">Chọn tỉnh/thành</option>
                {provinces.map(p => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </select>
              {fieldErrors.address && <div className="invalid-feedback">{fieldErrors.address}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label">Quận/Huyện <span style={{ color: 'red' }}>*</span></label>
              <select className={`form-select ${fieldErrors.address ? 'is-invalid' : ''}`} value={districtCode} onChange={e => setDistrictCode(e.target.value)} disabled={!provinceCode || submitting}>
                <option value="">Chọn quận/huyện</option>
                {districts.map(d => (
                  <option key={d.code} value={d.code}>{d.name}</option>
                ))}
              </select>
              {fieldErrors.address && <div className="invalid-feedback">{fieldErrors.address}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label">Phường/Xã <span style={{ color: 'red' }}>*</span></label>
              <select className={`form-select ${fieldErrors.address ? 'is-invalid' : ''}`} value={wardName} onChange={e => setWardName(e.target.value)} disabled={!districtCode || submitting}>
                <option value="">Chọn phường/xã</option>
                {wards.map(w => (
                  <option key={w.code} value={w.name}>{w.name}</option>
                ))}
              </select>
              {fieldErrors.address && <div className="invalid-feedback">{fieldErrors.address}</div>}
            </div>
           
           
            {/* Hiển thị địa chỉ đã ghép */}
            <div className="col-12">
              <label className="form-label">Địa chỉ đầy đủ</label>
              <input
                type="text"
                className="form-control"
                value={buildAddress()}
                readOnly
                disabled
                placeholder="Địa chỉ sẽ tự động ghép"
              />
            </div>
           
          
            <div className="col-md-6">
              <label htmlFor="bloodTypeId" className="form-label">Nhóm máu</label>
              <select className={`form-select ${fieldErrors.bloodTypeId ? 'is-invalid' : ''}`} id="bloodTypeId" name="bloodTypeId"
                value={formData.bloodTypeId} onChange={handleChange} disabled={submitting}>
                <option value="">Chọn nhóm máu</option>
                {bloodTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
              </select>
              {fieldErrors.bloodTypeId && <div className="invalid-feedback">{fieldErrors.bloodTypeId}</div>}
            </div>
            <div className="col-md-6">
              <label htmlFor="rhFactor" className="form-label">Yếu tố Rh</label>
              <select className="form-select" id="rhFactor" name="rhFactor"
                value={formData.rhFactor} onChange={handleChange} disabled={submitting}>
                <option value="">Chọn yếu tố Rh</option>
                {rhFactors.map(factor => (
                  <option key={factor.value} value={factor.value}>{factor.label}</option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Lịch sử bệnh án/y tế (nếu có)</label>
              <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="row">
                  {MEDICAL_OPTIONS.map(opt => (
                    <div key={opt} className="col-md-6 col-12 mb-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`medical-${opt}`}
                          checked={medicalChecks.includes(opt)}
                          onChange={e => {
                            if (e.target.checked) {
                              setMedicalChecks(prev => [...prev, opt]);
                            } else {
                              setMedicalChecks(prev => prev.filter(item => item !== opt));
                              // Nếu bỏ chọn "Khác" thì xóa otherMedical
                              if (opt === "Khác") setOtherMedical('');
                            }
                          }}
                          disabled={submitting}
                        />
                        <label className="form-check-label" htmlFor={`medical-${opt}`}>
                          {opt}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                {medicalChecks.includes("Khác") && (
                  <div className="mt-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập thông tin bệnh khác..."
                      value={otherMedical}
                      onChange={e => setOtherMedical(e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <label htmlFor="lastBloodDonationDate" className="form-label">Ngày hiến máu gần nhất</label>
              <input
                type="date"
                className="form-control"
                id="lastBloodDonationDate"
                name="lastBloodDonationDate"
                value={formData.lastBloodDonationDate || ''}
                readOnly
                disabled
                style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
              />
              <small className="text-muted">Thông tin này được cập nhật tự động từ lịch sử hiến máu</small>
            </div>
          </div>
          <div className="d-grid gap-2 mt-4">
            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
              {submitting ? (isCreateMode ? 'Đang tạo...' : 'Đang cập nhật...') : (isCreateMode ? 'Tạo Hồ sơ' : 'Cập nhật Hồ sơ')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default CreateProfile;


// Blood donation themed CSS
const style = document.createElement('style');
style.innerHTML = `
  .profile-page-container {
    background: #fff;
    border-radius: 18px;
    box-shadow: 0 2px 18px rgba(220,53,69,0.13);
    max-width: 900px;
    margin: 32px auto;
    padding: 32px 28px;
    border: 1.5px solid #f3d6db;
  }
  .profile-page-container h2 {
    font-size: 2.1rem;
    font-weight: 800;
    color: #b30000;
    margin-bottom: 28px;
    letter-spacing: 1px;
    text-shadow: 1px 1px 6px #f8d7da;
  }
  .profile-page-container h5 {
    font-size: 1.18rem;
    font-weight: 700;
    color: #b30000;
    margin-bottom: 12px;
    margin-top: 24px;
    letter-spacing: 0.5px;
  }
  .profile-page-container .form-label {
    font-weight: 600;
    color: #b30000;
    margin-bottom: 4px;
  }
  .profile-page-container .form-control, .profile-page-container .form-select {
    border-radius: 8px;
    font-size: 1.05rem;
    background: #fff8f8;
    border: 1.5px solid #f3d6db;
    margin-bottom: 2px;
  }
  .profile-page-container .form-control:focus, .profile-page-container .form-select:focus {
    border-color: #b30000;
    box-shadow: 0 0 0 2px #f8d7da;
  }
  .profile-page-container .btn-primary {
    background: linear-gradient(90deg, #dc3545 0%, #b30000 100%);
    border: none;
    font-weight: 700;
    font-size: 1.08rem;
    border-radius: 8px;
    box-shadow: 0 1px 6px rgba(220,53,69,0.09);
    padding: 0.55em 1.3em;
    transition: background 0.18s, color 0.18s;
  }
  .profile-page-container .btn-primary:hover {
    background: #b30000;
    color: #fff;
  }
  .profile-page-container .btn-warning {
    background: linear-gradient(90deg, #ffc107 0%, #ff9800 100%);
    border: none;
    color: #b30000;
    font-weight: 700;
    border-radius: 8px;
    box-shadow: 0 1px 6px rgba(255,193,7,0.09);
    padding: 0.55em 1.3em;
    transition: background 0.18s, color 0.18s;
  }
  .profile-page-container .btn-warning:hover {
    background: #ff9800;
    color: #fff;
  }
  .profile-page-container .btn-outline-secondary {
    border-radius: 8px;
    font-weight: 600;
    font-size: 1.05rem;
    border: 1.5px solid #f3d6db;
    color: #b30000;
    background: #fff8f8;
    transition: background 0.15s, color 0.15s;
  }
  .profile-page-container .btn-outline-secondary:hover {
    background: #f8d7da;
    color: #b30000;
  }
  .profile-page-container .list-group-item {
    font-size: 1.05rem;
    background: #fff8f8;
    border-radius: 8px;
    margin-bottom: 2px;
    border: 1.5px solid #f3d6db;
  }
  .profile-page-container .alert-success {
    border-radius: 8px;
    font-size: 1.08rem;
    font-weight: 500;
    padding: 12px 18px;
    background: #f8d7da;
    color: #b30000;
    border: 1.5px solid #f3d6db;
  }
  .profile-page-container .alert-danger {
    border-radius: 8px;
    font-size: 1.08rem;
    font-weight: 500;
    padding: 12px 18px;
    background: #ffebee;
    color: #b30000;
    border: 1.5px solid #f3d6db;
  }
`;
if (!document.head.querySelector('style[data-profile-page]')) {
  style.setAttribute('data-profile-page', 'true');
  document.head.appendChild(style);
}