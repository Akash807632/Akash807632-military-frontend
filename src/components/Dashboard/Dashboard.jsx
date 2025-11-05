import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import MetricCard from './MetricCaed';
import NetMovementModal from './NetMovementModal';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [filters, setFilters] = useState({
    base_id: user?.role === 'base_commander' ? user.base_id : '',
    equipment_type_id: '',
    start_date: '',
    end_date: ''
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);

  useEffect(() => {
    fetchBases();
    fetchEquipmentTypes();
    fetchMetrics();
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

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.base_id) params.append('base_id', filters.base_id);
      if (filters.equipment_type_id) params.append('equipment_type_id', filters.equipment_type_id);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);

      const response = await api.get(`/dashboard/metrics?${params}`);
      if (response.data.success && response.data.data) {
        setMetrics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
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
    fetchMetrics();
  };

  const handleNetMovementClick = (metric) => {
    setSelectedMetric(metric);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const calculateTotals = () => {
    return metrics.reduce((acc, metric) => ({
      opening_balance: acc.opening_balance + metric.opening_balance,
      purchases: acc.purchases + metric.purchases,
      transfers_in: acc.transfers_in + metric.transfers_in,
      transfers_out: acc.transfers_out + metric.transfers_out,
      net_movement: acc.net_movement + metric.net_movement,
      assigned: acc.assigned + metric.assigned,
      expended: acc.expended + metric.expended,
      closing_balance: acc.closing_balance + metric.closing_balance
    }), {
      opening_balance: 0,
      purchases: 0,
      transfers_in: 0,
      transfers_out: 0,
      net_movement: 0,
      assigned: 0,
      expended: 0,
      closing_balance: 0
    });
  };

  const totals = calculateTotals();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <p>Overview of military asset management</p>
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

      <div className="metrics-overview">
        <MetricCard title="Opening Balance" value={totals.opening_balance} color="#3498db" />
        <MetricCard title="Purchases" value={totals.purchases} color="#2ecc71" />
        <MetricCard title="Transfers In" value={totals.transfers_in} color="#9b59b6" />
        <MetricCard title="Transfers Out" value={totals.transfers_out} color="#e74c3c" />
        <MetricCard 
          title="Net Movement" 
          value={totals.net_movement} 
          color="#f39c12" 
          clickable
          onClick={() => handleNetMovementClick(totals)}
        />
        <MetricCard title="Assigned" value={totals.assigned} color="#1abc9c" />
        <MetricCard title="Expended" value={totals.expended} color="#e67e22" />
        <MetricCard title="Closing Balance" value={totals.closing_balance} color="#34495e" />
      </div>

      <div className="metrics-table">
        <h2>Detailed Breakdown</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : metrics.length === 0 ? (
          <div className="no-data">No data available</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Base</th>
                <th>Equipment</th>
                <th>Category</th>
                <th>Opening</th>
                <th>Purchases</th>
                <th>Transfer In</th>
                <th>Transfer Out</th>
                <th>Net Movement</th>
                <th>Assigned</th>
                <th>Expended</th>
                <th>Closing</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric, index) => (
                <tr key={index}>
                  <td>{metric.base_name}</td>
                  <td>{metric.equipment_name}</td>
                  <td>{metric.category}</td>
                  <td>{metric.opening_balance}</td>
                  <td className="positive">{metric.purchases}</td>
                  <td className="positive">{metric.transfers_in}</td>
                  <td className="negative">{metric.transfers_out}</td>
                  <td 
                    className={`clickable ${metric.net_movement >= 0 ? 'positive' : 'negative'}`}
                    onClick={() => handleNetMovementClick(metric)}
                  >
                    {metric.net_movement}
                  </td>
                  <td>{metric.assigned}</td>
                  <td>{metric.expended}</td>
                  <td><strong>{metric.closing_balance}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && selectedMetric && (
        <NetMovementModal
          metric={selectedMetric}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Dashboard;
