import React, { useRef, useState } from 'react';
import { Phone, Mail, MessageCircle, Clock, Flame, Layout } from 'lucide-react';
import { Lead, LeadPriority } from '../types';
import { useStore } from '../store';

interface LeadCardProps {
  lead: Lead;
  compact?: boolean;
  style?: React.CSSProperties;
  // Capture drag props
  [key: string]: any; 
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, compact = false, style, ...props }) => {
  const { setSelectedLeadId, setActiveWhiteboardLeadId } = useStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const getPriorityBadge = (p: LeadPriority) => {
    switch (p) {
      case LeadPriority.HOT: 
        return (
          <span className="relative inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-900/50">
             <span className="absolute inset-0 rounded-full bg-red-400 animate-ping-slow opacity-20"></span>
             <Flame size={10} className="relative z-10" />
             <span className="relative z-10">{p}</span>
          </span>
        );
      case LeadPriority.WARM: 
        return (
          <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900/50 text-xs font-medium">
             {p}
          </span>
        );
      default: 
        return (
          <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 text-xs font-medium">
             {p}
          </span>
        );
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Only apply magnetic effect on desktop and if not dragging
    if (!cardRef.current || props.isDragging) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Constrain movement to small radius
    const distance = Math.sqrt(x * x + y * y);
    const maxDistance = 5;
    
    if (distance < maxDistance) {
      setPosition({ x, y });
    } else {
      const angle = Math.atan2(y, x);
      setPosition({
        x: Math.cos(angle) * maxDistance,
        y: Math.sin(angle) * maxDistance
      });
    }
  };
  
  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const handleClick = (e: React.MouseEvent) => {
    setSelectedLeadId(lead.id);
  };

  const handleOpenWhiteboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveWhiteboardLeadId(lead.id);
  };

  // Combine transforms
  const combinedStyle = {
    ...style,
    transform: `${style?.transform || ''} translate(${position.x}px, ${position.y}px)`,
    transition: style?.transition || 'transform 0.2s ease-out, box-shadow 0.2s ease'
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative group bg-white dark:bg-[#0A0A0A] p-4 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-lg dark:hover:shadow-green-900/10 hover:border-primary/30 dark:hover:border-green-500/30 transition-all cursor-pointer select-none overflow-hidden ${compact ? 'min-w-[280px]' : 'w-full'}`}
      style={combinedStyle}
      onClick={handleClick}
      {...props}
    >
      {/* Drag Shimmer Overlay */}
      {style?.transform && ( // Crude check for dragging state via transform prop presence from dnd-kit
        <div className="absolute inset-0 animate-shimmer pointer-events-none z-20 opacity-30" />
      )}

      <div className="flex justify-between items-start mb-3 relative z-10">
        {getPriorityBadge(lead.priority)}
        <span className="text-[10px] text-textSub dark:text-gray-500 flex items-center gap-1 font-medium bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-md">
          <Clock size={10} /> {lead.createdAt}
        </span>
      </div>
      
      <h3 className="font-bold text-textMain dark:text-gray-100 text-base mb-1 group-hover:text-primaryDark dark:group-hover:text-green-400 transition-colors relative z-10">{lead.name}</h3>
      <p className="text-sm text-textSub dark:text-gray-400 mb-4 relative z-10">{lead.service}</p>

      {!compact && (
        <div className="flex items-center gap-2 mb-4 text-xs text-textSub dark:text-gray-400 bg-gray-50/80 dark:bg-white/5 p-2.5 rounded-lg border border-gray-100 dark:border-white/5 relative z-10">
           <span className="font-semibold text-textMain dark:text-gray-200">Last:</span> {lead.lastActivity}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-white/5 relative z-10">
        <div className="flex gap-1.5">
           <button 
             className="p-1.5 rounded-lg hover:bg-green-100 text-gray-400 hover:text-green-600 dark:hover:bg-green-900/30 dark:hover:text-green-400 transition-all hover:scale-110" 
             title="WhatsApp"
             onPointerDown={(e) => e.stopPropagation()} 
           >
             <MessageCircle size={16} />
           </button>
           <button 
             className="p-1.5 rounded-lg hover:bg-blue-100 text-gray-400 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-all hover:scale-110" 
             title="Call"
             onPointerDown={(e) => e.stopPropagation()}
           >
             <Phone size={16} />
           </button>
           <button 
             className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-all hover:scale-110" 
             title="Email"
             onPointerDown={(e) => e.stopPropagation()}
           >
             <Mail size={16} />
           </button>
           <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1 self-center"></div>
           <button 
             onClick={handleOpenWhiteboard}
             className="p-1.5 rounded-lg hover:bg-purple-100 text-purple-400 hover:text-purple-600 dark:hover:bg-purple-900/30 dark:hover:text-purple-400 transition-all hover:scale-110" 
             title="Whiteboard"
             onPointerDown={(e) => e.stopPropagation()}
           >
             <Layout size={16} />
           </button>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-[10px] font-bold text-indigo-700 dark:text-indigo-300 shadow-sm">
                {lead.assignedTo.split(' ')[1]?.[0] || 'A'}
            </div>
        </div>
      </div>
    </div>
  );
};

export default LeadCard;