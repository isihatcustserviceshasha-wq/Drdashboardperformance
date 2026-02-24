import React from 'react';
import { PatientOutcome, OutcomeStatus } from './types';
import { Edit2, Trash2, Phone, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface OutcomeTableProps {
  outcomes: PatientOutcome[];
  onEdit: (outcome: PatientOutcome) => void;
  onDelete: (id: string) => void;
}

export const OutcomeTable: React.FC<OutcomeTableProps> = ({ outcomes, onEdit, onDelete }) => {
  const getStatusStyles = (status: OutcomeStatus) => {
    switch (status) {
      case OutcomeStatus.SC:
        return 'bg-emerald-100 text-emerald-800';
      case OutcomeStatus.CO:
        return 'bg-blue-100 text-blue-800';
      case OutcomeStatus.NS:
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">All Patient Records</h2>
        <span className="text-xs font-medium text-slate-400">{outcomes.length} total records</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Doctor</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {outcomes.map((outcome) => (
              <tr key={outcome.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900">{outcome.patientName}</span>
                    {outcome.contactNumber && (
                      <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {outcome.contactNumber}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-600 flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" /> {format(new Date(outcome.date), 'MMM d, yyyy')}
                    </span>
                    <span className="text-xs text-clinic-teal font-medium mt-0.5">{outcome.doctor}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(outcome.status)}`}>
                    {outcome.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {outcome.notes ? (
                    <div className="group relative">
                      <span className="text-xs text-slate-500 line-clamp-1 max-w-[200px]">{outcome.notes}</span>
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 bg-slate-800 text-white text-[10px] p-2 rounded shadow-xl w-48">
                        {outcome.notes}
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-300 italic text-xs">No notes</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => onEdit(outcome)}
                      className="p-1.5 text-clinic-blue hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Record"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        console.log('Delete button clicked for outcome:', outcome.id);
                        // Temporarily removing confirm to see if it's the blocker
                        onDelete(outcome.id);
                      }}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {outcomes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                  No records found matching the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
