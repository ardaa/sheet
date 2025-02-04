'use client';

export type Clef = 'treble' | 'bass' | 'both';

interface ClefSelectorProps {
  onClefChange: (clef: Clef) => void;
  currentClef: Clef;
}

export default function ClefSelector({ onClefChange, currentClef }: ClefSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-indigo-600/90 dark:text-indigo-400/90 mb-3">Clef</p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onClefChange('treble')}
          className={`flex-1 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
            currentClef === 'treble'
              ? 'bg-indigo-600 text-white shadow-lg scale-105'
              : 'bg-white/50 text-indigo-600 hover:bg-white/80'
          }`}
        >
          Treble 𝄞
        </button>
        <button
          onClick={() => onClefChange('bass')}
          className={`flex-1 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
            currentClef === 'bass'
              ? 'bg-indigo-600 text-white shadow-lg scale-105'
              : 'bg-white/50 text-indigo-600 hover:bg-white/80'
          }`}
        >
          Bass 𝄢
        </button>
        <button
          onClick={() => onClefChange('both')}
          className={`flex-1 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
            currentClef === 'both'
              ? 'bg-indigo-600 text-white shadow-lg scale-105'
              : 'bg-white/50 text-indigo-600 hover:bg-white/80'
          }`}
        >
          Both 𝄞𝄢
        </button>
      </div>
    </div>
  );
} 