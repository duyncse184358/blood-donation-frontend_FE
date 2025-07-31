// Utility functions for translating English text to Vietnamese

// Constants
export const BLOOD_TYPES_MAP = {
  'A+': 'A dương',
  'A-': 'A âm',
  'B+': 'B dương',
  'B-': 'B âm',
  'AB+': 'AB dương',
  'AB-': 'AB âm',
  'O+': 'O dương',
  'O-': 'O âm'
};

export const STATUS_MAP = {
  'pending': 'Chờ xử lý',
  'responded': 'Có phản hồi',
  'approved': 'Đã duyệt',
  'rejected': 'Từ chối',
  'completed': 'Hoàn thành',
  'cancelled': 'Đã hủy',
  'active': 'Đang hoạt động',
  'inactive': 'Không hoạt động',
  'processing': 'Đang xử lý',
  'waiting': 'Đang chờ',
  'expired': 'Hết hạn',
  'valid': 'Còn hiệu lực',
  'read': 'Đã đọc',
  'unread': 'Chưa đọc',
  'used': 'Đã sử dụng',
  'unused': 'Chưa sử dụng',
  'interested': 'Đã đồng ý',
  'declined': 'Đã từ chối',
  'no response': 'Chưa phản hồi'
};

export const ROLE_MAP = {
  'admin': 'Quản trị viên',
  'staff': 'Nhân viên',
  'member': 'Thành viên',
  'donor': 'Người hiến máu',
  'recipient': 'Người nhận máu'
};

export const DELIVERY_METHOD_MAP = {
  'email': 'Email',
  'sms': 'Tin nhắn SMS',
  'push': 'Thông báo đẩy',
  'in_app': 'Trong ứng dụng'
};

// Translate common status terms
export function translateStatus(status) {
  if (!status) return '';
  const s = status.toLowerCase();
  switch (s) {
    case 'pending': return 'Đang chờ';
    case 'approved': return 'Đã duyệt';
    case 'rejected': return 'Từ chối';
    case 'completed': return 'Hoàn thành';
    case 'cancelled': return 'Đã hủy';
    case 'active': return 'Đang hoạt động';
    case 'inactive': return 'Không hoạt động';
    case 'processing': return 'Đang xử lý';
    case 'waiting': return 'Đang chờ';
    default: return status;
  }
}

// Translate blood types
export function translateBloodType(type) {
  if (!type) return '';
  const t = type.toUpperCase();
  switch (t) {
    case 'A+': return 'A dương';
    case 'A-': return 'A âm';
    case 'B+': return 'B dương';
    case 'B-': return 'B âm';
    case 'O+': return 'O dương';
    case 'O-': return 'O âm';
    case 'AB+': return 'AB dương';
    case 'AB-': return 'AB âm';
    default: return type;
  }
}

// Translate user roles
export function translateRole(role) {
  if (!role) return '';
  const r = role.toLowerCase();
  switch (r) {
    case 'admin': return 'Quản trị viên';
    case 'staff': return 'Nhân viên';
    case 'member': return 'Thành viên';
    case 'donor': return 'Người hiến máu';
    case 'recipient': return 'Người nhận máu';
    default: return role;
  }
}

// Translate notification types
export function translateNotificationType(type) {
  if (!type) return 'Chung';
  const t = type.toLowerCase();
  switch (t) {
    case 'emergency': return 'Khẩn cấp';
    case 'reminder': return 'Nhắc nhở';
    case 'info':
    case 'information': return 'Thông tin';
    case 'system': return 'Hệ thống';
    case 'alert':
    case 'warning': return 'Cảnh báo';
    case 'success': return 'Thành công';
    case 'error': return 'Lỗi';
    default: return 'Khác';
  }
}

// Translate common terms in notification messages
export function translateMessage(message) {
  if (!message) return '';
  let msg = message;

  // Common vocabulary
  const translations = {
    'emergency': 'khẩn cấp',
    'reminder': 'nhắc nhở',
    'information': 'thông tin',
    'info': 'thông tin',
    'system': 'hệ thống',
    'blood': 'máu',
    'donation': 'hiến máu',
    'request': 'yêu cầu',
    'approved': 'đã duyệt',
    'pending': 'đang chờ',
    'rejected': 'bị từ chối',
    'completed': 'đã hoàn thành',
    'user': 'người dùng',
    'certificate': 'chứng chỉ',
    'success': 'thành công',
    'error': 'lỗi',
    'warning': 'cảnh báo',
    'admin': 'quản trị viên',
    'staff': 'nhân viên',
    'member': 'thành viên',
    'donor': 'người hiến máu',
    'recipient': 'người nhận máu',
    'declined': 'từ chối',
    'no response': 'chưa phản hồi',
    'interested': 'đồng ý',
    'appointment': 'cuộc hẹn',
    'scheduled': 'đã lên lịch',
    'cancelled': 'đã hủy',
    'profile': 'hồ sơ',
    'updated': 'đã cập nhật',
    'created': 'đã tạo',
    'deleted': 'đã xóa',
    'valid': 'hợp lệ',
    'invalid': 'không hợp lệ',
    'expired': 'hết hạn',
    'active': 'đang hoạt động',
    'inactive': 'không hoạt động'
  };

  // Replace all occurrences of English words with Vietnamese translations
  Object.entries(translations).forEach(([eng, vn]) => {
    const regex = new RegExp(eng, 'gi');
    msg = msg.replace(regex, vn);
  });

  return msg;
}

// Translate date to Vietnamese format
export function translateDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('vi-VN');
}

// Translate common boolean values
export function translateBoolean(value) {
  if (value === true) return 'Có';
  if (value === false) return 'Không';
  return '';
}

// Translate common attributes
export function translateAttribute(attr) {
  if (!attr) return '';
  const a = attr.toLowerCase();
  switch (a) {
    // Personal information
    case 'name': return 'Họ tên';
    case 'email': return 'Email';
    case 'phone': return 'Số điện thoại';
    case 'address': return 'Địa chỉ';
    case 'birthday': return 'Ngày sinh';
    case 'gender': return 'Giới tính';
    case 'age': return 'Tuổi';
    
    // Blood donation related
    case 'blood type': return 'Nhóm máu';
    case 'donation date': return 'Ngày hiến máu';
    case 'donation time': return 'Thời gian hiến máu';
    case 'donation location': return 'Địa điểm hiến máu';
    case 'amount': return 'Số lượng';
    case 'units': return 'Đơn vị';
    
    // Status related
    case 'status': return 'Trạng thái';
    case 'type': return 'Loại';
    case 'date': return 'Ngày';
    case 'time': return 'Thời gian';
    case 'created at': return 'Ngày tạo';
    case 'updated at': return 'Ngày cập nhật';
    
    default: return attr;
  }
}
