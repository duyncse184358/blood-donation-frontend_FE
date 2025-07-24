import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/Api';

// Import các component layout
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';

// Import dữ liệu địa chỉ từ file riêng
import { districtsData, wardsData } from '../../components/Data/hcm-address-data';

const provinces = [{ code: '79', name: 'TP. Hồ Chí Minh' }];

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
const genders = [
  { value: 'Male', label: 'Nam' },
  { value: 'Female', label: 'Nữ' },
  { value: 'Other', label: 'Khác' }
];
const rhFactors = ['Rh+', 'Rh-'];
const genderMap = { Male: 'Nam', Female: 'Nữ', Other: 'Khác' };

// Thêm danh sách lựa chọn bệnh án/y tế
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

function UpdateProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [provinceCode, setProvinceCode] = useState('');
  const [districtCode, setDistrictCode] = useState('');
  const [wardName, setWardName] = useState('');
  // XÓA streetName vì không dùng nữa
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [medicalChecks, setMedicalChecks] = useState([]);
  const [otherMedical, setOtherMedical] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = location.state?.userId;
        if (!userId) {
          setError('Không tìm thấy hồ sơ để cập nhật.');
          setLoading(false);
          return;
        }
        const res = await api.get(`/UserProfile/by-user/${userId}`);
        if (res.data) {
          const profile = res.data;
          // Parse ngày sinh
          if (profile.dateOfBirth) {
            const [year, month, day] = profile.dateOfBirth.split('T')[0].split('-');
            setBirthDay(day);
            setBirthMonth(month);
            setBirthYear(year);
          }
          // Parse địa chỉ
          if (profile.address) {
            const parts = profile.address.split(',').map(s => s.trim());
            let foundHouseNumber = '';
            let foundWard = '';
            let foundDistrict = '';
            let foundProvince = '';
            if (parts.length >= 4) {
              if (parts.length === 5) {
                foundHouseNumber = parts[0];
                foundWard = parts[2];
                foundDistrict = parts[3];
                foundProvince = parts[4];
              } else if (parts.length === 4) {
                foundWard = parts[1];
                foundDistrict = parts[2];
                foundProvince = parts[3];
              }
            }
            const p = provinces.find(p => p.name === foundProvince);
            if (p) setProvinceCode(p.code);
            const d = districtsData[p?.code]?.find(d => d.name === foundDistrict);
            if (d) setDistrictCode(d.code);
            setWardName(foundWard);
            setHouseNumber(foundHouseNumber);
          }
          setFormData(profile);
        }
      } catch (err) {
        setError('Không thể tải thông tin hồ sơ.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [location.state]);

  // Build lại địa chỉ đầy đủ (KHÔNG dùng streetName/streetNameVal)
  const buildAddress = () => {
    const provinceName = provinces.find(p => p.code === provinceCode)?.name || '';
    const districtName = districtsData[provinceCode]?.find(d => d.code === districtCode)?.name || '';
    const wardNameVal = wardsData[districtCode]?.find(w => w.name === wardName)?.name || wardName || '';
    let addrParts = [];
    if (houseNumber?.trim()) addrParts.push(houseNumber.trim());
    if (wardNameVal?.trim()) addrParts.push(wardNameVal.trim());
    if (districtName?.trim()) addrParts.push(districtName.trim());
    if (provinceName?.trim()) addrParts.push(provinceName.trim());
    return addrParts.join(', ');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Hàm lấy lat/lng từ địa chỉ (có thể dùng Google Maps API hoặc Nominatim)
  async function fetchLatLngFromAddress(address) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: data[0].lat,
          lng: data[0].lon,
        };
      }
      return { lat: null, lng: null };
    } catch {
      return { lat: null, lng: null };
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    setFieldErrors({});

    // Validate các trường cần thiết trước khi gửi
    if (!formData.fullName || !formData.gender) {
      setError('Vui lòng nhập đầy đủ họ tên và giới tính.');
      setSubmitting(false);
      return;
    }
    // Validate tuổi
    if (formData.dateOfBirth) {
      const birthYear = parseInt(formData.dateOfBirth.split('-')[0], 10);
      const nowYear = new Date().getFullYear();
      const age = nowYear - birthYear;
      if (isNaN(age) || age <= 0 || age > 100) {
        setError('Tuổi phải lớn hơn 0 và nhỏ hơn hoặc bằng 100.');
        setSubmitting(false);
        return;
      }
    }

    const finalAddress = buildAddress();

    // Lấy lat/lng từ địa chỉ mới
    const { lat, lng } = await fetchLatLngFromAddress(finalAddress);

    // Khi submit, lưu medicalHistory đúng định dạng:
    const medicalHistoryValue = [
      ...medicalChecks.filter(opt => opt !== "Khác"),
      ...(medicalChecks.includes("Khác") && otherMedical ? [otherMedical] : [])
    ].join(', ');

    const payload = {
      ...formData,
      address: finalAddress,
      latitude: lat ? parseFloat(lat) : null,
      longitude: lng ? parseFloat(lng) : null,
      gender: genderMap[formData.gender] || null,
      medicalHistory: medicalHistoryValue,
    };

    try {
      await api.put(`/UserProfile/by-user/${formData.userId}`, payload);
      setMessage('Cập nhật hồ sơ thành công!');
      setTimeout(() => navigate('/member/dashboard'), 5000);
    } catch (err) {
      setSubmitting(false);
      const validationErrors = err.response?.data?.errors;
      if (validationErrors) {
        const newFieldErrors = {};
        validationErrors.forEach(error => {
          const field = error.field || error.param;
          newFieldErrors[field] = error.msg;
        });
        setFieldErrors(newFieldErrors);
      } else {
        setError(
          err.response?.data?.message ||
          'Cập nhật hồ sơ thất bại.'
        );
      }
    }
  };

  // Khi load profile, đồng bộ lại medicalChecks
  useEffect(() => {
    if (formData?.medicalHistory) {
      const arr = formData.medicalHistory.split(',').map(s => s.trim());
      setMedicalChecks(arr.filter(opt => MEDICAL_OPTIONS.includes(opt)));
      setOtherMedical(arr.filter(opt => !MEDICAL_OPTIONS.includes(opt)).join(', '));
    } else {
      setMedicalChecks([]);
      setOtherMedical('');
    }
  }, [formData?.medicalHistory]);

  if (loading) return (
    <>
      <Header />
      <Navbar />
      <div className="container mt-4">Đang tải...</div>
    </>
  );
  if (error) return (
    <>
      <Header />
      <Navbar />
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    </>
  );
  if (!formData) return null;

  return (
    <>
      <Header />
      <Navbar />
      <div className="container mt-4">
        <h2>Cập nhật hồ sơ cá nhân</h2>
        {message && <div className="alert alert-success">{message}</div>}
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="fullName" className="form-label">Họ và tên <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                className={`form-control ${fieldErrors?.fullName ? 'is-invalid' : ''}`}
                id="fullName"
                name="fullName"
                value={formData.fullName || ''}
                onChange={handleChange}
                disabled={submitting}
                autoFocus
              />
              {fieldErrors?.fullName && <div className="invalid-feedback">{fieldErrors.fullName}</div>}
            </div>
            <div className="col-md-6">
              <label htmlFor="phoneNumber" className="form-label">Số điện thoại</label>
              <input
                type="tel"
                className={`form-control ${fieldErrors?.phoneNumber ? 'is-invalid' : ''}`}
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber || ''}
                onChange={handleChange}
                disabled={submitting}
                placeholder="Ví dụ: 0912345678"
              />
              {fieldErrors?.phoneNumber && <div className="invalid-feedback">{fieldErrors.phoneNumber}</div>}
            </div>
            <div className="col-md-6">
              <label htmlFor="cccd" className="form-label">CCCD/CMND</label>
              <input
                type="text"
                className={`form-control ${fieldErrors?.cccd ? 'is-invalid' : ''}`}
                id="cccd"
                name="cccd"
                value={formData.cccd || ''}
                onChange={handleChange}
                disabled={submitting}
                placeholder="12 số CCCD"
              />
              {fieldErrors?.cccd && <div className="invalid-feedback">{fieldErrors.cccd}</div>}
            </div>
            <div className="col-md-6">
              <label htmlFor="dateOfBirth" className="form-label">Ngày sinh</label>
              <input
                type="date"
                className={`form-control ${fieldErrors?.dateOfBirth ? 'is-invalid' : ''}`}
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                onChange={handleChange}
                disabled={submitting}
              />
              {fieldErrors?.dateOfBirth && <div className="invalid-feedback">{fieldErrors.dateOfBirth}</div>}
            </div>
            <div className="col-md-6">
              <label htmlFor="gender" className="form-label">Giới tính <span style={{ color: 'red' }}>*</span></label>
              <select
                className={`form-select ${fieldErrors?.gender ? 'is-invalid' : ''}`}
                id="gender"
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange}
                disabled={submitting}
              >
                <option value="">Chọn giới tính</option>
                {genders.map(g => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
              {fieldErrors?.gender && <div className="invalid-feedback">{fieldErrors.gender}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label">Tỉnh/Thành phố <span style={{ color: 'red' }}>*</span></label>
              <select className="form-select" value={provinceCode} onChange={e => setProvinceCode(e.target.value)} disabled={submitting}>
                <option value="">Chọn tỉnh/thành</option>
                {provinces.map(p => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Quận/Huyện <span style={{ color: 'red' }}>*</span></label>
              <select className="form-select" value={districtCode} onChange={e => setDistrictCode(e.target.value)} disabled={!provinceCode || submitting}>
                <option value="">Chọn quận/huyện</option>
                {(districtsData[provinceCode] || []).map(d => (
                  <option key={d.code} value={d.code}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Phường/Xã <span style={{ color: 'red' }}>*</span></label>
              <select className="form-select" value={wardName} onChange={e => setWardName(e.target.value)} disabled={!districtCode || submitting}>
                <option value="">Chọn phường/xã</option>
                {(wardsData[districtCode] || []).map(w => (
                  <option key={w.code} value={w.name}>{w.name}</option>
                ))}
              </select>
            </div>
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
              <select
                className={`form-select ${fieldErrors?.bloodTypeId ? 'is-invalid' : ''}`}
                id="bloodTypeId"
                name="bloodTypeId"
                value={formData.bloodTypeId || ''}
                onChange={handleChange}
                disabled={submitting}
              >
                <option value="">Chọn nhóm máu</option>
                {bloodTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              {fieldErrors?.bloodTypeId && <div className="invalid-feedback">{fieldErrors.bloodTypeId}</div>}
            </div>
            <div className="col-md-6">
              <label htmlFor="rhFactor" className="form-label">Yếu tố Rh</label>
              <select
                className="form-select"
                id="rhFactor"
                name="rhFactor"
                value={formData.rhFactor || ''}
                onChange={handleChange}
                disabled={submitting}
              >
                <option value="">Chọn yếu tố Rh</option>
                {rhFactors.map(factor => (
                  <option key={factor} value={factor}>{factor}</option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Lịch sử bệnh án/y tế (nếu có)</label>
              <div className="d-flex flex-wrap gap-3">
                {MEDICAL_OPTIONS.map(opt => (
                  <div key={opt} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`medical-${opt}`}
                      value={opt}
                      checked={medicalChecks.includes(opt)}
                      onChange={e => {
                        if (e.target.checked) {
                          setMedicalChecks([...medicalChecks, opt]);
                        } else {
                          setMedicalChecks(medicalChecks.filter(item => item !== opt));
                          if (opt === "Khác") setOtherMedical('');
                        }
                      }}
                      disabled={submitting}
                    />
                    <label className="form-check-label" htmlFor={`medical-${opt}`}>
                      {opt}
                    </label>
                  </div>
                ))}
              </div>
              {medicalChecks.includes("Khác") && (
                <input
                  type="text"
                  className="form-control mt-2"
                  placeholder="Nhập bệnh khác..."
                  value={otherMedical}
                  onChange={e => setOtherMedical(e.target.value)}
                  disabled={submitting}
                />
              )}
              <small className="text-muted">Nếu không có, hãy để trống.</small>
            </div>
            <div className="col-md-6">
              <label htmlFor="lastBloodDonationDate" className="form-label">Ngày hiến máu gần nhất</label>
              <input
                type="text"
                className="form-control"
                id="lastBloodDonationDate"
                name="lastBloodDonationDate"
                value={
                  formData.lastBloodDonationDate
                    ? new Date(formData.lastBloodDonationDate).toLocaleDateString('vi-VN')
                    : 'Chưa có thông tin'
                }
                readOnly
                style={{
                  backgroundColor: '#f8f9fa',
                  cursor: 'not-allowed',
                }}
              />
            </div>
            <div className="d-grid gap-2 mt-4">
              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                {submitting ? 'Đang cập nhật...' : 'Cập nhật Hồ sơ'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

export default UpdateProfile;