import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Image, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { bannersAPI, uploadAPI } from '../utils/api.js';
import BackButton from '../components/ui/BackButton.jsx';

const EMPTY = { title: '', subtitle: '', image: '', link: '', linkLabel: 'Shop Now', badge: '', type: 'hero', position: 0, isActive: true };

export default function Banners() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => bannersAPI.getAll().then(r => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => modal === 'new' ? bannersAPI.create(data) : bannersAPI.update(form._id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-banners'] }); toast.success('Banner saved!'); setModal(null); },
    onError: () => toast.error('Failed to save banner'),
  });

  const deleteMutation = useMutation({
    mutationFn: bannersAPI.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-banners'] }); toast.success('Banner deleted'); },
  });

  const openNew = () => { setForm(EMPTY); setModal('new'); };
  const openEdit = (b) => { setForm(b); setModal('edit'); };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadAPI.image(file);
      setForm(f => ({ ...f, image: res.data.url }));
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Banners</h1>
            <p className="text-slate-400 text-sm">Manage homepage banners & promotions</p>
          </div>
        </div>
        <button onClick={openNew} className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.banners?.map(banner => (
            <div key={banner._id} className="card overflow-hidden">
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                {banner.image ? (
                  <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-10 h-10 text-slate-300" />
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className={`badge text-xs ${banner.type === 'hero' ? 'bg-brand-600/80 text-white' : 'bg-gray-900/80 text-white'}`}>{banner.type}</span>
                  {!banner.isActive && <span className="badge bg-red-500/80 text-white text-xs">Inactive</span>}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 truncate">{banner.title}</h3>
                {banner.subtitle && <p className="text-slate-500 text-xs truncate mt-0.5">{banner.subtitle}</p>}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-slate-400 text-xs">Position: {banner.position}</span>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(banner)} className="btn-ghost p-1.5 text-blue-500"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => { if (confirm('Delete this banner?')) deleteMutation.mutate(banner._id); }} className="btn-ghost p-1.5 text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!data?.banners?.length && (
            <div className="col-span-3 text-center py-16 text-slate-400">
              <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
              No banners yet. Add your first banner.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800 text-lg">{modal === 'new' ? 'Add Banner' : 'Edit Banner'}</h2>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="text-slate-500 text-sm mb-1.5 block">Banner Image</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
                  {form.image ? (
                    <div className="relative">
                      <img src={form.image} alt="Banner" className="w-full h-32 object-cover rounded-lg" />
                      <button onClick={() => set('image', '')} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">✕</button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" onChange={handleUpload} className="sr-only" />
                      <Image className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">{uploading ? 'Uploading...' : 'Click to upload image'}</p>
                    </label>
                  )}
                </div>
                <div className="mt-2">
                  <input value={form.image} onChange={e => set('image', e.target.value)} className="input-field text-xs" placeholder="Or paste image URL" />
                </div>
              </div>

              {[
                { key: 'title', label: 'Title *', placeholder: 'Big Summer Sale' },
                { key: 'subtitle', label: 'Subtitle', placeholder: 'Up to 50% off' },
                { key: 'badge', label: 'Badge Text', placeholder: 'Limited Time' },
                { key: 'link', label: 'Link URL', placeholder: '/products or /flash-sale' },
                { key: 'linkLabel', label: 'Button Label', placeholder: 'Shop Now' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-slate-500 text-sm mb-1.5 block">{f.label}</label>
                  <input value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)} className="input-field" placeholder={f.placeholder} />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-500 text-sm mb-1.5 block">Type</label>
                  <select value={form.type} onChange={e => set('type', e.target.value)} className="input-field">
                    <option value="hero">Hero</option>
                    <option value="promo">Promo</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 text-sm mb-1.5 block">Sort Position</label>
                  <input type="number" value={form.position} onChange={e => set('position', Number(e.target.value))} className="input-field" />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <button type="button" onClick={() => set('isActive', !form.isActive)} className={`transition-colors ${form.isActive ? 'text-brand-600' : 'text-slate-400'}`}>
                  {form.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
                <span className="text-sm text-gray-700 font-medium">{form.isActive ? 'Active (visible on site)' : 'Inactive (hidden)'}</span>
              </label>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => saveMutation.mutate(form)}
                disabled={saveMutation.isPending || !form.title}
                className="btn-primary flex-1"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save Banner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
