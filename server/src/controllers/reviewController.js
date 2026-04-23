import Review from '../models/Review.js';
import { paginate, buildPaginationMeta } from '../utils/helpers.js';

export const getProductReviews = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const filter = { product: req.params.productId, status: 'approved' };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('customer', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter),
    ]);
    res.json({ success: true, reviews, pagination: buildPaginationMeta(total, page, limit) });
  } catch (err) { next(err); }
};

export const createReview = async (req, res, next) => {
  try {
    const { rating, title, comment, guestName, guestEmail } = req.body;
    const { productId } = req.params;

    const reviewData = {
      product: productId,
      rating,
      title,
      comment,
    };

    if (req.user) {
      reviewData.customer = req.user._id;
    } else {
      reviewData.guestName = guestName;
      reviewData.guestEmail = guestEmail;
    }

    const review = await Review.create(reviewData);
    res.status(201).json({ success: true, message: 'Review submitted for approval', review });
  } catch (err) { next(err); }
};

export const markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    const idx = review.helpful.findIndex(id => id.equals(req.user._id));
    if (idx > -1) {
      review.helpful.splice(idx, 1);
    } else {
      review.helpful.push(req.user._id);
    }
    review.helpfulCount = review.helpful.length;
    await review.save();
    res.json({ success: true, helpfulCount: review.helpfulCount });
  } catch (err) { next(err); }
};

// Admin
export const getAllReviews = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const { status } = req.query;
    const filter = status ? { status } : {};
    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('product', 'name')
        .populate('customer', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter),
    ]);
    res.json({ success: true, reviews, pagination: buildPaginationMeta(total, page, limit) });
  } catch (err) { next(err); }
};

export const updateReviewStatus = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    review.status = req.body.status;
    await review.save();
    res.json({ success: true, message: 'Review status updated', review });
  } catch (err) { next(err); }
};
