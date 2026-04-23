import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, X, Star, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { productsAPI, categoriesAPI, uploadAPI } from '../utils/api.js';
import BackButton from '../components/ui/BackButton.jsx';

const BADGES = ['new', 'hot', 'sale', 'featured', 'limited'];

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '', description: '', shortDescription: '', category: '',
    pricing: { regular: '', sale: '' },
    inventory: { quantity: 0, lowStockThreshold: 5, trackInventory: true },
    images: [],
    badges: [],
    tags: [],
    attributes: [],
    status: 'active',
    sku: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [parentCat, setParentCat] = useState('');

  const { data: cats } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => categoriesAPI.getAll().then(r => r.data.categories),
  });

  const parentCats = cats?.filter(c => !c.parent) || [];
  const subCats = cats?.filter(c => c.parent && (c.parent?._id?.toString() === parentCat || c.parent?.toString() === parentCat)) || [];

  const { data: productData } = useQuery({
    queryKey: ['product-edit', id],
    queryFn: () => productsAPI.getById(id).then(r => r.data.product),
    enabled: isEdit,
  });

  useEffect(() => {
    if (productData && cats) {
      const catId = productData.category?._id || productData.category || '';
      const catObj = cats.find(c => c._id === catId);
      if (catObj?.parent) {
        setParentCat(catObj.parent?._id || catObj.parent);
      } else {
        setParentCat(catId);
      }
      setForm({
        name: productData.name || '',
        description: productData.description || '',
        shortDescription: productData.shortDescription || '',
        category: catId,
        pricing: { regular: productData.pricing?.regular || '', sale: productData.pricing?.sale || '' },
        inventory: productData.inventory || { quantity: 0, lowStockThreshold: 5, trackInventory: true },
        images: productData.images || [],
        badges: productData.badges || [],
        tags: productData.tags || [],
        attributes: productData.attributes || [],
        status: productData.status || 'active',
        sku: productData.sku || '',
      });
    }
  }, [productData, cats]);

  const { mutate: save, isPending } = useMutation({
    mutationFn: (data) => isEdit ? productsAPI.update(id, data) : productsAPI.create(data),
    onSuccess: () => {
      toast.success(isEdit ? 'Product updated!' : 'Product created!');
      qc.invalidateQueries(['admin-products']);
      navigate('/products');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Save failed'),
  });

  const handleImageUpload = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const res = await uploadAPI.images(Array.from(files));
      const newImages = res.data.images.map((img, i) => ({
        url: img.url,
        publicId: img.publicId,
        isFeatured: form.images.length === 0 && i === 0,
        sortOrder: form.images.length + i,
      }));
      setForm(f => ({ ...f, images: [...f.images, ...newImages] }));
      toast.success(`${newImages.length} image(s) uploaded`);
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const setFeaturedImage = (idx) => {
    setForm(f => ({ ...f, images: f.images.map((img, i) => ({ ...img, isFeatured: i === idx })) }));
  };

  const removeImage = (idx) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(f => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const addAttribute = () => setForm(f => ({ ...f, attributes: [...f.attributes, { name: '', value: '' }] }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.category || !form.pricing.regular) {
      return toast.error('Fill in required fields');
    }
    const cleanData = {
      ...form,
      pricing: {
        regular: parseFloat(form.pricing.regular),
        sale: form.pricing.sale ? parseFloat(form.pricing.sale) : undefined,
      },
      inventory: {
        ...form.inventory,
        quantity: parseInt(form.inventory.quantity),
      },
      attributes: form.attributes.filter(a => a.name && a.value),
    };
    if (!cleanData.pricing.sale) delete cleanData.pricing.sale;
    save(cleanData);
  };

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="text-xl font-display font-bold text-gray-900">{isEdit ? 'Edit Product' : 'New Product'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          {/* Basic info */}
          <div className="card p-5 space-y-4 md:col-span-2">
            <h3 className="font-semibold text-gray-800">Basic Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-slate-400 text-sm mb-1.5 block">Product Name *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="Enter product name" />
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-slate-400 text-sm mb-1.5 block">Category *</label>
                  <select
                    required={!subCats.length}
                    value={parentCat}
                    onChange={e => {
                      setParentCat(e.target.value);
                      setForm(f => ({ ...f, category: e.target.value }));
                    }}
                    className="input-field"
                  >
                    <option value="">Select category</option>
                    {parentCats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                {parentCat && subCats.length > 0 && (
                  <div>
                    <label className="text-slate-400 text-sm mb-1.5 block">Subcategory</label>
                    <select
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value || parentCat }))}
                      className="input-field border-amber-300 focus:border-amber-500"
                    >
                      <option value="">— Use parent category only —</option>
                      {subCats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1.5 block">SKU</label>
                <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className="input-field" placeholder="Optional unique SKU" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-slate-400 text-sm mb-1.5 block">Short Description</label>
                <input value={form.shortDescription} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} className="input-field" placeholder="Brief summary (shown in cards)" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-slate-400 text-sm mb-1.5 block">Full Description *</label>
                <textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={5} className="input-field resize-none" placeholder="Detailed product description..." />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-gray-800">Pricing & Inventory</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-sm mb-1.5 block">Regular Price (৳) *</label>
                <input required type="number" min="0" value={form.pricing.regular} onChange={e => setForm(f => ({ ...f, pricing: { ...f.pricing, regular: e.target.value } }))} className="input-field" placeholder="0" />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1.5 block">Sale Price (৳)</label>
                <input type="number" min="0" value={form.pricing.sale} onChange={e => setForm(f => ({ ...f, pricing: { ...f.pricing, sale: e.target.value } }))} className="input-field" placeholder="Optional" />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1.5 block">Stock Quantity</label>
                <input type="number" min="0" value={form.inventory.quantity} onChange={e => setForm(f => ({ ...f, inventory: { ...f.inventory, quantity: e.target.value } }))} className="input-field" />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1.5 block">Low Stock Alert</label>
                <input type="number" min="0" value={form.inventory.lowStockThreshold} onChange={e => setForm(f => ({ ...f, inventory: { ...f.inventory, lowStockThreshold: parseInt(e.target.value) } }))} className="input-field" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.inventory.trackInventory} onChange={e => setForm(f => ({ ...f, inventory: { ...f.inventory, trackInventory: e.target.checked } }))} className="w-4 h-4 accent-brand-600" />
              <span className="text-slate-400 text-sm">Track inventory</span>
            </label>
          </div>

          {/* Status & Badges */}
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-gray-800">Status & Badges</h3>
            <div>
              <label className="text-slate-400 text-sm mb-1.5 block">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-field">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-sm mb-2 block">Badges</label>
              <div className="flex flex-wrap gap-2">
                {BADGES.map(badge => (
                  <button
                    key={badge}
                    type="button"
                    onClick={() => setForm(f => ({
                      ...f,
                      badges: f.badges.includes(badge) ? f.badges.filter(b => b !== badge) : [...f.badges, badge],
                    }))}
                    className={`px-3 py-1 rounded-full text-xs border capitalize transition-all ${form.badges.includes(badge) ? 'bg-brand-600/20 text-brand-600 border-brand-600/30' : 'text-slate-500 border-gray-200 hover:border-gray-200'}`}
                  >
                    {badge}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-slate-400 text-sm mb-1.5 block">Tags</label>
              <div className="flex gap-2">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} className="input-field flex-1" placeholder="Add tag & press Enter" />
                <button type="button" onClick={addTag} className="btn-secondary"><Plus className="w-4 h-4" /></button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 badge bg-dark-700 text-slate-400">
                      #{tag}
                      <button type="button" onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))} className="text-slate-600 hover:text-red-400">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-gray-800">Product Images</h3>
          <p className="text-slate-500 text-xs">Click ⭐ to set as featured image (shown first). First image is featured by default.</p>

          <label className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-brand-600/40 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload className="w-8 h-8 text-slate-500 mb-2" />
            <p className="text-slate-400 text-sm">{uploading ? 'Uploading...' : 'Click or drag images here'}</p>
            <p className="text-slate-600 text-xs mt-1">JPEG, PNG, WebP — max 5MB each</p>
            <input type="file" multiple accept="image/*" onChange={e => handleImageUpload(e.target.files)} className="sr-only" disabled={uploading} />
          </label>

          {form.images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {form.images.map((img, i) => (
                <div key={i} className="relative group aspect-square">
                  <img src={img.url} alt="" className="w-full h-full object-cover rounded-xl" />
                  {img.isFeatured && (
                    <div className="absolute top-1 left-1 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center">
                      <Star className="w-3 h-3 text-dark-900 fill-current" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gray-900/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                    <button type="button" onClick={() => setFeaturedImage(i)} className="w-7 h-7 bg-gold-500 rounded-full flex items-center justify-center" title="Set as featured">
                      <Star className="w-3.5 h-3.5 text-dark-900 fill-current" />
                    </button>
                    <button type="button" onClick={() => removeImage(i)} className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center">
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attributes */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Specifications</h3>
            <button type="button" onClick={addAttribute} className="btn-ghost text-xs gap-1">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          {form.attributes.map((attr, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={attr.name}
                onChange={e => setForm(f => ({ ...f, attributes: f.attributes.map((a, ai) => ai === i ? { ...a, name: e.target.value } : a) }))}
                className="input-field flex-1"
                placeholder="e.g. Color"
              />
              <input
                value={attr.value}
                onChange={e => setForm(f => ({ ...f, attributes: f.attributes.map((a, ai) => ai === i ? { ...a, value: e.target.value } : a) }))}
                className="input-field flex-1"
                placeholder="e.g. Black"
              />
              <button type="button" onClick={() => setForm(f => ({ ...f, attributes: f.attributes.filter((_, ai) => ai !== i) }))} className="btn-ghost p-2 text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={isPending} className="btn-primary px-8">
            {isPending ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
          </button>
          <button type="button" onClick={() => navigate('/products')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
