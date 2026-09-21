import React, { useState } from 'react';
import { PromptItem } from '../types';
import { Eye, EyeOff, Sparkles, RefreshCw } from 'lucide-react';

interface MysteryWordPanelProps {
  currentPrompt: PromptItem;
  onNextWord: () => void;
  onWordGuessed: () => void;
}

export const MysteryWordPanel: React.FC<MysteryWordPanelProps> = ({
  currentPrompt,
  onNextWord,
  onWordGuessed
}) => {
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-lg z-30">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Mystery Instruction */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Pictionary Mode
            </span>
            <span className="text-xs text-slate-400">
              Only the active drawer should peek at this word!
            </span>
          </div>
          <p className="text-sm font-bold text-white mt-0.5">
            Draw clues in the air — let your team shout the guess!
          </p>
        </div>

        {/* Secret Word Box */}
        <div className="flex items-center gap-3 bg-slate-800/90 border border-purple-500/40 px-4 py-2 rounded-2xl shadow-inner">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-medium">Secret Word:</span>
            <span className="text-lg font-black text-purple-300">
              {isRevealed ? `${currentPrompt.english} ${currentPrompt.emoji}` : '••••••••••••'}
            </span>
          </div>

          <button
            onClick={() => setIsRevealed(!isRevealed)}
            title={isRevealed ? 'Hide Secret Word' : 'Peek Secret Word'}
            className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl transition"
          >
            {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onWordGuessed}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Team Guessed It! (+150 pts)</span>
          </button>

          <button
            onClick={() => {
              setIsRevealed(false);
              onNextWord();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Word</span>
          </button>
        </div>
      </div>
    </div>
  );
};
