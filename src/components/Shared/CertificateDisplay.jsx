import React from 'react';
import { translateStatus, translateDate } from '../../utils/translationUtils';

const CertificateDisplay = ({ certificate }) => {
  const getStatusClass = (status) => {
    const s = status?.toLowerCase();
    if (s === 'active' || s === 'valid') return 'text-success';
    if (s === 'expired') return 'text-danger';
    if (s === 'pending') return 'text-warning';
    return 'text-secondary';
  };

  return (
    <div className="certificate-display">
      <h5>Chứng chỉ hiến máu</h5>
      <div className="certificate-info">
        <p><strong>Mã số:</strong> {certificate.certificateId}</p>
        <p><strong>Ngày cấp:</strong> {translateDate(certificate.issueDate)}</p>
        <p><strong>Ngày hết hạn:</strong> {translateDate(certificate.expiryDate)}</p>
        <p>
          <strong>Trạng thái:</strong> 
          <span className={getStatusClass(certificate.status)}>
            {translateStatus(certificate.status)}
          </span>
        </p>
        {certificate.notes && (
          <p><strong>Ghi chú:</strong> {certificate.notes}</p>
        )}
      </div>
    </div>
  );
};

export default CertificateDisplay;
