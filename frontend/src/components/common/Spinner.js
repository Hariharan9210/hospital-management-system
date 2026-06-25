import React from 'react';

const Spinner = ({ size = 'md', text = 'Loading...' }) => {
  if (size === 'sm') return <div className="spinner spinner-sm"></div>;
  return (
    <div className="loading-state">
      <div className="spinner"></div>
      <p>{text}</p>
    </div>
  );
};

export default Spinner;