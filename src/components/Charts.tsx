import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { DoctorPerformance, OutcomeStatus } from '../types';

interface ChartsProps {
  performanceData: DoctorPerformance[];
  overallStatusData: { name: string; value: number }[];
  monthlyTrendData: { month: string; sc: number; co: number; ns: number }[];
}

const COLORS = {
  SC: '#00A9A5', // clinic-teal
  CO: '#2B78B7', // clinic-blue
  NS: '#4D4D4D', // clinic-gray
};

export const Charts: React.FC<ChartsProps> = ({ performanceData, overallStatusData, monthlyTrendData }) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 h-[400px]">
          <h3 className="text-md font-semibold text-slate-800 mb-4">Success vs Consult Only per Doctor</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="doctor" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" />
              <Bar dataKey="sc" name="Success" fill={COLORS.SC} radius={[4, 4, 0, 0]} />
              <Bar dataKey="co" name="Consult Only" fill={COLORS.CO} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6 h-[400px] flex flex-col">
          <h3 className="text-md font-semibold text-slate-800 mb-4">Overall Distribution</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overallStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {overallStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % 3]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 h-[400px]">
        <h3 className="text-md font-semibold text-slate-800 mb-4">Annual Monthly Trend ({new Date().getFullYear()})</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyTrendData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="top" align="right" iconType="circle" />
            <Bar dataKey="sc" name="Success" fill={COLORS.SC} radius={[4, 4, 0, 0]} />
            <Bar dataKey="co" name="Consult Only" fill={COLORS.CO} radius={[4, 4, 0, 0]} />
            <Bar dataKey="ns" name="No Show" fill={COLORS.NS} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="glass-card p-6 h-[400px]">
        <h3 className="text-md font-semibold text-slate-800 mb-4">Monthly Success Trend</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyTrendData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="top" align="right" iconType="circle" />
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
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
