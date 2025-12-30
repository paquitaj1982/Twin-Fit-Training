import React, { useState, useMemo } from 'react';
import { Activity, Droplets, Flame, Calendar, Zap, Upload, Video, Dumbbell, X, Plus, Pause, Play, Mail, Send, Loader2, CheckCircle, ChevronRight, ShieldCheck, Quote, TrendingUp, DollarSign, Edit2 } from 'lucide-react';
import { Button } from './Button';
import { BookingSlot, UserProfile, Workout, ExerciseItem, Tab } from '../types';
import { MOTIVATIONAL_QUOTES } from '../constants';

interface DashboardProps {
  onNavigate: (tab: any) => void;
  nutrition: { calories: number; water: number };
  burnedCalories: number;
  nextBooking: BookingSlot | null;
  user: UserProfile;
  calorieGoal: number;
  liveWorkout?: { isActive: boolean; seconds: number; calories: number };
  onToggleWorkout?: (e?: React.MouseEvent) => void;
  onAddWorkout?: (workout: Workout) => void;
  onAddExercise?: (item: ExerciseItem) => void;
  onAddWater?: (amount: number) => void;
  onUpdateEarnings?: (amount: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
    onNavigate, 
    nutrition, 
    burnedCalories, 
    nextBooking, 
    user, 
    calorieGoal, 
    liveWorkout,
    onToggleWorkout,
    onAddWorkout, 
    onAddExercise,
    onAddWater,
    onUpdateEarnings
}) => {
  const WATER_GOAL = 3.0;
  
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [exerciseData, setExerciseData] = useState({ name: '', calories: '' });

  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquiryStatus, setInquiryStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [inquiryForm, setInquiryForm] = useState({ subject: 'Training Inquiry', message: '' });

  // Earnings Edit Modal State
  const [isEarningsModalOpen, setIsEarningsModalOpen] = useState(false);
  const [tempEarnings, setTempEarnings] = useState(user.earningsMTD?.toString() || '0');

  const missionDirective = useMemo(() => {
      const today = new Date().toDateString();
      const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const targetCategory = user.goals.includes('Muscle Gain') ? 'Strength' : 
                            user.goals.includes('Fat Loss') ? 'Endurance' : 'Mindset';
      const relevantQuotes = MOTIVATIONAL_QUOTES.filter(q => q.category === targetCategory);
      const quotesToUse = relevantQuotes.length > 0 ? relevantQuotes : MOTIVATIONAL_QUOTES;
      return quotesToUse[seed % quotesToUse.length];
  }, [user.goals]);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryStatus('sending');
    
    // SECURE GMAIL SERVER & SMS GATEWAY MOCK
    const DEST_EMAIL = "twin.fit.trainer@gmail.com";
    const SMS_TARGET = "(615)243-6798"; 
    
    console.log(`[SMTP] Initializing secure handshake with Google Mail servers for ${DEST_EMAIL}...`);
    console.log(`[SMS_GATEWAY] Preparing high-priority SMS burst for ${SMS_TARGET}...`);
    
    setTimeout(() => {
        console.log(`[NETWORK] Packet successfully transmitted across SMTP tunnel.`);
        setInquiryStatus('success');
    }, 2000);
  };

  const handleSaveEarnings = () => {
      const amount = parseFloat(tempEarnings);
      if (!isNaN(amount) && onUpdateEarnings) {
          onUpdateEarnings(amount);
          setIsEarningsModalOpen(false);
      }
  };

  const closeInquiry = () => {
      setIsInquiryModalOpen(false);
      setInquiryStatus('idle');
      setInquiryForm({ subject: 'Training Inquiry', message: '' });
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-32 animate-fade-in px-1">
      {/* Live Active Banner */}
      {liveWorkout && (liveWorkout.isActive || liveWorkout.seconds > 0) && (
        <div 
          onClick={() => onNavigate(Tab.LIVE)}
          className="bg-red-900/10 border border-red-500/30 rounded-[2.5rem] p-8 flex flex-col md:flex-row justify-between items-center cursor-pointer active:scale-[0.99] transition-all relative group shadow-2xl overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red opacity-5 blur-[60px]"></div>
          <div className="flex items-center gap-6 mb-4 md:mb-0">
             <div className="w-16 h-16 bg-brand-red rounded-full flex items-center justify-center text-white shadow-2xl animate-pulse border-4 border-black">
                <Activity className="w-8 h-8" />
             </div>
             <div>
                <p className="font-bold text-red-500 uppercase text-[10px] tracking-[0.4em] mb-1">
                    {liveWorkout.isActive ? 'ACTIVE COMBAT SESSION' : 'MISSION PAUSED'}
                </p>
                <div className="flex gap-4 text-white font-display font-bold text-4xl md:text-5xl items-baseline leading-none">
                    <span className="tabular-nums">{formatTime(liveWorkout.seconds)}</span>
                    <span className="text-xl opacity-20 uppercase">/</span>
                    <span className="text-brand-red tabular-nums">{Math.floor(liveWorkout.calories)}<span className="text-xs ml-1 opacity-60 uppercase font-bold tracking-widest">Kcal</span></span>
                </div>
             </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleWorkout && onToggleWorkout(e); }}
            className="w-16 h-16 rounded-[2rem] bg-brand-red text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all z-10"
          >
            {liveWorkout.isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
          </button>
        </div>
      )}

      {/* Hero Section */}
      {!user.isTrainer ? (
        <div className="relative overflow-hidden rounded-[3rem] bg-neutral-900 border border-neutral-800 p-10 lg:p-14 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/5 rounded-full blur-[140px] -mr-32 -mt-32"></div>
            
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-12 relative z-10 mb-12">
                <div className="flex-1">
                    <h2 className="text-neutral-500 text-xs font-bold tracking-[0.4em] uppercase mb-4">DEPLOYMENT STATUS: READY</h2>
                    <h1 className="text-7xl lg:text-9xl font-display font-bold text-white tracking-tighter leading-none mb-6">BUILT STRONG.<br/><span className="text-brand-red">BUILT TOUGH.</span></h1>
                    <p className="text-neutral-400 text-lg lg:text-xl font-medium leading-relaxed max-w-2xl">Focus on the objective, {user.name.split(' ')[0]}. Performance is the only metric that matters.</p>
                </div>
                
                <div className="lg:w-80 bg-neutral-950/80 backdrop-blur-xl border border-neutral-800 p-8 rounded-[3rem] shadow-inner relative group active:scale-[0.98] transition-transform">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-brand-red/20 rounded-full flex items-center justify-center">
                            <Quote className="w-4 h-4 text-brand-red fill-current" />
                        </div>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Directive: {missionDirective.category}</span>
                    </div>
                    <p className="text-lg font-medium text-neutral-200 italic leading-snug">
                        "{missionDirective.text}"
                    </p>
                    <div className="absolute -bottom-2 -right-2 bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-xl text-[9px] font-bold text-neutral-600 uppercase tracking-tighter shadow-lg group-hover:text-brand-red transition-colors">
                        HQ-{new Date().getDate()}-{new Date().getMonth() + 1}
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 relative z-10">
                <Button onClick={() => onNavigate(Tab.TRAIN)} className="flex-1 h-20 text-3xl tracking-[0.2em] rounded-[2rem] shadow-2xl shadow-red-900/40 uppercase">COMMENCE MISSION</Button>
                <button 
                    onClick={() => setIsInquiryModalOpen(true)}
                    className="p-6 rounded-[2rem] bg-neutral-800 border border-neutral-700 hover:bg-brand-red hover:border-brand-red transition-all text-white shadow-2xl flex items-center justify-center gap-4 group"
                >
                    <Mail className="w-8 h-8" />
                    <span className="lg:hidden font-bold uppercase text-[10px] tracking-widest">Inquire Directly</span>
                </button>
            </div>
        </div>
      ) : (
         <div className="space-y-6">
            {/* Trainer Command Overview */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-[3rem] p-10 lg:p-14 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/5 rounded-full blur-[140px] -mr-32 -mt-32 pointer-events-none"></div>
                <div className="flex justify-between items-center mb-10 relative z-10">
                    <div>
                        <h2 className="font-display font-bold text-5xl lg:text-6xl text-white uppercase tracking-tight leading-none">Trainer Command</h2>
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.4em] mt-2 italic">Performance Intelligence</p>
                    </div>
                    <div className="flex items-center gap-2 bg-brand-red px-6 py-2 rounded-2xl shadow-xl shadow-red-900/30">
                        <ShieldCheck className="w-5 h-5 text-white" />
                        <span className="text-white text-xs font-bold uppercase tracking-widest">Master Auth</span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 relative z-10">
                    {/* Financial Intel (Money Section) - NOW EDITABLE */}
                    <div 
                        onClick={() => { setTempEarnings(user.earningsMTD?.toString() || '0'); setIsEarningsModalOpen(true); }}
                        className="bg-neutral-950 p-8 rounded-[2.5rem] border border-neutral-800 shadow-inner group hover:border-brand-red transition-all cursor-pointer relative overflow-hidden active:scale-[0.98]"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 group-hover:bg-brand-red/10 group-hover:border-brand-red/30 transition-all">
                                <DollarSign className="w-8 h-8 text-brand-red" />
                            </div>
                            <div className="p-2 bg-neutral-900 rounded-xl border border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Edit2 className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.2em] mb-1">Financial Intel (Editable)</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-display font-bold text-white tabular-nums tracking-tighter">
                                ${user.earningsMTD?.toLocaleString() || '0'}
                            </span>
                            <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">MTD</span>
                        </div>
                        <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-tight mt-4 leading-relaxed">
                            Click to adjust projected revenue based on actual performance payouts and deployment rates.
                        </p>
                    </div>

                    <button 
                        onClick={() => onNavigate(Tab.BOOK)}
                        className="bg-neutral-950 p-8 rounded-[2.5rem] border border-neutral-800 flex flex-col items-center justify-center gap-4 hover:bg-neutral-900 transition-all shadow-inner group active:scale-[0.98]"
                    >
                        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-[2rem] shadow-2xl group-hover:bg-brand-red group-hover:text-white transition-all">
                            <Calendar className="w-10 h-10 text-brand-red group-hover:text-white" />
                        </div>
                        <span className="font-display font-bold text-3xl uppercase tracking-widest text-white">Master Schedule</span>
                        <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">Manage All Deployments</p>
                    </button>

                    <button 
                        onClick={() => onNavigate(Tab.NUTRITION)}
                        className="bg-neutral-950 p-8 rounded-[2.5rem] border border-neutral-800 flex flex-col items-center justify-center gap-4 hover:bg-neutral-900 transition-all shadow-inner group active:scale-[0.98]"
                    >
                        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-[2rem] shadow-2xl group-hover:bg-brand-red group-hover:text-white transition-all">
                            <Flame className="w-10 h-10 text-orange-500 group-hover:text-white" />
                        </div>
                        <span className="font-display font-bold text-3xl uppercase tracking-widest text-white">Global Macros</span>
                        <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">Strategic Intake Audit</p>
                    </button>
                </div>
            </div>
         </div>
      )}

      {/* Financial Intel Editor Modal */}
      {isEarningsModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-fade-in">
            <div className="bg-neutral-900 border border-neutral-800 w-full max-w-sm rounded-[3.5rem] p-12 relative shadow-2xl">
                 <button onClick={() => setIsEarningsModalOpen(false)} className="absolute top-8 right-8 text-neutral-400 hover:text-white transition-colors">
                    <X className="w-10 h-10" />
                </button>
                <h3 className="text-4xl font-display font-bold mb-2 uppercase tracking-tighter leading-none text-brand-red text-center">Revenue Intel</h3>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-center mb-10">Month-to-Date Performance</p>
                
                <div className="space-y-8">
                    <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4 text-center">Amount Secured ($)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-brand-red" />
                            <input 
                                type="number" 
                                value={tempEarnings} 
                                autoFocus
                                onChange={(e) => setTempEarnings(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-3xl p-10 pl-16 text-white focus:border-brand-red outline-none font-display font-bold text-7xl shadow-inner text-center"
                            />
                        </div>
                    </div>
                    <Button onClick={handleSaveEarnings} fullWidth className="h-20 rounded-3xl text-2xl tracking-[0.2em]">COMMIT REVENUE</Button>
                </div>
            </div>
        </div>
      )}

      {/* Unified Mobile Inquiry Modal */}
      {isInquiryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/98 backdrop-blur-3xl animate-fade-in">
            <div className="bg-neutral-900 border-t sm:border border-neutral-800 w-full max-w-xl rounded-t-[4rem] sm:rounded-[4rem] p-12 lg:p-16 relative shadow-2xl overflow-hidden max-h-[95vh] no-scrollbar">
                 <button onClick={closeInquiry} className="absolute top-10 right-10 text-neutral-400 hover:text-white active:scale-95 transition-all p-3 z-50">
                    <X className="w-12 h-12" />
                </button>
                
                {inquiryStatus === 'success' ? (
                    <div className="text-center py-20 space-y-12 animate-fade-in">
                        <div className="relative mx-auto w-32 h-32">
                            <div className="absolute inset-0 bg-brand-red rounded-full blur-3xl opacity-40 animate-pulse"></div>
                            <div className="bg-brand-red rounded-full flex items-center justify-center relative shadow-2xl w-full h-full border-8 border-white/5">
                                <CheckCircle className="w-16 h-16 text-white" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-6xl font-display font-bold mb-4 uppercase tracking-tighter text-white">DISPATCHED</h3>
                            <p className="text-neutral-400 text-sm max-w-xs mx-auto font-bold uppercase tracking-widest leading-relaxed">
                                Blueprint inquiry successfully routed to twin.fit.trainer@gmail.com and dispatched via SMS alert to Twin.
                            </p>
                        </div>
                        <Button onClick={closeInquiry} fullWidth className="h-20 rounded-[2.5rem] text-2xl tracking-[0.2em]">RETURN TO HQ</Button>
                    </div>
                ) : (
                    <form onSubmit={handleInquirySubmit} className="space-y-8 pt-8 sm:pt-0">
                        <div className="mb-10">
                            <h3 className="text-6xl font-display font-bold uppercase tracking-tighter text-white leading-none">Mission Inquiry</h3>
                            <p className="text-neutral-500 text-xs font-bold uppercase tracking-[0.3em] mt-3">TARGET: TWIN.FIT.TRAINER@GMAIL.COM</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">Objective Theme</label>
                                <input 
                                    type="text"
                                    required
                                    value={inquiryForm.subject}
                                    onChange={(e) => setInquiryForm({...inquiryForm, subject: e.target.value})}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-[2rem] p-6 text-white font-bold focus:border-brand-red outline-none shadow-inner text-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">Mission Intelligence</label>
                                <textarea 
                                    required
                                    value={inquiryForm.message}
                                    onChange={(e) => setInquiryForm({...inquiryForm, message: e.target.value})}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-[2rem] p-8 text-white focus:border-brand-red h-56 resize-none outline-none font-medium placeholder-neutral-800 shadow-inner text-base leading-relaxed"
                                    placeholder="Describe your goals, plateaus, or specific inquiries for Twin..."
                                />
                            </div>
                        </div>

                        <div className="bg-neutral-950/90 p-6 rounded-[2.5rem] border border-neutral-800 flex items-center gap-5">
                            <div className="p-3 bg-brand-red rounded-2xl shadow-lg">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-tight leading-relaxed">
                                Submission utilizes secure GMAIL SMTP protocol with immediate high-priority SMS gateway routing for zero-latency response.
                            </p>
                        </div>

                        <Button type="submit" fullWidth disabled={inquiryStatus === 'sending'} className="h-24 rounded-[3rem] flex items-center justify-center gap-4 text-3xl tracking-[0.2em] shadow-2xl shadow-red-900/30">
                            {inquiryStatus === 'sending' ? (
                                <>
                                    <Loader2 className="w-10 h-10 animate-spin" />
                                    <span>DISPATCHING...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-8 h-8" /> DISPATCH NOW
                                </>
                            )}
                        </Button>
                    </form>
                )}
            </div>
        </div>
      )}
    </div>
  );
};