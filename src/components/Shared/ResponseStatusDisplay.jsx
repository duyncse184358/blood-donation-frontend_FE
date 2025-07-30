import React from 'react';

const ResponseStatusDisplay = ({ status, className = '' }) => {
  const getStatusInfo = (status) => {
    const s = status?.toLowerCase();
    if (!s) return { label: 'Chưa phản hồi', className: 'badge bg-secondary' };

    if (s === 'interested' || s.includes('đồng ý')) {
      return { label: 'Đồng ý', className: 'badge bg-success' };
    }
    if (s === 'declined' || s.includes('từ chối')) {
      return { label: 'Từ chối', className: 'badge bg-danger' };
    }
    if (s === 'no response' || s.includes('chưa phản hồi')) {
      return { label: 'Chưa phản hồi', className: 'badge bg-secondary' };
    }

    return { label: status, className: 'badge bg-secondary' };
  };

  const { label, className: badgeClass } = getStatusInfo(status);

  return (
    <span className={`${badgeClass} ${className}`}>
      {label}
    </span>
  );
};

export default ResponseStatusDisplay;
