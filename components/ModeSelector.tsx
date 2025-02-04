'use client';

import { useState } from 'react';

export type Mode = 'note' | 'chord' | 'scale';

interface ModeSelectorProps {
  onModeChange: (mode: Mode) => void;
  currentMode: Mode;
}

export default function ModeSelector({ onModeChange, currentMode }: ModeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onModeChange('note')}
        className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all ${
          currentMode === 'note'
            ? 'bg-indigo-600 text-white shadow-lg scale-105'
            : 'bg-white/50 text-indigo-600 hover:bg-white/80'
        }`}
      >
        Note Mode
      </button>
      <button
        onClick={() => onModeChange('chord')}
        className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all ${
          currentMode === 'chord'
            ? 'bg-indigo-600 text-white shadow-lg scale-105'
            : 'bg-white/50 text-indigo-600 hover:bg-white/80'
        }`}
      >
        Chord Mode
      </button>
      <button
        onClick={() => onModeChange('scale')}
        className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all ${
          currentMode === 'scale'
            ? 'bg-indigo-600 text-white shadow-lg scale-105'
            : 'bg-white/50 text-indigo-600 hover:bg-white/80'
        }`}
      >
        Scale Mode
      </button>
    </div>
  );
} 