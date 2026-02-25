import React from 'react';
import { Doctor } from '../types';
import { Filter, Calendar, User, Search } from 'lucide-react';

interface FiltersProps {
  startDate: string;
  endDate: string;
  selectedDoctor: string;
  patientSearch: string;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onDoctorChange: (val: string) => void;
  onPatientSearchChange: (val: string) => void;
  onReset: () => void;
  doctors: Doctor[];
}

export const Filters: React.FC<FiltersProps> = ({
  startDate,
  endDate,
  selectedDoctor,
  patientSearch,
  onStartDateChange,
  onEndDateChange,
  onDoctorChange,
  onPatientSearchChange,
  onReset,
  doctors,
}) => {
  return (
    <div className="glass-card p-4 flex flex-wrap items-center gap-4 sm:gap-6">
      <div className="flex items-center gap-2 text-slate-500 mr-2">
        <Filter className="w-4 h-4" />
        <span className="text-sm font-semibold uppercase tracking-wider">Filters</span>
      </div>

      <div className="flex items-center gap-4 flex-wrap flex-1 min-w-[300px]">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="text-sm px-2 py-1 bg-slate-50 border border-slate-200 rounded outline-none focus:border-clinic-teal focus:ring-1 focus:ring-clinic-teal/20 w-32 sm:w-auto"
          />
          <span className="text-slate-400 text-xs">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="text-sm px-2 py-1 bg-slate-50 border border-slate-200 rounded outline-none focus:border-clinic-teal focus:ring-1 focus:ring-clinic-teal/20 w-32 sm:w-auto"
          />
        </div>

        <div className="flex items-center gap-2 sm:border-l sm:border-slate-200 sm:pl-4">
          <User className="w-4 h-4 text-slate-400" />
          <select
            value={selectedDoctor}
            onChange={(e) => onDoctorChange(e.target.value)}
            className="text-sm px-2 py-1 bg-slate-50 border border-slate-200 rounded outline-none focus:border-clinic-teal focus:ring-1 focus:ring-clinic-teal/20 min-w-[120px]"
          >
            <option value="All">All Doctors</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.name}>{doc.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 sm:border-l sm:border-slate-200 sm:pl-4 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient name..."
            value={patientSearch}
            onChange={(e) => onPatientSearchChange(e.target.value)}
            className="text-sm px-2 py-1 bg-slate-50 border border-slate-200 rounded outline-none focus:border-clinic-teal focus:ring-1 focus:ring-clinic-teal/20 w-full"
          />
        </div>
      </div>

      <button
        onClick={onReset}
        className="text-xs font-semibold text-clinic-gray hover:text-clinic-teal transition-colors ml-auto sm:ml-0"
      >
        Reset Filters
      </button>
    </div>
  );
};
