import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X, Star, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { productsAPI, categoriesAPI } from '../utils/api.js';
import ProductGrid from '../components/product/ProductGrid.jsx';
import { SORT_OPTIONS } from '../utils/constants.js';

const COLORS = [
  { name: 'Black',  hex: '#1a1a1a' },
  { name: 'White',  hex: '#f5f5f5', border: true },
  { name: 'Red',    hex: '#ef4444' },
  { name: 'Blue',   hex: '#3b82f6' },
  { name: 'Green',  hex: '#22c55e' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Pink',   hex: '#ec4899' },
  { name: 'Gray',   hex: '#6b7280' },
  { name: 'Brown',  hex: '#92400e' },
  { name: 'Navy',   hex: '#1e3a5f' },
];

const PRICE_PRESETS = [
  { label: 'Under ৳500',    min: '',    max: '500' },
  { label: '৳500–৳1,000',  min: '500', max: '1000' },
  { label: '৳1,000–৳5,000',min: '1000',max: '5000' },
  { label: 'Above ৳5,000', min: '5000',max: '' },
];

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full py-3 text-sm font-semibold text-gray-800"
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="mt-1">{children}</div>}
    </div>
  );
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const category  = searchParams.get('category')  || '';
  const sort      = searchParams.get('sort')       || 'newest';
  const badge     = searchParams.get('badge')      || '';
  const page      = parseInt(searchParams.get('page') || '1');
  const minPrice  = searchParams.get('minPrice')   || '';
  const maxPrice  = searchParams.get('maxPrice')   || '';
  const color     = searchParams.get('color')      || '';
  const rating    = searchParams.get('rating')     || '';

  const set = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const clearAll = () => setSearchParams({});

  const hasFilters = category || badge || minPrice || maxPrice || color || rating;

  const { data, isLoading } = useQuery({
    queryKey: ['products', { category, sort, badge, page, minPrice, maxPrice, color, rating }],
    queryFn: () => productsAPI.getAll({ category, sort, badge, page, limit: 12, minPrice, maxPrice, color, rating }).then(r => r.data),
    keepPreviousData: true,
  });

  const { data: cats } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll().then(r => r.data.categories),
    staleTime: 10 * 60 * 1000,
  });

  const Sidebar = () => (
    <div className="space-y-0">
      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-2 text-xs text-red-400 hover:text-red-500 mb-4 font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Clear all filters
        </button>
      )}

      {/* Categories */}
      <Section title="Category">
        <div className="space-y-1">
          <button
            onClick={() => set('category', '')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${!category ? 'bg-amber-50 text-amber-700 font-medium' : 'text-slate-600 hover:bg-gray-50'}`}
          >
            All Categories
          </button>
          {cats?.map(c => (
            <button
              key={c._id}
              onClick={() => set('category', c.slug)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${category === c.slug ? 'bg-amber-50 text-amber-700 font-medium' : 'text-slate-600 hover:bg-gray-50'}`}
            >
              <span>{c.name}</span>
              <span className="text-xs text-slate-400">{c.productCount || 0}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* Price */}
      <Section title="Price Range">
        <div className="space-y-2 mb-3">
          {PRICE_PRESETS.map(p => {
            const active = minPrice === p.min && maxPrice === p.max;
            return (
              <button
                key={p.label}
                onClick={() => {
                  const ps = new URLSearchParams(searchParams);
                  p.min ? ps.set('minPrice', p.min) : ps.delete('minPrice');
                  p.max ? ps.set('maxPrice', p.max) : ps.delete('maxPrice');
                  ps.delete('page');
                  setSearchParams(ps);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${active ? 'bg-amber-50 text-amber-700 font-medium' : 'text-slate-600 hover:bg-gray-50'}`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 items-center mt-2">
          <input
            type="number"
            value={minPrice}
            onChange={e => set('minPrice', e.target.value)}
            placeholder="Min ৳"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
          />
          <span className="text-slate-300 shrink-0">—</span>
          <input
            type="number"
            value={maxPrice}
            onChange={e => set('maxPrice', e.target.value)}
            placeholder="Max ৳"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
          />
        </div>
      </Section>

      {/* Color */}
      <Section title="Color">
        <div className="flex flex-wrap gap-2 mt-1">
          {COLORS.map(c => (
            <button
              key={c.name}
              onClick={() => set('color', color === c.name ? '' : c.name)}
              title={c.name}
              className={`w-8 h-8 rounded-full transition-all ${color === c.name ? 'ring-2 ring-offset-2 ring-amber-500 scale-110' : 'hover:scale-105'} ${c.border ? 'border border-gray-300' : ''}`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
        {color && (
          <p className="text-xs text-amber-600 mt-2 font-medium">
            Color: {color} <button onClick={() => set('color', '')} className="ml-1 text-slate-400 hover:text-red-400">✕</button>
          </p>
        )}
      </Section>

      {/* Rating */}
      <Section title="Min Rating">
        <div className="space-y-1">
          {[4, 3, 2, 1].map(r => (
            <button
              key={r}
              onClick={() => set('rating', rating === String(r) ? '' : String(r))}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${rating === String(r) ? 'bg-amber-50 text-amber-700 font-medium' : 'text-slate-600 hover:bg-gray-50'}`}
            >
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < r ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                ))}
              </span>
              <span>& up</span>
            </button>
          ))}
        </div>
      </Section>

      {/* Badge */}
      <Section title="Product Type">
        <div className="space-y-1">
          {[['', 'All Products'], ['new', "New Arrivals"], ['hot', "Hot Deals"], ['sale', "On Sale"], ['featured', "Featured"], ['limited', "Limited"]].map(([val, label]) => (
            <button
              key={val}
              onClick={() => set('badge', val)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${badge === val ? 'bg-amber-50 text-amber-700 font-medium' : 'text-slate-600 hover:bg-gray-50'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </Section>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">
            {category ? cats?.find(c => c.slug === category)?.name || 'Products' : 'All Products'}
          </h1>
          {data?.pagination && (
            <p className="text-slate-500 text-sm mt-1">{data.pagination.total} products found</p>
          )}
        </div>
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="lg:hidden btn-secondary text-sm gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasFilters && <span className="w-2 h-2 bg-amber-500 rounded-full" />}
        </button>
      </div>

      {/* Category quick-browse */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-1">
        <button
          onClick={() => set('category', '')}
          className={`shrink-0 px-4 py-2 rounded-full text-sm border transition-all ${!category ? 'bg-amber-500 text-white border-amber-500' : 'text-slate-500 border-gray-200 hover:border-amber-300'}`}
        >
          All
        </button>
        {cats?.map(c => (
          <button
            key={c._id}
            onClick={() => set('category', c.slug)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm border transition-all ${category === c.slug ? 'bg-amber-500 text-white border-amber-500' : 'text-slate-500 border-gray-200 hover:border-amber-300'}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="card p-4 sticky top-24">
            <p className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-500" /> Filters
            </p>
            <Sidebar />
          </div>
        </aside>

        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <p className="font-semibold text-gray-800">Filters</p>
                <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="p-4">
                <Sidebar />
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Sort + active filters */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
              {SORT_OPTIONS.map(o => (
                <button
                  key={o.value}
                  onClick={() => set('sort', o.value)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs border transition-all ${sort === o.value ? 'bg-amber-500/10 text-amber-700 border-amber-300 font-medium' : 'text-slate-400 border-gray-200 hover:border-gray-300'}`}
                >
                  {o.label}
                </button>
              ))}
            </div>

            {/* Active filter tags */}
            {color && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs border border-amber-200">
                <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: COLORS.find(c => c.name === color)?.hex }} />
                {color}
                <button onClick={() => set('color', '')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {rating && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs border border-amber-200">
                ⭐ {rating}+ stars
                <button onClick={() => set('rating', '')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs border border-amber-200">
                ৳{minPrice || '0'}–{maxPrice || '∞'}
                <button onClick={() => { set('minPrice', ''); set('maxPrice', ''); }}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>

          <ProductGrid products={data?.products} isLoading={isLoading} />

          {/* Pagination */}
          {data?.pagination && data.pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => { const ps = new URLSearchParams(searchParams); ps.set('page', p); setSearchParams(ps); }}
                  className={`w-10 h-10 rounded-xl text-sm border transition-all ${p === page ? 'bg-amber-500 text-white border-amber-500' : 'text-slate-400 border-gray-200 hover:border-gray-300'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
