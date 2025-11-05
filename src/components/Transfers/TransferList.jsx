import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import TransferForm from './TransferForm';
import './Transfers.css';

const TransferList = () => {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [filters, setFilters] = useState({
    base_id: user?.role === 'base_commander' ? user.base_id : '',
    status: '',
    start_date: '',
    end_date: ''
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchBases();
    fetchEquipmentTypes();
    fetchTransfers();
  }, []);

  const fetchBases = async () => {
    try {
      const response = await api.get('/dashboard/bases');
      if (response.data.success && response.data.data) {
        setBases(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching bases:', error);
    }
  };

  const fetchEquipmentTypes = async () => {
    try {
      const response = await api.get('/dashboard/equipment-types');
      if (response.data.success && response.data.data) {
        setEquipmentTypes(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching equipment types:', error);
    }
  };

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.base_id) params.append('base_id', filters.base_id);
      if (filters.status) params.append('status', filters.status);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);

      const response = await api.get(`/transfers?${params}`);
      if (response.data.success && response.data.data) {
        setTransfers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleApplyFilters = () => {
    fetchTransfers();
  };

  const handleTransferCreated = () => {
    setShowForm(false);
    fetchTransfers();
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleStatusUpdate = async (transferId, newStatus) => {
    try {
      await api.patch(`/transfers/${transferId}/status`, { status: newStatus });
      fetchTransfers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      approved: 'status-approved',
      completed: 'status-completed',
      rejected: 'status-rejected'
    };
    return <span className={`status-badge ${statusClasses[status]}`}>{status}</span>;
  };

  const canCreateTransfer = user?.role === 'admin' || user?.role === 'base_commander' || user?.role === 'logistics_officer';
  const canUpdateStatus = user?.role === 'admin';

  return (
    <div className="transfers-container">
      <div className="page-header">
        <div>
          <h1>🔄 Transfers</h1>
          <p>Manage asset transfers between bases</p>
        </div>
        {canCreateTransfer && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + New Transfer
          </button>
        )}
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Base</label>
          <select
            name="base_id"
            value={filters.base_id}
            onChange={handleFilterChange}
            disabled={user?.role === 'base_commander'}
          >
            <option value="">All Bases</option>
            {bases.map(base => (
              <option key={base.id} value={base.id}>{base.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Status</label>
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Start Date</label>
          <input
            type="date"
            name="start_date"
            value={filters.start_date}
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-group">
          <label>End Date</label>
          <input
            type="date"
            name="end_date"
            value={filters.end_date}
            onChange={handleFilterChange}
          />
        </div>

        <button onClick={handleApplyFilters} className="btn-apply">
          Apply Filters
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading">Loading transfers...</div>
        ) : transfers.length === 0 ? (
          <div className="no-data">No transfers found</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>From Base</th>
                <th>To Base</th>
                <th>Equipment</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Initiated By</th>
                {canUpdateStatus && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {transfers.map((transfer) => (
                <tr key={transfer.id}>
                  <td>{new Date(transfer.transfer_date).toLocaleDateString()}</td>
                  <td>{transfer.from_base_name}</td>
                  <td>{transfer.to_base_name}</td>
                  <td>{transfer.equipment_name}</td>
                  <td className="quantity">{transfer.quantity}</td>
                  <td>{getStatusBadge(transfer.status)}</td>
                  <td>{transfer.initiated_by_name}</td>
                  {canUpdateStatus && (
                    <td>
                      {transfer.status === 'pending' && (
                        <div className="action-buttons">
                          <button
                            className="btn-action btn-approve"
                            onClick={() => handleStatusUpdate(transfer.id, 'approved')}
                          >
                            Approve
                          </button>
                          <button
                            className="btn-action btn-reject"
                            onClick={() => handleStatusUpdate(transfer.id, 'rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {transfer.status === 'approved' && (
                        <button
                          className="btn-action btn-complete"
                          onClick={() => handleStatusUpdate(transfer.id, 'completed')}
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <TransferForm
          bases={bases}
          equipmentTypes={equipmentTypes}
          onClose={handleCloseForm}
          onSuccess={handleTransferCreated}
        />
      )}
    </div>
  );
};

export default TransferList;
