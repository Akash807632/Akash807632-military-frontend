import React, { useState } from 'react';
import api from '../../utils/api';
import './Assignments.css';

const AssignmentForm = ({ type, bases = [], equipmentTypes = [], onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    base_id: '',
    equipment_type_id: '',
    quantity: '',
    date: new Date().toISOString().split('T')[0],
    personnel_name: '',
    personnel_rank: '',
    notes: '',
    reason: ''
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
    setLoading(true);

    try {
      const endpoint = type === 'assignments' ? '/assignments/assignments' : '/assignments/expenditures';
      const payload = {
        base_id: parseInt(formData.base_id),
        equipment_type_id: parseInt(formData.equipment_type_id),
        quantity: parseInt(formData.quantity)
      };

      if (type === 'assignments') {
        payload.assignment_date = formData.date;
        payload.personnel_name = formData.personnel_name;
        payload.personnel_rank = formData.personnel_rank || null;
        payload.notes = formData.notes || null;
      } else {
        payload.expenditure_date = formData.date;
        payload.reason = formData.reason;
      }

      await api.post(endpoint, payload);
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || `Failed to create ${type}`);
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
          <h2>New {type === 'assignments' ? 'Assignment' : 'Expenditure'}</h2>
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
            <label>Base *</label>
            <select
              name="base_id"
              value={formData.base_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Base</option>
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
                equipmentTypes.map(eqType => (
                  <option key={eqType.id} value={eqType.id}>
                    {eqType.name} ({eqType.category})
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
            <label>Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          {type === 'assignments' ? (
            <>
              <div className="form-group">
                <label>Personnel Name *</label>
                <input
                  type="text"
                  name="personnel_name"
                  value={formData.personnel_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Personnel Rank</label>
                <input
                  type="text"
                  name="personnel_rank"
                  value={formData.personnel_rank}
                  onChange={handleChange}
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
            </>
          ) : (
            <div className="form-group">
              <label>Reason *</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows="3"
                required
              />
            </div>
          )}

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
              {loading ? 'Creating...' : `Create ${type === 'assignments' ? 'Assignment' : 'Expenditure'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentForm;
