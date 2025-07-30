import React from 'react';
import { translateDate, translateRole } from '../../utils/translationUtils';

const UserProfileDisplay = ({ user }) => {
  const getGenderText = (gender) => {
    if (!gender) return '';
    const g = gender.toLowerCase();
    if (g === 'male') return 'Nam';
    if (g === 'female') return 'Nữ';
    return 'Khác';
  };

  return (
    <div className="user-profile">
      <div className="row">
        <div className="col-md-6">
          <p><strong>Họ và tên:</strong> {user.fullName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Số điện thoại:</strong> {user.phoneNumber}</p>
          <p><strong>Giới tính:</strong> {getGenderText(user.gender)}</p>
        </div>
        <div className="col-md-6">
          <p><strong>Ngày sinh:</strong> {translateDate(user.dateOfBirth)}</p>
          <p><strong>Địa chỉ:</strong> {user.address}</p>
          <p><strong>Vai trò:</strong> {translateRole(user.role)}</p>
          <p>
            <strong>Trạng thái:</strong> {' '}
            <span className={`badge ${user.isActive ? 'bg-success' : 'bg-danger'}`}>
              {user.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfileDisplay;
