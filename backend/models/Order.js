const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  addressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
  items: [
    {
      Barcode: String,
      ProductName: String,
      Price: Number,
      quantity: Number,
      image: String,
      status: {
        type: String,
        enum: ['Pending', 'Picked', 'Packed', 'Out of Stock'],
        default: 'Pending'
      }
    }
  ],
  totalPrice: Number,
  gst: Number,
  grandTotal: Number,
  paymentId: String,
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  createdAt: { type: Date, default: Date.now },
  assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  employeeStatus: {
    type: String,
    enum: ['Ready for Assembly', 'Working', 'Completed', 'Declined'],
    default: 'Ready for Assembly'
  },
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryAgent', default: null },

  // ✅ UPDATED agentStatus enum
  agentStatus: {
    type: String,
    enum: [
       'Waiting for Acceptance',
      'Ready for Pickup',
      'Picked Up',
      'Out for Delivery',
      'Reached at Destination',
      'Upload Proof',
      'Delivered Successful',
      'Declined'
    ],
    default: 'Waiting for Acceptance'
  },

  // ✅ UPDATED orderStatus enum
  orderStatus: {
    type: String,
    enum: [
      'Waiting for Acceptance',
      'Waiting for Pickup',
      'Ready for Pickup',
      'Picked Up',
      'Out for Delivery',
      'Reached at Destination',
      'Upload Proof',
      'Delivered Successful',
      'Declined by Agent',
      'Completed',
      'Declined'
      
    ],
    default: 'Waiting for Acceptance'
  },

  estimatedDeliveryTime: { type: String, default: null },
  deliveredAt: { type: Date, default: null }, // ✅ Add this
  orderAcceptedAt: { type: Date, default: null },
  deliveryProofImage: { type: String, default: null },
  customerConfirmationNote: { type: String, default: null }
});

module.exports = mongoose.model('Order', orderSchema);
