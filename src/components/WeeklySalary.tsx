'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DollarSign, Check, X } from 'lucide-react';

interface WeeklySalary {
  id: string;
  week_start: string;
  week_end: string;
  expected_amount: number;
  received_amount: number | null;
  received_date: string | null;
  payment_mode: string | null;
  notes: string | null;
}

export default function WeeklySalary() {
  const [weeks, setWeeks] = useState<WeeklySalary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWeeks();
  }, []);

  const loadWeeks = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('weekly_salary')
      .select('*')
      .order('week_start', { ascending: false })
      .limit(10);

    setWeeks(data || []);
    setLoading(false);
  };

  const markAsPaid = async (id: string, amount: number) => {
    const receivedAmount = prompt('Enter received amount:', amount.toString());
    if (!receivedAmount) return;

    await supabase
      .from('weekly_salary')
      .update({
        received_amount: parseFloat(receivedAmount),
        received_date: new Date().toISOString().split('T')[0],
        payment_mode: 'cash'
      })
      .eq('id', id);

    loadWeeks();
  };

  return (
    <div className="min-h-screen pb-24 px-5 pt-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">💰 Weekly Salary</h1>
        <p className="text-slate-400">Track your weekly payments</p>
      </div>

      <div className="space-y-3">
        {loading && (
          <div className="text-center py-12 text-slate-400">
            Loading weeks...
          </div>
        )}
        {!loading && weeks.length === 0 && (
          <div className="glass-card text-center py-12">
            <div className="text-6xl mb-4">💼</div>
            <p className="text-slate-400">No salary records yet</p>
          </div>
        )}
        {weeks.map((week, index) => (
          <div
            key={week.id}
            className="glass-card"
            style={{ animation: `countUp 0.3s ease-out ${index * 0.05}s both` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm text-slate-400">
                  {new Date(week.week_start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  {' - '}
                  {new Date(week.week_end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
                <div className="text-2xl font-bold text-success mt-1">
                  ₹{week.expected_amount?.toFixed(0) || 0}
                </div>
              </div>
              {week.received_amount ? (
                <div className="flex items-center gap-2 bg-success/20 text-success px-3 py-1 rounded-full text-sm font-semibold">
                  <Check className="w-4 h-4" />
                  Paid
                </div>
              ) : (
                <button
                  onClick={() => markAsPaid(week.id, week.expected_amount)}
                  className="bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-semibold"
                >
                  Mark Paid
                </button>
              )}
            </div>

            {week.received_amount && (
              <div className="text-sm text-slate-400">
                Received ₹{week.received_amount.toFixed(0)} on{' '}
                {new Date(week.received_date!).toLocaleDateString('en-IN')}
              </div>
            )}

            {week.notes && (
              <div className="mt-2 text-sm text-slate-300 italic">
                "{week.notes}"
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
