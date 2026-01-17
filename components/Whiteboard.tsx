import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Download, Share2, Plus, Trash2, Edit2, GripVertical, 
  Paperclip, Layout, ArrowRight, Save, Image as ImageIcon,
  FileText
} from 'lucide-react';
import { 
  DndContext, 
  useDraggable, 
  useDroppable, 
  DragEndEvent,
  DragOverlay,
  closestCenter
} from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStore } from '../store';
import { WhiteboardCard } from '../types';
import { format } from 'date-fns';

// --- Sub-Components ---

const Card: React.FC<{ 
  card: WhiteboardCard; 
  isPresenting: boolean; 
  onDelete: (id: string) => void;
  onEdit: (card: WhiteboardCard) => void;
}> = ({ card, isPresenting, onDelete, onEdit }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700
        shadow-sm hover:shadow-md transition-all group
        ${isPresenting ? '' : 'cursor-grab active:cursor-grabbing'}
      `}
      {...(!isPresenting ? { ...attributes, ...listeners } : {})}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-gray-900 dark:text-white text-sm">{card.title}</h4>
        {!isPresenting && (
          <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
             <button 
               onClick={(e) => { e.stopPropagation(); onEdit(card); }} 
               className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-500 rounded"
               onPointerDown={(e) => e.stopPropagation()}
             >
               <Edit2 size={14} />
             </button>
             <button 
               onClick={(e) => { e.stopPropagation(); onDelete(card.id); }} 
               className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 rounded"
               onPointerDown={(e) => e.stopPropagation()}
             >
               <Trash2 size={14} />
             </button>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">{card.description}</p>
      <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500">
         <span className="flex items-center gap-1">
           <Paperclip size={10} /> {card.attachments.length}
         </span>
         <span>{format(new Date(card.updatedAt), 'MMM d')}</span>
      </div>
    </div>
  );
};

const Column: React.FC<{ 
  id: string; 
  title: string; 
  color: string; 
  cards: WhiteboardCard[]; 
  isPresenting: boolean;
  onAddCard: () => void;
  onDeleteCard: (id: string) => void;
  onEditCard: (card: WhiteboardCard) => void;
}> = ({ id, title, color, cards, isPresenting, onAddCard, onDeleteCard, onEditCard }) => {
  const { setNodeRef } = useDroppable({ id });

  const getColorClasses = (c: string) => {
    switch(c) {
      case 'orange': return 'from-orange-400 to-orange-500';
      case 'purple': return 'from-purple-400 to-purple-500';
      case 'blue': return 'from-blue-400 to-blue-500';
      case 'green': return 'from-green-400 to-green-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div ref={setNodeRef} className="flex-shrink-0 w-80 flex flex-col h-full bg-white/40 dark:bg-gray-900/40 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-white/5 shadow-xl print:border-gray-200 print:shadow-none print:break-inside-avoid">
       <div className={`p-4 rounded-t-2xl bg-gradient-to-r ${getColorClasses(color)} text-white flex justify-between items-center print:bg-gray-100 print:text-black`}>
         <h3 className="font-bold">{title}</h3>
         <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-medium">{cards.length}</span>
       </div>
       
       <div className="flex-1 overflow-y-auto p-3 space-y-3">
         <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {cards.map(card => (
              <Card 
                key={card.id} 
                card={card} 
                isPresenting={isPresenting} 
                onDelete={onDeleteCard}
                onEdit={onEditCard} 
              />
            ))}
         </SortableContext>
       </div>

       {!isPresenting && (
         <div className="p-3 pt-0 print:hidden">
            <button onClick={onAddCard} className="w-full py-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-500 hover:border-orange-400 hover:text-orange-500 dark:hover:border-green-500 dark:hover:text-green-500 transition-colors flex items-center justify-center gap-2 font-medium text-sm">
               <Plus size={16} /> Add Card
            </button>
         </div>
       )}
    </div>
  );
};

// --- Edit Card Modal ---

const CardEditModal: React.FC<{
  card: WhiteboardCard;
  onClose: () => void;
  onSave: (updatedCard: WhiteboardCard) => void;
}> = ({ card, onClose, onSave }) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [attachments, setAttachments] = useState<string[]>(card.attachments);

  const handleAddAttachment = () => {
    // Mock attachment upload
    const mockFiles = [
      'project_brief.pdf', 'design_v1.png', 'contract_draft.docx', 'meeting_notes.txt'
    ];
    const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    setAttachments([...attachments, randomFile]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave({
      ...card,
      title,
      description,
      attachments,
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Edit Card</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Title</label>
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none h-32 resize-none"
            />
          </div>

          <div>
             <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase">Attachments</label>
                <button 
                  onClick={handleAddAttachment}
                  className="text-xs flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium"
                >
                  <Plus size={12} /> Add File
                </button>
             </div>
             <div className="space-y-2">
                {attachments.length === 0 && (
                  <p className="text-sm text-gray-400 italic">No attachments yet.</p>
                )}
                {attachments.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 overflow-hidden">
                       {file.endsWith('.png') ? <ImageIcon size={14} className="text-blue-500" /> : <FileText size={14} className="text-gray-500" />}
                       <span className="text-sm truncate text-gray-700 dark:text-gray-300">{file}</span>
                    </div>
                    <button onClick={() => removeAttachment(i)} className="text-red-400 hover:text-red-500">
                       <Trash2 size={14} />
                    </button>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-2">
           <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
           <button onClick={handleSave} className="px-4 py-2 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors flex items-center gap-2">
             <Save size={16} /> Save Changes
           </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Workspace ---

const WhiteboardWorkspace: React.FC = () => {
  const { 
    whiteboards, 
    activeWhiteboardLeadId, 
    setActiveWhiteboardLeadId, 
    setWhiteboardCards, 
    leads 
  } = useStore();
  
  const [isPresenting, setIsPresenting] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<WhiteboardCard | null>(null);

  if (!activeWhiteboardLeadId) return null;

  const lead = leads.find(l => l.id === activeWhiteboardLeadId);
  const cards = whiteboards[activeWhiteboardLeadId] || [];

  const columns = [
    { id: 'todo', title: 'To Do', color: 'orange' },
    { id: 'in_progress', title: 'In Progress', color: 'purple' },
    { id: 'review', title: 'Review', color: 'blue' },
    { id: 'done', title: 'Done', color: 'green' },
  ];

  const handleDragStart = (event: any) => setActiveId(event.active.id);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) return;

    const cardId = active.id as string;
    const overId = over.id as string;

    const movedCard = cards.find(c => c.id === cardId);
    if (!movedCard) return;

    let newCards = [...cards];
    const isOverColumn = columns.some(col => col.id === overId);

    if (isOverColumn) {
       if (movedCard.column !== overId) {
         newCards = newCards.map(c => c.id === cardId ? { ...c, column: overId as any } : c);
       }
    } else {
       const targetCard = cards.find(c => c.id === overId);
       if (targetCard && movedCard.column !== targetCard.column) {
         newCards = newCards.map(c => c.id === cardId ? { ...c, column: targetCard.column } : c);
       }
    }
    
    setWhiteboardCards(activeWhiteboardLeadId, newCards);
  };

  const handleAddCard = (columnId: string) => {
    const newCard: WhiteboardCard = {
      id: `card-${Date.now()}`,
      title: 'New Task',
      description: 'Click edit to add details...',
      column: columnId as any,
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setWhiteboardCards(activeWhiteboardLeadId, [...cards, newCard]);
  };

  const handleDeleteCard = (cardId: string) => {
    setWhiteboardCards(activeWhiteboardLeadId, cards.filter(c => c.id !== cardId));
  };

  const handleEditCard = (card: WhiteboardCard) => {
    setEditingCard(card);
  };

  const handleSaveCard = (updatedCard: WhiteboardCard) => {
    setWhiteboardCards(
      activeWhiteboardLeadId, 
      cards.map(c => c.id === updatedCard.id ? updatedCard : c)
    );
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-100 via-orange-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-black animate-in fade-in flex flex-col print:absolute print:bg-white print:z-[9999]">
      
      {/* Header */}
      <div className="bg-white/80 dark:bg-black/60 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 p-4 flex justify-between items-center shadow-sm print:hidden">
         <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
              Whiteboard - {lead?.name}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Collaborative Workspace</p>
         </div>
         <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsPresenting(!isPresenting)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${isPresenting ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}
            >
               {isPresenting ? <><Layout size={18} /> Presenting</> : <><Layout size={18} /> Present Mode</>}
            </button>
            <button 
              onClick={handleExportPDF}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
              title="Export to PDF"
            >
              <Download size={20} />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"><Share2 size={20} /></button>
            <button onClick={() => setActiveWhiteboardLeadId(null)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-colors"><X size={24} /></button>
         </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block p-8 border-b border-gray-200">
         <h1 className="text-3xl font-bold text-black mb-2">Project Whiteboard</h1>
         <p className="text-gray-600">Client: {lead?.name} | Generated: {format(new Date(), 'MMM d, yyyy')}</p>
      </div>

      {/* Board */}
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 print:overflow-visible print:h-auto print:block">
           <div className="flex gap-6 h-full min-w-max print:flex-wrap print:gap-8 print:h-auto">
              {columns.map(col => (
                <Column 
                  key={col.id} 
                  {...col} 
                  cards={cards.filter(c => c.column === col.id)} 
                  isPresenting={isPresenting}
                  onAddCard={() => handleAddCard(col.id)}
                  onDeleteCard={handleDeleteCard}
                  onEditCard={handleEditCard}
                />
              ))}
           </div>
        </div>
        <DragOverlay>
           {activeId ? (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-orange-400 shadow-2xl rotate-3 opacity-90 cursor-grabbing w-72">
                 <h4 className="font-bold text-gray-900 dark:text-white">Moving Card...</h4>
              </div>
           ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modals */}
      {editingCard && (
        <CardEditModal 
          card={editingCard} 
          onClose={() => setEditingCard(null)} 
          onSave={handleSaveCard} 
        />
      )}

    </div>
  );
};

export default WhiteboardWorkspace;