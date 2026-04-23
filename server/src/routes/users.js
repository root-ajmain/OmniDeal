import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();

router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name images pricing avgRating');
  res.json({ success: true, user });
});

export default router;
