import React from 'react';
import { Play, Pause, StopCircle, Flame, Zap, Plus, Gauge, Layers } from 'lucide-react';

interface LiveActiveProps {
  isActive: boolean;
  seconds: number;
  calories: number;
  heartRate: number;
  sets?: number;
  intensity?: 'Low' | 'Med' | 'High';
  onToggle: () => void;
  onEnd: () => void;
  onAddWater: () => void;
  onLogSet?: () => void;
  onSetIntensity?: (level: 'Low' | 'Med' | 'High') => void;
}

export const LiveActive: React.FC<LiveActiveProps> = ({ 
  isActive, 
  seconds, 
  calories, 
  heartRate, 
  sets = 0,
  intensity = 'Med',
  onToggle, 
  onEnd, 
  onAddWater,
  onLogSet,
  onSetIntensity
}) => {

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Visual pulse speed based on intensity
  const pulseClass = intensity === 'High' ? 'animate-ping duration-75' : intensity === 'Med' ? 'animate-pulse' : 'animate-pulse duration-[2000ms]';
  const glowColor = intensity === 'High' ? 'bg-red-600' : intensity === 'Med' ? 'bg-orange-500' : 'bg-blue-500';

  return (
    <div className="flex flex-col h-full pb-24 relative animate-fade-in overflow-hidden">
      {/* Interactive Background Visualizer */}
      {isActive && (
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full ${glowColor} blur-[120px] opacity-20 transition-colors duration-1000 ${isActive ? pulseClass : ''} -z-10`}></div>
      )}
      
      <div className="flex-1 flex flex-col justify-center items-center text-center space-y-8">
        {/* Status Indicator & Intensity Selector */}
        <div className="space-y-4 w-full px-8">
            <div className={`mx-auto px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase inline-flex items-center gap-2 ${isActive ? 'bg-neutral-900 border border-neutral-800 text-white' : 'bg-neutral-800 text-neutral-500'}`}>
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-neutral-500'}`}></div>
                {isActive ? 'Session Live' : 'Paused'}
            </div>
            
            {/* Interactive Intensity Controls */}
            {isActive && onSetIntensity && (
                <div className="flex justify-center gap-2">
                    {['Low', 'Med', 'High'].map((level) => (
                        <button 
                            key={level}
                            onClick={() => onSetIntensity(level as any)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                                intensity === level 
                                    ? 'bg-white text-black shadow-lg scale-105' 
                                    : 'bg-neutral-900 text-neutral-500 border border-neutral-800 hover:border-neutral-600'
                            }`}
                        >
                            {level}
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* Timer */}
        <div>
            <h1 className="text-8xl font-display font-bold tabular-nums tracking-tighter text-white drop-shadow-2xl">
                {formatTime(seconds)}
            </h1>
            <p className="text-neutral-500 uppercase tracking-widest text-sm mt-2">Duration</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm px-4">
            <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-2xl backdrop-blur-sm flex flex-col items-center">
                <Flame className="w-5 h-5 text-orange-500 mb-1" />
                <p className="text-2xl font-bold">{Math.floor(calories)}</p>
                <p className="text-[10px] text-neutral-500 uppercase">Kcal</p>
            </div>
            <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-2xl backdrop-blur-sm flex flex-col items-center">
                <Zap className="w-5 h-5 text-brand-red mb-1" />
                <p className="text-2xl font-bold">{isActive ? heartRate : '--'}</p>
                <p className="text-[10px] text-neutral-500 uppercase">HR</p>
            </div>
            {/* Interactive Set Counter */}
             <button 
                onClick={onLogSet}
                disabled={!isActive}
                className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-2xl backdrop-blur-sm flex flex-col items-center active:bg-neutral-800 active:border-brand-red transition-all"
            >
                <Layers className="w-5 h-5 text-blue-500 mb-1" />
                <p className="text-2xl font-bold">{sets}</p>
                <p className="text-[10px] text-neutral-500 uppercase">Log Set</p>
            </button>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full space-y-4 mt-auto px-6">
        {!isActive && seconds === 0 ? (
            <button 
                onClick={onToggle}
                className="w-20 h-20 rounded-full bg-brand-red text-white mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:scale-105 transition-transform"
            >
                <Play className="w-8 h-8 fill-current ml-1" />
            </button>
        ) : (
            <div className="flex justify-center gap-6">
                 <button 
                    onClick={onToggle}
                    className="w-20 h-20 rounded-full bg-neutral-800 text-white flex items-center justify-center border border-neutral-700 hover:bg-neutral-700 transition-colors"
                >
                    {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </button>
                <button 
                    onClick={onEnd}
                    className="w-20 h-20 rounded-full bg-red-900/20 text-brand-red border border-brand-red/50 flex items-center justify-center hover:bg-brand-red hover:text-white transition-all"
                >
                    <StopCircle className="w-8 h-8" />
                </button>
            </div>
        )}
        
        {isActive && (
             <button onClick={onAddWater} className="w-full py-4 bg-neutral-900/50 border border-neutral-800 rounded-xl text-blue-400 font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors">
                <Plus className="w-5 h-5" /> Quick Add Water (+250ml)
             </button>
        )}
      </div>
    </div>
  );
};