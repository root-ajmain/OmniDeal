import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Hero from '../components/home/Hero.jsx';
import CategoryGrid from '../components/home/CategoryGrid.jsx';
import FeaturedProducts from '../components/home/FeaturedProducts.jsx';
import DealOfTheDay from '../components/home/DealOfTheDay.jsx';
import Newsletter from '../components/home/Newsletter.jsx';
import FlashSaleSection from '../components/home/FlashSaleSection.jsx';
import TrustBadges from '../components/home/TrustBadges.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import { productsAPI } from '../utils/api.js';

export default function Home() {
  const { data: newArrivals, isLoading: loadingNew } = useQuery({
    queryKey: ['products', 'new-arrivals'],
    queryFn: () => productsAPI.getNewArrivals().then(r => r.data.products),
  });

  const { data: bestSellers, isLoading: loadingBest } = useQuery({
    queryKey: ['products', 'best-sellers'],
    queryFn: () => productsAPI.getBestSellers().then(r => r.data.products),
  });

  return (
    <>
      <Hero />
      <TrustBadges />
      <CategoryGrid />
      <FlashSaleSection />
      <FeaturedProducts />

      {/* New Arrivals */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="section-title mb-2">New Arrivals</h2>
            <div className="w-16 h-1 bg-gradient-brand rounded-full" />
          </div>
          <Link to="/products?sort=newest" className="flex items-center gap-1 text-brand-600 hover:text-brand-500 text-sm font-medium">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <ProductGrid products={newArrivals} isLoading={loadingNew} />
      </section>

      <DealOfTheDay />

      {/* Best Sellers */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="section-title mb-2">Best Sellers</h2>
            <div className="w-16 h-1 bg-gradient-brand rounded-full" />
          </div>
          <Link to="/products?sort=popular" className="flex items-center gap-1 text-brand-600 hover:text-brand-500 text-sm font-medium">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <ProductGrid products={bestSellers} isLoading={loadingBest} />
      </section>

      <Newsletter />
    </>
  );
}
