import React from 'react';
import { GameMode } from '../types';
import { 
  Sparkles, 
  Timer, 
  Smile, 
  BookOpen, 
  Swords, 
  HelpCircle, 
  PenTool, 
  Trophy, 
  Volume2, 
  VolumeX, 
  Music, 
  Maximize2, 
  Award, 
  Image as ImageIcon,
  Camera,
  Crosshair,
  Disc
} from 'lucide-react';
import { AR_FILTERS } from '../services/arFilterRenderer';
import { ArFilterType } from '../types';

interface TopNavBarProps {
  currentMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  arFilter?: ArFilterType;
  onArFilterChange?: (filter: ArFilterType) => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  soundMuted: boolean;
  onToggleSound: () => void;
  bgmPlaying: boolean;
  onToggleBgm: () => void;
  onToggleFullscreen: () => void;
  onOpenCertificate: () => void;
  onOpenGallery: () => void;
  onOpenHelp: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  currentMode,
  onModeChange,
  voiceEnabled,
  onToggleVoice,
  soundMuted,
  onToggleSound,
  bgmPlaying,
  onToggleBgm,
  onToggleFullscreen,
  onOpenCertificate,
  onOpenGallery,
  onOpenHelp
}) => {
  const modes: Array<{ id: GameMode; label: string; icon: React.ReactNode }> = [
    { id: 'free_draw', label: 'Air Draw', icon: <PenTool className="w-3.5 h-3.5" /> },
    { id: 'virtual_drums', label: 'Drums', icon: <Disc className="w-3.5 h-3.5" /> },
    { id: 'finger_gun', label: 'Finger Gun', icon: <Crosshair className="w-3.5 h-3.5" /> },
    { id: 'ai_race', label: 'AI Race', icon: <Timer className="w-3.5 h-3.5" /> },
    { id: 'emoji_challenge', label: 'Emoji', icon: <Smile className="w-3.5 h-3.5" /> },
    { id: 'learn_mode', label: 'Learn', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'team_battle', label: 'Battle', icon: <Swords className="w-3.5 h-3.5" /> },
    { id: 'mystery_word', label: 'Mystery', icon: <HelpCircle className="w-3.5 h-3.5" /> },
    { id: 'air_signature', label: 'Signature', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'leaderboard', label: 'Scores', icon: <Trophy className="w-3.5 h-3.5" /> }
  ];

  return (
    <header className="w-full bg-[#080b11]/90 backdrop-blur-2xl border-b border-white/[0.08] px-4 py-2 flex items-center justify-between gap-3 z-40 sticky top-0">
      {/* Brand: Google Gemini Air */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-center gap-1 p-1.5 bg-white/[0.04] rounded-xl border border-white/10 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-[#4285F4] shadow-sm shadow-blue-500/50" />
          <span className="w-2 h-2 rounded-full bg-[#EA4335] shadow-sm shadow-red-500/50" />
          <span className="w-2 h-2 rounded-full bg-[#FBBC05] shadow-sm shadow-yellow-500/50" />
          <span className="w-2 h-2 rounded-full bg-[#34A853] shadow-sm shadow-green-500/50" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-extrabold tracking-tight text-white font-sans flex items-center gap-1.5">
            <span className="bg-gradient-to-r from-[#4285F4] via-[#8ab4f8] to-[#c58af9] bg-clip-text text-transparent">
              Gemini Air
            </span>
          </span>
          <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/10">
            Vision Studio
          </span>
        </div>
      </div>

      {/* Mode Navigation Tabs - Minimal Google Pill Bar */}
      <nav className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-2xl border border-white/[0.08] overflow-x-auto max-w-full scrollbar-none">
        {modes.map((m) => {
          const isActive = currentMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onModeChange(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Minimal Right Control Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Gallery */}
        <button
          onClick={onOpenGallery}
          title="Artwork History Gallery"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        {/* Certificate */}
        <button
          onClick={onOpenCertificate}
          title="Create Certificate"
          className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 rounded-xl transition"
        >
          <Award className="w-4 h-4" />
        </button>

        {/* Voice Feedback */}
        <button
          onClick={onToggleVoice}
          title={voiceEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
          className={`p-1.5 rounded-xl transition ${
            voiceEnabled ? 'text-blue-400 bg-blue-500/10' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* BGM */}
        <button
          onClick={onToggleBgm}
          title={bgmPlaying ? 'Pause BGM' : 'Play Arcade BGM'}
          className={`p-1.5 rounded-xl transition ${
            bgmPlaying ? 'text-purple-400 bg-purple-500/10 animate-pulse' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Music className="w-4 h-4" />
        </button>

        {/* Fullscreen */}
        <button
          onClick={onToggleFullscreen}
          title="Fullscreen"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Gesture Guide */}
        <button
          onClick={onOpenHelp}
          title="Air Hand Gesture Guide"
          className="flex items-center gap-1 px-2.5 py-1 bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/10 rounded-xl text-xs font-medium transition ml-1"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Guide</span>
        </button>
      </div>
    </header>
  );
};

