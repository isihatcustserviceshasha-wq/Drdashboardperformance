import React from 'react';
import { PatientOutcome, BracesType, OutcomeStatus } from '../types';
import { PieChart, Activity } from 'lucide-react';

interface BracesSummaryProps {
  outcomes: PatientOutcome[];
}

export const BracesSummary: React.FC<BracesSummaryProps> = ({ outcomes }) => {
  const successOutcomes = outcomes.filter(o => o.status === OutcomeStatus.SC);
  
  const bracesCounts = Object.values(BracesType).reduce((acc, type) => {
    acc[type] = successOutcomes.filter(o => o.bracesType === type).length;
    return acc;
  }, {} as Record<string, number>);

  const pendingCount = successOutcomes.filter(o => !o.bracesType).length;
  const totalSuccess = successOutcomes.length;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-clinic-teal" />
          Braces Selection Summary
        </h2>
        <div className="bg-clinic-teal/10 text-clinic-teal px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Total Success: {totalSuccess}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(BracesType).map((type) => {
          const count = bracesCounts[type] || 0;
          const percentage = totalSuccess > 0 ? Math.round((count / totalSuccess) * 100) : 0;
          
          return (
            <div key={type} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-clinic-teal/30 transition-all group">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-clinic-teal transition-colors">
                  {type}
                </span>
                <span className="text-lg font-bold text-slate-800">{count}</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-clinic-teal h-full transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex justify-end mt-1">
                <span className="text-[10px] font-medium text-slate-400">{percentage}% of total success</span>
              </div>
            </div>
          );
        })}

        {pendingCount > 0 && (
          <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 hover:border-rose-300 transition-all group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                Pending Selection
              </span>
              <span className="text-lg font-bold text-rose-800">{pendingCount}</span>
            </div>
            <div className="w-full bg-rose-200 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-rose-500 h-full transition-all duration-500 ease-out"
                style={{ width: `${Math.round((pendingCount / totalSuccess) * 100)}%` }}
              />
            </div>
            <div className="flex justify-end mt-1">
              <span className="text-[10px] font-medium text-rose-400">Needs braces type update</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
