import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  GitBranch, 
  Settings as SettingsIcon, 
  MessageSquare, 
  Menu,
  X,
  PieChart,
  Moon,
  Sun,
  Calendar as CalendarIcon
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Pipeline from './components/Pipeline';
import Sequences from './components/Sequences';
import AddLeadModal from './components/AddLeadModal';
import LeadDetailPanel from './components/LeadDetailPanel';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Calendar from './components/Calendar';
import WhiteboardWorkspace from './components/Whiteboard';
import { ViewState } from './types';
import { useStore } from './store';

// Ambient Mesh Background for Dark Mode (Green/Black Theme)
const MeshBackground = () => (
  <div className="hidden dark:block fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-black">
    <div className="absolute -inset-[100%] opacity-40">
      {/* Primary Green Glow */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] 
        bg-[radial-gradient(circle,rgba(74,222,128,0.15)_0%,transparent_70%)]
        rounded-full blur-[100px] animate-float" 
        style={{ animationDelay: '0s', animationDuration: '15s' }} />
      
      {/* Dark Teal/Deep Green Depth */}
      <div className="absolute top-3/4 right-1/4 w-[600px] h-[600px] 
        bg-[radial-gradient(circle,rgba(6,78,59,0.2)_0%,transparent_70%)]
        rounded-full blur-[120px] animate-float" 
        style={{ animationDelay: '2s', animationDuration: '18s' }} />
      
      {/* Subtle Cyan Highlight */}
      <div className="absolute bottom-1/4 left-1/2 w-[400px] h-[400px] 
        bg-[radial-gradient(circle,rgba(20,184,166,0.1)_0%,transparent_70%)]
        rounded-full blur-[80px] animate-float" 
        style={{ animationDelay: '4s', animationDuration: '20s' }} />
    </div>
  </div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useStore();

  const navItems = [
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: ViewState.PIPELINE, label: 'Hot Leads', icon: GitBranch },
    { id: ViewState.CALENDAR, label: 'Calendar', icon: CalendarIcon },
    { id: ViewState.SEQUENCES, label: 'Sequences', icon: MessageSquare },
    { id: ViewState.REPORTS, label: 'Reports', icon: PieChart },
  ];

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD: return <Dashboard />;
      case ViewState.PIPELINE: return <Pipeline />;
      case ViewState.CALENDAR: return <Calendar />;
      case ViewState.SEQUENCES: return <Sequences />;
      case ViewState.REPORTS: return <Reports />;
      case ViewState.SETTINGS: return <Settings />;
      default: return <Dashboard />;
    }
  };

  const handleThemeToggle = () => {
    // Check if browser supports view transitions
    if ('startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        toggleTheme();
      });
    } else {
      toggleTheme();
    }
  };

  return (
    <div className={theme}>
      <div className="flex h-screen bg-bgMain dark:bg-[#050505] text-textMain dark:text-gray-100 overflow-hidden transition-colors duration-300">
        
        <MeshBackground />

        {/* Modals & Overlays */}
        <AddLeadModal />
        <LeadDetailPanel />
        <WhiteboardWorkspace />

        {/* Enhanced Sidebar (Desktop) */}
        <aside className="hidden md:flex w-64 flex-col z-20 transition-all duration-300
          bg-white/80 dark:bg-black/40 backdrop-blur-xl
          border-r border-gray-200/50 dark:border-green-500/10
          shadow-[0_0_40px_-10px_rgba(0,0,0,0.05)] dark:shadow-none"
        >
          <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primaryDark dark:from-green-500 dark:to-emerald-700 rounded-lg flex items-center justify-center shadow-lg shadow-primary/30 dark:shadow-green-500/20">
              <span className="font-bold text-gray-900 dark:text-black">FA</span>
            </div>
            <span className="font-bold text-lg tracking-tight dark:text-white">FollowUp<br/><span className="text-primaryDark dark:text-green-400 text-sm font-normal">Autopilot</span></span>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden ${
                  currentView === item.id 
                    ? 'text-gray-900 dark:text-white bg-gradient-to-r from-orange-50 to-transparent dark:from-green-500/20 dark:to-transparent' 
                    : 'text-textSub dark:text-gray-400 hover:text-gray-900 dark:hover:text-green-300 hover:bg-gray-50/50 dark:hover:bg-green-900/10'
                }`}
              >
                {/* Active Indicator Bar */}
                <span className={`absolute left-0 top-0 h-full w-1 rounded-r-full transition-all duration-300 ${
                  currentView === item.id 
                    ? 'bg-primary dark:bg-green-500 scale-y-100' 
                    : 'bg-primary/50 dark:bg-green-500/50 scale-y-0 group-hover:scale-y-50'
                }`} />

                <item.icon size={20} className={`transition-transform duration-300 ${
                  currentView === item.id 
                    ? 'text-primaryDark dark:text-green-400 scale-110' 
                    : 'group-hover:scale-110 group-hover:text-primaryDark dark:group-hover:text-green-400 group-hover:rotate-3'
                }`} />
                <span className={`transition-transform duration-300 ${currentView === item.id ? 'translate-x-1 font-bold' : 'group-hover:translate-x-1'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-100 dark:border-white/5 space-y-3">
             <div className="flex items-center justify-between px-4">
               <span className="text-xs font-semibold text-textSub dark:text-gray-500 uppercase tracking-wider">Theme</span>
               <button 
                onClick={handleThemeToggle}
                className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-primaryDark dark:hover:text-green-400 hover:bg-orange-50 dark:hover:bg-white/10 transition-all duration-300"
               >
                 {theme === 'light' ? <Moon size={18} className="rotate-0 transition-transform hover:-rotate-12" /> : <Sun size={18} className="rotate-0 transition-transform hover:rotate-90" />}
               </button>
             </div>
             <div className="flex items-center gap-3 px-4 py-2 bg-gray-50/50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden ring-2 ring-white dark:ring-gray-700">
                   <img src="https://picsum.photos/100/100" alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="text-xs">
                   <p className="font-bold text-textMain dark:text-white">Dr. Sharma</p>
                   <p className="text-textSub dark:text-gray-500">Admin</p>
                </div>
                <button 
                  onClick={() => setCurrentView(ViewState.SETTINGS)}
                  className={`ml-auto p-1.5 rounded-lg transition-colors ${
                    currentView === ViewState.SETTINGS 
                      ? 'text-primaryDark dark:text-green-400 bg-primary/10 dark:bg-green-500/10' 
                      : 'text-textSub dark:text-gray-500 hover:text-textMain dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10'
                  }`}
                >
                  <SettingsIcon size={16} />
                </button>
             </div>
          </div>
        </aside>

        {/* Mobile Header & Overlay */}
        <div className={`md:hidden fixed inset-0 bg-black/50 z-30 transition-opacity ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)} />
        
        <div className={`md:hidden fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-gray-900 z-40 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
           <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
              <span className="font-bold text-lg dark:text-white">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} className="dark:text-white" /></button>
           </div>
           <nav className="px-4 space-y-2 mt-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                    currentView === item.id 
                    ? 'bg-primary text-gray-900' 
                    : 'text-textSub dark:text-gray-400'
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </button>
              ))}
              
              <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                <button 
                  onClick={() => {
                    setCurrentView(ViewState.SETTINGS);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                    currentView === ViewState.SETTINGS 
                    ? 'bg-primary text-gray-900' 
                    : 'text-textSub dark:text-gray-400'
                  }`}
                >
                  <SettingsIcon size={20} />
                  Settings
                </button>
                <button 
                  onClick={handleThemeToggle}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-textSub dark:text-gray-400"
                >
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                  Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
                </button>
              </div>
           </nav>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Mobile Top Bar */}
          <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="font-bold text-gray-900">FA</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">Autopilot</span>
             </div>
             <button onClick={() => setIsMobileMenuOpen(true)}>
               <Menu size={24} className="text-textMain dark:text-white" />
             </button>
          </div>

          {/* Scrollable View Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
             {renderContent()}
          </div>
        </main>

      </div>
    </div>
  );
};

export default App;