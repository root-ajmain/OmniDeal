import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { authAPI } from '../utils/api.js';
import useAdminAuthStore from '../store/adminAuthStore.js';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { setAuth } = useAdminAuthStore();
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => authAPI.login(data),
    onSuccess: (res) => {
      const { user, token } = res.data;
      if (!['admin', 'manager'].includes(user.role)) {
        return toast.error('Admin access required');
      }
      setAuth(user, token);
      toast.success('Welcome back!');
      navigate('/');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Login failed'),
  });

  const handleSubmit = (e) => { e.preventDefault(); mutate(form); };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-yellow-200/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-brand">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Admin Login</h1>
          <p className="text-slate-400 text-sm mt-1">OmniDeal Control Panel</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-card space-y-5">
          <div className="flex items-center gap-2 p-3 bg-brand-600/10 rounded-xl border border-brand-600/20 mb-2">
            <Shield className="w-4 h-4 text-brand-600 shrink-0" />
            <p className="text-brand-600 text-xs">Secure admin access only</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-400 text-sm mb-1.5 block">Email</label>
              <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="text-slate-400 text-sm mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="input-field pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-gray-700">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isPending} className="w-full btn-primary py-3">
              {isPending ? 'Signing in...' : 'Sign In to Admin'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
