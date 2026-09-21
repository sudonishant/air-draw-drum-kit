import React, { useState } from 'react';
import { LeaderboardEntry } from '../types';
import { SCHOOL_LIST } from '../data/prompts';
import { Trophy, School, ArrowLeft } from 'lucide-react';

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  onBackToDraw: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  entries,
  onBackToDraw
}) => {
  const [filterSchool, setFilterSchool] = useState<string>('all');

  const filteredEntries = filterSchool === 'all' 
    ? entries 
    : entries.filter(e => e.school === filterSchool);

  return (
    <div className="w-full min-h-[85vh] bg-slate-950 p-6 flex flex-col items-center">
      {/* Top Banner */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <button
          onClick={onBackToDraw}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Canvas
        </button>

        <div className="text-center">
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1 mb-1">
            <Trophy className="w-3.5 h-3.5" /> PM Shri School Live Leaderboard
          </span>
          <h1 className="text-3xl font-black text-white">
            Tech Orientation — Live Rankings
          </h1>
        </div>

        {/* School Filter */}
        <select
          value={filterSchool}
          onChange={(e) => setFilterSchool(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-700 text-xs font-bold text-white rounded-xl focus:outline-none focus:border-cyan-400"
        >
          <option value="all">All Schools</option>
          {SCHOOL_LIST.map(sch => (
            <option key={sch} value={sch}>{sch}</option>
          ))}
        </select>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 items-end">
        {/* 2nd Place */}
        {filteredEntries[1] && (
          <div className="bg-slate-900/90 border-2 border-slate-400/50 rounded-3xl p-5 text-center flex flex-col items-center h-[260px] justify-between shadow-xl order-2 md:order-1">
            <div className="w-14 h-14 rounded-2xl bg-slate-700 border border-slate-400 flex items-center justify-center text-slate-300 text-2xl font-black shadow-lg">
              🥈
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400">Rank #2</span>
              <h3 className="text-lg font-black text-white truncate max-w-[200px]">
                {filteredEntries[1].name}
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                {filteredEntries[1].school}
              </p>
            </div>
            <div className="w-full py-2 bg-slate-800 rounded-xl font-mono text-lg font-black text-slate-200">
              {filteredEntries[1].score} pts
            </div>
          </div>
        )}

        {/* 1st Place (Gold Champion) */}
        {filteredEntries[0] && (
          <div className="bg-gradient-to-b from-amber-950/40 to-slate-900 border-2 border-amber-400 rounded-3xl p-6 text-center flex flex-col items-center h-[300px] justify-between shadow-2xl neon-glow-gold order-1 md:order-2 scale-105">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 text-3xl font-black shadow-lg shadow-amber-500/30 animate-bounce">
              👑
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase">
                Champion Air Artist
              </span>
              <h3 className="text-2xl font-black text-white truncate max-w-[240px] mt-1">
                {filteredEntries[0].name}
              </h3>
              <p className="text-xs text-amber-200/80 truncate max-w-[240px]">
                {filteredEntries[0].school}
              </p>
            </div>
            <div className="w-full py-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl font-mono text-2xl font-black text-amber-300">
              {filteredEntries[0].score} pts
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {filteredEntries[2] && (
          <div className="bg-slate-900/90 border-2 border-amber-700/50 rounded-3xl p-5 text-center flex flex-col items-center h-[240px] justify-between shadow-xl order-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-950/60 border border-amber-700 flex items-center justify-center text-amber-600 text-2xl font-black shadow-lg">
              🥉
            </div>
            <div>
              <span className="text-xs font-bold text-amber-600">Rank #3</span>
              <h3 className="text-lg font-black text-white truncate max-w-[200px]">
                {filteredEntries[2].name}
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                {filteredEntries[2].school}
              </p>
            </div>
            <div className="w-full py-2 bg-slate-800 rounded-xl font-mono text-lg font-black text-amber-500">
              {filteredEntries[2].score} pts
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Table */}
      <div className="w-full max-w-4xl bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-850 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-5">Rank</th>
              <th className="py-3 px-5">Student Name</th>
              <th className="py-3 px-5">School</th>
              <th className="py-3 px-5">Mode</th>
              <th className="py-3 px-5 text-right">Total Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredEntries.map((entry, idx) => (
              <tr key={entry.id} className="hover:bg-slate-800/50 transition">
                <td className="py-3.5 px-5 font-mono font-bold text-slate-300">
                  {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                </td>
                <td className="py-3.5 px-5 font-bold text-white text-sm">
                  {entry.name}
                </td>
                <td className="py-3.5 px-5 text-slate-400 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{entry.school}</span>
                </td>
                <td className="py-3.5 px-5 text-slate-400">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 capitalize">
                    {entry.mode}
                  </span>
                </td>
                <td className="py-3.5 px-5 text-right font-mono font-black text-amber-300 text-sm">
                  {entry.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
