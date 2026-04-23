import Return from '../models/Return.js';
import Order from '../models/Order.js';

export const createReturn = async (req, res, next) => {
  try {
    const { orderNumber, reason, description, items, refundMethod, refundAccount, images } = req.body;
    const order = await Order.findOne({ orderNumber });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const deliveredStatuses = ['delivered'];
    if (!deliveredStatuses.includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Only delivered orders can be returned' });
    }

    const deliveredEntry = [...order.statusHistory].reverse().find(h => h.status === 'delivered');
    const deliveredAt = deliveredEntry ? new Date(deliveredEntry.createdAt) : new Date(order.updatedAt);
    const daysSinceDelivery = (Date.now() - deliveredAt) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery > 7) {
      return res.status(400).json({ success: false, message: 'Return window (7 days) has passed' });
    }

    const existing = await Return.findOne({ orderNumber });
    if (existing) return res.status(400).json({ success: false, message: 'Return request already exists for this order' });

    const returnRequest = await Return.create({
      order: order._id,
      orderNumber,
      customer: order.delivery,
      reason,
      description,
      items: items || order.items.map(i => ({
        productId: i.product,
        name: i.productName,
        quantity: i.quantity,
        price: i.unitPrice,
        reason,
      })),
      refundMethod,
      refundAccount,
      images: images || [],
    });

    res.status(201).json({ success: true, return: returnRequest, returnNumber: returnRequest.returnNumber });
  } catch (err) { next(err); }
};

export const getReturnByNumber = async (req, res, next) => {
  try {
    const ret = await Return.findOne({ returnNumber: req.params.number });
    if (!ret) return res.status(404).json({ success: false, message: 'Return request not found' });
    res.json({ success: true, return: ret });
  } catch (err) { next(err); }
};

export const getAllReturns = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const total = await Return.countDocuments(filter);
    const returns = await Return.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, returns, total, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

export const updateReturn = async (req, res, next) => {
  try {
    const ret = await Return.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ret) return res.status(404).json({ success: false, message: 'Return not found' });
    res.json({ success: true, return: ret });
  } catch (err) { next(err); }
};
