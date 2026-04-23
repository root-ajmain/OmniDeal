import mongoose from 'mongoose';

const flashSaleItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  salePrice: { type: Number, required: true },
  stockLimit: { type: Number, default: 0 },
  soldCount: { type: Number, default: 0 },
});

const flashSaleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  startsAt: { type: Date, required: true },
  endsAt: { type: Date, required: true },
  items: [flashSaleItemSchema],
  isActive: { type: Boolean, default: true },
  badge: { type: String, default: 'Flash Sale' },
}, { timestamps: true });

flashSaleSchema.virtual('isLive').get(function () {
  const now = new Date();
  return this.isActive && this.startsAt <= now && this.endsAt >= now;
});
flashSaleSchema.set('toJSON', { virtuals: true });

export default mongoose.model('FlashSale', flashSaleSchema);
