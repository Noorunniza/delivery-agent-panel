const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const DeliveryAgent = require('../models/DeliveryAgent');
const auth = require('../middleware/auth');

// Controller functions
const { getAssignedOrders, updateAgentOrderStatus, uploadDeliveryProof } = require('../controllers/deliveryController');

// ✅ Configure multer for proof image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

/* ----------------------------------------
    ✅ Routes for Delivery Agent Panel
---------------------------------------- */

// 🔐 Login Route
router.post('/login', async (req, res) => {
  const { agentId, password } = req.body;

  try {
    const agent = await DeliveryAgent.findOne({ agentId });
    if (!agent) {
      return res.status(401).json({ message: 'Agent ID not found' });
    }

    const isMatch = await bcrypt.compare(password, agent.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: agent._id, role: 'deliveryAgent' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      agent: {
        agentId: agent.agentId,
        name: agent.name,
        availability: agent.availability,
        vehicleType: agent.vehicleType
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 📦 Get assigned orders (includes declined orders for this agent)
router.get('/orders', auth, getAssignedOrders);

// 🔁 Update delivery status (accept/decline/progress)
router.put('/update-status/:id', auth, updateAgentOrderStatus);

// 🖼️ Upload delivery proof (image + optional note)
router.put('/upload-proof/:id', auth, upload.single('proofImage'), uploadDeliveryProof);

module.exports = router;
