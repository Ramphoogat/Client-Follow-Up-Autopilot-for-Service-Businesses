import React, { useState } from 'react';
import { 
  X, Phone, Mail, MessageCircle, Edit2, Calendar, 
  Clock, CheckCircle2, User, FileText, Send, Trash2, GitBranch,
  AlertCircle, Plus
} from 'lucide-react';
import { useStore } from '../store';
import { LeadPriority, LeadStatus, CalendarActivity } from '../types';
import { format } from 'date-fns';

const LeadDetailPanel: React.FC = () => {
  const { 
    leads, 
    sequences,
    activities,
    selectedLeadId, 
    setSelectedLeadId, 
    setAddLeadModalOpen, 
    setEditingLeadId,
    deleteLead,
    updateLead,
    addActivity
  } = useStore();
  
  const [noteInput, setNoteInput] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'notes'>('overview');

  const lead = leads.find(l => l.id === selectedLeadId);

  if (!selectedLeadId) return null;
  if (!lead) return null; // Handle case where lead was deleted but ID is still selected

  const handleEdit = () => {
    setEditingLeadId(lead.id);
    setAddLeadModalOpen(true);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this lead?')) {
      deleteLead(lead.id);
    }
  };

  const handleSequenceChange = (seqId: string) => {
    updateLead(lead.id, { assignedSequenceId: seqId });
  };

  const handleAddNote = () => {
    if (!noteInput.trim()) return;
    
    addActivity({
      id: `act-${Date.now()}`,
      leadId: lead.id,
      leadName: lead.name,
      type: 'updated',
      date: new Date().toISOString(),
      priority: lead.priority,
      metadata: { notes: noteInput }
    });
    setNoteInput('');
  };

  const getPriorityBadge = (p: LeadPriority) => {
    switch (p) {
      case LeadPriority.HOT: return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50';
      case LeadPriority.WARM: return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-900/50';
      case LeadPriority.COLD: return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Get real activities for this lead
  const leadActivities = activities
    .filter(a => a.leadId === lead.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created': return <User size={14} />;
      case 'updated': return <FileText size={14} />;
      case 'deleted': return <Trash2 size={14} />;
      case 'status_change': return <CheckCircle2 size={14} />;
      case 'call': return <Phone size={14} />;
      case 'email': return <Mail size={14} />;
      case 'whatsapp': return <MessageCircle size={14} />;
      default: return <CheckCircle2 size={14} />;
    }
  };

  const formatActivityTitle = (a: CalendarActivity) => {
    if (a.metadata?.notes) return 'Note Added';
    if (a.type === 'status_change') return 'Status Updated';
    if (a.type === 'created') return 'Lead Created';
    return a.type.charAt(0).toUpperCase() + a.type.slice(1);
  };

  const formatActivityDesc = (a: CalendarActivity) => {
    if (a.metadata?.notes) return a.metadata.notes;
    if (a.metadata?.oldStatus && a.metadata?.newStatus) 
      return `Changed from ${a.metadata.oldStatus} to ${a.metadata.newStatus}`;
    if (a.type === 'created') return `Source: ${lead.source}`;
    return 'Activity recorded';
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" 
        onClick={() => setSelectedLeadId(null)}
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform animate-in slide-in-from-right duration-300 flex flex-col border-l border-gray-200 dark:border-gray-800">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start bg-gray-50/50 dark:bg-gray-800/30">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border ${getPriorityBadge(lead.priority)}`}>
                {lead.priority}
              </span>
              <span className="text-xs text-textSub dark:text-gray-400 flex items-center gap-1">
                <Clock size={12} /> {lead.createdAt}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-textMain dark:text-white">{lead.name}</h2>
            <p className="text-sm text-textSub dark:text-gray-400">{lead.service}</p>
          </div>
          <button 
            onClick={() => setSelectedLeadId(null)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-textSub dark:text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-4 flex gap-3 border-b border-gray-100 dark:border-gray-800">
           <button className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 text-green-700 dark:text-green-400 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle size={20} />
              </div>
              <span className="text-xs font-medium">WhatsApp</span>
           </button>
           <button className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-400 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone size={20} />
              </div>
              <span className="text-xs font-medium">Call</span>
           </button>
           <button className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail size={20} />
              </div>
              <span className="text-xs font-medium">Email</span>
           </button>
           <div className="w-px bg-gray-200 dark:bg-gray-800 mx-1"></div>
           <button 
             onClick={handleEdit}
             className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-primary/10 text-primaryDark transition-colors group"
           >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Edit2 size={20} />
              </div>
              <span className="text-xs font-medium">Edit</span>
           </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-primary text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'notes' ? 'border-primary text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Timeline & Notes
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Contact Details</h3>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <Phone size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-textSub dark:text-gray-500">Phone Number</p>
                    <p className="text-sm font-medium text-textMain dark:text-gray-200">{lead.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-textSub dark:text-gray-500">Email Address</p>
                    <p className="text-sm font-medium text-textMain dark:text-gray-200">{lead.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-textSub dark:text-gray-500">Assigned To</p>
                    <p className="text-sm font-medium text-textMain dark:text-gray-200">{lead.assignedTo}</p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-gray-800"></div>

              {/* Automation Section */}
              <div className="space-y-4">
                 <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                   <GitBranch size={16} /> Automation
                 </h3>
                 <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                    <label className="text-xs text-textSub dark:text-gray-400 mb-1 block">Active Sequence</label>
                    <select 
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm rounded-lg p-2 focus:ring-primary focus:border-primary outline-none text-textMain dark:text-gray-200"
                      value={lead.assignedSequenceId || ''}
                      onChange={(e) => handleSequenceChange(e.target.value)}
                    >
                      <option value="">No Sequence Assigned</option>
                      {sequences.map(seq => (
                        <option key={seq.id} value={seq.id}>{seq.name}</option>
                      ))}
                    </select>
                    {lead.assignedSequenceId && (
                      <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Active & Running
                      </div>
                    )}
                 </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-gray-800"></div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Deal Info</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-textSub dark:text-gray-400 mb-1">Status</p>
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-textMain dark:text-gray-200">
                      {lead.status}
                    </span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-textSub dark:text-gray-400 mb-1">Est. Value</p>
                    <p className="text-sm font-bold text-textMain dark:text-white">₹{lead.value.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 col-span-2">
                    <p className="text-xs text-textSub dark:text-gray-400 mb-1">Source</p>
                    <p className="text-sm font-medium text-textMain dark:text-gray-200">{lead.source}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-8">
                 <button 
                  onClick={handleDelete}
                  className="w-full py-3 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                 >
                   <Trash2 size={16} /> Delete Lead
                 </button>
              </div>

            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              
              {/* Add Note */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
                <textarea 
                  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-textMain dark:text-gray-200"
                  rows={3}
                  placeholder="Add a note about this lead..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddNote();
                    }
                  }}
                />
                <div className="flex justify-end mt-2">
                  <button 
                    onClick={handleAddNote}
                    disabled={!noteInput.trim()}
                    className="bg-primary hover:bg-primaryDark text-gray-900 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={12} /> Save Note
                  </button>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-6 relative pl-4 border-l-2 border-gray-100 dark:border-gray-800 ml-2">
                {leadActivities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm italic">
                    No activity recorded yet.
                  </div>
                ) : (
                  leadActivities.map((activity, idx) => (
                    <div key={activity.id} className="relative group animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${idx * 50}ms` }}>
                      <div className="absolute -left-[21px] top-0 w-8 h-8 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 shadow-sm group-hover:border-primary group-hover:text-primary transition-colors">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="pl-4">
                        <p className="text-xs text-textSub dark:text-gray-500 mb-0.5">
                          {format(new Date(activity.date), 'MMM d, h:mm a')}
                        </p>
                        <h4 className="text-sm font-semibold text-textMain dark:text-white">
                          {formatActivityTitle(activity)}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-wrap">
                          {formatActivityDesc(activity)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default LeadDetailPanel;