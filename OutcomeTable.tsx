import React from 'react';
import { PatientOutcome, OutcomeStatus } from '../types';
import { Edit2, Trash2, Phone, Calendar as CalendarIcon, FileText, CheckCircle2, PlusCircle, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';

interface OutcomeTableProps {
  outcomes: PatientOutcome[];
  onEdit: (outcome: PatientOutcome) => void;
  onDelete: (id: string) => void;
  onConvert: (outcome: PatientOutcome) => void;
  sortField?: 'date' | 'patientName' | 'status';
  sortDirection?: 'asc' | 'desc';
  onSortChange?: (field: 'date' | 'patientName' | 'status', direction?: 'asc' | 'desc') => void;
  selectedStatus?: string;
  onStatusChange?: (status: string) => void;
}

export const OutcomeTable: React.FC<OutcomeTableProps> = ({ 
  outcomes, 
  onEdit, 
  onDelete, 
  onConvert,
  sortField = 'date',
  sortDirection = 'asc',
  onSortChange,
  selectedStatus = 'All',
  onStatusChange,
}) => {
  const getStatusStyles = (status: OutcomeStatus) => {
    switch (status) {
      case OutcomeStatus.SC:
        return 'bg-emerald-100 text-emerald-800';
      case OutcomeStatus.CO:
        return 'bg-blue-100 text-blue-800';
      case OutcomeStatus.NS:
        return 'bg-slate-100 text-slate-800';
      case OutcomeStatus.CC:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const handleHeaderClick = (field: 'date' | 'patientName' | 'status') => {
    if (!onSortChange) return;
    if (sortField === field) {
      // Toggle direction
      onSortChange(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default asc for date, patientName, status
      onSortChange(field, 'asc');
    }
  };

  const renderSortIcon = (field: 'date' | 'patientName' | 'status') => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-clinic-teal" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-clinic-teal" />
    );
  };

  const statuses = [
    { label: 'All Statuses', value: 'All' },
    { label: 'Success', value: 'Success' },
    { label: 'Consult Only', value: 'Consult Only' },
    { label: 'No Show', value: 'No Show' },
    { label: 'Continue Case', value: 'Continue Case' },
  ];

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">All Patient Records</h2>
          <span className="text-xs font-medium text-slate-400">{outcomes.length} records listed</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Date Order Toggle Button */}
          {onSortChange && (
            <button
              onClick={() => {
                if (sortField === 'date') {
                  onSortChange('date', sortDirection === 'asc' ? 'desc' : 'asc');
                } else {
                  onSortChange('date', 'asc');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-200"
              title="Click to toggle Earliest to Newest or Newest to Earliest"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-clinic-teal" />
              <span>
                Date Order: {sortField === 'date' && sortDirection === 'asc' ? 'Earliest ➔ Newest (Asc)' : sortField === 'date' && sortDirection === 'desc' ? 'Newest ➔ Earliest (Desc)' : 'Earliest First'}
              </span>
              {sortField === 'date' && (sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-clinic-teal" /> : <ArrowDown className="w-3.5 h-3.5 text-clinic-teal" />)}
            </button>
          )}

          {/* Quick Status Filter Pills */}
          {onStatusChange && (
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs overflow-x-auto">
              {statuses.map((s) => (
                <button
                  key={s.value}
                  onClick={() => onStatusChange(s.value)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all whitespace-nowrap ${
                    selectedStatus === s.value
                      ? 'bg-white text-clinic-teal shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th 
                onClick={() => handleHeaderClick('patientName')}
                className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100/80 transition-colors group select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Patient</span>
                  {renderSortIcon('patientName')}
                </div>
              </th>
              <th 
                onClick={() => handleHeaderClick('date')}
                className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100/80 transition-colors group select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Date & Doctor</span>
                  {renderSortIcon('date')}
                  {sortField === 'date' && (
                    <span className="text-[10px] lowercase font-normal text-clinic-teal bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">
                      {sortDirection === 'asc' ? 'earliest ➔ newest' : 'newest ➔ earliest'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                onClick={() => handleHeaderClick('status')}
                className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center cursor-pointer hover:bg-slate-100/80 transition-colors group select-none"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Status</span>
                  {renderSortIcon('status')}
                </div>
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
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
                    <span className="text-xs text-clinic-teal font-medium mt-0.5">{outcome.doctor || <span className="text-slate-300 italic font-normal">Not assigned</span>}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(outcome.status)}`}>
                    {outcome.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {(outcome.status === OutcomeStatus.SC || outcome.status === OutcomeStatus.CC) && outcome.bracesType && (
                    <span className="text-xs font-medium text-clinic-teal bg-teal-50 px-2 py-1 rounded border border-teal-100">
                      {outcome.bracesType}
                    </span>
                  )}
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
                    {outcome.status === OutcomeStatus.CO && (
                      <button 
                        onClick={() => onConvert(outcome)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Convert to Success (Creates new record)"
                      >
                        <PlusCircle className="w-4 h-4" />
                      </button>
                    )}
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
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
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
