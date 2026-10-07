import React from 'react';

const STATUS_STYLES = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200/80',
  APPROVED: 'bg-sky-50 text-sky-700 border-sky-200/80',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200/80',
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  INACTIVE: 'bg-slate-100 text-slate-600 border-slate-200',
  UPCOMING: 'bg-brand-50 text-brand-700 border-brand-200/80',
  CONFIRMED: 'bg-teal-50 text-teal-700 border-teal-200/80',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200/80',
};

export default function StatusBadge({ status, size = 'sm' }) {
  const normalizedStatus = (status || 'PENDING').toUpperCase();
  const style = STATUS_STYLES[normalizedStatus] || 'bg-slate-100 text-slate-700 border-slate-200';

  const sizeClasses = size === 'xs' 
    ? 'text-[10px] px-2 py-0.5' 
    : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${style} ${sizeClasses} tracking-wide`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {normalizedStatus}
    </span>
  );
}
