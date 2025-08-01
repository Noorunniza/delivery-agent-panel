const Order = require('../models/Order');
const User = require('../models/User'); // ✅ Ensure registered
const Address = require('../models/Address'); // ✅ Register Address model

// ✅ Get all orders assigned to the logged-in delivery agent
exports.getAssignedOrders = async (req, res) => {
  try {
    const agentId = req.user.id;
    const orders = await Order.find({ assignedAgent: agentId })
      .populate('user')
      .populate('addressId');
    res.status(200).json(orders);
  } catch (err) {
    console.error('❌ Error fetching orders:', err);
    res.status(500).json({ message: 'Failed to fetch assigned orders' });
  }
};

// ✅ Update delivery status & ETA
exports.updateAgentOrderStatus = async (req, res) => {
  const { status, orderStatus, eta } = req.body;
  const orderId = req.params.id;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.agentStatus = status;
    order.orderStatus = orderStatus || status;

    // ✅ Save ETA if provided
    if (eta) {
      order.estimatedDeliveryTime = eta;
    }

    // ✅ Save accepted time once only
    if (status === 'Ready for Pickup' && !order.orderAcceptedAt) {
      order.orderAcceptedAt = new Date();
    }

    // ✅ If delivery is completed, set delivery timestamp
    if (status === 'Delivered Successful') {
      order.deliveredAt = new Date();
    }

    await order.save();
    res.status(200).json({ message: "Order status updated", order });
  } catch (err) {
    console.error('❌ Error updating status:', err);
    res.status(500).json({ message: "Error updating status" });
  }
};


// ✅ Upload delivery proof image + optional note
exports.uploadDeliveryProof = async (req, res) => {
  const orderId = req.params.id;
  const { note } = req.body;
  const file = req.file;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // ✅ Validation: If image not uploaded
    if (!file) {
      return res.status(400).json({ message: 'You must upload a delivery proof image before proceeding.' });
    }

    // ✅ Save proof image and note
    order.deliveryProofImage = file.filename;
    order.customerConfirmationNote = note || '';
    order.agentStatus = 'Delivered Successful';
    order.orderStatus = 'Delivered Successful';
      order.deliveredAt = new Date(); // ✅ Save delivery time
    await order.save();

    res.status(200).json({ message: 'Proof uploaded successfully', order });
  } catch (err) {
    console.error('❌ Error uploading proof:', err);
    res.status(500).json({ message: 'Failed to upload proof' });
  }
};
