import React from 'react';
import { translateDate } from '../../utils/translationUtils';

const DateDisplay = ({ date, showTime = true, className = '' }) => {
  if (!date) return <span className={className}>N/A</span>;
  
  const dateObj = new Date(date);
  const options = showTime ? 
    { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' } :
    { year: 'numeric', month: 'numeric', day: 'numeric' };
    
  return (
    <span className={className}>
      {dateObj.toLocaleDateString('vi-VN', options)}
    </span>
  );
};

export default DateDisplay;
