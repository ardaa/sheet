'use client';

interface CheatModeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function CheatModeToggle({ enabled, onToggle }: CheatModeToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onToggle(!enabled)}
        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2
          ${enabled 
            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          }`}
      >
        <span>{enabled ? '🔍' : '👀'}</span>
        {enabled ? 'Hide Notes' : 'Show Notes'}
      </button>
    </div>
  );
} 