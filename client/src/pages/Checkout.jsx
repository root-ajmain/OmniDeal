import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ShoppingBag, Tag, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore from '../store/cartStore.js';
import { ordersAPI, couponsAPI } from '../utils/api.js';
import { formatPrice } from '../utils/helpers.js';
import { DELIVERY_ZONES, PAYMENT_METHODS, FREE_DELIVERY_THRESHOLD } from '../utils/constants.js';
import BackButton from '../components/ui/BackButton.jsx';

function useCartHydrated() {
  const [hydrated, setHydrated] = useState(
    () => useCartStore.persist.hasHydrated()
  );
  useEffect(() => {
    if (hydrated) return;
    const unsub = useCartStore.persist.onFinishHydration(() => setHydrated(true));
    // Safety net: if onFinishHydration never fires (already hydrated), check again
    if (useCartStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, [hydrated]);
  return hydrated;
}

export default function Checkout() {
  const { items, getSubtotal, clearCart } = useCartStore();
  const navigate = useNavigate();
  const hydrated = useCartHydrated();
  const subtotal = getSubtotal();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    street: '',
    area: '',
    city: DELIVERY_ZONES[0].city,
    paymentMethod: 'cod',
    notes: '',
  });

  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [orderDone, setOrderDone] = useState(false);

  const selectedZone = DELIVERY_ZONES.find(z => z.city === form.city) || DELIVERY_ZONES[0];
  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : selectedZone.charge;
  const discount = couponData?.discount || 0;
  const total = subtotal + deliveryCharge - discount;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Redirect to cart only after hydration is confirmed AND cart is actually empty
  useEffect(() => {
    if (!hydrated) return;
    if (!orderDone && items.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [hydrated, items.length, orderDone, navigate]);

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const res = await couponsAPI.validate({ code: couponCode, subtotal });
      setCouponData(res.data);
      toast.success(`Coupon applied! Saved ${formatPrice(res.data.discount)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setCouponData(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: (data) => ordersAPI.create(data),
    onSuccess: (res) => {
      setOrderDone(true);
      clearCart();
      navigate('/order-success', { state: { order: res.data.order } });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to place order. Please try again.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!items.length) return toast.error('Cart is empty');

    const orderItems = items.map(item => ({
      productId: item._id,
      quantity: item.quantity,
      variantInfo: item.variantInfo,
    }));

    placeOrder({
      items: orderItems,
      delivery: {
        name: form.name,
        phone: form.phone,
        email: form.email,
        street: form.street,
        area: form.area,
        city: form.city,
        fullAddress: `${form.street}, ${form.area}, ${form.city}`,
      },
      payment: { method: form.paymentMethod },
      couponCode: couponData ? couponCode : undefined,
      notes: form.notes,
    });
  };

  // Spinner only while hydration is in progress (usually < 50ms)
  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Cart empty (and no order placed) — redirect effect will handle navigation
  if (!orderDone && items.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <BackButton className="mb-6" />
      <h1 className="text-2xl font-display font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery info */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-800">Delivery Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-500 text-sm mb-1.5 block">Full Name *</label>
                <input required value={form.name} onChange={e => set('name', e.target.value)} className="input-field" placeholder="Your name" />
              </div>
              <div>
                <label className="text-slate-500 text-sm mb-1.5 block">Phone *</label>
                <input required value={form.phone} onChange={e => set('phone', e.target.value)} className="input-field" placeholder="01XXXXXXXXX" pattern="01[0-9]{9}" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-slate-500 text-sm mb-1.5 block">Email (for order confirmation)</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input-field" placeholder="email@example.com" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-slate-500 text-sm mb-1.5 block">Street Address *</label>
                <input required value={form.street} onChange={e => set('street', e.target.value)} className="input-field" placeholder="House/Building, Road, Block" />
              </div>
              <div>
                <label className="text-slate-500 text-sm mb-1.5 block">Area / Thana</label>
                <input value={form.area} onChange={e => set('area', e.target.value)} className="input-field" placeholder="Area / Thana" />
              </div>
              <div>
                <label className="text-slate-500 text-sm mb-1.5 block">City / Zone *</label>
                <select required value={form.city} onChange={e => set('city', e.target.value)} className="input-field">
                  {DELIVERY_ZONES.map(z => (
                    <option key={z.city} value={z.city}>{z.label} (৳{z.charge} delivery)</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-slate-500 text-sm mb-1.5 block">Order Notes (optional)</label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className="input-field resize-none" placeholder="Any special instructions..." />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-800">Payment Method</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {PAYMENT_METHODS.map(method => (
                <label key={method.value} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${form.paymentMethod === method.value ? 'border-brand-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value={method.value} checked={form.paymentMethod === method.value} onChange={() => set('paymentMethod', method.value)} className="sr-only" />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${form.paymentMethod === method.value ? 'border-brand-500' : 'border-gray-300'}`}>
                    {form.paymentMethod === method.value && <div className="w-2 h-2 rounded-full bg-brand-500" />}
                  </div>
                  <span className="text-xl">{method.icon}</span>
                  <span className="text-sm text-gray-700">{method.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="card p-6 sticky top-20 space-y-4">
            <h2 className="font-semibold text-gray-800">Order Summary</h2>

            {/* Items */}
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {items.map(item => (
                <div key={item.key} className="flex gap-3">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700 text-xs line-clamp-1">{item.name}</p>
                    <p className="text-slate-500 text-xs">×{item.quantity}</p>
                  </div>
                  <span className="text-gray-700 text-xs font-medium shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="flex-1 flex items-center bg-gray-100 rounded-xl px-3 gap-2">
                  <Tag className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    value={couponCode}
                    onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponData(null); }}
                    placeholder="Coupon code"
                    className="flex-1 bg-transparent text-sm text-gray-800 placeholder-slate-400 outline-none py-2.5"
                  />
                </div>
                <button type="button" onClick={validateCoupon} disabled={validatingCoupon} className="btn-secondary text-sm px-4 shrink-0">
                  {validatingCoupon ? '...' : 'Apply'}
                </button>
              </div>
              {couponData && (
                <div className="flex items-center gap-2 text-emerald-600 text-xs">
                  <Check className="w-3 h-3" /> Coupon applied! Saved {formatPrice(couponData.discount)}
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery</span>
                <span className={deliveryCharge === 0 ? 'text-emerald-600 font-medium' : ''}>{deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon discount</span><span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2">
                <span>Total</span>
                <span className="text-brand-600 text-lg">{formatPrice(total)}</span>
              </div>
            </div>

            <button type="submit" disabled={isPending} className="w-full btn-primary py-3.5 flex items-center justify-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              {isPending ? 'Placing Order...' : 'Place Order'}
            </button>

            <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <span className="w-4 h-4 bg-emerald-100 rounded flex items-center justify-center"><svg className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></span>
              Secure checkout · Your data is safe
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
