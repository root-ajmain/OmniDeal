import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X, Star, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import { categoriesAPI, productsAPI } from '../utils/api.js';
import ProductGrid from '../components/product/ProductGrid.jsx';
import BackButton from '../components/ui/BackButton.jsx';
import { SORT_OPTIONS } from '../utils/constants.js';

const RATING_OPTIONS = [4, 3, 2, 1];

export default function Category() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [rating, setRating] = useState(searchParams.get('rating') || '');
  const [subcat, setSubcat] = useState(searchParams.get('subcat') || '');

  const activeFilterCount =
    (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (rating ? 1 : 0) + (subcat ? 1 : 0);

  const { data: catData } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoriesAPI.getBySlug(slug).then(r => r.data.category),
  });

  // Fetch subcategories — only if this is a parent category (parent === null)
  const { data: subcatsData } = useQuery({
    queryKey: ['subcategories', catData?._id],
    queryFn: () => categoriesAPI.getAll({ parent: catData._id }).then(r => r.data.categories),
    enabled: !!catData?._id && !catData?.parent,
  });
  const subcats = subcatsData || [];

  // Active category to query products: selected subcategory slug OR current slug
  const activeCategory = subcat || slug;

  const { data, isLoading } = useQuery({
    queryKey: ['products', 'category', slug, sort, page, minPrice, maxPrice, rating, subcat],
    queryFn: () =>
      productsAPI.getAll({
        category: activeCategory,
        sort,
        page,
        limit: 12,
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
        ...(rating && { rating }),
      }).then(r => r.data),
    keepPreviousData: true,
  });

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.set('page', '1');
    setSearchParams(p);
  };

  const updateSort = (val) => {
    const p = new URLSearchParams(searchParams);
    p.set('sort', val);
    p.delete('page');
    setSearchParams(p);
  };

  const applyFilters = () => {
    const p = new URLSearchParams(searchParams);
    if (minPrice) p.set('minPrice', minPrice); else p.delete('minPrice');
    if (maxPrice) p.set('maxPrice', maxPrice); else p.delete('maxPrice');
    if (rating) p.set('rating', rating); else p.delete('rating');
    if (subcat) p.set('subcat', subcat); else p.delete('subcat');
    p.set('page', '1');
    setSearchParams(p);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setRating('');
    setSubcat('');
    const p = new URLSearchParams(searchParams);
    p.delete('minPrice');
    p.delete('maxPrice');
    p.delete('rating');
    p.delete('subcat');
    p.set('page', '1');
    setSearchParams(p);
  };

  const toggleSubcat = (s) => {
    const next = subcat === s ? '' : s;
    setSubcat(next);
    setParam('subcat', next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <BackButton className="mb-6" />

      {/* Category header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-3xl">
          {catData?.icon}
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">{catData?.name || slug}</h1>
          {catData?.description && <p className="text-slate-400 text-sm mt-1">{catData.description}</p>}
          {data?.pagination && <p className="text-slate-500 text-sm mt-1">{data.pagination.total} products</p>}
        </div>
      </div>

      {/* Subcategory pills — quick access above filters (parent categories only) */}
      {subcats.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => toggleSubcat('')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${!subcat ? 'bg-brand-600/20 text-brand-600 border-brand-600/30' : 'text-slate-400 border-gray-200 hover:border-gray-300'}`}
          >
            All
          </button>
          {subcats.map(s => (
            <button
              key={s._id}
              onClick={() => toggleSubcat(s.slug)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${subcat === s.slug ? 'bg-brand-600/20 text-brand-600 border-brand-600/30' : 'text-slate-400 border-gray-200 hover:border-gray-300'}`}
            >
              {s.icon && <span className="text-sm">{s.icon}</span>}
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Sort + Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
          {SORT_OPTIONS.map(o => (
            <button
              key={o.value}
              onClick={() => updateSort(o.value)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm border transition-all ${sort === o.value ? 'bg-brand-600/20 text-brand-600 border-brand-600/30' : 'text-slate-400 border-gray-200 hover:border-gray-300'}`}
            >
              {o.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setFiltersOpen(v => !v)}
          className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-all ${filtersOpen || activeFilterCount > 0 ? 'bg-brand-600/20 text-brand-600 border-brand-600/30' : 'text-slate-400 border-gray-200 hover:border-gray-300'}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
          {filtersOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="shrink-0 flex items-center gap-1.5 text-sm text-red-400 hover:text-red-500 transition-colors">
            <X className="w-3.5 h-3.5" /> Clear filters
          </button>
        )}
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <div className="card p-5 mb-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Subcategory filter — only shown for parent categories */}
          {subcats.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-brand-600" /> Subcategory
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSubcat('')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border transition-all ${!subcat ? 'bg-brand-600/20 text-brand-600 border-brand-600/40' : 'text-slate-400 border-gray-200 hover:border-brand-300'}`}
                >
                  All
                </button>
                {subcats.map(s => (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => setSubcat(subcat === s.slug ? '' : s.slug)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border transition-all ${subcat === s.slug ? 'bg-brand-600/20 text-brand-600 border-brand-600/40' : 'text-slate-400 border-gray-200 hover:border-brand-300'}`}
                  >
                    {s.icon && <span>{s.icon}</span>}
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price range */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">Price Range (৳)</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                placeholder="Min"
                className="input-field text-sm flex-1"
              />
              <span className="text-slate-400 text-sm shrink-0">–</span>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                placeholder="Max"
                className="input-field text-sm flex-1"
              />
            </div>
          </div>

          {/* Rating filter */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">Minimum Rating</p>
            <div className="flex flex-wrap gap-2">
              {RATING_OPTIONS.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRating(rating === String(r) ? '' : String(r))}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border transition-all ${rating === String(r) ? 'bg-amber-500/20 text-amber-600 border-amber-500/40' : 'text-slate-400 border-gray-200 hover:border-amber-300'}`}
                >
                  <Star className={`w-3 h-3 ${rating === String(r) ? 'fill-amber-500 text-amber-500' : ''}`} />
                  {r}+ stars
                </button>
              ))}
            </div>
          </div>

          {/* Active filters summary + Apply */}
          <div className="flex flex-col justify-end gap-2">
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {subcat && <span className="badge bg-brand-600/10 text-brand-600 text-xs">{subcats.find(s => s.slug === subcat)?.name || subcat}</span>}
                {minPrice && <span className="badge bg-brand-600/10 text-brand-600 text-xs">Min ৳{minPrice}</span>}
                {maxPrice && <span className="badge bg-brand-600/10 text-brand-600 text-xs">Max ৳{maxPrice}</span>}
                {rating && <span className="badge bg-amber-500/10 text-amber-600 text-xs">{rating}+ ★</span>}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={applyFilters} className="btn-primary text-sm py-2 flex-1">
                Apply Filters
              </button>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="btn-secondary text-sm py-2">
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ProductGrid products={data?.products} isLoading={isLoading} />

      {/* Pagination */}
      {data?.pagination?.pages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => { const ps = new URLSearchParams(searchParams); ps.set('page', p); setSearchParams(ps); }}
              className={`w-10 h-10 rounded-xl text-sm border transition-all ${p === page ? 'bg-brand-600/20 text-brand-600 border-brand-600/30' : 'text-slate-400 border-gray-200 hover:border-gray-300'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
