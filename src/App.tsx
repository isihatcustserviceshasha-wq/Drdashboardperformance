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
  MessageSquare,
  BarChart3,
  Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './services/supabase';
import { format } from 'date-fns';
import { TemplateLibrary } from './components/TemplateLibrary';
import { Logo } from './components/Logo';
import { DoctorManagement } from './components/DoctorManagement';
import { OutcomeTable } from './components/OutcomeTable';
import { SuccessModal } from './components/SuccessModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { PatientDetailsModal } from './components/PatientDetailsModal';
import { AnnualPerformance } from './components/AnnualPerformance';
import { BracesSummary } from './components/BracesSummary';

type View = 'dashboard' | 'records' | 'doctors' | 'templates' | 'performance';

const DEFAULT_DOCTORS: Doctor[] = [
  { id: 'doc-1', name: 'Dr. Low', isActive: true, createdAt: Date.now() - 86400000 * 30 },
  { id: 'doc-2', name: 'Dr. Tan', isActive: true, createdAt: Date.now() - 86400000 * 20 },
  { id: 'doc-3', name: 'Dr. Sarah', isActive: true, createdAt: Date.now() - 86400000 * 10 },
];

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
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);

  // Confirmation Modal State
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationDetails, setConfirmationDetails] = useState({ title: '', message: '' });
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);

  // Details Modal State
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsTitle, setDetailsTitle] = useState('');
  const [detailsStatus, setDetailsStatus] = useState<OutcomeStatus | 'All'>('All');
  
  // Filters & Sorting
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDoctor, setSelectedDoctor] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [patientSearch, setPatientSearch] = useState('');
  const [sortField, setSortField] = useState<'date' | 'patientName' | 'status'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    let loadedOutcomes: PatientOutcome[] = [];
    let loadedDoctors: Doctor[] = [];

    // Check Local Storage first for initial cache/fallback
    try {
      const storedOutcomes = localStorage.getItem('tlow_patient_outcomes');
      if (storedOutcomes) loadedOutcomes = JSON.parse(storedOutcomes);

      const storedDoctors = localStorage.getItem('tlow_doctors');
      if (storedDoctors) loadedDoctors = JSON.parse(storedDoctors);
    } catch (e) {
      console.warn('Could not read from localStorage:', e);
    }

    if (loadedDoctors.length === 0) {
      loadedDoctors = DEFAULT_DOCTORS;
    }

    try {
      const [outcomesRes, doctorsRes] = await Promise.all([
        supabase.from('patient_outcomes').select('*').order('created_at', { ascending: false }),
        supabase.from('doctors').select('*').order('name')
      ]);

      if (outcomesRes.error) {
        console.warn('Supabase outcomes fetch notice:', outcomesRes.error.message);
      } else if (outcomesRes.data && outcomesRes.data.length > 0) {
        loadedOutcomes = outcomesRes.data.map((item: any) => ({
          id: item.id,
          patientName: item.patient_name,
          contactNumber: item.contact_number,
          date: item.date,
          doctor: item.doctor,
          status: item.status as OutcomeStatus,
          bracesType: item.braces_type,
          notes: item.notes,
          needsFollowUp: item.needs_follow_up,
          followedUp: item.followed_up,
          createdAt: new Date(item.created_at).getTime(),
        }));
      }

      if (doctorsRes.error) {
        console.warn('Supabase doctors fetch notice:', doctorsRes.error.message);
      } else if (doctorsRes.data && doctorsRes.data.length > 0) {
        loadedDoctors = doctorsRes.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          isActive: item.is_active,
          createdAt: new Date(item.created_at).getTime(),
        }));
      }
    } catch (error) {
      console.warn('Supabase error, using local storage fallback:', error);
    } finally {
      setOutcomes(loadedOutcomes);
      setDoctors(loadedDoctors);
      try {
        localStorage.setItem('tlow_doctors', JSON.stringify(loadedDoctors));
        localStorage.setItem('tlow_patient_outcomes', JSON.stringify(loadedOutcomes));
      } catch {}
      setIsLoading(false);
    }
  };

  // Outcome CRUD
  const isDuplicate = async (patientName: string, date: string, excludeId?: string) => {
    const normalizedNewName = patientName.trim().toLowerCase();
    
    try {
      const { data, error } = await supabase
        .from('patient_outcomes')
        .select('id, patient_name')
        .eq('date', date);
      
      if (!error && data && data.length > 0) {
        return data.some(record => {
          if (excludeId && record.id === excludeId) return false;
          return record.patient_name.trim().toLowerCase() === normalizedNewName;
        });
      }
    } catch (err) {
      console.warn('Supabase duplicate check notice:', err);
    }

    return outcomes.some(record => {
      if (excludeId && record.id === excludeId) return false;
      return record.date === date && record.patientName.trim().toLowerCase() === normalizedNewName;
    });
  };

  const executeAddOutcome = async (newOutcome: Omit<PatientOutcome, 'id' | 'createdAt'>) => {
    let savedItem: PatientOutcome | null = null;
    try {
      const { data, error } = await supabase
        .from('patient_outcomes')
        .insert([{ 
          patient_name: newOutcome.patientName,
          contact_number: newOutcome.contactNumber,
          date: newOutcome.date,
          doctor: newOutcome.doctor,
          status: newOutcome.status,
          braces_type: newOutcome.bracesType,
          notes: newOutcome.notes,
          needs_follow_up: newOutcome.needsFollowUp,
          followed_up: false
        }])
        .select();

      if (!error && data && data[0]) {
        const item = data[0];
        savedItem = {
          id: item.id,
          patientName: item.patient_name,
          contactNumber: item.contact_number,
          date: item.date,
          doctor: item.doctor,
          status: item.status as OutcomeStatus,
          bracesType: item.braces_type,
          notes: item.notes,
          needsFollowUp: item.needs_follow_up,
          followedUp: item.followed_up,
          createdAt: new Date(item.created_at).getTime(),
        };
      }
    } catch (error: any) {
      console.warn('Supabase insert notice, using local save:', error);
    }

    if (!savedItem) {
      savedItem = {
        ...newOutcome,
        id: 'loc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        followedUp: false,
        createdAt: Date.now(),
      };
    }

    setOutcomes(prev => {
      const updated = [savedItem!, ...prev];
      try { localStorage.setItem('tlow_patient_outcomes', JSON.stringify(updated)); } catch {}
      return updated;
    });
    setLastCreatedId(savedItem.id);
    
    // Show success modal
    setSuccessTitle(newOutcome.status === OutcomeStatus.SC ? 'Great News!' : 'Record Saved');
    setSuccessMessage(
      newOutcome.status === OutcomeStatus.SC 
        ? `Successfully recorded a successful case for ${newOutcome.patientName}!` 
        : `Patient record for ${newOutcome.patientName} has been saved.`
    );
    setShowSuccessModal(true);
  };

  const handleAddOutcome = async (newOutcome: Omit<PatientOutcome, 'id' | 'createdAt'>) => {
    // Check for duplicates
    const duplicateExists = await isDuplicate(
      newOutcome.patientName, 
      newOutcome.date, 
      undefined
    );
    if (duplicateExists) {
      setConfirmationDetails({
        title: 'Duplicate Record Detected',
        message: `A record for "${newOutcome.patientName}" on ${format(new Date(newOutcome.date), 'MMM d, yyyy')} already exists. Are you sure you want to add this as a separate record?`
      });
      setPendingAction(() => () => executeAddOutcome(newOutcome));
      setShowConfirmation(true);
      return;
    }

    await executeAddOutcome(newOutcome);
  };

  const executeUpdateOutcome = async (id: string, updates: Partial<PatientOutcome>) => {
    let updatedItem: PatientOutcome | null = null;
    try {
      const dbUpdates: any = {};
      if (updates.patientName) dbUpdates.patient_name = updates.patientName;
      if (updates.contactNumber !== undefined) dbUpdates.contact_number = updates.contactNumber;
      if (updates.date) dbUpdates.date = updates.date;
      if (updates.doctor) dbUpdates.doctor = updates.doctor;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.bracesType) dbUpdates.braces_type = updates.bracesType;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.needsFollowUp !== undefined) dbUpdates.needs_follow_up = updates.needsFollowUp;
      if (updates.followedUp !== undefined) dbUpdates.followed_up = updates.followedUp;

      const { data, error } = await supabase
        .from('patient_outcomes')
        .update(dbUpdates)
        .eq('id', id)
        .select();

      if (!error && data && data[0]) {
        const item = data[0];
        updatedItem = {
          id: item.id,
          patientName: item.patient_name,
          contactNumber: item.contact_number,
          date: item.date,
          doctor: item.doctor,
          status: item.status as OutcomeStatus,
          bracesType: item.braces_type,
          notes: item.notes,
          needsFollowUp: item.needs_follow_up,
          followedUp: item.followed_up,
          createdAt: new Date(item.created_at).getTime(),
        };
      }
    } catch (error: any) {
      console.warn('Supabase update notice, using local update:', error);
    }

    setOutcomes(prev => {
      const updatedList = prev.map(o => {
        if (o.id === id) {
          return updatedItem || { ...o, ...updates };
        }
        return o;
      });
      try { localStorage.setItem('tlow_patient_outcomes', JSON.stringify(updatedList)); } catch {}
      return updatedList;
    });

    setEditingOutcome(null);
    const targetName = updates.patientName || outcomes.find(o => o.id === id)?.patientName || 'Patient';
    setSuccessTitle('Record Updated');
    setSuccessMessage(`Changes to ${targetName}'s record have been saved.`);
    setShowSuccessModal(true);
  };

  const handleUpdateOutcome = async (id: string, updates: Partial<PatientOutcome>) => {
    if (updates.patientName || updates.date || updates.doctor || updates.contactNumber) {
      const currentOutcome = outcomes.find(o => o.id === id);
      if (currentOutcome) {
        const name = updates.patientName || currentOutcome.patientName;
        const date = updates.date || currentOutcome.date;
        
        const duplicateExists = await isDuplicate(name, date, id);
        if (duplicateExists) {
          setConfirmationDetails({
            title: 'Potential Duplicate Update',
            message: `Another record for "${name}" on ${format(new Date(date), 'MMM d, yyyy')} already exists. Are you sure you want to save these changes?`
          });
          setPendingAction(() => () => executeUpdateOutcome(id, updates));
          setShowConfirmation(true);
          return;
        }
      }
    }

    await executeUpdateOutcome(id, updates);
  };

  const handleDeleteOutcome = async (id: string) => {
    try {
      await supabase
        .from('patient_outcomes')
        .delete()
        .eq('id', id);
    } catch (error: any) {
      console.warn('Supabase delete notice, deleting locally:', error);
    }
    
    setOutcomes(prev => {
      const updated = prev.filter(o => o.id !== id);
      try { localStorage.setItem('tlow_patient_outcomes', JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (lastCreatedId === id) setLastCreatedId(null);
    setSuccessTitle('Record Deleted');
    setSuccessMessage('The patient record has been successfully removed.');
    setShowSuccessModal(true);
  };

  const handleConvertOutcome = async (outcome: PatientOutcome) => {
    try {
      await handleAddOutcome({
        patientName: outcome.patientName,
        contactNumber: outcome.contactNumber,
        date: new Date().toISOString().split('T')[0],
        doctor: outcome.doctor,
        status: OutcomeStatus.SC,
        notes: `[Follow-up Success from record on ${format(new Date(outcome.date), 'MMM d, yyyy')}]`
      });
      setSuccessTitle('Conversion Success!');
    } catch (error) {
      console.error('Error creating follow-up outcome:', error);
    }
  };

  const handleUndo = async () => {
    if (lastCreatedId) {
      await handleDeleteOutcome(lastCreatedId);
      setLastCreatedId(null);
    }
  };

  // Doctor CRUD
  const handleCreateDoctor = async (name: string) => {
    let createdDoctor: Doctor | null = null;
    try {
      const { data, error } = await supabase
        .from('doctors')
        .insert([{ name, is_active: true }])
        .select();

      if (!error && data && data[0]) {
        const item = data[0];
        createdDoctor = {
          id: item.id,
          name: item.name,
          isActive: item.is_active,
          createdAt: new Date(item.created_at).getTime(),
        };
      }
    } catch (error: any) {
      console.warn('Supabase create doctor notice, creating locally:', error);
    }

    if (!createdDoctor) {
      createdDoctor = {
        id: 'doc-loc-' + Date.now(),
        name,
        isActive: true,
        createdAt: Date.now(),
      };
    }

    setDoctors(prev => {
      const updated = [...prev, createdDoctor!];
      try { localStorage.setItem('tlow_doctors', JSON.stringify(updated)); } catch {}
      return updated;
    });

    setSuccessTitle('Doctor Added');
    setSuccessMessage(`${createdDoctor.name} has been added to the clinic staff.`);
    setShowSuccessModal(true);
  };

  const handleUpdateDoctor = async (id: string, updates: Partial<Doctor>) => {
    let updatedDoctor: Doctor | null = null;
    try {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

      const { data, error } = await supabase
        .from('doctors')
        .update(dbUpdates)
        .eq('id', id)
        .select();

      if (!error && data && data[0]) {
        const item = data[0];
        updatedDoctor = {
          id: item.id,
          name: item.name,
          isActive: item.is_active,
          createdAt: new Date(item.created_at).getTime(),
        };
      }
    } catch (error: any) {
      console.warn('Supabase update doctor notice, updating locally:', error);
    }

    setDoctors(prev => {
      const updatedList = prev.map(d => {
        if (d.id === id) {
          return updatedDoctor || { ...d, ...updates };
        }
        return d;
      });
      try { localStorage.setItem('tlow_doctors', JSON.stringify(updatedList)); } catch {}
      return updatedList;
    });

    const docName = updates.name || doctors.find(d => d.id === id)?.name || 'Doctor';
    setSuccessTitle('Doctor Updated');
    setSuccessMessage(`Information for ${docName} has been updated.`);
    setShowSuccessModal(true);
  };

  const handleDeleteDoctor = async (id: string) => {
    try {
      await supabase
        .from('doctors')
        .delete()
        .eq('id', id);
    } catch (error: any) {
      console.warn('Supabase delete doctor notice, deleting locally:', error);
    }

    setDoctors(prev => {
      const updated = prev.filter(d => d.id !== id);
      try { localStorage.setItem('tlow_doctors', JSON.stringify(updated)); } catch {}
      return updated;
    });

    setSuccessTitle('Doctor Removed');
    setSuccessMessage('The doctor has been successfully removed from the system.');
    setShowSuccessModal(true);
  };

  const handleSortChange = (field: 'date' | 'patientName' | 'status', direction?: 'asc' | 'desc') => {
    setSortField(field);
    if (direction) {
      setSortDirection(direction);
    } else {
      if (sortField === field) {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
        setSortDirection('asc');
      }
    }
  };

  const filteredOutcomes = useMemo(() => {
    const filtered = outcomes.filter((outcome) => {
      const dateMatch = (!startDate || outcome.date >= startDate) && (!endDate || outcome.date <= endDate);
      const doctorMatch = selectedDoctor === 'All' || outcome.doctor === selectedDoctor;
      const statusMatch = selectedStatus === 'All' || outcome.status === selectedStatus;
      const patientMatch = outcome.patientName.toLowerCase().includes(patientSearch.toLowerCase());
      return dateMatch && doctorMatch && statusMatch && patientMatch;
    });

    return [...filtered].sort((a, b) => {
      if (sortField === 'date') {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) {
          return sortDirection === 'asc' ? dateCompare : -dateCompare;
        }
        return sortDirection === 'asc' ? (a.createdAt - b.createdAt) : (b.createdAt - a.createdAt);
      }

      if (sortField === 'status') {
        const statusWeight: Record<string, number> = {
          [OutcomeStatus.SC]: 1,
          [OutcomeStatus.CO]: 2,
          [OutcomeStatus.NS]: 3,
          [OutcomeStatus.CC]: 4,
        };
        const weightA = statusWeight[a.status] || 99;
        const weightB = statusWeight[b.status] || 99;
        if (weightA !== weightB) {
          return sortDirection === 'asc' ? weightA - weightB : weightB - weightA;
        }
        return a.date.localeCompare(b.date);
      }

      if (sortField === 'patientName') {
        const nameCompare = a.patientName.localeCompare(b.patientName);
        if (nameCompare !== 0) {
          return sortDirection === 'asc' ? nameCompare : -nameCompare;
        }
        return a.date.localeCompare(b.date);
      }

      return 0;
    });
  }, [outcomes, startDate, endDate, selectedDoctor, selectedStatus, patientSearch, sortField, sortDirection]);

  const performanceData = useMemo(() => {
    const activeDoctorNames = doctors.filter(d => d.isActive).map(d => d.name);
    const doctorsWithRecords = Array.from(new Set(outcomes.map(o => o.doctor).filter(Boolean))) as string[];
    const allRelevantDoctors = Array.from(new Set([...activeDoctorNames, ...doctorsWithRecords]))
      .filter(name => !['dr ratna', 'dr hari'].includes(name.toLowerCase()));

    return allRelevantDoctors.map((docName) => {
      const docOutcomes = filteredOutcomes.filter((o) => o.doctor === docName);
      const sc = docOutcomes.filter((o) => o.status === OutcomeStatus.SC).length;
      const co = docOutcomes.filter((o) => o.status === OutcomeStatus.CO).length;
      const cc = docOutcomes.filter((o) => o.status === OutcomeStatus.CC).length;
      const ns = docOutcomes.filter((o) => o.status === OutcomeStatus.NS).length;
      const total = docOutcomes.length;
      const conversionRate = (sc + co + cc) > 0 ? ((sc + cc) / (sc + co + cc)) * 100 : 0;

      return {
        doctor: docName,
        sc,
        co,
        cc,
        ns,
        total,
        conversionRate,
      };
    }).sort((a, b) => b.conversionRate - a.conversionRate);
  }, [filteredOutcomes, doctors, outcomes]);

  const handleExportCSV = () => {
    // 1. Summary Data
    // Filter to only include doctors that have data matching the current filters
    const summaryData = performanceData
      .filter(d => d.total > 0)
      .map(d => ({
        'Doctor': d.doctor,
        'Success (SC)': d.sc,
        'Consult Only (CO)': d.co,
        'Continue Case (CC)': d.cc,
        'No Show (NS)': d.ns,
        'Total': d.total,
        'Conversion Rate (%)': d.conversionRate.toFixed(1)
      }));

    // 2. Detailed Records Data
    // Exclude Dr Ratna and Dr Hari from the detailed records as well, to be consistent with performance measurement
    const detailedData = filteredOutcomes
      .filter(o => !['dr ratna', 'dr hari'].includes(o.doctor?.toLowerCase() || ''))
      .map(o => ({
        'Date': o.date,
        'Patient Name': o.patientName,
        'Contact': o.contactNumber || '-',
        'Doctor': o.doctor || '-',
        'Status': o.status,
        'Braces Type': o.bracesType || '-',
        'Notes': o.notes || '-',
        'Follow Up Needed': o.needsFollowUp ? 'Yes' : 'No',
        'Followed Up': o.followedUp ? 'Yes' : 'No'
      }));

    const wb = XLSX.utils.book_new();
    
    // Create a worksheet that combines both
    const ws = XLSX.utils.json_to_sheet(summaryData);
    
    // Add a header for the detailed records section after a blank row
    const summaryRows = summaryData.length + 2; // +1 for header, +1 for blank row
    XLSX.utils.sheet_add_aoa(ws, [['']], { origin: `A${summaryRows}` });
    XLSX.utils.sheet_add_aoa(ws, [['DETAILED OUTCOME RECORDS']], { origin: `A${summaryRows + 1}` });
    XLSX.utils.sheet_add_json(ws, detailedData, { origin: `A${summaryRows + 2}`, skipHeader: false });

    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Comprehensive_Performance_Report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = useMemo(() => {
    const total = filteredOutcomes.length;
    const sc = filteredOutcomes.filter((o) => o.status === OutcomeStatus.SC).length;
    const co = filteredOutcomes.filter((o) => o.status === OutcomeStatus.CO).length;
    const cc = filteredOutcomes.filter((o) => o.status === OutcomeStatus.CC).length;
    const ns = filteredOutcomes.filter((o) => o.status === OutcomeStatus.NS).length;
    return { total, sc, co, cc, ns };
  }, [filteredOutcomes]);

  const overallStatusData = useMemo(() => [
    { name: 'Success', value: stats.sc + stats.cc },
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
        cc: monthOutcomes.filter(o => o.status === OutcomeStatus.CC).length,
        ns: monthOutcomes.filter(o => o.status === OutcomeStatus.NS).length,
      };
    });
  }, [filteredOutcomes]);

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedDoctor('All');
    setSelectedStatus('All');
    setSelectedYear(new Date().getFullYear());
    setPatientSearch('');
    setSortField('date');
    setSortDirection('asc');
  };

  const handleStatClick = (label: string) => {
    setDetailsTitle(label);
    if (label === 'Total Success') setDetailsStatus('Success' as any);
    else if (label === 'Total Consult Only') setDetailsStatus(OutcomeStatus.CO);
    else if (label === 'Total No Show') setDetailsStatus(OutcomeStatus.NS);
    else setDetailsStatus('All');
    setIsDetailsOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-auto overflow-y-auto">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 min-w-fit">
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
            <button 
              onClick={() => setCurrentView('performance')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'performance' ? 'bg-white text-clinic-teal shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Performance
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-w-fit">
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
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-clinic-teal text-white rounded-lg hover:bg-clinic-teal/90 transition-all shadow-sm font-medium text-sm"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>

              <Filters 
                startDate={startDate}
                endDate={endDate}
                selectedDoctor={selectedDoctor}
                selectedStatus={selectedStatus}
                selectedYear={selectedYear}
                patientSearch={patientSearch}
                sortField={sortField}
                sortDirection={sortDirection}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onDoctorChange={setSelectedDoctor}
                onStatusChange={setSelectedStatus}
                onYearChange={setSelectedYear}
                onPatientSearchChange={setPatientSearch}
                onSortChange={handleSortChange}
                onReset={handleResetFilters}
                doctors={doctors}
              />

              <StatsCards {...stats} onStatClick={handleStatClick} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <Charts 
                    performanceData={performanceData} 
                    overallStatusData={overallStatusData} 
                    monthlyTrendData={monthlyTrendData}
                  />
                  <BracesSummary outcomes={filteredOutcomes} />
                </div>
                <div className="space-y-8">
                  <FollowUpList 
                    outcomes={filteredOutcomes} 
                    onToggleFollowUp={(id, followedUp) => handleUpdateOutcome(id, { followedUp })}
                  />
                  <NoShowList 
                    outcomes={filteredOutcomes} 
                    onToggleFollowUp={(id, followedUp) => handleUpdateOutcome(id, { followedUp })}
                  />
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
                selectedStatus={selectedStatus}
                selectedYear={selectedYear}
                patientSearch={patientSearch}
                sortField={sortField}
                sortDirection={sortDirection}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onDoctorChange={setSelectedDoctor}
                onStatusChange={setSelectedStatus}
                onYearChange={setSelectedYear}
                onPatientSearchChange={setPatientSearch}
                onSortChange={handleSortChange}
                onReset={handleResetFilters}
                doctors={doctors}
              />

              <OutcomeTable 
                outcomes={filteredOutcomes}
                sortField={sortField}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                onEdit={(outcome) => {
                  setEditingOutcome(outcome);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onDelete={handleDeleteOutcome}
                onConvert={handleConvertOutcome}
              />
            </motion.div>
          )}

          {currentView === 'performance' && (
            <motion.div
              key="performance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Annual Doctor Performance</h1>
                  <p className="text-slate-500">Comprehensive yearly breakdown and trends</p>
                </div>
              </div>

              <AnnualPerformance 
                outcomes={outcomes} 
                doctors={doctors} 
                selectedYear={selectedYear} 
                onYearChange={setSelectedYear}
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
        onClose={() => {
          setShowSuccessModal(false);
          setLastCreatedId(null);
        }}
        title={successTitle}
        message={successMessage}
        onUndo={lastCreatedId ? handleUndo : undefined}
      />

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          setPendingAction(null);
        }}
        onConfirm={() => {
          if (pendingAction) pendingAction();
        }}
        title={confirmationDetails.title}
        message={confirmationDetails.message}
        confirmLabel="Yes, Save Anyway"
        cancelLabel="No, Cancel"
      />

      <PatientDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={detailsTitle}
        outcomes={filteredOutcomes}
        status={detailsStatus}
      />
    </div>
  );
}
