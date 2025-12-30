import React, { useState } from 'react';
import { ChevronRight, Check, Activity, Target, User } from 'lucide-react';
import { Button } from './Button';
import { UserProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    gender: 'Male',
    age: 25,
    weight: 160,
    height: "5'10",
    goals: ['Muscle Gain'],
    level: 'Intermediate',
  });

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleComplete = () => {
    // Simulate processing
    setTimeout(() => {
        onComplete(formData as UserProfile);
    }, 1000);
  };

  const toggleGoal = (goal: string) => {
    setFormData(prev => {
      const currentGoals = prev.goals || [];
      if (currentGoals.includes(goal)) {
        // Prevent removing the last goal
        if (currentGoals.length === 1) return prev;
        return { ...prev, goals: currentGoals.filter(g => g !== goal) };
      } else {
        return { ...prev, goals: [...currentGoals, goal] };
      }
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-900/10 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none"></div>

      <div className="w-full max-w-md space-y-8 relative z-10 animate-fade-in">
        
        {/* Progress Bar */}
        <div className="w-full bg-neutral-900 h-1 rounded-full mb-8">
            <div className="bg-brand-red h-1 rounded-full transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>

        {/* STEP 1: Intro & Name */}
        {step === 1 && (
            <div className="text-center space-y-6">
                <div className="mb-8">
                    <h1 className="text-5xl font-display font-bold mb-2">BUILT STRONG.<br/><span className="text-brand-red">BUILT TOUGH.</span></h1>
                    <p className="text-neutral-400">Your personalized transformation starts here.</p>
                </div>

                <div className="text-left space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">What's your name?</label>
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-lg font-bold focus:border-brand-red focus:outline-none placeholder-neutral-700"
                            placeholder="Enter your first name"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Gender</label>
                            <select 
                                value={formData.gender}
                                onChange={(e) => setFormData({...formData, gender: e.target.value as any})}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-white font-bold focus:border-brand-red outline-none appearance-none"
                            >
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Age</label>
                            <input 
                                type="number" 
                                value={formData.age}
                                onChange={(e) => setFormData({...formData, age: Number(e.target.value)})}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-lg font-bold focus:border-brand-red focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                <Button onClick={handleNext} disabled={!formData.name} fullWidth className="mt-8">
                    NEXT STEP <ChevronRight className="w-5 h-5 ml-2 inline" />
                </Button>
            </div>
        )}

        {/* STEP 2: Body Stats */}
        {step === 2 && (
             <div className="space-y-6">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-800">
                        <Activity className="w-8 h-8 text-brand-red" />
                    </div>
                    <h2 className="text-3xl font-display font-bold">YOUR STATS</h2>
                    <p className="text-neutral-400">Help us tailor your nutrition plan.</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Current Weight (lbs)</label>
                        <input 
                            type="number" 
                            value={formData.weight}
                            onChange={(e) => setFormData({...formData, weight: Number(e.target.value)})}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-xl font-bold focus:border-brand-red focus:outline-none"
                        />
                    </div>
                     <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Height</label>
                        <input 
                            type="text" 
                            value={formData.height}
                            onChange={(e) => setFormData({...formData, height: e.target.value})}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-xl font-bold focus:border-brand-red focus:outline-none"
                            placeholder="e.g. 5'10"
                        />
                    </div>
                </div>

                <div className="flex gap-4 mt-8">
                    <Button variant="secondary" onClick={() => setStep(1)} className="w-1/3">BACK</Button>
                    <Button onClick={handleNext} className="w-2/3">NEXT STEP</Button>
                </div>
            </div>
        )}

        {/* STEP 3: Goals */}
        {step === 3 && (
            <div className="space-y-6">
                 <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-800">
                        <Target className="w-8 h-8 text-brand-red" />
                    </div>
                    <h2 className="text-3xl font-display font-bold">YOUR GOALS</h2>
                    <p className="text-neutral-400">Select all that apply.</p>
                </div>

                <div className="space-y-3">
                    {['Fat Loss', 'Muscle Gain', 'Maintenance'].map((goal) => (
                        <button
                            key={goal}
                            onClick={() => toggleGoal(goal)}
                            className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                                formData.goals?.includes(goal)
                                ? 'bg-brand-red border-brand-red text-white shadow-lg shadow-red-900/20' 
                                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-600'
                            }`}
                        >
                            <span className="font-bold text-lg">{goal}</span>
                            {formData.goals?.includes(goal) && <Check className="w-6 h-6" />}
                        </button>
                    ))}
                </div>

                <div className="flex gap-4 mt-8">
                    <Button variant="secondary" onClick={() => setStep(2)} className="w-1/3">BACK</Button>
                    <Button onClick={handleNext} className="w-2/3">NEXT STEP</Button>
                </div>
            </div>
        )}

         {/* STEP 4: Experience */}
         {step === 4 && (
            <div className="space-y-6">
                 <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-800">
                        <User className="w-8 h-8 text-brand-red" />
                    </div>
                    <h2 className="text-3xl font-display font-bold">EXPERIENCE LEVEL</h2>
                    <p className="text-neutral-400">Be honest. We build from where you are.</p>
                </div>

                <div className="space-y-3">
                    {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                        <button
                            key={level}
                            onClick={() => setFormData({...formData, level: level as any})}
                            className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                                formData.level === level 
                                ? 'bg-white text-black border-white' 
                                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-600'
                            }`}
                        >
                            <span className="font-bold text-lg">{level}</span>
                            {formData.level === level && <Check className="w-6 h-6" />}
                        </button>
                    ))}
                </div>

                <div className="flex gap-4 mt-8">
                    <Button variant="secondary" onClick={() => setStep(3)} className="w-1/3">BACK</Button>
                    <Button onClick={handleComplete} className="w-2/3">FINISH SETUP</Button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};