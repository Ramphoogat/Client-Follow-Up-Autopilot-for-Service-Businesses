import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Save, AlertCircle } from 'lucide-react';
import { useStore } from '../store';
import { LeadStatus, LeadPriority } from '../types';

const leadSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Phone number is too short"),
  email: z.string().email("Invalid email address"),
  service: z.string().min(2, "Service is required"),
  priority: z.nativeEnum(LeadPriority),
  source: z.string().min(2, "Source is required"),
  value: z.number().min(0, "Value must be positive").optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

const AddLeadModal: React.FC = () => {
  const { 
    isAddLeadModalOpen, 
    setAddLeadModalOpen, 
    addLead, 
    updateLead,
    editingLeadId,
    leads 
  } = useStore();
  
  const { 
    register, 
    handleSubmit, 
    reset,
    setValue,
    formState: { errors } 
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      priority: LeadPriority.WARM,
      value: 0
    }
  });

  // Pre-fill form if editing
  useEffect(() => {
    if (isAddLeadModalOpen && editingLeadId) {
      const leadToEdit = leads.find(l => l.id === editingLeadId);
      if (leadToEdit) {
        setValue('name', leadToEdit.name);
        setValue('phone', leadToEdit.phone);
        setValue('email', leadToEdit.email);
        setValue('service', leadToEdit.service);
        setValue('priority', leadToEdit.priority);
        setValue('source', leadToEdit.source);
        setValue('value', leadToEdit.value);
      }
    } else if (isAddLeadModalOpen && !editingLeadId) {
      reset({
        priority: LeadPriority.WARM,
        value: 0,
        name: '',
        phone: '',
        email: '',
        service: '',
        source: ''
      });
    }
  }, [isAddLeadModalOpen, editingLeadId, leads, setValue, reset]);

  if (!isAddLeadModalOpen) return null;

  const onSubmit = (data: LeadFormData) => {
    if (editingLeadId) {
      // Edit Mode
      updateLead(editingLeadId, {
        ...data,
        value: data.value || 0
      });
    } else {
      // Add Mode
      const newLead = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        status: LeadStatus.NEW,
        assignedTo: 'Dr. Sharma',
        createdAt: 'Just now',
        lastActivity: 'Manually added',
        value: data.value || 0
      };
      addLead(newLead);
    }
    
    reset();
    setAddLeadModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <h2 className="text-xl font-bold text-textMain dark:text-white">
            {editingLeadId ? 'Edit Lead' : 'Add New Lead'}
          </h2>
          <button 
            onClick={() => setAddLeadModalOpen(false)}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-textSub dark:text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-textSub dark:text-gray-400 uppercase">Full Name</label>
              <input 
                {...register('name')}
                className={`w-full p-2.5 rounded-lg border ${errors.name ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700'} text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-gray-800 text-textMain dark:text-white`}
                placeholder="e.g. John Doe"
              />
              {errors.name && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={10}/> {errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-textSub dark:text-gray-400 uppercase">Phone</label>
              <input 
                {...register('phone')}
                className={`w-full p-2.5 rounded-lg border ${errors.phone ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700'} text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-gray-800 text-textMain dark:text-white`}
                placeholder="+91 98765..."
              />
              {errors.phone && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={10}/> {errors.phone.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-textSub dark:text-gray-400 uppercase">Email</label>
            <input 
              {...register('email')}
              className={`w-full p-2.5 rounded-lg border ${errors.email ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700'} text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-gray-800 text-textMain dark:text-white`}
              placeholder="john@example.com"
            />
             {errors.email && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={10}/> {errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-textSub dark:text-gray-400 uppercase">Service Interest</label>
              <select 
                {...register('service')}
                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-gray-800 text-textMain dark:text-white"
              >
                <option value="">Select Service</option>
                <option value="Root Canal">Root Canal</option>
                <option value="Orthodontics">Orthodontics</option>
                <option value="Teeth Whitening">Teeth Whitening</option>
                <option value="General Checkup">General Checkup</option>
                <option value="Property Visit">Property Visit</option>
                <option value="Car Detailing">Car Detailing</option>
              </select>
               {errors.service && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={10}/> {errors.service.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-textSub dark:text-gray-400 uppercase">Priority</label>
              <select 
                {...register('priority')}
                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-gray-800 text-textMain dark:text-white"
              >
                <option value={LeadPriority.HOT}>Hot</option>
                <option value={LeadPriority.WARM}>Warm</option>
                <option value={LeadPriority.COLD}>Cold</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
              <label className="text-xs font-semibold text-textSub dark:text-gray-400 uppercase">Source</label>
              <input 
                {...register('source')}
                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-gray-800 text-textMain dark:text-white"
                placeholder="e.g. Website, Referral"
              />
               {errors.source && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={10}/> {errors.source.message}</p>}
            </div>
             <div className="space-y-1">
              <label className="text-xs font-semibold text-textSub dark:text-gray-400 uppercase">Est. Value (₹)</label>
              <input 
                type="number"
                {...register('value', { valueAsNumber: true })}
                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-gray-800 text-textMain dark:text-white"
                placeholder="0"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={() => setAddLeadModalOpen(false)}
              className="flex-1 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 text-sm font-bold text-gray-900 bg-primary rounded-xl hover:bg-primaryDark shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Save size={18} /> {editingLeadId ? 'Update Lead' : 'Save Lead'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddLeadModal;