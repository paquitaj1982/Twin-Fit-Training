import React, { useState, useEffect, useCallback } from 'react';
import { Home, Utensils, Calendar, Activity, PieChart, Bell, UserCircle, Library, Dumbbell, ChevronRight, LayoutDashboard, History, Settings, LogOut, Menu, X as CloseIcon } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Nutrition } from './components/Nutrition';
import { Progress } from './components/Progress';
import { Booking } from './components/Booking';
import { LiveActive } from './components/LiveActive';
import { Onboarding } from './components/Onboarding';
import { Profile } from './components/Profile';
import { Chatbot } from './components/Chatbot';
import { CoachVault } from './components/CoachVault';
import { Training } from './components/Training';
import { Tab, BookingSlot, UserProfile, FoodItem, ExerciseItem, TrainerService, ProgressMedia, WeightEntry, CoachSession, Workout, WorkoutHistory } from './types';
import { SLOTS, SERVICES, WORKOUTS } from './constants';

function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [services, setServices] = useState<TrainerService[]>(SERVICES);
  const [bookingSlots, setBookingSlots] = useState<BookingSlot[]>(SLOTS);
  const [nextBooking, setNextBooking] = useState<BookingSlot | null>(null);

  // --- INDIVIDUAL TRACKING STATE ---
  const [foodLog, setFoodLog] = useState<FoodItem[]>([]);
  const [exerciseLog, setExerciseLog] = useState<ExerciseItem[]>([]);
  const [waterIntake, setWaterIntake] = useState(0);
  const [weightData, setWeightData] = useState<WeightEntry[]>([]);
  const [progressGallery, setProgressGallery] = useState<ProgressMedia[]>([]);
  const [coachSessions, setCoachSessions] = useState<CoachSession[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>(WORKOUTS);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistory[]>([]);

  // --- LIVE WORKOUT STATE ---
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutSeconds, setWorkoutSeconds] = useState(0);
  const [workoutCalories, setWorkoutCalories] = useState(0);
  const [workoutHeartRate, setWorkoutHeartRate] = useState(0);
  const [workoutSets, setWorkoutSets] = useState(0);
  const [intensity, setIntensity] = useState<'Low' | 'Med' | 'High'>('Med');

  useEffect(() => {
    const savedUser = localStorage.getItem('twinFitUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      loadUserData(parsedUser.name);
    }
  }, []);

  const loadUserData = (userName: string) => {
    const dataKey = `twinFitData_${userName.toLowerCase().replace(/\s+/g, '_')}`;
    const savedData = localStorage.getItem(dataKey);
    const today = new Date().toDateString();

    if (savedData) {
      const data = JSON.parse(savedData);
      if (data.lastUpdateDate !== today) {
        setWaterIntake(0);
        setFoodLog([]);
        setExerciseLog([]);
      } else {
        setWaterIntake(data.waterIntake || 0);
        setFoodLog(data.foodLog || []);
        setExerciseLog(data.exerciseLog || []);
      }
      setWeightData(data.weightData || [{ id: '1', date: 'Start', weight: 180 }]);
      setProgressGallery(data.progressGallery || []);
      setCoachSessions(data.coachSessions || []);
      setWorkouts(data.workouts || WORKOUTS);
      setWorkoutHistory(data.workoutHistory || []);
    } else {
      setWaterIntake(0);
      setFoodLog([]);
      setExerciseLog([]);
      setWeightData([{ id: '1', date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), weight: 180 }]);
      setProgressGallery([]);
      setCoachSessions([]);
      setWorkouts(WORKOUTS);
      setWorkoutHistory([]);
    }
  };

  useEffect(() => {
    if (!user) return;
    const dataKey = `twinFitData_${user.name.toLowerCase().replace(/\s+/g, '_')}`;
    const today = new Date().toDateString();
    const dataToSave = {
      lastUpdateDate: today,
      waterIntake,
      foodLog,
      exerciseLog,
      weightData,
      progressGallery,
      coachSessions,
      workouts,
      workoutHistory
    };
    localStorage.setItem(dataKey, JSON.stringify(dataToSave));
  }, [user, waterIntake, foodLog, exerciseLog, weightData, progressGallery, coachSessions, workouts, workoutHistory]);

  useEffect(() => {
    let interval: any = null;
    if (isWorkoutActive) {
      interval = setInterval(() => {
        setWorkoutSeconds(s => s + 1);
        let burnRate = intensity === 'High' ? 0.25 : intensity === 'Med' ? 0.15 : 0.1;
        let baseHeartRate = intensity === 'High' ? 160 : intensity === 'Med' ? 130 : 110;
        setWorkoutCalories(c => c + burnRate); 
        setWorkoutHeartRate(baseHeartRate + (Math.floor(Math.random() * 5) - 2));
      }, 1000);
    } else {
      clearInterval(interval);
      setWorkoutHeartRate(0);
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive, intensity]);

  const toggleWorkout = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsWorkoutActive(!isWorkoutActive);
  };
  
  const endWorkout = () => {
    if (workoutCalories > 10) {
        setExerciseLog(prev => [{
            id: Date.now().toString(),
            name: `Live Session (${workoutSets} Sets)`,
            calories: Math.floor(workoutCalories),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }, ...prev]);
    }
    setIsWorkoutActive(false);
    setWorkoutSeconds(0);
    setWorkoutCalories(0);
    setWorkoutHeartRate(0);
    setWorkoutSets(0);
  };

  const addWaterFromLive = () => setWaterIntake(prev => Math.min(prev + 0.25, 5));
  const handleUpdateSlot = (updatedSlot: BookingSlot) => setBookingSlots(prev => prev.map(slot => slot.id === updatedSlot.id ? updatedSlot : slot));
  const handleUpdateService = (updatedService: TrainerService) => setServices(prev => prev.map(service => service.id === updatedService.id ? updatedService : service));
  const handleAddFood = (item: FoodItem) => setFoodLog(prev => [item, ...prev]);
  const handleUpdateFood = (updatedItem: FoodItem) => setFoodLog(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  const handleDeleteFood = (id: string) => setFoodLog(prev => prev.filter(item => item.id !== id));
  const handleAddExercise = (item: ExerciseItem) => setExerciseLog(prev => [item, ...prev]);

  const handleUserUpdate = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    localStorage.setItem('twinFitUser', JSON.stringify(updatedUser));
    loadUserData(updatedUser.name);
  };

  const handleUpdateEarnings = (amount: number) => {
      if (user) {
          handleUserUpdate({ ...user, earningsMTD: amount });
      }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('twinFitUser');
    setActiveTab(Tab.DASHBOARD);
  };

  const getCalorieGoal = () => {
    if (!user) return 2500;
    if (user.customCalories) return user.customCalories;
    let base = user.gender === 'Male' ? 2000 : 1600;
    base += (user.weight || 180) * 5; 
    let adjustment = 0;
    if (user.goals?.includes('Fat Loss')) adjustment -= 500;
    if (user.goals?.includes('Muscle Gain')) adjustment += 500;
    return Math.max(1200, Math.round(base + adjustment));
  };

  const totalCaloriesIn = foodLog.reduce((sum, item) => sum + item.calories, 0);
  const totalCaloriesBurned = exerciseLog.reduce((sum, item) => sum + item.calories, 0) + workoutCalories;

  if (!user) return <Onboarding onComplete={handleUserUpdate} />;

  const navItems = [
    { id: Tab.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
    { id: Tab.TRAIN, icon: Dumbbell, label: 'Train' },
    { id: Tab.NUTRITION, icon: Utensils, label: 'Fuel' },
    { id: Tab.PROGRESS, icon: PieChart, label: 'Stats' },
    { id: Tab.BOOK, icon: Calendar, label: 'Book' },
    { id: Tab.PROFILE, icon: UserCircle, label: 'Profile' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case Tab.DASHBOARD:
        return <Dashboard 
          onNavigate={(tab) => setActiveTab(tab)} 
          nutrition={{ calories: totalCaloriesIn, water: waterIntake }} 
          burnedCalories={totalCaloriesBurned} 
          nextBooking={nextBooking} 
          user={user} 
          calorieGoal={getCalorieGoal()} 
          liveWorkout={{ isActive: isWorkoutActive, seconds: workoutSeconds, calories: workoutCalories }} 
          onToggleWorkout={toggleWorkout} 
          onAddExercise={handleAddExercise} 
          onAddWater={(amount) => setWaterIntake(prev => Math.min(prev + amount, 5))}
          onUpdateEarnings={handleUpdateEarnings}
        />;
      case Tab.TRAIN:
        return <Training workouts={workouts} setWorkouts={setWorkouts} workoutHistory={workoutHistory} setWorkoutHistory={setWorkoutHistory} isTrainer={user.isTrainer} />;
      case Tab.NUTRITION:
        return <Nutrition foodLog={foodLog} waterIntake={waterIntake} setWaterIntake={setWaterIntake} onAddFood={handleAddFood} onUpdateFood={handleUpdateFood} onDeleteFood={handleDeleteFood} calorieGoal={getCalorieGoal()} burnedCalories={totalCaloriesBurned} onUpdateGoal={(newGoal) => handleUserUpdate({ ...user, customCalories: newGoal })} />;
      case Tab.PROGRESS:
        return <Progress weightData={weightData} setWeightData={setWeightData} media={progressGallery} setMedia={setProgressGallery} />;
      case Tab.BOOK:
        return <Booking onBookSession={setNextBooking} slots={bookingSlots} isTrainer={user.isTrainer} onUpdateSlot={handleUpdateSlot} services={services} onUpdateService={handleUpdateService} />;
      case Tab.LIVE:
        return <LiveActive isActive={isWorkoutActive} seconds={workoutSeconds} calories={workoutCalories} heartRate={workoutHeartRate} sets={workoutSets} intensity={intensity} onToggle={toggleWorkout} onEnd={endWorkout} onAddWater={addWaterFromLive} onLogSet={() => setWorkoutSets(s => s + 1)} onSetIntensity={setIntensity} />;
      case Tab.PROFILE:
        return <Profile user={user} onUpdate={handleUserUpdate} onLogout={handleLogout} />;
      default:
        return <Dashboard onNavigate={(tab) => setActiveTab(tab)} nutrition={{ calories: totalCaloriesIn, water: waterIntake }} burnedCalories={totalCaloriesBurned} nextBooking={nextBooking} user={user} calorieGoal={getCalorieGoal()} onAddExercise={handleAddExercise} onAddWater={(amount) => setWaterIntake(prev => Math.min(prev + amount, 5))} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex selection:bg-brand-red selection:text-white">
      {/* Computer Sidebar (Lg screens) */}
      <aside className="hidden lg:flex flex-col w-72 bg-neutral-950 border-r border-neutral-900 sticky top-0 h-screen z-50">
        <div className="p-8">
            <div className="flex items-center gap-3 mb-12">
                <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center transform rotate-3 shadow-lg shadow-red-900/40">
                    <span className="font-display font-bold text-white text-2xl uppercase tracking-tighter">T</span>
                </div>
                <div>
                    <span className="font-display font-bold text-3xl tracking-wide uppercase text-white leading-none">Twin Fit</span>
                    <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-[0.4em] leading-none mt-1">Built Strong.</p>
                </div>
            </div>

            <nav className="space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${
                                isActive ? 'bg-brand-red text-white shadow-xl shadow-red-900/20' : 'text-neutral-500 hover:bg-neutral-900 hover:text-white'
                            }`}
                        >
                            <Icon className={`w-6 h-6 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} strokeWidth={isActive ? 3 : 2} />
                            <span className="font-display font-bold text-xl uppercase tracking-widest">{item.label}</span>
                            {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                        </button>
                    );
                })}
            </nav>
        </div>

        <div className="mt-auto p-8 space-y-4">
            {isWorkoutActive && (
                <button onClick={() => setActiveTab(Tab.LIVE)} className="w-full bg-red-900/10 border border-brand-red/30 p-4 rounded-2xl flex items-center gap-3 animate-pulse group hover:bg-red-900/20 transition-all">
                    <Activity className="w-5 h-5 text-brand-red" />
                    <div className="text-left">
                        <p className="text-[10px] font-bold text-brand-red uppercase tracking-widest">Live Mission</p>
                        <p className="text-sm font-bold text-white tabular-nums">{Math.floor(workoutCalories)} KCAL BURNED</p>
                    </div>
                </button>
            )}
            <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-display font-bold text-neutral-500">
                    {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{user.name}</p>
                    <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">{user.level} ATHLETE</p>
                </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 text-neutral-600 hover:text-red-500 transition-colors text-[10px] font-bold uppercase tracking-[0.3em]">
                <LogOut className="w-3.3 h-3.3" /> Sign Out Archive
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header - Mobile/Tablet only */}
        <header className="lg:hidden sticky top-0 left-0 right-0 z-[60] bg-black/80 backdrop-blur-md border-b border-neutral-900 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2" onClick={() => setActiveTab(Tab.DASHBOARD)}>
                <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center transform rotate-3">
                    <span className="font-display font-bold text-white text-xl uppercase tracking-tighter">T</span>
                </div>
                <span className="font-display font-bold text-2xl tracking-wide uppercase text-white">Twin Fit</span>
            </div>
            <div className="flex items-center gap-3">
                {isWorkoutActive && (
                    <button onClick={() => setActiveTab(Tab.LIVE)} className="w-10 h-10 bg-brand-red/10 border border-brand-red/30 rounded-xl flex items-center justify-center text-brand-red animate-pulse">
                        <Activity className="w-5 h-5" />
                    </button>
                )}
                <button onClick={() => setActiveTab(Tab.PROFILE)} className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 overflow-hidden flex items-center justify-center text-neutral-400">
                    {user.name ? <span className="font-bold font-display uppercase text-lg">{user.name.charAt(0)}</span> : <UserCircle className="w-full h-full" />}
                </button>
            </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 lg:p-12 overflow-x-hidden">
            <div className="max-w-[1400px] mx-auto w-full">
                {renderContent()}
            </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-900 z-[60] pb-safe">
        <div className="flex justify-around items-center h-16 sm:h-20 max-w-4xl mx-auto px-4">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all group ${
                  isActive ? 'text-brand-red' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-brand-red/10' : 'group-hover:bg-neutral-900'}`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 3 : 2} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest truncate transition-opacity ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <Chatbot user={user} />
    </div>
  );
}

export default App;