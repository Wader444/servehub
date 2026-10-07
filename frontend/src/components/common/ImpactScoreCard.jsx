import React from 'react';
import { Award, Zap, Flame, Star, Sparkles } from 'lucide-react';

export default function ImpactScoreCard({ score = 0, completedActivities = 0, totalHours = 0 }) {
  // Score tier calculation
  let tier = 'Bronze Contributor';
  let tierColor = 'text-amber-700 bg-amber-50 border-amber-200';
  let badgeIcon = Star;

  if (score >= 100) {
    tier = 'Champion Civic Leader';
    tierColor = 'text-purple-700 bg-purple-50 border-purple-200';
    badgeIcon = Flame;
  } else if (score >= 50) {
    tier = 'Gold Impact Partner';
    tierColor = 'text-amber-600 bg-amber-50 border-amber-300';
    badgeIcon = Sparkles;
  } else if (score >= 25) {
    tier = 'Silver Volunteer';
    tierColor = 'text-cyan-700 bg-cyan-50 border-cyan-200';
    badgeIcon = Zap;
  }

  const BadgeIconComponent = badgeIcon;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 via-brand-800 to-slate-900 text-white p-6 shadow-xl border border-brand-700/50">
      {/* Background glow decoration */}
      <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-accent-500/20 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -left-8 -top-8 w-48 h-48 bg-brand-400/20 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-wider text-accent-300 mb-3">
            <BadgeIconComponent className="w-3.5 h-3.5 text-accent-400" />
            <span>{tier}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-1">
            Community Impact Score
          </h3>
          <p className="text-slate-300 text-xs leading-relaxed max-w-md">
            Calculated via verified formula: <span className="font-mono text-cyan-300">(Activities × 10) + (Hours × 2)</span>
          </p>
        </div>

        {/* Score Display Display */}
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/15">
          <div className="w-12 h-12 rounded-xl bg-accent-600 flex items-center justify-center text-white shadow-lg shadow-accent-600/30">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {score}
            </div>
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Total Points
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown mini-stats */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/15">
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="text-xs text-slate-400">Completed Causes</div>
          <div className="text-lg font-bold text-white mt-0.5">{completedActivities}</div>
        </div>

        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="text-xs text-slate-400">Verified Hours</div>
          <div className="text-lg font-bold text-white mt-0.5">{totalHours} hrs</div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="text-xs text-slate-400">Points from Hours</div>
          <div className="text-lg font-bold text-accent-400 mt-0.5">+{totalHours * 2} pts</div>
        </div>
      </div>
    </div>
  );
}
