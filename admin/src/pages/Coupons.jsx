import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { couponsAPI } from '../utils/api.js';
import { formatPrice, formatDate } from '../utils/helpers.js';
import BackButton from '../components/ui/BackButton.jsx';

const emptyForm = { code: '', description: '', type: 'percentage', value: '', minOrderAmount: 0, maxDiscount: '', usageLimit: '', expiresAt: '', status: 'active' };

export default function Coupons() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => couponsAPI.getAll().then(r => r.data.coupons),
  });

  const { mutate: save, isPending } = useMutation({
    mutationFn: (d) => modal?.data ? couponsAPI.update(modal.data._id, d) : couponsAPI.create(d),
    onSuccess: () => { toast.success('Saved'); qc.invalidateQueries({ queryKey: ['admin-coupons'] }); setModal(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Save failed'),
  });

  const { mutate: del } = useMutation({
    mutationFn: (id) => couponsAPI.delete(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['admin-coupons'] }); },
    onError: () => toast.error('Delete failed'),
  });

  const openNew = () => { setForm(emptyForm); setModal({ mode: 'new' }); };
  const openEdit = (c) => {
    setForm({ ...c, expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '' });
    setModal({ mode: 'edit', data: c });
  };

  const handleSave = () => {
    if (!form.code || !form.value) return toast.error('Code and value required');
    const d = { ...form, value: parseFloat(form.value), minOrderAmount: parseFloat(form.minOrderAmount || 0), maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : undefined, usageLimit: form.usageLimit ? parseInt(form.usageLimit) : undefined, expiresAt: form.expiresAt || undefined };
    save(d);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="text-xl font-display font-bold text-gray-900">Coupons</h1>
        <button onClick={openNew} className="ml-auto btn-primary"><Plus className="w-4 h-4" /> Create Coupon</button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-gray-50 rounded-xl animate-pulse" />)
          : data?.map(coupon => (
              <div key={coupon._id} className="card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-brand-600 font-mono">{coupon.code}</p>
                  <span className={`badge text-xs ${coupon.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>{coupon.status}</span>
                </div>
                <p className="text-slate-400 text-sm">{coupon.type === 'percentage' ? `${coupon.value}% off` : `${formatPrice(coupon.value)} off`}</p>
                {coupon.minOrderAmount > 0 && <p className="text-slate-500 text-xs">Min order: {formatPrice(coupon.minOrderAmount)}</p>}
                <p className="text-slate-500 text-xs">Used: {coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}</p>
                {coupon.expiresAt && <p className="text-slate-500 text-xs">Expires: {formatDate(coupon.expiresAt)}</p>}
                <div className="flex gap-2">
                  <button onClick={() => openEdit(coupon)} className="btn-ghost text-xs gap-1 flex-1 justify-center"><Edit className="w-3.5 h-3.5" /> Edit</button>
                  <button onClick={() => confirm('Delete coupon?') && del(coupon._id)} className="btn-ghost text-xs gap-1 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))
        }
      </div>

      {modal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-gray-200 rounded-2xl p-6 w-full max-w-md shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">{modal.mode === 'new' ? 'New Coupon' : 'Edit Coupon'}</h3>
              <button onClick={() => setModal(null)} className="btn-ghost p-1"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Code *</label>
                  <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="input-field font-mono" placeholder="SAVE20" />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Value *</label>
                  <input type="number" min="0" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Min Order (৳)</label>
                  <input type="number" min="0" value={form.minOrderAmount} onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Max Discount (৳)</label>
                  <input type="number" min="0" value={form.maxDiscount} onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))} className="input-field" placeholder="No limit" />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Usage Limit</label>
                  <input type="number" min="0" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} className="input-field" placeholder="Unlimited" />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Expires At</label>
                  <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-field">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Description</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field" placeholder="Optional description" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={isPending} className="btn-primary flex-1">
                <Check className="w-4 h-4" />
                {isPending ? 'Saving...' : 'Save Coupon'}
              </button>
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
