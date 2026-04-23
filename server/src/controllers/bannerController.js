import Banner from '../models/Banner.js';

export const getBanners = async (req, res, next) => {
  try {
    const { type } = req.query;
    const now = new Date();
    const filter = {
      isActive: true,
      $or: [{ startsAt: null }, { startsAt: { $lte: now } }],
      $and: [{ $or: [{ endsAt: null }, { endsAt: { $gte: now } }] }],
    };
    if (type) filter.type = type;
    const banners = await Banner.find(filter).sort({ position: 1, createdAt: -1 });
    res.json({ success: true, banners });
  } catch (err) { next(err); }
};

export const getAllBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort({ position: 1, createdAt: -1 });
    res.json({ success: true, banners });
  } catch (err) { next(err); }
};

export const createBanner = async (req, res, next) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({ success: true, banner });
  } catch (err) { next(err); }
};

export const updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
    res.json({ success: true, banner });
  } catch (err) { next(err); }
};

export const deleteBanner = async (req, res, next) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Banner deleted' });
  } catch (err) { next(err); }
};
