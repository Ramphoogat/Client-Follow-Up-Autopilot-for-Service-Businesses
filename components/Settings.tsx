import React from 'react';
import { User, Bell, Save } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-textMain dark:text-white">Settings</h1>
          <p className="text-sm text-textSub dark:text-gray-400 mt-1">Manage your profile and preferences.</p>
        </div>
      </div>

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
};

export default Settings;