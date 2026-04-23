import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    toast.success('Welcome to OmniDeal newsletter!');
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-600/10 border border-brand-600/20 rounded-full px-4 py-1.5 mb-6">
          <span className="text-brand-600 text-sm font-medium">Newsletter</span>
        </div>
        <h2 className="section-title mb-4">Get Exclusive Deals</h2>
        <p className="text-slate-400 mb-8">Subscribe for special offers, new arrivals, and style inspiration delivered to your inbox.</p>

        {submitted ? (
          <div className="glass rounded-2xl p-8">
            <p className="text-gray-800 font-medium text-lg mb-1">You're on the list!</p>
            <p className="text-slate-500 text-sm mt-1">Expect amazing deals in your inbox soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="input-field flex-1"
            />
            <button type="submit" className="btn-primary shrink-0">
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
