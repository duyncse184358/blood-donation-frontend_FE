import React from 'react';

const BloodTypeDisplay = ({ type, showLabel = true, className = '' }) => {
  return (
    <span className={className}>
      {showLabel ? 'Nhóm máu: ' : ''}{type}
    </span>
  );
};

export default BloodTypeDisplay;
