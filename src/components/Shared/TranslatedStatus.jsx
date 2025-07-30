import React from 'react';
import { translateStatus } from '../../utils/translationUtils';

const TranslatedStatus = ({ status, className }) => {
  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'completed':
      case 'success':
      case 'approved':
        return 'text-success';
      case 'pending':
      case 'waiting':
        return 'text-warning';
      case 'rejected':
      case 'cancelled':
      case 'error':
        return 'text-danger';
      default:
        return 'text-secondary';
    }
  };

  return (
    <span className={`${getStatusColor(status)} ${className || ''}`}>
      {translateStatus(status)}
    </span>
  );
};

export default TranslatedStatus;
