import React, { useState, useEffect } from 'react';
import { Plus, Minus, Droplets, ChevronRight, X, Coffee, Sun, Moon, Utensils, Zap, Edit2, Check, Trash2, Fuel, Scale, Droplet, Calculator, Activity, ArrowRight, TrendingUp, Target, Flame } from 'lucide-react';
import { Button } from './Button';
import { FoodItem } from '../types';

interface NutritionProps {
  foodLog: FoodItem[];
  waterIntake: number;
  setWaterIntake: React.Dispatch<React.SetStateAction<number>>;
  onAddFood: (item: FoodItem) => void;
  onUpdateFood: (item: FoodItem) => void;
  onDeleteFood: (id: string) => void;
  calorieGoal: number;
  burnedCalories: number;
  onUpdateGoal?: (newGoal: number) => void;
}

export const Nutrition: React.FC<NutritionProps> = ({ 
    foodLog, 
    waterIntake, 
    setWaterIntake, 
    onAddFood, 
    onUpdateFood,
    onDeleteFood,
    calorieGoal,
    burnedCalories,
    onUpdateGoal 
}) => {
  const WATER_GOAL = 3.0;
  
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(calorieGoal.toString());

  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [useMacroCalc, setUseMacroCalc] = useState(true);
  const [foodData, setFoodData] = useState({ 
      name: '', 
      calories: '', 
      protein: '', 
      carbs: '', 
      fats: '',
      mealType: 'Breakfast' as 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'
  });

  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false);
  const [manualWater, setManualWater] = useState(waterIntake.toString());

  // Auto-calculate calories from macros
  useEffect(() => {
    if (useMacroCalc && (foodData.protein || foodData.carbs || foodData.fats)) {
        const p = parseInt(foodData.protein) || 0;
        const c = parseInt(foodData.carbs) || 0;
        const f = parseInt(foodData.fats) || 0;
        const calculatedCals = (p * 4) + (c * 4) + (f * 9);
        if (calculatedCals > 0) {
            setFoodData(prev => ({ ...prev, calories: calculatedCals.toString() }));
        }
    }
  }, [foodData.protein, foodData.carbs, foodData.fats, useMacroCalc]);

  const totalCaloriesIn = foodLog.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = foodLog.reduce((sum, item) => sum + item.macros.protein, 0);
  const totalCarbs = foodLog.reduce((sum, item) => sum + item.macros.carbs, 0);
  const totalFats = foodLog.reduce((sum, item) => sum + item.macros.fats, 0);

  const netBalance = totalCaloriesIn - burnedCalories;
  const remainingBudget = calorieGoal - netBalance;

  const proteinGoal = Math.round(calorieGoal * 0.3 / 4);
  const carbsGoal = Math.round(calorieGoal * 0.4 / 4);
  const fatsGoal = Math.round(calorieGoal * 0.3 / 9);

  const handleSaveGoal = () => {
    const newGoal = parseInt(tempGoal);
    if (onUpdateGoal && !isNaN(newGoal)) onUpdateGoal(newGoal);
    setIsEditingGoal(false);
  };

  const adjustGoal = (amount: number) => {
    const newGoal = calorieGoal + amount;
    if (onUpdateGoal && newGoal > 0) onUpdateGoal(newGoal);
    setTempGoal(newGoal.toString());
  };

  const openAddModal = (mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' = 'Breakfast') => {
    setEditingFoodId(null);
    setFoodData({ name: '', calories: '', protein: '', carbs: '', fats: '', mealType });
    setIsFoodModalOpen(true);
  };

  const openEditModal = (item: FoodItem) => {
    setEditingFoodId(item.id);
    setFoodData({
        name: item.name,
        calories: item.calories.toString(),
        protein: item.macros.protein.toString(),
        carbs: item.macros.carbs.toString(),
        fats: item.macros.fats.toString(),
        mealType: item.mealType
    });
    setUseMacroCalc(false);
    setIsFoodModalOpen(true);
  };

  const handleFoodSubmit = () => {
    const finalName = foodData.name.trim() || "Generic Fuel Entry";
    if (foodData.calories) {
        const payload: FoodItem = {
            id: editingFoodId || Date.now().toString(),
            name: finalName,
            calories: parseInt(foodData.calories),
            time: editingFoodId 
                ? foodLog.find(f => f.id === editingFoodId)?.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            mealType: foodData.mealType,
            macros: {
                protein: foodData.protein ? parseInt(foodData.protein) : 0,
                carbs: foodData.carbs ? parseInt(foodData.carbs) : 0,
                fats: foodData.fats ? parseInt(foodData.fats) : 0,
            }
        };

        if (editingFoodId) onUpdateFood(payload);
        else onAddFood(payload);

        setIsFoodModalOpen(false);
    }
  };

  const handleQuickAdd = (calories: number) => {
      onAddFood({
          id: Date.now().toString(),
          name: 'Quick Log',
          calories: calories,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mealType: 'Snack',
          macros: { protein: 0, carbs: 0, fats: 0 }
      });
      setIsFoodModalOpen(false);
  };

  const meals = {
    Breakfast: foodLog.filter(f => f.mealType === 'Breakfast'),
    Lunch: foodLog.filter(f => f.mealType === 'Lunch'),
    Dinner: foodLog.filter(f => f.mealType === 'Dinner'),
    Snack: foodLog.filter(f => f.mealType === 'Snack'),
  };

  const renderMealSection = (title: string, icon: React.ReactNode, items: FoodItem[]) => {
      const sectionCalories = items.reduce((acc, curr) => acc + curr.calories, 0);
      return (
          <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 animate-fade-in shadow-xl flex flex-col group/section">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-800/50">
                  <div className="flex items-center gap-4 text-neutral-400">
                      <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 text-brand-red group-hover/section:text-white transition-colors shadow-inner">
                        {icon}
                      </div>
                      <span className="font-display font-bold text-3xl uppercase tracking-tight text-white">{title}</span>
                  </div>
                  <span className="font-display font-bold text-brand-red text-3xl">{sectionCalories} <span className="text-xs uppercase text-neutral-600">kcal</span></span>
              </div>
              
              <div className="flex-1 space-y-4">
                {items.length === 0 ? (
                    <button onClick={() => openAddModal(title as any)} className="w-full py-12 text-[10px] font-bold text-neutral-600 hover:text-brand-red transition-all flex flex-col items-center justify-center border-2 border-dashed border-neutral-800 rounded-3xl uppercase tracking-[0.3em] group hover:bg-neutral-950 active:scale-[0.98]">
                        <Plus className="w-8 h-8 mb-3 group-hover:scale-125 transition-transform" /> Log {title}
                    </button>
                ) : (
                    <div className="grid gap-3">
                        {items.map(item => {
                            const totalMacros = item.macros.protein + item.macros.carbs + item.macros.fats || 1;
                            const pPct = Math.round((item.macros.protein / totalMacros) * 100);
                            const cPct = Math.round((item.macros.carbs / totalMacros) * 100);
                            const fPct = Math.round((item.macros.fats / totalMacros) * 100);
                            
                            return (
                                <div key={item.id} onClick={() => openEditModal(item)} className="flex justify-between items-center group/item bg-neutral-950/40 p-5 rounded-3xl border border-transparent hover:border-neutral-700 hover:bg-neutral-950 transition-all cursor-pointer shadow-inner">
                                    <div className="flex-1">
                                        <p className="font-bold text-base text-white uppercase tracking-tight">{item.name}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-3 rounded-full bg-brand-red" />
                                                <span className="text-[10px] text-neutral-500 font-bold uppercase">{pPct}%</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-3 rounded-full bg-neutral-600" />
                                                <span className="text-[10px] text-neutral-500 font-bold uppercase">{cPct}%</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-3 rounded-full bg-neutral-800" />
                                                <span className="text-[10px] text-neutral-500 font-bold uppercase">{fPct}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <span className="text-2xl font-display font-bold text-white leading-none block">{item.calories}</span>
                                            <span className="text-[8px] text-neutral-600 uppercase font-bold tracking-widest">KCAL</span>
                                        </div>
                                        <div className="flex flex-col gap-1.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); onDeleteFood(item.id); }} className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-600 hover:text-brand-red hover:border-brand-red/30 transition-all shadow-lg active:scale-90">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
              </div>
              
              {items.length > 0 && (
                <button onClick={() => openAddModal(title as any)} className="w-full mt-6 py-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-[10px] font-bold text-neutral-500 hover:text-brand-red hover:border-brand-red/20 transition-all flex items-center justify-center uppercase tracking-[0.2em] shadow-inner">
                    <Plus className="w-4 h-4 mr-2" /> DISPATCH MORE FUEL
                </button>
              )}
          </div>
      );
  };

  return (
    <div className="space-y-12 pb-32">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
         <div>
            <h2 className="text-5xl lg:text-7xl font-display font-bold uppercase tracking-tighter leading-none text-white">FUEL INTELLIGENCE</h2>
            <p className="text-xs lg:text-sm font-bold text-neutral-500 uppercase tracking-[0.4em] mt-2 italic">Performance dictates the outcome.</p>
         </div>
         <Button variant="primary" className="w-full md:w-auto h-16 px-10 text-xl tracking-[0.2em] flex items-center justify-center gap-3 rounded-[2rem]" onClick={() => openAddModal()}>
            <Fuel className="w-6 h-6" /> LOG NEW ASSET
         </Button>
       </div>

      {/* Cockpit Summary */}
      <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Net Balance Cockpit */}
          <div className="lg:col-span-8 bg-neutral-900 border border-neutral-800 rounded-[3.5rem] p-10 lg:p-14 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/5 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none"></div>
            
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-12 relative z-10">
                <div className="flex-1">
                    <p className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] mb-4">Remaining Daily Energy Threshold</p>
                    <div className="flex items-baseline gap-4 group">
                        <p className={`text-9xl lg:text-[12rem] font-display font-bold tracking-tighter leading-none transition-all duration-700 ${remainingBudget >= 0 ? 'text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.05)]' : 'text-brand-red drop-shadow-[0_0_30px_rgba(220,38,38,0.2)]'}`}>
                            {remainingBudget}
                        </p>
                        <div className="flex flex-col">
                            <span className="text-2xl font-display font-bold text-neutral-700 uppercase tracking-widest">Kcal</span>
                            <div className={`mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border transition-colors ${remainingBudget >= 0 ? 'bg-green-900/10 text-green-500 border-green-500/20' : 'bg-red-900/10 text-brand-red border-brand-red/20'}`}>
                                {remainingBudget >= 0 ? <Check className="w-2.5 h-2.5" /> : <TrendingUp className="w-2.5 h-2.5 rotate-180" />}
                                {remainingBudget >= 0 ? 'Surplus' : 'Deficit'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Goal Manager */}
                <div className="w-full xl:w-80 space-y-6">
                    <div className="flex justify-between items-center">
                        <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">Performance Goal</p>
                        <button onClick={() => setIsEditingGoal(!isEditingGoal)} className="text-neutral-700 hover:text-white transition-colors">
                            {isEditingGoal ? <X className="w-4 h-4" /> : <Edit2 className="w-3.5 h-3.5" />}
                        </button>
                    </div>

                    {isEditingGoal ? (
                        <div className="bg-neutral-950 p-6 rounded-[2rem] border border-brand-red/30 shadow-2xl animate-scale-in">
                            <input 
                                type="number" 
                                value={tempGoal} 
                                autoFocus
                                onChange={(e) => setTempGoal(e.target.value)}
                                className="w-full bg-transparent text-center font-display font-bold text-6xl text-brand-red outline-none border-b border-brand-red/20 pb-4 mb-6"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                 <button onClick={() => setIsEditingGoal(false)} className="py-3 rounded-xl bg-neutral-900 text-neutral-500 font-bold uppercase text-[10px] tracking-widest">Abort</button>
                                 <button onClick={handleSaveGoal} className="py-3 rounded-xl bg-brand-red text-white font-bold uppercase text-[10px] tracking-widest shadow-xl">Commit</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between bg-neutral-950/50 rounded-[2.5rem] p-2 border border-neutral-800 shadow-inner">
                            <button onClick={() => adjustGoal(-100)} className="w-14 h-14 bg-neutral-900 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all border border-neutral-800 active:scale-90"><Minus className="w-6 h-6" /></button>
                            <div className="text-center group cursor-pointer" onClick={() => { setTempGoal(calorieGoal.toString()); setIsEditingGoal(true); }}>
                                <p className="font-display font-bold text-6xl tracking-tight leading-none text-brand-red group-hover:scale-110 transition-transform">
                                    {calorieGoal}
                                </p>
                            </div>
                            <button onClick={() => adjustGoal(100)} className="w-14 h-14 bg-neutral-900 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all border border-neutral-800 active:scale-90"><Plus className="w-6 h-6" /></button>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-3 gap-2">
                        {[1500, 2500, 3500].map(val => (
                            <button 
                                key={val}
                                onClick={() => { if(onUpdateGoal) onUpdateGoal(val); setTempGoal(val.toString()); }}
                                className={`py-2 rounded-xl text-[8px] font-bold uppercase tracking-[0.2em] border transition-all ${calorieGoal === val ? 'bg-brand-red border-brand-red text-white' : 'bg-neutral-900 border-neutral-800 text-neutral-600 hover:text-white'}`}
                            >
                                {val}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 mt-12 border-t border-neutral-800/50">
                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-500" /> Intake
                    </p>
                    <p className="text-4xl font-display font-bold text-white leading-none">{totalCaloriesIn}</p>
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-4 h-4 text-brand-red" /> Activity
                    </p>
                    <p className="text-4xl font-display font-bold text-brand-red leading-none">-{Math.round(burnedCalories)}</p>
                </div>
                <div className="col-span-2 space-y-4">
                     <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Tactical Macro Status</p>
                     <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'P', current: totalProtein, goal: proteinGoal, color: 'bg-brand-red' },
                            { label: 'C', current: totalCarbs, goal: carbsGoal, color: 'bg-neutral-600' },
                            { label: 'F', current: totalFats, goal: fatsGoal, color: 'bg-neutral-800' }
                        ].map((macro) => (
                            <div key={macro.label} className="space-y-2">
                                <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden shadow-inner">
                                    <div className={`h-full ${macro.color} transition-all duration-1000 shadow-[0_0_10px_rgba(220,38,38,0.2)]`} style={{ width: `${Math.min((macro.current / macro.goal) * 100, 100)}%` }}></div>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                                    <span className="text-neutral-600">{macro.label}</span>
                                    <span className="text-white">{Math.round((macro.current / macro.goal) * 100)}%</span>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
          </div>

          {/* Secondary Hydration Card */}
          <div className="lg:col-span-4 bg-neutral-900 border border-neutral-800 rounded-[3.5rem] p-10 shadow-xl flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-5 mb-10">
                    <div className="bg-neutral-950 p-5 rounded-[2rem] border border-neutral-800 shadow-inner">
                        <Droplets className="w-8 h-8 text-brand-red" />
                    </div>
                    <div>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.2em] mb-1">Hydration Efficiency</p>
                        <p className="text-5xl font-display font-bold text-white uppercase tracking-tight tabular-nums">{waterIntake.toFixed(2)} <span className="text-xl text-neutral-700">/ {WATER_GOAL}L</span></p>
                    </div>
                </div>

                <div className="w-full bg-neutral-950 h-4 rounded-full border border-neutral-800 overflow-hidden shadow-inner mb-10">
                    <div className="bg-brand-red h-full transition-all duration-1000 shadow-[0_0_20px_rgba(220,38,38,0.4)]" style={{ width: `${Math.min((waterIntake / WATER_GOAL) * 100, 100)}%` }}></div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setWaterIntake(prev => Math.min(prev + 0.25, 5))} className="py-8 rounded-3xl bg-neutral-950 border border-neutral-800 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-800 active:scale-95 transition-all text-neutral-400 hover:text-white shadow-inner">
                    + 250ML
                </button>
                <button onClick={() => setWaterIntake(prev => Math.min(prev + 0.5, 5))} className="py-8 rounded-3xl bg-neutral-950 border border-neutral-800 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-800 active:scale-95 transition-all text-neutral-400 hover:text-white shadow-inner">
                    + 500ML
                </button>
            </div>
            
            <button 
                onClick={() => setIsWaterModalOpen(true)}
                className="w-full mt-4 py-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-[9px] font-bold uppercase tracking-[0.4em] text-neutral-600 hover:text-white transition-all flex items-center justify-center gap-2 group"
            >
                <Edit2 className="w-3 h-3 group-hover:rotate-12 transition-transform" /> Manual Intelligence Override
            </button>
          </div>
      </div>

      {/* Tactical Fuel Logs */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
          {renderMealSection('Breakfast', <Coffee className="w-8 h-8" />, meals.Breakfast)}
          {renderMealSection('Lunch', <Sun className="w-8 h-8" />, meals.Lunch)}
          {renderMealSection('Dinner', <Moon className="w-8 h-8" />, meals.Dinner)}
          {renderMealSection('Snack', <Zap className="w-8 h-8" />, meals.Snack)}
      </div>

      {/* Manual Water Sheet */}
      {isWaterModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-fade-in">
            <div className="bg-neutral-900 border border-neutral-800 w-full max-w-sm rounded-[3.5rem] p-12 relative shadow-2xl">
                 <button onClick={() => setIsWaterModalOpen(false)} className="absolute top-8 right-8 text-neutral-400 hover:text-white transition-colors">
                    <X className="w-10 h-10" />
                </button>
                <h3 className="text-4xl font-display font-bold mb-2 uppercase tracking-tighter leading-none text-brand-red text-center">Refine Liquid Intel</h3>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-center mb-10">Manual Dispatch Entry</p>
                
                <div className="space-y-8">
                    <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4 text-center">Liters Transmitted</label>
                        <input 
                            type="number" 
                            step="0.01"
                            value={manualWater} 
                            onChange={(e) => setManualWater(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-3xl p-8 text-white focus:border-brand-red outline-none font-display font-bold text-6xl shadow-inner text-center"
                        />
                    </div>
                    <Button onClick={() => { setWaterIntake(parseFloat(manualWater) || 0); setIsWaterModalOpen(false); }} fullWidth className="h-20 rounded-3xl text-2xl tracking-[0.2em]">COMMIT REFUEL</Button>
                </div>
            </div>
        </div>
      )}

      {/* Precise Nutrient Entry Sheet */}
      {isFoodModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/95 backdrop-blur-3xl animate-fade-in">
            <div className="bg-neutral-900 border-t sm:border border-neutral-800 w-full max-w-2xl rounded-t-[4rem] sm:rounded-[4rem] p-10 lg:p-14 relative max-h-[95vh] overflow-y-auto no-scrollbar shadow-[0_0_100px_rgba(220,38,38,0.2)]">
                 <button onClick={() => setIsFoodModalOpen(false)} className="absolute top-10 right-10 text-neutral-400 hover:text-white transition-colors">
                    <X className="w-10 h-10" />
                </button>
                <h3 className="text-6xl font-display font-bold mb-4 uppercase tracking-tighter leading-none text-brand-red">{editingFoodId ? 'Modify Strategy' : 'New Nutrient Dispatch'}</h3>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.3em] mb-12 italic">Intel validation required for mission accuracy.</p>

                {!editingFoodId && (
                    <div className="grid grid-cols-3 gap-4 mb-12">
                        {[200, 400, 600].map(cals => (
                            <button key={cals} onClick={() => handleQuickAdd(cals)} className="bg-neutral-950 border border-neutral-800 hover:bg-brand-red hover:text-white transition-all py-5 rounded-3xl text-[12px] font-bold uppercase tracking-[0.3em] shadow-inner active:scale-95">+{cals} KCAL</button>
                        ))}
                    </div>
                )}
                
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Intel Category</label>
                            <select 
                                value={foodData.mealType} 
                                onChange={(e) => setFoodData({...foodData, mealType: e.target.value as any})}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-5 text-white font-bold outline-none shadow-inner appearance-none focus:border-brand-red"
                            >
                                <option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Asset Designation</label>
                            <input type="text" value={foodData.name} onChange={(e) => setFoodData({...foodData, name: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-5 text-white focus:border-brand-red outline-none font-bold shadow-inner" placeholder="e.g. Bison Steak"/>
                        </div>
                    </div>

                    <div className="pt-4 p-8 bg-neutral-950 rounded-[3rem] border border-neutral-800 shadow-inner">
                        <div className="flex justify-between items-center mb-8">
                            <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Macro Composition Analysis (Grams)</label>
                            <button 
                                onClick={() => setUseMacroCalc(!useMacroCalc)}
                                className={`flex items-center gap-3 px-4 py-2 rounded-2xl text-[10px] font-bold uppercase transition-all shadow-xl ${useMacroCalc ? 'bg-brand-red text-white shadow-red-900/30' : 'bg-neutral-800 text-neutral-500'}`}
                            >
                                <Calculator className="w-5 h-5" /> {useMacroCalc ? 'Auto-Analysis On' : 'Manual Entry'}
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                            {['protein', 'carbs', 'fats'].map(macro => (
                                <div key={macro} className="space-y-3 text-center">
                                    <label className="block text-[9px] font-bold text-neutral-600 uppercase tracking-widest">{macro}</label>
                                    <input 
                                        type="number" 
                                        value={(foodData as any)[macro]} 
                                        onChange={(e) => setFoodData({...foodData, [macro]: e.target.value})} 
                                        className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center text-white focus:border-brand-red outline-none font-display font-bold text-4xl shadow-inner" 
                                        placeholder="0"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative pt-4">
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4 text-center">Total Kinetic Energy (Calories)</label>
                        <input 
                            type="number" 
                            value={foodData.calories} 
                            onChange={(e) => {
                                setFoodData({...foodData, calories: e.target.value});
                                if (useMacroCalc) setUseMacroCalc(false); 
                            }} 
                            className={`w-full bg-neutral-950 border border-neutral-800 rounded-[3rem] p-10 text-white focus:border-brand-red outline-none font-display font-bold text-7xl lg:text-9xl shadow-inner transition-all text-center ${useMacroCalc && (foodData.protein || foodData.carbs || foodData.fats) ? 'border-brand-red/50 text-brand-red' : ''}`} 
                            placeholder="0"
                        />
                        {useMacroCalc && (foodData.protein || foodData.carbs || foodData.fats) && (
                            <div className="absolute right-10 bottom-10 text-xs font-bold text-brand-red uppercase tracking-[0.4em] animate-pulse flex items-center gap-2">
                                <Zap className="w-4 h-4 fill-current" /> CALCULATED
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button variant="secondary" onClick={() => setIsFoodModalOpen(false)} fullWidth className="h-20 rounded-[2.5rem] text-sm lg:text-base uppercase tracking-[0.3em]">ABORT MISSION</Button>
                        <Button onClick={handleFoodSubmit} fullWidth className="h-20 rounded-[2.5rem] text-2xl tracking-[0.2em] shadow-red-900/40">
                            {editingFoodId ? 'UPDATE LOG' : 'COMMIT DISPATCH'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};