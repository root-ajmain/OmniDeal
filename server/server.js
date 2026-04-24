import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import passport from 'passport';
import rateLimit from 'express-rate-limit';

import connectDB from './src/config/db.js';
import './src/config/passport.js';

import authRoutes from './src/routes/auth.js';
import productRoutes from './src/routes/products.js';
import categoryRoutes from './src/routes/categories.js';
import orderRoutes from './src/routes/orders.js';
import userRoutes from './src/routes/users.js';
import reviewRoutes from './src/routes/reviews.js';
import couponRoutes from './src/routes/coupons.js';
import uploadRoutes from './src/routes/upload.js';
import adminRoutes from './src/routes/admin.js';
import bannerRoutes from './src/routes/banners.js';
import flashSaleRoutes from './src/routes/flashSales.js';
import settingsRoutes from './src/routes/settings.js';
import returnRoutes from './src/routes/returns.js';
import { errorHandler, notFound } from './src/middleware/errorHandler.js';

dotenv.config();

connectDB();

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
].filter(Boolean).map(o => o.replace(/\/$/, ''));

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const clean = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(clean) || clean.endsWith('.vercel.app')) {
      return cb(null, true);
    }
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/flash-sales', flashSaleRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/returns', returnRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'OK', app: 'OmniDeal API' }));

app.use(notFound);
app.use(errorHandler);

// Local dev: start server normally
// Vercel: export app as serverless handler (no app.listen)
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`OmniDeal server running on port ${PORT}`));
}

export default app;
