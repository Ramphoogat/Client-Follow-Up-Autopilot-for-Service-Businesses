import { create } from 'zustand';
import { MOCK_LEADS, MOCK_SEQUENCES } from './constants';
import { Lead, Sequence, SequenceStep, CalendarActivity, WhiteboardCard, Tag, ViewState, LeadPriority } from './types';
import { arrayMove } from '@dnd-kit/sortable';

interface AppState {
  // Navigation
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;

  // Data
  leads: Lead[];
  sequences: Sequence[];
  availableTags: Tag[];
  
  // UI State
  searchQuery: string;
  isAddLeadModalOpen: boolean;
  selectedLeadId: string | null;
  editingLeadId: string | null;
  theme: 'light' | 'dark';
  
  // Calendar Activities
  activities: CalendarActivity[];
  
  // Whiteboard State
  whiteboards: Record<string, WhiteboardCard[]>;
  activeWhiteboardLeadId: string | null;

  // Tag Actions
  addTag: (tag: Tag) => void;
  deleteTag: (id: string) => void;

  // Lead Actions
  addLead: (lead: Lead) => void;
  importLeads: (leads: Lead[]) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setAddLeadModalOpen: (isOpen: boolean) => void;
  setSelectedLeadId: (id: string | null) => void;
  setEditingLeadId: (id: string | null) => void;
  toggleTheme: () => void;

  // Sequence Actions
  addSequence: (sequence: Sequence) => void;
  deleteSequence: (id: string) => void;
  addSequenceStep: (sequenceId: string, step: SequenceStep) => void;
  updateSequenceStep: (sequenceId: string, stepId: string, updates: Partial<SequenceStep>) => void;
  deleteSequenceStep: (sequenceId: string, stepId: string) => void;
  reorderSequenceSteps: (sequenceId: string, oldIndex: number, newIndex: number) => void;

  // Calendar Actions
  addActivity: (activity: CalendarActivity) => void;

  // Whiteboard Actions
  setActiveWhiteboardLeadId: (id: string | null) => void;
  setWhiteboardCards: (leadId: string, cards: WhiteboardCard[]) => void;
}

// Initial Default Tags
const DEFAULT_TAGS: Tag[] = [
  { id: 'tag-hot', name: 'Hot', color: 'bg-red-500' },
  { id: 'tag-warm', name: 'Warm', color: 'bg-orange-400' },
  { id: 'tag-cold', name: 'Cold', color: 'bg-blue-400' },
  { id: 'tag-vip', name: 'VIP', color: 'bg-purple-500' },
  { id: 'tag-urgent', name: 'Urgent', color: 'bg-pink-600' }
];

// Helper to migrate mock leads to have tags based on priority
const migrateMockLeads = (leads: Lead[]) => {
  return leads.map(l => {
    const tags = [];
    if (l.priority === LeadPriority.HOT) tags.push('tag-hot');
    if (l.priority === LeadPriority.WARM) tags.push('tag-warm');
    if (l.priority === LeadPriority.COLD) tags.push('tag-cold');
    // Randomly add other tags for demo
    if (Math.random() > 0.7) tags.push('tag-vip');
    return { ...l, tags };
  });
};

// Generate some mock activities based on mock leads
const generateMockActivities = (): CalendarActivity[] => {
  const activities: CalendarActivity[] = [];
  MOCK_LEADS.forEach(lead => {
    // Creation activity
    activities.push({
      id: `act-create-${lead.id}`,
      leadId: lead.id,
      leadName: lead.name,
      type: 'created',
      date: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7).toISOString(), // Random time in last 7 days
      priority: lead.priority,
      metadata: {}
    });
    // Random activity
    if (Math.random() > 0.5) {
      activities.push({
        id: `act-call-${lead.id}`,
        leadId: lead.id,
        leadName: lead.name,
        type: 'call',
        date: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 2).toISOString(),
        priority: lead.priority,
        metadata: { notes: 'Initial consultation call' }
      });
    }
  });
  return activities;
};

export const useStore = create<AppState>((set, get) => ({
  currentView: ViewState.DASHBOARD,
  setCurrentView: (view) => set({ currentView: view }),
  
  availableTags: DEFAULT_TAGS,
  leads: migrateMockLeads(MOCK_LEADS),
  sequences: MOCK_SEQUENCES,
  activities: generateMockActivities(),
  whiteboards: {},
  activeWhiteboardLeadId: null,
  searchQuery: '',
  isAddLeadModalOpen: false,
  selectedLeadId: null,
  editingLeadId: null,
  theme: 'light',

  addTag: (tag) => set((state) => ({ availableTags: [...state.availableTags, tag] })),
  deleteTag: (id) => set((state) => ({ 
    availableTags: state.availableTags.filter(t => t.id !== id),
    // Also remove this tag from all leads
    leads: state.leads.map(l => ({
      ...l,
      tags: l.tags.filter(tId => tId !== id)
    }))
  })),

  addLead: (lead) => {
    set((state) => ({ 
      leads: [lead, ...state.leads] 
    }));
    // Sync to calendar
    get().addActivity({
      id: `act-${Date.now()}`,
      leadId: lead.id,
      leadName: lead.name,
      type: 'created',
      date: new Date().toISOString(),
      priority: lead.priority,
      metadata: {}
    });
  },

  importLeads: (newLeads) => {
    set((state) => ({
      leads: [...newLeads, ...state.leads]
    }));

    // Generate creation activities for imported leads
    const newActivities = newLeads.map(lead => ({
      id: `act-import-${lead.id}-${Date.now()}`,
      leadId: lead.id,
      leadName: lead.name,
      type: 'created' as const,
      date: new Date().toISOString(),
      priority: lead.priority,
      metadata: { notes: 'Imported via CSV' }
    }));

    set((state) => ({
      activities: [...state.activities, ...newActivities]
    }));
  },

  updateLead: (id, updates) => {
    const oldLead = get().leads.find(l => l.id === id);
    set((state) => ({
      leads: state.leads.map((l) => (l.id === id ? { ...l, ...updates } : l)),
      selectedLeadId: state.selectedLeadId === id ? id : state.selectedLeadId
    }));
    
    // Sync status changes to calendar
    if (oldLead && updates.status && updates.status !== oldLead.status) {
      get().addActivity({
        id: `act-${Date.now()}`,
        leadId: id,
        leadName: oldLead.name,
        type: 'status_change',
        date: new Date().toISOString(),
        priority: updates.priority || oldLead.priority,
        metadata: {
          oldStatus: oldLead.status,
          newStatus: updates.status
        }
      });
    }
  },

  deleteLead: (id) => {
    const lead = get().leads.find(l => l.id === id);
    if (lead) {
      get().addActivity({
        id: `act-${Date.now()}`,
        leadId: id,
        leadName: lead.name,
        type: 'deleted',
        date: new Date().toISOString(),
        priority: lead.priority,
        metadata: { notes: 'Lead removed from system' }
      });
    }

    set((state) => ({
      leads: state.leads.filter((l) => l.id !== id),
      selectedLeadId: state.selectedLeadId === id ? null : state.selectedLeadId
    }));
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setAddLeadModalOpen: (isOpen) => set({ isAddLeadModalOpen: isOpen }),
  
  setSelectedLeadId: (id) => set({ selectedLeadId: id }),
  
  setEditingLeadId: (id) => set({ editingLeadId: id }),

  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

  // Sequence Actions
  addSequence: (sequence) => set((state) => ({
    sequences: [...state.sequences, sequence]
  })),

  deleteSequence: (id) => set((state) => ({
    sequences: state.sequences.filter(s => s.id !== id)
  })),

  addSequenceStep: (sequenceId, step) => set((state) => ({
    sequences: state.sequences.map(seq => 
      seq.id === sequenceId 
        ? { ...seq, steps: [...seq.steps, step] }
        : seq
    )
  })),

  updateSequenceStep: (sequenceId, stepId, updates) => set((state) => ({
    sequences: state.sequences.map(seq => 
      seq.id === sequenceId 
        ? { 
            ...seq, 
            steps: seq.steps.map(s => s.id === stepId ? { ...s, ...updates } : s) 
          }
        : seq
    )
  })),

  deleteSequenceStep: (sequenceId, stepId) => set((state) => ({
    sequences: state.sequences.map(seq => 
      seq.id === sequenceId 
        ? { ...seq, steps: seq.steps.filter(s => s.id !== stepId) }
        : seq
    )
  })),

  reorderSequenceSteps: (sequenceId, oldIndex, newIndex) => set((state) => {
    const sequence = state.sequences.find(s => s.id === sequenceId);
    if (!sequence) return state;

    const newSteps = arrayMove(sequence.steps, oldIndex, newIndex);
    
    return {
      sequences: state.sequences.map(seq => 
        seq.id === sequenceId ? { ...seq, steps: newSteps } : seq
      )
    };
  }),

  // Calendar Actions
  addActivity: (activity) => set((state) => ({
    activities: [...state.activities, activity]
  })),

  // Whiteboard Actions
  setActiveWhiteboardLeadId: (id) => set({ activeWhiteboardLeadId: id }),
  setWhiteboardCards: (leadId, cards) => set((state) => ({
    whiteboards: { ...state.whiteboards, [leadId]: cards }
  })),
}));