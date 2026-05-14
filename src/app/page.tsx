'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { 
  ChevronRight, 
  BarChart3, 
  Zap,
  Coffee,
  CheckCircle2,
  Plus,
  Sparkles,
  MessageCircle,
  X,
  ClipboardCheck,
  LayoutGrid
} from 'lucide-react';
import Link from 'next/link';
import { haptic } from '@/lib/design-system';
import PageTransition from '@/components/PageTransition';

interface DashboardStats {
  todayWork: number;
  weekSalary: number;
  weekExpenses: number;
  isLeaveToday: boolean;
}

interface TodayWorkItem {
  work_type_name: string;
  quantity: number;
  operations: string[];
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    todayWork: 0,
    weekSalary: 0,
    weekExpenses: 0,
    isLeaveToday: false
  });
  const [todayItems, setTodayItems] = useState<TodayWorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const now = new Date();
      const day = now.getDay();
      const saturday = new Date(now);
      saturday.setDate(now.getDate() + (6 - day));
      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() - 6);
      const startStr = sunday.toISOString().split('T')[0];
      const endStr = saturday.toISOString().split('T')[0];

      // 1. Today's Items & Count
      const { data: todayEntry } = await supabase
        .from('daily_entries')
        .select('*, daily_entry_items(*, work_types(*), item_operations(*, operations(*)))')
        .eq('date', today)
        .maybeSingle();
      
      if (todayEntry) {
        const items = (todayEntry.daily_entry_items || []).map((item: any) => ({
          work_type_name: item.work_types.display_name,
          quantity: item.quantity,
          operations: (item.item_operations || []).map((io: any) => io.operations.display_name)
        }));
        setTodayItems(items);
        setStats(prev => ({ ...prev, todayWork: items.reduce((s: number, i: any) => s + i.quantity, 0), isLeaveToday: todayEntry.is_leave }));
      }

      // 2. Weekly Salary
      const { data: entries } = await supabase
        .from('daily_entries')
        .select('*, daily_entry_items(*, item_operations(*))')
        .gte('date', startStr)
        .lte('date', endStr);

      const { data: pricing } = await supabase.from('pricing').select('*');

      let weekTotal = 0;
      if (entries && pricing) {
        entries.forEach(entry => {
          (entry.daily_entry_items || []).forEach((item: any) => {
            const itemOpTotal = (item.item_operations || []).reduce((sum: number, io: any) => {
              const p = pricing.find(pr => pr.work_type_id === item.work_type_id && pr.operation_id === io.operation_id);
              return sum + (p ? parseFloat(p.price) : 0);
            }, 0);
            weekTotal += itemOpTotal * item.quantity;
          });
        });
      }

      setStats(prev => ({ ...prev, weekSalary: weekTotal }));
    } catch (error) {
      console.error('Dashboard Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyWhatsAppSummary = () => {
    haptic.heavy();
    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
    let text = `📋 *DAILY WORK REPORT*\n📅 Date: ${today}\n\n`;
    
    if (stats.isLeaveToday) {
      text += "🏠 *STATUS: LEAVE / REST DAY*";
    } else if (todayItems.length === 0) {
      text += "No work recorded.";
    } else {
      todayItems.forEach((item) => {
        const ops = item.operations.map(o => o.toLowerCase()).join(' ');
        text += `${item.quantity} ${item.work_type_name.toLowerCase()} ${ops}\n`;
      });
    }

    navigator.clipboard.writeText(text.trim());
    haptic.medium();
    setShowSummary(false);
  };

  return (
    <PageTransition>
      <main className="min-h-screen app-container safe-top pb-64 px-8 overflow-x-hidden">
        {/* Cinematic Background Layer */}
        <div className="fixed inset-0 pointer-events-none z-[-1]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[60vh] bg-gradient-to-b from-blue-600/10 via-transparent to-transparent blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-full h-[30vh] bg-gradient-to-t from-purple-600/5 to-transparent blur-[100px]" />
        </div>
        
        <header className="mb-16 pt-12 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-3 mb-4 text-blue-500 font-black uppercase tracking-[0.5em] text-[10px]">
              <div className="w-8 h-[1px] bg-blue-500/50" /> Daxo OS Alpha
            </div>
            <h1 className="text-6xl font-black tracking-tighter leading-none mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">DAXO</h1>
            <p className="text-[11px] font-black text-blue-400/60 uppercase tracking-[0.4em] ml-1">Sofa Engineering Hub</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative group cursor-pointer"
          >
            <div className="w-20 h-20 rounded-[28px] overflow-hidden border-2 border-white/10 group-hover:border-blue-500/50 transition-all duration-700 bg-blue-500/10 shadow-2xl">
              <img 
                src="/photo_2025-02-02_10-20-26.jpg" 
                className="w-full h-full object-cover mix-blend-overlay opacity-90 brightness-125 contrast-125 grayscale hover:grayscale-0 transition-all duration-700" 
                alt="Daxo Identity" 
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-4 border-black flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </motion.div>
        </header>

        {stats.isLeaveToday && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 p-6 rounded-[32px] bg-orange-500/10 border-2 border-orange-500/20 text-orange-500 text-[12px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(249,115,22,0.1)]"
          >
            <Coffee className="w-6 h-6 animate-bounce" /> REST SEQUENCE ENGAGED
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* Weekly Salary Bento - Full Width on Mobile */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 card-heavy p-8 md:p-14 relative overflow-hidden group border-l-[12px] md:border-l-[20px] border-emerald-500 shadow-[0_30px_100px_rgba(0,0,0,0.4)]"
          >
            <div className="absolute top-0 right-0 w-full h-full bg-emerald-500/5 blur-[140px] rounded-full -mr-32 -mt-32" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6 md:mb-8">
                <div className="w-1.5 h-8 md:h-10 bg-emerald-500 rounded-full" />
                <p className="text-[10px] md:text-xs font-black text-white/30 uppercase tracking-[0.3em]">Fiscal Cycle Revenue</p>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6">
                <h2 className="text-6xl md:text-[120px] font-black tracking-tighter text-emerald-400 drop-shadow-[0_0_50px_rgba(52,211,153,0.4)] leading-none">₹{stats.weekSalary.toFixed(0)}</h2>
                <div className="hidden md:block p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <TrendingUpIcon className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
              
              <div className="mt-8 md:mt-16">
                <button 
                  onClick={() => { setShowSummary(true); haptic.medium(); }}
                  className="btn-apple-primary w-full md:w-auto flex items-center justify-center gap-4 !from-blue-600 !to-blue-800 shadow-[0_20px_60px_rgba(10,132,255,0.4)] h-20 md:h-24 !rounded-[32px] md:!rounded-[40px] group/btn overflow-hidden relative"
                >
                  <ClipboardCheck className="w-6 h-6 md:w-8 md:h-8" />
                  <span className="text-[11px] md:text-sm font-black tracking-[0.2em] uppercase">Compute Summary</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Today's Ledger Bento */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="card-heavy p-8 md:p-12 border-t-[12px] md:border-t-[16px] border-blue-500 shadow-[0_30px_80px_rgba(10,132,255,0.2)]"
          >
            <div className="flex items-center justify-between mb-8 md:mb-10">
              <div className="flex items-center gap-4 md:gap-5">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-[20px] md:rounded-[28px] bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                  <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div>
                  <p className="text-[9px] md:text-[11px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Today's Yield</p>
                  <h3 className="text-4xl md:text-7xl font-black text-blue-400 tabular-nums leading-none tracking-tighter">{stats.todayWork}</h3>
                </div>
              </div>
              <Link 
                href="/daily-entry" 
                onClick={() => haptic.light()}
                className="w-12 h-12 md:w-16 md:h-16 rounded-[16px] md:rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center"
              >
                <Plus className="w-6 h-6 text-blue-500" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {todayItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-[20px] bg-white/[0.03] border border-white/5">
                  <span className="text-sm md:text-lg font-black tracking-tight text-white/80">{item.quantity} × {item.work_type_name}</span>
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/20">{item.operations.join(', ')}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Cinematic Footer Button */}
        <div className="fixed bottom-36 left-0 right-0 px-8 pointer-events-none">
          <div className="max-w-4xl mx-auto flex justify-end">
            <Link href="/daily-entry" onClick={() => haptic.medium()} className="pointer-events-auto">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_30px_80px_rgba(10,132,255,0.6)] flex items-center justify-center border-4 border-white/20 relative group"
              >
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <Plus className="w-14 h-14 text-white relative z-10" strokeWidth={5} />
              </motion.div>
            </Link>
          </div>
        </div>

        {/* Summary Modal - Extended Cinematic */}
        <AnimatePresence>
          {showSummary && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setShowSummary(false)}
                className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[2000]" 
              />
              <motion.div 
                initial={{ scale: 0.8, opacity: 0, y: 50, rotateX: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50, rotateX: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-xl glass-heavy rounded-[64px] p-16 z-[2010] border-t-2 border-white/10 shadow-[0_50px_150px_rgba(0,0,0,1)]"
              >
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h3 className="text-6xl font-black tracking-tighter leading-none mb-2">SUMMARY</h3>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Audit Sequence Completed</p>
                  </div>
                  <button onClick={() => setShowSummary(false)} className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 active:scale-90 transition-all">
                    <X className="w-8 h-8 text-white/40" />
                  </button>
                </div>

                <div className="bg-white/5 rounded-[40px] p-10 mb-12 border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
                  <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.5em] mb-8 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Encrypted Payload Preview
                  </p>
                  <div className="text-lg font-black text-emerald-400/90 space-y-4 whitespace-pre-wrap tracking-tight leading-relaxed">
                    {`📋 *DAILY WORK REPORT*\n📅 Date: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}\n\n`}
                    {todayItems.map(item => `${item.quantity} ${item.work_type_name.toLowerCase()} ${item.operations.map(o => o.toLowerCase()).join(' ')}`).join('\n')}
                    {todayItems.length === 0 && "System standby: No data packets logged."}
                  </div>
                </div>

                <button 
                  onClick={copyWhatsAppSummary}
                  className="btn-apple-primary w-full h-32 !rounded-[44px] flex items-center justify-center gap-6 !from-emerald-600 !to-emerald-800 shadow-[0_30px_80px_rgba(16,185,129,0.4)] group/copy overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/copy:translate-x-full transition-transform duration-1000" />
                  <MessageCircle className="w-12 h-12 group-hover/copy:scale-110 transition-transform" />
                  <span className="text-2xl font-black uppercase tracking-[0.2em]">Transmit Payload</span>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
    </PageTransition>
  );
}

function TrendingUpIcon({ className }: { className: string }) {
  return (
    <svg 
      className={className}
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}
