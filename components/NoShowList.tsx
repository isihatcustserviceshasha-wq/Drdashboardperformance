import React, { useState } from 'react';
import { PatientOutcome, OutcomeStatus } from '../types';
import { format } from 'date-fns';
import { UserX, MessageSquare } from 'lucide-react';
import { TemplateLibrary } from './TemplateLibrary';

interface NoShowListProps {
  outcomes: PatientOutcome[];
}

export const NoShowList: React.FC<NoShowListProps> = ({ outcomes }) => {
  const [selectedPatient, setSelectedPatient] = useState<PatientOutcome | undefined>();
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const nsCases = outcomes
    .filter(o => o.status === OutcomeStatus.NS)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleFollowUp = (patient: PatientOutcome) => {
    setSelectedPatient(patient);
    setIsLibraryOpen(true);
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <UserX className="w-5 h-5 text-rose-500" />
          No Show Follow-up List
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium bg-rose-100 text-rose-800 px-2 py-1 rounded-full">
            {nsCases.length} Pending
          </span>
        </div>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {nsCases.length === 0 ? (
          <div className="p-8 text-center text-slate-400 italic">
            No "No Show" cases found.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {nsCases.map((outcome) => (
                <tr key={outcome.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{outcome.patientName}</td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{outcome.contactNumber || '-'}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {format(new Date(outcome.date), 'dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleFollowUp(outcome)}
                      className="text-xs font-medium bg-clinic-teal/10 text-clinic-teal px-3 py-1 rounded-lg hover:bg-clinic-teal hover:text-white transition-all flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      Follow up
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <TemplateLibrary 
        isOpen={isLibraryOpen} 
        onClose={() => {
          setIsLibraryOpen(false);
          setSelectedPatient(undefined);
        }}
        selectedPatient={selectedPatient}
      />
    </div>
  );
};
