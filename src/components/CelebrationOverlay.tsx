import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RecognitionResult } from '../types';
import { Sparkles, Trophy, X } from 'lucide-react';

interface CelebrationOverlayProps {
  result: RecognitionResult | null;
  onClose: () => void;
  pointsAwarded?: number;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  result,
  onClose,
  pointsAwarded = 100
}) => {
  useEffect(() => {
    if (!result) return;

    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#06b6d4', '#ec4899', '#eab308', '#22c55e']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#06b6d4', '#ec4899', '#eab308', '#22c55e']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [result, onClose]);

  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="relative max-w-lg w-full bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border-2 border-amber-400/60 rounded-3xl p-6 shadow-2xl neon-glow-gold text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-20 h-20 mx-auto -mt-14 mb-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-xl shadow-amber-500/40 transform -rotate-3 hover:rotate-0 transition">
          <Trophy className="w-10 h-10 text-slate-950" />
        </div>

        <span className="inline-block px-3 py-1 mb-2 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider">
          AI Successfully Recognized!
        </span>

        <h2 className="text-3xl font-extrabold text-white mb-2">
          {result.label}
        </h2>

        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-2 rounded-2xl">
            <span className="text-[11px] text-slate-400 block font-medium">Confidence</span>
            <span className="text-xl font-mono font-black text-emerald-400">
              {Math.round(result.confidence * 100)}%
            </span>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-2 rounded-2xl">
            <span className="text-[11px] text-slate-400 block font-medium">Score Earned</span>
            <span className="text-xl font-mono font-black text-amber-400 flex items-center gap-1">
              +{pointsAwarded} <Sparkles className="w-4 h-4" />
            </span>
          </div>
        </div>

        {result.funFact && (
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300 mb-5 text-left">
            <span className="font-bold text-amber-300 mr-1">AI Note:</span>
            {result.funFact}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold rounded-xl shadow-lg shadow-cyan-500/30 transition transform active:scale-95 text-sm"
        >
          Continue Next Round
        </button>
      </div>
    </div>
  );
};
