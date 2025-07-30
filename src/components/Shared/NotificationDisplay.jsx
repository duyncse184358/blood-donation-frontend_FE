import React from 'react';
import { 
  translateStatus, 
  translateDate,
  translateRole,
  DELIVERY_METHOD_MAP
} from '../../utils/translationUtils';

const NotificationDisplay = ({ notification }) => {
  const getPriorityClass = (priority) => {
    const p = priority?.toLowerCase();
    if (p === 'high' || p === 'emergency') return 'bg-danger';
    if (p === 'medium') return 'bg-warning text-dark';
    return 'bg-info text-dark';
  };

  const getDeliveryMethodText = (method) => {
    return DELIVERY_METHOD_MAP[method?.toLowerCase()] || method;
  };

  return (
    <div className="notification-display">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="mb-0">
          {notification.title || 'Thông báo'}
        </h6>
        {notification.priority && (
          <span className={`badge ${getPriorityClass(notification.priority)}`}>
            {notification.priority === 'High' ? 'Khẩn cấp' :
             notification.priority === 'Medium' ? 'Cao' : 'Thường'}
          </span>
        )}
      </div>
      <div className="notification-content">
        <p>{notification.message}</p>
        <div className="notification-meta">
          <small className="text-muted">
            <span>Gửi đến: {translateRole(notification.recipientUserId)}</span>
            {notification.deliveryMethod && (
              <span className="mx-2">|</span>
              <span>Phương thức: {getDeliveryMethodText(notification.deliveryMethod)}</span>
            )}
            <span className="mx-2">|</span>
            <span>{translateDate(notification.sentDate)}</span>
          </small>
        </div>
        <div className="notification-status mt-2">
          <span className={`badge ${notification.isRead ? 'bg-success' : 'bg-secondary'}`}>
            {notification.isRead ? 'Đã đọc' : 'Chưa đọc'}
          </span>
          {notification.responseStatus && (
            <span className={`badge ms-2 ${
              notification.responseStatus === 'Interested' ? 'bg-success' :
              notification.responseStatus === 'Declined' ? 'bg-danger' :
              'bg-secondary'
            }`}>
              {notification.responseStatus === 'Interested' ? 'Đã đồng ý' :
               notification.responseStatus === 'Declined' ? 'Từ chối' : 
               'Chưa phản hồi'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDisplay;
