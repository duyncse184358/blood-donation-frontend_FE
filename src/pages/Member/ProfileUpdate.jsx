// src/pages/Member/ProfileUpdate.jsx
import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import useAuth from '../../hooks/useAuth';
import api from '../../services/Api';
import { useNavigate } from 'react-router-dom';

// Chỉ giữ TP. Hồ Chí Minh
const provinces = [
  { code: '79', name: 'TP. Hồ Chí Minh' },
];
// Danh sách quận/huyện TP. Hồ Chí Minh (đã đầy đủ)
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

  // Thêm state cho từng trường địa chỉ
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [street, setStreet] = useState('');

  // State cho ngày sinh tách biệt
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');

  const navigate = useNavigate();

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

  // Tạo danh sách năm từ 1900 đến hiện tại
  const years = Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => 1900 + i);
  // Danh sách tháng
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  // Danh sách ngày (tối đa 31 ngày)
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // Lấy profile khi mở trang
  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      const fetchProfile = async () => {
        setLoading(true);
        setError('');
        setIsCreateMode(false);
        try {
          const res = await api.get(`/UserProfile/by-user/${user.userId}`);
          // Tách địa chỉ thành các trường riêng nếu có
          let provinceVal = '', districtVal = '', wardVal = '', streetVal = '';
          if (res.data.address) {
            // Giả sử địa chỉ lưu dạng: "Số nhà, Đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành"
            const parts = res.data.address.split(',').map(s => s.trim());
            if (parts.length >= 5) {
              streetVal = parts[0] + (parts[1] ? ', ' + parts[1] : '');
              wardVal = parts[2];
              districtVal = parts[3];
              provinceVal = parts[4];
            }
          }
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
          setProvince(provinceVal);
          setDistrict(districtVal);
          setWard(wardVal);
          setStreet(streetVal);
          setIsCreateMode(false);
        } catch (err) {
          if (err.response && err.response.status === 404) {
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
            setProvince('');
            setDistrict('');
            setWard('');
            setStreet('');
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

  // Khi chọn tỉnh, reset quận/huyện, xã/phường
  useEffect(() => {
    setDistrict('');
    setWard('');
  }, [province]);
  useEffect(() => {
    setWard('');
  }, [district]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    if (name === 'address') setAddressError('');
  };

  // Xây dựng địa chỉ từ các trường
  const buildAddress = () => {
    let addr = '';
    if (profileData.houseNumber && profileData.houseNumber.trim()) addr += profileData.houseNumber;
    if (street) addr += (addr ? ', ' : '') + street;
    if (ward) addr += (addr ? ', ' : '') + ward;
    if (district) addr += (addr ? ', ' : '') + districtsData[province].find(d => d.code === district)?.name;
    if (province) addr += (addr ? ', ' : '') + provinces.find(p => p.code === province)?.name;
    return addr;
  };

  // Lấy kinh độ/vĩ độ từ địa chỉ (giả lập, thực tế nên gọi API geocode)
  const fetchLatLngFromAddress = async (address) => {
    if (!address) return { lat: '', lng: '' };
    // Chỉ trả về Hồ Chí Minh
    if (address.includes('Hồ Chí Minh')) return { lat: '10.7769', lng: '106.7009' };
    return { lat: '', lng: '' };
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
    if (!street.trim() || !province || !district || !ward) {
      setError('Vui lòng nhập đầy đủ địa chỉ.');
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

    // Ghép ngày sinh
    const dateOfBirth = birthYear && birthMonth && birthDay
      ? `${birthYear}-${birthMonth}-${birthDay}`
      : null;

    // Ghép địa chỉ
    const address = buildAddress();
    const { lat, lng } = await fetchLatLngFromAddress(address);

    const submitData = {
      userId: user.userId,
      fullName: profileData.fullName,
      dateOfBirth: dateOfBirth,
      gender: profileData.gender || null,
      address: address,
      latitude: lat ? parseFloat(lat) : null,
      longitude: lng ? parseFloat(lng) : null,
      bloodTypeId: profileData.bloodTypeId ? parseInt(profileData.bloodTypeId) : null,
      rhFactor: profileData.rhFactor || null,
      medicalHistory: profileData.medicalHistory || null,
      lastBloodDonationDate: profileData.lastBloodDonationDate || null,
      cccd: profileData.cccd || null,
      phoneNumber: profileData.phoneNumber || null,
    };

    try {
      let res;
      if (isCreateMode) {
        res = await api.post(`/UserProfile`, { dto: submitData });
      } else {
        res = await api.put(`/UserProfile/by-user/${user.userId}`, { dto: submitData });
      }
      setMessage(isCreateMode ? 'Hồ sơ của bạn đã được tạo thành công!' : 'Hồ sơ của bạn đã được cập nhật thành công!');
      setIsCreateMode(false);
      setTimeout(() => {
        navigate('/member/dashboard');
      }, 1000);
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

  // Lấy danh sách quận/huyện theo tỉnh
  const districts = province ? (districtsData[province] || []) : [];
  // Lấy danh sách xã/phường theo quận/huyện
  const wards = district ? (wardsData[district] || []) : [];

  // Tạo giá trị dateOfBirth từ ngày, tháng, năm
  const dateOfBirth = birthYear && birthMonth && birthDay
    ? `${birthYear}-${birthMonth}-${birthDay}`
    : null;

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
                <label className="form-label">Ngày sinh</label>
                <div className="d-flex gap-2">
                  <select className="form-select" style={{ width: '33%' }} value={birthDay} onChange={e => setBirthDay(e.target.value)} disabled={submitting}>
                    <option value="">Ngày</option>
                    {days.map(d => <option key={d} value={String(d).padStart(2, '0')}>{d}</option>)}
                  </select>
                  <select className="form-select" style={{ width: '33%' }} value={birthMonth} onChange={e => setBirthMonth(e.target.value)} disabled={submitting}>
                    <option value="">Tháng</option>
                    {months.map(m => <option key={m} value={String(m).padStart(2, '0')}>{m}</option>)}
                  </select>
                  <select className="form-select" style={{ width: '34%' }} value={birthYear} onChange={e => setBirthYear(e.target.value)} disabled={submitting}>
                    <option value="">Năm</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
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
              {/* Địa chỉ chi tiết */}
              <div className="col-md-6">
                <label className="form-label">Tỉnh/Thành phố <span style={{ color: 'red' }}>*</span></label>
                <select className="form-select" value={province} onChange={e => setProvince(e.target.value)} disabled={submitting}>
                  <option value="">Chọn tỉnh/thành</option>
                  {provinces.map(p => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Quận/Huyện <span style={{ color: 'red' }}>*</span></label>
                <select className="form-select" value={district} onChange={e => setDistrict(e.target.value)} disabled={!province || submitting}>
                  <option value="">Chọn quận/huyện</option>
                  {districts.map(d => (
                    <option key={d.code} value={d.code}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Phường/Xã <span style={{ color: 'red' }}>*</span></label>
                <select className="form-select" value={ward} onChange={e => setWard(e.target.value)} disabled={!district || submitting}>
                  <option value="">Chọn phường/xã</option>
                  {wards.map(w => (
                    <option key={w.code} value={w.name}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Đường/Phố <span style={{ color: 'red' }}>*</span></label>
                <select
                  className="form-select"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  disabled={!district || submitting}
                >
                  <option value="">Chọn đường/phố</option>
                  {(streetsByDistrict[district] || []).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Số nhà</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileData.houseNumber || ''}
                  onChange={e => setProfileData(prev => ({ ...prev, houseNumber: e.target.value }))}
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
