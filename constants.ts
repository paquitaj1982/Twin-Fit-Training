
import { Workout, MealPlan, TrainerService, BookingSlot, Post } from './types';

export const MOTIVATIONAL_QUOTES = [
  { text: "Strength does not come from winning. Your struggles develop your strengths.", category: "Strength" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", category: "Strength" },
  { text: "Don't stop when you're tired. Stop when you're done.", category: "Endurance" },
  { text: "Endurance is not just the ability to bear a hard thing, but to turn it into glory.", category: "Endurance" },
  { text: "When you want to quit, remember why you started.", category: "Mindset" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", category: "Mindset" },
  { text: "Suffer the pain of discipline or suffer the pain of regret.", category: "Strength" },
  { text: "Your body can stand almost anything. It’s your mind that you have to convince.", category: "Endurance" },
  { text: "Excellence is not a act, but a habit. You are what you repeatedly do.", category: "Mindset" },
  { text: "Great things never came from comfort zones.", category: "Endurance" },
  { text: "Discipline is doing what needs to be done, even if you don't want to do it.", category: "Mindset" },
  { text: "The clock is ticking. Are you becoming the person you want to be?", category: "Mindset" }
];

export const WORKOUTS: Workout[] = [
  {
    id: 'bp-setup-01',
    title: 'Bench Press Setup',
    duration: 10,
    level: 'Advanced',
    category: 'Upper Body',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&h=1422&auto=format&fit=crop',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-athletic-man-lifting-weights-in-a-dark-gym-2384-large.mp4',
    description: 'How to set your scapula and grip for maximum leverage. Focus on leg drive and maintaining a rigid thoracic arch for maximum power transfer.',
    tags: ['bench', 'chest', 'strength', 'form'],
    visibility: 'public',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ownerUid: 'twin-uid-master'
  },
  {
    id: 'ropes-01',
    title: 'High Intensity Ropes',
    duration: 30,
    level: 'Intermediate',
    category: 'HIIT',
    imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&h=1422&auto=format&fit=crop',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-legs-of-a-person-running-on-a-treadmill-2426-large.mp4',
    description: 'Tabata style ropes. 20s work, 10s rest. Focus on core stability and explosive arm movements to drive metabolic demand.',
    tags: ['hiit', 'cardio', 'ropes'],
    visibility: 'clients',
    ownerUid: 'twin-uid-master'
  },
  {
    id: 'p1',
    title: 'Private Bench PR Review',
    duration: 5,
    level: 'Advanced',
    category: 'Strength',
    imageUrl: 'https://images.unsplash.com/photo-1534367507873-d25dfeac3438?q=80&w=800&h=1422&auto=format&fit=crop',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-athletic-man-lifting-weights-in-a-dark-gym-2384-large.mp4',
    visibility: 'private',
    tags: ['personal', 'form-check'],
    description: 'Reviewing bar path on the last 315lb set. Noticing slight elbow flare on rep 3 which could lead to joint instability.',
    ownerUid: 'twin-uid-master'
  }
];

export const MEAL_PLANS: MealPlan[] = [
  {
    id: '1',
    title: 'Lean Machine',
    calories: 2200,
    protein: 180,
    carbs: 200,
    fats: 60,
    type: 'Fat Loss',
  },
  {
    id: '2',
    title: 'Mass Builder',
    calories: 3200,
    protein: 220,
    carbs: 350,
    fats: 80,
    type: 'Muscle Gain',
  },
];

export const SERVICES: TrainerService[] = [
  {
    id: '2',
    title: '1-on-1 Intensive Training',
    price: 150,
    duration: 60,
    description: 'High-intensity session with Twin. Focus on elite form, compound strength, and pushing mental limits.',
  }
];

export const SLOTS: BookingSlot[] = [
  { id: '1', time: '06:00 AM', available: true },
  { id: '2', time: '08:00 AM', available: false },
  { id: '3', time: '10:00 AM', available: true },
  { id: '4', time: '02:00 PM', available: true },
  { id: '5', time: '04:00 PM', available: true },
  { id: '6', time: '06:00 PM', available: false },
];

export const POSTS: Post[] = [
  {
    id: '1',
    userId: 'twin',
    userName: 'Twin (Coach)',
    userAvatar: 'https://picsum.photos/100/100?random=1',
    content: 'Client Session Recap: Form is everything. Watch how we controlled the negative on these rows. Built Strong. Built Tough. 🔥',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-athletic-man-lifting-weights-in-a-dark-gym-2384-large.mp4',
    likes: 142,
    comments: 12,
    timestamp: '2h ago',
    category: 'Workout',
    isTrainer: true,
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Sarah Jenkins',
    userAvatar: 'https://picsum.photos/100/100?random=2',
    content: 'Finally hit a plate (135lbs) on my squat! The Leg Day Destruction program is no joke 🥵',
    imageUrl: 'https://picsum.photos/600/400?random=10',
    likes: 45,
    comments: 8,
    timestamp: '4h ago',
    category: 'Achievement',
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Mike T.',
    userAvatar: 'https://picsum.photos/100/100?random=3',
    content: 'Question for the group: How are you guys hitting your protein goals on rest days? I feel like I’m always short.',
    likes: 12,
    comments: 24,
    timestamp: '6h ago',
    category: 'Nutrition',
  },
];
