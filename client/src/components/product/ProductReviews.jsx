import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { reviewsAPI } from '../../utils/api.js';
import { formatDate } from '../../utils/helpers.js';

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => i + 1).map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star className={`w-6 h-6 transition-colors ${star <= (hover || value) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  );
}

export default function ProductReviews({ productId, avgRating, reviewCount }) {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewsAPI.getByProduct(productId).then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: (d) => reviewsAPI.create(productId, d),
    onSuccess: () => {
      toast.success('Review submitted for approval!');
      setShowForm(false);
      setComment('');
      setRating(5);
      qc.invalidateQueries(['reviews', productId]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Error submitting review'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return toast.error('Please write a comment');
    mutation.mutate({ rating, comment, guestName: guestName || undefined });
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-6 p-6 glass rounded-2xl">
        <div className="text-center">
          <div className="text-5xl font-bold text-brand-600">{avgRating || 0}</div>
          <StarRating value={Math.round(avgRating || 0)} />
          <p className="text-slate-500 text-sm mt-1">{reviewCount || 0} reviews</p>
        </div>
        <div className="flex-1 border-l border-gray-200 pl-6">
          <p className="text-slate-400 text-sm">Based on verified purchases</p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary mt-4 py-2 text-sm"
          >
            Write a Review
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="card p-6 space-y-4"
        >
          <h3 className="font-semibold text-gray-800">Your Review</h3>
          <div>
            <label className="text-slate-400 text-sm mb-2 block">Rating</label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <input
            value={guestName}
            onChange={e => setGuestName(e.target.value)}
            placeholder="Your name"
            required
            className="input-field"
          />
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows={4}
            required
            className="input-field resize-none"
          />
          <div className="flex gap-3">
            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending ? 'Submitting...' : 'Submit Review'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse space-y-3">
              <div className="h-4 bg-gray-50 rounded w-1/4" />
              <div className="h-3 bg-gray-50 rounded w-3/4" />
              <div className="h-3 bg-gray-50 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {data?.reviews?.map((review, i) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-brand rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {(review.customer?.name || review.guestName || 'A')[0]}
                  </div>
                  <div>
                    <p className="text-gray-800 text-sm font-medium">
                      {review.customer?.name || review.guestName || 'Anonymous'}
                    </p>
                    <p className="text-slate-500 text-xs">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                  ))}
                </div>
              </div>
              {review.title && <p className="font-medium text-gray-800 mb-1">{review.title}</p>}
              <p className="text-slate-400 text-sm leading-relaxed">{review.comment}</p>
              {review.verifiedPurchase && (
                <span className="inline-block mt-2 badge bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Verified Purchase</span>
              )}
            </motion.div>
          ))}
          {!data?.reviews?.length && (
            <div className="text-center py-10 text-slate-500">
              No reviews yet. Be the first to review!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
