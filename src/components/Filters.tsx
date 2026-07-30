import React, { useMemo } from 'react';
import { Doctor } from '../types';
import { Filter, Calendar, User, Search, Activity, ArrowUpDown } from 'lucide-react';

interface FiltersProps {
  startDate: string;
  endDate: string;
  selectedDoctor: string;
  selectedStatus: string;
  selectedYear: number;
  patientSearch: string;
  sortField?: 'date' | 'patientName' | 'status';
  sortDirection?: 'asc' | 'desc';
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onDoctorChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onYearChange: (val: number) => void;
  onPatientSearchChange: (val: string) => void;
  onSortChange?: (field: 'date' | 'patientName' | 'status', direction: 'asc' | 'desc') => void;
  onReset: () => void;
  doctors: Doctor[];
}

export const Filters: React.FC<FiltersProps> = ({
  startDate,
  endDate,
  selectedDoctor,
  selectedStatus,
  selectedYear,
  patientSearch,
  sortField = 'date',
  sortDirection = 'asc',
  onStartDateChange,
  onEndDateChange,
  onDoctorChange,
  onStatusChange,
  onYearChange,
  onPatientSearchChange,
  onSortChange,
  onReset,
  doctors,
}) => {
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 2024;
    const yearsArr = [];
    for (let y = currentYear; y >= startYear; y--) {
      yearsArr.push(y);
    }
    return yearsArr;
  }, []);

  return (
    <div className="glass-card p-4 flex flex-wrap items-center gap-4 sm:gap-6">
      <div className="flex items-center gap-2 text-slate-500 mr-2">
        <Filter className="w-4 h-4" />
        <span className="text-sm font-semibold uppercase tracking-wider">Filters</span>
      </div>

      <div className="flex items-center gap-4 flex-wrap flex-1 min-w-[300px]">
        {/* Year Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-slate-400 font-bold leading-none mb-1">Year</span>
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(parseInt(e.target.value))}
              className="text-sm px-2 py-1 bg-slate-50 border border-slate-200 rounded outline-none focus:border-clinic-teal focus:ring-1 focus:ring-clinic-teal/20 min-w-[80px]"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 sm:border-l sm:border-slate-200 sm:pl-4">
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
            <span className="text-[10px] uppercase text-slate-400 font-bold leading-none mb-1">Status Filter</span>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="text-sm px-2 py-1 bg-slate-50 border border-slate-200 rounded outline-none focus:border-clinic-teal focus:ring-1 focus:ring-clinic-teal/20 min-w-[130px] font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Success">Success</option>
              <option value="Consult Only">Consult Only</option>
              <option value="No Show">No Show</option>
              <option value="Continue Case">Continue Case</option>
            </select>
          </div>
        </div>

        {/* Date Order / Sorting Filter */}
        {onSortChange && (
          <div className="flex items-center gap-2 sm:border-l sm:border-slate-200 sm:pl-4">
            <ArrowUpDown className="w-4 h-4 text-clinic-teal" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-clinic-teal font-bold leading-none mb-1">Sort Records</span>
              <select
                value={`${sortField}-${sortDirection}`}
                onChange={(e) => {
                  const [field, dir] = e.target.value.split('-') as ['date' | 'patientName' | 'status', 'asc' | 'desc'];
                  onSortChange(field, dir);
                }}
                className="text-sm px-2 py-1 bg-teal-50/50 border border-teal-200 rounded outline-none focus:border-clinic-teal focus:ring-1 focus:ring-clinic-teal/20 min-w-[160px] font-semibold text-slate-800"
              >
                <option value="date-asc">Date: Earliest ➔ Newest (Ascending)</option>
                <option value="date-desc">Date: Newest ➔ Earliest (Descending)</option>
                <option value="status-asc">Status (Success ➔ CO ➔ NS)</option>
                <option value="patientName-asc">Patient Name (A ➔ Z)</option>
              </select>
            </div>
          </div>
        )}

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
