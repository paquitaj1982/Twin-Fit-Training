
export interface ExerciseSet {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface ExerciseLog {
  id: string;
  name: string;
  sets: ExerciseSet[];
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

export interface WorkoutHistory {
  id: string;
  workoutId?: string;
  title: string;
  date: string;
  duration: number; // minutes
  exercises: ExerciseLog[];
}

export interface Workout {
  id: string;
  title: string;
  duration: number; // minutes
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string; // e.g., 'Upper Body', 'Strength', 'HIIT'
  imageUrl: string;
  videoUrl?: string; 
  description?: string;
  exercises?: string[]; // Standard exercise names for this blueprint
  tags?: string[]; 
  visibility?: 'public' | 'clients' | 'private'; 
  storagePath?: string; // Firebase storage path
  downloadURL?: string; // Final accessible URL
  createdAt?: any; // serverTimestamp or Date
  updatedAt?: any;
  ownerUid?: string;
}

export interface CoachSession {
  id: string;
  title: string;
  clientName?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  description: string;
  timestamp: string;
  category: 'Strength' | 'Conditioning' | 'PR' | 'Form Check';
}

export interface MealPlan {
  id: string;
  title: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  type: 'Fat Loss' | 'Muscle Gain' | 'Maintenance';
}

export interface BookingSlot {
  id: string;
  time: string;
  available: boolean;
  customPrice?: number; 
  reservedFor?: string; 
}

export interface TrainerService {
  id: string;
  title: string;
  price: number;
  duration: number;
  description: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string; 
  likes: number;
  comments: number;
  timestamp: string;
  category: 'General' | 'Workout' | 'Nutrition' | 'Achievement';
  isTrainer?: boolean;
}

export interface UserProfile {
  name: string;
  goals: string[]; 
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  weight: number; 
  height: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  isTrainer?: boolean;
  customCalories?: number; 
  earningsMTD?: number; // Total amount paid to trainer this month
  uid?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  time: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

export interface ExerciseItem {
  id: string;
  name: string;
  calories: number;
  time: string;
}

export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
}

export interface ProgressMedia {
  id: string;
  date: string;
  url: string;
  type: 'image' | 'video';
  note?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum Tab {
  DASHBOARD = 'dashboard',
  NUTRITION = 'nutrition',
  PROGRESS = 'progress',
  BOOK = 'book',
  LIVE = 'live',
  PROFILE = 'profile',
  ARCHIVES = 'archives',
  TRAIN = 'train'
}