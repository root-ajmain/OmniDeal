export const paginate = (query = {}) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 12);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  pages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});

const DELIVERY_ZONE_CHARGES = {
  'dhaka inside': 60,
  'dhaka outside': 100,
  chittagong: 120,
  sylhet: 120,
  rajshahi: 120,
  khulna: 120,
  barisal: 130,
  rangpur: 130,
  mymensingh: 110,
};

export const calcDeliveryCharge = (city, subtotal) => {
  const FREE_THRESHOLD = parseFloat(process.env.FREE_DELIVERY_THRESHOLD) || 999;
  if (subtotal >= FREE_THRESHOLD) return 0;
  const lowerCity = city?.toLowerCase() || '';
  if (DELIVERY_ZONE_CHARGES[lowerCity] !== undefined) return DELIVERY_ZONE_CHARGES[lowerCity];
  if (lowerCity.includes('dhaka')) return 60;
  return 120;
};

export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({ success: true, message, ...data });
};

export const errorResponse = (res, message = 'Error', statusCode = 400) => {
  res.status(statusCode).json({ success: false, message });
};
