import { Truck, Shield, RotateCcw, Clock, Star, CreditCard, Gift, Package, ShieldCheck, Tag } from 'lucide-react';

const ITEMS = [
  { icon: Truck,       text: 'Free Delivery on ৳999+',        color: 'bg-white/20' },
  { icon: Shield,      text: '100% Secure Checkout',           color: 'bg-white/20' },
  { icon: Clock,       text: '24h Fast Shipping',              color: 'bg-white/20' },
  { icon: RotateCcw,   text: '7-Day Easy Returns',            color: 'bg-white/20' },
  { icon: Star,        text: '50K+ Happy Customers',           color: 'bg-white/20' },
  { icon: CreditCard,  text: 'bKash · Nagad · COD',           color: 'bg-white/20' },
  { icon: Gift,        text: 'Exclusive Member Deals',         color: 'bg-white/20' },
  { icon: Package,     text: '10,000+ Products',               color: 'bg-white/20' },
  { icon: ShieldCheck, text: 'Buyer Protection Guarantee',     color: 'bg-white/20' },
  { icon: Tag,         text: 'Best Price Promise',             color: 'bg-white/20' },
];

const TRACK = [...ITEMS, ...ITEMS];

export default function TrustBadges() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 py-3 select-none">
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-amber-500 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-amber-500 to-transparent z-10 pointer-events-none" />

      <div className="flex whitespace-nowrap" style={{ animation: 'marquee 32s linear infinite' }}>
        {TRACK.map(({ icon: Icon, text }, i) => (
          <span key={i} className="inline-flex items-center gap-2.5 px-6 text-white font-semibold text-sm">
            <span className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center shrink-0">
              <Icon className="w-3.5 h-3.5 text-white" />
            </span>
            {text}
            <span className="mx-1 opacity-30 text-lg">|</span>
          </span>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
