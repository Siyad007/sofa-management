'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { haptic } from '@/lib/design-system';
import { 
  Plus, 
  X, 
  Check, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Coffee,
  Trash2,
  RefreshCw,
  AlertCircle,
  Calendar as CalendarIcon,
  Zap
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';

interface WorkType {
  id: string;
  display_name: string;
  icon: string;
  color: string;
}

interface Operation {
  id: string;
  display_name: string;
  icon: string;
}

interface DailyItem {
  id?: string;
  work_type_id: string;
  quantity: number;
  operation_ids: string[];
}

interface Pricing {
  work_type_id: string;
  operation_id: string;
  price: string | number;
}

interface EntryBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  workTypes: WorkType[];
  operations: Operation[];
  onConfirm: (wtId: string, qty: number, opIds: string[]) => void;
}

export default function DailyEntryMobile() {
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [items, setItems] = useState<DailyItem[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLeave, setIsLeave] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBaseData();
  }, []);

  useEffect(() => {
    loadDailyData();
  }, [date]);

  const loadBaseData = async () => {
    try {
      const [wtRes, opRes, prRes] = await Promise.all([
        supabase.from('work_types').select('*'),
        supabase.from('operations').select('*'),
        supabase.from('pricing').select('*')
      ]);
      setWorkTypes(wtRes.data || []);
      setOperations(opRes.data || []);
      setPricing(prRes.data || []);
    } catch (err) {
      setError('Database connection error');
    }
  };

  const loadDailyData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: entry, error: fetchErr } = await supabase
        .from('daily_entries')
        .select('*, daily_entry_items(*, item_operations(*))')
        .eq('date', date)
        .maybeSingle();

      if (fetchErr && fetchErr.code !== 'PGRST116') throw fetchErr;

      if (entry) {
        setIsLeave(entry.is_leave);
        const loadedItems = (entry.daily_entry_items || []).map((item: any) => ({
          id: item.id,
          work_type_id: item.work_type_id,
          quantity: item.quantity,
          operation_ids: (item.item_operations || []).map((io: any) => io.operation_id)
        }));
        setItems(loadedItems);
      } else {
        setIsLeave(false);
        setItems([]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load today\'s work');
    } finally {
      setLoading(false);
    }
  };

  const calculateItemPrice = (item: DailyItem) => {
    return item.operation_ids.reduce((total, opId) => {
      const priceObj = pricing.find(p => p.work_type_id === item.work_type_id && p.operation_id === opId);
      return total + (priceObj ? parseFloat(priceObj.price.toString()) : 0);
    }, 0) * item.quantity;
  };

  const dailyTotal = items.reduce((total, item) => total + calculateItemPrice(item), 0);

  const saveDay = async () => {
    haptic.medium();
    setSaving(true);
    setError(null);

    try {
      const { data: entry, error: entryErr } = await supabase
        .from('daily_entries')
        .upsert({ date, is_leave: isLeave }, { onConflict: 'date' })
        .select()
        .single();

      if (entryErr) {
        console.error('Entry Error:', entryErr);
        throw new Error(`Entry failure: ${entryErr.message}`);
      }

      await supabase.from('daily_entry_items').delete().eq('entry_id', entry.id);

      if (!isLeave) {
        for (const item of items) {
          const { data: newItem, error: itemErr } = await supabase
            .from('daily_entry_items')
            .insert({
              entry_id: entry.id,
              work_type_id: item.work_type_id,
              quantity: item.quantity
            })
            .select()
            .single();

          if (itemErr) {
            console.error('Batch Item Error:', itemErr);
            throw new Error(`Batch failure: ${itemErr.message}`);
          }

          if (newItem && item.operation_ids.length > 0) {
            const opsToInsert = item.operation_ids.map(opId => ({
              item_id: newItem.id,
              operation_id: opId
            }));
            const { error: opsErr } = await supabase.from('item_operations').insert(opsToInsert);
            if (opsErr) throw opsErr;
          }
        }
      }

      haptic.heavy();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      loadDailyData();
    } catch (err: any) {
      console.error('Full Save Error:', err);
      setError(err.message || 'System logic failure during commit');
      haptic.medium();
    } finally {
      setSaving(false);
    }
  };

  const copyWhatsApp = () => {
    haptic.heavy();
    let text = `📋 *DAILY WORK REPORT*\n📅 Date: ${new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}\n\n`;
    
    if (isLeave) {
      text += "🏠 *STATUS: LEAVE / REST DAY*";
    } else if (items.length === 0) {
      text += "No work recorded.";
    } else {
      items.forEach((item) => {
        const wt = workTypes.find(w => w.id === item.work_type_id);
        const ops = item.operation_ids.map(id => operations.find(o => o.id === id)?.display_name.toLowerCase()).join(' ');
        text += `${item.quantity} ${wt?.display_name.toLowerCase()} ${ops}\n`;
      });
    }

    navigator.clipboard.writeText(text.trim());
    haptic.medium();
  };

  const changeDate = (days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    setDate(newDate.toISOString().split('T')[0]);
    haptic.light();
  };

  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <PageTransition>
      <div className="min-h-screen safe-top px-8 pb-56 app-container">
        <div className="bg-aurora" />
        
        <header className="mb-14 pt-10 flex items-end justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 mb-3 text-blue-500 font-black uppercase tracking-[0.4em] text-[10px]">
              <Zap className="w-4 h-4 fill-blue-500" /> Production Engine
            </div>
            <h1 className="text-5xl font-black tracking-tighter leading-none mb-1">Workshop</h1>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] ml-1">Daily Work Ledger</p>
          </motion.div>
          
          {!isLeave && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-right"
            >
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Day Value</p>
              <h2 className="text-4xl font-black text-emerald-400 tabular-nums leading-none">₹{dailyTotal.toFixed(0)}</h2>
            </motion.div>
          )}
        </header>

        <div className="space-y-4 mb-10">
          <div className="card-heavy p-6 md:p-8 flex items-center justify-between gap-4 md:gap-6 border-l-[10px] md:border-l-[12px] border-blue-500 shadow-blue-500/10">
            <button 
              onClick={() => changeDate(-1)} 
              className="w-12 h-12 md:w-16 md:h-16 rounded-[20px] md:rounded-[28px] bg-white/5 flex items-center justify-center border border-white/10"
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-white/60" />
            </button>
            
            <div className="flex-1 text-center relative">
              <p className="text-[9px] md:text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-1 md:mb-2">Sequence Date</p>
              <div className="text-xl md:text-3xl font-black tracking-tighter text-white flex items-center justify-center gap-2 md:gap-3">
                <CalendarIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-500/40" />
                {formattedDate}
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
            </div>

            <button 
              onClick={() => changeDate(1)} 
              className="w-12 h-12 md:w-16 md:h-16 rounded-[20px] md:rounded-[28px] bg-white/5 flex items-center justify-center border border-white/10"
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white/60" />
            </button>
          </div>

          <div className="flex gap-5">
            <button 
              onClick={() => { setIsLeave(!isLeave); haptic.medium(); }}
              className={`flex-1 p-7 rounded-[32px] border-2 transition-all duration-500 flex items-center justify-center gap-4 font-black text-xs uppercase tracking-[0.3em] ${
                isLeave 
                ? 'bg-orange-500/20 border-orange-500 text-orange-500 shadow-[0_20px_40px_rgba(249,115,22,0.2)]' 
                : 'bg-white/5 border-white/5 text-white/20 hover:text-white/40'
              }`}
            >
              <Coffee className={`w-6 h-6 ${isLeave ? 'animate-bounce' : ''}`} />
              {isLeave ? 'REST SEQUENCE' : 'MARK LEAVE'}
            </button>

            <button 
              onClick={loadDailyData}
              className="w-24 rounded-[32px] bg-white/5 border-2 border-white/5 flex items-center justify-center text-white/20 hover:text-white/40 transition-all active:rotate-180 duration-700"
            >
              <RefreshCw className={`w-8 h-8 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border-2 border-red-500/30 rounded-[28px] p-6 mb-10 flex items-center gap-5 text-red-400 font-black text-xs uppercase tracking-widest"
          >
            <AlertCircle className="w-7 h-7 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="card-heavy p-12 animate-pulse bg-white/5 border-transparent h-32" />
              ))}
            </div>
          ) : !isLeave ? (
            items.length > 0 ? (
              <div className="space-y-6">
                {items.map((item, index) => {
                  const wt = workTypes.find(w => w.id === item.work_type_id);
                  const price = calculateItemPrice(item);
                  return (
                    <motion.div
                      key={index}
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      className="card-heavy p-5 md:p-8 flex items-center gap-4 md:gap-10 group relative overflow-hidden"
                      style={{ borderLeftColor: wt?.color || '#3b82f6', borderLeftWidth: '8px' }}
                    >
                      <div className="w-16 h-16 md:w-24 md:h-24 rounded-[20px] md:rounded-[36px] bg-white/5 flex items-center justify-center text-4xl md:text-6xl shadow-inner border border-white/10">
                        {wt?.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-xl md:text-3xl truncate tracking-tighter mb-1 md:mb-3 leading-none">{wt?.display_name}</h4>
                        <div className="flex flex-wrap gap-1.5 md:gap-2.5">
                          {item.operation_ids.map(id => (
                            <span key={id} className="bg-white/10 text-[8px] md:text-[10px] font-black px-2 md:px-4 py-1 md:py-2 rounded-lg md:rounded-xl border border-white/5 uppercase text-white/40 tracking-widest">
                              {operations.find(o => o.id === id)?.display_name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right z-10">
                        <div className="text-3xl md:text-6xl font-black text-blue-400 tabular-nums leading-none tracking-tighter">×{item.quantity}</div>
                      </div>
                      <button 
                        onClick={() => {
                          setItems(items.filter((_, i) => i !== index));
                          haptic.heavy();
                        }}
                        className="absolute -top-1 -right-1 w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90 shadow-2xl z-20"
                      >
                        <Trash2 className="w-7 h-7" />
                      </button>
                    </motion.div>
                  );
                })}
                
                <div className="grid grid-cols-2 gap-6 pt-16">
                  <button 
                    onClick={copyWhatsApp} 
                    className="h-28 rounded-[44px] glass-heavy border-2 border-emerald-500/30 flex flex-col items-center justify-center gap-2 group active:scale-95 transition-all hover:bg-emerald-500/5"
                  >
                    <MessageCircle className="w-10 h-10 text-emerald-500 group-hover:scale-110 transition-transform duration-500" />
                    <span className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em]">Share Report</span>
                  </button>
                  <button 
                    onClick={saveDay} 
                    disabled={saving}
                    className="btn-apple-primary h-28 !rounded-[44px] flex flex-col items-center justify-center gap-2 shadow-[0_30px_80px_rgba(10,132,255,0.4)] disabled:opacity-50 relative overflow-hidden"
                  >
                    {saving ? (
                      <RefreshCw className="w-8 h-8 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-10 h-10" strokeWidth={5} />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">COMMIT TO LOG</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-48 card-heavy border-dashed border-2 border-white/5 bg-transparent group">
                <div className="text-9xl mb-12 grayscale opacity-10 group-hover:opacity-30 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000">🛋️</div>
                <h3 className="text-4xl font-black mb-4 text-white/20 tracking-tighter uppercase">Station Idle</h3>
                <p className="text-white/10 font-bold uppercase tracking-[0.5em] text-[11px]">Awaiting Production Pulse</p>
              </motion.div>
            )
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-48 card-heavy border-dashed border-2 border-orange-500/20 bg-orange-500/[0.03]">
              <Coffee className="w-32 h-32 text-orange-500/20 mx-auto mb-12 animate-pulse" />
              <h3 className="text-5xl font-black mb-4 text-orange-500/40 tracking-tighter uppercase">Rest sequence</h3>
              <p className="text-orange-500/20 font-black uppercase tracking-[0.4em] text-xs">Recharging neural capacity</p>
              <button 
                onClick={saveDay} 
                disabled={saving}
                className="mt-20 text-[11px] font-black text-white/30 underline decoration-white/20 underline-offset-[16px] uppercase tracking-[0.5em] hover:text-white transition-all"
              >
                {saving ? 'SYNCHRONIZING...' : 'CONFIRM REST STATUS'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB POSITIONED BETTER */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setShowBottomSheet(true);
            haptic.medium();
          }}
          className="fixed bottom-36 right-10 w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_30px_80px_rgba(10,132,255,0.6)] flex items-center justify-center z-[900] border-4 border-white/20"
        >
          <Plus className="w-14 h-14 text-white" strokeWidth={5} />
        </motion.button>

        <EntryBottomSheet
          isOpen={showBottomSheet}
          onClose={() => setShowBottomSheet(false)}
          workTypes={workTypes}
          operations={operations}
          onConfirm={(wtId, qty, opIds) => {
            setItems([...items, { work_type_id: wtId, quantity: qty, operation_ids: opIds }]);
            setShowBottomSheet(false);
            haptic.heavy();
          }}
        />

        <AnimatePresence>
          {showSuccess && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 flex items-center justify-center z-[2000] bg-black/98 backdrop-blur-3xl">
              <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} className="bg-emerald-500 rounded-full p-24 shadow-[0_0_250px_rgba(16,185,129,0.6)]">
                <Sparkles className="w-48 h-48 text-white" strokeWidth={4} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

function EntryBottomSheet({ isOpen, onClose, workTypes, operations, onConfirm }: EntryBottomSheetProps) {
  const [workTypeId, setWorkTypeId] = useState('');
  const [selectedOps, setSelectedOps] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  const toggleOp = (id: string) => {
    setSelectedOps(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    haptic.light();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[1000]" 
          />
          <motion.div 
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }} 
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto glass-heavy rounded-t-[40px] md:rounded-t-[64px] border-t-2 border-white/10 z-[1010] pb-20 md:pb-40 max-h-[96vh] flex flex-col"
          >
            <div className="w-16 h-1.5 md:w-24 md:h-2.5 bg-white/20 rounded-full mx-auto mt-6 md:mt-10 mb-8 md:mb-14 flex-shrink-0" />
            
            <div className="px-6 md:px-14 flex-1 overflow-y-auto space-y-10 md:space-y-14 scrollbar-none">
              <div className="flex items-center justify-between">
                <h3 className="text-3xl md:text-6xl font-black tracking-tighter uppercase">New Batch</h3>
                <button onClick={onClose} className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <X className="w-6 h-6 md:w-10 md:h-10 text-white/40" />
                </button>
              </div>
              
              <div className="space-y-10 md:space-y-14">
                {/* Sofa Type */}
                <div>
                  <label className="text-[10px] md:text-[12px] font-black text-white/30 uppercase tracking-[0.4em] md:tracking-[0.6em] ml-2 mb-4 md:mb-8 block">Prototype Selection</label>
                  <div className="grid grid-cols-2 gap-4 md:gap-6">
                    {workTypes.map((wt) => (
                      <button
                        key={wt.id}
                        onClick={() => { setWorkTypeId(wt.id); haptic.medium(); }}
                        className={`p-6 md:p-10 rounded-[24px] md:rounded-[40px] flex flex-col items-center gap-3 md:gap-5 transition-all border-2 duration-500 ${
                          workTypeId === wt.id ? 'bg-blue-500/20 border-blue-500 shadow-lg' : 'bg-white/5 border-transparent grayscale opacity-40'
                        }`}
                      >
                        <span className="text-4xl md:text-6xl">{wt.icon}</span>
                        <span className="font-black text-[10px] md:text-sm tracking-tight uppercase">{wt.display_name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Operations Checklist */}
                <div>
                  <label className="text-[10px] md:text-[12px] font-black text-white/30 uppercase tracking-[0.4em] md:tracking-[0.6em] ml-2 mb-4 md:mb-8 block">Operation Protocol</label>
                  <div className="grid grid-cols-1 gap-3 md:gap-5">
                    {operations.map((op) => (
                      <button
                        key={op.id}
                        onClick={() => toggleOp(op.id)}
                        className={`w-full p-5 md:p-8 rounded-[24px] md:rounded-[40px] flex items-center justify-between border-2 transition-all duration-500 ${
                          selectedOps.includes(op.id) ? 'bg-emerald-500/20 border-emerald-500/60' : 'bg-white/5 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-4 md:gap-6">
                          <span className="text-2xl md:text-4xl">{op.icon}</span>
                          <span className="font-black text-lg md:text-2xl tracking-tighter">{op.display_name}</span>
                        </div>
                        <div className={`w-8 h-8 md:w-11 md:h-11 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                          selectedOps.includes(op.id) ? 'bg-emerald-500 border-emerald-500' : 'border-white/10'
                        }`}>
                          {selectedOps.includes(op.id) && <Check className="w-4 h-4 md:w-6 md:h-6 text-white" strokeWidth={6} />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="text-[10px] md:text-[12px] font-black text-white/30 uppercase tracking-[0.4em] md:tracking-[0.6em] ml-2 mb-4 md:mb-8 block">Batch Yield</label>
                  <div className="flex items-center gap-6 md:gap-10 bg-white/5 p-3 md:p-5 rounded-[32px] md:rounded-[48px] border border-white/10">
                    <button onClick={() => { setQuantity(Math.max(1, quantity - 1)); haptic.medium(); }} className="w-16 h-16 md:w-24 md:h-24 rounded-[20px] md:rounded-[36px] bg-white/5 flex items-center justify-center font-black text-4xl md:text-6xl">-</button>
                    <span className="flex-1 text-center text-5xl md:text-8xl font-black tabular-nums tracking-tighter">{quantity}</span>
                    <button onClick={() => { setQuantity(quantity + 1); haptic.medium(); }} className="w-16 h-16 md:w-24 md:h-24 rounded-[20px] md:rounded-[36px] bg-white/5 flex items-center justify-center font-black text-4xl md:text-6xl">+</button>
                  </div>
                </div>

                <div className="pt-6 pb-10">
                  <button 
                    onClick={() => {
                      if (workTypeId && selectedOps.length > 0) {
                        onConfirm(workTypeId, quantity, selectedOps);
                        setWorkTypeId('');
                        setSelectedOps([]);
                        setQuantity(1);
                      }
                    }} 
                    disabled={!workTypeId || selectedOps.length === 0}
                    className="btn-apple-primary w-full h-24 md:h-32 !rounded-[32px] md:!rounded-[48px] shadow-lg disabled:opacity-20 flex items-center justify-center gap-4 md:gap-6"
                  >
                    <Check className="w-8 h-8 md:w-12 md:h-12" strokeWidth={6} />
                    <span className="text-xl md:text-3xl font-black tracking-[0.2em] uppercase">Commit Log</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
