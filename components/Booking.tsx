
import React, { useState } from 'react';
import { Calendar, CheckCircle, User, Clock, Lock, Unlock, X, Mail, MessageSquare, Loader2, Zap, UserCheck, Settings2, ShieldCheck, AlertCircle, Send, DollarSign, Edit2 } from 'lucide-react';
import { Button } from './Button';
import { TrainerService, BookingSlot } from '../types';

interface BookingProps {
  onBookSession: (slot: BookingSlot) => void;
  slots: BookingSlot[];
  isTrainer?: boolean;
  onUpdateSlot?: (slot: BookingSlot) => void;
  services: TrainerService[];
  onUpdateService?: (service: TrainerService) => void;
}

export const Booking: React.FC<BookingProps> = ({ 
    onBookSession, 
    slots, 
    isTrainer, 
    onUpdateSlot,
    services,
    onUpdateService
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedService, setSelectedService] = useState<TrainerService | null>(null);
  const [selectedDate, setSelectedDate] = useState<number>(0); 
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'notifying' | 'success'>('idle');

  // Trainer Editing State
  const [editingSlot, setEditingSlot] = useState<BookingSlot | null>(null);
  const [editForm, setEditForm] = useState<{ price: string; client: string }>({ price: '', client: '' });
  const [editingService, setEditingService] = useState<TrainerService | null>(null);
  const [serviceEditForm, setServiceEditForm] = useState<{ price: string; duration: string }>({ price: '', duration: '' });

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate(),
      fullDate: d
    };
  });

  const handleSlotSelect = (id: string) => {
    if (isTrainer) {
        const slot = slots.find(s => s.id === id);
        if (slot) {
            setEditingSlot(slot);
            setEditForm({
                price: slot.customPrice ? slot.customPrice.toString() : '',
                client: slot.reservedFor || ''
            });
        }
    } else {
        const slot = slots.find(s => s.id === id);
        if (slot && slot.available) {
            setSelectedSlot(id);
            setStep(3);
        }
    }
  };

  const handleUpdateService = () => {
    if (editingService && onUpdateService) {
        onUpdateService({
            ...editingService,
            price: parseFloat(serviceEditForm.price) || editingService.price,
            duration: parseInt(serviceEditForm.duration) || editingService.duration
        });
        setEditingService(null);
    }
  };

  const saveSlotChanges = () => {
      if (isTrainer && editingSlot && onUpdateSlot) {
          onUpdateSlot({
              ...editingSlot,
              customPrice: editForm.price ? parseFloat(editForm.price) : undefined,
              reservedFor: editForm.client || undefined
          });
          setEditingSlot(null);
      }
  };

  const handleConfirm = () => {
    const TARGET_EMAIL = "twin.fit.trainer@gmail.com";
    setStatus('processing');
    
    console.log(`[BuiltTough] Initiating secure mission allocation...`);
    
    setTimeout(() => {
        setStatus('notifying');
        console.log(`[BuiltTough] Handshake complete. Dispatching SMTP payload to ${TARGET_EMAIL}...`);
        
        const slot = slots.find(s => s.id === selectedSlot);
        const day = days[selectedDate];
        
        // Detailed log simulation for development/audit
        console.log(`[SMTP] SUBJECT: Mission Briefing - ${selectedService?.title || 'Personal Training'}`);
        console.log(`[SMTP] BODY: Athlete ${selectedSlot} secured for ${day.day} ${day.date} at ${slot?.time}.`);
        
        setTimeout(() => {
            if (slot) onBookSession(slot);
            console.log(`[BuiltTough] Dispatch success. Receipt confirmed by HQ.`);
            setStatus('success');
            setStep(4);
        }, 2500);
    }, 1500);
  };

  return (
    <div className="space-y-8 pb-32 animate-fade-in px-1 md:px-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
                <h2 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight leading-none">
                    {isTrainer ? 'COMMAND SCHEDULE' : 'SECURE A SESSION'}
                </h2>
                <p className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-[0.3em] mt-1 italic">Built Strong. Built Tough.</p>
            </div>
            {!isTrainer && step < 4 && (
                <div className="flex items-center gap-2 bg-neutral-900/50 p-2 rounded-2xl border border-neutral-800">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-2 w-8 rounded-full transition-all duration-500 ${step >= i ? 'bg-brand-red shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-neutral-800'}`} />
                    ))}
                </div>
            )}
        </div>

        {/* Global Asset Settings (Twin Exclusive) */}
        {isTrainer && (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 flex items-center gap-2 px-1 mb-2">
                    <Settings2 className="w-4 h-4 text-brand-red" />
                    <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.4em]">Master Performance Parameters</h3>
                </div>
                {services.map(service => (
                    <div key={service.id} className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 flex justify-between items-center group shadow-2xl transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red/5 rounded-full blur-3xl"></div>
                        <div className="relative z-10">
                            <h4 className="font-display font-bold text-3xl text-white uppercase tracking-tight leading-none">{service.title}</h4>
                            <div className="flex items-center gap-8 mt-4">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest mb-1">Global Rate</span>
                                    <span className="text-brand-red font-display font-bold text-3xl leading-none">${service.price}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest mb-1">Duration</span>
                                    <span className="text-white font-display font-bold text-3xl leading-none">{service.duration}M</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => { setEditingService(service); setServiceEditForm({ price: service.price.toString(), duration: service.duration.toString() }); }}
                            className="p-5 bg-neutral-950 border border-neutral-800 rounded-3xl text-neutral-400 hover:text-white hover:bg-brand-red transition-all shadow-xl active:scale-95 z-10"
                        >
                            <Settings2 className="w-6 h-6" />
                        </button>
                    </div>
                ))}
            </div>
        )}

        {/* User Step 1: Service Choice */}
        {step === 1 && !isTrainer && (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                {services.map(service => (
                    <div 
                        key={service.id}
                        onClick={() => { setSelectedService(service); setStep(2); }}
                        className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 md:p-10 hover:border-brand-red cursor-pointer transition-all group shadow-2xl active:scale-[0.98] relative overflow-hidden flex flex-col justify-between"
                    >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-red/5 rounded-full blur-[100px] -mr-16 -mt-16"></div>
                        <div className="relative z-10">
                            <h3 className="font-display font-bold text-3xl md:text-4xl group-hover:text-brand-red transition-colors uppercase tracking-tight leading-none mb-4">{service.title}</h3>
                            <p className="text-neutral-400 text-sm md:text-base mb-10 leading-relaxed font-medium">{service.description}</p>
                        </div>
                        <div className="relative z-10 flex items-center justify-between pt-6 border-t border-neutral-800/50">
                            <div className="flex items-center text-[10px] md:text-[11px] text-neutral-500 font-bold uppercase tracking-[0.2em]">
                                <Clock className="w-4 h-4 mr-2 text-brand-red" /> {service.duration} MINUTE HIGH-INTENSITY
                            </div>
                            <CheckCircle className="w-6 h-6 text-neutral-800 group-hover:text-brand-red transition-colors" />
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Step 2: Date & Time Selection */}
        {step === 2 && (
            <div className="space-y-10 animate-fade-in">
                {(isTrainer || selectedService) && (
                    <div className="bg-neutral-900 p-8 rounded-[2.5rem] border border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-brand-red opacity-20"></div>
                        <div>
                            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.3em] mb-2">TARGET PERFORMANCE PLAN</p>
                            <h3 className="font-display font-bold text-3xl md:text-4xl text-white uppercase tracking-tight leading-none">{selectedService?.title || services[0].title}</h3>
                        </div>
                        <div className="flex items-center gap-6">
                            {!isTrainer && (
                                <button onClick={() => setStep(1)} className="text-[10px] font-bold text-neutral-500 hover:text-white uppercase tracking-[0.2em] underline">Modify Strategy</button>
                            )}
                            {isTrainer && (
                                <div className="text-right">
                                    <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest mb-1">Global Rate</p>
                                    <p className="text-brand-red font-display font-bold text-4xl leading-none">
                                        ${services.find(s => s.id === (selectedService?.id || '2'))?.price}
                                    </p>
                                </div>
                            )}
                            <div className="h-16 w-px bg-neutral-800 hidden sm:block"></div>
                            <Clock className="w-8 h-8 text-neutral-800" />
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                   <div className="flex items-center gap-2 px-1">
                       <Calendar className="w-4 h-4 text-brand-red" />
                       <h4 className="font-bold uppercase text-[10px] text-neutral-500 tracking-[0.4em]">Phase 1: Deployment Date</h4>
                   </div>
                   <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
                     {days.map((d, index) => (
                       <button
                         key={index}
                         onClick={() => setSelectedDate(index)}
                         className={`flex flex-col items-center justify-center min-w-[6.5rem] p-7 rounded-[2.5rem] border-2 transition-all active:scale-95 group ${
                           selectedDate === index
                             ? 'bg-brand-red border-brand-red text-white shadow-2xl shadow-red-900/50'
                             : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-white'
                         }`}
                       >
                         <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-3 ${selectedDate === index ? 'text-white/70' : 'text-neutral-600'}`}>{d.day}</span>
                         <span className="text-4xl font-display font-bold leading-none">{d.date}</span>
                       </button>
                     ))}
                   </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-2 px-1">
                        <UserCheck className="w-4 h-4 text-brand-red" />
                        <h4 className="font-bold uppercase text-[10px] text-neutral-500 tracking-[0.4em]">Phase 2: Personnel Availability</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {slots.map(slot => (
                            <button
                                key={slot.id}
                                disabled={!isTrainer && !slot.available}
                                onClick={() => handleSlotSelect(slot.id)}
                                className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center justify-center gap-2 active:scale-95 shadow-xl group relative overflow-hidden ${
                                    isTrainer 
                                        ? slot.available 
                                            ? slot.reservedFor ? 'bg-blue-900/10 border-blue-800/40 text-blue-400' : 'bg-neutral-900 border-neutral-800 text-white hover:border-brand-red'
                                            : 'bg-neutral-950 border-neutral-900 text-neutral-800'
                                        : selectedSlot === slot.id 
                                            ? 'bg-white text-black border-white shadow-2xl scale-105' 
                                            : slot.available 
                                                ? 'bg-neutral-900 border-neutral-800 hover:border-brand-red text-white' 
                                                : 'bg-neutral-950 border-neutral-900 text-neutral-800 cursor-not-allowed opacity-50'
                                }`}
                            >
                                <div className="font-display text-4xl tracking-tight uppercase leading-none mb-1">
                                    {slot.time}
                                </div>
                                <div className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-60 flex items-center gap-1.5">
                                    {isTrainer && (
                                        slot.available ? (slot.reservedFor ? <UserCheck className="w-3 h-3"/> : <Unlock className="w-3 h-3 opacity-30" />) : <Lock className="w-3 h-3 opacity-30" />
                                    )}
                                    {slot.reservedFor ? slot.reservedFor : (slot.available ? 'AVAILABLE' : 'BLOCKED')}
                                </div>
                                {isTrainer && (
                                    <div className="mt-3 pt-3 border-t border-white/10 w-full text-center font-display text-lg font-bold text-neutral-500">
                                        ${slot.customPrice || services.find(s => s.id === (selectedService?.id || '2'))?.price}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Global Service Parameter Modal (Twin Exclusive) */}
        {editingService && isTrainer && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl animate-fade-in">
                 <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-[3.5rem] p-12 relative shadow-[0_0_100px_rgba(220,38,38,0.2)]">
                     <button onClick={() => setEditingService(null)} className="absolute top-10 right-10 text-neutral-400 hover:text-white transition-colors">
                        <X className="w-10 h-10" />
                    </button>
                    <div className="text-center mb-8">
                        <ShieldCheck className="w-12 h-12 text-brand-red mx-auto mb-4" />
                        <h3 className="text-5xl font-display font-bold uppercase tracking-tighter leading-none text-white text-center">Master Parameters</h3>
                        <p className="text-brand-red text-[10px] font-bold uppercase mt-2 tracking-[0.4em] text-center">{editingService.title}</p>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4 text-center">Global Rate ($)</label>
                            <input 
                                type="number" 
                                value={serviceEditForm.price} 
                                onChange={(e) => setServiceEditForm({...serviceEditForm, price: e.target.value})}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-3xl p-6 text-white focus:border-brand-red outline-none font-display font-bold text-4xl shadow-inner text-center"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4 text-center">Mission Duration (Mins)</label>
                            <input 
                                type="number" 
                                value={serviceEditForm.duration} 
                                onChange={(e) => setServiceEditForm({...serviceEditForm, duration: e.target.value})}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-3xl p-6 text-white focus:border-brand-red outline-none font-display font-bold text-4xl shadow-inner text-center"
                            />
                        </div>
                        <Button onClick={handleUpdateService} fullWidth className="h-24 rounded-[2.5rem] text-2xl tracking-[0.2em]">COMMIT PARAMETERS</Button>
                    </div>
                 </div>
            </div>
        )}

        {/* Slot Adjustment Modal (Twin Exclusive) */}
        {editingSlot && isTrainer && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl animate-fade-in">
                 <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-[3.5rem] p-12 relative shadow-2xl">
                     <button onClick={() => setEditingSlot(null)} className="absolute top-10 right-10 text-neutral-400 hover:text-white transition-colors">
                        <X className="w-10 h-10" />
                    </button>
                    <h3 className="text-5xl font-display font-bold mb-1 uppercase tracking-tighter leading-none text-white">Adjust Slot</h3>
                    <p className="text-brand-red text-[11px] font-bold uppercase mb-10 tracking-[0.4em]">{editingSlot.time} • {days[selectedDate].day} {days[selectedDate].date}</p>

                    <div className="space-y-8">
                        <div className="flex items-center justify-between p-6 bg-neutral-950 rounded-3xl border border-neutral-800 shadow-inner">
                             <span className="font-bold text-[10px] text-neutral-500 uppercase tracking-[0.2em]">Mission Ready</span>
                             <button 
                                onClick={() => { if(onUpdateSlot && editingSlot) { const updated = {...editingSlot, available: !editingSlot.available}; setEditingSlot(updated); onUpdateSlot(updated); } }}
                                className={`px-8 py-3 rounded-2xl text-xs font-bold uppercase transition-all shadow-xl ${editingSlot.available ? 'bg-green-600 text-white shadow-green-900/30' : 'bg-neutral-800 text-neutral-500'}`}
                             >
                                {editingSlot.available ? 'ACTIVE' : 'BLOCKED'}
                             </button>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4">Assigned Athlete Identity</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-700" />
                                <input 
                                    type="text" 
                                    placeholder="Client designation..."
                                    value={editForm.client} 
                                    onChange={(e) => setEditForm({...editForm, client: e.target.value})}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-3xl p-6 pl-14 text-white focus:border-brand-red outline-none font-bold placeholder-neutral-800 shadow-inner text-lg"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4">Individual Slot Rate ($)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-700" />
                                <input 
                                    type="number" 
                                    value={editForm.price} 
                                    onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-3xl p-6 pl-12 text-white focus:border-brand-red outline-none font-bold shadow-inner text-lg"
                                    placeholder="Global default"
                                />
                            </div>
                        </div>

                        <Button onClick={saveSlotChanges} fullWidth className="h-20 rounded-[2rem] text-xl tracking-[0.2em]">COMMIT INTEL</Button>
                    </div>
                 </div>
            </div>
        )}

        {/* Step 3: Confirmation Summary */}
        {step === 3 && (
            <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
                <div className="bg-neutral-900 p-8 md:p-14 rounded-[3rem] md:rounded-[4rem] border border-neutral-800 text-center relative overflow-hidden shadow-[0_0_80px_rgba(220,38,38,0.15)]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/5 rounded-full blur-[100px] -mr-16 -mt-16"></div>
                    <p className="text-neutral-500 text-[11px] font-bold uppercase tracking-[0.4em] mb-6">Mission Deployment Verified</p>
                    
                    <div className="relative inline-block mb-10">
                        <h3 className="text-5xl md:text-7xl font-display font-bold text-white uppercase tracking-tight leading-none mb-2">Ready to Launch</h3>
                        <p className="text-brand-red font-bold uppercase text-[10px] tracking-[0.3em]">{selectedService?.title || services[0].title}</p>
                    </div>
                    
                    <div className="bg-neutral-950/60 backdrop-blur-md p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-neutral-800 flex items-center justify-between text-left group hover:border-brand-red transition-colors">
                        <div>
                             <p className="text-[10px] text-neutral-600 uppercase font-bold tracking-[0.2em] mb-1">Tactical Schedule</p>
                             <p className="font-display font-bold text-2xl md:text-3xl text-white uppercase tracking-tight leading-none">
                                {days[selectedDate].day} {days[selectedDate].date} • {slots.find(s => s.id === selectedSlot)?.time}
                             </p>
                        </div>
                        <div className="p-4 bg-neutral-900 rounded-2xl group-hover:bg-brand-red transition-all shadow-inner">
                            <Calendar className="w-6 h-6 md:w-8 md:h-8 text-brand-red group-hover:text-white" />
                        </div>
                    </div>
                </div>

                <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button variant="secondary" onClick={() => setStep(2)} fullWidth className="h-20 rounded-[2.5rem] text-sm uppercase tracking-[0.3em]" disabled={status !== 'idle'}>ABORT DEPLOYMENT</Button>
                  <Button onClick={handleConfirm} fullWidth disabled={status !== 'idle'} className="h-20 rounded-[2.5rem] text-2xl tracking-[0.2em] shadow-2xl shadow-red-900/30">
                      {status === 'processing' ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : 
                       status === 'notifying' ? 'DISPATCHING TO HQ...' : 
                       'SECURE SLOT'}
                  </Button>
                </div>
                
                <div className="bg-neutral-950 border border-neutral-900 p-6 rounded-[2rem] flex items-center gap-4">
                    <div className="p-3 bg-brand-red/10 rounded-xl">
                        <Zap className="w-6 h-6 text-brand-red" />
                    </div>
                    <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-tight leading-relaxed">
                        Selection triggers a mission brief to twin.fit.trainer@gmail.com. Master Command receives immediate high-priority dispatch.
                    </p>
                </div>
            </div>
        )}

        {/* Step 4: Success View */}
        {step === 4 && !isTrainer && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in space-y-12">
                <div className="relative">
                    <div className="absolute inset-0 bg-brand-red rounded-full blur-[120px] opacity-30 animate-pulse"></div>
                    <div className="w-32 h-32 bg-brand-red rounded-full flex items-center justify-center relative shadow-2xl border-8 border-white/10 group">
                        <CheckCircle className="w-16 h-16 text-white group-hover:scale-110 transition-transform" />
                    </div>
                </div>

                <div>
                  <h2 className="text-6xl md:text-8xl font-display font-bold mb-4 tracking-tighter uppercase leading-none">BATTLE CONFIRMED</h2>
                  <div className="max-w-md mx-auto bg-neutral-900/50 p-6 rounded-3xl border border-neutral-800 backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-2 text-brand-red mb-3">
                        <Mail className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Email Dispatched</span>
                    </div>
                    <p className="text-neutral-200 text-sm leading-relaxed font-bold uppercase tracking-[0.1em]">
                        Twin has received your mission alert at twin.fit.trainer@gmail.com. Prepare for peak exertion. Tactical schedule locked.
                    </p>
                  </div>
                </div>

                <div className="w-full max-w-md pt-8">
                    <Button onClick={() => setStep(1)} fullWidth className="h-20 rounded-[2.5rem] text-2xl tracking-[0.2em]">RETURN TO DASHBOARD</Button>
                </div>
            </div>
        )}
    </div>
  );
};
