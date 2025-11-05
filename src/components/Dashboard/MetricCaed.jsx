import React from 'react';
import './MetricCard.css';

const MetricCard = ({ title, value, color, clickable, onClick }) => {
  return (
    <div 
      className={`metric-card ${clickable ? 'clickable' : ''}`}
      style={{ borderLeft: `4px solid ${color}` }}
      onClick={clickable ? onClick : undefined}
    >
      <div className="metric-title">{title}</div>
      <div className="metric-value" style={{ color }}>{value}</div>
      {clickable && <div className="metric-hint">Click for details</div>}
    </div>
  );
};

export default MetricCard;
