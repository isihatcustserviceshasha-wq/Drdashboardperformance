import React, { useMemo, useState } from 'react';
import { PatientOutcome, OutcomeStatus, Doctor } from '../types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { format } from 'date-fns';
import { User, TrendingUp, Award, Calendar } from 'lucide-react';

interface AnnualPerformanceProps {
  outcomes: PatientOutcome[];
  doctors: Doctor[];
  selectedYear: number;
  onYearChange: (year: number) => void;
}

const COLORS = {
  SC: '#00A9A5',
  CO: '#2B78B7',
  NS: '#4D4D4D',
};

export const AnnualPerformance: React.FC<AnnualPerformanceProps> = ({ outcomes, doctors, selectedYear, onYearChange }) => {
  const [selectedDoctor, setSelectedDoctor] = useState<string>('All');

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 2024;
    const yearsArr = [];
    for (let y = currentYear; y >= startYear; y--) {
      yearsArr.push(y);
    }
    return yearsArr;
  }, []);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const annualData = useMemo(() => {
    return months.map((month, index) => {
      const monthOutcomes = outcomes.filter(o => {
        const date = new Date(o.date);
        const matchesYear = date.getFullYear() === selectedYear;
        const matchesMonth = date.getMonth() === index;
        const matchesDoctor = selectedDoctor === 'All' || o.doctor === selectedDoctor;
        return matchesYear && matchesMonth && matchesDoctor;
      });

      const sc = monthOutcomes.filter(o => o.status === OutcomeStatus.SC).length;
      const co = monthOutcomes.filter(o => o.status === OutcomeStatus.CO).length;
      const ns = monthOutcomes.filter(o => o.status === OutcomeStatus.NS).length;
      const total = monthOutcomes.length;
      const conversionRate = (sc + co) > 0 ? (sc / (sc + co)) * 100 : 0;

      return {
        month,
        sc,
        co,
        ns,
        total,
        conversionRate: parseFloat(conversionRate.toFixed(1))
      };
    });
  }, [outcomes, selectedYear, selectedDoctor]);

  const doctorStats = useMemo(() => {
    const stats = doctors.map(doc => {
      const docOutcomes = outcomes.filter(o => {
        const date = new Date(o.date);
        return date.getFullYear() === selectedYear && o.doctor === doc.name;
      });

      const sc = docOutcomes.filter(o => o.status === OutcomeStatus.SC).length;
      const co = docOutcomes.filter(o => o.status === OutcomeStatus.CO).length;
      const total = docOutcomes.length;
      const conversionRate = (sc + co) > 0 ? (sc / (sc + co)) * 100 : 0;

      return {
        name: doc.name,
        sc,
        co,
        total,
        conversionRate
      };
    }).sort((a, b) => b.conversionRate - a.conversionRate);

    return stats;
  }, [outcomes, doctors, selectedYear]);

  const topDoctor = doctorStats[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-clinic-teal/10 flex items-center justify-center text-clinic-teal">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Selected Year</p>
            <p className="text-xl font-bold text-slate-800">{selectedYear}</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-clinic-blue/10 flex items-center justify-center text-clinic-blue">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Annual Avg Conversion</p>
            <p className="text-xl font-bold text-slate-800">
              {(annualData.reduce((acc, curr) => acc + curr.conversionRate, 0) / 12).toFixed(1)}%
            </p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Performer ({selectedYear})</p>
            <p className="text-xl font-bold text-slate-800">{topDoctor?.name || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Annual Performance Trend</h3>
            <p className="text-sm text-slate-500">Monthly breakdown of outcomes for {selectedYear}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <select
                value={selectedYear}
                onChange={(e) => onYearChange(parseInt(e.target.value))}
                className="text-sm px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-clinic-teal focus:ring-1 focus:ring-clinic-teal/20 min-w-[100px]"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="text-sm px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-clinic-teal focus:ring-1 focus:ring-clinic-teal/20 min-w-[160px]"
              >
                <option value="All">All Doctors</option>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.name}>{doc.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={annualData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
              <Line 
                type="monotone" 
                dataKey="sc" 
                name="Success" 
                stroke={COLORS.SC} 
                strokeWidth={3} 
                dot={{ r: 4, fill: COLORS.SC, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line 
                type="monotone" 
                dataKey="co" 
                name="Consult Only" 
                stroke={COLORS.CO} 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={{ r: 3, fill: COLORS.CO }}
              />
              <Line 
                type="monotone" 
                dataKey="conversionRate" 
                name="Conv. Rate %" 
                stroke="#F59E0B" 
                strokeWidth={2}
                yAxisId="right"
              />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#F59E0B' }} unit="%" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Doctor Annual Ranking</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">Doctor</th>
                  <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase text-center">SC</th>
                  <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase text-center">CO</th>
                  <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase text-center">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doctorStats.map((doc, idx) => (
                  <tr key={doc.name} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-300 w-4">{idx + 1}</span>
                        <span className="text-sm font-medium text-slate-700">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-emerald-600 font-bold">{doc.sc}</td>
                    <td className="px-4 py-3 text-center text-sm text-clinic-blue font-bold">{doc.co}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                        {doc.conversionRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-bold text-slate-800 mb-4">Monthly Conversion Rate</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={annualData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} unit="%" />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none' }}
                />
                <Bar dataKey="conversionRate" name="Conversion Rate" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
