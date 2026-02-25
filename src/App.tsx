import React, { useState, useEffect, useMemo } from 'react';
import { 
  PatientOutcome, 
  OutcomeStatus, 
  DoctorPerformance, 
  Doctor,
  DoctorName 
} from './types';
import { StatsCards } from './components/StatsCards';
import { Charts } from './components/Charts';
import { PerformanceTable } from './components/PerformanceTable';
import { OutcomeForm } from './components/OutcomeForm';
import { Filters } from './components/Filters';
import { FollowUpList } from './components/FollowUpList';
import { NoShowList } from './components/NoShowList';
import { 
  LayoutDashboard, 
  Database, 
  RefreshCw, 
  Users, 
  Settings, 
  Table as TableIcon,
  PlusCircle,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './services/supabase';
import { TemplateLibrary } from './components/TemplateLibrary';
import { Logo } from './components/Logo';
import { DoctorManagement } from './components/DoctorManagement';
import { OutcomeTable } from './components/OutcomeTable';
import { SuccessModal } from './components/SuccessModal';

type View = 'dashboard' | 'records' | 'doctors' | 'templates';

export default function App() {
  const [outcomes, setOutcomes] = useState<PatientOutcome[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [editingOutcome, setEditingOutcome] = useState<PatientOutcome | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  
  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successTitle, setSuccessTitle] = useState('Success!');
  
  // Filters
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDoctor, setSelectedDoctor] = useState('All');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [outcomesRes, doctorsRes] = await Promise.all([
        supabase.from('patient_outcomes').select('*').order('created_at', { ascending: false }),
        supabase.from('doctors').select('*').order('name')
      ]);

      if (outcomesRes.error) {
        console.error('Error fetching outcomes:', outcomesRes.error);
        alert(`Failed to fetch patient records: ${outcomesRes.error.message}. Please ensure the "patient_outcomes" table exists.`);
      }

      if (doctorsRes.error) {
        console.error('Error fetching doctors:', doctorsRes.error);
        alert(`Failed to fetch doctors: ${doctorsRes.error.message}. Please ensure the "doctors" table exists.`);
      }

      if (outcomesRes.data) {
        const mappedOutcomes: PatientOutcome[] = outcomesRes.data.map((item: any) => ({
          id: item.id,
          patientName: item.patient_name,
          contactNumber: item.contact_number,
          date: item.date,
          doctor: item.doctor,
          status: item.status as OutcomeStatus,
          notes: item.notes,
          createdAt: new Date(item.created_at).getTime(),
        }));
        setOutcomes(mappedOutcomes);
      }

      if (doctorsRes.data) {
        const mappedDoctors: Doctor[] = doctorsRes.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          isActive: item.is_active,
          createdAt: new Date(item.created_at).getTime(),
        }));
        setDoctors(mappedDoctors);
      } else {
        // Fallback if table doesn't exist or is empty
        setDoctors([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Outcome CRUD
  const handleAddOutcome = async (newOutcome: Omit<PatientOutcome, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('patient_outcomes')
        .insert([{ 
          patient_name: newOutcome.patientName,
          contact_number: newOutcome.contactNumber,
          date: newOutcome.date,
          doctor: newOutcome.doctor,
          status: newOutcome.status,
          notes: newOutcome.notes
        }])
        .select();

      if (error) throw error;
      if (data && data[0]) {
        const item = data[0];
        const mappedItem: PatientOutcome = {
          id: item.id,
          patientName: item.patient_name,
          contactNumber: item.contact_number,
          date: item.date,
          doctor: item.doctor,
          status: item.status as OutcomeStatus,
          notes: item.notes,
          createdAt: new Date(item.created_at).getTime(),
        };
        setOutcomes(prev => [mappedItem, ...prev]);
        
        // Show success modal
        setSuccessTitle(newOutcome.status === OutcomeStatus.SC ? 'Great News!' : 'Record Saved');
        setSuccessMessage(
          newOutcome.status === OutcomeStatus.SC 
            ? `Successfully recorded a successful case for ${newOutcome.patientName}!` 
            : `Patient record for ${newOutcome.patientName} has been saved.`
        );
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      console.error('Error adding outcome:', error);
      alert(`Failed to add record: ${error.message || 'Unknown error'}`);
    }
  };

  const handleUpdateOutcome = async (id: string, updates: Partial<PatientOutcome>) => {
    try {
      const dbUpdates: any = {};
      if (updates.patientName) dbUpdates.patient_name = updates.patientName;
      if (updates.contactNumber !== undefined) dbUpdates.contact_number = updates.contactNumber;
      if (updates.date) dbUpdates.date = updates.date;
      if (updates.doctor) dbUpdates.doctor = updates.doctor;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      const { data, error } = await supabase
        .from('patient_outcomes')
        .update(dbUpdates)
        .eq('id', id)
        .select();

      if (error) throw error;
      if (data && data[0]) {
        const item = data[0];
        const mappedItem: PatientOutcome = {
          id: item.id,
          patientName: item.patient_name,
          contactNumber: item.contact_number,
          date: item.date,
          doctor: item.doctor,
          status: item.status as OutcomeStatus,
          notes: item.notes,
          createdAt: new Date(item.created_at).getTime(),
        };
        setOutcomes(prev => prev.map(o => o.id === id ? mappedItem : o));
        setEditingOutcome(null);

        // Show success modal
        setSuccessTitle('Record Updated');
        setSuccessMessage(`Changes to ${mappedItem.patientName}'s record have been saved.`);
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      console.error('Error updating outcome:', error);
      alert(`Failed to update record: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteOutcome = async (id: string) => {
    console.log('handleDeleteOutcome initiated for id:', id);
    try {
      const { error } = await supabase
        .from('patient_outcomes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }
      
      console.log('Delete successful in Supabase, updating local state');
      setOutcomes(prev => prev.filter(o => o.id !== id));
      
      // Show success modal for deletion too
      setSuccessTitle('Record Deleted');
      setSuccessMessage('The patient record has been successfully removed.');
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error deleting outcome:', error);
      alert(`Failed to delete record: ${error.message || 'Unknown error'}`);
    }
  };

  // Doctor CRUD
  const handleCreateDoctor = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .insert([{ name, is_active: true }])
        .select();

      if (error) throw error;
      if (data && data[0]) {
        const item = data[0];
        const mappedItem: Doctor = {
          id: item.id,
          name: item.name,
          isActive: item.is_active,
          createdAt: new Date(item.created_at).getTime(),
        };
        setDoctors(prev => [...prev, mappedItem]);
        
        setSuccessTitle('Doctor Added');
        setSuccessMessage(`${mappedItem.name} has been added to the clinic staff.`);
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      console.error('Error creating doctor:', error);
      alert(`Failed to save doctor: ${error.message || 'Unknown error'}. Please ensure the "doctors" table exists in your Supabase project.`);
    }
  };

  const handleUpdateDoctor = async (id: string, updates: Partial<Doctor>) => {
    try {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

      const { data, error } = await supabase
        .from('doctors')
        .update(dbUpdates)
        .eq('id', id)
        .select();

      if (error) throw error;
      if (data && data[0]) {
        const item = data[0];
        const mappedItem: Doctor = {
          id: item.id,
          name: item.name,
          isActive: item.is_active,
          createdAt: new Date(item.created_at).getTime(),
        };
        setDoctors(prev => prev.map(d => d.id === id ? mappedItem : d));
        
        setSuccessTitle('Doctor Updated');
        setSuccessMessage(`Information for ${mappedItem.name} has been updated.`);
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      console.error('Error updating doctor:', error);
      alert(`Failed to update doctor: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    console.log('handleDeleteDoctor initiated for id:', id);
    try {
      const { error } = await supabase
        .from('doctors')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase delete error (doctors):', error);
        throw error;
      }
      
      console.log('Doctor delete successful in Supabase, updating local state');
      setDoctors(prev => prev.filter(d => d.id !== id));
      
      setSuccessTitle('Doctor Removed');
      setSuccessMessage('The doctor has been successfully removed from the system.');
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error deleting doctor:', error);
      alert(`Failed to delete doctor: ${error.message || 'Unknown error'}`);
    }
  };

  const filteredOutcomes = useMemo(() => {
    return outcomes.filter((outcome) => {
      const dateMatch = (!startDate || outcome.date >= startDate) && (!endDate || outcome.date <= endDate);
      const doctorMatch = selectedDoctor === 'All' || outcome.doctor === selectedDoctor;
      return dateMatch && doctorMatch;
    });
  }, [outcomes, startDate, endDate, selectedDoctor]);

  const performanceData = useMemo(() => {
    const activeDoctorNames = doctors.filter(d => d.isActive).map(d => d.name);
    const doctorsWithRecords = Array.from(new Set(outcomes.map(o => o.doctor).filter(Boolean))) as string[];
    const allRelevantDoctors = Array.from(new Set([...activeDoctorNames, ...doctorsWithRecords]));

    return allRelevantDoctors.map((docName) => {
      const docOutcomes = filteredOutcomes.filter((o) => o.doctor === docName);
      const sc = docOutcomes.filter((o) => o.status === OutcomeStatus.SC).length;
      const co = docOutcomes.filter((o) => o.status === OutcomeStatus.CO).length;
      const ns = docOutcomes.filter((o) => o.status === OutcomeStatus.NS).length;
      const total = docOutcomes.length;
      const conversionRate = (sc + co) > 0 ? (sc / (sc + co)) * 100 : 0;

      return {
        doctor: docName,
        sc,
        co,
        ns,
        total,
        conversionRate,
      };
    }).sort((a, b) => b.conversionRate - a.conversionRate);
  }, [filteredOutcomes, doctors, outcomes]);

  const stats = useMemo(() => {
    const total = filteredOutcomes.length;
    const sc = filteredOutcomes.filter((o) => o.status === OutcomeStatus.SC).length;
    const co = filteredOutcomes.filter((o) => o.status === OutcomeStatus.CO).length;
    const ns = filteredOutcomes.filter((o) => o.status === OutcomeStatus.NS).length;
    return { total, sc, co, ns };
  }, [filteredOutcomes]);

  const overallStatusData = useMemo(() => [
    { name: 'Success', value: stats.sc },
    { name: 'Consult Only', value: stats.co },
    { name: 'No Show', value: stats.ns },
  ], [stats]);

  const monthlyTrendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      const monthOutcomes = filteredOutcomes.filter(o => {
        const date = new Date(o.date);
        return date.getMonth() === index && date.getFullYear() === currentYear;
      });

      return {
        month,
        sc: monthOutcomes.filter(o => o.status === OutcomeStatus.SC).length,
        co: monthOutcomes.filter(o => o.status === OutcomeStatus.CO).length,
        ns: monthOutcomes.filter(o => o.status === OutcomeStatus.NS).length,
      };
    });
  }, [filteredOutcomes]);

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedDoctor('All');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
          </div>
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'dashboard' ? 'bg-white text-clinic-teal shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>
            <button 
              onClick={() => setCurrentView('records')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'records' ? 'bg-white text-clinic-teal shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <TableIcon className="w-4 h-4" /> Records
            </button>
            <button 
              onClick={() => setCurrentView('doctors')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'doctors' ? 'bg-white text-clinic-teal shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users className="w-4 h-4" /> Doctors
            </button>
          </nav>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsLibraryOpen(true)}
              className="text-xs font-semibold text-clinic-gray hover:text-clinic-teal flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-50"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Templates
            </button>
            <button 
              onClick={fetchData}
              className="p-2 text-slate-400 hover:text-clinic-teal transition-colors"
              title="Sync Data"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-2" />
            <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-clinic-teal/10 flex items-center justify-center text-clinic-teal font-bold text-sm">
                S
              </div>
              <span className="text-sm font-semibold text-slate-700">Staff Portal</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Performance Dashboard</h1>
                  <p className="text-slate-500">Track and analyze clinic outcomes</p>
                </div>
              </div>

              <OutcomeForm 
                onAddOutcome={handleAddOutcome} 
                onUpdateOutcome={handleUpdateOutcome}
                editingOutcome={editingOutcome}
                onCancelEdit={() => setEditingOutcome(null)}
                doctors={doctors}
              />

              <Filters 
                startDate={startDate}
                endDate={endDate}
                selectedDoctor={selectedDoctor}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onDoctorChange={setSelectedDoctor}
                onReset={handleResetFilters}
                doctors={doctors}
              />

              <StatsCards {...stats} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <Charts 
                    performanceData={performanceData} 
                    overallStatusData={overallStatusData} 
                    monthlyTrendData={monthlyTrendData}
                  />
                  <PerformanceTable data={performanceData} />
                </div>
                <div className="space-y-8">
                  <FollowUpList outcomes={filteredOutcomes} />
                  <NoShowList outcomes={filteredOutcomes} />
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'records' && (
            <motion.div
              key="records"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Patient Records</h1>
                  <p className="text-slate-500">Manage all recorded outcomes</p>
                </div>
                <button 
                  onClick={() => {
                    setCurrentView('dashboard');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 bg-clinic-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" /> Add New Record
                </button>
              </div>

              <Filters 
                startDate={startDate}
                endDate={endDate}
                selectedDoctor={selectedDoctor}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onDoctorChange={setSelectedDoctor}
                onReset={handleResetFilters}
                doctors={doctors}
              />

              <OutcomeTable 
                outcomes={filteredOutcomes}
                onEdit={(outcome) => {
                  setEditingOutcome(outcome);
                  setCurrentView('dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onDelete={handleDeleteOutcome}
              />
            </motion.div>
          )}

          {currentView === 'doctors' && (
            <motion.div
              key="doctors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Doctor Management</h1>
                <p className="text-slate-500">Add, edit, or deactivate clinic doctors</p>
              </div>
              <DoctorManagement 
                doctors={doctors}
                onCreateDoctor={handleCreateDoctor}
                onUpdateDoctor={handleUpdateDoctor}
                onDeleteDoctor={handleDeleteDoctor}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <TemplateLibrary isOpen={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} />
      
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)}
        title={successTitle}
        message={successMessage}
      />
    </div>
  );
}
