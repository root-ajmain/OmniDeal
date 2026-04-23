export const formatPrice = (price) =>
  `৳${Number(price).toLocaleString('en-BD')}`;

export const formatDate = (date) =>
  new Intl.DateTimeFormat('en-BD', { dateStyle: 'medium' }).format(new Date(date));

export const getDiscountPercent = (regular, sale) =>
  sale ? Math.round(((regular - sale) / regular) * 100) : 0;

export const getFeaturedImage = (images = []) =>
  images.find(img => img.isFeatured)?.url || images[0]?.url || 'https://placehold.co/400x400/f1f5f9/94a3b8?text=No+Image';

export const truncate = (text, len = 100) =>
  text?.length > len ? text.slice(0, len) + '...' : text;

export const statusColor = {
  pending: 'text-yellow-400 bg-yellow-400/10',
  confirmed: 'text-blue-400 bg-blue-400/10',
  processing: 'text-purple-600 bg-purple-100',
  shipped: 'text-cyan-400 bg-cyan-400/10',
  delivered: 'text-green-400 bg-green-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
};

export const statusLabel = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const starRating = (rating) => {
  return Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
};
