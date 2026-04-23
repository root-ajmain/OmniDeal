import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ordersAPI } from '../utils/api.js';
import { formatPrice, formatDate, statusColor, statusLabel } from '../utils/helpers.js';
import BackButton from '../components/ui/BackButton.jsx';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrderDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersAPI.getById(id).then(r => r.data.order),
  });

  useEffect(() => {
    if (order?.status) setNewStatus(order.status);
  }, [order?.status]);

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: (data) => ordersAPI.updateStatus(id, data),
    onSuccess: () => {
      toast.success('Status updated');
      qc.invalidateQueries({ queryKey: ['order', id] });
      setNote('');
    },
    onError: () => toast.error('Update failed'),
  });

  if (isLoading) return <div className="animate-pulse space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-gray-50 rounded-xl" />)}</div>;
  if (!order) return <div className="text-center py-20 text-slate-400">Order not found</div>;

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <BackButton />
        <div>
          <h1 className="text-xl font-display font-bold text-gray-900">{order.orderNumber}</h1>
          <p className="text-slate-500 text-sm">{formatDate(order.createdAt)}</p>
        </div>
        <span className={`ml-auto badge text-sm px-3 py-1 ${statusColor[order.status]}`}>{statusLabel[order.status]}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Update status */}
        <div className="card p-5 space-y-3">
          <h3 className="font-semibold text-gray-800">Update Status</h3>
          <select value={newStatus || order.status} onChange={e => setNewStatus(e.target.value)} className="input-field">
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}
          </select>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note (optional)" rows={2} className="input-field resize-none" />
          <button
            onClick={() => updateStatus({ status: newStatus || order.status, note })}
            disabled={isPending}
            className="btn-primary w-full"
          >
            {isPending ? 'Updating...' : 'Update Status'}
          </button>
        </div>

        {/* Delivery info */}
        <div className="card p-5 space-y-3">
          <h3 className="font-semibold text-gray-800">Delivery Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Name</span><span className="text-gray-700">{order.delivery?.name}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Phone</span><span className="text-gray-700">{order.delivery?.phone}</span></div>
            {order.delivery?.email && <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="text-gray-700">{order.delivery.email}</span></div>}
            <div className="flex justify-between"><span className="text-slate-500">Address</span><span className="text-gray-700 text-right max-w-[60%]">{order.delivery?.fullAddress}</span></div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Order Items</h3>
        <div className="space-y-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
              {item.productImage && <img src={item.productImage} alt={item.productName} className="w-12 h-12 rounded-lg object-cover bg-dark-700 shrink-0" />}
              <div className="flex-1">
                <p className="text-gray-700 text-sm font-medium">{item.productName}</p>
                {item.variantInfo && <p className="text-slate-500 text-xs">{item.variantInfo}</p>}
                <p className="text-slate-500 text-xs">{formatPrice(item.unitPrice)} × {item.quantity}</p>
              </div>
              <p className="text-gray-800 font-semibold text-sm">{formatPrice(item.subtotal)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
          <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>{formatPrice(order.pricing?.subtotal)}</span></div>
          <div className="flex justify-between text-slate-400"><span>Delivery</span><span>{order.pricing?.deliveryCharge === 0 ? 'FREE' : formatPrice(order.pricing?.deliveryCharge)}</span></div>
          {order.pricing?.discount > 0 && <div className="flex justify-between text-emerald-400"><span>Discount</span><span>-{formatPrice(order.pricing.discount)}</span></div>}
          <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2"><span>Total</span><span className="text-brand-600">{formatPrice(order.pricing?.total)}</span></div>
        </div>
      </div>

      {/* Status history */}
      {order.statusHistory?.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Status History</h3>
          <div className="space-y-3">
            {[...order.statusHistory].reverse().map((h, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${i === 0 ? 'bg-brand-500' : 'bg-slate-600'}`} />
                <div>
                  <p className="text-gray-700 font-medium capitalize">{statusLabel[h.status] || h.status}</p>
                  {h.note && <p className="text-slate-500">{h.note}</p>}
                  <p className="text-slate-600 text-xs">{formatDate(h.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
