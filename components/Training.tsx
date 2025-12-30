import React, { useState, useEffect } from 'react';
import { Play, Clock, BarChart2, Plus, Edit2, Trash2, X, CheckCircle, Upload, Info, Camera, Video, Image as ImageIcon, Lock, ShieldCheck, Tag, Globe, Users, EyeOff, Save, Loader2, BadgeCheck, RefreshCcw, History, ArrowLeft, MoreHorizontal, Check, Minus, Dumbbell, Zap, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { Workout, WorkoutHistory, ExerciseLog, ExerciseSet } from '../types';

interface TrainingProps {
  workouts: Workout[];
  setWorkouts: React.Dispatch<React.SetStateAction<Workout[]>>;
  workoutHistory: WorkoutHistory[];
  setWorkoutHistory: React.Dispatch<React.SetStateAction<WorkoutHistory[]>>;
  onStartWorkout?: () => void;
  isTrainer?: boolean;
}

export const Training: React.FC<TrainingProps> = ({ workouts, setWorkouts, workoutHistory, setWorkoutHistory, isTrainer }) => {
  const [view, setView] = useState<'library' | 'history' | 'active'>('library');
  const [filter, setFilter] = useState<string>('All');
  const [videoErrors, setVideoErrors] = useState<Record<string, boolean>>({});
  
  // --- ACTIVE SESSION STATE ---
  const [activeSession, setActiveSession] = useState<WorkoutHistory | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [activeDuration, setActiveDuration] = useState(0);

  // --- MODAL / EDITOR STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('video');
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Workout>>({
    title: '',
    duration: 30,
    level: 'Intermediate',
    category: 'Upper Body',
    imageUrl: '',
    videoUrl: '',
    description: '',
    visibility: 'public',
    tags: []
  });

  // --- EXERCISE BRIEF MODAL STATE ---
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [editingExId, setEditingExId] = useState<string | null>(null);
  const [briefFormData, setBriefFormData] = useState<{
    name: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
  }>({ name: '', mediaUrl: '', mediaType: 'image' });

  // Track session timer
  useEffect(() => {
    let interval: any;
    if (view === 'active' && sessionStartTime) {
      interval = setInterval(() => {
        setActiveDuration(Math.floor((Date.now() - sessionStartTime) / 60000));
      }, 10000); // Check every 10s
    }
    return () => clearInterval(interval);
  }, [view, sessionStartTime]);

  const categories = ['All', 'Upper Body', 'Lower Body', 'Strength', 'HIIT', 'Cardio'];

  // --- SESSION ACTIONS ---
  const startNewWorkout = (blueprint?: Workout) => {
    const session: WorkoutHistory = {
      id: `session-${Date.now()}`,
      workoutId: blueprint?.id,
      title: blueprint?.title || 'Custom Session',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      duration: 0,
      exercises: blueprint?.exercises?.map(name => ({
        id: `ex-${Math.random()}`,
        name,
        sets: [{ id: `set-${Math.random()}`, reps: 10, weight: 0, completed: false }]
      })) || []
    };
    setActiveSession(session);
    setSessionStartTime(Date.now());
    setActiveDuration(0);
    setView('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openBriefModal = (ex?: ExerciseLog) => {
    if (ex) {
      setEditingExId(ex.id);
      setBriefFormData({
        name: ex.name,
        mediaUrl: ex.mediaUrl || '',
        mediaType: ex.mediaType || 'image'
      });
    } else {
      setEditingExId(null);
      setBriefFormData({ name: '', mediaUrl: '', mediaType: 'image' });
    }
    setIsBriefModalOpen(true);
  };

  const handleSaveBrief = () => {
    if (!activeSession || !briefFormData.name) return;

    if (editingExId) {
      const updated = activeSession.exercises.map(ex => 
        ex.id === editingExId ? { ...ex, ...briefFormData } : ex
      );
      setActiveSession({ ...activeSession, exercises: updated });
    } else {
      const newEx: ExerciseLog = {
        id: `ex-${Date.now()}`,
        ...briefFormData,
        sets: [{ id: `set-${Math.random()}`, reps: 10, weight: 0, completed: false }]
      };
      setActiveSession({
        ...activeSession,
        exercises: [...activeSession.exercises, newEx]
      });
    }
    setIsBriefModalOpen(false);
  };

  const handleBriefMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBriefFormData(prev => ({ ...prev, mediaUrl: url, mediaType: type }));
    }
  };

  const addSetToExercise = (exId: string) => {
    if (!activeSession) return;
    const updated = activeSession.exercises.map(ex => {
      if (ex.id === exId) {
        const lastSet = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [...ex.sets, { 
            id: `set-${Math.random()}`, 
            reps: lastSet?.reps || 10, 
            weight: lastSet?.weight || 0, 
            completed: false 
          }]
        };
      }
      return ex;
    });
    setActiveSession({ ...activeSession, exercises: updated });
  };

  const updateSet = (exId: string, setId: string, updates: Partial<ExerciseSet>) => {
    if (!activeSession) return;
    const updated = activeSession.exercises.map(ex => {
      if (ex.id === exId) {
        return {
          ...ex,
          sets: ex.sets.map(s => s.id === setId ? { ...s, ...updates } : s)
        };
      }
      return ex;
    });
    setActiveSession({ ...activeSession, exercises: updated });
  };

  const removeSet = (exId: string, setId: string) => {
      if (!activeSession) return;
      const updated = activeSession.exercises.map(ex => {
          if (ex.id === exId) {
              return { ...ex, sets: ex.sets.filter(s => s.id !== setId) };
          }
          return ex;
      });
      setActiveSession({ ...activeSession, exercises: updated });
  };

  const finishWorkout = () => {
    if (!activeSession) return;
    if (confirm("Built Strong. Built Tough. Commit this session to history?")) {
      const finalSession = { ...activeSession, duration: activeDuration };
      setWorkoutHistory([finalSession, ...workoutHistory]);
      setActiveSession(null);
      setSessionStartTime(null);
      setView('history');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenModal = (workout?: Workout) => {
    if (!isTrainer) return; 
    if (workout) {
      setEditingId(workout.id);
      setFormData({ ...workout });
      setMediaType(workout.videoUrl ? 'video' : 'image');
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        duration: 30,
        level: 'Advanced',
        category: 'Upper Body',
        imageUrl: `https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&h=1422&auto=format&fit=crop`,
        videoUrl: '',
        visibility: 'public',
        description: '',
        tags: []
      });
      setMediaType('video');
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !isTrainer) return;
    setIsSaving(true);
    setTimeout(() => {
        if (editingId) {
            setWorkouts(prev => prev.map(w => w.id === editingId ? { ...w, ...formData } as Workout : w));
        } else {
            const newWorkout: Workout = {
                ...formData as Workout,
                id: `workout-${Date.now()}`,
                createdAt: new Date(),
                updatedAt: new Date(),
                ownerUid: 'twin-uid-master',
            };
            setWorkouts(prev => [newWorkout, ...prev]);
        }
        setIsSaving(false);
        setIsModalOpen(false);
    }, 800);
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
        const url = URL.createObjectURL(file);
        if (type === 'image') setFormData({ ...formData, imageUrl: url });
        else setFormData({ ...formData, videoUrl: url });
    }
  };

  const removeHistoryEntry = (id: string) => {
      if (confirm("Delete this session record?")) {
          setWorkoutHistory(prev => prev.filter(h => h.id !== id));
      }
  };

  // --- RENDERING HELPERS ---
  const renderLibrary = () => (
    <div className="space-y-8 pb-32 animate-fade-in px-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight leading-none">Training Mission</h2>
                <p className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-[0.2em] mt-1 italic">Built Strong. Built Tough.</p>
            </div>
            {isTrainer && (
                <button onClick={() => handleOpenModal()} className="w-full md:w-auto bg-brand-red text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-display font-bold text-xl shadow-xl active:scale-95 transition-all">
                    <Plus className="w-6 h-6" /> NEW BLUEPRINT
                </button>
            )}
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
            <button 
                onClick={() => startNewWorkout()}
                className="flex-1 bg-neutral-900 border border-neutral-800 p-5 md:p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 hover:border-brand-red transition-all shadow-xl active:scale-95 group"
            >
                <div className="w-12 h-12 md:w-16 md:h-16 bg-neutral-800 rounded-full flex items-center justify-center text-brand-red group-hover:bg-brand-red group-hover:text-white transition-all shadow-lg">
                    <Plus className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-neutral-400 text-center">Start Custom Session</span>
            </button>
            <button 
                onClick={() => setView('history')}
                className="flex-1 bg-neutral-900 border border-neutral-800 p-5 md:p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 hover:border-brand-red transition-all shadow-xl active:scale-95 group"
            >
                <div className="w-12 h-12 md:w-16 md:h-16 bg-neutral-800 rounded-full flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg">
                    <History className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-neutral-400 text-center">Archive History</span>
            </button>
        </div>

        <div className="space-y-6 pt-4">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-neutral-900 border border-neutral-800 rounded-xl">
                        <ShieldCheck className="w-5 h-5 text-brand-red" />
                    </div>
                    <h3 className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-[0.2em]">Blueprint Library</h3>
                </div>
                <div className="flex bg-neutral-950 p-1.5 rounded-full border border-neutral-800 overflow-x-auto no-scrollbar">
                    {categories.map((cat) => (
                        <button key={cat} onClick={() => setFilter(cat)} className={`px-5 py-2.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all tracking-widest ${filter === cat ? 'bg-brand-red text-white shadow-lg scale-105' : 'text-neutral-500 hover:text-white'}`}>
                            {cat.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3">
                {workouts.filter(w => filter === 'All' || w.category === filter).map((workout) => (
                    <div key={workout.id} className="group relative bg-neutral-900 rounded-[2.5rem] overflow-hidden border border-neutral-800 hover:border-brand-red transition-all shadow-2xl flex flex-col active:scale-[0.98]">
                        <div className="aspect-[9/16] relative bg-neutral-950 overflow-hidden">
                            <img src={workout.imageUrl} alt={workout.title} className="w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10 pointer-events-none"></div>
                            <div className="absolute bottom-4 left-4 right-4 z-20">
                                <span className="inline-block px-2 py-0.5 rounded bg-brand-red text-white text-[9px] font-bold uppercase tracking-widest shadow-lg mb-2">
                                    {workout.level}
                                </span>
                                <h3 className="text-lg md:text-xl font-bold font-display leading-tight uppercase tracking-tighter text-white drop-shadow-lg line-clamp-2">{workout.title}</h3>
                                <div className="flex justify-between items-center text-[8px] md:text-[9px] font-bold uppercase text-neutral-400 mt-2 tracking-widest">
                                    <div className="flex items-center"><Clock className="w-3 h-3 mr-1" />{workout.duration}M</div>
                                    <div className="flex items-center"><BarChart2 className="w-3 h-3 mr-1" />{workout.category}</div>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 md:p-4 bg-neutral-900">
                            <button onClick={() => startNewWorkout(workout)} className="w-full py-3 md:py-4 rounded-2xl bg-neutral-800 flex items-center justify-center text-white text-[9px] md:text-[10px] font-bold hover:bg-brand-red transition-all gap-2 border border-neutral-700 hover:border-brand-red uppercase tracking-widest">
                                <Play className="w-3 h-3 fill-current" /> EXECUTE
                            </button>
                        </div>
                        {isTrainer && (
                            <div className="absolute top-4 right-4 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={(e) => { e.stopPropagation(); handleOpenModal(workout); }} className="p-2.5 bg-black/60 backdrop-blur-md rounded-xl text-white border border-neutral-700 hover:bg-brand-red transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                                <button onClick={(e) => { e.stopPropagation(); setWorkouts(prev => prev.filter(w => w.id !== workout.id)); }} className="p-2.5 bg-black/60 backdrop-blur-md rounded-xl text-white border border-neutral-700 hover:bg-red-700 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    </div>
  );

  const renderActiveTracker = () => (
    <div className="flex flex-col h-full animate-fade-in relative">
        <div className="sticky top-20 z-40 bg-black/90 backdrop-blur-xl border border-neutral-800 rounded-[2rem] p-4 md:p-6 mb-8 flex justify-between items-center shadow-2xl">
            <div className="flex items-center gap-3">
                <button onClick={() => setView('library')} className="p-3 bg-neutral-900 rounded-xl text-neutral-400 active:scale-95 transition-all"><ArrowLeft className="w-5 h-5" /></button>
                <div>
                    <h2 className="text-xl md:text-3xl font-display font-bold uppercase tracking-tight leading-none truncate max-w-[150px] md:max-w-none">{activeSession?.title}</h2>
                    <div className="flex items-center gap-1.5 mt-1">
                       <div className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
                       <p className="text-[10px] font-bold text-brand-red uppercase tracking-widest animate-pulse">{activeDuration} MIN ACTIVE</p>
                    </div>
                </div>
            </div>
            <button onClick={finishWorkout} className="bg-brand-red text-white px-6 py-3 rounded-2xl font-display font-bold text-xl shadow-xl active:scale-95 transition-all">FINISH</button>
        </div>

        <div className="space-y-6 pb-40">
            {activeSession?.exercises.map((ex) => (
                <div key={ex.id} className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="flex justify-between items-center mb-6 relative">
                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                            <button 
                                onClick={() => openBriefModal(ex)}
                                className="p-2.5 bg-neutral-950 rounded-xl shadow-inner active:bg-brand-red group"
                            >
                                {ex.mediaUrl ? (
                                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-neutral-800 group-active:border-white">
                                        {ex.mediaType === 'video' ? (
                                            <video src={ex.mediaUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={ex.mediaUrl} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                ) : (
                                    <Dumbbell className="w-5 h-5 text-brand-red group-active:text-white" />
                                )}
                            </button>
                            <h3 className="text-xl md:text-2xl font-display font-bold uppercase tracking-tight text-white truncate cursor-pointer hover:text-brand-red transition-colors" onClick={() => openBriefModal(ex)}>
                                {ex.name}
                            </h3>
                            <button onClick={() => openBriefModal(ex)} className="text-neutral-600 hover:text-white transition-colors">
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <button onClick={() => addSetToExercise(ex.id)} className="p-2.5 bg-neutral-800 rounded-xl text-neutral-400 active:bg-brand-red active:text-white transition-all shadow-lg ml-2"><Plus className="w-5 h-5" /></button>
                    </div>

                    {ex.mediaUrl && (
                        <div className="mb-4 rounded-2xl overflow-hidden aspect-video bg-neutral-950 border border-neutral-800 max-h-48 flex justify-center">
                            {ex.mediaType === 'video' ? (
                                <video src={ex.mediaUrl} controls className="h-full object-contain" />
                            ) : (
                                <img src={ex.mediaUrl} className="h-full object-contain" />
                            )}
                        </div>
                    )}

                    <div className="space-y-4 relative">
                        <div className="grid grid-cols-12 gap-3 text-[8px] font-bold text-neutral-500 uppercase tracking-widest px-2">
                            <div className="col-span-1 text-center">SET</div>
                            <div className="col-span-4 text-center">LBS</div>
                            <div className="col-span-4 text-center">REPS</div>
                            <div className="col-span-3 text-right">ACTION</div>
                        </div>

                        {ex.sets.map((set, idx) => (
                            <div key={set.id} className={`grid grid-cols-12 gap-3 items-center p-3 rounded-2xl transition-all duration-300 ${set.completed ? 'bg-brand-red/10 border border-brand-red/30 scale-[0.98]' : 'bg-neutral-950 border border-neutral-900 shadow-inner'}`}>
                                <div className="col-span-1 font-display font-bold text-neutral-500 flex justify-center text-xl">{idx + 1}</div>
                                <div className="col-span-4">
                                    <input 
                                        type="number" 
                                        inputMode="numeric"
                                        value={set.weight || ''} 
                                        placeholder="0"
                                        onChange={(e) => updateSet(ex.id, set.id, { weight: Number(e.target.value) })}
                                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 px-2 text-center font-bold text-white outline-none focus:border-brand-red shadow-inner text-lg transition-colors"
                                    />
                                </div>
                                <div className="col-span-4">
                                    <input 
                                        type="number" 
                                        inputMode="numeric"
                                        value={set.reps || ''} 
                                        placeholder="0"
                                        onChange={(e) => updateSet(ex.id, set.id, { reps: Number(e.target.value) })}
                                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 px-2 text-center font-bold text-white outline-none focus:border-brand-red shadow-inner text-lg transition-colors"
                                    />
                                </div>
                                <div className="col-span-3 flex justify-end gap-2">
                                    <button 
                                        onClick={() => updateSet(ex.id, set.id, { completed: !set.completed })}
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 ${set.completed ? 'bg-brand-red text-white shadow-xl' : 'bg-neutral-800 text-neutral-600'}`}
                                    >
                                        <Check className="w-6 h-6" strokeWidth={3} />
                                    </button>
                                </div>
                                {idx === ex.sets.length - 1 && ex.sets.length > 1 && (
                                     <button onClick={() => removeSet(ex.id, set.id)} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-neutral-800 text-neutral-500 flex items-center justify-center border border-neutral-700 shadow-lg"><X className="w-3 h-3" /></button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <button 
                onClick={() => openBriefModal()}
                className="w-full py-10 bg-neutral-900/30 border-2 border-dashed border-neutral-800 rounded-[3rem] flex flex-col items-center justify-center gap-3 text-neutral-500 active:text-brand-red active:border-brand-red transition-all shadow-xl active:scale-[0.98]"
            >
                <div className="p-4 bg-neutral-900 rounded-full shadow-inner">
                   <Plus className="w-8 h-8" />
                </div>
                <span className="font-display font-bold text-2xl uppercase tracking-tighter">New Exercise Brief</span>
            </button>
        </div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-8 pb-32 animate-fade-in px-1">
        <div className="flex items-center gap-4">
            <button onClick={() => setView('library')} className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800 text-neutral-400 active:scale-95 transition-all shadow-lg"><ArrowLeft className="w-6 h-6" /></button>
            <h2 className="text-4xl font-display font-bold uppercase tracking-tight leading-none">Athlete Archives</h2>
        </div>

        <div className="space-y-4">
            {workoutHistory.length === 0 ? (
                <div className="py-24 text-center bg-neutral-900/20 rounded-[3rem] border border-dashed border-neutral-800 flex flex-col items-center gap-4">
                    <History className="w-12 h-12 text-neutral-800" />
                    <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-[0.3em]">No mission records found.</p>
                </div>
            ) : (
                workoutHistory.map((h) => (
                    <div key={h.id} className="bg-neutral-900/50 border border-neutral-800 rounded-[2.5rem] p-6 group hover:border-brand-red/50 transition-all shadow-xl relative overflow-hidden active:scale-[0.98]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 rounded-full blur-3xl"></div>
                        <div className="flex justify-between items-start mb-5 relative">
                            <div>
                                <h3 className="text-2xl font-display font-bold uppercase tracking-tight text-white mb-1">{h.title}</h3>
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{h.date} • {h.duration} MIN SESSION</p>
                            </div>
                            <button onClick={() => removeHistoryEntry(h.id)} className="p-2.5 text-neutral-600 hover:text-red-500 transition-colors active:scale-90"><Trash2 className="w-5 h-5" /></button>
                        </div>
                        
                        <div className="space-y-2 relative">
                            {h.exercises.slice(0, 3).map(ex => (
                                <div key={ex.id} className="text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-tighter flex justify-between items-center py-2 border-b border-neutral-800/50">
                                    <span className="flex items-center gap-2">
                                        {ex.mediaUrl ? (
                                            <div className="w-4 h-4 rounded-sm overflow-hidden border border-neutral-700">
                                                <img src={ex.mediaUrl} className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <Dumbbell className="w-3 h-3 text-brand-red opacity-50" />
                                        )}
                                        {ex.name}
                                    </span>
                                    <span className="text-white bg-neutral-950 px-3 py-1 rounded-lg border border-neutral-800">{ex.sets.length} SETS</span>
                                </div>
                            ))}
                            {h.exercises.length > 3 && (
                                <div className="text-[9px] font-bold text-neutral-600 uppercase italic pt-2 flex items-center gap-1">
                                    <Plus className="w-2.5 h-2.5" /> {h.exercises.length - 3} additional exercises in recap
                                </div>
                            )}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button className="text-[10px] font-bold text-brand-red uppercase tracking-widest flex items-center gap-1">FULL RECAP <ChevronRight className="w-3 h-3" /></button>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );

  return (
    <div className="h-full">
        {view === 'library' && renderLibrary()}
        {view === 'active' && renderActiveTracker()}
        {view === 'history' && renderHistory()}

        {/* BLUEPRINT EDITOR MODAL */}
        {isModalOpen && isTrainer && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/98 backdrop-blur-3xl animate-fade-in">
                <div className="bg-neutral-900 border-t sm:border border-neutral-800 w-full max-w-2xl rounded-t-[3.5rem] sm:rounded-[4rem] p-8 md:p-12 relative max-h-[95vh] overflow-y-auto shadow-2xl no-scrollbar">
                    <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-neutral-500 hover:text-white p-2 z-50">
                        <X className="w-10 h-10" />
                    </button>
                    
                    <div className="mb-10 pt-4 md:pt-0">
                        <h3 className="text-5xl md:text-6xl font-display font-bold uppercase tracking-tighter leading-none mb-2 text-white text-center md:text-left">
                            {editingId ? 'Edit Asset' : 'New Blueprint'}
                        </h3>
                        <p className="text-[10px] md:text-xs font-bold text-brand-red uppercase tracking-[0.4em] text-center md:text-left">Built Strong. Built Tough.</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Media Blueprint (9:16)</label>
                            <div className="border-3 border-dashed border-neutral-800 rounded-[3rem] bg-neutral-950 aspect-[9/16] flex flex-col justify-center items-center overflow-hidden cursor-pointer relative group shadow-inner">
                                {formData.imageUrl ? (
                                    <img src={formData.imageUrl} className="w-full h-full object-cover opacity-60 transition-transform duration-700" />
                                ) : (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center border border-neutral-800">
                                            <Upload className="w-10 h-10 text-neutral-700" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase text-neutral-600 tracking-widest">Select Image</span>
                                    </div>
                                )}
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleMediaUpload(e, 'image')} />
                                {formData.imageUrl && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <RefreshCcw className="w-10 h-10 text-white mb-2" />
                                        <p className="text-[10px] font-bold text-white uppercase tracking-widest">Swap Blueprint</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Title</label>
                                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-5 text-white font-bold outline-none focus:border-brand-red text-lg shadow-inner" placeholder="Enter session title..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Mins</label>
                                    <input type="number" value={formData.duration} onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})} className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-5 text-white font-bold outline-none focus:border-brand-red text-center text-xl shadow-inner" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Tier</label>
                                    <select value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value as any})} className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-5 text-white font-bold outline-none focus:border-brand-red shadow-inner appearance-none">
                                        <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-8">
                                <Button onClick={handleSave} fullWidth className="h-20 rounded-[2.5rem] shadow-2xl text-2xl tracking-widest">
                                    {isSaving ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : 'COMMIT ASSET'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* EXERCISE BRIEF MODAL */}
        {isBriefModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/98 backdrop-blur-3xl animate-fade-in">
                <div className="bg-neutral-900 border-t sm:border border-neutral-800 w-full max-w-xl rounded-t-[3.5rem] sm:rounded-[3.5rem] p-8 md:p-10 relative max-h-[95vh] overflow-y-auto shadow-2xl no-scrollbar">
                    <button onClick={() => setIsBriefModalOpen(false)} className="absolute top-8 right-8 text-neutral-500 hover:text-white p-2 z-50">
                        <X className="w-10 h-10" />
                    </button>
                    
                    <div className="mb-8 pt-4 md:pt-0">
                        <h3 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tighter leading-none mb-1 text-white text-center md:text-left">
                            {editingExId ? 'Refine Brief' : 'New Exercise Brief'}
                        </h3>
                        <p className="text-[10px] font-bold text-brand-red uppercase tracking-[0.3em] text-center md:text-left">Active Session Intelligence</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Brief Asset (Visual)</label>
                            <div className="border-2 border-dashed border-neutral-800 rounded-3xl bg-neutral-950 aspect-square flex flex-col justify-center items-center overflow-hidden cursor-pointer relative group shadow-inner">
                                {briefFormData.mediaUrl ? (
                                    <div className="w-full h-full relative">
                                        {briefFormData.mediaType === 'video' ? (
                                            <video src={briefFormData.mediaUrl} className="w-full h-full object-cover opacity-60" muted playsInline loop />
                                        ) : (
                                            <img src={briefFormData.mediaUrl} className="w-full h-full object-cover opacity-60" />
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                                            <RefreshCcw className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center border border-neutral-800">
                                            <Camera className="w-8 h-8 text-neutral-700" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase text-neutral-600 tracking-widest text-center">Capture Form</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 flex gap-2 items-center justify-center opacity-0 group-hover:opacity-100 z-20">
                                    <label className="bg-neutral-800 p-2 rounded-lg cursor-pointer hover:bg-white hover:text-black transition-all">
                                        <ImageIcon className="w-5 h-5" />
                                        <input type="file" accept="image/*" onChange={(e) => handleBriefMediaUpload(e, 'image')} className="hidden" />
                                    </label>
                                    <label className="bg-neutral-800 p-2 rounded-lg cursor-pointer hover:bg-white hover:text-black transition-all">
                                        <Video className="w-5 h-5" />
                                        <input type="file" accept="video/*" onChange={(e) => handleBriefMediaUpload(e, 'video')} className="hidden" />
                                    </label>
                                </div>
                                {!briefFormData.mediaUrl && (
                                     <div className="absolute inset-0 flex gap-2 items-center justify-center z-10">
                                        <label className="bg-transparent w-1/2 h-full cursor-pointer">
                                            <input type="file" accept="image/*" onChange={(e) => handleBriefMediaUpload(e, 'image')} className="hidden" />
                                        </label>
                                        <label className="bg-transparent w-1/2 h-full cursor-pointer">
                                            <input type="file" accept="video/*" onChange={(e) => handleBriefMediaUpload(e, 'video')} className="hidden" />
                                        </label>
                                     </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Exercise Designation</label>
                                <input 
                                    type="text" 
                                    value={briefFormData.name} 
                                    onChange={(e) => setBriefFormData({...briefFormData, name: e.target.value})} 
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-5 text-white font-bold outline-none focus:border-brand-red text-lg shadow-inner" 
                                    placeholder="e.g. Weighted Pullups" 
                                />
                            </div>
                            
                            <div className="pt-4">
                                <Button onClick={handleSaveBrief} fullWidth className="h-16 rounded-2xl shadow-2xl text-xl tracking-widest">
                                    COMMIT BRIEF
                                </Button>
                                <Button variant="secondary" onClick={() => setIsBriefModalOpen(false)} fullWidth className="h-14 rounded-2xl mt-3 text-sm">
                                    ABORT
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};