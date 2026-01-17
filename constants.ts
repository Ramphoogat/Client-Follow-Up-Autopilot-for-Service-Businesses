import { Lead, LeadPriority, LeadStatus, Sequence } from './types';

export const SEQUENCE_TEMPLATES: Sequence[] = [
  {
    id: 'tpl-1',
    name: 'Aggressive Follow-up (High Value)',
    steps: [
      { id: 't1-s1', timeDelay: '30 mins', channel: 'WhatsApp', content: 'Hi {Name}, thanks for inquiring. I have a slot open at 4 PM to discuss. Does that work?' },
      { id: 't1-s2', timeDelay: '2 hours', channel: 'WhatsApp', content: 'Hi {Name}, just checking in. These slots fill up fast.' },
      { id: 't1-s3', timeDelay: '1 day', channel: 'Email', content: 'Subject: Urgent: Your inquiry about {Service}' },
      { id: 't1-s4', timeDelay: '2 days', channel: 'WhatsApp', content: 'Hi {Name}, are you still interested? Please let me know so I can close the file.' },
    ]
  },
  {
    id: 'tpl-2',
    name: 'Soft Touch / Nurture',
    steps: [
      { id: 't2-s1', timeDelay: 'Immediate', channel: 'Email', content: 'Subject: Thanks for reaching out! Here is our brochure.' },
      { id: 't2-s2', timeDelay: '3 days', channel: 'WhatsApp', content: 'Hi {Name}, hope you had a chance to look at the brochure. Any questions?' },
      { id: 't2-s3', timeDelay: '7 days', channel: 'Email', content: 'Subject: Customer Success Story: How we helped others with {Service}' },
    ]
  },
  {
    id: 'tpl-3',
    name: 'Appointment No-Show',
    steps: [
      { id: 't3-s1', timeDelay: '15 mins', channel: 'WhatsApp', content: 'Hi {Name}, we missed you today. Is everything okay?' },
      { id: 't3-s2', timeDelay: '1 hour', channel: 'Email', content: 'Subject: Reschedule your appointment' },
      { id: 't3-s3', timeDelay: '1 day', channel: 'WhatsApp', content: 'Hi {Name}, here is the link to reschedule at your convenience.' },
    ]
  },
  {
    id: 'tpl-4',
    name: 'Review Request (Post-Service)',
    steps: [
      { id: 't4-s1', timeDelay: '1 day', channel: 'WhatsApp', content: 'Hi {Name}, hope you are feeling better! How was your experience?' },
      { id: 't4-s2', timeDelay: '3 days', channel: 'Email', content: 'Subject: Quick question about your visit' },
    ]
  }
];

export const MOCK_SEQUENCES: Sequence[] = [
  {
    id: 'seq-1',
    name: 'New Inquiry - General',
    steps: [
      { id: 'step-1', timeDelay: 'Immediate', channel: 'WhatsApp', content: 'Hi {Name}, thanks for your inquiry about {Service}. Dr. Sharma will review and get back to you within 2 hours.' },
      { id: 'step-2', timeDelay: '2 hours', channel: 'WhatsApp', content: 'Hi {Name}, this is {AssignedOwner} from {ClinicName}. I\'d love to discuss your {Service} needs. When\'s a good time to call?' },
      { id: 'step-3', timeDelay: '1 day', channel: 'Email', content: 'Subject: What to expect with {Service}...' },
      { id: 'step-4', timeDelay: '3 days', channel: 'WhatsApp', content: 'Hi {Name}, just following up on your {Service} inquiry. Do you have any questions I can help with?' },
    ]
  },
  {
    id: 'seq-2',
    name: 'Post-Consultation Follow-up',
    steps: [
      { id: 'step-2-1', timeDelay: '1 hour', channel: 'WhatsApp', content: 'Hi {Name}, it was great seeing you today. Here is the summary of your treatment plan.' },
      { id: 'step-2-2', timeDelay: '2 days', channel: 'Email', content: 'Subject: Your treatment options explained' },
    ]
  },
  {
    id: 'seq-3',
    name: 'Cold Lead Revival',
    steps: [
      { id: 'step-3-1', timeDelay: '30 days', channel: 'WhatsApp', content: 'Hi {Name}, are you still looking for help with {Service}? We have a special offer this month.' },
    ]
  }
];

export const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    phone: '+91 98765 43210',
    email: 'priya.s@gmail.com',
    service: 'Root Canal',
    status: LeadStatus.NEW,
    priority: LeadPriority.HOT,
    assignedTo: 'Dr. Mehta',
    assignedSequenceId: 'seq-1',
    source: 'Website',
    createdAt: '2 hours ago',
    lastActivity: 'Auto-email sent',
    value: 8000
  },
  {
    id: '2',
    name: 'Rahul Verma',
    phone: '+91 98123 45678',
    email: 'rahul.v@yahoo.com',
    service: 'Full Body Checkup',
    status: LeadStatus.CONTACTED,
    priority: LeadPriority.WARM,
    assignedTo: 'Nurse Sarah',
    assignedSequenceId: 'seq-2',
    source: 'Missed Call',
    createdAt: '1 day ago',
    lastActivity: 'WhatsApp read',
    value: 3500
  },
  {
    id: '3',
    name: 'Anita Desai',
    phone: '+91 99887 76655',
    email: 'anita.realestate@gmail.com',
    service: 'Property Visit',
    status: LeadStatus.ENGAGED,
    priority: LeadPriority.HOT,
    assignedTo: 'Agent Roy',
    source: 'Referral',
    createdAt: '3 days ago',
    lastActivity: 'Replied to email',
    value: 0
  },
  {
    id: '4',
    name: 'Vikram Singh',
    phone: '+91 88776 65544',
    email: 'vikram.cars@outlook.com',
    service: 'Car Detailing',
    status: LeadStatus.QUOTED,
    priority: LeadPriority.WARM,
    assignedTo: 'Tech Mike',
    source: 'Facebook Ad',
    createdAt: '4 days ago',
    lastActivity: 'Quote sent via PDF',
    value: 12000
  },
  {
    id: '5',
    name: 'Meera Patel',
    phone: '+91 77665 54433',
    email: 'meera.p@gmail.com',
    service: 'Teeth Whitening',
    status: LeadStatus.WON,
    priority: LeadPriority.COLD,
    assignedTo: 'Dr. Sharma',
    source: 'Walk-in',
    createdAt: '1 week ago',
    lastActivity: 'Appointment booked',
    value: 5000
  },
  {
    id: '6',
    name: 'Arjun Kumar',
    phone: '+91 91234 56789',
    email: 'arjun.k@gmail.com',
    service: 'Orthodontics',
    status: LeadStatus.NEW,
    priority: LeadPriority.HOT,
    assignedTo: 'Dr. Mehta',
    assignedSequenceId: 'seq-1',
    source: 'Website',
    createdAt: '10 mins ago',
    lastActivity: 'Form submitted',
    value: 45000
  }
];

export const PIPELINE_COLUMNS = [
  LeadStatus.NEW,
  LeadStatus.CONTACTED,
  LeadStatus.ENGAGED,
  LeadStatus.QUOTED,
  LeadStatus.WON,
  LeadStatus.LOST
];