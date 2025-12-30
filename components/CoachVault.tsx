import React, { useState } from 'react';
import { Video, Plus, X, Edit2, Trash2, Zap, Play, CheckCircle, Info, Loader2, Camera, User } from 'lucide-react';
import { Button } from './Button';
import { CoachSession } from '../types';

interface CoachVaultProps {
  sessions: CoachSession[];
  setSessions: React.Dispatch<React.SetStateAction<CoachSession[]>>;
  isTrainer?: boolean;
}

export const CoachVault: React.FC<CoachVaultProps> = ({ sessions, setSessions, isTrainer }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [videoErrors, setVideoErrors] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState<Partial<CoachSession>>({
    title: '',
    clientName: '',
    description: '',
    videoUrl: '',
    category: 'Strength'
  });

  const categories = ['Strength', 'Conditioning', 'PR', 'Form Check'];

  const openModal = (session?: CoachSession) => {
    if (session) {
      setEditingId(session.id);
      setFormData(session);
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        clientName: '',
        description: '',
        videoUrl: '',
        category: 'Strength'
      });
    }
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData({ ...formData, videoUrl: url });
    }
  };

  const handleSave = () => {
    if (!formData.title || !formData.videoUrl) return;
    setIsSaving(true);

    setTimeout(() => {
      if (editingId) {
        setSessions(prev => prev.map(s => s.id === editingId ? { ...s, ...formData } as CoachSession : s));
      } else {
        const newSession: CoachSession = {
          id: `session-${Date.now()}`,
          title: formData.title!,
          clientName: formData.clientName,
          videoUrl: formData.videoUrl!,
          description: formData.description || '',
          category: (formData.category as any) || 'Strength',
          timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
        setSessions(prev => [newSession, ...prev]);
      }
      setIsSaving(false);
      setIsModalOpen(false);
    }, 1000);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Built Strong. Built Tough. Permanently delete this session archive?")) {
      setSessions(prev => prev.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-10 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-display font-bold uppercase tracking-tight leading-none">Session Archives</h2>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mt-1 italic">Built Strong. Built Tough.</p>
        </div>
        {isTrainer && (
          <button 
            onClick={() => openModal()}
            className="bg-brand-red text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 font-display font-bold text-xl shadow-xl hover:bg-red-700 transition-all group"
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" /> DEPLOY ASSET
          </button>
        )}
      </div>

      {/* Grid Feed */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {sessions.map((session) => (
          <div key={session.id} className="aspect-[9/16] relative bg-neutral-900 rounded-[2.5rem] overflow-hidden border border-neutral-800 group shadow-2xl hover:border-brand-red/50 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10 pointer-events-none"></div>
            
            {!videoErrors[session.id] ? (
              <video 
                src={session.videoUrl} 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                muted
                playsInline
                loop
                onError={() => setVideoErrors(prev => ({ ...prev, [session.id]: true }))}
                onMouseOver={e => e.currentTarget.play()}
                onMouseOut={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
              />
            ) : (
              <div className="w-full h-full bg-neutral-950 flex items-center justify-center text-neutral-800">
                <Video className="w-12 h-12" />
              </div>
            )}

            <div className="absolute bottom-5 left-5 right-5 z-20 pointer-events-none">
              <span className="inline-block px-2 py-0.5 rounded bg-brand-red text-white text-[9px] font-bold uppercase tracking-widest mb-1 shadow-md">
                {session.category}
              </span>
              <h4 className="text-xl font-display font-bold text-white uppercase tracking-tighter leading-none mb-1 drop-shadow-lg">
                {session.title}
              </h4>
              {session.clientName && (
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight truncate drop-shadow-md">
                  Athlete: {session.clientName}
                </p>
              )}
            </div>

            {isTrainer && (
              <div className="absolute top-4 right-4 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button 
                  onClick={(e) => { e.stopPropagation(); openModal(session); }}
                  className="p-2.5 bg-black/60 backdrop-blur-md rounded-xl text-white border border-neutral-700 hover:bg-brand-red transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={(e) => handleDelete(session.id, e)}
                  className="p-2.5 bg-black/60 backdrop-blur-md rounded-xl text-white border border-neutral-700 hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            
            <div className="absolute top-4 left-4 z-20 opacity-30">
               <Video className="w-4 h-4 text-white" />
            </div>
          </div>
        ))}
        
        {sessions.length === 0 && (
          <div className="col-span-full py-20 bg-neutral-900/20 rounded-[3rem] border-2 border-dashed border-neutral-800 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-700">
                  <Video className="w-8 h-8" />
              </div>
              <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-[0.3em]">No session highlights deployed.</p>
          </div>
        )}
      </div>

      {/* Upload/Edit Modal */}
      {isModalOpen && isTrainer && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/98 backdrop-blur-2xl animate-fade-in">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-xl rounded-t-[3rem] sm:rounded-[3.5rem] p-8 relative max-h-[95vh] overflow-y-auto shadow-2xl no-scrollbar">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-neutral-500 hover:text-white p-2 z-50">
              <X className="w-8 h-8" />
            </button>
            
            <div className="mb-8">
              <h3 className="text-5xl font-display font-bold uppercase tracking-tighter leading-none mb-1 text-white">
                {editingId ? 'Modify Recap' : 'Deploy Session'}
              </h3>
              <p className="text-[10px] font-bold text-brand-red uppercase tracking-[0.3em]">Vertical Athlete Archives (9:16)</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Media Preview */}
              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Session Footage</label>
                <div className="border-2 border-dashed border-neutral-800 rounded-3xl bg-neutral-950 hover:border-brand-red transition-all relative group aspect-[9/16] flex flex-col justify-center items-center overflow-hidden cursor-pointer shadow-inner">
                  <input 
                    type="file" 
                    accept="video/*" 
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {formData.videoUrl ? (
                    <div className="absolute inset-0 w-full h-full">
                      <video src={formData.videoUrl} className="w-full h-full object-cover opacity-60" muted playsInline />
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/50 pointer-events-none text-center px-4">
                         <CheckCircle className="w-12 h-12 text-brand-red mb-2 drop-shadow-2xl" />
                         <span className="font-bold text-[10px] text-white uppercase tracking-widest">Asset Ready</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-neutral-600 group-hover:text-white transition-colors text-center px-6">
                        <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-4 group-hover:bg-brand-red transition-all shadow-2xl">
                            <Video className="w-8 h-8" />
                        </div>
                        <span className="font-bold text-[10px] uppercase tracking-widest">Select Footage</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Data Inputs */}
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Highlight Title</label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-white focus:border-brand-red outline-none font-bold shadow-inner"
                    placeholder="e.g. Back Squat PR Recap"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Athlete Name (Optional)</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-700" />
                    <input 
                      type="text" 
                      value={formData.clientName} 
                      onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 pl-12 text-white focus:border-brand-red outline-none font-bold shadow-inner"
                      placeholder="e.g. Sarah Jenkins"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Recap Notes</label>
                  <textarea 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-white focus:border-brand-red outline-none h-24 resize-none font-medium shadow-inner text-sm"
                    placeholder="What happened in this session?"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Mission Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setFormData({...formData, category: cat as any})}
                        className={`py-2 rounded-xl text-[10px] font-bold uppercase border transition-all ${
                          formData.category === cat 
                            ? 'bg-brand-red border-brand-red text-white' 
                            : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 flex gap-3">
                  <Button variant="secondary" onClick={() => setIsModalOpen(false)} fullWidth className="h-14">CANCEL</Button>
                  <Button onClick={handleSave} fullWidth className="h-14" disabled={isSaving || !formData.title || !formData.videoUrl}>
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'COMMIT ASSET'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-8 p-5 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-start gap-3">
                <Info className="w-5 h-5 text-brand-red shrink-0" />
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-tight leading-relaxed">
                  Archives are optimized for vertical high-performance viewing. Assets deployed here are visible to all athletes in the Blueprint network.
                </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
