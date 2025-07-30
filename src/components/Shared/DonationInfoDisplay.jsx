import React from 'react';
import { 
  translateStatus, 
  translateDate,
  translateBloodType 
} from '../../utils/translationUtils';
import BloodTypeDisplay from './BloodTypeDisplay';

const DonationInfoDisplay = ({ donation }) => {
  return (
    <div className="donation-info">
      <div className="row">
        <div className="col-md-6">
          <p>
            <strong>Mã hiến máu:</strong> {donation.donationId}
          </p>
          <p>
            <strong>Ngày hiến:</strong> {translateDate(donation.donationDate)}
          </p>
          <p>
            <strong>Nhóm máu:</strong> {' '}
            <BloodTypeDisplay type={donation.bloodType} showLabel={false} />
          </p>
          <p>
            <strong>Số lượng:</strong> {donation.amount} ml
          </p>
        </div>
        <div className="col-md-6">
          <p>
            <strong>Địa điểm:</strong> {donation.location}
          </p>
          <p>
            <strong>Trạng thái:</strong> {' '}
            <span className={`badge ${
              donation.status === 'Completed' ? 'bg-success' :
              donation.status === 'Pending' ? 'bg-warning' :
              donation.status === 'Cancelled' ? 'bg-danger' :
              'bg-secondary'
            }`}>
              {translateStatus(donation.status)}
            </span>
          </p>
          {donation.notes && (
            <p><strong>Ghi chú:</strong> {donation.notes}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationInfoDisplay;
