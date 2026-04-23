export const DELIVERY_ZONES = [
  { label: 'Dhaka (Inside)', city: 'Dhaka Inside', charge: 60 },
  { label: 'Dhaka (Outside)', city: 'Dhaka Outside', charge: 100 },
  { label: 'Chittagong', city: 'Chittagong', charge: 120 },
  { label: 'Sylhet', city: 'Sylhet', charge: 120 },
  { label: 'Rajshahi', city: 'Rajshahi', charge: 120 },
  { label: 'Khulna', city: 'Khulna', charge: 120 },
  { label: 'Barisal', city: 'Barisal', charge: 130 },
  { label: 'Rangpur', city: 'Rangpur', charge: 130 },
  { label: 'Mymensingh', city: 'Mymensingh', charge: 110 },
];

export const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on Delivery', icon: '💵' },
  { value: 'bkash', label: 'bKash', icon: '📱' },
  { value: 'nagad', label: 'Nagad', icon: '📱' },
  { value: 'card', label: 'Credit / Debit Card', icon: '💳' },
];

export const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export const FREE_DELIVERY_THRESHOLD = 999;

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];
