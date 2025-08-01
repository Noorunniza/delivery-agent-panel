import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DeliveryAgentLogin from './components/DeliveryAgentLogin';
import DeliveryDashboard from './components/DeliveryDashboard';
import UploadProof from './components/UploadProof';
import OrderDetail from './components/OrderDetail';
import ThankYou from './components/ThankYou';
function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Redirect '/' to '/login' */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* ✅ Login route */}
        <Route path="/login" element={<DeliveryAgentLogin />} />

        {/* ✅ Delivery Dashboard and Upload Proof */}
        <Route path="/delivery-dashboard" element={<DeliveryDashboard />} />
        <Route path="/upload-proof/:id" element={<UploadProof />} />
        <Route path="/order/:id" element={<OrderDetail />} />
       <Route path="/thank-you" element={<ThankYou />} />

      </Routes>
    </Router>
  );
}

export default App;
