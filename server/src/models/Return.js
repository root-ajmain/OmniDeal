import mongoose from 'mongoose';

const returnSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  orderNumber: { type: String, required: true },
  customer: {
    name: String,
    phone: String,
    email: String,
  },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    quantity: Number,
    price: Number,
    reason: String,
  }],
  reason: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'refunded', 'exchanged'],
    default: 'pending',
  },
  refundAmount: Number,
  refundMethod: { type: String, enum: ['bkash', 'nagad', 'bank', 'store_credit'] },
  refundAccount: String,
  adminNote: String,
  images: [String],
  returnNumber: { type: String, unique: true },
}, { timestamps: true });

returnSchema.pre('save', function (next) {
  if (!this.returnNumber) {
    const ts = Date.now().toString(36).toUpperCase();
    const rnd = Math.floor(1000 + Math.random() * 9000);
    this.returnNumber = `RTN-${ts}-${rnd}`;
  }
  next();
});

export default mongoose.model('Return', returnSchema);
