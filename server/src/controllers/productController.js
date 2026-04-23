import Product from '../models/Product.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import { paginate, buildPaginationMeta } from '../utils/helpers.js';
import { deleteImage } from '../config/cloudinary.js';

export const getProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const { category, search, sort, minPrice, maxPrice, badge, color, rating, status = 'active' } = req.query;

    const filter = {};
    if (status !== 'all') filter.status = status;

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) filter.category = cat._id;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (minPrice || maxPrice) {
      const min = parseFloat(minPrice || 0);
      const max = parseFloat(maxPrice || 999999);
      filter.$or = [
        { 'pricing.sale': { $gte: min, $lte: max } },
        { 'pricing.regular': { $gte: min, $lte: max } },
      ];
    }

    if (badge) filter.badges = badge;

    if (color) {
      filter.attributes = { $elemMatch: { name: /color/i, value: new RegExp(color, 'i') } };
    }

    if (rating) {
      filter.avgRating = { $gte: parseFloat(rating) };
    }

    const sortMap = {
      newest: { createdAt: -1 },
      popular: { salesCount: -1 },
      'price-low': { 'pricing.regular': 1 },
      'price-high': { 'pricing.regular': -1 },
      rating: { avgRating: -1 },
    };
    const sortOption = sortMap[sort] || sortMap.newest;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug icon')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true }),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      products,
      pagination: buildPaginationMeta(total, page, limit),
    });
  } catch (err) { next(err); }
};

export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = id.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: id }
      : { slug: id };

    const product = await Product.findOne(query)
      .populate('category', 'name slug icon')
      .populate('relatedProducts', 'name slug images pricing avgRating')
      .lean({ virtuals: true });

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Increment view count
    Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } }).exec();

    // Get suggested products from same category
    const suggested = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      status: 'active',
    })
      .sort({ salesCount: -1 })
      .limit(8)
      .lean({ virtuals: true });

    res.json({ success: true, product, suggested });
  } catch (err) { next(err); }
};

export const createProduct = async (req, res, next) => {
  try {
    const productData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
    const product = await Product.create(productData);

    await Category.findByIdAndUpdate(product.category, { $inc: { productCount: 1 } });

    res.status(201).json({ success: true, message: 'Product created', product });
  } catch (err) { next(err); }
};

export const updateProduct = async (req, res, next) => {
  try {
    const updateData = typeof req.body.data === 'string'
      ? JSON.parse(req.body.data)
      : req.body;

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).lean({ virtuals: true });

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product updated', product });
  } catch (err) { next(err); }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    for (const img of product.images) {
      if (img.publicId) await deleteImage(img.publicId).catch(() => {});
    }

    await Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } });
    await product.deleteOne();

    res.json({ success: true, message: 'Product deleted' });
  } catch (err) { next(err); }
};

export const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ status: 'active', badges: 'featured' })
      .sort({ salesCount: -1 })
      .limit(8)
      .lean({ virtuals: true });
    res.json({ success: true, products });
  } catch (err) { next(err); }
};

export const getNewArrivals = async (req, res, next) => {
  try {
    const products = await Product.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean({ virtuals: true });
    res.json({ success: true, products });
  } catch (err) { next(err); }
};

export const getBestSellers = async (req, res, next) => {
  try {
    const products = await Product.find({ status: 'active' })
      .sort({ salesCount: -1 })
      .limit(8)
      .lean({ virtuals: true });
    res.json({ success: true, products });
  } catch (err) { next(err); }
};

export const getDealOfTheDay = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      status: 'active',
      'pricing.sale': { $exists: true },
      badges: 'sale',
    })
      .sort({ salesCount: -1 })
      .lean({ virtuals: true });
    res.json({ success: true, product });
  } catch (err) { next(err); }
};

export const toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.id;
    const index = user.wishlist.findIndex(id => id.toString() === productId);
    if (index > -1) {
      user.wishlist.splice(index, 1);
    } else {
      user.wishlist.push(productId);
    }
    await user.save();
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) { next(err); }
};

export const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      match: { status: 'active' },
    }).lean({ virtuals: true });
    res.json({ success: true, products: user.wishlist });
  } catch (err) { next(err); }
};
