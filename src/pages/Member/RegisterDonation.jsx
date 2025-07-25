// src/pages/Member/RegisterDonation.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar'; // Đảm bảo đường dẫn chính xác
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

// Thêm danh sách các bệnh liên quan đến hiến máu
const DONATION_MEDICAL_OPTIONS = [
  "Đang cảm sốt",
  "Đang dùng thuốc kháng sinh",
  "Đang mang thai/cho con bú",
  "Có bệnh truyền nhiễm",
  "Đã phẫu thuật gần đây",
  "Đang điều trị bệnh mãn tính",
  "Khác"
];

function RegisterDonation() {
  const bloodTypes = [
    { id: 1, name: 'A+' }, { id: 2, name: 'A-' },
    { id: 3, name: 'B+' }, { id: 4, name: 'B-' },
    { id: 5, name: 'O+' }, { id: 6, name: 'O-' },
    { id: 7, name: 'AB+' }, { id: 8, name: 'AB-' },
  ];

  const { user, isAuthenticated } = useAuth(); 
  const [formData, setFormData] = useState({
    bloodTypeId: '',
    preferredDate: '',
    preferredTimeSlot: '',
    staffNotes: '',
  });
  const [loading, setLoading] = useState(false); // Dùng cho loading khi submit form
  const [error, setError] = useState(''); // Lỗi từ API sau khi submit
  const [message, setMessage] = useState(''); // Thông báo thành công sau khi submit
  
  const [fieldErrors, setFieldErrors] = useState({}); // Lỗi cụ thể của từng trường (chỉ hiển thị sau submit)
  const [generalError, setGeneralError] = useState(''); // Lỗi chung (tuổi, lịch sử từ chối, 90 ngày) (chỉ hiển thị sau submit)

  const [slotCounts, setSlotCounts] = useState({});
  const [disabledSlots, setDisabledSlots] = useState([]);
  const [disabledDates, setDisabledDates] = useState([]); 
  
  const [profile, setProfile] = useState(null);
  const [hasRejectedHistory, setHasRejectedHistory] = useState(false);
  // BỎ: const [hasRejectedRequest, setHasRejectedRequest] = useState(false); 
  const [isProfileDataLoading, setIsProfileDataLoading] = useState(true); // Trạng thái loading riêng cho profile/history
  
  const [hasSubmitted, setHasSubmitted] = useState(false); // State để kiểm soát hiển thị lỗi sau khi submit

  const [donationMedicalChecks, setDonationMedicalChecks] = useState([]);
  const [donationOtherMedical, setDonationOtherMedical] = useState('');

  const today = new Date().toISOString().split('T')[0];

  // Fetch slot counts for the selected date
  useEffect(() => {
    if (formData.preferredDate) {
      setLoading(true); 
      api.get(`/DonationRequest/SlotCounts?date=${formData.preferredDate}`)
        .then(res => {
          setSlotCounts(res.data || {});
          const fullSlots = TIME_SLOTS.filter(slot => (res.data?.[slot] || 0) >= MAX_PER_SLOT);
          setDisabledSlots(fullSlots);
          if (fullSlots.length === TIME_SLOTS.length) {
            setDisabledDates(prev => [...new Set([...prev, formData.preferredDate])]);
          } else {
            setDisabledDates(prev => prev.filter(date => date !== formData.preferredDate));
          }
        })
        .catch((err) => {
          console.error("Error fetching slot counts:", err);
          setError('Không thể tải thông tin khung giờ. Vui lòng thử lại sau.');
          setSlotCounts({});
          setDisabledSlots([]);
          setDisabledDates([]);
        })
        .finally(() => {
          setLoading(false); 
        });
    } else {
      setSlotCounts({});
      setDisabledSlots([]);
      setDisabledDates([]);
    }
  }, [formData.preferredDate]);

  // Fetch user profile and donation history (BỎ DonationRequest) for validation
  const fetchUserData = useCallback(async () => {
    if (isAuthenticated && user?.userId) { 
      setIsProfileDataLoading(true);
      try {
        const [profileRes, historyRes] = await Promise.all([
          api.get(`/UserProfile/by-user/${user.userId}`),
          api.get(`/DonationHistory/by-donor/${user.userId}`).catch(err => {
            if (err.response && err.response.status === 404) return { data: [] }; // Nếu 404 thì coi như chưa có lịch sử
            throw err;
          }),
        ]);
        // Gán lịch sử vào profile để validation không lỗi
        setProfile({ ...profileRes.data, donationHistory: historyRes.data || [] });

        const rejectedHistory = (historyRes.data || []).some(h => h.status === 'Rejected');
        setHasRejectedHistory(rejectedHistory);
      } catch (err) {
        console.error("Error fetching user data for validation:", err);
        setProfile(null); 
        setHasRejectedHistory(false);
        setGeneralError("Không thể tải thông tin cá nhân hoặc lịch sử hiến máu để kiểm tra điều kiện. Vui lòng kiểm tra kết nối mạng.");
      } finally {
        setIsProfileDataLoading(false);
      }
    } else {
      setProfile(null);
      setHasRejectedHistory(false);
      setGeneralError('');
      setIsProfileDataLoading(false);
    }
  }, [isAuthenticated, user?.userId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Hàm performValidation (BỔ SUNG kiểm tra nhóm máu)
  const performValidation = useCallback(() => {
    const errs = {};
    let currentGeneralError = '';

    // Kiểm tra trạng thái tải dữ liệu profile
    if (isProfileDataLoading) {
      currentGeneralError = 'Đang tải thông tin điều kiện hiến máu... Vui lòng đợi.';
    } else if (
      profile === null ||
      (
        (profile.dob === null || profile.dob === undefined || profile.dob === '') &&
        (profile.dateOfBirth === null || profile.dateOfBirth === undefined || profile.dateOfBirth === '')
      )
    ) {
      currentGeneralError = generalError || 'Vui lòng cập nhật ngày sinh trong hồ sơ để kiểm tra điều kiện hiến máu.';
    } else {
      // Kiểm tra tuổi (từ 18 đến 60)
      const dobStr = profile.dob || profile.dateOfBirth;
      const dob = new Date(dobStr);
      const now = new Date();
      let age = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
        age--;
      }
      if (age < 18 || age > 60) {
        currentGeneralError = 'Bạn phải từ 18 đến 60 tuổi mới được đăng ký hiến máu.';
      }

      // Kiểm tra khoảng cách 90 ngày giữa 2 lần hiến máu (dựa vào lịch sử hiến máu)
      if (!currentGeneralError && formData.preferredDate && !isProfileDataLoading) {
        // Lấy ngày hiến máu gần nhất từ lịch sử (status Completed)
        let lastDonationDate = null;
        if (Array.isArray(profile?.donationHistory)) {
          const completed = profile.donationHistory
            .filter(h => h.status === 'Completed')
            .sort((a, b) => new Date(b.donationDate) - new Date(a.donationDate));
          if (completed.length > 0) {
            lastDonationDate = new Date(completed[0].donationDate);
          }
        }
        // Nếu không có trong profile, thử lấy từ historyRes (nếu bạn lưu riêng)
        // Nếu profile.lastBloodDonationDate có, ưu tiên dùng
        if (!lastDonationDate && profile?.lastBloodDonationDate) {
          lastDonationDate = new Date(profile.lastBloodDonationDate);
        }

        if (lastDonationDate) {
          const next = new Date(formData.preferredDate);
          const diffDays = Math.floor((next - lastDonationDate) / (1000 * 60 * 60 * 24));
          if (diffDays < 90) {
            currentGeneralError = `Bạn cần chờ ít nhất 90 ngày giữa 2 lần hiến máu. Lần gần nhất: ${lastDonationDate.toLocaleDateString('vi-VN')}.`;
          }
        }
      }

      // Kiểm tra lịch sử bị từ chối
      if (hasRejectedHistory && !currentGeneralError) {
        currentGeneralError = 'Bạn đã từng bị từ chối hiến máu, không thể đăng ký hiến máu mới. Vui lòng liên hệ với bệnh viện để biết thêm chi tiết.';
      }
    }

    // Validation các trường form
    if (!formData.bloodTypeId) errs.bloodTypeId = 'Vui lòng chọn nhóm máu.';

    // BỔ SUNG: Kiểm tra nhóm máu đăng ký phải trùng với nhóm máu trong profile
    if (
      formData.bloodTypeId &&
      profile &&
      (profile.bloodTypeId || profile.bloodTypeID || profile.blood_type_id)
    ) {
      // Lấy bloodTypeId từ profile (tùy theo BE trả về)
      const profileBloodTypeId =
        profile.bloodTypeId || profile.bloodTypeID || profile.blood_type_id;
      if (parseInt(formData.bloodTypeId) !== parseInt(profileBloodTypeId)) {
        errs.bloodTypeId = 'Nhóm máu đăng ký không khớp với nhóm máu trong hồ sơ cá nhân!';
      }
    }

    if (!formData.preferredDate) errs.preferredDate = 'Vui lòng chọn ngày hiến máu.';
    else if (formData.preferredDate < today)
      errs.preferredDate = 'Không được chọn ngày trong quá khứ.';
    if (!formData.preferredTimeSlot) errs.preferredTimeSlot = 'Vui lòng chọn khung giờ.';
    if (formData.preferredTimeSlot && disabledSlots.includes(formData.preferredTimeSlot)) {
      errs.preferredTimeSlot = 'Khung giờ này đã đủ số lượng đăng ký, vui lòng chọn khung giờ khác.';
    }

    return { fieldErrors: errs, generalError: currentGeneralError };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, profile, hasRejectedHistory, disabledSlots, disabledDates, today, isProfileDataLoading, generalError]); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors({}); 
    setError(''); 
    setMessage(''); 
    setGeneralError(''); 
    setHasSubmitted(false); 
  };

  // Reset preferredTimeSlot khi đổi preferredDate
  useEffect(() => {
    setFormData(prev => ({ ...prev, preferredTimeSlot: '' }));
  }, [formData.preferredDate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasSubmitted(true); 
    setError('');
    setMessage('');
    
    const { fieldErrors: currentFieldErrors, generalError: currentGeneralError } = performValidation();
    setFieldErrors(currentFieldErrors); 
    setGeneralError(currentGeneralError); 

    if (Object.keys(currentFieldErrors).length > 0 || currentGeneralError) { 
        console.log("Validation failed on submit:", currentFieldErrors, currentGeneralError);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return; 
    }

    if (!isAuthenticated || !user?.userId) { // SỬA ĐỔI: Dùng user?.userId
      setError('Bạn cần đăng nhập để đăng ký hiến máu.');
      return;
    }

    setLoading(true); 
    try {
      const payload = {
        donorUserId: user.userId, // SỬA ĐỔI: Dùng user.userId
        bloodTypeId: parseInt(formData.bloodTypeId),
        componentId: 1, 
        preferredDate: formData.preferredDate,
        preferredTimeSlot: formData.preferredTimeSlot,
        status: "Pending", 
        staffNotes: formData.staffNotes
      };

      // Khi submit, bạn có thể xử lý lưu thông tin này vào staffNotes hoặc trường riêng:
      const staffNotesValue = [
        ...donationMedicalChecks.filter(opt => opt !== "Khác"),
        ...(donationMedicalChecks.includes("Khác") && donationOtherMedical ? [donationOtherMedical] : [])
      ].join(', ');

      await api.post('/DonationRequest/RegisterDonationRequest', { ...payload, staffNotes: staffNotesValue });
      setMessage('Yêu cầu hiến máu của bạn đã được gửi thành công! Bạn sẽ nhận được thông báo về trạng thái yêu cầu.');
      
      setFormData({ 
        bloodTypeId: '',
        preferredDate: '',
        preferredTimeSlot: '',
        staffNotes: '',
      });
      setFieldErrors({}); 
      setGeneralError(''); 
      setHasSubmitted(false); 

      if (formData.preferredDate) {
        api.get(`/DonationRequest/SlotCounts?date=${formData.preferredDate}`)
          .then(res => {
            setSlotCounts(res.data || {});
            setDisabledSlots(TIME_SLOTS.filter(slot => (res.data?.[slot] || 0) >= MAX_PER_SLOT));
          })
          .catch(err => console.error("Error re-fetching slot counts after submission:", err));
      }
      fetchUserData(); 

    } catch (err) {
      console.error("Error submitting donation request:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError('Phiên đăng nhập đã hết hạn hoặc bạn không có quyền.');
      } else {
        setError('Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false); 
    }
  };

  const isFormDisabledDueToLoading = loading; 

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
          
          {isProfileDataLoading && !hasSubmitted && <div className="alert alert-info">Đang kiểm tra điều kiện hiến máu...</div>}
          {(!isProfileDataLoading || hasSubmitted) && generalError && <div className="alert alert-danger">{generalError}</div>}


          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="mb-3">
              <label htmlFor="bloodTypeId" className="form-label">Nhóm máu <span style={{color:'red'}}>*</span></label>
              <select
                className={`form-select ${hasSubmitted && fieldErrors.bloodTypeId ? 'is-invalid' : ''}`} 
                id="bloodTypeId"
                name="bloodTypeId"
                value={formData.bloodTypeId}
                onChange={handleChange}
                required
                disabled={isFormDisabledDueToLoading || isProfileDataLoading}
              >
                <option value="">Chọn nhóm máu</option>
                {bloodTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              {hasSubmitted && fieldErrors.bloodTypeId && <div className="invalid-feedback">{fieldErrors.bloodTypeId}</div>} 
            </div>

            <div className="mb-3">
              <label htmlFor="preferredDate" className="form-label">Ngày hiến máu mong muốn <span style={{color:'red'}}>*</span></label>
              <input
                type="date"
                className={`form-control ${hasSubmitted && fieldErrors.preferredDate ? 'is-invalid' : ''}`} 
                id="preferredDate"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                min={today}
                required
                disabled={isFormDisabledDueToLoading || isProfileDataLoading} 
              />
              {hasSubmitted && fieldErrors.preferredDate && <div className="invalid-feedback">{fieldErrors.preferredDate}</div>} 
              {formData.preferredDate && disabledDates.includes(formData.preferredDate) && (
                <div className="text-danger mt-1">Ngày này đã đủ số lượng đăng ký, vui lòng chọn ngày khác.</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="preferredTimeSlot" className="form-label">Khung giờ mong muốn <span style={{color:'red'}}>*</span></label>
              <select
                className={`form-select ${hasSubmitted && fieldErrors.preferredTimeSlot ? 'is-invalid' : ''}`} 
                id="preferredTimeSlot"
                name="preferredTimeSlot"
                value={formData.preferredTimeSlot}
                onChange={handleChange}
                required
                disabled={isFormDisabledDueToLoading || isProfileDataLoading || !formData.preferredDate || disabledDates.includes(formData.preferredDate)}
              >
                <option value="">Chọn khung giờ</option>
                {TIME_SLOTS.map(slot => (
                  <option
                    key={slot}
                    value={slot}
                    disabled={disabledSlots.includes(slot)} 
                  >
                   {slot} {slotCounts[slot] !== undefined ? `(${slotCounts[slot]}/${MAX_PER_SLOT})` : ''} 
                   {disabledSlots.includes(slot) ? ' - Đã đầy' : ''}
                  </option>
                ))}
              </select>
              {hasSubmitted && fieldErrors.preferredTimeSlot && <div className="invalid-feedback">{fieldErrors.preferredTimeSlot}</div>} 
            </div>

            <div className="mb-3">
              <label className="form-label">Các yếu tố/bệnh liên quan đến hiến máu (chọn nếu có)</label>
              <div className="d-flex flex-wrap gap-3">
                {DONATION_MEDICAL_OPTIONS.map(opt => (
                  <div key={opt} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`donation-medical-${opt}`}
                      value={opt}
                      checked={donationMedicalChecks.includes(opt)}
                      onChange={e => {
                        if (e.target.checked) {
                          setDonationMedicalChecks([...donationMedicalChecks, opt]);
                        } else {
                          setDonationMedicalChecks(donationMedicalChecks.filter(item => item !== opt));
                          if (opt === "Khác") setDonationOtherMedical('');
                        }
                      }}
                      disabled={isFormDisabledDueToLoading || isProfileDataLoading}
                    />
                    <label className="form-check-label" htmlFor={`donation-medical-${opt}`}>
                      {opt}
                    </label>
                  </div>
                ))}
              </div>
              {donationMedicalChecks.includes("Khác") && (
                <input
                  type="text"
                  className="form-control mt-2"
                  placeholder="Nhập yếu tố/bệnh khác..."
                  value={donationOtherMedical}
                  onChange={e => setDonationOtherMedical(e.target.value)}
                  disabled={isFormDisabledDueToLoading || isProfileDataLoading}
                />
              )}
              <small className="text-muted">Nếu không có, hãy để trống.</small>
            </div>

            <button type="submit" className="btn btn-danger btn-lg w-100" disabled={isFormDisabledDueToLoading || isProfileDataLoading}>
              {loading ? 'Đang gửi...' : 'Gửi yêu cầu hiến máu'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
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