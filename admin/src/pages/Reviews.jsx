import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Check, X, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { reviewsAPI } from '../utils/api.js';
import { formatDate } from '../utils/helpers.js';
import BackButton from '../components/ui/BackButton.jsx';

export default function Reviews() {
  const [status, setStatus] = useState('pending');
  const qc = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-reviews', status],
    queryFn: () => reviewsAPI.getAll({ status }).then(r => r.data),
    retry: 1,
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }) => reviewsAPI.updateStatus(id, { status }),
    onSuccess: () => { toast.success('Review updated'); qc.invalidateQueries({ queryKey: ['admin-reviews'] }); },
    onError: () => toast.error('Update failed'),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="text-xl font-display font-bold text-gray-900">Reviews</h1>
      </div>

      <div className="flex gap-2">
        {['pending', 'approved', 'rejected'].map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2 rounded-xl text-sm capitalize border transition-all ${s === status ? 'bg-brand-600/20 text-brand-600 border-brand-600/30' : 'text-slate-400 border-gray-200 hover:border-gray-200'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {isError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Failed to load reviews</p>
            <p className="text-xs text-red-400 mt-0.5">{error?.response?.data?.message || error?.message || 'Check server connection and admin auth'}</p>
          </div>
          <button onClick={refetch} className="btn-secondary text-xs gap-1.5 shrink-0">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-gray-50 rounded-xl animate-pulse" />)
          : data?.reviews?.map(review => (
              <div key={review._id} className="card p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-brand rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(review.customer?.name || review.guestName || 'A')[0]}
                      </div>
                      <div>
                        <p className="text-gray-700 text-sm font-medium">{review.customer?.name || review.guestName || 'Guest'}</p>
                        <p className="text-slate-500 text-xs">{formatDate(review.createdAt)}</p>
                      </div>
                      <div className="flex ml-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-gold-500 fill-gold-500' : 'text-slate-600'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-500 text-xs mb-1">
                      Product: <span className="text-slate-400">{review.product?.name}</span>
                    </p>
                    {review.title && <p className="text-gray-700 text-sm font-medium mb-1">{review.title}</p>}
                    <p className="text-slate-400 text-sm">{review.comment}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {status !== 'approved' && (
                      <button
                        onClick={() => updateStatus({ id: review._id, status: 'approved' })}
                        className="w-8 h-8 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg flex items-center justify-center hover:bg-emerald-500/20 transition-colors"
                        title="Approve"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {status !== 'rejected' && (
                      <button
                        onClick={() => updateStatus({ id: review._id, status: 'rejected' })}
                        className="w-8 h-8 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg flex items-center justify-center hover:bg-red-500/20 transition-colors"
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
        }
        {!isLoading && !isError && !data?.reviews?.length && (
          <div className="text-center py-10 text-slate-500">No {status} reviews</div>
        )}
      </div>
    </div>
  );
}
