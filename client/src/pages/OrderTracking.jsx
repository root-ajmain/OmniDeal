import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, Phone, Search, Check, ChevronRight } from 'lucide-react';
import { ordersAPI } from '../utils/api.js';
import { formatPrice, formatDate, statusColor, statusLabel } from '../utils/helpers.js';
import BackButton from '../components/ui/BackButton.jsx';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

function OrderDetail({ order }) {
  const currentStep = STATUS_STEPS.indexOf(order.status);
  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-slate-500 text-sm">Order Number</p>
            <p className="text-brand-600 font-bold text-xl">{order.orderNumber}</p>
          </div>
          <span className={`badge text-sm px-3 py-1 ${statusColor[order.status]}`}>
            {statusLabel[order.status]}
          </span>
        </div>

        {order.status !== 'cancelled' && (
          <div className="relative">
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-dark-700" />
            <div
              className="absolute top-4 left-4 h-0.5 bg-gradient-brand transition-all duration-500"
              style={{ width: `${Math.max(0, (currentStep / (STATUS_STEPS.length - 1)) * (100 - (8 / STATUS_STEPS.length)))}%` }}
            />
            <div className="relative flex justify-between">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-all ${
                    i <= currentStep ? 'bg-brand-600 border-brand-500' : 'bg-dark-800 border-gray-300'
                  }`}>
                    {i <= currentStep
                      ? <Check className="w-4 h-4 text-white" />
                      : <div className="w-2 h-2 rounded-full bg-slate-600" />
                    }
                  </div>
                  <p className={`text-xs capitalize ${i <= currentStep ? 'text-brand-600' : 'text-slate-600'}`}>
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* History */}
      {order.statusHistory?.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Status History</h3>
          <div className="space-y-3">
            {[...order.statusHistory].reverse().map((h, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${i === 0 ? 'bg-brand-500' : 'bg-slate-600'}`} />
                <div>
                  <p className="text-gray-700 text-sm capitalize font-medium">{statusLabel[h.status] || h.status}</p>
                  {h.note && <p className="text-slate-500 text-xs">{h.note}</p>}
                  <p className="text-slate-600 text-xs">{formatDate(h.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Order Items</h3>
        <div className="space-y-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex gap-3">
              {item.productImage && (
                <img src={item.productImage} alt={item.productName} className="w-12 h-12 rounded-lg object-cover bg-dark-700 shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-gray-700 text-sm">{item.productName}</p>
                {item.variantInfo && <p className="text-slate-500 text-xs">{item.variantInfo}</p>}
                <p className="text-slate-500 text-xs">×{item.quantity} @ {formatPrice(item.unitPrice)}</p>
              </div>
              <p className="text-gray-700 text-sm font-medium">{formatPrice(item.subtotal)}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal</span><span>{formatPrice(order.pricing?.subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Delivery</span>
            <span>{order.pricing?.deliveryCharge === 0 ? 'FREE' : formatPrice(order.pricing?.deliveryCharge)}</span>
          </div>
          {order.pricing?.discount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Discount</span><span>-{formatPrice(order.pricing.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2">
            <span>Total</span>
            <span className="text-brand-600">{formatPrice(order.pricing?.total)}</span>
          </div>
        </div>
      </div>

      {/* Delivery info */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Delivery Details</h3>
        <div className="space-y-2 text-sm">
          <p className="text-gray-700">{order.delivery?.name}</p>
          <p className="text-slate-400">{order.delivery?.phone}</p>
          <p className="text-slate-400">{order.delivery?.fullAddress}</p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
          <span className="text-slate-500">Payment</span>
          <span className="text-gray-700 capitalize">
            {order.payment?.method} — <span className={order.payment?.status === 'paid' ? 'text-emerald-400' : 'text-yellow-400'}>{order.payment?.status}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function OrderTracking() {
  const { orderNumber: paramOrderNumber } = useParams();
  const [tab, setTab] = useState(paramOrderNumber ? 'order' : 'order');

  // Order number tab state
  const [orderInput, setOrderInput] = useState(paramOrderNumber || '');
  const [searchNumber, setSearchNumber] = useState(paramOrderNumber || '');

  // Phone tab state
  const [phoneInput, setPhoneInput] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data: orderData, isLoading: orderLoading, error: orderError } = useQuery({
    queryKey: ['track-order', searchNumber],
    queryFn: () => ordersAPI.track(searchNumber).then(r => r.data.order),
    enabled: !!searchNumber,
  });

  const { data: phoneData, isLoading: phoneLoading, error: phoneError } = useQuery({
    queryKey: ['track-phone', searchPhone],
    queryFn: () => ordersAPI.trackByPhone(searchPhone).then(r => r.data),
    enabled: !!searchPhone,
  });

  const handleOrderSearch = (e) => {
    e.preventDefault();
    setSearchNumber(orderInput.trim());
    setSelectedOrder(null);
  };

  const handlePhoneSearch = (e) => {
    e.preventDefault();
    setSearchPhone(phoneInput.trim());
    setSelectedOrder(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <BackButton className="mb-6" />
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Track Your Order</h1>
        <p className="text-slate-400">Search by order number or phone number</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
        <button
          onClick={() => { setTab('order'); setSelectedOrder(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'order' ? 'bg-white text-gray-900 shadow-sm' : 'text-slate-500 hover:text-gray-700'}`}
        >
          <Package className="w-4 h-4" />
          Order Number
        </button>
        <button
          onClick={() => { setTab('phone'); setSelectedOrder(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'phone' ? 'bg-white text-gray-900 shadow-sm' : 'text-slate-500 hover:text-gray-700'}`}
        >
          <Phone className="w-4 h-4" />
          Phone Number
        </button>
      </div>

      {/* Order Number Tab */}
      {tab === 'order' && (
        <>
          <form onSubmit={handleOrderSearch} className="flex gap-3 mb-8">
            <div className="flex-1 flex items-center glass rounded-xl px-4 gap-2">
              <Package className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                value={orderInput}
                onChange={e => setOrderInput(e.target.value)}
                placeholder="e.g. ORD-20241201-12345"
                className="flex-1 bg-transparent text-gray-800 placeholder-slate-500 outline-none py-3"
              />
            </div>
            <button type="submit" className="btn-primary px-6">
              <Search className="w-4 h-4" /> Track
            </button>
          </form>

          {orderLoading && (
            <div className="space-y-4 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-gray-50 rounded-xl" />)}
            </div>
          )}

          {orderError && (
            <div className="text-center py-10">
              <p className="text-6xl mb-4">🔍</p>
              <p className="text-red-400">Order not found. Check the order number.</p>
            </div>
          )}

          {orderData && <OrderDetail order={orderData} />}
        </>
      )}

      {/* Phone Number Tab */}
      {tab === 'phone' && (
        <>
          <form onSubmit={handlePhoneSearch} className="flex gap-3 mb-8">
            <div className="flex-1 flex items-center glass rounded-xl px-4 gap-2">
              <Phone className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                value={phoneInput}
                onChange={e => setPhoneInput(e.target.value)}
                placeholder="e.g. 01XXXXXXXXX"
                className="flex-1 bg-transparent text-gray-800 placeholder-slate-500 outline-none py-3"
                type="tel"
              />
            </div>
            <button type="submit" className="btn-primary px-6">
              <Search className="w-4 h-4" /> Search
            </button>
          </form>

          {phoneLoading && (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-gray-50 rounded-xl" />)}
            </div>
          )}

          {phoneError && (
            <div className="text-center py-10">
              <p className="text-6xl mb-4">📵</p>
              <p className="text-red-400">No orders found for this number.</p>
            </div>
          )}

          {/* Order list for phone search */}
          {!selectedOrder && phoneData?.orders?.length > 0 && (
            <div className="space-y-3">
              <p className="text-slate-500 text-sm">{phoneData.count} order{phoneData.count !== 1 ? 's' : ''} found</p>
              {phoneData.orders.map(o => (
                <button
                  key={o._id}
                  onClick={() => setSelectedOrder(o.orderNumber)}
                  className="w-full card p-4 flex items-center gap-4 hover:shadow-md transition-shadow text-left"
                >
                  <div className="w-10 h-10 bg-brand-600/10 rounded-xl flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-brand-600 font-bold text-sm">{o.orderNumber}</p>
                    <p className="text-slate-500 text-xs">{formatDate(o.createdAt)} · {o.items?.length} item{o.items?.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-gray-800 font-semibold text-sm">{formatPrice(o.pricing?.total)}</p>
                      <span className={`badge text-xs ${statusColor[o.status]}`}>{statusLabel[o.status]}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {!selectedOrder && phoneData?.orders?.length === 0 && !phoneLoading && searchPhone && (
            <div className="text-center py-10">
              <p className="text-6xl mb-4">📦</p>
              <p className="text-slate-400">No orders found for this phone number.</p>
            </div>
          )}

          {/* Full detail view after clicking an order */}
          {selectedOrder && (
            <div className="space-y-6">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-gray-700 transition-colors"
              >
                ← Back to orders
              </button>
              <PhoneOrderDetail orderNumber={selectedOrder} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PhoneOrderDetail({ orderNumber }) {
  const { data: order, isLoading } = useQuery({
    queryKey: ['track-order', orderNumber],
    queryFn: () => ordersAPI.track(orderNumber).then(r => r.data.order),
  });

  if (isLoading) return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-gray-50 rounded-xl" />)}
    </div>
  );

  if (!order) return <p className="text-red-400 text-center py-10">Could not load order details.</p>;

  return <OrderDetail order={order} />;
}
