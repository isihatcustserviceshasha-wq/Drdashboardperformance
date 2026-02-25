import React, { useState } from 'react';
import { Doctor } from '../types';
import { UserPlus, Edit2, Trash2, Check, X, UserCheck, UserMinus } from 'lucide-react';

interface DoctorManagementProps {
  doctors: Doctor[];
  onCreateDoctor: (name: string) => void;
  onUpdateDoctor: (id: string, updates: Partial<Doctor>) => void;
  onDeleteDoctor: (id: string) => void;
}

export const DoctorManagement: React.FC<DoctorManagementProps> = ({
  doctors,
  onCreateDoctor,
  onUpdateDoctor,
  onDeleteDoctor,
}) => {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateDoctor(newName.trim());
    setNewName('');
  };

  const startEditing = (doctor: Doctor) => {
    setEditingId(doctor.id);
    setEditName(doctor.name);
  };

  const handleUpdate = () => {
    if (!editingId || !editName.trim()) return;
    onUpdateDoctor(editingId, { name: editName.trim() });
    setEditingId(null);
  };

  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-clinic-teal" />
          Add New Doctor
        </h2>
        <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[300px] space-y-1">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Doctor Name</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-teal/20 focus:border-clinic-teal outline-none transition-all"
              placeholder="e.g. Dr. John Doe"
            />
          </div>
          <button
            type="submit"
            className="bg-clinic-teal hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-sm"
          >
            Add Doctor
          </button>
        </form>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-800">Manage Doctors</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-clinic-teal/20 focus:border-clinic-teal outline-none transition-all w-full sm:w-64"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDoctors.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    {editingId === doc.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-2 py-1 border border-clinic-teal rounded outline-none"
                      />
                    ) : (
                      <span className={`font-medium ${doc.isActive ? 'text-slate-900' : 'text-slate-400'}`}>{doc.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onUpdateDoctor(doc.id, { isActive: !doc.isActive })}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        doc.isActive ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                      }`}
                    >
                      {doc.isActive ? (
                        <><UserCheck className="w-3 h-3" /> Active</>
                      ) : (
                        <><UserMinus className="w-3 h-3" /> Inactive</>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === doc.id ? (
                        <>
                          <button 
                            type="button"
                            onClick={handleUpdate} 
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => setEditingId(null)} 
                            className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : deletingId === doc.id ? (
                        <div className="flex items-center gap-2 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100 animate-in fade-in zoom-in duration-200">
                          <span className="text-[10px] font-bold text-rose-600 uppercase">Confirm?</span>
                          <button 
                            type="button"
                            onClick={() => {
                              onDeleteDoctor(doc.id);
                              setDeletingId(null);
                            }}
                            className="p-1 text-rose-600 hover:bg-rose-100 rounded transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => setDeletingId(null)}
                            className="p-1 text-slate-400 hover:bg-rose-100 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button 
                            type="button"
                            onClick={() => startEditing(doc)} 
                            className="p-1.5 text-clinic-blue hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => setDeletingId(doc.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Doctor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDoctors.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">
                    {searchTerm ? 'No doctors match your search.' : 'No doctors registered. Add your first doctor above.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
