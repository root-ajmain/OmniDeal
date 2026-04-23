import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import { paginate, buildPaginationMeta, calcDeliveryCharge } from '../utils/helpers.js';
import { sendEmail } from '../config/email.js';
import { orderConfirmationTemplate, orderStatusTemplate } from '../utils/emailTemplates.js';

export const createOrder = async (req, res, next) => {
  try {
    const { items, delivery, payment, couponCode, notes } = req.body;

    // Validate & build order items
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.status !== 'active') {
        return res.status(400).json({ success: false, message: `Product ${item.productId} not available` });
      }
      if (product.inventory.trackInventory && product.inventory.quantity < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }
      const price = product.pricing.sale || product.pricing.regular;
      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;
      orderItems.push({
        product: product._id,
        productName: product.name,
        productSku: product.sku,
        productImage: product.images.find(i => i.isFeatured)?.url || product.images[0]?.url,
        variantInfo: item.variantInfo,
        unitPrice: price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    // Delivery charge
    const deliveryCharge = calcDeliveryCharge(delivery.city, subtotal);

    // Coupon
    let discount = 0;
    let couponData = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon && coupon.isValid()) {
        discount = coupon.calculateDiscount(subtotal);
        couponData = { code: coupon.code, discountAmount: discount };
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    const total = Math.max(0, subtotal + deliveryCharge - discount);

    // Find or create customer record for guests
    let customerId = req.user?._id;
    if (!req.user && delivery.phone) {
      const guestEmail = delivery.email || `guest_${delivery.phone.replace(/\D/g, '')}@omnideal.guest`;
      let customer = delivery.email
        ? await User.findOne({ $or: [{ email: delivery.email }, { phone: delivery.phone }], role: 'customer' })
        : await User.findOne({ phone: delivery.phone, role: 'customer' });
      if (!customer) {
        customer = await User.create({ name: delivery.name, email: guestEmail, phone: delivery.phone, role: 'customer' });
      } else {
        if (!customer.phone) { customer.phone = delivery.phone; await customer.save({ validateBeforeSave: false }); }
      }
      customerId = customer._id;
    }

    const order = await Order.create({
      customer: customerId,
      guestInfo: !req.user ? { name: delivery.name, email: delivery.email, phone: delivery.phone } : undefined,
      items: orderItems,
      pricing: { subtotal, deliveryCharge, discount, total },
      coupon: couponData,
      delivery,
      payment: { method: payment?.method || 'cod' },
      notes,
      statusHistory: [{ status: 'pending', note: 'Order placed' }],
    });

    // Update stock & sales count
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: {
          'inventory.quantity': -item.quantity,
          salesCount: item.quantity,
        },
      });
    }

    // Send confirmation email
    if (delivery.email) {
      sendEmail({
        to: delivery.email,
        subject: `Order Confirmed - ${order.orderNumber}`,
        html: orderConfirmationTemplate(order),
      }).catch(() => {});
    }

    res.status(201).json({ success: true, message: 'Order placed successfully', order });
  } catch (err) { next(err); }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const filter = req.user
      ? { customer: req.user._id }
      : { 'guestInfo.phone': req.query.phone };

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);
    res.json({ success: true, orders, pagination: buildPaginationMeta(total, page, limit) });
  } catch (err) { next(err); }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      $or: [{ _id: req.params.id }, { orderNumber: req.params.id }],
    }).populate('customer', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) { next(err); }
};

export const trackOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        statusHistory: order.statusHistory,
        items: order.items,
        pricing: order.pricing,
        delivery: order.delivery,
        payment: { method: order.payment.method, status: order.payment.status },
        createdAt: order.createdAt,
        estimatedDelivery: order.estimatedDelivery,
      },
    });
  } catch (err) { next(err); }
};

export const trackByPhone = async (req, res, next) => {
  try {
    const { phone } = req.params;
    if (!phone || phone.replace(/\D/g, '').length < 8) {
      return res.status(400).json({ success: false, message: 'Enter a valid phone number' });
    }
    const orders = await Order.find({
      $or: [{ 'delivery.phone': phone }, { 'guestInfo.phone': phone }],
    })
      .select('orderNumber status createdAt pricing delivery.name items')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, orders, count: orders.length });
  } catch (err) { next(err); }
};

// Admin controllers
export const getAllOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const { search, status, payment } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (payment) filter['payment.status'] = payment;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'delivery.name': { $regex: search, $options: 'i' } },
        { 'delivery.phone': { $regex: search, $options: 'i' } },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter).populate('customer', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);
    res.json({ success: true, orders, pagination: buildPaginationMeta(total, page, limit) });
  } catch (err) { next(err); }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, note, changedBy: req.user._id });
    await order.save();

    // Email notification for key statuses
    if (['confirmed', 'shipped', 'delivered'].includes(status)) {
      const email = order.delivery.email || order.guestInfo?.email;
      if (email) {
        sendEmail({
          to: email,
          subject: `Order ${status} - ${order.orderNumber}`,
          html: orderStatusTemplate(order, status),
        }).catch(() => {});
      }
    }

    res.json({ success: true, message: 'Order status updated', order });
  } catch (err) { next(err); }
};
