import React from 'react';

export const BookCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-3 animate-pulse shadow-xs">
      <div className="w-full h-52 bg-slate-200 rounded-xl" />
      <div className="h-4 bg-slate-200 rounded-md w-3/4" />
      <div className="h-3 bg-slate-100 rounded-md w-1/2" />
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
        <div className="h-4 bg-slate-200 rounded-md w-16" />
        <div className="h-7 bg-slate-200 rounded-lg w-20" />
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-12 bg-slate-100/80 border-b border-slate-200/80" />
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="h-4 bg-slate-200 rounded-md w-1/4" />
            <div className="h-4 bg-slate-100 rounded-md w-1/3" />
            <div className="h-4 bg-slate-200 rounded-md w-1/6" />
            <div className="h-7 bg-slate-100 rounded-lg w-24" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const StatsCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 animate-pulse shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 bg-slate-200 rounded-md w-28" />
        <div className="w-10 h-10 bg-slate-100 rounded-xl" />
      </div>
      <div className="h-8 bg-slate-200 rounded-md w-16 mb-2" />
      <div className="h-3 bg-slate-100 rounded-md w-36" />
    </div>
  );
};
