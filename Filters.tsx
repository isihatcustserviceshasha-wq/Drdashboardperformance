import React from 'react';
import { Doctor } from '../types';
import { Filter, Calendar, User } from 'lucide-react';

interface FiltersProps {
  startDate: string;
  endDate: string;
  selectedDoctor: string;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onDoctorChange: (val: string) => void;
  onReset: () => void;
  doctors: Doctor[];
}

export const Filters: React.FC<FiltersProps> = ({
  startDate,
  endDate,
  selectedDoctor,
  onStartDateChange,
  onEndDateChange,
  onDoctorChange,
  onReset,
  doctors,
}) => {
  return (
    <div className="glass-card p-4 flex flex-wrap items-center gap-6">
      <div className="flex items-center gap-2 text-slate-500">
        <Filter className="w-4 h-4" />
        <span className="text-sm font-semibold uppercase tracking-wider">Filters</span>
      </div>

        <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="text-sm px-2 py-1 bg-slate-50 border border-slate-200 rounded outline-none focus:border-clinic-teal focus:ring-1 focus:ring-clinic-teal/20"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="text-sm px-2 py-1 bg-slate-50 border border-slate-200 rounded outline-none focus:border-clinic-teal focus:ring-1 focus:ring-clinic-teal/20"
          />
        </div>

        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
          <User className="w-4 h-4 text-slate-400" />
          <select
            value={selectedDoctor}
            onChange={(e) => onDoctorChange(e.target.value)}
            className="text-sm px-2 py-1 bg-slate-50 border border-slate-200 rounded outline-none focus:border-clinic-teal focus:ring-1 focus:ring-clinic-teal/20"
          >
            <option value="All">All Doctors</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.name}>{doc.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={onReset}
          className="text-xs font-semibold text-clinic-gray hover:text-clinic-teal transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};
