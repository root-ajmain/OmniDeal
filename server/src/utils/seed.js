import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

dotenv.config();

const categories = [
  { name: 'Electronics', slug: 'electronics', icon: '⚡', description: 'Gadgets, devices & tech accessories', sortOrder: 1 },
  { name: 'Fashion', slug: 'fashion', icon: '👗', description: 'Clothing, shoes & accessories', sortOrder: 2 },
  { name: 'Home & Living', slug: 'home-living', icon: '🏠', description: 'Furniture, decor & kitchen', sortOrder: 3 },
  { name: 'Sports', slug: 'sports', icon: '⚽', description: 'Equipment, apparel & outdoor gear', sortOrder: 4 },
  { name: 'Beauty', slug: 'beauty', icon: '✨', description: 'Skincare, makeup & personal care', sortOrder: 5 },
  { name: 'Books', slug: 'books', icon: '📚', description: 'Books, stationery & educational', sortOrder: 6 },
];

const seed = async () => {
  await connectDB();
  await Promise.all([User.deleteMany(), Category.deleteMany(), Product.deleteMany()]);

  // Admin user
  await User.create({
    name: 'Admin',
    email: 'admin@omnideal.com',
    password: 'Admin@123!',
    role: 'admin',
    isEmailVerified: true,
  });

  // Categories
  const cats = await Category.insertMany(categories);
  const catMap = Object.fromEntries(cats.map(c => [c.slug, c._id]));

  // Sample products
  const products = [
    { name: 'Wireless Bluetooth Headphones', category: catMap['electronics'], pricing: { regular: 2999, sale: 1999 }, badges: ['hot', 'sale', 'featured'], inventory: { quantity: 50 }, description: 'Premium sound quality with active noise cancellation. 30-hour battery life. Foldable design.', tags: ['audio', 'wireless', 'headphones'] },
    { name: 'Smart Watch Series 5', category: catMap['electronics'], pricing: { regular: 8999, sale: 6499 }, badges: ['new', 'sale'], inventory: { quantity: 30 }, description: 'Track fitness, receive notifications, and monitor health with this premium smartwatch.', tags: ['watch', 'smart', 'fitness'] },
    { name: '4K Action Camera', category: catMap['electronics'], pricing: { regular: 12999, sale: 9999 }, badges: ['featured'], inventory: { quantity: 20 }, description: 'Waterproof 4K action camera with image stabilization. Perfect for adventure.', tags: ['camera', '4k', 'action'] },
    { name: 'Mechanical Keyboard', category: catMap['electronics'], pricing: { regular: 4500, sale: 3200 }, badges: ['sale'], inventory: { quantity: 45 }, description: 'RGB backlit mechanical gaming keyboard with cherry MX switches.', tags: ['keyboard', 'gaming', 'mechanical'] },
    { name: 'Wireless Mouse', category: catMap['electronics'], pricing: { regular: 1800 }, badges: ['new'], inventory: { quantity: 100 }, description: 'Ergonomic wireless mouse with 1600 DPI. 12-month battery life.', tags: ['mouse', 'wireless', 'ergonomic'] },

    { name: 'Premium Cotton T-Shirt', category: catMap['fashion'], pricing: { regular: 899, sale: 599 }, badges: ['sale'], inventory: { quantity: 200 }, description: '100% premium organic cotton. Comfortable fit for everyday wear.', tags: ['tshirt', 'cotton', 'casual'] },
    { name: 'Slim Fit Jeans', category: catMap['fashion'], pricing: { regular: 2499, sale: 1799 }, badges: ['hot', 'sale'], inventory: { quantity: 80 }, description: 'Modern slim fit jeans with stretch denim for maximum comfort.', tags: ['jeans', 'denim', 'slim'] },
    { name: 'Leather Sneakers', category: catMap['fashion'], pricing: { regular: 3999, sale: 2999 }, badges: ['new', 'sale'], inventory: { quantity: 60 }, description: 'Genuine leather sneakers with cushioned insole. Classic meets modern.', tags: ['sneakers', 'leather', 'shoes'] },
    { name: 'Casual Hoodie', category: catMap['fashion'], pricing: { regular: 1999 }, badges: ['new'], inventory: { quantity: 150 }, description: 'Soft fleece hoodie perfect for cold days. Available in multiple colors.', tags: ['hoodie', 'casual', 'winter'] },
    { name: 'Formal Blazer', category: catMap['fashion'], pricing: { regular: 5999, sale: 4499 }, badges: ['featured', 'sale'], inventory: { quantity: 40 }, description: 'Tailored formal blazer. Perfect for office and special occasions.', tags: ['blazer', 'formal', 'office'] },

    { name: 'Smart LED Desk Lamp', category: catMap['home-living'], pricing: { regular: 2200, sale: 1500 }, badges: ['sale'], inventory: { quantity: 70 }, description: 'Touch-sensitive LED lamp with adjustable brightness and color temperature.', tags: ['lamp', 'led', 'desk'] },
    { name: 'Non-stick Cookware Set', category: catMap['home-living'], pricing: { regular: 6500, sale: 4900 }, badges: ['hot', 'sale'], inventory: { quantity: 35 }, description: '6-piece non-stick cookware set. Suitable for all stovetops including induction.', tags: ['cookware', 'kitchen', 'nonstick'] },
    { name: 'Memory Foam Pillow', category: catMap['home-living'], pricing: { regular: 1800, sale: 1200 }, badges: ['sale', 'featured'], inventory: { quantity: 90 }, description: 'Orthopedic memory foam pillow for perfect neck support and restful sleep.', tags: ['pillow', 'memory foam', 'sleep'] },
    { name: 'Decorative Wall Clock', category: catMap['home-living'], pricing: { regular: 1500 }, badges: ['new'], inventory: { quantity: 55 }, description: 'Modern minimalist wall clock. Silent movement. Perfect for any room.', tags: ['clock', 'wall', 'decor'] },
    { name: 'Air Purifier', category: catMap['home-living'], pricing: { regular: 9999, sale: 7499 }, badges: ['new', 'sale'], inventory: { quantity: 25 }, description: 'HEPA air purifier removes 99.9% of airborne particles. Covers up to 400 sq ft.', tags: ['air purifier', 'hepa', 'health'] },

    { name: 'Yoga Mat Premium', category: catMap['sports'], pricing: { regular: 1800, sale: 1299 }, badges: ['sale', 'featured'], inventory: { quantity: 120 }, description: 'Eco-friendly non-slip yoga mat. 6mm thickness for maximum comfort.', tags: ['yoga', 'mat', 'fitness'] },
    { name: 'Resistance Bands Set', category: catMap['sports'], pricing: { regular: 1200, sale: 799 }, badges: ['sale', 'hot'], inventory: { quantity: 200 }, description: '5-piece resistance bands set with different resistance levels. Perfect for home workout.', tags: ['bands', 'resistance', 'workout'] },
    { name: 'Running Shoes Pro', category: catMap['sports'], pricing: { regular: 4999, sale: 3499 }, badges: ['new', 'sale'], inventory: { quantity: 65 }, description: 'Lightweight running shoes with advanced cushioning technology. Breathable mesh upper.', tags: ['running', 'shoes', 'sports'] },
    { name: 'Protein Shaker Bottle', category: catMap['sports'], pricing: { regular: 599 }, badges: ['new'], inventory: { quantity: 300 }, description: 'BPA-free 700ml protein shaker with mixing ball. Leak-proof lid.', tags: ['shaker', 'protein', 'gym'] },
    { name: 'Jump Rope Speed', category: catMap['sports'], pricing: { regular: 800, sale: 550 }, badges: ['sale'], inventory: { quantity: 180 }, description: 'Adjustable speed jump rope with ball bearings for smooth rotation.', tags: ['jump rope', 'cardio', 'fitness'] },

    { name: 'Vitamin C Serum', category: catMap['beauty'], pricing: { regular: 1299, sale: 899 }, badges: ['hot', 'sale', 'featured'], inventory: { quantity: 150 }, description: 'Brightening vitamin C serum with hyaluronic acid. Reduces dark spots.', tags: ['serum', 'vitamin c', 'skincare'] },
    { name: 'Moisturizing Face Cream', category: catMap['beauty'], pricing: { regular: 999, sale: 699 }, badges: ['sale'], inventory: { quantity: 200 }, description: 'Lightweight daily moisturizer with SPF 30. Non-greasy formula for all skin types.', tags: ['moisturizer', 'spf', 'face cream'] },
    { name: 'Hair Growth Serum', category: catMap['beauty'], pricing: { regular: 1599, sale: 1099 }, badges: ['new', 'sale'], inventory: { quantity: 100 }, description: 'Clinically proven hair growth serum. Reduces hair fall in 4 weeks.', tags: ['hair growth', 'serum', 'hair care'] },
    { name: 'Makeup Brush Set', category: catMap['beauty'], pricing: { regular: 1800, sale: 1299 }, badges: ['sale'], inventory: { quantity: 80 }, description: '20-piece professional makeup brush set with synthetic bristles.', tags: ['makeup', 'brush', 'beauty'] },
    { name: 'Electric Face Massager', category: catMap['beauty'], pricing: { regular: 3499, sale: 2499 }, badges: ['new', 'featured'], inventory: { quantity: 45 }, description: 'Vibrating facial massager for skin lifting, firming and anti-aging.', tags: ['massager', 'face', 'electric'] },

    { name: 'The Psychology of Money', category: catMap['books'], pricing: { regular: 599, sale: 449 }, badges: ['hot', 'sale'], inventory: { quantity: 500 }, description: 'Timeless lessons on wealth, greed, and happiness by Morgan Housel.', tags: ['finance', 'psychology', 'bestseller'] },
    { name: 'Atomic Habits', category: catMap['books'], pricing: { regular: 699, sale: 499 }, badges: ['hot', 'sale', 'featured'], inventory: { quantity: 400 }, description: 'An easy and proven way to build good habits by James Clear.', tags: ['habits', 'self-help', 'bestseller'] },
    { name: 'Deep Work', category: catMap['books'], pricing: { regular: 649, sale: 479 }, badges: ['sale'], inventory: { quantity: 350 }, description: 'Rules for focused success in a distracted world by Cal Newport.', tags: ['productivity', 'focus', 'work'] },
    { name: 'A5 Dotted Notebook', category: catMap['books'], pricing: { regular: 349, sale: 249 }, badges: ['sale'], inventory: { quantity: 600 }, description: '200-page dotted notebook. Thick paper, lay-flat binding. Perfect for bullet journaling.', tags: ['notebook', 'journal', 'stationery'] },
    { name: 'Frixion Erasable Pens Set', category: catMap['books'], pricing: { regular: 799, sale: 549 }, badges: ['new', 'sale'], inventory: { quantity: 400 }, description: '10-piece erasable gel pens in assorted colors. Heat-erase technology.', tags: ['pens', 'erasable', 'stationery'] },
  ];

  // Add placeholder images
  const productsWithImages = products.map((p, i) => ({
    ...p,
    images: [
      { url: `https://picsum.photos/seed/${i + 1}/800/800`, isFeatured: true, sortOrder: 0 },
      { url: `https://picsum.photos/seed/${i + 100}/800/800`, isFeatured: false, sortOrder: 1 },
      { url: `https://picsum.photos/seed/${i + 200}/800/800`, isFeatured: false, sortOrder: 2 },
    ],
    status: 'active',
    shortDescription: p.description.split('.')[0] + '.',
  }));

  for (const p of productsWithImages) {
    await Product.create(p);
  }

  // Update category product counts
  for (const cat of cats) {
    const count = await Product.countDocuments({ category: cat._id });
    await Category.findByIdAndUpdate(cat._id, { productCount: count });
  }

  console.log('✅ Seed complete: 1 admin, 6 categories, 30 products');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
