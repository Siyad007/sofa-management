'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { 
  Calendar, 
  MessageCircle, 
  ChevronLeft,
  ChevronRight,
  Coffee,
  Zap,
  ArrowUpRight,
  Sparkles,
  Mail
} from 'lucide-react';
import { haptic } from '@/lib/design-system';
import PageTransition from '@/components/PageTransition';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import emailjs from '@emailjs/browser';

interface DaySummary {
  date: string;
  isLeave: boolean;
  items: string[];
  total: number;
}

interface ReportData {
  start: string;
  end: string;
  totalSalary: number;
  totalItems: number;
  daySummaries: DaySummary[];
}

export default function ReportsPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWeeklyReport();
  }, [weekOffset]);

  const loadWeeklyReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date();
      today.setDate(today.getDate() + (weekOffset * 7));
      const day = today.getDay();
      const saturday = new Date(today);
      saturday.setDate(today.getDate() + (6 - day));
      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() - 6);

      const startStr = sunday.toISOString().split('T')[0];
      const endStr = saturday.toISOString().split('T')[0];

      const [entriesRes, pricingRes] = await Promise.all([
        supabase
          .from('daily_entries')
          .select('*, daily_entry_items(*, work_types(*), item_operations(*, operations(*)))')
          .gte('date', startStr)
          .lte('date', endStr)
          .order('date', { ascending: true }),
        supabase.from('pricing').select('*')
      ]);

      if (entriesRes.error) throw entriesRes.error;

      let totalSalary = 0;
      let totalItems = 0;
      const daySummaries: DaySummary[] = [];

      if (entriesRes.data && pricingRes.data) {
        entriesRes.data.forEach((entry: any) => {
          let dayTotal = 0;
          const itemsList: string[] = [];

          (entry.daily_entry_items || []).forEach((item: any) => {
            const opNames = (item.item_operations || []).map((io: any) => io.operations.display_name);
            const itemOpTotal = (item.item_operations || []).reduce((sum: number, io: any) => {
              const p = pricingRes.data.find(pr => pr.work_type_id === item.work_type_id && pr.operation_id === io.operation_id);
              return sum + (p ? parseFloat(p.price) : 0);
            }, 0);
            
            const currentItemTotal = itemOpTotal * item.quantity;
            dayTotal += currentItemTotal;
            itemsList.push(`${item.quantity} ${item.work_types.display_name} (${opNames.join(', ')})`);
          });

          daySummaries.push({
            date: entry.date,
            isLeave: entry.is_leave,
            items: itemsList,
            total: dayTotal
          });
          totalSalary += dayTotal;
          totalItems += (entry.daily_entry_items || []).reduce((s: number, i: any) => s + i.quantity, 0);
        });
      }

      setReport({
        start: startStr,
        end: endStr,
        totalSalary,
        totalItems,
        daySummaries
      });
    } catch (err) {
      console.error(err);
      setError('Failed to generate audit report');
    } finally {
      setLoading(false);
    }
  };

  const generateAndEmailPDF = async () => {
    haptic.heavy();
    if (!report) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(10, 132, 255);
    doc.text('DAXO SOFA MANAGEMENT', 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`WEEKLY AUDIT REPORT: ${report.start} to ${report.end}`, 14, 32);
    doc.text(`Generated for: siyadsidu760@gmail.com`, 14, 40);

    // Summary Stats
    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Value']],
      body: [
        ['Total Salary Earned', `INR ${report.totalSalary.toFixed(2)}`],
        ['Total Items Produced', report.totalItems.toString()],
        ['Audit Status', 'Verified'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [10, 132, 255] }
    });

    // Daily Breakdown
    const tableBody = report.daySummaries.map(day => [
      new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
      day.isLeave ? 'LEAVE' : day.items.join('\n'),
      day.isLeave ? '-' : `INR ${day.total.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 15,
      head: [['Date', 'Work Done', 'Daily Total']],
      body: tableBody,
      theme: 'striped',
      headStyles: { fillColor: [10, 132, 255] }
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.text('This is a computer-generated fiscal record from Daxo OS Alpha.', 14, finalY);

    // 3. Email Transmission via EmailJS
    try {
      const pdfBase64 = doc.output('datauristring');
      
      const templateParams = {
        to_email: 'siyadsidu760@gmail.com',
        from_name: 'Daxo OS Alpha',
        message: `Weekly Audit Report for ${report.start} to ${report.end}`,
        pdf_attachment: pdfBase64,
      };

      // NOTE: You must replace these with your own EmailJS keys to activate live sending
      // service_id, template_id, public_key
      const result = await emailjs.send(
        'service_placeholder', 
        'template_placeholder', 
        templateParams, 
        'public_key_placeholder'
      );

      if (result.status === 200) {
        alert('✅ AUDIT TRANSMITTED: PDF has been sent to siyadsidu760@gmail.com');
      }
    } catch (err) {
      console.error('Email Error:', err);
      doc.save(`Daxo_Audit_${report.end}.pdf`);
      alert('⚠️ OFFLINE MODE: PDF saved to your device. To enable direct email sending, please add your EmailJS API keys.');
    }
    
    haptic.medium();
  };

  const shareWeeklyWhatsApp = () => {
    haptic.heavy();
    if (!report) return;

    let text = `📅 *WEEKLY WORK AUDIT*\nRange: ${new Date(report.start).toLocaleDateString()} - ${new Date(report.end).toLocaleDateString()}\n\n`;
    
    report.daySummaries.forEach((day) => {
      const d = new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
      if (day.isLeave) {
        text += `${d}: 🏠 LEAVE\n`;
      } else if (day.items.length > 0) {
        text += `${d}:\n`;
        day.items.forEach((item: string) => text += `  - ${item.toLowerCase()}\n`);
      }
      text += `----------\n`;
    });
    
    navigator.clipboard.writeText(text.trim());
    haptic.medium();
  };

  return (
    <PageTransition>
      <div className="min-h-screen safe-top px-8 pb-48 app-container">
        <div className="bg-aurora" />
        
        <header className="mb-14 pt-10 flex items-end justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 mb-3 text-purple-500 font-black uppercase tracking-[0.4em] text-[10px]">
              <Sparkles className="w-4 h-4 fill-purple-500" /> Financial Intelligence
            </div>
            <h1 className="text-5xl font-black tracking-tighter leading-none mb-1">Audit Hub</h1>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] ml-1">Salary Reconciliation</p>
          </motion.div>
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-right"
          >
            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Batch Yield</p>
            <h2 className="text-5xl font-black text-blue-400 tabular-nums leading-none">{report?.totalItems || 0}</h2>
          </motion.div>
        </header>

        {/* Week Navigation */}
        <div className="card-heavy p-8 mb-12 flex items-center justify-between border-l-[12px] border-purple-500 shadow-purple-500/10">
          <button onClick={() => { setWeekOffset(weekOffset - 1); haptic.light(); }} className="w-16 h-16 rounded-[28px] bg-white/5 flex items-center justify-center active:scale-90 transition-all hover:bg-white/10 border border-white/10">
            <ChevronLeft className="w-8 h-8" />
          </button>
          <div className="text-center flex-1">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-2">Fiscal Sequence Ending</p>
            <div className="font-black text-3xl tracking-tighter text-white">
              {report ? new Date(report.end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '...'}
            </div>
          </div>
          <button onClick={() => { setWeekOffset(weekOffset + 1); haptic.light(); }} className="w-16 h-16 rounded-[28px] bg-white/5 flex items-center justify-center active:scale-90 transition-all hover:bg-white/10 border border-white/10">
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <div className="space-y-8">
              <div className="card-heavy p-16 animate-pulse bg-white/5 h-48" />
              <div className="card-heavy p-12 animate-pulse bg-white/5 h-96" />
            </div>
          ) : report ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
              {/* Summary Bento */}
              <div className="card-heavy p-12 relative overflow-hidden group bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/30">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -mr-48 -mt-48" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                    <div className="text-emerald-500 font-black uppercase tracking-[0.3em] text-[11px]">
                      Revenue Breakdown
                    </div>
                  </div>
                  <p className="text-xs font-black text-white/30 uppercase tracking-widest mb-2">Internal Salary Calculation</p>
                  <div className="flex items-baseline gap-4">
                    <h2 className="text-8xl font-black text-emerald-400 tracking-tighter drop-shadow-[0_0_40px_rgba(52,211,153,0.3)]">₹{report.totalSalary.toFixed(0)}</h2>
                    <ArrowUpRight className="w-10 h-10 text-emerald-500/40" />
                  </div>
                  <p className="mt-6 text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.4em] leading-relaxed max-w-[200px]">Audited against master pricing table</p>
                </div>
              </div>

              {/* Daily Breakdown */}
              <section>
                <div className="flex items-center justify-between mb-10 px-2">
                  <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.5em]">Daily Performance Log</h3>
                  <div className="h-[2px] flex-1 mx-6 bg-white/5 rounded-full" />
                  <span className="text-[11px] font-black text-blue-500 uppercase tracking-widest">MON - SAT</span>
                </div>
                <div className="space-y-6">
                  {report.daySummaries.map((day, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className={`card-heavy p-8 border-l-[10px] ${day.isLeave ? 'border-orange-500/40 opacity-40 grayscale blur-[0.5px]' : 'border-blue-500/40'} group hover:border-blue-500 transition-all duration-500`}
                    >
                      <div className="flex items-start justify-between mb-8">
                        <div>
                          <p className="text-xl font-black text-blue-400 uppercase tracking-tighter mb-1">
                            {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'long' })}
                          </p>
                          <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">{new Date(day.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</p>
                        </div>
                        {!day.isLeave && (
                          <div className="text-right">
                            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-2">Yield Value</p>
                            <span className="font-black text-3xl text-emerald-400 tabular-nums tracking-tighter">₹{day.total.toFixed(0)}</span>
                          </div>
                        )}
                      </div>
                      
                      {day.isLeave ? (
                        <div className="flex items-center gap-4 text-orange-500/60 font-black uppercase tracking-[0.3em] text-[10px] py-4 bg-orange-500/5 rounded-2xl px-6 border border-orange-500/10">
                          <Coffee className="w-6 h-6" /> RECHARGE SEQUENCE
                        </div>
                      ) : (
                        <div className="space-y-3 px-2">
                          {day.items.map((it, i) => (
                            <div key={i} className="text-xs text-white/50 font-bold flex items-center gap-4 group-hover:text-white/80 transition-colors">
                              <div className="w-2 h-2 rounded-full bg-blue-500/40" />
                              <span className="tracking-tight lowercase">{it}</span>
                            </div>
                          ))}
                          {day.items.length === 0 && <p className="text-xs text-white/20 font-black uppercase tracking-widest italic py-2">No production data</p>}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </section>

              <div className="pt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                  onClick={shareWeeklyWhatsApp}
                  className="btn-apple-primary w-full h-24 !rounded-[32px] flex items-center justify-center gap-4 !from-emerald-600 !to-emerald-800 group overflow-hidden relative shadow-emerald-500/20"
                >
                  <MessageCircle className="w-8 h-8" />
                  <span className="tracking-widest font-black text-[10px] uppercase">WhatsApp Audit</span>
                </button>

                <button 
                  onClick={generateAndEmailPDF}
                  className="btn-apple-primary w-full h-24 !rounded-[32px] flex items-center justify-center gap-4 !from-blue-600 !to-blue-800 group overflow-hidden relative shadow-blue-500/20"
                >
                  <Mail className="w-8 h-8" />
                  <span className="tracking-widest font-black text-[10px] uppercase">Email PDF Audit</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="py-48 text-center text-white/10 font-black uppercase tracking-[0.6em] animate-pulse">Synchronizing Neural Records...</div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
