import { Router } from 'express';
import { upload, uploadToCloudinary } from '../config/cloudinary.js';
import { adminOnly } from '../middleware/auth.js';

const router = Router();

router.post('/image', adminOnly, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const result = await uploadToCloudinary(req.file.buffer);
    res.json({ success: true, url: result.secure_url, publicId: result.public_id });
  } catch (err) { next(err); }
});

router.post('/images', adminOnly, upload.array('images', 10), async (req, res, next) => {
  try {
    if (!req.files?.length) return res.status(400).json({ success: false, message: 'No files uploaded' });
    const results = await Promise.all(req.files.map(f => uploadToCloudinary(f.buffer)));
    res.json({
      success: true,
      images: results.map(r => ({ url: r.secure_url, publicId: r.public_id })),
    });
  } catch (err) { next(err); }
});

export default router;
