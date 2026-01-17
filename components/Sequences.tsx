import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, Mail, Clock, Plus, GripVertical, 
  PlayCircle, Trash2, Edit2, X, Check, BookOpen, Copy, Layout, ArrowRight
} from 'lucide-react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  DropAnimation,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStore } from '../store';
import { Sequence, SequenceStep } from '../types';
import { SEQUENCE_TEMPLATES } from '../constants';

// --- Components ---

// Reusable Step Card for Sortable Item & Drag Overlay
const StepCard: React.FC<{
  step: SequenceStep;
  index: number;
  onEdit?: (step: SequenceStep) => void;
  onDelete?: (id: string) => void;
  dragHandleProps?: any;
  isOverlay?: boolean;
}> = ({ step, index, onEdit, onDelete, dragHandleProps, isOverlay }) => {
  return (
    <div className={`flex gap-4 group ${isOverlay ? 'cursor-grabbing' : ''}`}>
      {/* Timeline Node - also acts as a drag handle for convenience */}
      <div 
        {...dragHandleProps}
        className={`w-12 h-12 rounded-full bg-white dark:bg-gray-900 border-4 border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0 shadow-sm text-primaryDark font-bold transition-colors z-10 relative cursor-grab touch-none ${isOverlay ? 'border-primary' : 'group-hover:border-primary'}`}
      >
        {index + 1}
      </div>

      {/* Content Card */}
      <div className={`flex-1 bg-white dark:bg-gray-900 rounded-xl border ${isOverlay ? 'border-primary shadow-2xl scale-105' : 'border-gray-200 dark:border-gray-800 shadow-sm'} overflow-hidden group-hover:shadow-md transition-all`}>
        <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-md ${step.channel === 'WhatsApp' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                  {step.channel === 'WhatsApp' ? <MessageCircle size={14} /> : <Mail size={14} />}
              </div>
              <span className="font-semibold text-sm text-textMain dark:text-white">{step.channel}</span>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <div className="flex items-center gap-1 text-xs text-textSub dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                  <Clock size={12} /> Delay: {step.timeDelay}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <button onClick={() => onEdit(step)} className="p-1.5 text-gray-400 hover:text-primaryDark hover:bg-orange-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                   <Edit2 size={16} />
                </button>
              )}
              {onDelete && (
                <button onClick={() => onDelete(step.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                   <Trash2 size={16} />
                </button>
              )}
              {/* Drag Handle */}
              <div 
                {...dragHandleProps} 
                className="cursor-grab p-2 -mr-2 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 outline-none touch-none"
              >
                <GripVertical size={16} />
              </div>
            </div>
        </div>
        <div className="p-4">
          <div className="bg-bgMain dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800 text-sm text-textSub dark:text-gray-400 italic whitespace-pre-wrap">
            "{step.content}"
          </div>
        </div>
      </div>
    </div>
  );
};

// Sortable Step Wrapper
interface SortableStepProps {
  step: SequenceStep;
  index: number;
  onEdit: (step: SequenceStep) => void;
  onDelete: (id: string) => void;
}

const SortableStep: React.FC<SortableStepProps> = ({ step, index, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1, // Dim the original item while dragging
  };

  return (
    <div ref={setNodeRef} style={style}>
      <StepCard 
        step={step} 
        index={index} 
        onEdit={onEdit} 
        onDelete={onDelete} 
        dragHandleProps={{ ...attributes, ...listeners }} 
      />
    </div>
  );
};

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.3',
      },
    },
  }),
};

// --- Main Component ---

const Sequences: React.FC = () => {
  const { 
    sequences, 
    updateSequenceStep, 
    addSequenceStep, 
    deleteSequenceStep, 
    reorderSequenceSteps,
    addSequence,
    deleteSequence 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'my-sequences' | 'library'>('my-sequences');
  const [activeSequenceId, setActiveSequenceId] = useState<string>('');
  const [editingStep, setEditingStep] = useState<SequenceStep | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // Initialize active sequence if none selected, or switch if deleted
  useEffect(() => {
    // If we have sequences but no selection (or invalid selection), select the first one
    if (sequences.length > 0) {
      const currentExists = sequences.find(s => s.id === activeSequenceId);
      if (!currentExists || !activeSequenceId) {
        setActiveSequenceId(sequences[0].id);
      }
    } else {
      setActiveSequenceId('');
    }
  }, [sequences, activeSequenceId]);

  const activeSequence = sequences.find(s => s.id === activeSequenceId);

  // Configure sensors with activation constraints to prevent accidental drags on click
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Drag only starts after moving 8px
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    
    if (over && active.id !== over.id && activeSequence) {
      const oldIndex = activeSequence.steps.findIndex((s) => s.id === active.id);
      const newIndex = activeSequence.steps.findIndex((s) => s.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderSequenceSteps(activeSequenceId, oldIndex, newIndex);
      }
    }
  };

  const handleSaveStep = () => {
    if (editingStep && activeSequence) {
      const isNew = !activeSequence.steps.find(s => s.id === editingStep.id);
      if (isNew) {
        addSequenceStep(activeSequenceId, editingStep);
      } else {
        updateSequenceStep(activeSequenceId, editingStep.id, editingStep);
      }
      setEditingStep(null);
    }
  };

  const handleAddNewStep = () => {
    setEditingStep({
      id: `new-step-${Date.now()}`,
      channel: 'WhatsApp',
      timeDelay: '1 day',
      content: 'Hi {Name}, ...'
    });
  };

  const handleCreateNewSequence = () => {
    const newId = `seq-${Date.now()}`;
    addSequence({
      id: newId,
      name: 'Untitled Sequence',
      steps: []
    });
    setActiveSequenceId(newId);
    showToast("New sequence created!");
  };

  const handleDeleteSequence = () => {
    if (confirm("Are you sure you want to delete this sequence? This cannot be undone.")) {
      deleteSequence(activeSequenceId);
      // Clear selection; useEffect will handle picking the next one
      setActiveSequenceId('');
      showToast("Sequence deleted.");
    }
  };

  const handleActivateSequence = () => {
    showToast(`${activeSequence?.name} is now active!`);
  };

  const handleUseTemplate = (template: Sequence) => {
    const newId = `seq-copy-${Date.now()}`;
    const newSequence: Sequence = {
      ...template,
      id: newId,
      name: `${template.name} (Copy)`,
      steps: template.steps.map((s, idx) => ({ ...s, id: `${newId}-step-${idx}` })) // Regenerate IDs
    };
    addSequence(newSequence);
    setActiveSequenceId(newId);
    setActiveTab('my-sequences');
    showToast("Template loaded successfully!");
  };

  // Helper to find the active drag item data
  const activeDragStep = activeSequence?.steps.find(s => s.id === activeDragId);
  const activeDragIndex = activeSequence?.steps.findIndex(s => s.id === activeDragId) ?? 0;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-right duration-300 flex items-center gap-2">
          <Check size={16} className="text-green-400 dark:text-green-600" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain dark:text-white">Automation Studio</h1>
          <p className="text-textSub dark:text-gray-400 text-sm mt-1">Design and manage your follow-up workflows.</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
           <button 
             onClick={() => setActiveTab('my-sequences')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'my-sequences' ? 'bg-white dark:bg-gray-700 text-primaryDark shadow-sm' : 'text-textSub dark:text-gray-400 hover:text-textMain'}`}
           >
             <Layout size={16} /> My Sequences
           </button>
           <button 
             onClick={() => setActiveTab('library')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'library' ? 'bg-white dark:bg-gray-700 text-primaryDark shadow-sm' : 'text-textSub dark:text-gray-400 hover:text-textMain'}`}
           >
             <BookOpen size={16} /> Template Guide
           </button>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}

      {activeTab === 'library' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
           {SEQUENCE_TEMPLATES.map((template) => (
             <div key={template.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between hover:border-primary/50 transition-colors shadow-sm">
                <div>
                   <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primaryDark">
                        <BookOpen size={20} />
                      </div>
                      <h3 className="font-bold text-lg text-textMain dark:text-white">{template.name}</h3>
                   </div>
                   <div className="space-y-3 mb-6">
                      {template.steps.slice(0, 3).map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-textSub dark:text-gray-400">
                           <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold shrink-0">{idx + 1}</span>
                           <span className="truncate">{step.channel} • {step.timeDelay}</span>
                        </div>
                      ))}
                      {template.steps.length > 3 && (
                        <p className="text-xs text-textSub pl-7">+ {template.steps.length - 3} more steps</p>
                      )}
                   </div>
                </div>
                <button 
                  onClick={() => handleUseTemplate(template)}
                  className="w-full py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-primary hover:text-gray-900 text-textMain dark:text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 hover:border-transparent"
                >
                  <Copy size={16} /> Use This Template
                </button>
             </div>
           ))}
        </div>
      )}

      {activeTab === 'my-sequences' && (
        <div className="animate-in fade-in duration-300">
          
          {/* Editor Toolbar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
             <div className="flex items-center gap-3 w-full md:w-auto">
               <span className="text-sm font-medium text-textSub dark:text-gray-400 whitespace-nowrap">Editing:</span>
               <select 
                 className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-textMain dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 outline-none w-full md:w-64"
                 value={activeSequenceId}
                 onChange={(e) => setActiveSequenceId(e.target.value)}
                 disabled={sequences.length === 0}
               >
                 {sequences.map(seq => (
                   <option key={seq.id} value={seq.id}>{seq.name}</option>
                 ))}
               </select>
               <button 
                  onClick={handleCreateNewSequence}
                  className="p-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-primary/20 text-textMain dark:text-white rounded-lg transition-colors"
                  title="Create New Sequence"
               >
                 <Plus size={18} />
               </button>
             </div>

             {activeSequenceId && (
               <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <button 
                    onClick={handleDeleteSequence}
                    className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete Sequence"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
                  
                  <button 
                    onClick={handleActivateSequence}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-green-100 dark:hover:bg-green-900/30 text-textMain dark:text-white hover:text-green-700 dark:hover:text-green-400 font-bold rounded-lg transition-colors shadow-sm text-sm"
                  >
                    <PlayCircle size={16} /> Activate
                  </button>

                  <button 
                    onClick={() => showToast("Changes saved successfully!")}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primaryDark text-gray-900 font-bold rounded-lg transition-colors shadow-sm text-sm"
                  >
                    <Check size={16} /> Save Changes
                  </button>
               </div>
             )}
          </div>

          {!activeSequence ? (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
               <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <Layout size={32} />
               </div>
               <h3 className="text-xl font-bold text-textMain dark:text-white mb-2">No Sequence Selected</h3>
               <p className="text-textSub dark:text-gray-400 mb-6 max-w-md mx-auto">Create a new sequence from scratch or choose a template from the guide to get started.</p>
               <div className="flex justify-center gap-4">
                 <button onClick={handleCreateNewSequence} className="px-5 py-2.5 bg-primary text-gray-900 rounded-xl font-bold text-sm hover:bg-primaryDark transition-colors">Create New</button>
                 <button onClick={() => setActiveTab('library')} className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-textMain dark:text-white rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Browse Templates</button>
               </div>
            </div>
          ) : (
            <div className="relative min-h-[400px]">
              {/* Vertical Line */}
              <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-800 z-0"></div>

              {/* Steps List */}
              <div className="space-y-6 relative z-10">
                <DndContext 
                  sensors={sensors} 
                  collisionDetection={closestCenter} 
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={activeSequence.steps.map(s => s.id)} 
                    strategy={verticalListSortingStrategy}
                  >
                    {activeSequence.steps.map((step, index) => (
                      <React.Fragment key={step.id}>
                        {editingStep?.id === step.id ? (
                          // Edit Mode Card (Inline)
                          <div className="flex gap-4 group">
                              <div className="w-12 h-12 rounded-full bg-primary text-gray-900 border-4 border-white dark:border-gray-900 shadow-sm flex items-center justify-center shrink-0 font-bold z-10">
                                {index + 1}
                              </div>
                              <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl border border-primary ring-4 ring-primary/10 shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                    <span className="font-bold text-sm text-textMain dark:text-white">Editing Step {index + 1}</span>
                                    <div className="flex items-center gap-2">
                                      <button onClick={() => setEditingStep(null)} className="p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                                        <X size={16} />
                                      </button>
                                      <button onClick={handleSaveStep} className="p-1.5 text-green-600 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 rounded-lg">
                                        <Check size={16} />
                                      </button>
                                    </div>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                          <label className="block text-xs font-semibold text-textSub dark:text-gray-400 uppercase mb-1">Channel</label>
                                          <select 
                                            className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-textMain dark:text-gray-200"
                                            value={editingStep.channel}
                                            onChange={(e) => setEditingStep({...editingStep, channel: e.target.value as any})}
                                          >
                                            <option value="WhatsApp">WhatsApp</option>
                                            <option value="Email">Email</option>
                                          </select>
                                      </div>
                                      <div>
                                          <label className="block text-xs font-semibold text-textSub dark:text-gray-400 uppercase mb-1">Time Delay</label>
                                          <input 
                                            className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-textMain dark:text-gray-200"
                                            value={editingStep.timeDelay}
                                            onChange={(e) => setEditingStep({...editingStep, timeDelay: e.target.value})}
                                            placeholder="e.g. 2 hours"
                                          />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold text-textSub dark:text-gray-400 uppercase mb-1">Message Content</label>
                                      <textarea 
                                          className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm h-24 focus:ring-2 focus:ring-primary/50 outline-none text-textMain dark:text-gray-200"
                                          value={editingStep.content}
                                          onChange={(e) => setEditingStep({...editingStep, content: e.target.value})}
                                      />
                                    </div>
                                </div>
                              </div>
                          </div>
                        ) : (
                          // View Mode Card
                          <SortableStep 
                            step={step} 
                            index={index} 
                            onEdit={setEditingStep}
                            onDelete={(id) => deleteSequenceStep(activeSequenceId, id)} 
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </SortableContext>
                  
                  {/* Drag Overlay for smooth visual feedback */}
                  <DragOverlay dropAnimation={dropAnimation}>
                    {activeDragStep ? (
                      <StepCard 
                        step={activeDragStep} 
                        index={activeDragIndex} 
                        isOverlay
                      />
                    ) : null}
                  </DragOverlay>
                </DndContext>

                {/* New Step Editor (if appending) */}
                {editingStep && !activeSequence.steps.find(s => s.id === editingStep.id) && (
                    <div className="flex gap-4 group">
                      <div className="w-12 h-12 rounded-full bg-primary text-gray-900 border-4 border-white dark:border-gray-900 shadow-sm flex items-center justify-center shrink-0 font-bold z-10">
                        <Plus size={20} />
                      </div>
                      <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl border border-primary ring-4 ring-primary/10 shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
                          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <span className="font-bold text-sm text-textMain dark:text-white">New Step</span>
                            <div className="flex items-center gap-2">
                              <button onClick={() => setEditingStep(null)} className="p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                                <X size={16} />
                              </button>
                              <button onClick={handleSaveStep} className="p-1.5 text-green-600 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 rounded-lg">
                                <Check size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-semibold text-textSub dark:text-gray-400 uppercase mb-1">Channel</label>
                                  <select 
                                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-textMain dark:text-gray-200"
                                    value={editingStep.channel}
                                    onChange={(e) => setEditingStep({...editingStep, channel: e.target.value as any})}
                                  >
                                    <option value="WhatsApp">WhatsApp</option>
                                    <option value="Email">Email</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-textSub dark:text-gray-400 uppercase mb-1">Time Delay</label>
                                  <input 
                                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-textMain dark:text-gray-200"
                                    value={editingStep.timeDelay}
                                    onChange={(e) => setEditingStep({...editingStep, timeDelay: e.target.value})}
                                    placeholder="e.g. 2 hours"
                                  />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-textSub dark:text-gray-400 uppercase mb-1">Message Content</label>
                                <textarea 
                                  className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm h-24 focus:ring-2 focus:ring-primary/50 outline-none text-textMain dark:text-gray-200"
                                  value={editingStep.content}
                                  onChange={(e) => setEditingStep({...editingStep, content: e.target.value})}
                                />
                            </div>
                          </div>
                      </div>
                    </div>
                )}

                {/* Add Step Button */}
                {!editingStep && (
                  <div className="flex gap-4">
                    <div className="w-12 flex justify-center">
                        <button 
                          onClick={handleAddNewStep}
                          className="w-8 h-8 rounded-full bg-primary hover:bg-primaryDark text-gray-900 flex items-center justify-center shadow-sm transition-colors z-10"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                    <div className="flex-1 py-1">
                        <span className="text-sm font-medium text-textSub dark:text-gray-400 cursor-pointer hover:text-primaryDark" onClick={handleAddNewStep}>
                          Add another step
                        </span>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Sequences;