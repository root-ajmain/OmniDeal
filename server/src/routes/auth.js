import { Router } from 'express';
import passport from 'passport';
import {
  register, login, getMe, updateProfile, changePassword,
  forgotPassword, resetPassword, googleCallback, addAddress, removeAddress,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), googleCallback);

router.post('/addresses', protect, addAddress);
router.delete('/addresses/:id', protect, removeAddress);

export default router;
