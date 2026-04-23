import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, X, Check, ChevronDown, ChevronRight, FolderOpen, Tag, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { categoriesAPI } from '../utils/api.js';
import BackButton from '../components/ui/BackButton.jsx';

const CAT_COLORS = [
  'bg-violet-100 text-violet-600',
  'bg-sky-100 text-sky-600',
  'bg-emerald-100 text-emerald-600',
  'bg-amber-100 text-amber-600',
  'bg-rose-100 text-rose-600',
  'bg-cyan-100 text-cyan-600',
  'bg-indigo-100 text-indigo-600',
  'bg-orange-100 text-orange-600',
];

const EMPTY = { name: '', description: '', icon: '🛍️', sortOrder: 0, status: 'active', parent: null };

export default function Categories() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [expanded, setExpanded] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => categoriesAPI.getAll().then(r => r.data.categories),
  });

  const parents = data?.filter(c => !c.parent) || [];
  const subcatsOf = (parentId) => data?.filter(c => c.parent?._id === parentId || c.parent === parentId) || [];

  const { mutate: save, isPending } = useMutation({
    mutationFn: (d) => modal?.data ? categoriesAPI.update(modal.data._id, d) : categoriesAPI.create(d),
    onSuccess: () => {
      toast.success(modal?.data ? 'Category updated' : 'Category created');
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      setModal(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Save failed'),
  });

  const { mutate: del } = useMutation({
    mutationFn: (id) => categoriesAPI.delete(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['admin-categories'] }); },
    onError: () => toast.error('Delete failed'),
  });

  const openNew = (parentId = null) => {
    setForm({ ...EMPTY, parent: parentId });
    setModal({ mode: 'new', isSubcat: !!parentId });
  };

  const openEdit = (cat) => {
    setForm({
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon,
      sortOrder: cat.sortOrder,
      status: cat.status,
      parent: cat.parent?._id || cat.parent || null,
    });
    setModal({ mode: 'edit', data: cat, isSubcat: !!cat.parent });
  };

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="text-xl font-display font-bold text-gray-900">Categories</h1>
        <button onClick={() => openNew()} className="ml-auto btn-primary">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-gray-50 rounded-xl animate-pulse" />)
          : parents.map(cat => {
              const subs = subcatsOf(cat._id);
              const isOpen = expanded[cat._id];
              return (
                <div key={cat._id} className="card overflow-hidden">
                  {/* Parent row */}
                  <div className="flex items-center gap-3 p-4">
                    <button
                      onClick={() => subs.length && toggle(cat._id)}
                      className={`flex items-center justify-center w-6 h-6 text-gray-400 transition-transform ${subs.length ? 'hover:text-gray-600 cursor-pointer' : 'opacity-0 pointer-events-none'}`}
                    >
                      {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${CAT_COLORS[parents.indexOf(cat) % CAT_COLORS.length]}`}>
                      <FolderOpen className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                        <p className="text-gray-800 font-semibold">{cat.name}</p>
                        <span className={`badge text-xs ${cat.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'}`}>{cat.status}</span>
                      </div>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {cat.productCount || 0} products · {subs.length} subcategories
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => { openNew(cat._id); setExpanded(p => ({ ...p, [cat._id]: true })); }}
                        className="btn-ghost p-1.5 text-amber-600 text-xs gap-1 flex items-center"
                        title="Add subcategory"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-xs">Sub</span>
                      </button>
                      <button onClick={() => openEdit(cat)} className="btn-ghost p-1.5"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => confirm(`Delete "${cat.name}"?`) && del(cat._id)} className="btn-ghost p-1.5 text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>

                  {/* Subcategories */}
                  {isOpen && subs.length > 0 && (
                    <div className="border-t border-gray-100 bg-gray-50/50">
                      {subs.map(sub => (
                        <div key={sub._id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0">
                          <div className="w-6 h-6 ml-6" />
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                            <Tag className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <Tag className="w-3 h-3 text-slate-400" />
                              <p className="text-gray-700 font-medium text-sm">{sub.name}</p>
                              <span className={`badge text-xs ${sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'}`}>{sub.status}</span>
                            </div>
                            <p className="text-slate-400 text-xs mt-0.5">{sub.productCount || 0} products</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => openEdit(sub)} className="btn-ghost p-1.5"><Edit className="w-3.5 h-3.5" /></button>
                            <button onClick={() => confirm(`Delete "${sub.name}"?`) && del(sub._id)} className="btn-ghost p-1.5 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
        }
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">
                  {modal.mode === 'new'
                    ? (modal.isSubcat ? 'New Subcategory' : 'New Category')
                    : (modal.isSubcat ? 'Edit Subcategory' : 'Edit Category')}
                </h3>
                {modal.isSubcat && (
                  <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Under: {parents.find(p => p._id === form.parent)?.name || '—'}
                  </p>
                )}
              </div>
              <button onClick={() => setModal(null)} className="btn-ghost p-1"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Icon (emoji)</label>
                  <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className="input-field text-2xl" />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Sort Order</label>
                  <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) }))} className="input-field" />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1 block">Name *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="Category name" />
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1 block">Description</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field" placeholder="Brief description" />
              </div>

              {/* Parent selector — show for subcats or allow changing */}
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Parent Category</label>
                <select value={form.parent || ''} onChange={e => setForm(f => ({ ...f, parent: e.target.value || null }))} className="input-field">
                  <option value="">— None (top-level category) —</option>
                  {parents.filter(p => p._id !== modal?.data?._id).map(p => (
                    <option key={p._id} value={p._id}>{p.icon} {p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1 block">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-field">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => save(form)} disabled={isPending || !form.name} className="btn-primary flex-1">
                <Check className="w-4 h-4" />
                {isPending ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
