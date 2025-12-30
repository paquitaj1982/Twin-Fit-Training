import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Camera, Scale, TrendingUp, Plus, ChevronRight, Save, Video, Play, X, Trash2, Edit2, Image as ImageIcon, Filter, CheckCircle, Info, Calendar, BarChart3, Activity } from 'lucide-react';
import { Button } from './Button';
import { ProgressMedia, WeightEntry } from '../types';

interface ProgressProps {
  weightData: WeightEntry[];
  setWeightData: React.Dispatch<React.SetStateAction<WeightEntry[]>>;
  media: ProgressMedia[];
  setMedia: React.Dispatch<React.SetStateAction<ProgressMedia[]>>;
}

export const Progress: React.FC<ProgressProps> = ({ weightData, setWeightData, media, setMedia }) => {
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [editingWeightId, setEditingWeightId] = useState<string | null>(null);
  const [newWeight, setNewWeight] = useState('');
  const [newWeightDate, setNewWeightDate] = useState(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  
  const [activeFilter, setActiveFilter] = useState<'All' | 'Photos' | 'Videos'>('All');
  const [videoErrors, setVideoErrors] = useState<Record<string, boolean>>({});

  // Chart Logic States
  const [chartView, setChartView] = useState<'line' | 'bar'>('line');
  const [timeFrame, setTimeFrame] = useState<'1W' | '1M' | 'ALL'>('ALL');
  
  // Modal / Edit States
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mediaFormData, setMediaFormData] = useState<Partial<ProgressMedia>>({
    type: 'image',
    url: '',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    note: ''
  });

  // Filter weight data based on timeFrame
  const displayedWeightData = useMemo(() => {
    if (timeFrame === 'ALL') return weightData;
    const limit = timeFrame === '1W' ? 7 : 30;
    return weightData.slice(-limit);
  }, [weightData, timeFrame]);

  const handleWeightAction = () => {
    if(!newWeight) return;
    
    if (editingWeightId) {
        setWeightData(prev => prev.map(w => w.id === editingWeightId ? { ...w, weight: parseFloat(newWeight), date: newWeightDate } : w));
    } else {
        const id = Date.now().toString();
        setWeightData(prev => [...prev, { id, date: newWeightDate, weight: parseFloat(newWeight) }]);
    }
    
    setNewWeight('');
    setEditingWeightId(null);
    setShowWeightInput(false);
  };

  const startEditWeight = (entry: WeightEntry) => {
      setEditingWeightId(entry.id);
      setNewWeight(entry.weight.toString());
      setNewWeightDate(entry.date);
      setShowWeightInput(true);
  };

  const deleteWeight = (id: string) => {
      if (window.confirm("Built Strong. Built Tough. Delete this weight entry?")) {
          setWeightData(prev => prev.filter(w => w.id !== id));
      }
  };

  const openMediaModal = (existingMedia?: ProgressMedia) => {
    if (existingMedia) {
      setEditingId(existingMedia.id);
      setMediaFormData(existingMedia);
    } else {
      setEditingId(null);
      setMediaFormData({
        type: 'image',
        url: '',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        note: ''
      });
    }
    setIsMediaModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMediaFormData({ ...mediaFormData, url, type });
    }
  };

  const handleSaveMedia = () => {
    if (!mediaFormData.url) return;

    if (editingId) {
      setMedia(prev => prev.map(m => m.id === editingId ? { ...m, ...mediaFormData } as ProgressMedia : m));
    } else {
      const newMedia: ProgressMedia = {
        id: `media-${Date.now()}`,
        url: mediaFormData.url!,
        type: mediaFormData.type!,
        date: mediaFormData.date!,
        note: mediaFormData.note
      };
      setMedia(prev => [newMedia, ...prev]);
    }
    setIsMediaModalOpen(false);
  };

  const handleDeleteMedia = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Built Strong. Built Tough. Delete this entry from your progress journal?")) {
      setMedia(prev => prev.filter(m => m.id !== id));
    }
  };

  const filteredMedia = activeFilter === 'All' 
    ? media 
    : media.filter(m => activeFilter === 'Photos' ? m.type === 'image' : m.type === 'video');

  const currentWeight = weightData.length > 0 ? weightData[weightData.length - 1].weight : 0;
  const startWeight = weightData.length > 0 ? weightData[0].weight : 0;
  const loss = startWeight - currentWeight;

  return (
    <div className="space-y-10 pb-24 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-display font-bold uppercase tracking-tight leading-none">Athlete Stats</h2>
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mt-1 italic">Built Strong. Built Tough.</p>
      </div>

      {/* Interactive Weight Visualization Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 rounded-full blur-[60px] -mr-10 -mt-10 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
                <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mb-1">Performance Metrics: Weight</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-display font-bold text-white tracking-tighter">{currentWeight}</span>
                    <span className="text-sm font-bold text-neutral-500 uppercase">LBS</span>
                </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
                {/* Time Frame Filter */}
                <div className="flex bg-black/40 p-1 rounded-xl border border-neutral-800">
                    {(['1W', '1M', 'ALL'] as const).map(f => (
                        <button 
                            key={f}
                            onClick={() => setTimeFrame(f)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${timeFrame === f ? 'bg-brand-red text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Chart Toggle */}
                <div className="flex bg-black/40 p-1 rounded-xl border border-neutral-800">
                    <button 
                        onClick={() => setChartView('line')}
                        className={`p-1.5 rounded-lg transition-all ${chartView === 'line' ? 'bg-neutral-700 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
                        title="Line Chart"
                    >
                        <Activity className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setChartView('bar')}
                        className={`p-1.5 rounded-lg transition-all ${chartView === 'bar' ? 'bg-neutral-700 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
                        title="Bar Chart"
                    >
                        <BarChart3 className="w-4 h-4" />
                    </button>
                </div>

                <button 
                    onClick={() => { setEditingWeightId(null); setNewWeight(''); setNewWeightDate(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })); setShowWeightInput(!showWeightInput); }}
                    className="p-3 bg-neutral-800 rounded-2xl text-brand-red hover:bg-brand-red hover:text-white transition-all shadow-lg active:scale-95"
                >
                    <Scale className="w-5 h-5" />
                </button>
            </div>
        </div>
        
        <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
                {chartView === 'line' ? (
                    <LineChart data={displayedWeightData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                        <XAxis dataKey="date" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #262626', borderRadius: '16px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                            itemStyle={{ color: '#DC2626' }}
                            cursor={{ stroke: '#DC2626', strokeWidth: 1 }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="weight" 
                            stroke="#DC2626" 
                            strokeWidth={4} 
                            dot={{ r: 4, fill: '#DC2626', strokeWidth: 0 }} 
                            activeDot={{ r: 6, fill: '#fff', stroke: '#DC2626', strokeWidth: 2 }} 
                            animationDuration={1000}
                        />
                    </LineChart>
                ) : (
                    <BarChart data={displayedWeightData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                        <XAxis dataKey="date" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 50', 'dataMax + 10']} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #262626', borderRadius: '16px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                            itemStyle={{ color: '#DC2626' }}
                            cursor={{ fill: 'rgba(220,38,38,0.05)' }}
                        />
                        <Bar dataKey="weight" radius={[8, 8, 0, 0]} animationDuration={1000}>
                            {displayedWeightData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === displayedWeightData.length - 1 ? '#DC2626' : '#262626'} className="hover:fill-red-700 transition-colors cursor-pointer" />
                            ))}
                        </Bar>
                    </BarChart>
                )}
            </ResponsiveContainer>
        </div>
        
        <div className="mt-8">
             {showWeightInput ? (
                <div className="space-y-4 animate-scale-in">
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-[8px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Weight (LBS)</label>
                            <input 
                                type="number" 
                                value={newWeight}
                                onChange={(e) => setNewWeight(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-brand-red outline-none font-bold shadow-inner"
                                placeholder="0"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-[8px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Date</label>
                            <input 
                                type="text" 
                                value={newWeightDate}
                                onChange={(e) => setNewWeightDate(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-brand-red outline-none font-bold shadow-inner"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleWeightAction} className="flex-1 bg-brand-red text-white py-3 rounded-xl hover:bg-red-700 transition-colors shadow-lg font-bold uppercase tracking-widest text-[10px]">
                            {editingWeightId ? 'UPDATE ENTRY' : 'COMMIT WEIGHT'}
                        </button>
                        <button onClick={() => setShowWeightInput(false)} className="bg-neutral-800 text-neutral-400 px-6 py-3 rounded-xl hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">
                            CANCEL
                        </button>
                    </div>
                </div>
             ) : (
                <div className="flex items-center justify-between text-[10px] text-neutral-500 font-bold uppercase tracking-widest bg-neutral-950/50 p-4 rounded-2xl border border-neutral-800/50 backdrop-blur-sm">
                    <span className="flex items-center gap-2">
                        <TrendingUp className={`w-4 h-4 ${loss >= 0 ? "text-green-500" : "text-red-500"}`} />
                        Total Transformation: <span className={loss >= 0 ? "text-green-500" : "text-red-500"}>{loss > 0 ? '-' : '+'}{Math.abs(loss).toFixed(1)} LBS</span>
                    </span>
                    <button onClick={() => setShowWeightInput(true)} className="text-brand-red hover:underline tracking-widest">New Deployment Entry</button>
                </div>
             )}
        </div>
      </div>

      {/* Weight History List */}
      <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] px-1">Weight Audit Log</h3>
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden divide-y divide-neutral-800 shadow-xl">
              {weightData.slice().reverse().map(entry => (
                  <div key={entry.id} className="p-5 flex justify-between items-center group hover:bg-neutral-800/40 transition-colors">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-neutral-600">
                              <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                              <p className="font-bold text-sm text-white uppercase tracking-tight">{entry.date}</p>
                              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Status Check</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-6">
                          <span className="text-xl font-display font-bold text-white">{entry.weight} <span className="text-[10px] text-neutral-600">LBS</span></span>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => startEditWeight(entry)} className="p-2 text-neutral-500 hover:text-white transition-colors">
                                  <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => deleteWeight(entry.id)} className="p-2 text-neutral-500 hover:text-brand-red transition-colors">
                                  <Trash2 className="w-4 h-4" />
                              </button>
                          </div>
                      </div>
                  </div>
              ))}
              {weightData.length === 0 && (
                  <div className="p-12 text-center flex flex-col items-center gap-3">
                      <Scale className="w-8 h-8 text-neutral-800" />
                      <p className="text-[10px] font-bold text-neutral-700 uppercase tracking-widest">No mission data recorded yet.</p>
                  </div>
              )}
          </div>
      </div>

      {/* Progress Media Journal */}
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
            <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">Visual Transformation Journal</h3>
            <div className="flex gap-2 bg-neutral-900 p-1 rounded-full border border-neutral-800 overflow-x-auto no-scrollbar">
                {['All', 'Photos', 'Videos'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setActiveFilter(f as any)}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all tracking-widest ${
                        activeFilter === f 
                            ? 'bg-brand-red text-white shadow-lg' 
                            : 'text-neutral-500 hover:text-white'
                        }`}
                    >
                        {f.toUpperCase()}
                    </button>
                ))}
            </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Add Media Action Card */}
            <button 
                onClick={() => openMediaModal()}
                className="aspect-[9/16] bg-neutral-900 rounded-[2rem] border-2 border-dashed border-neutral-800 flex flex-col items-center justify-center gap-3 hover:border-brand-red hover:bg-neutral-800 transition-all group shrink-0 shadow-xl"
            >
                <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center group-hover:bg-brand-red transition-all shadow-2xl">
                    <Plus className="w-6 h-6 text-neutral-500 group-hover:text-white transition-colors" />
                </div>
                <div className="text-center px-4">
                    <span className="text-[10px] text-neutral-500 uppercase font-bold leading-tight group-hover:text-white transition-colors tracking-widest">Add Progress<br/>Asset</span>
                </div>
            </button>

            {filteredMedia.map((item) => {
                const isVideo = item.type === 'video' && !videoErrors[item.id];
                return (
                    <div key={item.id} className="aspect-[9/16] relative bg-neutral-900 rounded-[2rem] overflow-hidden border border-neutral-800 group shadow-2xl hover:border-brand-red/50 transition-all duration-300 cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent z-10 pointer-events-none"></div>
                        
                        {isVideo ? (
                            <video 
                                src={item.url} 
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                                muted
                                playsInline
                                loop
                                onError={() => setVideoErrors(prev => ({ ...prev, [item.id]: true }))}
                                onMouseOver={e => {
                                    const playPromise = e.currentTarget.play();
                                    if (playPromise !== undefined) {
                                      playPromise.catch(() => { /* Silence */ });
                                    }
                                }}
                                onMouseOut={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                            />
                        ) : (
                            <img src={item.url} alt="Progress" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                        )}

                        <div className="absolute bottom-5 left-5 right-5 z-20 pointer-events-none">
                            <span className="inline-block px-2 py-0.5 rounded bg-brand-red text-white text-[9px] font-bold uppercase tracking-widest mb-1 shadow-md">
                                {item.date}
                            </span>
                            {item.note && (
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight truncate drop-shadow-lg">{item.note}</p>
                            )}
                        </div>

                        {/* Admin Controls Overlay */}
                        <div className="absolute top-4 right-4 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                            <button 
                                onClick={(e) => { e.stopPropagation(); openMediaModal(item); }}
                                className="p-2.5 bg-black/60 backdrop-blur-md rounded-xl text-white border border-neutral-700 hover:bg-brand-red transition-colors shadow-2xl"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                                onClick={(e) => handleDeleteMedia(item.id, e)}
                                className="p-2.5 bg-black/60 backdrop-blur-md rounded-xl text-white border border-neutral-700 hover:bg-red-700 transition-colors shadow-2xl"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Indicator Icon */}
                        <div className="absolute top-4 left-4 z-20">
                            {item.type === 'video' ? <Video className="w-4 h-4 text-white/50" /> : <ImageIcon className="w-4 h-4 text-white/50" />}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Media Modal */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-in">
            <div className="bg-neutral-900 border border-neutral-800 w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 relative max-h-[95vh] overflow-y-auto shadow-[0_0_100px_rgba(220,38,38,0.2)] no-scrollbar">
                <button onClick={() => setIsMediaModalOpen(false)} className="absolute top-6 right-6 text-neutral-400 hover:text-white p-2 z-50">
                    <X className="w-6 h-6" />
                </button>
                
                <div className="mb-8">
                    <h3 className="text-4xl font-display font-bold uppercase tracking-tighter leading-none mb-1 text-white">
                        {editingId ? 'Modify Entry' : 'Add Progress Asset'}
                    </h3>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">High-Performance Transformation Tracking</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Media Dropzone - 9:16 ENFORCED */}
                    <div className="space-y-4">
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Vertical Footage (9:16)</label>
                        <div className="border-2 border-dashed border-neutral-800 rounded-3xl bg-neutral-950/50 hover:border-brand-red transition-all relative group aspect-[9/16] flex flex-col justify-center items-center overflow-hidden cursor-pointer shadow-inner">
                             {mediaFormData.url && mediaFormData.url.trim() !== '' ? (
                                <div className="absolute inset-0 w-full h-full">
                                    {mediaFormData.type === 'video' ? (
                                        <video src={mediaFormData.url} className="w-full h-full object-cover opacity-60" muted playsInline loop />
                                    ) : (
                                        <img src={mediaFormData.url} className="w-full h-full object-cover opacity-60" alt="Preview" />
                                    )}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/50 pointer-events-none">
                                         <CheckCircle className="w-12 h-12 text-brand-red mb-2 drop-shadow-2xl" />
                                         <span className="font-bold text-[10px] text-white drop-shadow-md uppercase tracking-widest">Asset Ready</span>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMediaFormData({...mediaFormData, url: ''}); }}
                                        className="absolute top-4 right-4 z-30 bg-red-600 p-2.5 rounded-xl text-white hover:bg-red-700 transition-colors shadow-2xl"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                             ) : (
                                <div className="flex flex-col items-center justify-center text-neutral-500 group-hover:text-white transition-colors text-center px-6">
                                    <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-4 group-hover:bg-brand-red transition-all shadow-2xl">
                                        <Camera className="w-8 h-8" />
                                    </div>
                                    <span className="font-bold text-xs uppercase tracking-widest">Select Media</span>
                                    <div className="flex gap-2 mt-4">
                                        <label className="bg-neutral-800 px-3 py-1.5 rounded-lg text-[8px] font-bold cursor-pointer hover:bg-white hover:text-black transition-colors">
                                            PHOTO
                                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} className="hidden" />
                                        </label>
                                        <label className="bg-neutral-800 px-3 py-1.5 rounded-lg text-[8px] font-bold cursor-pointer hover:bg-white hover:text-black transition-colors">
                                            VIDEO
                                            <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} className="hidden" />
                                        </label>
                                    </div>
                                </div>
                             )}
                        </div>
                    </div>

                    {/* Meta Detail */}
                    <div className="space-y-5">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Entry Date</label>
                                <input 
                                    type="text" 
                                    required
                                    value={mediaFormData.date} 
                                    onChange={(e) => setMediaFormData({...mediaFormData, date: e.target.value})}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-white focus:border-brand-red outline-none font-bold placeholder-neutral-800 shadow-inner"
                                    placeholder="e.g. Feb 15"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Transformation Note</label>
                                <textarea 
                                    value={mediaFormData.note || ''} 
                                    onChange={(e) => setMediaFormData({...mediaFormData, note: e.target.value})}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-white focus:border-brand-red outline-none placeholder-neutral-800 resize-none h-44 font-medium shadow-inner"
                                    placeholder="Brief observations on form or condition..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button variant="secondary" onClick={() => setIsMediaModalOpen(false)} fullWidth className="h-14 tracking-widest">CANCEL</Button>
                            <Button onClick={handleSaveMedia} fullWidth className="h-14 tracking-widest" disabled={!mediaFormData.url || mediaFormData.url.trim() === ''}>COMMIT ASSET</Button>
                        </div>
                    </div>
                </div>
                
                <div className="mt-8 p-5 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-start gap-3">
                    <div className="p-2 bg-brand-red/10 rounded-xl">
                        <Info className="w-5 h-5 text-brand-red shrink-0" />
                    </div>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-tight leading-relaxed">
                        Data assets are stored in your secure athlete vault. Visual consistency is fundamental to tracking real growth. Built Strong. Built Tough.
                    </p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};