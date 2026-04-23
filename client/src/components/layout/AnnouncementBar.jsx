import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Megaphone } from 'lucide-react';
import { settingsAPI } from '../../utils/api.js';

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);

  const { data } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => settingsAPI.get().then(r => r.data.settings),
    staleTime: 5 * 60 * 1000,
  });

  const ann = data?.announcement;
  if (!ann?.active || dismissed) return null;

  return (
    <div
      className="relative z-50 py-2 px-4 text-center text-white text-sm font-medium"
      style={{ backgroundColor: ann.bgColor || '#d97706' }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <Megaphone className="w-4 h-4 shrink-0" />
        <span>{ann.text || '🔥 Free delivery on orders over ৳999!'}</span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
