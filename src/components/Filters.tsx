import React from 'react';
import { Doctor } from '../types';
import { Filter, Calendar, User, Search, Activity } from 'lucide-react';

interface FiltersProps {
  startDate: string;
  endDate: string;
  selectedDoctor: string;
  selectedStatus: string;
  patientSearch: string;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onDoctorChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onPatientSearchChange: (val: string) => void;
  onReset: () => void;
  doctors: Doctor[];
}

export const Filters: React.FC<FiltersProps> = ({
  startDate,
  endDate,
  selectedDoctor,
  selectedStatus,
  patientSearch,
  onStartDateChange,
  onEndDateChange,
  onDoctorChange,
  onStatusChange,
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
        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-slate-400 font-bold leading-none mb-1">Date Range</span>
            <div className="flex items-center gap-1">
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
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 sm:border-l sm:border-slate-200 sm:pl-4">
          <Activity className="w-4 h-4 text-slate-400" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-slate-400 font-bold leading-none mb-1">Status</span>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="text-sm px-2 py-1 bg-slate-50 border border-slate-200 rounded outline-none focus:border-clinic-teal focus:ring-1 focus:ring-clinic-teal/20 min-w-[120px]"
            >
              <option value="All">All Statuses</option>
              <option value="Success">Success</option>
              <option value="Consult Only">Consult Only</option>
              <option value="No Show">No Show</option>
            </select>
          </div>
        </div>

        {/* Doctor Filter */}
        <div className="flex items-center gap-2 sm:border-l sm:border-slate-200 sm:pl-4">
          <User className="w-4 h-4 text-slate-400" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-slate-400 font-bold leading-none mb-1">Doctor</span>
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
        </div>

        {/* Search Filter */}
        <div className="flex items-center gap-2 sm:border-l sm:border-slate-200 sm:pl-4 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400" />
          <div className="flex flex-col w-full">
            <span className="text-[10px] uppercase text-slate-400 font-bold leading-none mb-1">Patient Search</span>
            <input
              type="text"
              placeholder="Search patient name..."
              value={patientSearch}
              onChange={(e) => onPatientSearchChange(e.target.value)}
              className="text-sm px-2 py-1 bg-slate-50 border border-slate-200 rounded outline-none focus:border-clinic-teal focus:ring-1 focus:ring-clinic-teal/20 w-full"
            />
          </div>
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
