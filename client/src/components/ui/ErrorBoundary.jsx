import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-slate-500 mb-6">An unexpected error occurred. Please try refreshing the page.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => window.location.reload()} className="btn-primary px-6">Refresh Page</button>
              <Link to="/" className="btn-secondary px-6">Go Home</Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
