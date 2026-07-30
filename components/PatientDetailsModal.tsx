import React, { useState, useMemo } from 'react';
import { PatientOutcome, OutcomeStatus } from '../types';
import { X, Calendar, User, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';

interface PatientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  outcomes: PatientOutcome[];
  status: OutcomeStatus | 'All';
}

export const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({
  isOpen,
  onClose,
  title,
  outcomes,
  status,
}) => {
  const [modalSortAsc, setModalSortAsc] = useState(true);

  if (!isOpen) return null;

  const filteredAndSortedOutcomes = useMemo(() => {
    const filtered = status === 'All' 
      ? outcomes 
      : status === ('Success' as any)
        ? outcomes.filter(o => o.status === OutcomeStatus.SC || o.status === OutcomeStatus.CC)
        : outcomes.filter(o => o.status === status);

    return [...filtered].sort((a, b) => {
      const comp = a.date.localeCompare(b.date);
      if (comp !== 0) return modalSortAsc ? comp : -comp;
      return modalSortAsc ? (a.createdAt - b.createdAt) : (b.createdAt - a.createdAt);
    });
  }, [outcomes, status, modalSortAsc]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500">{filteredAndSortedOutcomes.length} records found</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalSortAsc(!modalSortAsc)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs"
              title="Toggle date order"
            >
              <Calendar className="w-3.5 h-3.5 text-clinic-teal" />
              <span>{modalSortAsc ? 'Earliest ➔ Newest' : 'Newest ➔ Earliest'}</span>
              {modalSortAsc ? <ArrowUp className="w-3.5 h-3.5 text-clinic-teal" /> : <ArrowDown className="w-3.5 h-3.5 text-clinic-teal" />}
            </button>

            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {filteredAndSortedOutcomes.length === 0 ? (
            <div className="text-center py-12 text-slate-400 italic">
              No records found for this category.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedOutcomes.map((outcome) => (
                <div key={outcome.id} className="p-4 rounded-xl border border-slate-100 hover:border-clinic-teal/30 hover:bg-teal-50/30 transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 group-hover:text-clinic-teal transition-colors">
                      {outcome.patientName}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      outcome.status === OutcomeStatus.SC ? 'bg-emerald-100 text-emerald-800' :
                      outcome.status === OutcomeStatus.CO ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {outcome.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(outcome.date), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {outcome.doctor || 'Unassigned'}
                    </div>
                    {outcome.contactNumber && (
                      <div className="text-slate-400">
                        {outcome.contactNumber}
                      </div>
                    )}
                  </div>
                  {outcome.notes && (
                    <p className="mt-2 text-xs text-slate-600 italic line-clamp-2">
                      "{outcome.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
