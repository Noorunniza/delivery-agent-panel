import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/OrderDetail.css';
import { motion } from 'framer-motion';
import {
  FaBoxOpen, FaTruckLoading, FaShippingFast, FaMapMarkerAlt,
  FaUpload, FaCheckCircle, FaReceipt, FaMoneyBillWave,
  FaUser, FaHome, FaCube
} from 'react-icons/fa';

const statusSteps = [
  { label: 'Ready for Pickup', icon: <FaBoxOpen /> },
  { label: 'Picked Up', icon: <FaTruckLoading /> },
  { label: 'Out for Delivery', icon: <FaShippingFast /> },
  { label: 'Reached at Destination', icon: <FaMapMarkerAlt /> },
  { label: 'Upload Proof', icon: <FaUpload /> },
  { label: 'Delivered Successful', icon: <FaCheckCircle /> },
];

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/agents/orders`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const currentOrder = res.data.find((o) => o._id === id);
        setOrder(currentOrder);
        setAssignedOrders(res.data); // ✅ Store all assigned orders
      } catch (err) {
        console.error('❌ Error fetching order:', err);
      }
    };
    fetchOrder();
  }, [id]);

  const updateStatus = async (step, eta = null) => {
    if (!order?._id) return alert("Order not found");

    try {
      const res = await axios.put(
        `http://localhost:5000/api/agents/update-status/${order._id}`,
        { status: step, orderStatus: step, eta },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      const updatedOrder = res.data.order || res.data;
      setOrder((prev) => ({
        ...prev,
        agentStatus: updatedOrder.agentStatus,
        orderStatus: updatedOrder.orderStatus,
        estimatedDeliveryTime: updatedOrder.estimatedDeliveryTime,
        deliveredAt: updatedOrder.deliveredAt || prev.deliveredAt,
        orderAcceptedAt: updatedOrder.orderAcceptedAt || prev.orderAcceptedAt, // ✅ NEW
      }));
    } catch (err) {
      console.error('❌ Status update failed:', err);
      alert('Failed to update status');
    }
  };

  const handleClick = async (stepLabel) => {
    if (order.agentStatus === 'Delivered Successful') {
      return setError('✅ You have already completed the delivery.');
    }

    const currentIndex = statusSteps.findIndex((s) => s.label === order.agentStatus);
    const stepIndex = statusSteps.findIndex((s) => s.label === stepLabel);

    if (stepIndex > currentIndex + 1) {
      return setError('Please complete previous steps first.');
    }

    setError('');

    const confirm = window.confirm(`Mark this step as "${stepLabel}"?`);
    if (!confirm) return;

    if (stepLabel === 'Upload Proof') {
      return navigate(`/upload-proof/${order._id}`);
    }

    if (stepLabel === 'Out for Delivery') {
      const eta = prompt('Enter ETA (e.g., 15–20 minutes):');
      if (!eta) return;
      await updateStatus(stepLabel, eta);
      return;
    }

    if (stepLabel === 'Delivered Successful') {
      await updateStatus(stepLabel);
      navigate(`/thank-you`);
      return;
    }

    await updateStatus(stepLabel);
  };

  const handleDecline = async () => {
    const confirm = window.confirm('Are you sure you want to decline this order?');
    if (!confirm) return;
    try {
      await updateStatus('Declined');
      alert('✅ Order Declined');
      navigate('/delivery-dashboard');
    } catch (err) {
      console.error('Decline failed:', err);
      alert('❌ Could not decline the order');
    }
  };
  const remainingCount = assignedOrders.filter(
  (o) =>
    o.agentStatus !== 'Delivered Successful' &&
    o.agentStatus !== 'Declined'
).length;



  if (!order) return <p>Loading...</p>;

  return (
    <div className="order-detail">
      <h2><FaReceipt style={{ color: '#4caf50' }} /> Order Details</h2>

      <p><strong><FaReceipt /> Order ID:</strong> {order._id}</p>
      <p><strong><FaMoneyBillWave style={{ color: '#009688' }} /> Total:</strong> ₹{order.totalPrice}</p>
      <p><strong><FaCheckCircle style={{ color: '#4caf50' }} /> Status:</strong> {order.agentStatus}</p>

      {/* ✅ ETA display */}
      {order.estimatedDeliveryTime && (
        <p><strong>🕒 ETA:</strong> {order.estimatedDeliveryTime}</p>
      )}

      {/* ✅ Accepted At display */}
      {order.orderAcceptedAt && (
        <p><strong>📥 Accepted At:</strong> {new Date(order.orderAcceptedAt).toLocaleString()}</p>
      )}

      {/* ✅ Delivered time display */}
      {order.deliveredAt && (
        <p><strong>📦 Delivered At:</strong> {new Date(order.deliveredAt).toLocaleString()}</p>
      )}

      <h4><FaUser style={{ color: '#3f51b5' }} /> Customer</h4>
      <p>{order.user?.name}, {order.user?.phone_no}</p>

      <h4><FaHome style={{ color: '#ff5722' }} /> Address</h4>
      <p>{order.addressId?.house_building_name}, {order.addressId?.street_area}, {order.addressId?.locality}, {order.addressId?.city}</p>

      <h4><FaCube style={{ color: '#795548' }} /> Items</h4>
      <ul>
        {order.items.map((item, idx) => (
          <li key={idx}>📦 {item.ProductName} (x{item.quantity})</li>
        ))}
      </ul>

      {error && <p className="error">{error}</p>}

      {order.agentStatus === 'Waiting for Acceptance' ? (
        <div className="actions">
          <button onClick={() => updateStatus('Ready for Pickup')}>✅ Accept</button>
          <button onClick={handleDecline}>❌ Decline</button>
        </div>
      ) : order.agentStatus === 'Declined' ? (
        <p className="declined">❌ You declined this order.</p>
      ) : (
        <div className={`status-bar ${order.agentStatus === 'Delivered Successful' ? 'disabled' : ''}`}>
          {statusSteps.map((step, i) => {
            const isActive = statusSteps.findIndex(s => s.label === order.agentStatus) >= i;
            return (
              <motion.div
                key={i}
                className={`status-step ${isActive ? 'active' : ''}`}
                onClick={() => handleClick(step.label)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <div className="step-icon">{step.icon}</div>
                <div className="step-label">{step.label}</div>
                {step.label === 'Out for Delivery' && order.estimatedDeliveryTime && (
                  <div className="eta-badge">ETA: {order.estimatedDeliveryTime}</div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="card-bottom-bar">
       <p className="remaining-orders">📦 Remaining Orders: {remainingCount}</p>

        <button className="back-button" onClick={() => navigate('/delivery-dashboard')}>
          ⬅️ Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default OrderDetail;
