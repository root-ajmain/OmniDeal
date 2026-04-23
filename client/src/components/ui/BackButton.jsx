import { useNavigate } from 'react-router-dom';

export default function BackButton({ label = 'Back', className = '' }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className={`inline-flex items-center gap-1 text-slate-400 hover:text-gray-900 transition-colors text-sm ${className}`}
    >
      <span>←</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}
