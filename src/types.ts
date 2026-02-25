import { Type } from "@google/genai";

export enum OutcomeStatus {
  SC = "Success",
  CO = "Consult Only",
  NS = "No Show",
}

export interface Doctor {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: number;
}

export type DoctorName = string;

export interface PatientOutcome {
  id: string;
  patientName: string;
  contactNumber?: string;
  date: string;
  doctor?: DoctorName;
  status: OutcomeStatus;
  notes?: string;
  createdAt: number;
}

export interface DoctorPerformance {
  doctor: DoctorName;
  sc: number;
  co: number;
  ns: number;
  total: number;
  conversionRate: number;
}

export interface FollowUpTemplate {
  id: string;
  title: string;
  content: string;
  category: 'Consult Only' | 'No Show' | 'General';
}
