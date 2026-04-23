import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ title, value, subtitle, change, changeLabel, icon: Icon, iconBg, iconColor }) {
  const isPositive = change >= 0;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        {Icon && (
          <div className={`w-11 h-11 ${iconBg || 'bg-slate-100'} rounded-xl flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${iconColor || 'text-slate-500'}`} />
          </div>
        )}
        {change !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {(subtitle || changeLabel) && (
        <p className="text-slate-400 text-xs mt-1">{subtitle || changeLabel}</p>
      )}
    </div>
  );
}
