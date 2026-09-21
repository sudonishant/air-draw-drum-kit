import React from 'react';
import { PromptItem, DifficultyLevel } from '../types';
import { Timer, HelpCircle, Trophy } from 'lucide-react';

interface GameRacePanelProps {
  currentPrompt: PromptItem;
  timeLeft: number;
  totalTime: number;
  score: number;
  difficulty: DifficultyLevel;
  onDifficultyChange: (diff: DifficultyLevel) => void;
  onNextPrompt: () => void;
  onSkip: () => void;
}

export const GameRacePanel: React.FC<GameRacePanelProps> = ({
  currentPrompt,
  timeLeft,
  totalTime,
  score,
  difficulty,
  onDifficultyChange,
  onSkip
}) => {
  const timeProgress = (timeLeft / totalTime) * 100;
  const isUrgent = timeLeft <= 5;

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-lg z-30">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Challenge Target */}
        <div className="flex items-center gap-3">
          <div className="text-3xl p-2 rounded-2xl bg-slate-800 border border-slate-700/80 shadow-inner">
            {currentPrompt.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Draw this in the Air!
              </span>
              <span className="text-xs font-semibold text-slate-400 capitalize">
                {currentPrompt.category}
              </span>
            </div>
            <h2 className="text-xl font-black text-white">
              {currentPrompt.english}
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentPrompt.hint}</span>
            </p>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-400 mb-1">
              <Timer className={`w-3.5 h-3.5 ${isUrgent ? 'text-rose-500 animate-bounce' : 'text-cyan-400'}`} />
              <span>Time Left:</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-1000 ${
                    isUrgent ? 'bg-rose-500' : 'bg-gradient-to-r from-cyan-400 to-blue-500'
                  }`}
                  style={{ width: `${timeProgress}%` }}
                />
              </div>
              <span className={`font-mono text-lg font-black ${isUrgent ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
                {timeLeft}s
              </span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 px-4 py-2 rounded-2xl flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Total Score</span>
              <span className="text-lg font-mono font-black text-amber-300">{score}</span>
            </div>
          </div>
        </div>

        {/* Difficulty Controls & Skip */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs font-bold">
            {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => onDifficultyChange(lvl)}
                className={`px-3 py-1 rounded-lg transition capitalize ${
                  difficulty === lvl
                    ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button
            onClick={onSkip}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            Skip Word
          </button>
        </div>
      </div>
    </div>
  );
};
