import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { returnsAPI } from '../utils/api.js';

const REASONS = [
  'Wrong product received',
  'Product damaged / defective',
  'Product not as described',
  'Changed my mind',
  'Quality not as expected',
  'Other',
];

export default function ReturnRequest() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    orderNumber: '',
    reason: '',
    description: '',
    refundMethod: 'bkash',
    refundAccount: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.reason) return toast.error('Please select a return reason');
    setLoading(true);
    try {
      const res = await returnsAPI.create(form);
      setResult(res.data);
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit return request');
    } finally {
      setLoading(false);
    }
  };

  if (step === 3 && result) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-4" />
        </motion.div>
        <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Return Request Submitted!</h2>
        <p className="text-slate-500 mb-2">Your return number:</p>
        <div className="bg-gray-100 rounded-xl px-6 py-3 inline-block mb-6">
          <span className="font-mono font-bold text-gray-800 text-lg">{result.returnNumber}</span>
        </div>
        <p className="text-slate-500 text-sm mb-8">We'll review your request within 24 hours and contact you via phone/email.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-secondary">Back to Home</Link>
          <Link to="/account" className="btn-primary">My Account</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/account" className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Return / Refund Request</h1>
          <p className="text-slate-500 text-sm">7-day return policy applies for delivered orders</p>
        </div>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-slate-600 text-sm mb-1.5 block font-medium">Order Number *</label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                required
                value={form.orderNumber}
                onChange={e => set('orderNumber', e.target.value.toUpperCase())}
                className="input-field pl-10"
                placeholder="e.g. ORD-00001"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-600 text-sm mb-1.5 block font-medium">Return Reason *</label>
            <div className="grid sm:grid-cols-2 gap-2">
              {REASONS.map(reason => (
                <label key={reason} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all text-sm ${form.reason === reason ? 'border-brand-500 bg-amber-50 text-brand-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
                  <input type="radio" name="reason" value={reason} checked={form.reason === reason} onChange={() => set('reason', reason)} className="sr-only" />
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${form.reason === reason ? 'border-brand-500' : 'border-gray-300'}`}>
                    {form.reason === reason && <div className="w-2 h-2 rounded-full bg-brand-500" />}
                  </div>
                  {reason}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-600 text-sm mb-1.5 block font-medium">Additional Details</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className="input-field resize-none"
              placeholder="Describe the issue in detail..."
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-600 text-sm mb-1.5 block font-medium">Refund Method</label>
              <select value={form.refundMethod} onChange={e => set('refundMethod', e.target.value)} className="input-field">
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="bank">Bank Transfer</option>
                <option value="store_credit">Store Credit</option>
              </select>
            </div>
            <div>
              <label className="text-slate-600 text-sm mb-1.5 block font-medium">Refund Account Number</label>
              <input
                value={form.refundAccount}
                onChange={e => set('refundAccount', e.target.value)}
                className="input-field"
                placeholder="01XXXXXXXXX or account no."
              />
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
            <strong>Note:</strong> Returns are only accepted within 7 days of delivery. The product must be unused and in original packaging.
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary py-3">
            {loading ? 'Submitting...' : 'Submit Return Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
