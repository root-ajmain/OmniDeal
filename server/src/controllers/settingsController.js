import SiteSettings from '../models/SiteSettings.js';

const DEFAULTS = {
  siteName: 'OmniDeal',
  tagline: 'Shop The Future of Retail',
  whatsappNumber: '8801700000000',
  whatsappMessage: 'Hi! I need help with my order.',
  announcement: { text: '🔥 Free delivery on orders over ৳999! Use code: FREEDEL', active: true, bgColor: '#d97706' },
  freeDeliveryThreshold: 999,
  socialLinks: { facebook: '', instagram: '', youtube: '' },
  contactEmail: 'support@omnideal.com',
  contactPhone: '01700-000000',
  address: 'Dhaka, Bangladesh',
  returnPolicy: '7 days easy return policy',
  metaTitle: 'OmniDeal - Best Online Shop in Bangladesh',
  metaDescription: 'Shop thousands of products at best prices. Electronics, Fashion, Home & more. Fast delivery across Bangladesh.',
  heroHeadline: {
    badge: 'New arrivals every week',
    line1: 'Shop The',
    highlight: 'Future',
    line2: 'of Retail',
    description: 'Discover thousands of premium products from electronics to fashion. Unbeatable prices, lightning-fast delivery, and an experience you\'ll love.',
  },
  heroSlides: [
    { imageUrl: 'https://picsum.photos/seed/hero1/800/800', title: 'New Season Collection', subtitle: 'Up to 50% off' },
    { imageUrl: 'https://picsum.photos/seed/hero2/800/800', title: 'Electronics Sale', subtitle: 'Best deals on gadgets' },
    { imageUrl: 'https://picsum.photos/seed/hero3/800/800', title: 'Fashion Week', subtitle: 'Trending styles' },
  ],
};

export const getSettings = async (req, res, next) => {
  try {
    const docs = await SiteSettings.find();
    const settings = { ...DEFAULTS };
    docs.forEach(doc => { settings[doc.key] = doc.value; });
    res.json({ success: true, settings });
  } catch (err) { next(err); }
};

export const updateSettings = async (req, res, next) => {
  try {
    const updates = req.body;
    const ops = Object.entries(updates).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: { $set: { key, value } },
        upsert: true,
      },
    }));
    if (ops.length) await SiteSettings.bulkWrite(ops);
    const docs = await SiteSettings.find();
    const settings = { ...DEFAULTS };
    docs.forEach(doc => { settings[doc.key] = doc.value; });
    res.json({ success: true, settings });
  } catch (err) { next(err); }
};
