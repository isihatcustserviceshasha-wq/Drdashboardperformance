import React, { useState, useEffect } from 'react';
import { OutcomeStatus, DoctorName, PatientOutcome, Doctor } from './types';
import { PlusCircle, Save, X } from 'lucide-react';

interface OutcomeFormProps {
  onAddOutcome: (outcome: Omit<PatientOutcome, 'id' | 'createdAt'>) => void;
  onUpdateOutcome?: (id: string, outcome: Partial<PatientOutcome>) => void;
  editingOutcome?: PatientOutcome | null;
  onCancelEdit?: () => void;
  doctors: Doctor[];
}

export const OutcomeForm: React.FC<OutcomeFormProps> = ({ 
  onAddOutcome, 
  onUpdateOutcome, 
  editingOutcome, 
  onCancelEdit,
  doctors 
}) => {
  const [patientName, setPatientName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [doctor, setDoctor] = useState<DoctorName>('');
  const [status, setStatus] = useState<OutcomeStatus>(OutcomeStatus.SC);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingOutcome) {
      setPatientName(editingOutcome.patientName);
      setContactNumber(editingOutcome.contactNumber || '');
      setDate(editingOutcome.date);
      setDoctor(editingOutcome.doctor);
      setStatus(editingOutcome.status);
      setNotes(editingOutcome.notes || '');
    } else {
      resetForm();
    }
  }, [editingOutcome]);

  useEffect(() => {
    if (!doctor && doctors.length > 0) {
      setDoctor(doctors[0].name);
    }
  }, [doctors]);

  const resetForm = () => {
    setPatientName('');
    setContactNumber('');
    setDate(new Date().toISOString().split('T')[0]);
    if (doctors.length > 0) setDoctor(doctors[0].name);
    setStatus(OutcomeStatus.SC);
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName) {
      alert('Please enter the patient name.');
      return;
    }
    if (!date) {
      alert('Please select a date.');
      return;
    }
    if (status !== OutcomeStatus.NS && !doctor) {
      alert('Please select a doctor. If no doctors are available, please add one in the Doctors tab.');
      return;
    }

    const outcomeData = {
      patientName,
      contactNumber,
      date,
      doctor: status === OutcomeStatus.NS ? undefined : doctor,
      status,
      notes,
    };

    if (editingOutcome && onUpdateOutcome) {
      onUpdateOutcome(editingOutcome.id, outcomeData);
    } else {
      onAddOutcome(outcomeData);
    }

    resetForm();
  };

  const activeDoctors = doctors.filter(d => d.isActive);

  return (
    <div className={`glass-card p-6 transition-all ${editingOutcome ? 'ring-2 ring-clinic-teal border-transparent shadow-lg' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          {editingOutcome ? (
            <><Save className="w-5 h-5 text-clinic-teal" /> Edit Record</>
          ) : (
            <><PlusCircle className="w-5 h-5 text-clinic-teal" /> Record New Outcome</>
          )}
        </h2>
        {editingOutcome && onCancelEdit && (
          <button 
            onClick={onCancelEdit}
            className="text-xs font-medium text-slate-400 hover:text-rose-500 flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Cancel Edit
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Patient Name</label>
          <input
            type="text"
            required
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-teal/20 focus:border-clinic-teal outline-none transition-all"
            placeholder="Enter name..."
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Contact No.</label>
          <input
            type="text"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-teal/20 focus:border-clinic-teal outline-none transition-all"
            placeholder="e.g. 012-3456789"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-teal/20 focus:border-clinic-teal outline-none transition-all"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Doctor {status === OutcomeStatus.NS && <span className="text-[10px] text-slate-400 normal-case font-normal">(Optional)</span>}
          </label>
          <select
            value={doctor}
            onChange={(e) => setDoctor(e.target.value)}
            disabled={status === OutcomeStatus.NS}
            className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-teal/20 focus:border-clinic-teal outline-none transition-all ${status === OutcomeStatus.NS ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <option value="">Select Doctor...</option>
            {activeDoctors.map((doc) => (
              <option key={doc.id} value={doc.name}>{doc.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OutcomeStatus)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-teal/20 focus:border-clinic-teal outline-none transition-all"
          >
            <option value={OutcomeStatus.SC}>Success</option>
            <option value={OutcomeStatus.CO}>Consult Only</option>
            <option value={OutcomeStatus.NS}>No Show</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={status !== OutcomeStatus.NS && activeDoctors.length === 0}
          className="bg-clinic-teal hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {editingOutcome ? 'Update Record' : 'Add Record'}
        </button>

        <div className="md:col-span-2 lg:col-span-6 space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={1}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinic-teal/20 focus:border-clinic-teal outline-none transition-all resize-none"
            placeholder="Add any additional details..."
          />
        </div>
      </form>
    </div>
  );
};
