// src/components/AgentDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/DeliveryDashboard.css';
import { FaBoxOpen, FaHistory, FaTimesCircle, FaTruckMoving, FaCheckCircle } from 'react-icons/fa';

const statusSteps = [
  'Ready for Pickup',
  'Picked Up',
  'Out for Delivery',
  'Reached at Destination',
  'Upload Proof',
  'Delivered Successful'
];

const AgentDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [viewMode, setViewMode] = useState('assigned');
  const [searchDate, setSearchDate] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/agents/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
    };
    fetchOrders();
  }, []);

  const isAccepted = (status) => statusSteps.includes(status);

  let filteredOrders = orders.filter(order => {
    if (viewMode === 'assigned') return order.agentStatus !== 'Delivered Successful' && order.agentStatus !== 'Declined';
    if (viewMode === 'history') {
      const isDelivered = order.agentStatus === 'Delivered Successful';
      if (!isDelivered) return false;
      if (searchDate) {
        const deliveredDate = new Date(order.updatedAt || order.createdAt).toISOString().split('T')[0];
        return deliveredDate === searchDate;
      }
      return true;
    }
    if (viewMode === 'declined') return order.agentStatus === 'Declined';
    return true;
  });

  if (viewMode === 'history') {
    filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const viewTitle = {
    assigned: 'Assigned Orders',
    history: 'Delivered Orders History',
    declined: 'Declined Orders'
  }[viewMode];

  return (
    <div className="dashboard-container">
      <div className="welcome-banner">
  <h3>👋 Welcome back, Agent!</h3>
  <p>🚚 Wish you a safe and smooth drive today!</p>
</div>

      <header className="dashboard-header">
        <h2 className="dashboard-title">{viewTitle}</h2>
        <div className="view-toggle">
          <button className={viewMode === 'assigned' ? 'active' : ''} onClick={() => setViewMode('assigned')}><FaBoxOpen /> Assigned</button>
          <button className={viewMode === 'history' ? 'active' : ''} onClick={() => setViewMode('history')}><FaHistory /> History</button>
          <button className={viewMode === 'declined' ? 'active' : ''} onClick={() => setViewMode('declined')}><FaTimesCircle /> Declined</button>
        </div>

        {viewMode === 'history' && (
          <div className="date-filter">
            <label htmlFor="date">📅 Filter by Date:</label>
            <input
              type="date"
              id="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
            />
            {searchDate && (
              <button className="clear-date" onClick={() => setSearchDate('')}>Clear</button>
            )}
          </div>
        )}
      </header>

      <main className="dashboard-main">
        {filteredOrders.length === 0 ? (
          <p className="no-orders">No {viewTitle.toLowerCase()} found.</p>
        ) : (
          filteredOrders.map(order => (
            <Link to={`/order/${order._id}`} className="order-card-link" key={order._id}>
              <div className={`order-card fade-in ${isAccepted(order.agentStatus) && order.agentStatus !== 'Delivered Successful' ? 'active' : ''}`}>
                <div className="order-id">
                  <span className="label">Order ID:</span> {order._id}
                </div>
                <div className="order-info">
                  <p><span>Total:</span> ₹{order.totalPrice}</p>
                  <p><span>Date:</span> {new Date(order.createdAt).toLocaleString()}</p>
                  <p><span>Status:</span> {order.agentStatus}</p>
                </div>
                {isAccepted(order.agentStatus) && order.agentStatus !== 'Delivered Successful' && (
                  <p className="status-indicator"><FaTruckMoving /> In Progress</p>
                )}
                {order.agentStatus === 'Delivered Successful' && (
                  <p className="status-complete"><FaCheckCircle /> Delivered</p>
                )}
              </div>
            </Link>
          ))
        )}
      </main>
    </div>
  );
};

export default AgentDashboard;
