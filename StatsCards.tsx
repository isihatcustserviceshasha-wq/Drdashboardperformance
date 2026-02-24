import React from 'react';
import { Users, CheckCircle2, ClipboardList, UserX } from 'lucide-react';

interface StatsCardsProps {
  total: number;
  sc: number;
  co: number;
  ns: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ total, sc, co, ns }) => {
  const stats = [
    { label: 'Total Cases', value: total, icon: Users, color: 'text-clinic-blue', bg: 'bg-blue-50' },
    { label: 'Total Success', value: sc, icon: CheckCircle2, color: 'text-clinic-teal', bg: 'bg-teal-50' },
    { label: 'Total Consult Only', value: co, icon: ClipboardList, color: 'text-clinic-blue', bg: 'bg-blue-50' },
    { label: 'Total No Show', value: ns, icon: UserX, color: 'text-clinic-gray', bg: 'bg-slate-100' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="glass-card p-6 flex items-center gap-4">
          <div className={`${stat.bg} p-3 rounded-xl`}>
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
