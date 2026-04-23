import { useState } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RotateCcw, Eye, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { returnsAPI } from '../utils/api.js';
import { formatDate, formatPrice } from '../utils/helpers.js';
import BackButton from '../components/ui/BackButton.jsx';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-600',
  refunded: 'bg-emerald-100 text-emerald-700',
  exchanged: 'bg-purple-100 text-purple-700',
};

const STATUSES = ['pending', 'approved', 'rejected', 'refunded', 'exchanged'];

export default function Returns() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-returns', filter],
    queryFn: () => returnsAPI.getAll({ status: filter || undefined }).then(r => r.data),
    placeholderData: keepPreviousData,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => returnsAPI.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-returns'] });
      toast.success('Return updated!');
      setSelected(null);
    },
    onError: () => toast.error('Update failed'),
  });

  const handleUpdate = () => {
    if (!newStatus) return toast.error('Select a status');
    updateMutation.mutate({
      id: selected._id,
      data: {
        status: newStatus,
        adminNote,
        refundAmount: refundAmount ? Number(refundAmount) : undefined,
      },
    });
  };

  const openDetail = (ret) => {
    setSelected(ret);
    setNewStatus(ret.status);
    setAdminNote(ret.adminNote || '');
    setRefundAmount(ret.refundAmount || '');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Returns & Refunds</h1>
            <p className="text-slate-400 text-sm">Manage customer return requests</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-slate-500 text-sm">Filter:</label>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand-500">
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Return #', 'Order #', 'Customer', 'Reason', 'Status', 'Date', 'Action'].map(h => (
                  <th key={h} className="text-left text-slate-500 font-medium px-4 py-3 text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.returns?.map(ret => (
                <tr key={ret._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-brand-600 font-semibold">{ret.returnNumber}</td>
                  <td className="px-4 py-3 text-gray-700 text-xs">{ret.orderNumber}</td>
                  <td className="px-4 py-3">
                    <p className="text-gray-800 text-xs font-medium">{ret.customer?.name}</p>
                    <p className="text-slate-400 text-xs">{ret.customer?.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs max-w-[140px] truncate">{ret.reason}</td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${STATUS_COLORS[ret.status]}`}>{ret.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(ret.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => openDetail(ret)} className="btn-ghost p-1.5 text-blue-500">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!data?.returns?.length && (
                <tr><td colSpan={7} className="px-4 py-16 text-center text-slate-400">No return requests found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="font-semibold text-gray-800">Return Request</h2>
                <p className="text-slate-400 text-sm font-mono">{selected.returnNumber}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-slate-400 text-xs">Order</p>
                  <p className="font-semibold text-gray-800">{selected.orderNumber}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-slate-400 text-xs">Customer</p>
                  <p className="font-semibold text-gray-800">{selected.customer?.name}</p>
                  <p className="text-slate-500 text-xs">{selected.customer?.phone}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                  <p className="text-slate-400 text-xs">Reason</p>
                  <p className="font-medium text-gray-800">{selected.reason}</p>
                  {selected.description && <p className="text-slate-500 text-xs mt-1">{selected.description}</p>}
                </div>
                {selected.refundMethod && (
                  <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                    <p className="text-slate-400 text-xs">Refund Method</p>
                    <p className="font-medium text-gray-800 capitalize">{selected.refundMethod} — {selected.refundAccount}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3 border-t border-gray-100 pt-4">
                <h3 className="font-semibold text-gray-800 text-sm">Update Status</h3>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="input-field">
                  {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
                {['refunded', 'approved'].includes(newStatus) && (
                  <div>
                    <label className="text-slate-500 text-sm mb-1.5 block">Refund Amount (৳)</label>
                    <input type="number" value={refundAmount} onChange={e => setRefundAmount(e.target.value)} className="input-field" placeholder="Enter amount" />
                  </div>
                )}
                <div>
                  <label className="text-slate-500 text-sm mb-1.5 block">Admin Note</label>
                  <textarea rows={2} value={adminNote} onChange={e => setAdminNote(e.target.value)} className="input-field resize-none" placeholder="Note for customer..." />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setSelected(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleUpdate} disabled={updateMutation.isPending} className="btn-primary flex-1">
                {updateMutation.isPending ? 'Saving...' : 'Update Return'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
