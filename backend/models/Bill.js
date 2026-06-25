const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, default: 1, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: Number
});

const billSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  items: {
    type: [billItemSchema],
    validate: {
      validator: function(v) { return v && v.length > 0; },
      message: 'At least one item is required'
    }
  },
  subtotal: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'insurance', 'bank-transfer', 'online']
  },
  amountPaid: { type: Number, default: 0 },
  balanceDue: { type: Number, default: 0 },
  paidAt: Date,
  notes: String,
  billId: { type: String, unique: true },
  billDate: { type: Date, default: Date.now },
  dueDate: Date
}, { timestamps: true });

billSchema.pre('save', async function() {

  // Generate Bill ID
  if (!this.billId) {
    let isUnique = false;
    let billId;
    const year = new Date().getFullYear();
    while (!isUnique) {
      const count = await this.constructor.countDocuments();
      const random = Math.floor(Math.random() * 1000);
      billId = `BILL-${year}-${String(count + random + 1).padStart(5, '0')}`;
      const existing = await this.constructor.findOne({ billId });
      if (!existing) isUnique = true;
    }
    this.billId = billId;
  }

  // Calculate total for each item
  if (this.items && this.items.length > 0) {
    this.items.forEach(item => {
      item.total = Number(item.quantity) * Number(item.unitPrice);
    });

    // Calculate subtotal
    this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  }

  // Ensure discount and taxRate are numbers
  const discount = Number(this.discount) || 0;
  const taxRate = Number(this.taxRate) || 0;

  // Calculate tax amount
  this.taxAmount = (this.subtotal - discount) * (taxRate / 100);

  // Calculate total amount
  this.totalAmount = this.subtotal - discount + this.taxAmount;

  // Calculate balance due
  const amountPaid = Number(this.amountPaid) || 0;
  this.balanceDue = this.totalAmount - amountPaid;

  // Set due date if not set
  if (!this.dueDate) {
    const due = new Date();
    due.setDate(due.getDate() + 30);
    this.dueDate = due;
  }
});

module.exports = mongoose.model('Bill', billSchema);