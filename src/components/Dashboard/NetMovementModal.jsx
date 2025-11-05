import React from 'react';
import './NetMovementModal.css';

const NetMovementModal = ({ metric, onClose }) => {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCloseClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Net Movement Details</h2>
          <button 
            type="button"
            className="btn-close" 
            onClick={handleCloseClick}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {metric.base_name && (
            <div className="detail-row">
              <span className="detail-label">Base:</span>
              <span className="detail-value">{metric.base_name}</span>
            </div>
          )}
          
          {metric.equipment_name && (
            <div className="detail-row">
              <span className="detail-label">Equipment:</span>
              <span className="detail-value">{metric.equipment_name}</span>
            </div>
          )}

          <div className="breakdown">
            <h3>Movement Breakdown</h3>
            
            <div className="breakdown-item positive">
              <span>Purchases</span>
              <span className="value">+{metric.purchases}</span>
            </div>

            <div className="breakdown-item positive">
              <span>Transfers In</span>
              <span className="value">+{metric.transfers_in}</span>
            </div>

            <div className="breakdown-item negative">
              <span>Transfers Out</span>
              <span className="value">-{metric.transfers_out}</span>
            </div>

            <div className="breakdown-total">
              <span>Net Movement</span>
              <span className={`value ${metric.net_movement >= 0 ? 'positive' : 'negative'}`}>
                {metric.net_movement >= 0 ? '+' : ''}{metric.net_movement}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetMovementModal;
