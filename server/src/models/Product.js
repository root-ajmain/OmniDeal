import mongoose from 'mongoose';
import slugify from 'slugify';

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: String,
  isFeatured: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
});

const variantOptionSchema = new mongoose.Schema({
  value: String,
  priceModifier: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
});

const variantSchema = new mongoose.Schema({
  name: String,
  options: [variantOptionSchema],
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  sku: { type: String, unique: true, sparse: true },
  description: { type: String, required: true },
  shortDescription: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  images: [imageSchema],
  pricing: {
    regular: { type: Number, required: true },
    sale: { type: Number },
  },
  inventory: {
    quantity: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    trackInventory: { type: Boolean, default: true },
  },
  variants: [variantSchema],
  attributes: [{ name: String, value: String }],
  tags: [String],
  badges: [{ type: String, enum: ['new', 'sale', 'hot', 'featured', 'limited'] }],
  status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'active' },
  salesCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  seo: {
    metaTitle: String,
    metaDescription: String,
  },
  relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

productSchema.pre('save', async function (next) {
  if (this.isModified('name')) {
    const base = slugify(this.name, { lower: true, strict: true });
    let slug = base;
    let count = 1;
    while (await mongoose.model('Product').findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${base}-${count++}`;
    }
    this.slug = slug;
  }
  if (this.isModified('pricing.sale') || this.isModified('pricing')) {
    if (this.pricing.sale) {
      if (!this.badges.includes('sale')) this.badges.push('sale');
    } else {
      this.badges = this.badges.filter(b => b !== 'sale');
    }
  }
  next();
});

productSchema.virtual('featuredImage').get(function () {
  if (!this.images?.length) return null;
  const featured = this.images.find(img => img.isFeatured);
  return featured || this.images[0] || null;
});

productSchema.virtual('isOnSale').get(function () {
  return !!(this.pricing?.sale && this.pricing.sale < this.pricing?.regular);
});

productSchema.virtual('discountPercent').get(function () {
  if (!this.isOnSale) return 0;
  return Math.round(((this.pricing.regular - this.pricing.sale) / this.pricing.regular) * 100);
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

productSchema.index({ name: 'text', tags: 'text', description: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'pricing.sale': 1 });

export default mongoose.model('Product', productSchema);
