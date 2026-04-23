import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-amber-50 border-t border-amber-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-brand rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">O</span>
              </div>
              <span className="font-display font-bold text-xl gradient-text">OmniDeal</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your premium destination for electronics, fashion, home goods & more. Quality products, unbeatable prices.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Facebook, name: 'Facebook', href: '#' },
                { icon: Instagram, name: 'Instagram', href: '#' },
                { icon: Twitter, name: 'Twitter', href: '#' },
                { icon: Youtube, name: 'YouTube', href: '#' },
              ].map(({ icon: Icon, name, href }) => (
                <a key={name} href={href} aria-label={name} className="w-9 h-9 glass rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-700 transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'All Products' },
                { to: '/track-order', label: 'Track Order' },
                { to: '/wishlist', label: 'Wishlist' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-slate-400 hover:text-brand-700 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Categories</h4>
            <ul className="space-y-2">
              {[
                { to: '/category/electronics', label: 'Electronics' },
                { to: '/category/fashion', label: 'Fashion' },
                { to: '/category/home-living', label: 'Home & Living' },
                { to: '/category/sports', label: 'Sports' },
                { to: '/category/beauty', label: 'Beauty' },
                { to: '/category/books', label: 'Books' },
              ].map(cat => (
                <li key={cat.to}>
                  <Link to={cat.to} className="text-slate-400 hover:text-brand-700 text-sm transition-colors">
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="text-slate-400 text-sm">support@omnideal.com</li>
              <li className="text-slate-400 text-sm">+880 1700-000000</li>
              <li className="text-slate-400 text-sm">Dhaka, Bangladesh</li>
            </ul>

            <div className="mt-6 p-4 glass rounded-xl">
              <p className="text-gray-700 text-sm font-medium mb-1">Free Delivery</p>
              <p className="text-slate-500 text-xs">On orders above ৳999</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} OmniDeal. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {['Privacy Policy', 'Terms of Service', 'Return Policy'].map(item => (
              <a key={item} href="#" className="text-slate-500 hover:text-gray-700 text-xs transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
