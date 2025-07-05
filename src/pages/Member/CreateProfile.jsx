// src/pages/Member/ProfileUpdate.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Đảm bảo useCallback được import
import LoadingSpinner from '../../components/Shared/LoadingSpinner'; // Đảm bảo đường dẫn đúng
import useAuth from '../../hooks/useAuth';
import api from '../../services/Api';
import { useNavigate } from 'react-router-dom'; // Thêm dòng này ở đầu file

// Dữ liệu tỉnh, quận, phường, đường/phố, nhóm máu, giới tính, Rh...
const provinces = [
  { code: '79', name: 'TP. Hồ Chí Minh' },
];
const districtsData = {
  '79': [
    { code: '760', name: 'Quận 1' },
    { code: '761', name: 'Quận 12' },
    { code: '764', name: 'Quận Gò Vấp' },
    { code: '765', name: 'Quận Bình Thạnh' },
    { code: '766', name: 'Quận Tân Bình' },
    { code: '767', name: 'Quận Tân Phú' },
    { code: '768', name: 'Quận Phú Nhuận' },
    { code: '769', name: 'Thành phố Thủ Đức' },
    { code: '770', name: 'Quận 3' },
    { code: '771', name: 'Quận 10' },
    { code: '772', name: 'Quận 11' },
    { code: '773', name: 'Quận 4' },
    { code: '774', name: 'Quận 5' },
    { code: '775', name: 'Quận 6' },
    { code: '776', name: 'Quận 8' },
    { code: '777', name: 'Quận Bình Tân' },
    { code: '778', name: 'Quận 7' },
    { code: '783', name: 'Huyện Củ Chi' },
    { code: '784', name: 'Huyện Hóc Môn' },
    { code: '785', name: 'Huyện Bình Chánh' },
    { code: '786', name: 'Huyện Nhà Bè' },
    { code: '787', name: 'Huyện Cần Giờ' },
  ]
};
// Danh sách quận/huyện TP. Hồ Chí Minh (đã đầy đủ)
// const districtsData = {
//   '79': [
//     { code: '760', name: 'Quận 1' },
//     { code: '761', name: 'Quận 12' },
//     { code: '764', name: 'Quận Gò Vấp' },
//     { code: '765', name: 'Quận Bình Thạnh' },
//     { code: '766', name: 'Quận Tân Bình' },
//     { code: '767', name: 'Quận Tân Phú' },
//     { code: '768', name: 'Quận Phú Nhuận' },
//     { code: '769', name: 'Thành phố Thủ Đức' },
//     { code: '770', name: 'Quận 3' },
//     { code: '771', name: 'Quận 10' },
//     { code: '772', name: 'Quận 11' },
//     { code: '773', name: 'Quận 4' },
//     { code: '774', name: 'Quận 5' },
//     { code: '775', name: 'Quận 6' },
//     { code: '776', name: 'Quận 8' },
//     { code: '777', name: 'Quận Bình Tân' },
//     { code: '778', name: 'Quận 7' },
//     { code: '783', name: 'Huyện Củ Chi' },
//     { code: '784', name: 'Huyện Hóc Môn' },
//     { code: '785', name: 'Huyện Bình Chánh' },
//     { code: '786', name: 'Huyện Nhà Bè' },
//     { code: '787', name: 'Huyện Cần Giờ' },
//   ]
// };

// Một số phường/xã tiêu biểu cho từng quận (bạn có thể bổ sung thêm)
const wardsData = {
  '760': [ // Quận 1
    { code: '26734', name: 'Tân Định' },
    { code: '26737', name: 'Đa Kao' },
    { code: '26740', name: 'Bến Nghé' },
    { code: '26743', name: 'Bến Thành' },
    { code: '26746', name: 'Nguyễn Thái Bình' },
    { code: '26749', name: 'Phạm Ngũ Lão' },
    { code: '26752', name: 'Cầu Ông Lãnh' },
    { code: '26755', name: 'Cô Giang' },
    { code: '26758', name: 'Nguyễn Cư Trinh' },
    { code: '26761', name: 'Cầu Kho' }
  ],
  '761': [ // Quận 12
    { code: '26764', name: 'Thạnh Xuân' },
    { code: '26767', name: 'Thạnh Lộc' },
    { code: '26770', name: 'Hiệp Thành' },
    { code: '26773', name: 'Thới An' },
    { code: '26776', name: 'Tân Chánh Hiệp' },
    { code: '26779', name: 'An Phú Đông' },
    { code: '26782', name: 'Tân Thới Hiệp' },
    { code: '26785', name: 'Trung Mỹ Tây' },
    { code: '26788', name: 'Tân Hưng Thuận' },
    { code: '26791', name: 'Đông Hưng Thuận' },
    { code: '26794', name: 'Tân Thới Nhất' }
  ],
  '764': [ // Gò Vấp
    { code: '26797', name: 'Phường 15' },
    { code: '26800', name: 'Phường 13' },
    { code: '26803', name: 'Phường 17' },
    { code: '26806', name: 'Phường 6' },
    { code: '26809', name: 'Phường 16' },
    { code: '26812', name: 'Phường 12' },
    { code: '26815', name: 'Phường 14' },
    { code: '26818', name: 'Phường 10' },
    { code: '26821', name: 'Phường 5' },
    { code: '26824', name: 'Phường 7' },
    { code: '26827', name: 'Phường 3' },
    { code: '26830', name: 'Phường 1' },
    { code: '26833', name: 'Phường 2' },
    { code: '26836', name: 'Phường 4' },
    { code: '26839', name: 'Phường 8' },
    { code: '26842', name: 'Phường 9' },
    { code: '26845', name: 'Phường 11' }
  ],
  '765': [ // Bình Thạnh
    { code: '26848', name: 'Phường 13' },
    { code: '26851', name: 'Phường 11' },
    { code: '26854', name: 'Phường 27' },
    { code: '26857', name: 'Phường 26' },
    { code: '26860', name: 'Phường 12' },
    { code: '26863', name: 'Phường 25' },
    { code: '26866', name: 'Phường 5' },
    { code: '26869', name: 'Phường 7' },
    { code: '26872', name: 'Phường 24' },
    { code: '26875', name: 'Phường 6' },
    { code: '26878', name: 'Phường 14' },
    { code: '26881', name: 'Phường 15' },
    { code: '26884', name: 'Phường 2' },
    { code: '26887', name: 'Phường 1' },
    { code: '26890', name: 'Phường 3' },
    { code: '26893', name: 'Phường 17' },
    { code: '26896', name: 'Phường 21' },
    { code: '26899', name: 'Phường 19' },
    { code: '26902', name: 'Phường 28' }
  ],
  '766': [ // Tân Bình
    { code: '26905', name: 'Phường 15' },
    { code: '26908', name: 'Phường 13' },
    { code: '26911', name: 'Phường 17' },
    { code: '26914', name: 'Phường 6' },
    { code: '26917', name: 'Phường 16' },
    { code: '26920', name: 'Phường 12' },
    { code: '26923', name: 'Phường 14' },
    { code: '26926', name: 'Phường 10' },
    { code: '26929', name: 'Phường 5' },
    { code: '26932', name: 'Phường 7' },
    { code: '26935', name: 'Phường 3' },
    { code: '26938', name: 'Phường 1' },
    { code: '26941', name: 'Phường 2' },
    { code: '26944', name: 'Phường 4' },
    { code: '26947', name: 'Phường 8' },
    { code: '26950', name: 'Phường 9' },
    { code: '26953', name: 'Phường 11' }
  ],
  '767': [ // Tân Phú
    { code: '26956', name: 'Phường Tân Sơn Nhì' },
    { code: '26959', name: 'Phường Tây Thạnh' },
    { code: '26962', name: 'Phường Sơn Kỳ' },
    { code: '26965', name: 'Phường Tân Quý' },
    { code: '26968', name: 'Phường Tân Thành' },
    { code: '26971', name: 'Phường Phú Thọ Hòa' },
    { code: '26974', name: 'Phường Phú Thạnh' },
    { code: '26977', name: 'Phường Phú Trung' },
    { code: '26980', name: 'Phường Hòa Thạnh' },
    { code: '26983', name: 'Phường Hiệp Tân' },
    { code: '26986', name: 'Phường Tân Thới Hòa' }
  ],
  '768': [ // Phú Nhuận
    { code: '26989', name: 'Phường 1' },
    { code: '26992', name: 'Phường 2' },
    { code: '26995', name: 'Phường 3' },
    { code: '26998', name: 'Phường 4' },
    { code: '27001', name: 'Phường 5' },
    { code: '27004', name: 'Phường 7' },
    { code: '27007', name: 'Phường 8' },
    { code: '27010', name: 'Phường 9' },
    { code: '27013', name: 'Phường 10' },
    { code: '27016', name: 'Phường 11' },
    { code: '27019', name: 'Phường 12' },
    { code: '27022', name: 'Phường 13' },
    { code: '27025', name: 'Phường 14' },
    { code: '27028', name: 'Phường 15' },
    { code: '27031', name: 'Phường 17' }
  ],
  '769': [ // TP Thủ Đức (một số phường tiêu biểu, bạn có thể bổ sung thêm)
    { code: '27679', name: 'Hiệp Bình' },
    { code: '27682', name: 'Tam Bình' },
    { code: '27685', name: 'Thủ Đức' },
    { code: '27688', name: 'Linh Xuân' },
    { code: '27691', name: 'Long Bình' },
    { code: '27694', name: 'Tăng Nhơn Phú' },
    { code: '27697', name: 'Phước Long' },
    { code: '27700', name: 'Long Phước' },
    { code: '27703', name: 'Long Trường' },
    { code: '27706', name: 'An Khánh' },
    { code: '27709', name: 'Bình Trưng' },
    { code: '27712', name: 'Cát Lái' }
  ],
  // ...bạn có thể bổ sung thêm các quận/huyện khác theo cấu trúc trên...
  // Các huyện còn lại bạn có thể lấy từ nguồn JSON địa giới hành chính Việt Nam để đầy đủ nhất.
};

// Danh sách đường/phố tiêu biểu cho từng quận (bạn có thể bổ sung thêm)
const streetsByDistrict = {
  '760': [ // Quận 1
    'Nguyễn Huệ', 'Lê Lợi', 'Đồng Khởi', 'Nguyễn Thị Minh Khai', 'Trần Hưng Đạo',
    'Hai Bà Trưng', 'Pasteur', 'Nam Kỳ Khởi Nghĩa', 'Lý Tự Trọng', 'Tôn Đức Thắng'
  ],
  '761': [ // Quận 12
    'Nguyễn Ảnh Thủ', 'Tô Ký', 'Lê Văn Khương', 'Hà Huy Giáp', 'Nguyễn Văn Quá'
  ],
  '764': [ // Gò Vấp
    'Quang Trung', 'Phan Văn Trị', 'Lê Đức Thọ', 'Nguyễn Oanh', 'Nguyễn Kiệm'
  ],
  '765': [ // Bình Thạnh
    'Điện Biên Phủ', 'Phan Đăng Lưu', 'Bạch Đằng', 'Đinh Bộ Lĩnh', 'Xô Viết Nghệ Tĩnh'
  ],
  '766': [ // Tân Bình
    'Cộng Hòa', 'Trường Chinh', 'Hoàng Văn Thụ', 'Lý Thường Kiệt', 'Phạm Văn Bạch'
  ],
  '767': [ // Tân Phú
    'Lũy Bán Bích', 'Tân Kỳ Tân Quý', 'Âu Cơ', 'Thạch Lam', 'Gò Dầu'
  ],
  '768': [ // Phú Nhuận
    'Phan Đình Phùng', 'Nguyễn Văn Trỗi', 'Hoàng Văn Thụ', 'Huỳnh Văn Bánh', 'Trường Sa'
  ],
  '769': [ // TP Thủ Đức
    'Võ Văn Ngân', 'Kha Vạn Cân', 'Lê Văn Việt', 'Đặng Văn Bi', 'Phạm Văn Đồng'
  ],
  '770': [ // Quận 3
    'Cách Mạng Tháng 8', 'Nguyễn Đình Chiểu', 'Lý Chính Thắng', 'Nam Kỳ Khởi Nghĩa', 'Võ Thị Sáu'
  ],
  '771': [ // Quận 10
    'Ba Tháng Hai', 'Nguyễn Tri Phương', 'Lý Thường Kiệt', 'Tô Hiến Thành', 'Ngô Gia Tự'
  ],
  '772': [ // Quận 11
    'Lạc Long Quân', 'Ba Tháng Hai', 'Minh Phụng', 'Hàn Hải Nguyên', 'Tạ Uyên'
  ],
  '773': [ // Quận 4
    'Đoàn Văn Bơ', 'Tôn Đản', 'Vĩnh Hội', 'Nguyễn Tất Thành', 'Hoàng Diệu'
  ],
  '774': [ // Quận 5
    'Trần Hưng Đạo', 'Nguyễn Trãi', 'Châu Văn Liêm', 'An Dương Vương', 'Hùng Vương'
  ],
  '775': [ // Quận 6
    'Hậu Giang', 'Minh Phụng', 'Phạm Văn Chí', 'Kinh Dương Vương', 'Bình Tiên'
  ],
  '776': [ // Quận 8
    'Phạm Thế Hiển', 'Tạ Quang Bửu', 'Dương Bá Trạc', 'Nguyễn Duy', 'Hưng Phú'
  ],
  '777': [ // Bình Tân
    'Kinh Dương Vương', 'Mã Lò', 'Lê Văn Quới', 'Tân Kỳ Tân Quý', 'Hương Lộ 2'
  ],
  '778': [ // Quận 7
    'Nguyễn Thị Thập', 'Huỳnh Tấn Phát', 'Lê Văn Lương', 'Tân Mỹ', 'Nguyễn Hữu Thọ'
  ],
  '783': [ // Huyện Củ Chi
    'Tỉnh lộ 8', 'Tỉnh lộ 15', 'Quốc lộ 22', 'Nguyễn Văn Khạ', 'Tỉnh lộ 2'
  ],
  '784': [ // Hóc Môn
    'Song Hành', 'Nguyễn Ảnh Thủ', 'Đặng Thúc Vịnh', 'Phan Văn Hớn', 'Trần Văn Mười'
  ],
  '785': [ // Bình Chánh
    'Quốc lộ 1A', 'Nguyễn Văn Linh', 'Đinh Đức Thiện', 'Võ Văn Vân', 'Trịnh Quang Nghị'
  ],
  '786': [ // Nhà Bè
    'Nguyễn Hữu Thọ', 'Lê Văn Lương', 'Huỳnh Tấn Phát', 'Nguyễn Bình', 'Phạm Hữu Lầu'
  ],
  '787': [ // Cần Giờ
    'Rừng Sác', 'Duyên Hải', 'Tắc Xuất', 'Thạnh Thới', 'Lý Nhơn'
  ]
};


const bloodTypes = [
  { id: 1, name: 'A+' }, { id: 2, name: 'A-' },
  { id: 3, name: 'B+' }, { id: 4, name: 'B-' },
  { id: 5, name: 'O+' }, { id: 6, name: 'O-' },
  { id: 7, name: 'AB+' }, { id: 8, name: 'AB-' },
];

const genders = [
  { value: 'Male', label: 'Nam' }, { value: 'Female', label: 'Nữ' }, { value: 'Other', label: 'Khác' }
];
const rhFactors = ['Rh+', 'Rh-'];
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
  const [streetName, setStreetName] = useState(''); 
  
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
      const res = await api.get(`/UserProfile/by-user/${user.userId}`);
      let profile = res.data;

      // --- Thêm: Lấy ngày hiến máu gần nhất từ lịch sử có status = Complete ---
      let latestDonationDate = '';
      try {
        const historyRes = await api.get(`/DonationHistory/by-donor/${user.userId}`);
        if (Array.isArray(historyRes.data)) {
          const completed = historyRes.data.filter(
            h => h.status === 'Complete' && h.donationDate
          );
          if (completed.length > 0) {
            const latest = completed.reduce((a, b) =>
              new Date(a.donationDate) > new Date(b.donationDate) ? a : b
            );
            latestDonationDate = latest.donationDate.split('T')[0];
          }
        }
      } catch {
        // Không cần xử lý lỗi
      }

      // Nếu có ngày hiến máu gần nhất và khác với DB thì tự động cập nhật vào DB
      if (
        latestDonationDate &&
        (!profile || !profile.lastBloodDonationDate || profile.lastBloodDonationDate.split('T')[0] !== latestDonationDate)
      ) {
        const payload = {
          ...(profile || {}),
          userId: user.userId,
          lastBloodDonationDate: latestDonationDate,
        };
        try {
          if (profile) {
            await api.put(`/UserProfile/by-user/${user.userId}`, payload);
          } else {
            await api.post(`/UserProfile`, payload);
          }
          // Sau khi cập nhật, reload lại profile
          const updatedRes = await api.get(`/UserProfile/by-user/${user.userId}`);
          profile = updatedRes.data;
        } catch (e) {
          // Không cần xử lý lỗi cập nhật tự động
        }
      }
      // --- Kết thúc phần thêm ---

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
          let foundStreet = '';
          let foundWard = '';
          let foundDistrict = '';
          let foundProvince = '';

          if (parts.length >= 5) {
            foundHouseNumber = parts[0];
            foundStreet = parts[1];
            foundWard = parts[2];
            foundDistrict = parts[3];
            foundProvince = parts[4];
          } else if (parts.length === 4) { 
            foundStreet = parts[0];
            foundWard = parts[1];
            foundDistrict = parts[2];
            foundProvince = parts[3];
          }
          
          const p = provinces.find(p => p.name === foundProvince);
          if (p) setProvinceCode(p.code);
          const d = districtsData[p?.code]?.find(d => d.name === foundDistrict);
          if (d) setDistrictCode(d.code);
          setWardName(foundWard); 
          setStreetName(foundStreet);
          setFormData(prev => ({ ...prev, houseNumber: foundHouseNumber }));
        }

        setFormData(prev => ({
          ...prev,
          fullName: profile.fullName || '',
          dateOfBirth: profile.dateOfBirth || '', 
          // Đảm bảo gender luôn là 'Nam', 'Nữ', hoặc 'Khác'
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
          rhFactor: profile.rhFactor || '',
          medicalHistory: profile.medicalHistory || '',
          lastBloodDonationDate: profile.lastBloodDonationDate ? profile.lastBloodDonationDate.split('T')[0] : '', 
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
        setProvinceCode(''); setDistrictCode(''); setWardName(''); setStreetName('');
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
        setProvinceCode(''); setDistrictCode(''); setWardName(''); setStreetName('');
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
    const streetNameVal = streetsByDistrict[districtCode]?.find(s => s === streetName) || streetName || '';

    let addrParts = [];
    if (formData.houseNumber?.trim()) addrParts.push(formData.houseNumber.trim());
    if (streetNameVal?.trim()) addrParts.push(streetNameVal.trim());
    if (wardNameVal?.trim()) addrParts.push(wardNameVal.trim());
    if (districtName?.trim()) addrParts.push(districtName.trim());
    if (provinceName?.trim()) addrParts.push(provinceName.trim());

    return addrParts.join(', ');
  }, [formData.houseNumber, streetName, wardName, districtCode, provinceCode]);

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
      lastBloodDonationDate: formData.lastBloodDonationDate || null,
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
  const streets = districtCode ? (streetsByDistrict[districtCode] || []) : [];

  return (
    <div className="profile-page-container p-4">
      <h2 className="text-center mb-4 text-primary">{isCreateMode ? 'Tạo Hồ sơ cá nhân' : 'Cập nhật Hồ sơ cá nhân'}</h2>
      <p className="text-center text-muted mb-4">
        Quản lý thông tin cá nhân, y tế và lịch sử hiến máu của bạn.
      </p>

      {/* Nút về trang chủ */}
      <div className="mb-3 text-end">
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate('/')}

          type="button"
        >
          &larr; Về trang chủ
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {/* Hiển thị thông tin profile nếu đã có */}
      {!isCreateMode && (
        <div className="mb-4">
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
            <li className="list-group-item"><strong>Yếu tố Rh:</strong> {formData.rhFactor}</li>
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
            <div className="col-md-6">
              <label className="form-label">Đường/Phố</label>
              <select
                className={`form-select ${fieldErrors.address ? 'is-invalid' : ''}`}
                value={streetName}
                onChange={e => setStreetName(e.target.value)}
                disabled={!districtCode || submitting}
              >
                <option value="">Chọn đường/phố</option>
                {streets.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
              {fieldErrors.address && <div className="invalid-feedback">{fieldErrors.address}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label">Số nhà</label>
              <input
                type="text"
                className="form-control"
                value={formData.houseNumber || ''}

                onChange={e => setFormData(prev => ({ ...prev, houseNumber: e.target.value }))}

                disabled={submitting}
                placeholder="Số nhà (không bắt buộc)"
              />
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
            {/* Kinh độ/vĩ độ */}
            <div className="col-md-6">
              <label htmlFor="latitude" className="form-label">Vĩ độ (Latitude)</label>
              <input
                type="number"
                step="0.000001"
                className="form-control"
                id="latitude"
                name="latitude"
                value={formData.latitude}
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
                value={formData.longitude}
                readOnly
                disabled
                placeholder="Tự động lấy từ địa chỉ"
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
                {rhFactors.map(factor => <option key={factor} value={factor}>{factor}</option>)}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Lịch sử bệnh án/y tế (nếu có)</label>
              <select
                className="form-select"
                multiple
                value={medicalChecks}
                onChange={e => {
                  const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                  setMedicalChecks(selected);
                  // Nếu bỏ chọn "Khác" thì xóa otherMedical
                  if (!selected.includes("Khác")) setOtherMedical('');
                }}
                disabled={submitting}
                style={{ minHeight: 120 }}
              >
                {MEDICAL_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
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
            </div>
            <div className="col-md-6">
              <label htmlFor="lastBloodDonationDate" className="form-label">Ngày hiến máu gần nhất</label>
              <input type="date" className="form-control" id="lastBloodDonationDate" name="lastBloodDonationDate"
                value={formData.lastBloodDonationDate || ''} onChange={handleChange} disabled={submitting} />
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