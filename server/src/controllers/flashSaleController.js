import FlashSale from '../models/FlashSale.js';

export const getLiveFlashSale = async (req, res, next) => {
  try {
    const now = new Date();
    const sale = await FlashSale.findOne({
      isActive: true,
      startsAt: { $lte: now },
      endsAt: { $gte: now },
    }).populate({ path: 'items.product', select: 'name slug images pricing inventory badges category avgRating reviewCount' });
    res.json({ success: true, sale: sale || null });
  } catch (err) { next(err); }
};

export const getUpcomingFlashSale = async (req, res, next) => {
  try {
    const now = new Date();
    const sale = await FlashSale.findOne({
      isActive: true,
      startsAt: { $gt: now },
    }).sort({ startsAt: 1 });
    res.json({ success: true, sale: sale || null });
  } catch (err) { next(err); }
};

export const getAllFlashSales = async (req, res, next) => {
  try {
    const sales = await FlashSale.find().sort({ startsAt: -1 }).populate('items.product', 'name images');
    res.json({ success: true, sales });
  } catch (err) { next(err); }
};

export const createFlashSale = async (req, res, next) => {
  try {
    const sale = await FlashSale.create(req.body);
    res.status(201).json({ success: true, sale });
  } catch (err) { next(err); }
};

export const updateFlashSale = async (req, res, next) => {
  try {
    const sale = await FlashSale.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!sale) return res.status(404).json({ success: false, message: 'Flash sale not found' });
    res.json({ success: true, sale });
  } catch (err) { next(err); }
};

export const deleteFlashSale = async (req, res, next) => {
  try {
    await FlashSale.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Flash sale deleted' });
  } catch (err) { next(err); }
};
