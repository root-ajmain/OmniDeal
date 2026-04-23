import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductImageGallery({ images = [] }) {
  const sortedImages = [...images].sort((a, b) => {
    if (a.isFeatured) return -1;
    if (b.isFeatured) return 1;
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });

  const [activeIdx, setActiveIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const active = sortedImages[activeIdx];
  const prev = () => setActiveIdx(i => (i - 1 + sortedImages.length) % sortedImages.length);
  const next = () => setActiveIdx(i => (i + 1) % sortedImages.length);

  if (!sortedImages.length) {
    return (
      <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
        <p className="text-slate-500">No images</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main image */}
        <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden group">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeIdx}
              src={active?.url}
              alt="Product"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>

          {/* Zoom button */}
          <button
            onClick={() => setLightbox(true)}
            className="absolute top-3 right-3 glass rounded-lg px-2 py-1 text-xs text-gray-700 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Zoom
          </button>

          {/* Nav arrows */}
          {sortedImages.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 glass rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-gray-700 hover:text-gray-900 text-xl leading-none">
                ‹
              </button>
              <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 glass rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-gray-700 hover:text-gray-900 text-xl leading-none">
                ›
              </button>
            </>
          )}

          {/* Featured badge */}
          {active?.isFeatured && (
            <div className="absolute top-3 left-3">
              <span className="badge bg-brand-600/20 text-brand-600 border border-brand-600/30">Featured</span>
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {sortedImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {sortedImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === activeIdx ? 'border-brand-500 scale-105' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Dot indicators */}
        {sortedImages.length > 1 && (
          <div className="flex justify-center gap-1.5">
            {sortedImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`rounded-full transition-all ${i === activeIdx ? 'w-5 h-1.5 bg-brand-500' : 'w-1.5 h-1.5 bg-gray-200'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={active?.url}
              alt="Product"
              className="max-w-full max-h-full object-contain rounded-xl"
              onClick={e => e.stopPropagation()}
            />
            <button onClick={() => setLightbox(false)} className="absolute top-4 right-4 text-white text-2xl leading-none">✕</button>
            {sortedImages.length > 1 && (
              <>
                <button onClick={e => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 glass rounded-xl flex items-center justify-center text-white text-2xl leading-none">
                  ‹
                </button>
                <button onClick={e => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 glass rounded-xl flex items-center justify-center text-white text-2xl leading-none">
                  ›
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
