import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Review from '../models/Review.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const [
      totalRevenue,
      monthlyRevenue,
      lastMonthRevenue,
      totalOrders,
      todayOrders,
      totalProducts,
      totalCustomers,
      pendingReviews,
      recentOrders,
      statusCounts,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: thisMonth }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: lastMonth, $lte: lastMonthEnd }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } },
      ]),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Product.countDocuments({ status: 'active' }),
      User.countDocuments({ role: 'customer' }),
      Review.countDocuments({ status: 'pending' }),
      Order.find({}).populate('customer', 'name').sort({ createdAt: -1 }).limit(10),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    const monthRev = monthlyRevenue[0]?.total || 0;
    const lastMonRev = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = lastMonRev > 0 ? ((monthRev - lastMonRev) / lastMonRev) * 100 : 0;

    res.json({
      success: true,
      stats: {
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue: monthRev,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        totalOrders,
        todayOrders,
        totalProducts,
        totalCustomers,
        pendingReviews,
      },
      recentOrders,
      statusCounts: Object.fromEntries(statusCounts.map(s => [s._id, s.count])),
    });
  } catch (err) { next(err); }
};

export const getRevenueChart = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$pricing.total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const getCategoryChart = async (req, res, next) => {
  try {
    const data = await Order.aggregate([
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $lookup: { from: 'categories', localField: 'product.category', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $group: { _id: '$category.name', revenue: { $sum: '$items.subtotal' }, count: { $sum: '$items.quantity' } } },
      { $sort: { revenue: -1 } },
      { $limit: 6 },
    ]);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const getCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (page - 1) * limit;
    const filter = { role: 'customer' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    const [customers, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, customers, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

export const getLowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      status: 'active',
      'inventory.trackInventory': true,
      $expr: { $lte: ['$inventory.quantity', '$inventory.lowStockThreshold'] },
    }).populate('category', 'name').sort({ 'inventory.quantity': 1 }).limit(20);
    res.json({ success: true, products });
  } catch (err) { next(err); }
};
