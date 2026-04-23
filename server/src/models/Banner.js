import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: String,
  image: { type: String, required: true },
  imagePublicId: String,
  link: String,
  linkLabel: { type: String, default: 'Shop Now' },
  badge: String,
  type: { type: String, enum: ['hero', 'promo', 'announcement'], default: 'hero' },
  position: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  startsAt: Date,
  endsAt: Date,
  bgColor: String,
}, { timestamps: true });

export default mongoose.model('Banner', bannerSchema);
