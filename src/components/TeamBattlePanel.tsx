import React from 'react';
import { PromptItem } from '../types';
import { Swords, ArrowRightLeft } from 'lucide-react';

interface TeamBattlePanelProps {
  currentPrompt: PromptItem;
  teamAScore: number;
  teamBScore: number;
  activeTeam: 'Team A' | 'Team B';
  currentRound: number;
  maxRounds: number;
  onSwitchTeam: () => void;
  onResetBattle: () => void;
}

export const TeamBattlePanel: React.FC<TeamBattlePanelProps> = ({
  currentPrompt,
  teamAScore,
  teamBScore,
  activeTeam,
  currentRound,
  maxRounds,
  onSwitchTeam,
  onResetBattle
}) => {
  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-lg z-30">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Team Alpha */}
        <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all ${
          activeTeam === 'Team A' 
            ? 'bg-cyan-950/60 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-105' 
            : 'bg-slate-800/60 border-slate-700 opacity-70'
        }`}>
          <div className="w-10 h-10 rounded-xl bg-cyan-500 text-slate-950 font-black text-sm flex items-center justify-center">
            A
          </div>
          <div>
            <span className="text-[10px] text-cyan-300 font-bold block">Team Alpha</span>
            <span className="text-xl font-mono font-black text-white">{teamAScore} pts</span>
          </div>
          {activeTeam === 'Team A' && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-extrabold animate-pulse">
              Drawing Now!
            </span>
          )}
        </div>

        {/* Center Target */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Swords className="w-4 h-4" /> Round {currentRound} of {maxRounds}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentPrompt.emoji}</span>
            <span className="text-lg font-extrabold text-white">
              {currentPrompt.english}
            </span>
          </div>
        </div>

        {/* Team Beta */}
        <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all ${
          activeTeam === 'Team B' 
            ? 'bg-purple-950/60 border-purple-400 shadow-lg shadow-purple-500/20 scale-105' 
            : 'bg-slate-800/60 border-slate-700 opacity-70'
        }`}>
          {activeTeam === 'Team B' && (
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-extrabold animate-pulse">
              Drawing Now!
            </span>
          )}
          <div className="text-right">
            <span className="text-[10px] text-purple-300 font-bold block">Team Beta</span>
            <span className="text-xl font-mono font-black text-white">{teamBScore} pts</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500 text-white font-black text-sm flex items-center justify-center">
            B
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSwitchTeam}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" /> Switch Turn
          </button>
          <button
            onClick={onResetBattle}
            className="px-3 py-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded-xl text-xs font-semibold border border-rose-500/30 transition"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
