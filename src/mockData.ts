import { Buddy, Event } from './types';

export const mockBuddies: Buddy[] = [
  {
    id: '1',
    name: 'Sato Haruka',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    location: 'Hanoi University • 2km away',
    matchPercentage: 98,
    tags: ['Japanese (N1)', 'Art', 'Travel'],
    bio: 'Hi, I am a student from Tokyo living in Hanoi. I want to learn more about Vietnamese culture while teaching Japanese!',
    role: 'Japanese Native',
  },
  {
    id: '2',
    name: 'Minh Quan',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    location: 'Software Engineer • 4km away',
    matchPercentage: 92,
    tags: ['Vietnamese (Native)', 'IT', 'Japanese (N2)'],
    bio: 'Looking for a language partner to practice business Japanese. I can help you with Vietnamese and IT terms.',
    role: 'Vietnamese Native',
  },
  {
    id: '3',
    name: 'Tanaka Yuki',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    location: 'Chef • 1.5km away',
    matchPercentage: 88,
    tags: ['Cooking', 'Hanoi Life', 'Japanese (Native)'],
    bio: 'I love Vietnamese food! Let’s explore local markets together and exchange languages.',
    role: 'Japanese Native',
  },
];

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Hanoi - Tokyo Food Exchange',
    date: 'Oct 14, Sat • 18:00 - 21:00',
    location: 'Old Quarter Social Club, Hanoi',
    category: 'Culture',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop',
    description: 'Join us for a unique culinary journey! Taste 5 traditional Vietnamese dishes and 5 Japanese classics.',
  },
  {
    id: '2',
    title: 'JLPT N2 Prep & Conversation',
    date: 'Oct 15, Sun • 14:00',
    location: 'Cafe 24, Hanoi',
    category: 'Education',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop',
    description: 'Study group for upcoming JLPT N2 exam followed by casual conversation practice.',
  },
];
