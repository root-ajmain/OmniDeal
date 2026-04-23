import { Router } from 'express';
import { getDashboardStats, getRevenueChart, getCategoryChart, getCustomers, getLowStockProducts } from '../controllers/adminController.js';
import { adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', adminOnly, getDashboardStats);
router.get('/charts/revenue', adminOnly, getRevenueChart);
router.get('/charts/categories', adminOnly, getCategoryChart);
router.get('/customers', adminOnly, getCustomers);
router.get('/low-stock', adminOnly, getLowStockProducts);

export default router;
