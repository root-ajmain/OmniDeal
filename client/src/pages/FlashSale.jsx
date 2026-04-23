import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Zap, Clock, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { flashSaleAPI } from '../utils/api.js';
import ProductCard from '../components/product/ProductCard.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';

function Countdown({ endsAt, startsAt, isLive }) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0, total: 0 });

  useEffect(() => {
    const target = isLive ? endsAt : startsAt;
    const calc = () => {
      const diff = Math.max(0, new Date(target) - Date.now());
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        total: diff,
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [endsAt, startsAt, isLive]);

  const pad = n => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-5 h-5 text-red-400" />
      <span className="text-sm text-slate-500 font-medium">{isLive ? 'Ends in:' : 'Starts in:'}</span>
      {[
        { label: 'Hours', value: time.h },
        { label: 'Min', value: time.m },
        { label: 'Sec', value: time.s },
      ].map((unit, i) => (
        <span key={i} className="flex flex-col items-center">
          <span className="bg-gray-900 text-white font-mono font-bold text-lg w-12 h-12 rounded-xl flex items-center justify-center">{pad(unit.value)}</span>
          <span className="text-xs text-slate-400 mt-0.5">{unit.label}</span>
          {i < 2 && <span className="text-gray-500 font-bold text-xl absolute" style={{ marginLeft: '3.5rem' }}>:</span>}
        </span>
      ))}
    </div>
  );
}

export default function FlashSale() {
  const { data: liveData, isLoading: loadingLive } = useQuery({
    queryKey: ['flash-sale-live'],
    queryFn: () => flashSaleAPI.getLive().then(r => r.data),
    refetchInterval: 30000,
  });

  const { data: upcomingData } = useQuery({
    queryKey: ['flash-sale-upcoming'],
    queryFn: () => flashSaleAPI.getUpcoming().then(r => r.data),
  });

  const sale = liveData?.sale;
  const upcoming = upcomingData?.sale;

  const products = sale?.items
    ?.filter(item => item.product)
    ?.map(item => ({
      ...item.product,
      pricing: { ...item.product?.pricing, sale: item.salePrice },
      _flashSaleStock: item.stockLimit ? item.stockLimit - item.soldCount : null,
    })) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/" className="btn-ghost p-2 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-md">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Flash Sale</h1>
            <p className="text-slate-500 text-sm">Limited time deals. Don't miss out!</p>
          </div>
        </div>
      </div>

      {loadingLive ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)}
        </div>
      ) : sale ? (
        <>
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 mb-8 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold mb-1">{sale.title}</h2>
                {sale.description && <p className="text-red-100 text-sm">{sale.description}</p>}
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur rounded-xl px-4 py-3">
                <Countdown endsAt={sale.endsAt} startsAt={sale.startsAt} isLive />
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product, i) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="relative">
                  <ProductCard product={product} />
                  {product._flashSaleStock !== null && product._flashSaleStock <= 10 && (
                    <div className="absolute bottom-20 inset-x-3">
                      <div className="bg-white rounded-lg p-1.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-500">Sold</span>
                          <span className="text-xs font-semibold text-orange-500">{product._flashSaleStock} left</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all"
                            style={{ width: `${Math.max(10, 100 - (product._flashSaleStock / (product._flashSaleStock + (sale.items?.find(i => i.product?._id === product._id)?.soldCount || 0))) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : upcoming ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-10 h-10 text-orange-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Next Flash Sale: {upcoming.title}</h2>
          <p className="text-slate-500 mb-6">Get ready! The next flash sale starts soon.</p>
          <div className="flex items-center justify-center gap-3 mb-6">
            <Countdown endsAt={upcoming.endsAt} startsAt={upcoming.startsAt} isLive={false} />
          </div>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Active Flash Sale</h2>
          <p className="text-slate-500 mb-6">Check back soon for amazing deals!</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      )}
    </div>
  );
}
