import React, { useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Sector
} from 'recharts';
import { Download, Loader2, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store';
import { LeadStatus } from '../types';

const COLORS = ['#FFB380', '#A7D8A0', '#C9B8E8', '#FF9494', '#93C5FD', '#FCA5A5'];

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="drop-shadow-lg"
      />
    </g>
  );
};

const Reports: React.FC = () => {
  const { leads, theme } = useStore();
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // 1. Lead Source Distribution
  const sourceCount: Record<string, number> = {};
  leads.forEach(lead => {
    sourceCount[lead.source] = (sourceCount[lead.source] || 0) + 1;
  });
  const sourceData = Object.keys(sourceCount).map(source => ({
    name: source,
    value: sourceCount[source]
  }));

  // 2. Conversion Funnel
  const funnelOrder = [
    LeadStatus.NEW,
    LeadStatus.CONTACTED,
    LeadStatus.ENGAGED,
    LeadStatus.QUOTED,
    LeadStatus.WON
  ];
  const funnelData = funnelOrder.map(status => ({
    name: status,
    count: leads.filter(l => l.status === status).length
  }));

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  // CSV Export Logic
  const handleExportCSV = () => {
    setIsExporting(true);

    // Simulate a small delay for better UX (optional, remove in production if sync is instant)
    setTimeout(() => {
      try {
        // Define Headers
        const headers = [
          'Lead ID', 
          'Full Name', 
          'Email', 
          'Phone', 
          'Service', 
          'Status', 
          'Priority', 
          'Value (INR)', 
          'Source', 
          'Assigned To', 
          'Sequence ID',
          'Created At', 
          'Last Activity'
        ];

        // Map Data to CSV Rows
        const rows = leads.map(lead => {
          // Helper to escape commas for CSV format
          const escape = (val: string | number | undefined) => {
            if (val === undefined || val === null) return '';
            const stringVal = String(val);
            return stringVal.includes(',') ? `"${stringVal}"` : stringVal;
          };

          return [
            escape(lead.id),
            escape(lead.name),
            escape(lead.email),
            escape(lead.phone),
            escape(lead.service),
            escape(lead.status),
            escape(lead.priority),
            escape(lead.value),
            escape(lead.source),
            escape(lead.assignedTo),
            escape(lead.assignedSequenceId || 'N/A'),
            escape(lead.createdAt),
            escape(lead.lastActivity)
          ].join(',');
        });

        // Combine Headers and Rows
        const csvContent = [headers.join(','), ...rows].join('\n');

        // Create Blob and Download Link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        const timestamp = new Date().toISOString().split('T')[0];
        link.href = url;
        link.setAttribute('download', `leads_export_${timestamp}.csv`);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Success Feedback
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3000);

      } catch (error) {
        console.error("Export failed:", error);
        alert("Failed to export data. Please try again.");
      } finally {
        setIsExporting(false);
      }
    }, 800);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-textMain dark:text-white flex items-center gap-2 tracking-tight">
            Reports
          </h1>
          <p className="text-sm text-textSub dark:text-gray-400 mt-1">Real-time metrics from your pipeline.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          disabled={isExporting}
          className={`
            flex items-center gap-2 px-4 py-2 text-sm font-bold border rounded-xl transition-all shadow-sm
            ${exportSuccess 
              ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
              : 'text-gray-700 dark:text-gray-200 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800'
            }
          `}
        >
          {isExporting ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Exporting...
            </>
          ) : exportSuccess ? (
            <>
              <CheckCircle2 size={16} /> Exported
            </>
          ) : (
            <>
              <Download size={16} /> Export Detailed CSV
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Lead Source Chart - Glassmorphic */}
        <div className="glass-panel rounded-3xl p-8 shadow-xl shadow-orange-500/5 dark:shadow-none transition-all hover:shadow-2xl hover:shadow-orange-500/10 dark:hover:shadow-orange-900/20">
          <h3 className="text-lg font-bold text-textMain dark:text-white mb-6">Lead Sources</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  animationDuration={800}
                  animationBegin={200}
                  {...({ activeIndex, activeShape: renderActiveShape } as any)}
                >
                  {sourceData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      className="cursor-pointer focus:outline-none transition-all duration-300"
                      strokeWidth={0}
                    />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{
                     borderRadius: '16px', 
                     border: '1px solid rgba(255,255,255,0.2)', 
                     boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
                     backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                     backdropFilter: 'blur(8px)',
                     color: theme === 'dark' ? '#F3F4F6' : '#1F2937'
                   }}
                   itemStyle={{fontWeight: 600}}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel Chart - Glassmorphic */}
        <div className="glass-panel rounded-3xl p-8 shadow-xl shadow-orange-500/5 dark:shadow-none transition-all hover:shadow-2xl hover:shadow-orange-500/10 dark:hover:shadow-orange-900/20">
          <h3 className="text-lg font-bold text-textMain dark:text-white mb-6">Pipeline Funnel</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart
                data={funnelData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={90} 
                  tick={{fontSize: 12, fill: theme === 'dark' ? '#9CA3AF' : '#6B7280', fontWeight: 500}} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                   cursor={{fill: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'}}
                   contentStyle={{
                     borderRadius: '16px', 
                     border: '1px solid rgba(255,255,255,0.2)', 
                     boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
                     backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                     backdropFilter: 'blur(8px)',
                     color: theme === 'dark' ? '#F3F4F6' : '#1F2937'
                   }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#FFB380" 
                  radius={[0, 8, 8, 0]} 
                  barSize={32}
                  className="transition-all duration-300 hover:opacity-80"
                >
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg p-6 rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-sm hover:shadow-md transition-all">
            <p className="text-sm text-textSub dark:text-gray-400 mb-1 font-medium">Total Pipeline Value</p>
            <h3 className="text-3xl font-bold text-textMain dark:text-white">₹{leads.reduce((sum, l) => sum + (l.value || 0), 0).toLocaleString()}</h3>
            <span className="text-xs text-green-600 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full mt-2 inline-block">+12% growth</span>
         </div>
         <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg p-6 rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-sm hover:shadow-md transition-all">
            <p className="text-sm text-textSub dark:text-gray-400 mb-1 font-medium">Avg. Deal Size</p>
            <h3 className="text-3xl font-bold text-textMain dark:text-white">₹{Math.round(leads.reduce((sum, l) => sum + (l.value || 0), 0) / (leads.length || 1)).toLocaleString()}</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-bold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full mt-2 inline-block">Stable</span>
         </div>
         <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg p-6 rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-sm hover:shadow-md transition-all">
            <p className="text-sm text-textSub dark:text-gray-400 mb-1 font-medium">Conversion Rate</p>
            <h3 className="text-3xl font-bold text-textMain dark:text-white">
              {Math.round((leads.filter(l => l.status === LeadStatus.WON).length / (leads.length || 1)) * 100)}%
            </h3>
            <span className="text-xs text-red-500 dark:text-red-400 font-bold bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full mt-2 inline-block">-2% decline</span>
         </div>
      </div>
    </div>
  );
};

export default Reports;