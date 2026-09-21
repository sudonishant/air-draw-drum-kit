import React, { useState } from 'react';
import { GHOST_TEMPLATES, GhostTemplate } from '../data/templates';
import { speechService } from '../services/speechService';
import { Volume2, Eye, EyeOff } from 'lucide-react';

interface LearnModePanelProps {
  selectedTemplate: GhostTemplate | null;
  onSelectTemplate: (tpl: GhostTemplate | null) => void;
  showGhostGuide: boolean;
  onToggleGhostGuide: () => void;
}

export const LearnModePanel: React.FC<LearnModePanelProps> = ({
  selectedTemplate,
  onSelectTemplate,
  showGhostGuide,
  onToggleGhostGuide
}) => {
  const [activeTab, setActiveTab] = useState<'alphabet' | 'number' | 'shape'>('alphabet');

  const filteredTemplates = GHOST_TEMPLATES.filter(t => t.category === activeTab);

  const handleSpeak = (text: string) => {
    speechService.speak(text, true);
  };

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-lg z-30">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-2xl border border-slate-700">
          <button
            onClick={() => setActiveTab('alphabet')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'alphabet' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            Alphabet (A, B, C)
          </button>
          <button
            onClick={() => setActiveTab('number')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'number' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            Numbers (1, 2, 3)
          </button>
          <button
            onClick={() => setActiveTab('shape')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'shape' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            Basic Shapes
          </button>
        </div>

        {/* Template Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {filteredTemplates.map((tpl) => {
            const isSelected = selectedTemplate?.id === tpl.id;
            return (
              <button
                key={tpl.id}
                onClick={() => {
                  onSelectTemplate(tpl);
                  handleSpeak(tpl.label);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-lg scale-105'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-750 border border-slate-700'
                }`}
              >
                <span>{tpl.label}</span>
              </button>
            );
          })}
        </div>

        {/* Ghost Guide Toggle & Voice Pronounce Button */}
        <div className="flex items-center gap-2">
          {selectedTemplate && (
            <button
              onClick={() => handleSpeak(selectedTemplate.label)}
              title="Hear Pronunciation"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl text-xs transition border border-slate-700"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onToggleGhostGuide}
            title={showGhostGuide ? 'Hide Ghost Guide' : 'Show Trace Guide in Air'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              showGhostGuide
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {showGhostGuide ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Ghost Guide</span>
          </button>
        </div>
      </div>
    </div>
  );
};
