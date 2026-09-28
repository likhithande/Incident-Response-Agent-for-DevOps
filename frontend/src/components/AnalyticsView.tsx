import React, { useState, useEffect } from 'react';
import { 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Brain, 
  BarChart3, 
  Award, 
  Sliders 
} from 'lucide-react';
import { AnalyticsResponse } from '../types';
import { fetchAnalytics } from '../services/api';

export const AnalyticsView: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [outagesPerMonth, setOutagesPerMonth] = useState<number>(8);
  const [hourlyOutageCost, setHourlyOutageCost] = useState<number>(7500);

  useEffect(() => {
    fetchAnalytics().then(setAnalytics).catch(console.error);
  }, []);

  // ROI Calculator formula
  // Traditional downtime = outages * 48 mins / 60
  // OpsMemory downtime = outages * 14 mins / 60
  // Hours saved = (outages * 34 mins) / 60
  const hoursSavedPerYear = ((outagesPerMonth * 12) * (48 - 14)) / 60;
  const annualDollarsSaved = Math.round(hoursSavedPerYear * hourlyOutageCost);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Executive Header Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-sm bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                Institutional SRE Intelligence Hub
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Postmortem MTTR & Reliability Analytics
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Quantitative impact measurement tracking how Hindsight persistent memory eliminates duplicate triage cycles and accelerates incident mitigation.
            </p>
          </div>

          <div className="glass-card px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              Hindsight Memory Impact
            </span>
            <span className="text-2xl font-black font-mono text-emerald-400">
              -71% MTTR
            </span>
          </div>
        </div>
      </div>

      {/* 4 Core Quantitative Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="glass-panel p-4 rounded-xl border border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Avg Triage (MTTR)</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-black font-mono text-white">
              {analytics?.mttr_with_memory_min || 14}m
            </span>
            <span className="text-xs font-mono text-slate-500 line-through">
              {analytics?.mttr_without_memory_min || 48}m
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 ml-auto">
              -34 min/inc
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block pt-1">
            Accelerated by recalled historical postmortems
          </span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Downtime Prevented</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-black font-mono text-emerald-400">
              {analytics?.downtime_saved_hours || 34.5} hrs
            </span>
            <span className="text-xs font-mono font-bold text-emerald-300 ml-auto">
              Saved
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block pt-1">
            Cumulative production availability preserved
          </span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Financial Impact</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-black font-mono text-amber-300">
              ${(analytics?.cost_saved_usd || 207000).toLocaleString()}
            </span>
            <span className="text-xs font-mono font-bold text-amber-400 ml-auto">
              ROI
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block pt-1">
            Calculated at enterprise SRE benchmark rates
          </span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Memory Retention</span>
            <Brain className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-black font-mono text-purple-300">
              {analytics?.memory_attribution_rate_pct || 94.2}%
            </span>
            <span className="text-xs font-mono font-bold text-purple-400 ml-auto">
              Indexed
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block pt-1">
            {analytics?.recurring_preventions_count || 8} repeat failures mitigated
          </span>
        </div>
      </div>

      {/* Recurring Failure Prevention Scoreboard & Interactive ROI Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recurring Failure Scoreboard */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-white/[0.08] space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Repeat Incident Mitigation Scoreboard</h3>
            </div>
            <span className="text-[10px] font-mono text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/20">
              Hindsight Retain Verified
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-white/[0.06] text-[10px] font-mono uppercase">
                  <th className="pb-2 font-semibold">Incident</th>
                  <th className="pb-2 font-semibold">Service</th>
                  <th className="pb-2 font-semibold">Historical Match</th>
                  <th className="pb-2 font-semibold">Triage Saved</th>
                  <th className="pb-2 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-2.5 font-mono font-bold text-white">INC-001</td>
                  <td className="py-2.5 text-slate-300">Payment API</td>
                  <td className="py-2.5 font-mono text-purple-300">HikariCP Pool (50 → 150)</td>
                  <td className="py-2.5 font-mono text-emerald-400">-38 mins</td>
                  <td className="py-2.5 text-right">
                    <span className="px-2.5 py-0.5 rounded-md whitespace-nowrap text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      RESOLVED
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-2.5 font-mono font-bold text-white">INC-003</td>
                  <td className="py-2.5 text-slate-300">Order Service</td>
                  <td className="py-2.5 font-mono text-purple-300">Kafka max.poll.interval</td>
                  <td className="py-2.5 font-mono text-emerald-400">-42 mins</td>
                  <td className="py-2.5 text-right">
                    <span className="px-2.5 py-0.5 rounded-md whitespace-nowrap text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      RESOLVED
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-2.5 font-mono font-bold text-white">INC-005</td>
                  <td className="py-2.5 text-slate-300">Auth Service</td>
                  <td className="py-2.5 font-mono text-purple-300">Redis volatile-lru policy</td>
                  <td className="py-2.5 font-mono text-emerald-400">-29 mins</td>
                  <td className="py-2.5 text-right">
                    <span className="px-2.5 py-0.5 rounded-md whitespace-nowrap text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      RESOLVED
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-2.5 font-mono font-bold text-white">INC-007</td>
                  <td className="py-2.5 text-slate-300">Auth Service</td>
                  <td className="py-2.5 font-mono text-purple-300">JVM -XX:MaxRAMPercentage</td>
                  <td className="py-2.5 font-mono text-emerald-400">-35 mins</td>
                  <td className="py-2.5 text-right">
                    <span className="px-2.5 py-0.5 rounded-md whitespace-nowrap text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      RESOLVED
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-2.5 font-mono font-bold text-white">INC-008</td>
                  <td className="py-2.5 text-slate-300">Payment API</td>
                  <td className="py-2.5 font-mono text-purple-300">Resilience4j Circuit Breaker</td>
                  <td className="py-2.5 font-mono text-emerald-400">-31 mins</td>
                  <td className="py-2.5 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      RESOLVED
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Interactive Enterprise ROI Simulator */}
        <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
            <Sliders className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Enterprise ROI Calculator</h3>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Monthly Incidents:</span>
                <span className="font-mono font-bold text-purple-300">{outagesPerMonth} incidents</span>
              </div>
              <input
                type="range"
                min="2"
                max="30"
                value={outagesPerMonth}
                onChange={(e) => setOutagesPerMonth(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Avg Outage Cost / Hour:</span>
                <span className="font-mono font-bold text-amber-300">${hourlyOutageCost.toLocaleString()}/hr</span>
              </div>
              <input
                type="range"
                min="2000"
                max="25000"
                step="500"
                value={hourlyOutageCost}
                onChange={(e) => setHourlyOutageCost(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Calculated Impact Card */}
            <div className="glass-card p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-1.5 mt-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                Estimated Annual Savings with OpsMemory
              </span>
              <div className="text-2xl font-black font-mono text-emerald-300">
                ${annualDollarsSaved.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-300 block">
                Prevents <span className="font-bold text-white">{Math.round(hoursSavedPerYear)} hours</span> of engineering triage and downtime each year.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
