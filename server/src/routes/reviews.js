import { Router } from 'express';
import {
  getProductReviews, createReview, markHelpful,
  getAllReviews, updateReviewStatus,
} from '../controllers/reviewController.js';
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/product/:productId', getProductReviews);
router.post('/product/:productId', optionalAuth, createReview);
router.post('/:id/helpful', protect, markHelpful);

// Admin
router.get('/', adminOnly, getAllReviews);
router.put('/:id/status', adminOnly, updateReviewStatus);

export default router;
