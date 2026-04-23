import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestName: String,
  guestEmail: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: String,
  comment: { type: String, required: true },
  images: [String],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  helpfulCount: { type: Number, default: 0 },
  verifiedPurchase: { type: Boolean, default: false },
}, { timestamps: true });

reviewSchema.post('save', async function () {
  const Product = mongoose.model('Product');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { product: this.product, status: 'approved' } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.product, {
      avgRating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  }
});

export default mongoose.model('Review', reviewSchema);
