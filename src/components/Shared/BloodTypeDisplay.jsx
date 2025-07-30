import React from 'react';
import { translateBloodType } from '../../utils/translationUtils';

const BloodTypeDisplay = ({ type, showLabel = true, className = '' }) => {
  return (
    <span className={className}>
      {showLabel ? 'Nhóm máu: ' : ''}{translateBloodType(type)}
    </span>
  );
};

export default BloodTypeDisplay;
