import React, { useState } from 'react';
import api from '../../utils/api';
import './Transfers.css';

const TransferForm = ({ bases = [], equipmentTypes = [], onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    from_base_id: '',
    to_base_id: '',
    equipment_type_id: '',
    quantity: '',
    transfer_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.from_base_id === formData.to_base_id) {
      setError('Source and destination bases cannot be the same');
      return;
    }

    setLoading(true);

    try {
      await api.post('/transfers', {
        ...formData,
        quantity: parseInt(formData.quantity)
      });
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create transfer');
    } finally {
      setLoading(false);
    }
  };

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
          <h2>New Transfer</h2>
          <button 
            type="button"
            className="btn-close" 
            onClick={handleCloseClick}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>From Base *</label>
            <select
              name="from_base_id"
              value={formData.from_base_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Source Base</option>
              {bases && bases.length > 0 ? (
                bases.map(base => (
                  <option key={base.id} value={base.id}>{base.name}</option>
                ))
              ) : (
                <option disabled>Loading bases...</option>
              )}
            </select>
          </div>

          <div className="form-group">
            <label>To Base *</label>
            <select
              name="to_base_id"
              value={formData.to_base_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Destination Base</option>
              {bases && bases.length > 0 ? (
                bases.map(base => (
                  <option key={base.id} value={base.id}>{base.name}</option>
                ))
              ) : (
                <option disabled>Loading bases...</option>
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Equipment Type *</label>
            <select
              name="equipment_type_id"
              value={formData.equipment_type_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Equipment</option>
              {equipmentTypes && equipmentTypes.length > 0 ? (
                equipmentTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} ({type.category})
                  </option>
                ))
              ) : (
                <option disabled>Loading equipment types...</option>
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Quantity *</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label>Transfer Date *</label>
            <input
              type="date"
              name="transfer_date"
              value={formData.transfer_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleCloseClick} 
              className="btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading || !bases.length || !equipmentTypes.length}
            >
              {loading ? 'Creating...' : 'Create Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferForm;
