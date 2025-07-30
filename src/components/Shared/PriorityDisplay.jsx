import React from 'react';

const PriorityDisplay = ({ priority, className = '' }) => {
  const getPriorityInfo = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return { label: 'Khẩn cấp', className: 'badge bg-danger' };
      case 'medium':
        return { label: 'Cao', className: 'badge bg-warning text-dark' };
      case 'low':
        return { label: 'Bình thường', className: 'badge bg-info text-dark' };
      default:
        return { label: priority || 'Không xác định', className: 'badge bg-secondary' };
    }
  };

  const { label, className: badgeClass } = getPriorityInfo(priority);

  return (
    <span className={`${badgeClass} ${className}`}>
      {label}
    </span>
  );
};

export default PriorityDisplay;
