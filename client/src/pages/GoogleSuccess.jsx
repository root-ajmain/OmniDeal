import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function GoogleSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const setAuth = useAuthStore(s => s.setAuth);

  useEffect(() => {
    const token = params.get('token');
    if (!token) { navigate('/login'); return; }

    axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setAuth(res.data.user, token);
        toast.success(`Welcome, ${res.data.user.name}!`);
        navigate('/account');
      })
      .catch(() => {
        toast.error('Google login failed');
        navigate('/login');
      });
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500">Completing sign in...</p>
      </div>
    </div>
  );
}
