import React from 'react';
import { GalleryItem } from '../types';
import { X, Image as ImageIcon, Download, Trash2, Sparkles } from 'lucide-react';

interface GalleryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: GalleryItem[];
  onClearGallery: () => void;
}

export const GalleryDrawer: React.FC<GalleryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onClearGallery
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Air Art Gallery
              </h2>
              <p className="text-[11px] text-slate-400">
                Saved Student Artwork ({items.length})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Sparkles className="w-10 h-10 mb-3 opacity-30 text-cyan-400" />
              <p className="text-sm font-semibold text-slate-400">No artwork saved yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Draw shapes in the air and click Recognize with AI to automatically save creations here!
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-3 flex flex-col gap-2.5 hover:border-cyan-500/50 transition group"
              >
                <div className="relative aspect-video rounded-xl bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center">
                  <img
                    src={item.dataUrl}
                    alt={item.label}
                    className="w-full h-full object-contain filter contrast-125"
                  />
                  <a
                    href={item.dataUrl}
                    download={`AirArt_${item.label}_${item.id}.png`}
                    title="Download Artwork"
                    className="absolute top-2 right-2 p-2 bg-slate-900/80 hover:bg-cyan-500 hover:text-black text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-md"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-white">{item.label}</h4>
                    <span className="text-[10px] text-slate-400 capitalize">{item.mode.replace('_', ' ')}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded-md">
                    {item.date}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={onClearGallery}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear History
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
