import React, { useState } from 'react';
import { PIPELINE_COLUMNS } from '../constants';
import { LeadStatus, Lead, LeadPriority } from '../types';
import LeadCard from './LeadCard';
import { Search, Filter, Plus, ChevronDown, MousePointer2 } from 'lucide-react';
import { useStore } from '../store';
import { 
  DndContext, 
  useDraggable, 
  useDroppable, 
  DragEndEvent, 
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation
} from '@dnd-kit/core';

interface DraggableLeadCardProps {
  lead: Lead;
}

// Draggable Lead Card Wrapper (The item remaining in the list)
const DraggableLeadCard: React.FC<DraggableLeadCardProps> = ({ lead }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
  });

  // When dragging, we reduce opacity of the original item to act as a placeholder.
  // We do NOT apply transform here because the DragOverlay handles the moving visual.
  const style: React.CSSProperties = {
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <LeadCard 
        lead={lead} 
        compact 
      />
    </div>
  );
};

interface DroppableColumnProps {
  status: string;
  children: React.ReactNode;
}

// Droppable Column Wrapper
const DroppableColumn: React.FC<DroppableColumnProps> = ({ status, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const isWon = status === LeadStatus.WON;
  const isLost = status === LeadStatus.LOST;

  return (
    <div 
      ref={setNodeRef} 
      className={`w-[300px] flex flex-col h-full rounded-xl transition-colors ${isOver ? 'bg-primary/10 ring-2 ring-primary/50' : ''}`}
    >
      {/* Column Header */}
      <div className={`mb-3 flex justify-between items-center px-2 py-2 rounded-lg ${
        isWon ? 'bg-success/20 dark:bg-green-900/30' : 
        isLost ? 'bg-gray-200 dark:bg-gray-800' : 
        'bg-white dark:bg-gray-900'
      }`}>
        <h3 className="font-semibold text-textMain dark:text-gray-200 text-sm uppercase tracking-wide">{status}</h3>
        <span className="bg-white/50 dark:bg-gray-800/50 px-2 py-0.5 rounded-md text-xs font-bold text-gray-600 dark:text-gray-300">
           {React.Children.count(children) - (status === LeadStatus.NEW ? 1 : 0)}
        </span>
      </div>

      {/* Column Body - Added hide-scrollbar class */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 pb-20 hide-scrollbar">
        {children}
      </div>
    </div>
  );
};

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

const Pipeline: React.FC = () => {
  const { 
    leads, 
    searchQuery, 
    setSearchQuery, 
    updateLead, 
    setAddLeadModalOpen,
    setEditingLeadId 
  } = useStore();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter Logic
  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'All' || l.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const getLeadsByStatus = (status: LeadStatus) => {
    return filteredLeads.filter(l => l.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
       // If dropped over a column (the over.id is the status string)
       const newStatus = over.id as LeadStatus;
       updateLead(active.id as string, { status: newStatus });
    }
  };

  const handleAddNewLead = () => {
    setEditingLeadId(null);
    setAddLeadModalOpen(true);
  };

  const activeLead = activeId ? leads.find(l => l.id === activeId) : null;

  return (
    <div className="h-full flex flex-col p-4 md:p-8 max-w-[1600px] mx-auto overflow-hidden">
      
      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
           <h1 className="text-2xl font-bold text-textMain dark:text-white">Pipeline</h1>
           <p className="text-xs text-textSub dark:text-gray-400 mt-1 flex items-center gap-1">
             <MousePointer2 size={12} /> Press Shift + Scroll to navigate horizontally
           </p>
        </div>
        
        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm w-full md:w-auto z-20">
          <div className="flex items-center gap-2 px-3 flex-1">
             <Search size={18} className="text-gray-400" />
             <input 
              type="text" 
              placeholder="Search leads..." 
              className="bg-transparent border-none outline-none text-sm w-full py-2 text-textMain dark:text-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
          
          {/* Functional Filter Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 ${filterPriority !== 'All' ? 'text-primaryDark' : 'text-textSub dark:text-gray-400'}`}
            >
              <Filter size={16} /> 
              {filterPriority === 'All' ? 'Filter' : filterPriority}
              <ChevronDown size={14} />
            </button>

            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)}></div>
                <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="py-1">
                    {['All', ...Object.values(LeadPriority)].map((p) => (
                        <button
                            key={p}
                            onClick={() => { setFilterPriority(p); setIsFilterOpen(false); }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${filterPriority === p ? 'text-primaryDark font-bold bg-orange-50 dark:bg-gray-800/50' : 'text-textMain dark:text-gray-300'}`}
                        >
                            {p}
                        </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Container with DnD */}
      <DndContext 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-hidden hide-scrollbar">
          <div className="flex gap-4 h-full min-w-max pb-4 px-2">
            {PIPELINE_COLUMNS.map((column) => {
              const leadsInColumn = getLeadsByStatus(column as LeadStatus);
              
              return (
                <DroppableColumn key={column} status={column}>
                  {leadsInColumn.map(lead => (
                    <DraggableLeadCard key={lead.id} lead={lead} />
                  ))}
                  
                  {column === LeadStatus.NEW && (
                    <button 
                      onClick={handleAddNewLead}
                      className="w-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-3 text-textSub dark:text-gray-500 text-sm hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={16} /> Add Lead
                    </button>
                  )}
                </DroppableColumn>
              );
            })}
          </div>
        </div>

        {/* Drag Overlay ensures the dragged item is always on top (z-index) and visible */}
        <DragOverlay dropAnimation={dropAnimation}>
           {activeLead ? (
              <div className="w-[280px] transform rotate-3 cursor-grabbing shadow-2xl">
                 <LeadCard lead={activeLead} compact style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }} />
              </div>
           ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default Pipeline;