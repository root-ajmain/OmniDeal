import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', getSettings);
router.put('/', adminOnly, updateSettings);

export default router;
