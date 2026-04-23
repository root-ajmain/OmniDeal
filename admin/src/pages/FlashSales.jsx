import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Zap, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { flashSaleAPI, productsAPI } from '../utils/api.js';
import { formatDate, formatPrice } from '../utils/helpers.js';
import BackButton from '../components/ui/BackButton.jsx';

const EMPTY = {
  title: '', description: '', badge: 'Flash Sale',
  startsAt: '', endsAt: '', isActive: true, items: [],
};

function ItemRow({ item, onRemove, onChange }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
      <img src={item.product?.images?.[0]?.url || 'https://picsum.photos/40'} className="w-10 h-10 rounded-lg object-cover" alt="" />
      <div className="flex-1 min-w-0">
        <p className="text-gray-800 text-sm font-medium truncate">{item.product?.name}</p>
        <p className="text-slate-400 text-xs">Regular: {formatPrice(item.product?.pricing?.regular)}</p>
      </div>
      <div className="flex items-center gap-2">
        <div>
          <label className="text-xs text-slate-400 block mb-0.5">Sale Price ৳</label>
          <input
            type="number"
            value={item.salePrice}
            onChange={e => onChange({ ...item, salePrice: Number(e.target.value) })}
            className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-0.5">Stock Limit</label>
          <input
            type="number"
            value={item.stockLimit || ''}
            onChange={e => onChange({ ...item, stockLimit: Number(e.target.value) || 0 })}
            className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-brand-500"
            placeholder="0=∞"
          />
        </div>
        <button onClick={onRemove} className="text-red-400 hover:text-red-600 p-1 mt-4">✕</button>
      </div>
    </div>
  );
}

function ProductSearch({ onAdd, selectedIds }) {
  const [q, setQ] = useState('');
  const { data } = useQuery({
    queryKey: ['products-search', q],
    queryFn: () => q.length > 1 ? productsAPI.getAll({ search: q, limit: 10 }).then(r => r.data.products) : Promise.resolve([]),
    enabled: q.length > 1,
  });

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
        <Search className="w-4 h-4 text-slate-400" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search product to add..." className="bg-transparent text-sm flex-1 outline-none text-gray-800 placeholder-slate-400" />
      </div>
      {data?.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-card z-10 max-h-52 overflow-y-auto">
          {data.map(p => (
            <button
              key={p._id}
              disabled={selectedIds.includes(p._id)}
              onClick={() => { onAdd(p); setQ(''); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-left"
            >
              <img src={p.images?.[0]?.url || 'https://picsum.photos/32'} className="w-8 h-8 rounded-lg object-cover" alt="" />
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 text-sm truncate">{p.name}</p>
                <p className="text-slate-400 text-xs">{formatPrice(p.pricing?.regular)}</p>
              </div>
              {selectedIds.includes(p._id) && <span className="text-xs text-slate-400">Added</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FlashSales() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-flash-sales'],
    queryFn: () => flashSaleAPI.getAll().then(r => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (d) => modal === 'new' ? flashSaleAPI.create(d) : flashSaleAPI.update(form._id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-flash-sales'] }); toast.success('Flash sale saved!'); setModal(null); },
    onError: () => toast.error('Failed to save'),
  });

  const deleteMutation = useMutation({
    mutationFn: flashSaleAPI.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-flash-sales'] }); toast.success('Deleted'); },
  });

  const openNew = () => { setForm(EMPTY); setModal('new'); };
  const openEdit = (s) => {
    setForm({
      ...s,
      startsAt: s.startsAt ? new Date(s.startsAt).toISOString().slice(0, 16) : '',
      endsAt: s.endsAt ? new Date(s.endsAt).toISOString().slice(0, 16) : '',
    });
    setModal('edit');
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addProduct = (product) => {
    set('items', [...(form.items || []), { product, productId: product._id, salePrice: product.pricing?.sale || product.pricing?.regular, stockLimit: 0 }]);
  };

  const removeItem = (idx) => set('items', form.items.filter((_, i) => i !== idx));
  const updateItem = (idx, item) => set('items', form.items.map((it, i) => i === idx ? item : it));

  const handleSave = () => {
    if (!form.title || !form.startsAt || !form.endsAt) return toast.error('Fill title, start and end time');
    if (!form.items?.length) return toast.error('Add at least one product');
    const payload = {
      ...form,
      items: form.items.map(i => ({ product: i.product?._id || i.product, salePrice: i.salePrice, stockLimit: i.stockLimit || 0 })),
    };
    saveMutation.mutate(payload);
  };

  const now = new Date();
  const getStatus = (s) => {
    const start = new Date(s.startsAt);
    const end = new Date(s.endsAt);
    if (!s.isActive) return { label: 'Inactive', cls: 'bg-gray-100 text-gray-600' };
    if (now < start) return { label: 'Upcoming', cls: 'bg-blue-100 text-blue-700' };
    if (now > end) return { label: 'Ended', cls: 'bg-red-100 text-red-600' };
    return { label: '🔴 Live', cls: 'bg-emerald-100 text-emerald-700' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Flash Sales</h1>
            <p className="text-slate-400 text-sm">Manage timed deals and promotions</p>
          </div>
        </div>
        <button onClick={openNew} className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> New Flash Sale
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {data?.sales?.map(sale => {
            const status = getStatus(sale);
            return (
              <div key={sale._id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">{sale.title}</h3>
                        <span className={`badge text-xs ${status.cls}`}>{status.label}</span>
                      </div>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {formatDate(sale.startsAt)} → {formatDate(sale.endsAt)} · {sale.items?.length} products
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openEdit(sale)} className="btn-ghost p-2 text-blue-500"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => { if (confirm('Delete this flash sale?')) deleteMutation.mutate(sale._id); }} className="btn-ghost p-2 text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
          {!data?.sales?.length && (
            <div className="card p-16 text-center text-slate-400">
              <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
              No flash sales yet.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-gray-800 text-lg">{modal === 'new' ? 'New Flash Sale' : 'Edit Flash Sale'}</h2>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { key: 'title', label: 'Sale Title *', placeholder: 'Weekend Flash Sale' },
                  { key: 'badge', label: 'Badge Text', placeholder: 'Flash Sale' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-slate-500 text-sm mb-1.5 block">{f.label}</label>
                    <input value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)} className="input-field" placeholder={f.placeholder} />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-slate-500 text-sm mb-1.5 block">Description</label>
                <input value={form.description || ''} onChange={e => set('description', e.target.value)} className="input-field" placeholder="Optional description" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-500 text-sm mb-1.5 block">Starts At *</label>
                  <input type="datetime-local" value={form.startsAt} onChange={e => set('startsAt', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="text-slate-500 text-sm mb-1.5 block">Ends At *</label>
                  <input type="datetime-local" value={form.endsAt} onChange={e => set('endsAt', e.target.value)} className="input-field" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-slate-500 text-sm font-medium block">Products</label>
                <ProductSearch onAdd={addProduct} selectedIds={form.items?.map(i => i.product?._id || i.product) || []} />
                <div className="space-y-2">
                  {form.items?.map((item, i) => (
                    <ItemRow key={i} item={item} onRemove={() => removeItem(i)} onChange={updated => updateItem(i, updated)} />
                  ))}
                </div>
                {!form.items?.length && <p className="text-slate-400 text-sm text-center py-4 border-2 border-dashed border-gray-200 rounded-xl">Search and add products above</p>}
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="w-4 h-4 accent-amber-500" />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saveMutation.isPending} className="btn-primary flex-1">
                {saveMutation.isPending ? 'Saving...' : 'Save Flash Sale'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
