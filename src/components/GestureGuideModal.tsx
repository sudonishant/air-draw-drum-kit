import React from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';

interface GestureGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GestureGuideModal: React.FC<GestureGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const gestures = [
    {
      icon: '☝️',
      title: 'Index Finger (Point Up)',
      action: 'Air Pen (Draw)',
      desc: 'Point your index finger and draw freely in the air. Toggle modes: Always Draw, Smart Gesture, or Pinch to Draw.',
      color: 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300'
    },
    {
      icon: '✌️',
      title: 'Peace Sign (2 Fingers)',
      action: 'Cycle Colors',
      desc: 'Raise index and middle fingers together to cycle through brilliant neon colors in mid-air!',
      color: 'border-yellow-500/40 bg-yellow-950/30 text-yellow-300'
    },
    {
      icon: '🤟',
      title: 'Rock Sign / 3 Fingers',
      action: 'Cycle Brush Styles',
      desc: 'Show Rock sign (Index + Pinky) or 3 fingers to cycle: Laser Glow, Fire Flame, Magic Stars, Rainbow, Calligraphy, Plasma, Smoke!',
      color: 'border-amber-500/40 bg-amber-950/30 text-amber-300'
    },
    {
      icon: '👍',
      title: 'Thumbs Up',
      action: 'Next Prompt / Round',
      desc: 'Give a thumbs up to camera to advance to the next prompt, emoji target, or mystery word hands-free!',
      color: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
    },
    {
      icon: '👉 / 👈',
      title: 'Air Swipe',
      action: 'Next Game Mode',
      desc: 'Fast horizontal hand swipe across the camera switches game modes on the fly!',
      color: 'border-violet-500/40 bg-violet-950/30 text-violet-300'
    },
    {
      icon: '🖐️',
      title: 'Open Palm (5 Fingers)',
      action: 'Magic Eraser',
      desc: 'Show an open palm to the camera for 1 second to instantly wipe the canvas clean.',
      color: 'border-pink-500/40 bg-pink-950/30 text-pink-300'
    },
    {
      icon: '✊',
      title: 'Closed Fist',
      action: 'Trigger AI Check',
      desc: 'Curl all fingers into a fist when finished — AI will immediately analyze your drawing.',
      color: 'border-purple-500/40 bg-purple-950/30 text-purple-300'
    },
    {
      icon: '🤏',
      title: 'Pinch (Thumb & Index)',
      action: 'HandFrame FX Filter Switch',
      desc: 'Pinch your thumb and index finger together to switch filters on the fly: Thermal Heat, Invert, B&W Noir, Depth Hologram, 8-Bit Mosaic, Sepia, and AR effects!',
      color: 'border-orange-500/40 bg-orange-950/30 text-orange-300'
    },
    {
      icon: '👐',
      title: 'Two-Hand Framing',
      action: "Director's Viewfinder Lens",
      desc: "Frame a rectangular region in the air using both hands' thumbs and index fingers to apply real-time filters inside the lens box!",
      color: 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300'
    },
    {
      icon: '👆',
      title: 'In-Air Virtual Menu',
      action: 'Hover / Pinch Select',
      desc: 'Hover index finger over on-screen floating buttons (Clear, AI Check, Filter, Lens Box, Style, Color, Undo, Mode) for 0.5s or pinch to click touchless!',
      color: 'border-blue-500/40 bg-blue-950/30 text-blue-300'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-300 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> PM Shri School Student Orientation
          </span>
          <h2 className="text-2xl font-black text-white">
            How to Draw in the Air (Hand Gestures)
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            No need to touch mouse or keyboard! Use these simple hand gestures:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
          {gestures.map((g, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border ${g.color} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{g.icon}</span>
                  <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-900/60 border border-white/10">
                    {g.action}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{g.title}</h3>
                <p className="text-xs text-slate-300/90 leading-relaxed">{g.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Pro Tip: Keep your hand well-lit against the camera background for smooth tracking!</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs whitespace-nowrap transition"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
