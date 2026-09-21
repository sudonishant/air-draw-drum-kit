import React from 'react';
import { BrushStyle, ArFilterType, GameMode } from '../types';
import { 
  Palette, 
  RotateCcw, 
  Trash2, 
  BrainCircuit, 
  Sparkles,
  Zap,
  Sliders,
  Users
} from 'lucide-react';

interface ToolbarProps {
  currentMode?: GameMode;
  currentColor: string;
  onColorChange: (color: string) => void;
  isRainbow: boolean;
  onToggleRainbow: () => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  brushStyle: BrushStyle;
  onBrushStyleChange: (style: BrushStyle) => void;
  arFilter: ArFilterType;
  onArFilterChange: (filter: ArFilterType) => void;
  useDepthSizing: boolean;
  onToggleDepthSizing: () => void;
  twoHandMode: boolean;
  onToggleTwoHandMode: () => void;
  onUndo: () => void;
  onClear: () => void;
  onRecognize: () => void;
  canUndo: boolean;
  isRecognizing: boolean;
  strokesCount: number;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentMode,
  currentColor,
  onColorChange,
  isRainbow,
  onToggleRainbow,
  brushSize,
  onBrushSizeChange,
  brushStyle,
  onBrushStyleChange,
  useDepthSizing,
  onToggleDepthSizing,
  twoHandMode,
  onToggleTwoHandMode,
  onUndo,
  onClear,
  onRecognize,
  canUndo,
  isRecognizing,
  strokesCount
}) => {
  const neonColors = [
    { name: 'Google Blue', hex: '#4285F4' },
    { name: 'Google Red', hex: '#EA4335' },
    { name: 'Google Yellow', hex: '#FBBC05' },
    { name: 'Google Green', hex: '#34A853' },
    { name: 'Cyber Cyan', hex: '#06b6d4' },
    { name: 'Laser White', hex: '#ffffff' }
  ];

  const brushStyles: Array<{ id: BrushStyle; label: string; icon: string }> = [
    { id: 'laser_glow', label: 'Laser Glow', icon: '⚡' },
    { id: 'fire_flame', label: 'Fire', icon: '🔥' },
    { id: 'magic_stars', label: 'Stars', icon: '✨' },
    { id: 'rainbow_trail', label: 'Rainbow', icon: '🌈' },
    { id: 'calligraphy', label: 'Ink', icon: '✒️' }
  ];

  // If in Virtual Drums Mode: Show ultra-sleek music status pill
  if (currentMode === 'virtual_drums') {
    return (
      <div className="mx-auto mb-3 px-5 py-2 rounded-full bg-[#0c1017]/85 backdrop-blur-xl border border-amber-500/30 shadow-2xl flex items-center gap-4 text-xs z-30">
        <div className="flex items-center gap-2">
          <span className="text-base animate-bounce">🥁</span>
          <span className="font-bold text-white tracking-wide">Virtual Drum Kit</span>
        </div>
        <div className="h-4 w-px bg-white/10" />
        <span className="text-amber-300 font-mono text-[11px] bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
          ⚡ Strike Pads in Mid-Air
        </span>
        <div className="h-4 w-px bg-white/10 hidden sm:block" />
        <span className="text-slate-400 hidden sm:inline text-[11px]">
          7 Pads: Crash • Hi-Hat • Snare • Kick • Toms • Ride
        </span>
      </div>
    );
  }

  // If in Finger Gun Mode: Show ultra-sleek gun status pill
  if (currentMode === 'finger_gun') {
    return (
      <div className="mx-auto mb-3 px-5 py-2 rounded-full bg-[#0c1017]/85 backdrop-blur-xl border border-rose-500/30 shadow-2xl flex items-center gap-4 text-xs z-30">
        <div className="flex items-center gap-2">
          <span className="text-base">👉💥</span>
          <span className="font-bold text-white tracking-wide">Finger Gun</span>
        </div>
        <div className="h-4 w-px bg-white/10" />
        <span className="text-rose-300 font-mono text-[11px] bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
          Point Hand & Drop Thumb to Shoot
        </span>
        <div className="h-4 w-px bg-white/10 hidden sm:block" />
        <span className="text-slate-400 hidden sm:inline text-[11px]">
          Laser Blast + Flying Target Orbs
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto mb-3 max-w-4xl bg-[#0c1017]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-3.5 py-1.5 flex flex-wrap items-center justify-center gap-2.5 shadow-2xl z-30">
      {/* 1. Minimal Color Palette */}
      <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-xl border border-white/5">
        {neonColors.map(color => (
          <button
            key={color.hex}
            onClick={() => onColorChange(color.hex)}
            title={color.name}
            className={`w-5 h-5 rounded-full transition-all transform duration-150 ${
              currentColor === color.hex && !isRainbow
                ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#0c1017]'
                : 'hover:scale-110 opacity-75 hover:opacity-100'
            }`}
            style={{ backgroundColor: color.hex, boxShadow: `0 0 8px ${color.hex}66` }}
          />
        ))}

        {/* Rainbow Cycle Toggle */}
        <button
          onClick={onToggleRainbow}
          title="Rainbow Trail"
          className={`px-1.5 py-0.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
            isRainbow
              ? 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500 text-white shadow-sm ring-1 ring-white/50'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Palette className="w-3 h-3" />
        </button>
      </div>

      {/* 2. Compact Brush Styles */}
      <div className="flex items-center gap-1 bg-white/5 px-1.5 py-1 rounded-xl border border-white/5">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 ml-1 mr-0.5" />
        {brushStyles.map(bs => {
          const isActive = brushStyle === bs.id;
          return (
            <button
              key={bs.id}
              onClick={() => onBrushStyleChange(bs.id)}
              title={bs.label}
              className={`px-2 py-0.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{bs.icon}</span>
              <span className="hidden md:inline text-[11px]">{bs.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Brush Size & Toggles */}
      <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-xl border border-white/5">
        <Sliders className="w-3 h-3 text-slate-400" />
        <input
          type="range"
          min="4"
          max="32"
          value={brushSize}
          onChange={(e) => onBrushSizeChange(Number(e.target.value))}
          className="w-14 accent-blue-500 cursor-pointer h-1.5"
          title={`Brush Size: ${brushSize}px`}
        />
        <span className="text-[11px] font-mono text-blue-400 font-bold">{brushSize}px</span>

        <button
          onClick={onToggleDepthSizing}
          title="Stroke thickens when hand is closer"
          className={`px-1.5 py-0.5 rounded-lg text-[11px] font-semibold transition border flex items-center gap-0.5 ${
            useDepthSizing
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          <Zap className="w-3 h-3 text-blue-400" />
          <span className="hidden sm:inline">Depth</span>
        </button>

        <button
          onClick={onToggleTwoHandMode}
          title="Draw with both hands simultaneously"
          className={`px-1.5 py-0.5 rounded-lg text-[11px] font-semibold transition border flex items-center gap-0.5 ${
            twoHandMode
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          <Users className="w-3 h-3 text-purple-400" />
          <span className="hidden sm:inline">2-Hand</span>
        </button>
      </div>

      {/* 4. Action Buttons: Undo, Clear, AI */}
      <div className="flex items-center gap-1.5">
        {strokesCount > 0 && (
          <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-300 font-mono text-[11px] border border-blue-500/20">
            {strokesCount}st
          </span>
        )}

        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo Last Stroke"
          className="p-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white rounded-xl transition border border-white/10"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onClear}
          title="Clear Canvas (Or hold Open Palm)"
          className="flex items-center gap-1 px-2.5 py-1 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/25 rounded-xl text-xs font-semibold transition"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear</span>
        </button>

        <button
          onClick={onRecognize}
          disabled={isRecognizing}
          className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-90 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition transform hover:scale-102 active:scale-98"
        >
          <BrainCircuit className={`w-3.5 h-3.5 ${isRecognizing ? 'animate-spin' : ''}`} />
          <span>{isRecognizing ? 'Analyzing...' : 'AI Recognize'}</span>
        </button>
      </div>
    </div>
  );
};
