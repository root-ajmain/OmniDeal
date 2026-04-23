import Coupon from '../models/Coupon.js';
import { paginate, buildPaginationMeta } from '../utils/helpers.js';

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon || !coupon.isValid()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired coupon' });
    }
    if (subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order ৳${coupon.minOrderAmount} required`,
      });
    }
    const discount = coupon.calculateDiscount(subtotal);
    res.json({ success: true, discount, coupon: { code: coupon.code, description: coupon.description, type: coupon.type, value: coupon.value } });
  } catch (err) { next(err); }
};

// Admin CRUD
export const getCoupons = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const [coupons, total] = await Promise.all([
      Coupon.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Coupon.countDocuments(),
    ]);
    res.json({ success: true, coupons, pagination: buildPaginationMeta(total, page, limit) });
  } catch (err) { next(err); }
};

export const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, message: 'Coupon created', coupon });
  } catch (err) { next(err); }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, message: 'Coupon updated', coupon });
  } catch (err) { next(err); }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) { next(err); }
};
