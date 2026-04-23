import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: String,
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: Number,
  usageLimit: { type: Number, default: null },
  usedCount: { type: Number, default: 0 },
  perUserLimit: { type: Number, default: 1 },
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  expiresAt: Date,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

couponSchema.methods.isValid = function () {
  if (this.status !== 'active') return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  if (this.usageLimit && this.usedCount >= this.usageLimit) return false;
  return true;
};

couponSchema.methods.calculateDiscount = function (subtotal) {
  if (!this.isValid()) return 0;
  if (subtotal < this.minOrderAmount) return 0;
  let discount = this.type === 'percentage'
    ? (subtotal * this.value) / 100
    : this.value;
  if (this.maxDiscount) discount = Math.min(discount, this.maxDiscount);
  return Math.round(discount);
};

export default mongoose.model('Coupon', couponSchema);
