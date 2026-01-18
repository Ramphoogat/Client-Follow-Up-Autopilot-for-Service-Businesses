import React from 'react';

export enum LeadStatus {
  NEW = 'New',
  CONTACTED = 'Contacted',
  ENGAGED = 'Engaged',
  QUOTED = 'Quoted',
  WON = 'Won',
  LOST = 'Lost'
}

// Deprecated in favor of dynamic tags, kept for backward compatibility if needed
export enum LeadPriority {
  HOT = 'Hot',
  WARM = 'Warm',
  COLD = 'Cold'
}

export enum ViewState {
  DASHBOARD = 'Dashboard',
  PIPELINE = 'Pipeline',
  CALENDAR = 'Calendar',
  SEQUENCES = 'Sequences',
  REPORTS = 'Reports',
  SETTINGS = 'Settings'
}

export interface Tag {
  id: string;
  name: string;
  color: string; // Tailwind class or Hex
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  status: LeadStatus;
  priority: LeadPriority; // Kept for legacy sort, but UI will focus on tags
  tags: string[]; // Array of Tag IDs
  assignedTo: string; // URL to avatar or name
  assignedSequenceId?: string;
  source: string;
  createdAt: string;
  lastActivity: string;
  value: number;
}

export interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ElementType;
  colorClass: string;
}

export interface SequenceStep {
  id: string;
  timeDelay: string;
  channel: 'WhatsApp' | 'Email';
  content: string;
}

export interface Sequence {
  id: string;
  name: string;
  steps: SequenceStep[];
}

export interface CalendarActivity {
  id: string;
  leadId: string;
  leadName: string;
  type: 'created' | 'updated' | 'deleted' | 'status_change' | 'call' | 'email' | 'whatsapp';
  date: string; // ISO string
  priority: LeadPriority;
  metadata: {
    oldStatus?: string;
    newStatus?: string;
    notes?: string;
  };
}

export interface WhiteboardCard {
  id: string;
  title: string;
  description: string;
  column: 'todo' | 'in_progress' | 'review' | 'done';
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}