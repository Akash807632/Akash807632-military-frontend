import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import AssignmentForm from './AssignmentForm';
import './Assignments.css';

const AssignmentList = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('assignments');
  const [data, setData] = useState([]);
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
    fetchData();
  }, [activeTab]);

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

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.base_id) params.append('base_id', filters.base_id);
      if (filters.equipment_type_id) params.append('equipment_type_id', filters.equipment_type_id);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);

      const endpoint = activeTab === 'assignments' ? '/assignments/assignments' : '/assignments/expenditures';
      const response = await api.get(`${endpoint}?${params}`);
      
      if (response.data.success && response.data.data) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
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
    fetchData();
  };

  const handleDataCreated = () => {
    setShowForm(false);
    fetchData();
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const canCreate = user?.role === 'admin' || user?.role === 'base_commander';

  return (
    <div className="assignments-container">
      <div className="page-header">
        <div>
          <h1>👥 Assignments & Expenditures</h1>
          <p>Track asset assignments and expenditures</p>
        </div>
        {canCreate && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + New {activeTab === 'assignments' ? 'Assignment' : 'Expenditure'}
          </button>
        )}
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments
        </button>
        <button
          className={`tab ${activeTab === 'expenditures' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenditures')}
        >
          Expenditures
        </button>
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
          <div className="loading">Loading {activeTab}...</div>
        ) : data.length === 0 ? (
          <div className="no-data">No {activeTab} found</div>
        ) : activeTab === 'assignments' ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Base</th>
                <th>Equipment</th>
                <th>Category</th>
                <th>Personnel</th>
                <th>Rank</th>
                <th>Quantity</th>
                <th>Created By</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.assignment_date).toLocaleDateString()}</td>
                  <td>{item.base_name}</td>
                  <td>{item.equipment_name}</td>
                  <td><span className="badge">{item.category}</span></td>
                  <td>{item.personnel_name}</td>
                  <td>{item.personnel_rank || '-'}</td>
                  <td className="quantity">{item.quantity}</td>
                  <td>{item.created_by}</td>
                  <td>{item.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Base</th>
                <th>Equipment</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Reason</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.expenditure_date).toLocaleDateString()}</td>
                  <td>{item.base_name}</td>
                  <td>{item.equipment_name}</td>
                  <td><span className="badge">{item.category}</span></td>
                  <td className="quantity">{item.quantity}</td>
                  <td>{item.reason}</td>
                  <td>{item.created_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <AssignmentForm
          type={activeTab}
          bases={bases}
          equipmentTypes={equipmentTypes}
          onClose={handleCloseForm}
          onSuccess={handleDataCreated}
        />
      )}
    </div>
  );
};

export default AssignmentList;
