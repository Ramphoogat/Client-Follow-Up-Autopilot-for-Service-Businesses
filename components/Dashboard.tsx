import React, { useEffect, useState, useRef } from 'react';
import { 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Upload,
  Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useInView } from 'react-intersection-observer';
import { useStore } from '../store';
import { LeadPriority, LeadStatus, StatCardProps, Lead } from '../types';
import LeadCard from './LeadCard';

const data = [
  { name: 'Mon', leads: 4 },
  { name: 'Tue', leads: 7 },
  { name: 'Wed', leads: 5 },
  { name: 'Thu', leads: 12 },
  { name: 'Fri', leads: 9 },
  { name: 'Sat', leads: 15 },
  { name: 'Sun', leads: 6 },
];

const AnimatedNumber: React.FC<{ value: number | string }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true });
  
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
  const isPercentage = typeof value === 'string' && value.includes('%');
  const isCurrency = typeof value === 'string' && (value.includes('$') || value.includes('₹'));
  const suffix = typeof value === 'string' ? value.replace(/[0-9.]/g, '') : '';

  useEffect(() => {
    if (!inView) return;
    
    let start = 0;
    const end = isNaN(numericValue) ? 0 : numericValue;
    const duration = 1500;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [inView, numericValue]);

  if (isNaN(numericValue)) return <span ref={ref}>{value}</span>;

  return (
    <span ref={ref}>
      {isCurrency && suffix.includes('₹') ? '₹' : ''}
      {Math.floor(displayValue)}
      {isPercentage ? '%' : ''}
      {!isPercentage && !isCurrency ? suffix : ''}
    </span>
  );
};

const TiltCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { theme } = useStore();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -5; // Subtle tilt max 5deg
    const rotateY = ((x - centerX) / centerX) * 5;
    
    cardRef.current.style.transform = 
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };
  
  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 
        'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-200 ease-out preserve-3d ${className}`}
    >
      {children}
    </div>
  );
};

const StatCard: React.FC<StatCardProps> = ({ label, value, trend, trendUp, icon: Icon, colorClass }) => {
  const { theme } = useStore();
  
  return (
    <TiltCard className="group relative bg-white dark:bg-[#0A0A0A] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-lg hover:shadow-xl dark:shadow-none dark:hover:shadow-green-900/20 flex flex-col justify-between h-32 overflow-hidden">
      {/* Animated Gradient Border Overlay - Theme Aware */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" 
           style={{
             background: theme === 'dark' 
              ? 'linear-gradient(45deg, transparent, rgba(74, 222, 128, 0.1), transparent)' // Green for dark
              : 'linear-gradient(45deg, transparent, rgba(255, 179, 128, 0.1), transparent)', // Orange for light
             zIndex: 0
           }} 
      />
      
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 ${colorClass} group-hover:scale-125 transition-transform duration-500`} />
      
      <div className="flex justify-between items-start z-10 transform translate-z-10">
        <div>
          <p className="text-sm text-textSub dark:text-gray-500 font-medium mb-1">{label}</p>
          <h3 className="text-3xl font-bold text-textMain dark:text-gray-100 tracking-tight">
            <AnimatedNumber value={value} />
          </h3>
        </div>
        <div className={`p-2.5 rounded-xl ${colorClass} bg-opacity-20 text-gray-800 dark:text-gray-200 shadow-sm group-hover:rotate-6 transition-transform`}>
          <Icon size={20} />
        </div>
      </div>
      
      {trend && (
        <div className="flex items-center gap-1 text-xs font-medium z-10 transform translate-z-10">
          <span className={`flex items-center ${trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
            {trendUp ? <TrendingUp size={12} className="mr-1" /> : <TrendingUp size={12} className="mr-1 rotate-180" />}
            {trend}
          </span>
          <span className="text-gray-400 dark:text-gray-600">vs last week</span>
        </div>
      )}
    </TiltCard>
  );
};

const Dashboard: React.FC = () => {
  const { leads, setAddLeadModalOpen, setEditingLeadId, theme, importLeads } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const hotLeads = leads.filter(l => l.priority === LeadPriority.HOT && l.status !== LeadStatus.WON);
  const leadsWon = leads.filter(l => l.status === LeadStatus.WON).length;
  const newLeadsCount = leads.filter(l => l.status === LeadStatus.NEW).length;
  
  const conversionRate = Math.round((leadsWon / (leads.length || 1)) * 100);

  const handleAddNewLead = () => {
    setEditingLeadId(null);
    setAddLeadModalOpen(true);
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = text.split('\n');
        
        // Basic CSV Parser
        // Assumption: First row is header or if standard columns used, logic adapts
        // This parser expects a standard format but maps loosely to columns
        
        const newLeads: Lead[] = [];
        
        // Skip header if it exists (naive check: does first row contain "Name" or "Email"?)
        let startIndex = 0;
        if (rows[0].toLowerCase().includes('name') || rows[0].toLowerCase().includes('email')) {
          startIndex = 1;
        }

        for (let i = startIndex; i < rows.length; i++) {
          const row = rows[i].trim();
          if (!row) continue;
          
          // Split by comma, handling potential quotes roughly or assuming simple CSV
          const cols = row.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          
          // Mapping Strategy: Name, Phone, Email, Service, Status, Priority, Value, Source
          // If columns are fewer, fill with defaults
          if (cols.length < 3) continue; // Skip invalid rows

          const lead: Lead = {
            id: `imp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: cols[0] || 'Unknown Import',
            phone: cols[1] || '',
            email: cols[2] || '',
            service: cols[3] || 'General Inquiry',
            status: (cols[4] as LeadStatus) || LeadStatus.NEW,
            priority: (cols[5] as LeadPriority) || LeadPriority.WARM,
            value: parseInt(cols[6]) || 0,
            source: cols[7] || 'CSV Import',
            assignedTo: 'Unassigned',
            createdAt: 'Just now',
            lastActivity: 'Imported'
          };
          
          newLeads.push(lead);
        }

        if (newLeads.length > 0) {
          importLeads(newLeads);
          alert(`Successfully imported ${newLeads.length} leads.`);
        } else {
          alert('No valid leads found in file.');
        }

      } catch (err) {
        console.error('Import Error:', err);
        alert('Failed to parse CSV file. Please check the format.');
      } finally {
        setIsImporting(false);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-textMain dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-textSub dark:text-gray-400 mt-1">Welcome back, Dr. Sharma. Here's what's happening today.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".csv"
            onChange={handleFileChange}
          />
          
          <button 
            onClick={handleImportClick}
            disabled={isImporting}
            className="px-5 py-3 rounded-xl font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            {isImporting ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            <span>Import CSV</span>
          </button>

          <button 
            onClick={handleAddNewLead}
            className="relative overflow-hidden bg-gradient-to-r from-primary to-primaryDark dark:from-green-500 dark:to-emerald-600 text-gray-900 dark:text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 dark:shadow-green-900/20 hover:shadow-primary/50 dark:hover:shadow-green-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
          >
            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
            <Users size={18} className="relative z-10" />
            <span className="relative z-10">Add New Lead</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="New Leads" 
          value={newLeadsCount.toString()} 
          trend="12%" 
          trendUp={true} 
          icon={Users} 
          colorClass="bg-primary dark:bg-green-500"
        />
        <StatCard 
          label="Conversion Rate" 
          value={`${conversionRate}%`} 
          trend="4%" 
          trendUp={true} 
          icon={TrendingUp} 
          colorClass="bg-success dark:bg-emerald-500"
        />
        <StatCard 
          label="Leads Won" 
          value={leadsWon.toString()} 
          trend="2%" 
          trendUp={false} 
          icon={CheckCircle2} 
          colorClass="bg-info dark:bg-blue-500"
        />
        <StatCard 
          label="Avg Response" 
          value="2.3h" 
          icon={Clock} 
          colorClass="bg-yellow-200 dark:bg-yellow-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white/60 dark:bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/20 dark:border-white/5 p-6 rounded-2xl shadow-xl shadow-orange-500/5 dark:shadow-none transition-all hover:border-primary/20 dark:hover:border-green-500/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-textMain dark:text-white">Lead Volume</h2>
            <select className="bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs px-3 py-1.5 text-textSub dark:text-gray-400 outline-none hover:border-primary dark:hover:border-green-500 focus:border-primary dark:focus:border-green-500 transition-colors cursor-pointer dark:bg-black">
              <option>Last 7 Days</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={data} barSize={36}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: theme === 'dark' ? '#525252' : '#9CA3AF', fontSize: 12, fontWeight: 500}} 
                  dy={10}
                />
                <YAxis hide={true} />
                <Tooltip 
                  cursor={{fill: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(249, 250, 251, 0.6)'}}
                  contentStyle={{
                    borderRadius: '16px', 
                    border: theme === 'dark' ? '1px solid rgba(74, 222, 128, 0.2)' : '1px solid rgba(255,255,255,0.1)', 
                    boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
                    backgroundColor: theme === 'dark' ? 'rgba(5, 5, 5, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                    color: theme === 'dark' ? '#F3F4F6' : '#1F2937',
                    padding: '12px 16px'
                  }}
                  itemStyle={{ color: theme === 'dark' ? '#D1D5DB' : '#374151', fontWeight: 600 }}
                  labelStyle={{ color: theme === 'dark' ? '#6B7280' : '#6B7280', marginBottom: '4px' }}
                />
                <Bar dataKey="leads" radius={[8, 8, 8, 8]}>
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 5 ? (theme === 'dark' ? '#4ade80' : '#FFB380') : (theme === 'dark' ? '#262626' : '#E5E7EB')} 
                      className="transition-all duration-300 hover:opacity-80"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hot Leads Section */}
        <div className="lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
               <span className="relative flex h-3 w-3">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
               </span>
               <h2 className="text-xl font-bold text-textMain dark:text-white">Action Required</h2>
            </div>
            <button className="text-xs font-bold text-primaryDark dark:text-green-400 hover:text-primary dark:hover:text-green-300 hover:translate-x-1 transition-all flex items-center gap-1">
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-4">
            {hotLeads.map(lead => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;