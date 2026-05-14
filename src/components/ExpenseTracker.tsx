'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { 
  Plus, 
  Trash2, 
  Wallet, 
  ArrowUpRight, 
  ChevronRight,
  TrendingUp,
  Filter,
  RefreshCw,
  Zap,
  Sparkles,
  Check
} from 'lucide-react';
import { haptic } from '@/lib/design-system';
import PageTransition from '@/components/PageTransition';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

const CATEGORIES = [
  { name: 'Materials', icon: '🧵', color: '#3B82F6' },
  { name: 'Transport', icon: '🚚', color: '#F59E0B' },
  { name: 'Tools', icon: '🛠️', color: '#EC4899' },
  { name: 'Personal', icon: '👤', color: '#10B981' },
  { name: 'Other', icon: '📦', color: '#6B7280' }
];

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    
    if (data) setExpenses(data);
    setLoading(false);
  };

  const addExpense = async () => {
    if (!amount) return;
    setAdding(true);
    haptic.medium();

    const { error } = await supabase.from('expenses').insert({
      amount: parseFloat(amount),
      category,
      description,
      date: new Date().toISOString().split('T')[0]
    });

    if (!error) {
      setAmount('');
      setDescription('');
      loadExpenses();
      haptic.heavy();
    }
    setAdding(false);
  };

  const deleteExpense = async (id: string) => {
    haptic.heavy();
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (!error) loadExpenses();
  };

  const totalMonthly = expenses.reduce((sum, ex) => sum + ex.amount, 0);

  return (
    <PageTransition>
      <div className="min-h-screen safe-top px-8 pb-48 app-container">
        <div className="bg-aurora" />
        
        <header className="mb-14 pt-10 flex items-end justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 mb-3 text-pink-500 font-black uppercase tracking-[0.4em] text-[10px]">
              <Zap className="w-4 h-4 fill-pink-500" /> Capital Flow
            </div>
            <h1 className="text-5xl font-black tracking-tighter leading-none mb-1">Expenses</h1>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] ml-1">Asset Monitoring</p>
          </motion.div>
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-right"
          >
            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Gross Burn</p>
            <h2 className="text-5xl font-black text-pink-400 tabular-nums leading-none">₹{totalMonthly.toFixed(0)}</h2>
          </motion.div>
        </header>

        {/* Quick Add Bento */}
        <div className="card-heavy p-10 mb-12 border-t-[12px] border-pink-500 shadow-pink-500/10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-6 bg-pink-500 rounded-full" />
            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">New Expenditure Entry</h3>
          </div>
          
          <div className="space-y-6">
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl font-black text-pink-500/50">₹</span>
              <input 
                type="number" 
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white/5 border-2 border-white/5 rounded-[32px] py-8 pl-14 pr-8 text-5xl font-black tracking-tighter focus:border-pink-500/50 focus:bg-white/[0.08] transition-all outline-none tabular-nums"
              />
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => { setCategory(cat.name); haptic.light(); }}
                  className={`flex-shrink-0 px-6 py-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                    category === cat.name 
                    ? 'bg-pink-500/20 border-pink-500 text-pink-500' 
                    : 'bg-white/5 border-transparent text-white/30'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-[11px] font-black uppercase tracking-widest">{cat.name}</span>
                </button>
              ))}
            </div>

            <input 
              type="text" 
              placeholder="Description (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border-2 border-white/5 rounded-[24px] p-6 text-lg font-bold focus:border-pink-500/30 outline-none"
            />

            <button 
              onClick={addExpense}
              disabled={adding || !amount}
              className="btn-apple-primary w-full h-24 !rounded-[32px] !from-pink-500 !to-pink-700 shadow-pink-500/30 flex items-center justify-center gap-4 disabled:opacity-20 transition-all"
            >
              {adding ? <RefreshCw className="w-8 h-8 animate-spin" /> : <Plus className="w-8 h-8" strokeWidth={3} />}
              <span className="text-lg font-black uppercase tracking-widest">Register Expense</span>
            </button>
          </div>
        </div>

        {/* History Ledger */}
        <section>
          <div className="flex items-center justify-between mb-10 px-2">
            <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.5em]">Transaction History</h3>
            <div className="h-[2px] flex-1 mx-6 bg-white/5 rounded-full" />
            <Filter className="w-5 h-5 text-white/20" />
          </div>

          <div className="space-y-5">
            <AnimatePresence mode="popLayout">
              {expenses.map((ex, idx) => {
                const cat = CATEGORIES.find(c => c.name === ex.category) || CATEGORIES[4];
                return (
                  <motion.div
                    key={ex.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="card-heavy p-7 flex items-center gap-6 group relative overflow-hidden border-l-[10px]"
                    style={{ borderLeftColor: cat.color }}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-4xl shadow-inner group-hover:scale-105 transition-transform duration-500 border border-white/10">
                      {cat.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-pink-500/60 bg-pink-500/5 px-2 py-0.5 rounded border border-pink-500/10">
                          {ex.category}
                        </span>
                        <span className="text-[9px] font-black text-white/20 uppercase">
                          {new Date(ex.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <h4 className="font-black text-2xl truncate tracking-tight">{ex.description || 'General Expense'}</h4>
                    </div>

                    <div className="text-right z-10">
                      <div className="text-3xl font-black text-pink-400 tabular-nums tracking-tighter">₹{ex.amount.toFixed(0)}</div>
                    </div>

                    <button 
                      onClick={() => deleteExpense(ex.id)}
                      className="absolute -top-1 -right-1 w-12 h-12 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90 shadow-lg"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {!loading && expenses.length === 0 && (
              <div className="text-center py-32 card-heavy border-dashed border-2 border-white/5 bg-transparent">
                <Wallet className="w-20 h-20 text-white/10 mx-auto mb-6" />
                <p className="text-white/10 font-black uppercase tracking-[0.4em] text-[10px]">No Capital Outflow Recorded</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
