import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  MessageCircle, Phone, Mail, CheckCircle2, AlertCircle, Plus,
  Filter
} from 'lucide-react';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameMonth, isToday, isSameDay, addMonths, subMonths,
  setMonth, setYear, startOfYear, endOfYear, eachMonthOfInterval,
  startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, subDays,
  getHours, getMinutes
} from 'date-fns';
import { useStore } from '../store';
import { CalendarActivity, LeadPriority } from '../types';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

// --- Helper Functions ---

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'created': return <Plus size={16} />;
    case 'updated': return <CheckCircle2 size={16} />;
    case 'deleted': return <AlertCircle size={16} />;
    case 'status_change': return <CheckCircle2 size={16} />;
    case 'call': return <Phone size={16} />;
    case 'email': return <Mail size={16} />;
    case 'whatsapp': return <MessageCircle size={16} />;
    default: return <CheckCircle2 size={16} />;
  }
};

const getPriorityBg = (priority: string) => {
  switch (priority) {
    case 'Hot': return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50';
    case 'Warm': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/50';
    default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700';
  }
};

const getActivityColor = (type: string): string => {
  const colors: Record<string, string> = {
    created: 'bg-green-500',
    updated: 'bg-blue-500',
    deleted: 'bg-red-500',
    status_change: 'bg-purple-500',
    call: 'bg-yellow-500',
    email: 'bg-indigo-500',
    whatsapp: 'bg-green-600'
  };
  return colors[type] || 'bg-gray-500';
};

// --- Sub-components ---

const CalendarHeader: React.FC<{
  currentDate: Date;
  view: 'day' | 'week' | 'month' | 'year' | 'agenda';
  onViewChange: (v: 'day' | 'week' | 'month' | 'year' | 'agenda') => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  selectedRange: DateRange;
  onClearRange: () => void;
}> = React.memo(({ currentDate, view, onViewChange, onPrevious, onNext, onToday, selectedRange, onClearRange }) => {
  
  const getHeaderText = () => {
    switch (view) {
      case 'year': return format(currentDate, 'yyyy');
      case 'month': return format(currentDate, 'MMMM yyyy');
      case 'week': {
        const start = startOfWeek(currentDate);
        const end = endOfWeek(currentDate);
        if (isSameMonth(start, end)) {
          return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
        }
        return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
      }
      case 'day': return format(currentDate, 'EEEE, MMM d, yyyy');
      case 'agenda': return 'Agenda';
      default: return format(currentDate, 'MMMM yyyy');
    }
  };

  return (
    <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border-b border-gray-200 dark:border-green-500/10 p-4 md:p-6 flex flex-col xl:flex-row items-center justify-between gap-4 shrink-0 z-20 relative">
      
      <div className="flex items-center gap-2 md:gap-4 w-full xl:w-auto justify-between xl:justify-start">
        <div className="flex items-center gap-1">
          <button 
            onClick={onPrevious} 
            className="p-2 rounded-lg hover:bg-orange-100 dark:hover:bg-green-900/20 text-textMain dark:text-white transition-all group"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
          </button>

          <h2 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-orange-600 via-purple-600 to-green-600 bg-clip-text text-transparent min-w-[200px] md:min-w-[280px] text-center select-none truncate px-2">
            {getHeaderText()}
          </h2>

          <button 
            onClick={onNext} 
            className="p-2 rounded-lg hover:bg-orange-100 dark:hover:bg-green-900/20 text-textMain dark:text-white transition-all group"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        <button onClick={onToday} className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded-lg bg-orange-500 dark:bg-green-600 text-white hover:bg-orange-600 dark:hover:bg-green-500 hover:scale-105 active:scale-95 transition-all font-medium shadow-lg shadow-orange-500/30 dark:shadow-green-500/30">
          Today
        </button>
      </div>

      <div className="flex w-full xl:w-auto items-center justify-between gap-4 overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 shrink-0">
          {['day', 'week', 'month', 'year', 'agenda'].map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v as any)}
              className={`px-3 py-1.5 md:px-4 md:py-2 text-sm rounded-md capitalize font-medium transition-all duration-200 ${
                view === v 
                  ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-green-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-green-400'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {selectedRange.start && (
          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg animate-in fade-in shrink-0">
            <CalendarIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="font-medium text-purple-900 dark:text-purple-300 text-sm">
              {format(selectedRange.start, 'MMM d')}
              {selectedRange.end && ` - ${format(selectedRange.end, 'MMM d, yyyy')}`}
            </span>
            <button onClick={onClearRange} className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200">
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

const CalendarDay: React.FC<{
  date: Date;
  activities: CalendarActivity[];
  isToday: boolean;
  isSelected: boolean;
  isHovered: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isCurrentMonth: boolean;
  onClick: () => void;
  onHover: () => void;
}> = React.memo(({ date, activities, isToday, isSelected, isHovered, isRangeStart, isRangeEnd, isCurrentMonth, onClick, onHover }) => {
  const hotCount = activities.filter(a => a.priority === 'Hot').length;
  const warmCount = activities.filter(a => a.priority === 'Warm').length;
  const totalCount = activities.length;

  return (
    <div
      onClick={onClick}
      onMouseEnter={onHover}
      className={`
        relative p-1 md:p-2 border border-gray-100 dark:border-white/5
        cursor-pointer transition-all duration-200 group flex flex-col
        hover:bg-orange-50 dark:hover:bg-green-900/10
        hover:z-10 min-h-[60px] md:min-h-0
        ${isSelected ? 'bg-purple-50 dark:bg-purple-900/20' : ''}
        ${isHovered ? 'ring-2 ring-orange-400 dark:ring-green-500 z-10' : ''}
        ${isRangeStart || isRangeEnd ? 'ring-2 ring-purple-500 z-10' : ''}
        ${!isCurrentMonth ? 'bg-gray-50/50 dark:bg-black/40 opacity-60' : ''}
      `}
      role="gridcell"
      aria-label={`${format(date, 'PPPP')}, ${totalCount} activities`}
    >
      <div className={`
        text-xs md:text-sm font-medium mb-1 md:mb-2 w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full transition-all
        ${isToday 
          ? 'bg-orange-500 dark:bg-green-500 text-white font-bold shadow-lg shadow-orange-500/30 dark:shadow-green-500/30' 
          : isCurrentMonth ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'
        }
      `}>
        {format(date, 'd')}
      </div>

      {totalCount > 0 && (
        <div className="space-y-0.5 md:space-y-1 flex-1 overflow-hidden">
           {hotCount > 0 && (
            <div className="hidden md:flex items-center gap-1 text-[10px] text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded-full w-fit">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="font-bold">{hotCount} Hot</span>
            </div>
           )}
           
           {/* Mobile Dot Indicators */}
           <div className="md:hidden flex gap-0.5 flex-wrap">
             {hotCount > 0 && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
             {warmCount > 0 && <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
             {!hotCount && !warmCount && totalCount > 0 && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
           </div>

           {/* Desktop Activities */}
           <div className="hidden md:flex gap-1 flex-wrap content-start mt-1">
             {activities.slice(0, 5).map((a, i) => (
               <div key={i} className={`w-1.5 h-1.5 rounded-full ${getActivityColor(a.type)}`} />
             ))}
             {activities.length > 5 && <span className="text-[9px] text-gray-400">+{activities.length - 5}</span>}
           </div>
        </div>
      )}

      {/* Hover Tooltip */}
      <div className="absolute left-full top-0 ml-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 w-64 hidden md:block">
        <div className="bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 rounded-xl p-3 shadow-2xl border border-gray-700">
          <p className="font-bold mb-2 text-sm">{format(date, 'MMMM d, yyyy')}</p>
          {activities.length > 0 ? (
            <div className="space-y-2 text-xs">
              {activities.slice(0, 5).map((activity, i) => (
                <div key={i} className="flex items-start gap-2">
                   <div className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${getActivityColor(activity.type)}`} />
                   <div>
                     <span className="font-semibold block">{activity.leadName}</span>
                     <span className="opacity-70 capitalize">{activity.type.replace('_', ' ')}</span>
                   </div>
                </div>
              ))}
              {activities.length > 5 && <p className="opacity-70 pt-1">+{activities.length - 5} more activities</p>}
            </div>
          ) : (
            <p className="text-xs opacity-70">No activities recorded</p>
          )}
        </div>
      </div>
    </div>
  );
}, (prev, next) => {
  return (
    prev.date.getTime() === next.date.getTime() &&
    prev.isToday === next.isToday &&
    prev.isSelected === next.isSelected &&
    prev.isHovered === next.isHovered &&
    prev.isRangeStart === next.isRangeStart &&
    prev.isRangeEnd === next.isRangeEnd &&
    prev.isCurrentMonth === next.isCurrentMonth &&
    prev.activities === next.activities // Reference equality check
  );
});

const MiniMonth: React.FC<{ 
  monthDate: Date; 
  activities: CalendarActivity[]; 
  onClick: () => void 
}> = React.memo(({ monthDate, activities, onClick }) => {
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);
  const days = eachDayOfInterval({ start, end });
  const startDay = start.getDay();

  return (
    <div 
      onClick={onClick} 
      className="p-4 bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-white/5 hover:border-orange-300 dark:hover:border-green-500/50 hover:shadow-lg transition-all cursor-pointer group"
    >
      <h4 className="font-bold text-center mb-3 text-textMain dark:text-white group-hover:text-orange-600 dark:group-hover:text-green-400 transition-colors">
        {format(monthDate, 'MMMM')}
      </h4>
      <div className="grid grid-cols-7 gap-1 text-[10px] text-center mb-1">
        {['S','M','T','W','T','F','S'].map(d => (
          <div key={d} className="text-gray-400 font-medium">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array(startDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
        {days.map(d => {
          // Optimized local lookup could be done here if needed, but for year view simple filter is usually okay given small N
          const dayActivities = activities.filter(a => isSameDay(new Date(a.date), d));
          const hasHot = dayActivities.some(a => a.priority === 'Hot');
          const count = dayActivities.length;
          const isTodayDate = isToday(d);

          return (
            <div 
              key={d.toISOString()} 
              className={`
                aspect-square rounded-full flex items-center justify-center text-[10px] font-medium
                ${isTodayDate ? 'bg-orange-500 dark:bg-green-500 text-white' : 'text-gray-700 dark:text-gray-300'}
                ${!isTodayDate && hasHot ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' : ''}
                ${!isTodayDate && !hasHot && count > 0 ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : ''}
              `}
            >
              {format(d, 'd')}
            </div>
          );
        })}
      </div>
    </div>
  );
});

// --- Time Grid Components ---

const TimeGridActivity: React.FC<{
  activity: CalendarActivity;
  style: React.CSSProperties;
  onClick: (leadId: string) => void;
}> = React.memo(({ activity, style, onClick }) => {
  return (
    <div 
      style={style}
      onClick={(e) => { e.stopPropagation(); onClick(activity.leadId); }}
      className={`absolute left-0 right-1 rounded border p-1 text-[10px] overflow-hidden hover:z-20 hover:scale-[1.02] transition-all cursor-pointer shadow-sm ${getPriorityBg(activity.priority)}`}
      title={`${activity.leadName} - ${activity.type}`}
    >
      <div className="flex items-center gap-1 mb-0.5">
         <span className={`p-0.5 rounded-full bg-white/50`}>{getActivityIcon(activity.type)}</span>
         <span className="font-bold truncate">{format(new Date(activity.date), 'h:mm a')}</span>
      </div>
      <div className="font-semibold truncate">{activity.leadName}</div>
      <div className="opacity-80 truncate capitalize">{activity.type.replace('_', ' ')}</div>
    </div>
  );
});

const TimeGridView: React.FC<{
  currentDate: Date;
  view: 'week' | 'day';
  activities: CalendarActivity[];
  onActivityClick: (leadId: string) => void;
}> = ({ currentDate, view, activities, onActivityClick }) => {
  const start = view === 'week' ? startOfWeek(currentDate) : currentDate;
  const end = view === 'week' ? endOfWeek(currentDate) : currentDate;
  const days = eachDayOfInterval({ start, end });
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Ref for scrolling to 8 AM
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 480;
    }
  }, [view]);

  return (
    <div className="h-full flex flex-col bg-white/60 dark:bg-black/20 backdrop-blur-lg rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl overflow-hidden animate-in fade-in duration-500">
      <div className="flex border-b border-gray-200 dark:border-white/5 flex-none bg-gray-50/50 dark:bg-gray-900/50">
        <div className="w-16 flex-none border-r border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5" />
        <div className={`flex-1 grid ${view === 'week' ? 'grid-cols-7' : 'grid-cols-1'}`}>
           {days.map(day => (
             <div key={day.toISOString()} className={`p-2 text-center border-r border-gray-100 dark:border-white/5 last:border-0 ${isToday(day) ? 'bg-orange-50/50 dark:bg-green-900/10' : ''}`}>
               <div className={`text-xs uppercase font-semibold ${isToday(day) ? 'text-orange-600 dark:text-green-500' : 'text-gray-500 dark:text-gray-400'}`}>
                 {format(day, 'EEE')}
               </div>
               <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-lg font-bold mt-1 ${isToday(day) ? 'bg-orange-500 dark:bg-green-500 text-white' : 'text-gray-900 dark:text-white'}`}>
                 {format(day, 'd')}
               </div>
             </div>
           ))}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto relative hide-scrollbar">
        <div className="flex relative min-h-[1440px]">
           <div className="w-16 flex-none border-r border-gray-200 dark:border-white/5 bg-gray-50/30 dark:bg-white/5 text-xs text-gray-500 dark:text-gray-400 font-medium select-none">
             {hours.map(hour => (
               <div key={hour} className="h-[60px] border-b border-gray-100 dark:border-white/5 relative">
                 <span className="absolute -top-2.5 right-2">{hour === 0 ? '12 AM' : format(new Date().setHours(hour, 0), 'h a').toUpperCase()}</span>
               </div>
             ))}
           </div>

           <div className={`flex-1 grid ${view === 'week' ? 'grid-cols-7' : 'grid-cols-1'} relative`}>
              <div className="absolute inset-0 z-0 pointer-events-none">
                 {hours.map(hour => (
                   <div key={`line-${hour}`} className="h-[60px] border-b border-gray-100 dark:border-white/5" />
                 ))}
              </div>

              {days.map(day => {
                const dayActivities = activities.filter(a => isSameDay(new Date(a.date), day));
                
                return (
                  <div key={day.toISOString()} className={`relative h-full border-r border-gray-100 dark:border-white/5 last:border-0 ${isToday(day) ? 'bg-orange-50/10 dark:bg-green-900/5' : ''}`}>
                     {dayActivities.map(activity => {
                       const date = new Date(activity.date);
                       const startHour = getHours(date);
                       const startMin = getMinutes(date);
                       const top = startHour * 60 + startMin;
                       
                       return (
                         <TimeGridActivity 
                           key={activity.id} 
                           activity={activity} 
                           onClick={onActivityClick}
                           style={{
                             top: `${top}px`, 
                             height: '55px'
                           }} 
                         />
                       );
                     })}
                  </div>
                );
              })}
           </div>
        </div>
      </div>
    </div>
  );
};

// Memoized MonthView to prevent massive re-renders on every tick
const MonthView: React.FC<{
  currentDate: Date;
  activitiesMap: Record<string, CalendarActivity[]>; // Optimized O(1) Lookup
  selectedRange: DateRange;
  hoveredDate: Date | null;
  onDateClick: (d: Date) => void;
  onDateHover: (d: Date | null) => void;
}> = React.memo(({ currentDate, activitiesMap, selectedRange, hoveredDate, onDateClick, onDateHover }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const allDays = useMemo(() => eachDayOfInterval({ start: startDate, end: endDate }), [startDate, endDate]);

  return (
    <div className="h-full flex flex-col bg-white/60 dark:bg-black/20 backdrop-blur-lg rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl overflow-hidden animate-in fade-in duration-500">
      <div className="grid grid-cols-7 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5 flex-none">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 text-center font-semibold text-xs md:text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {allDays.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          // O(1) Lookup instead of O(N) Filter
          const dayActivities = activitiesMap[dateKey] || [];
          
          const isSelected = !!(selectedRange.start && selectedRange.end && day >= selectedRange.start && day <= selectedRange.end);
          const isHovered = !!(hoveredDate && isSameDay(day, hoveredDate));
          const isRangeStart = !!(selectedRange.start && isSameDay(day, selectedRange.start));
          const isRangeEnd = !!(selectedRange.end && isSameDay(day, selectedRange.end));
          const isCurrentMonth = isSameMonth(day, currentDate);

          return (
            <CalendarDay
              key={day.toISOString()}
              date={day}
              activities={dayActivities}
              isToday={isToday(day)}
              isSelected={isSelected}
              isHovered={isHovered}
              isRangeStart={isRangeStart}
              isRangeEnd={isRangeEnd}
              isCurrentMonth={isCurrentMonth}
              onClick={() => onDateClick(day)}
              onHover={() => onDateHover(day)}
            />
          );
        })}
      </div>
    </div>
  );
});

const YearView: React.FC<{
  currentDate: Date;
  activities: CalendarActivity[];
  onMonthSelect: (date: Date) => void;
}> = React.memo(({ currentDate, activities, onMonthSelect }) => {
  const months = useMemo(() => eachMonthOfInterval({
    start: startOfYear(currentDate),
    end: endOfYear(currentDate)
  }), [currentDate]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in zoom-in-95 duration-500 pb-20 p-4">
      {months.map((month) => (
        <MiniMonth
          key={month.toISOString()}
          monthDate={month}
          activities={activities.filter(a => isSameMonth(new Date(a.date), month))}
          onClick={() => onMonthSelect(month)}
        />
      ))}
    </div>
  );
});

const AgendaView: React.FC<{ 
  activities: CalendarActivity[];
  onActivityClick: (leadId: string) => void; 
}> = ({ activities, onActivityClick }) => {
  
  const grouped = useMemo(() => {
    return activities.reduce((acc, activity) => {
      const key = format(new Date(activity.date), 'yyyy-MM-dd');
      if (!acc[key]) acc[key] = [];
      acc[key].push(activity);
      return acc;
    }, {} as Record<string, CalendarActivity[]>);
  }, [activities]);

  const sortedKeys = Object.keys(grouped).sort().reverse();

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 p-4 md:p-8">
      {/* Hot Leads Filter Notification */}
      <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
         <Filter size={14} />
         <span>Pro Tip: Hot leads are highlighted. Click any card to open the lead pipeline details.</span>
      </div>

      {sortedKeys.map(dateKey => {
        // Sort within day: Hot first, then by time
        const sortedDayActivities = [...grouped[dateKey]].sort((a, b) => {
           if (a.priority === 'Hot' && b.priority !== 'Hot') return -1;
           if (a.priority !== 'Hot' && b.priority === 'Hot') return 1;
           return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        return (
          <div key={dateKey} className="animate-in slide-in-from-bottom-2 duration-500">
             <div className="flex items-center gap-4 mb-6">
               <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{format(new Date(dateKey), 'EEEE')}</span>
                  <h3 className="text-2xl font-bold text-textMain dark:text-white">{format(new Date(dateKey), 'MMMM d, yyyy')}</h3>
               </div>
               <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800"></div>
               <span className="text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-3 py-1 rounded-full">{grouped[dateKey].length} Events</span>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {sortedDayActivities.map(activity => (
                 <div 
                   key={activity.id} 
                   onClick={() => onActivityClick(activity.leadId)}
                   className={`
                      bg-white dark:bg-gray-900/60 backdrop-blur-md border rounded-2xl p-5 
                      shadow-sm hover:shadow-xl dark:hover:shadow-none hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden cursor-pointer
                      ${activity.priority === 'Hot' ? 'border-red-200 dark:border-red-900/40 ring-1 ring-red-100 dark:ring-red-900/20' : 'border-gray-100 dark:border-gray-800'}
                   `}
                 >
                    
                    {/* Decorative Gradient Background on Hover */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none ${getActivityColor(activity.type)}`} />
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className={`p-2.5 rounded-xl border ${getPriorityBg(activity.priority)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-textMain dark:text-white bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-lg border border-gray-100 dark:border-white/5">
                          {format(new Date(activity.date), 'h:mm a')}
                        </span>
                      </div>
                    </div>

                    <div className="relative z-10 space-y-1 mb-4">
                      <h4 className="font-bold text-lg text-textMain dark:text-white truncate group-hover:text-primaryDark transition-colors" title={activity.leadName}>{activity.leadName}</h4>
                      <p className="text-sm font-medium text-textSub dark:text-gray-400 capitalize flex items-center gap-2">
                         <span className={`w-1.5 h-1.5 rounded-full ${getActivityColor(activity.type)}`}></span>
                         {activity.type.replace('_', ' ')}
                      </p>
                    </div>

                    {activity.metadata.notes && (
                      <div className="relative z-10 pt-3 border-t border-gray-50 dark:border-gray-800/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic line-clamp-2 leading-relaxed">
                          "{activity.metadata.notes}"
                        </p>
                      </div>
                    )}
                    
                    {activity.priority === 'Hot' && (
                       <div className="absolute top-0 right-0 p-3">
                          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                       </div>
                    )}
                 </div>
               ))}
             </div>
          </div>
        );
      })}
      
      {sortedKeys.length === 0 && (
         <div className="flex flex-col items-center justify-center py-32 text-center opacity-60">
           <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
             <CalendarIcon className="w-8 h-8 text-gray-400" />
           </div>
           <h3 className="text-lg font-bold text-textMain dark:text-white">No activities found</h3>
           <p className="text-gray-500">Try adjusting your filters or date range.</p>
         </div>
      )}
    </div>
  );
};

// --- Main Component ---

const Calendar: React.FC = () => {
  const { activities, setSelectedLeadId } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month' | 'year' | 'agenda'>('month');
  const [selectedRange, setSelectedRange] = useState<DateRange>({ start: null, end: null });
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  // Memoize Filtered Activities
  const filteredActivities = useMemo(() => {
    if (!selectedRange.start || !selectedRange.end) return activities;
    return activities.filter(a => {
      const d = new Date(a.date);
      return selectedRange.start && selectedRange.end && d >= selectedRange.start && d <= selectedRange.end;
    });
  }, [activities, selectedRange]);

  // Optimized Lookup Map for Month View O(1) Access
  const activitiesMap = useMemo(() => {
    const map: Record<string, CalendarActivity[]> = {};
    filteredActivities.forEach(act => {
      const key = format(new Date(act.date), 'yyyy-MM-dd');
      if (!map[key]) map[key] = [];
      map[key].push(act);
    });
    return map;
  }, [filteredActivities]);

  const handleDateClick = useCallback((date: Date) => {
    if (view === 'month') {
        // Connected Views: Drill down to agenda for that day if no range select
        if (!selectedRange.start) {
          setCurrentDate(date);
          setView('agenda');
          // Auto-set range to that single day for the agenda view to focus
          setSelectedRange({ start: date, end: date });
        } else if (!selectedRange.end) {
          // Complete range selection
          const start = selectedRange.start;
          if (date < start) {
            setSelectedRange({ start: date, end: start });
          } else {
            setSelectedRange({ start, end: date });
          }
        } else {
           // Reset range and start new
           setSelectedRange({ start: date, end: null });
        }
    } else {
      // Default Range Logic
      if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
        setSelectedRange({ start: date, end: null });
      } else {
        const start = selectedRange.start;
        if (date < start) {
          setSelectedRange({ start: date, end: start });
        } else {
          setSelectedRange({ start, end: date });
        }
      }
    }
  }, [view, selectedRange]);

  // Connect Data: Lead Click opens Pipeline Details
  const handleActivityClick = useCallback((leadId: string) => {
    setSelectedLeadId(leadId);
  }, [setSelectedLeadId]);

  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    const modifier = direction === 'prev' ? -1 : 1;
    switch (view) {
      case 'year': setCurrentDate(d => addMonths(d, modifier * 12)); break;
      case 'month': setCurrentDate(d => addMonths(d, modifier)); break;
      case 'week': setCurrentDate(d => addWeeks(d, modifier)); break;
      case 'day': setCurrentDate(d => addDays(d, modifier)); break;
      default: setCurrentDate(d => addMonths(d, modifier)); // agenda
    }
  }, [view]);

  return (
    <div className="h-full flex flex-col bg-bgMain dark:bg-transparent overflow-hidden">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onPrevious={() => handleNavigate('prev')}
        onNext={() => handleNavigate('next')}
        onToday={() => setCurrentDate(new Date())}
        selectedRange={selectedRange}
        onClearRange={() => setSelectedRange({ start: null, end: null })}
      />

      <div className={`flex-1 overflow-y-auto hide-scrollbar ${view === 'month' ? 'p-2 md:p-6 overflow-hidden' : ''} ${(view === 'week' || view === 'day') ? 'p-2 md:p-4' : ''}`}>
        {view === 'month' && (
          <MonthView
            currentDate={currentDate}
            activitiesMap={activitiesMap}
            selectedRange={selectedRange}
            hoveredDate={hoveredDate}
            onDateClick={handleDateClick}
            onDateHover={setHoveredDate}
          />
        )}
        {(view === 'week' || view === 'day') && (
          <TimeGridView 
             currentDate={currentDate} 
             view={view} 
             activities={filteredActivities} 
             onActivityClick={handleActivityClick}
          />
        )}
        {view === 'agenda' && (
          <AgendaView 
            activities={filteredActivities} 
            onActivityClick={handleActivityClick}
          />
        )}
        {view === 'year' && (
           <YearView 
             currentDate={currentDate} 
             activities={filteredActivities} 
             onMonthSelect={(date) => {
               setCurrentDate(date);
               setView('month');
             }} 
           />
        )}
      </div>
    </div>
  );
};

export default Calendar;