import { Link } from 'react-router-dom';
import BackButton from '../components/ui/BackButton.jsx';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl font-display font-bold gradient-text mb-4">404</p>
      <h1 className="text-2xl font-bold text-gray-800 mb-3">Page Not Found</h1>
      <p className="text-slate-400 mb-8">The page you're looking for doesn't exist or was moved.</p>
      <div className="flex gap-4">
        <Link to="/" className="btn-primary">Go Home</Link>
        <BackButton />
      </div>
    </div>
  );
}
