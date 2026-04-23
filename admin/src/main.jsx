import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 2 * 60 * 1000, retry: 1 } },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1a1a26', color: '#f1f5f9', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '12px' },
          success: { iconTheme: { primary: '#a855f7', secondary: '#f1f5f9' } },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);
