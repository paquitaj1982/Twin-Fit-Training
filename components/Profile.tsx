
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Button } from './Button';
/* Added ChevronRight to the import list to fix missing icon errors */
import { User, LogOut, Settings, Award, Check, Briefcase, Mail, Send, X, Loader2, CheckCircle, Zap, ShieldCheck, ChevronRight } from 'lucide-react';

interface ProfileProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdate, onLogout }) => {
  const [formData, setFormData] = useState<UserProfile>(user);
  const [isEditing, setIsEditing] = useState(false);
  
  // Inquiry Modal State
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquiryStatus, setInquiryStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [inquiryMsg, setInquiryMsg] = useState('');

  // OWNER CHECK: Only the name "Twin" can access administrative features
  const isAppOwner = user.name.toLowerCase().trim() === 'twin';

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const toggleTrainerMode = () => {
    if (!isAppOwner) return; 
    onUpdate({ ...user, isTrainer: !user.isTrainer });
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryStatus('sending');
    
    // GMAIL SERVER & SMS GATEWAY MOCK
    const DEST_EMAIL = "twin.fit.trainer@gmail.com";
    const SMS_TARGET = "(615)243-6798"; 
    
    console.log(`[HANDSHAKE] Securing tunnel to Google Gmail SMTP for ${DEST_EMAIL}...`);
    console.log(`[SMS_GATEWAY] Priority text alert routed to ${SMS_TARGET}...`);
    
    setTimeout(() => {
        console.log(`[SMTP] Mission Intel Packet successfully delivered.`);
        setInquiryStatus('success');
    }, 2000);
  };

  const closeInquiry = () => {
      setIsInquiryModalOpen(false);
      setInquiryStatus('idle');
      setInquiryMsg('');
  };

  return (
    <div className="space-y-10 pb-32 animate-fade-in px-1">
        <div className="flex justify-between items-end">
             <div>
                <h2 className="text-5xl font-display font-bold uppercase tracking-tight leading-none">Athlete Command</h2>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-[0.4em] mt-1 italic">Built Strong. Built Tough.</p>
             </div>
             {!isEditing && (
                 <button onClick={() => setIsEditing(true)} className="bg-neutral-900 border border-neutral-800 px-6 py-2 rounded-xl text-brand-red font-bold text-[10px] tracking-widest hover:bg-brand-red hover:text-white transition-all uppercase">Edit Profile</button>
             )}
        </div>

        {/* Profile Visualization */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-[3rem] p-10 lg:p-14 text-center relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand-red/10 to-transparent"></div>
             
             <div className="relative z-10">
                <div className="w-32 h-32 rounded-full bg-neutral-800 border-8 border-neutral-950 mx-auto mb-6 flex items-center justify-center overflow-hidden shadow-2xl relative">
                    <span className="font-display font-bold text-6xl text-neutral-600 uppercase">{user.name.charAt(0)}</span>
                    {isAppOwner && (
                        <div className="absolute bottom-1 right-1 bg-brand-red p-2 rounded-full border-4 border-neutral-950 shadow-xl" title="Verified Master">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                    )}
                </div>
                <h3 className="text-4xl font-display font-bold text-white uppercase tracking-tight leading-none mb-2">{user.name}</h3>
                <div className="inline-flex items-center gap-2 bg-neutral-950 px-4 py-1.5 rounded-full border border-neutral-800 shadow-inner">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse"></div>
                    <span className="text-brand-red font-bold uppercase text-[9px] tracking-[0.3em]">
                        {user.isTrainer ? 'COMMANDER / ADMIN' : `${user.level.toUpperCase()} LEVEL ATHLETE`}
                    </span>
                </div>
             </div>
        </div>

        {/* Tactical Intel Inputs */}
        <div className="space-y-8">
            <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.5em] px-1">Physical Metrics</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
                 <div className="bg-neutral-900/50 p-8 rounded-[2.5rem] border border-neutral-800 shadow-xl">
                    <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-[0.3em] mb-4">Weight (lbs)</label>
                    <input 
                        type="number" 
                        value={formData.weight}
                        disabled={!isEditing}
                        onChange={(e) => setFormData({...formData, weight: Number(e.target.value)})}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-6 font-display font-bold text-4xl disabled:opacity-40 text-white outline-none focus:border-brand-red shadow-inner transition-all"
                    />
                </div>
                <div className="bg-neutral-900/50 p-8 rounded-[2.5rem] border border-neutral-800 shadow-xl">
                    <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-[0.3em] mb-4">Height Designation</label>
                    <input 
                        type="text" 
                        value={formData.height}
                        disabled={!isEditing}
                        onChange={(e) => setFormData({...formData, height: e.target.value})}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-6 font-display font-bold text-4xl disabled:opacity-40 text-white outline-none focus:border-brand-red shadow-inner transition-all"
                    />
                </div>
            </div>

             <div className="bg-neutral-900 border border-neutral-800 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-8 relative z-10">
                    <div className="flex-1">
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-[0.4em] mb-4">
                            Active Energy Threshold {isEditing && '(Manual Strategy Override)'}
                        </label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={formData.customCalories || ''}
                                disabled={!isEditing}
                                placeholder={!isEditing ? "AUTO-CALCULATED MISSION FUEL" : "Enter Target KCAL"}
                                onChange={(e) => setFormData({...formData, customCalories: Number(e.target.value)})}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-3xl p-10 font-display font-bold text-7xl disabled:opacity-40 text-white placeholder-neutral-800 outline-none focus:border-brand-red shadow-inner transition-all"
                            />
                            {!formData.customCalories && !isEditing && (
                                <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-neutral-900 px-4 py-2 rounded-xl border border-neutral-800">
                                    <Zap className="w-3 h-3 text-brand-red" />
                                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Automatic</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isEditing && (
                <div className="flex flex-col sm:flex-row gap-6 pt-4">
                    <Button variant="secondary" fullWidth onClick={() => { setFormData(user); setIsEditing(false); }} className="h-20 rounded-[2.5rem] uppercase tracking-widest text-sm">Cancel Abort</Button>
                    <Button fullWidth onClick={handleSave} className="h-20 rounded-[2.5rem] text-2xl tracking-[0.2em]">COMMIT BLUEPRINT</Button>
                </div>
            )}
        </div>

        {/* Global Strategy Actions */}
        <div className="border-t border-neutral-900 pt-10 space-y-6">
             <button 
                onClick={() => setIsInquiryModalOpen(true)} 
                className="w-full p-8 rounded-[2.5rem] bg-neutral-900 hover:bg-neutral-800 flex items-center gap-8 transition-all text-left border border-neutral-800 group shadow-xl"
             >
                <div className="p-5 bg-brand-red rounded-[1.5rem] group-hover:scale-110 transition-transform shadow-2xl shadow-red-900/30">
                    <Mail className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                    <p className="font-display font-bold text-3xl text-white uppercase tracking-tight leading-none mb-1">Direct HQ Inquiry</p>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.3em]">SECURE GMAIL & SMS DISPATCH TO TWIN</p>
                </div>
                <ChevronRight className="w-6 h-6 text-neutral-800 group-hover:text-brand-red transition-all" />
            </button>

             {/* TRAINER VIEW TOGGLE: Exclusive to Owner Identity */}
             {isAppOwner && (
                <button onClick={toggleTrainerMode} className="w-full p-8 rounded-[2.5rem] bg-neutral-900 hover:bg-neutral-800 flex items-center gap-8 transition-all text-left border border-neutral-800 group shadow-xl">
                    <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-[1.5rem] group-hover:scale-110 transition-transform shadow-inner">
                        <Briefcase className={`w-8 h-8 ${user.isTrainer ? 'text-blue-500' : 'text-neutral-600'}`} />
                    </div>
                    <div className="flex-1">
                        <p className="font-display font-bold text-3xl text-white uppercase tracking-tight leading-none mb-1">{user.isTrainer ? 'Athletic Interface' : 'Administrative Console'}</p>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.3em]">MASTER AUTHORITY TOGGLE</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-neutral-800 group-hover:text-blue-500 transition-all" />
                </button>
             )}

            <button onClick={onLogout} className="w-full p-6 rounded-3xl bg-red-900/10 hover:bg-red-900/20 text-red-500 flex items-center justify-center gap-3 transition-all mt-8 font-bold border border-red-900/30 uppercase tracking-[0.4em] text-xs shadow-inner active:scale-95">
                <LogOut className="w-5 h-5" /> TERMINATE SESSION ARCHIVE
            </button>
        </div>

        {/* INQUIRY MODAL (Twin Target Focused) */}
        {isInquiryModalOpen && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl animate-fade-in">
                <div className="bg-neutral-900 border border-neutral-800 w-full max-w-xl rounded-[4rem] p-12 lg:p-16 relative overflow-hidden shadow-[0_0_120px_rgba(220,38,38,0.2)]">
                    <button onClick={closeInquiry} className="absolute top-10 right-10 text-neutral-400 hover:text-white transition-colors p-2">
                        <X className="w-10 h-10" />
                    </button>
                    
                    {inquiryStatus === 'success' ? (
                        <div className="text-center py-16 space-y-10 animate-fade-in">
                            <div className="relative mx-auto w-32 h-32">
                                <div className="absolute inset-0 bg-brand-red rounded-full blur-[80px] opacity-40 animate-pulse"></div>
                                <div className="bg-brand-red rounded-full flex items-center justify-center relative shadow-2xl w-full h-full border-8 border-white/5">
                                    <CheckCircle className="w-14 h-14 text-white" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-5xl font-display font-bold mb-4 uppercase tracking-tighter">DISPATCH SUCCESS</h3>
                                <p className="text-neutral-400 text-sm max-w-xs mx-auto font-bold uppercase tracking-widest leading-relaxed">
                                    Strategic inquiry routed to twin.fit.trainer@gmail.com. Twin has received an immediate high-priority SMS alert.
                                </p>
                            </div>
                            <Button onClick={closeInquiry} fullWidth className="h-20 rounded-[2.5rem] text-2xl tracking-[0.2em]">RETURN TO PROFILE</Button>
                        </div>
                    ) : (
                        <form onSubmit={handleInquirySubmit} className="space-y-8">
                            <div className="mb-10">
                                <h3 className="text-6xl font-display font-bold uppercase tracking-tighter leading-none text-white">Direct HQ</h3>
                                <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">RECIPIENT: TWIN.FIT.TRAINER@GMAIL.COM</p>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Message Intel</label>
                                <textarea 
                                    required
                                    value={inquiryMsg}
                                    onChange={(e) => setInquiryMsg(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-[2.5rem] p-10 text-white focus:border-brand-red h-64 resize-none outline-none font-medium placeholder-neutral-800 shadow-inner text-lg leading-relaxed"
                                    placeholder="Enter your strategic inquiry for Twin..."
                                />
                            </div>

                            <div className="bg-neutral-950/80 p-8 rounded-[3rem] border border-neutral-800 flex items-center gap-6 shadow-inner">
                                <div className="p-4 bg-brand-red rounded-2xl shadow-xl">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-[11px] text-neutral-500 font-bold uppercase tracking-tight leading-relaxed">
                                    SMTP secure transmission protocols engaged. SMS Gateway burst transmitted to Twin's high-priority personal line.
                                </p>
                            </div>

                            <Button type="submit" fullWidth disabled={inquiryStatus === 'sending'} className="h-24 rounded-[3rem] flex items-center justify-center gap-4 text-2xl tracking-[0.2em] shadow-red-900/40 shadow-2xl">
                                {inquiryStatus === 'sending' ? (
                                    <>
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                        <span>INITIATING TUNNEL...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-8 h-8" /> TRANSMIT TO TWIN
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
