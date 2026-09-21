import React from 'react';
import { EMOJI_CHALLENGES } from '../data/prompts';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

interface EmojiChallengePanelProps {
  currentChallengeIndex: number;
  similarityScore: number;
  onNextChallenge: () => void;
}

export const EmojiChallengePanel: React.FC<EmojiChallengePanelProps> = ({
  currentChallengeIndex,
  similarityScore,
  onNextChallenge
}) => {
  const challenge = EMOJI_CHALLENGES[currentChallengeIndex % EMOJI_CHALLENGES.length];
  const isHighMatch = similarityScore >= 75;

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-lg z-30">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Challenge Target */}
        <div className="flex items-center gap-3">
          <div className="text-4xl p-2.5 rounded-2xl bg-slate-800 border border-amber-500/40 shadow-lg shadow-amber-500/10">
            {challenge.emoji}
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Emoji Challenge
            </span>
            <h2 className="text-xl font-black text-white">
              Draw a {challenge.name} in the air!
            </h2>
            <p className="text-xs text-slate-400">
              Match the shape closely to boost your similarity percentage!
            </p>
          </div>
        </div>

        {/* Real-time Match % Gauge */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[11px] text-slate-400 font-medium">Similarity Match:</span>
            <span className={`text-2xl font-mono font-black ${
              isHighMatch ? 'text-emerald-400' : similarityScore > 40 ? 'text-amber-300' : 'text-slate-400'
            }`}>
              {similarityScore}%
            </span>
          </div>

          <div className="w-40 bg-slate-800 rounded-full h-4 overflow-hidden border border-slate-700 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isHighMatch 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/40' 
                  : 'bg-gradient-to-r from-amber-500 to-yellow-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, similarityScore))}%` }}
            />
          </div>

          {isHighMatch && (
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 animate-pulse">
              <CheckCircle2 className="w-4 h-4" /> Great Match!
            </div>
          )}
        </div>

        {/* Next Challenge Button */}
        <button
          onClick={onNextChallenge}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition border border-slate-700 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Next Emoji
        </button>
      </div>
    </div>
  );
};
