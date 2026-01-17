import React, { useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { 
  User, Bell, Shield, Download, 
  BarChart3, Settings, Save
} from 'lucide-react';
import { useStore } from '../store';
import { LeadStatus } from '../types';

const COLORS = ['#FFB380', '#A7D8A0', '#C9B8E8', '#FF9494', '#93C5FD', '#FCA5A5'];

const ReportsSettings: React.FC = () => {
  const { leads, theme } = useStore();
  const [activeTab, setActiveTab] = useState<'reports' | 'settings'>('reports');

  // --- Reports Data Preparation ---

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

  // --- Render Functions ---

  const renderReports = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-textMain dark:text-white">Performance Insights</h2>
          <p className="text-sm text-textSub dark:text-gray-400">Real-time metrics from your pipeline.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-textSub dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Lead Source Chart */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-base font-bold text-textMain dark:text-white mb-4">Lead Sources</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{
                     borderRadius: '12px', 
                     border: 'none', 
                     boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                     backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                     color: theme === 'dark' ? '#F3F4F6' : '#1F2937'
                   }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel Chart */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-base font-bold text-textMain dark:text-white mb-4">Pipeline Funnel</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={funnelData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={80} 
                  tick={{fontSize: 12, fill: theme === 'dark' ? '#9CA3AF' : '#6B7280'}} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                   cursor={{fill: theme === 'dark' ? '#374151' : '#FAFAF8'}}
                   contentStyle={{
                     borderRadius: '12px', 
                     border: 'none', 
                     boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                     backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                     color: theme === 'dark' ? '#F3F4F6' : '#1F2937'
                   }}
                />
                <Bar dataKey="count" fill="#FFB380" radius={[0, 6, 6, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <p className="text-sm text-textSub dark:text-gray-400 mb-1">Total Pipeline Value</p>
            <h3 className="text-2xl font-bold text-textMain dark:text-white">₹{leads.reduce((sum, l) => sum + (l.value || 0), 0).toLocaleString()}</h3>
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">+12% vs last month</span>
         </div>
         <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <p className="text-sm text-textSub dark:text-gray-400 mb-1">Avg. Deal Size</p>
            <h3 className="text-2xl font-bold text-textMain dark:text-white">₹{Math.round(leads.reduce((sum, l) => sum + (l.value || 0), 0) / (leads.length || 1)).toLocaleString()}</h3>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Stable</span>
         </div>
         <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <p className="text-sm text-textSub dark:text-gray-400 mb-1">Conversion Rate</p>
            <h3 className="text-2xl font-bold text-textMain dark:text-white">
              {Math.round((leads.filter(l => l.status === LeadStatus.WON).length / (leads.length || 1)) * 100)}%
            </h3>
            <span className="text-xs text-red-500 dark:text-red-400 font-medium">-2% vs last month</span>
         </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Profile Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
           <h3 className="font-bold text-lg text-textMain dark:text-white flex items-center gap-2">
             <User size={20} className="text-primaryDark" /> Profile Settings
           </h3>
        </div>
        <div className="p-6 space-y-4">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-xs font-semibold text-textSub dark:text-gray-400">First Name</label>
                 <input type="text" defaultValue="Priya" className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-textMain dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="space-y-1">
                 <label className="text-xs font-semibold text-textSub dark:text-gray-400">Last Name</label>
                 <input type="text" defaultValue="Sharma" className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-textMain dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
           </div>
           <div className="space-y-1">
              <label className="text-xs font-semibold text-textSub dark:text-gray-400">Email Address</label>
              <input type="email" defaultValue="dr.sharma@clinic.com" className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-textMain dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
           </div>
           <div className="space-y-1">
              <label className="text-xs font-semibold text-textSub dark:text-gray-400">Role</label>
              <select className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-textMain dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option>Administrator</option>
                <option>Staff</option>
                <option>Viewer</option>
              </select>
           </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
           <h3 className="font-bold text-lg text-textMain dark:text-white flex items-center gap-2">
             <Bell size={20} className="text-primaryDark" /> Notifications
           </h3>
        </div>
        <div className="p-6 space-y-4">
           <div className="flex items-center justify-between">
              <div>
                 <p className="text-sm font-medium text-textMain dark:text-white">Email Notifications</p>
                 <p className="text-xs text-textSub dark:text-gray-400">Receive updates about new leads via email.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
           </div>
           <div className="h-px bg-gray-100 dark:bg-gray-800"></div>
           <div className="flex items-center justify-between">
              <div>
                 <p className="text-sm font-medium text-textMain dark:text-white">Browser Push</p>
                 <p className="text-xs text-textSub dark:text-gray-400">Get notified instantly on your desktop.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
           </div>
        </div>
      </div>

       <div className="flex justify-end">
         <button className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primaryDark text-gray-900 font-bold rounded-xl transition-colors shadow-sm">
           <Save size={18} /> Save Changes
         </button>
       </div>

    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-textMain dark:text-white">Reports & Settings</h1>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button 
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'reports' ? 'border-primary text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <BarChart3 size={18} /> Reports
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'settings' ? 'border-primary text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Settings size={18} /> Settings
        </button>
      </div>

      {activeTab === 'reports' ? renderReports() : renderSettings()}
    </div>
  );
};

export default ReportsSettings;