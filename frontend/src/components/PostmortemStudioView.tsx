import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Share2, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  Brain, 
  Download, 
  Printer, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { PostmortemReportResponse } from '../types';
import { generatePostmortemReport } from '../services/api';
import { playClickFeedback, playResolutionChime } from '../services/audio';

interface PostmortemStudioViewProps {
  incidentId?: string;
  service?: string;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const PostmortemStudioView: React.FC<PostmortemStudioViewProps> = ({
  incidentId = 'INC-001',
  service = 'Payment API',
  onShowToast
}) => {
  const [report, setReport] = useState<PostmortemReportResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedType, setCopiedType] = useState<'md' | 'slack' | null>(null);

  useEffect(() => {
    loadPostmortem();
  }, [incidentId, service]);

  const loadPostmortem = async () => {
    try {
      setLoading(true);
      const res = await generatePostmortemReport(incidentId, service);
      setReport(res);
    } catch (err: any) {
      console.error('Failed to generate postmortem:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyMarkdown = () => {
    if (!report) return;
    navigator.clipboard.writeText(report.markdown_content);
    setCopiedType('md');
    playResolutionChime();
    onShowToast('Full Postmortem Markdown copied to clipboard!', 'success');
    setTimeout(() => setCopiedType(null), 2500);
  };

  const copySlack = () => {
    if (!report) return;
    const slackText = `*🚨 POSTMORTEM RESOLUTION: ${report.incident_id} (${report.service})*\n` +
      `• *Duration:* ${report.duration_min} minutes (MTTR Saved: ${report.mttr_saved_min} mins)\n` +
      `• *Financial Impact Averted:* $${report.cost_saved_usd.toLocaleString()} USD\n` +
      `• *Root Cause:* ${report.root_cause_analysis}\n` +
      `• *Hindsight Memory Bank:* Knowledge permanently retained in \`ops-memory\`.\n` +
      `• *Confluence Doc:* <https://internal.opsmemory.io/postmortems/${report.incident_id}|View Complete RCA>`;
    navigator.clipboard.writeText(slackText);
    setCopiedType('slack');
    playResolutionChime();
    onShowToast('Slack Block Kit update copied to clipboard!', 'success');
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handlePrint = () => {
    playClickFeedback();
    window.print();
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Studio Header */}
      <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 shadow-2xl relative overflow-hidden glow-emerald">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Enterprise Postmortem &amp; Five-Whys RCA Studio
                </h2>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md whitespace-nowrap bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                  Verified In Hindsight
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Automated root-cause analysis synthesis, executive financial impact accounting, and long-term knowledge retention.
              </p>
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={copyMarkdown}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white text-xs font-semibold transition-all"
            >
              {copiedType === 'md' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedType === 'md' ? 'Markdown Copied!' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={copySlack}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-semibold transition-all"
            >
              {copiedType === 'slack' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-purple-400" />}
              <span>{copiedType === 'slack' ? 'Slack Copied!' : 'Copy for Slack'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF Report</span>
            </button>
          </div>
        </div>

        {/* Impact Metric Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 text-xs font-mono">
          <div className="bg-[#080C14] p-3 rounded-xl border border-white/[0.06]">
            <span className="text-[10px] text-slate-400 uppercase block">Total Triage Time</span>
            <span className="text-base font-bold text-emerald-400">4.5 minutes</span>
            <span className="text-[9px] text-slate-500 block">vs 48m standard MTTR</span>
          </div>

          <div className="bg-[#080C14] p-3 rounded-xl border border-white/[0.06]">
            <span className="text-[10px] text-slate-400 uppercase block">Downtime Averted</span>
            <span className="text-base font-bold text-cyan-400">34.5 Hours</span>
            <span className="text-[9px] text-slate-500 block">99.99% SLO Protected</span>
          </div>

          <div className="bg-[#080C14] p-3 rounded-xl border border-white/[0.06]">
            <span className="text-[10px] text-slate-400 uppercase block">Financial Loss Saved</span>
            <span className="text-base font-bold text-yellow-300">$207,000 USD</span>
            <span className="text-[9px] text-slate-500 block">E-commerce checkouts</span>
          </div>

          <div className="bg-[#080C14] p-3 rounded-xl border border-white/[0.06]">
            <span className="text-[10px] text-slate-400 uppercase block">Hindsight Precedent</span>
            <span className="text-base font-bold text-purple-300">INC-001 (96.4%)</span>
            <span className="text-[9px] text-slate-500 block">Bank: ops-memory</span>
          </div>
        </div>
      </div>

      {/* Main Postmortem Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Five-Whys & Executive Assessment */}
        <div className="lg:col-span-2 space-y-4">
          {/* Executive Summary Card */}
          <div className="glass-panel rounded-2xl p-5 border border-white/[0.08] shadow-2xl space-y-2">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Executive Incident Assessment</span>
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {report?.executive_summary}
            </p>
          </div>

          {/* Interactive Five-Whys Tree */}
          <div className="glass-panel rounded-2xl p-5 border border-white/[0.08] shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.07]">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-400" />
                <span>Five-Whys Root Cause Tree</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                Grounded in Telemetry &amp; Memory
              </span>
            </div>

            <div className="space-y-2.5 pl-2 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/[0.08]">
              {report?.five_whys.map((why) => (
                <div key={why.level} className="relative flex items-start gap-3 pl-6 text-xs">
                  <span className="absolute left-1.5 mt-0.5 w-5 h-5 rounded-md bg-purple-600/30 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold flex items-center justify-center">
                    {why.level}
                  </span>
                  <div className="bg-[#0B0F19] rounded-xl p-3 border border-white/[0.06] flex-1">
                    <span className="text-[11px] font-bold text-slate-300 block mb-1">
                      {why.question}
                    </span>
                    <p className="text-xs text-emerald-300 font-medium leading-relaxed">
                      ➔ {why.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Timeline & Knowledge Delta */}
        <div className="space-y-4">
          {/* Hindsight Knowledge Delta Card */}
          <div className="glass-panel rounded-2xl p-5 border border-purple-500/30 shadow-2xl space-y-3 glow-purple">
            <div className="flex items-center gap-2 pb-2.5 border-b border-white/[0.07]">
              <Brain className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                Hindsight Knowledge Delta
              </h3>
            </div>
            <p className="text-xs text-purple-200 leading-relaxed font-semibold">
              {report?.hindsight_knowledge_delta}
            </p>
            <div className="bg-[#070B14] p-3 rounded-xl border border-white/[0.05] text-[11px] font-mono space-y-1 text-slate-300">
              <span className="text-slate-500 block uppercase text-[10px]">Knowledge Bank Evolution:</span>
              <div>• Retained Memory ID: <strong className="text-white">mem-inc-001-rev2</strong></div>
              <div>• Total Indexed Postmortems: <strong className="text-emerald-400">11 Active</strong></div>
              <div>• System Autonomy Level: <strong className="text-cyan-400">Autonomous Tier-4</strong></div>
            </div>
          </div>

          {/* Incident Event Timeline Summary */}
          <div className="glass-panel rounded-2xl p-5 border border-white/[0.08] shadow-2xl space-y-3">
            <div className="flex items-center gap-2 pb-2.5 border-b border-white/[0.07]">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                Millisecond Event Timeline
              </h3>
            </div>
            <div className="space-y-2 text-[11px] font-mono text-slate-300">
              {report?.timeline_summary.map((t, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-[#080C14] border border-white/[0.04]">
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
