import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/DeliveryDashboard.css';
import {
  FaBoxOpen,
  FaHistory,
  FaTimesCircle,
  FaTruckMoving,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';

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

  // From/To date states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

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

  // Filtering orders based on view
  let filteredOrders = orders.filter(order => {
    if (viewMode === 'assigned') {
      return order.agentStatus !== 'Delivered Successful' && order.agentStatus !== 'Declined';
    }

    if (viewMode === 'history') {
      const isDelivered = order.agentStatus === 'Delivered Successful';
      if (!isDelivered) return false;

      const deliveredDate = new Date(order.deliveredAt || order.updatedAt || order.createdAt)
        .toISOString()
        .split('T')[0];

      if (fromDate && deliveredDate < fromDate) return false;
      if (toDate && deliveredDate > toDate) return false;

      return true;
    }

    if (viewMode === 'declined') {
      return order.agentStatus === 'Declined';
    }

    return true;
  });

  if (viewMode === 'history') {
    filteredOrders.sort(
      (a, b) => new Date(b.deliveredAt || b.updatedAt || b.createdAt) - new Date(a.deliveredAt || a.updatedAt || a.createdAt)
    );
  }

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (direction) => {
    if (direction === 'prev' && currentPage > 1) setCurrentPage(prev => prev - 1);
    if (direction === 'next' && currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  // Reset page when filter/view changes
  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode, fromDate, toDate]);

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
          <button
            className={viewMode === 'assigned' ? 'active' : ''}
            onClick={() => setViewMode('assigned')}
          >
            <FaBoxOpen /> Assigned
          </button>
          <button
            className={viewMode === 'history' ? 'active' : ''}
            onClick={() => setViewMode('history')}
          >
            <FaHistory /> History
          </button>
          <button
            className={viewMode === 'declined' ? 'active' : ''}
            onClick={() => setViewMode('declined')}
          >
            <FaTimesCircle /> Declined
          </button>
        </div>

        {/* From/To Date Filter (History only) */}
        {viewMode === 'history' && (
          <div className="date-filter">
            <label htmlFor="fromDate">📅 From:</label>
            <input
              type="date"
              id="fromDate"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <label htmlFor="toDate">To:</label>
            <input
              type="date"
              id="toDate"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
            {(fromDate || toDate) && (
              <button
                className="clear-date"
                onClick={() => { setFromDate(''); setToDate(''); }}
              >
                Clear
              </button>
            )}
          </div>
        )}
      </header>

      <main className="dashboard-main">
        {filteredOrders.length === 0 ? (
          <p className="no-orders">No {viewTitle.toLowerCase()} found.</p>
        ) : (
          currentOrders.map(order => (
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

      {/* Pagination Controls */}
      <div className="pagination-controls">
        <button onClick={() => handlePageChange('prev')} disabled={currentPage === 1}>
          <FaChevronLeft /> Prev
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => handlePageChange('next')} disabled={currentPage === totalPages}>
          Next <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

export default AgentDashboard;
