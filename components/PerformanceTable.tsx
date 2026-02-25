import React from 'react';
import { DoctorPerformance } from '../types';

interface PerformanceTableProps {
  data: DoctorPerformance[];
}

export const PerformanceTable: React.FC<PerformanceTableProps> = ({ data }) => {
  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 border-bottom border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800">Doctor Performance</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-y border-slate-100">
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Success</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Consult Only</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">No Show</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Total</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Conversion %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={row.doctor} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{row.doctor}</td>
                <td className="px-6 py-4 text-center text-clinic-teal font-medium">{row.sc}</td>
                <td className="px-6 py-4 text-center text-clinic-blue font-medium">{row.co}</td>
                <td className="px-6 py-4 text-center text-clinic-gray font-medium">{row.ns}</td>
                <td className="px-6 py-4 text-center text-slate-600">{row.total}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    row.conversionRate >= 70 ? 'bg-teal-100 text-teal-800' :
                    row.conversionRate >= 40 ? 'bg-blue-100 text-blue-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {row.conversionRate.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
