import { FollowUpTemplate } from './types';

export const DEFAULT_TEMPLATES: FollowUpTemplate[] = [
  {
    id: '1',
    title: 'Consult Only Follow-up',
    category: 'Consult Only',
    content: 'Hi [Patient Name], this is [Doctor Name]\'s clinic. We noticed you came in for a consultation on [Date]. We wanted to check in and see if you had any further questions or if you\'d like to proceed with the recommended treatment. Feel free to reach out!',
  },
  {
    id: '2',
    title: 'No Show Re-engagement',
    category: 'No Show',
    content: 'Hi [Patient Name], we missed you at your appointment on [Date] with [Doctor Name]. We hope everything is okay! Would you like to reschedule for another time? Please let us know.',
  },
  {
    id: '3',
    title: 'Post-Treatment Check-in',
    category: 'General',
    content: 'Hi [Patient Name], how are you feeling after your visit with [Doctor Name] on [Date]? We hope you\'re doing well. If you have any concerns, please don\'t hesitate to contact us.',
  },
  {
    id: '4',
    title: 'Appointment Reminder',
    category: 'General',
    content: 'Hi [Patient Name], this is a friendly reminder of your upcoming appointment with [Doctor Name] on [Date]. We look forward to seeing you!',
  }
];
