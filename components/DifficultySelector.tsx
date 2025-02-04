'use client';

import { useState } from 'react';
import { DIFFICULTY_LEVELS } from '@/utils/noteGenerator';

interface DifficultySelectorProps {
  onDifficultyChange: (difficulty: number) => void;
}

export default function DifficultySelector({ onDifficultyChange }: DifficultySelectorProps) {
  const [difficulty, setDifficulty] = useState(1);

  const handleChange = (newDifficulty: number) => {
    setDifficulty(newDifficulty);
    onDifficultyChange(newDifficulty);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          Difficulty Level: {difficulty}
        </h2>
        <div className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 rounded-full text-indigo-700 dark:text-indigo-200 text-sm font-medium">
          {DIFFICULTY_LEVELS[difficulty - 1].description}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center">
        <input
          type="range"
          min="1"
          max="10"
          value={difficulty}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer dark:bg-indigo-900"
        />
        
        <div className="flex justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
          <span>Beginner</span>
          <span>Intermediate</span>
          <span>Advanced</span>
        </div>
      </div>
    </div>
  );
} 