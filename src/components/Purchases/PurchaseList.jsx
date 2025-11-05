import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import PurchaseForm from './PurchaseForm';
import './Purchases.css';

const PurchaseList = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [filters, setFilters] = useState({
    base_id: user?.role === 'base_commander' ? user.base_id : '',
    equipment_type_id: '',
    start_date: '',
    end_date: ''
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchBases();
    fetchEquipmentTypes();
    fetchPurchases();
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

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.base_id) params.append('base_id', filters.base_id);
      if (filters.equipment_type_id) params.append('equipment_type_id', filters.equipment_type_id);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);

      const response = await api.get(`/purchases?${params}`);
      
      if (response.data.success && response.data.data) {
        setPurchases(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
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
    fetchPurchases();
  };

  const handlePurchaseCreated = () => {
    setShowForm(false);
    fetchPurchases();
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const canCreatePurchase = user?.role === 'admin' || user?.role === 'logistics_officer';

  return (
    <div className="purchases-container">
      <div className="page-header">
        <div>
          <h1>📦 Purchases</h1>
          <p>Record and view equipment purchases</p>
        </div>
        {canCreatePurchase && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + New Purchase
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
          <label>Equipment Type</label>
          <select
            name="equipment_type_id"
            value={filters.equipment_type_id}
            onChange={handleFilterChange}
          >
            <option value="">All Equipment</option>
            {equipmentTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
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
          <div className="loading">Loading purchases...</div>
        ) : purchases.length === 0 ? (
          <div className="no-data">No purchases found</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Base</th>
                <th>Equipment</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Created By</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase.id}>
                  <td>{new Date(purchase.purchase_date).toLocaleDateString()}</td>
                  <td>{purchase.base_name}</td>
                  <td>{purchase.equipment_name}</td>
                  <td><span className="badge">{purchase.category}</span></td>
                  <td className="quantity">{purchase.quantity}</td>
                  <td>{purchase.created_by}</td>
                  <td>{purchase.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <PurchaseForm
          bases={bases}
          equipmentTypes={equipmentTypes}
          onClose={handleCloseForm}
          onSuccess={handlePurchaseCreated}
        />
      )}
    </div>
  );
};

export default PurchaseList;
