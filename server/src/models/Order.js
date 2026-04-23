import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: String,
  productSku: String,
  productImage: String,
  variantInfo: String,
  unitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true },
});

const statusHistorySchema = new mongoose.Schema({
  status: String,
  note: String,
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestInfo: {
    name: String,
    email: String,
    phone: String,
  },
  items: [orderItemSchema],
  pricing: {
    subtotal: { type: Number, required: true },
    deliveryCharge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  coupon: {
    code: String,
    discountAmount: Number,
  },
  delivery: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    street: String,
    area: String,
    city: String,
    fullAddress: String,
  },
  payment: {
    method: {
      type: String,
      enum: ['cod', 'bkash', 'nagad', 'card', 'online'],
      default: 'cod',
    },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    transactionId: String,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  statusHistory: [statusHistorySchema],
  notes: String,
  estimatedDelivery: Date,
}, { timestamps: true });

orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const random = Math.floor(10000 + Math.random() * 90000);
    this.orderNumber = `ORD-${dateStr}-${random}`;
  }
  next();
});

export default mongoose.model('Order', orderSchema);
