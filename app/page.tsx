'use client';

import MusicDisplay from "@/components/MusicDisplay";
import PianoKeyboard from "@/components/PianoKeyboard";
import DifficultySelector from "@/components/DifficultySelector";
import ModeSelector, { type Mode } from "@/components/ModeSelector";
import { useState, useRef } from "react";
import type { Note } from "@/utils/noteGenerator";
import CheatModeToggle from "@/components/CheatModeToggle";
import ClefSelector, { type Clef } from "@/components/ClefSelector";

export default function Home() {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [currentNote, setCurrentNote] = useState<Note[] | null>(null);
  const [difficulty, setDifficulty] = useState(1);
  const [mode, setMode] = useState<Mode>('note');
  const musicDisplayRef = useRef<{ generateNewNote: () => void } | null>(null);
  const [cheatMode, setCheatMode] = useState(false);
  const [playedSequence, setPlayedSequence] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [clef, setClef] = useState<Clef>('treble');

  const handleCorrectGuess = () => {
    if (mode === 'note') {
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }
    }
    setTimeout(() => {
      musicDisplayRef.current?.generateNewNote();
    }, 500);
  };

  const handleIncorrectGuess = () => {
    if (mode === 'note') {
      setCurrentStreak(0);
    }
  };

  const handleDifficultyChange = (newDifficulty: number) => {
    setDifficulty(newDifficulty);
    if (mode === 'note') {
      setCurrentStreak(0);
    }
    musicDisplayRef.current?.generateNewNote();
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setCurrentStreak(0);
    if (newMode === 'chord') {
      setClef('treble');
    }
    musicDisplayRef.current?.generateNewNote();
  };

  const handleClefChange = (newClef: Clef) => {
    setClef(newClef);
    setCurrentStreak(0);
    musicDisplayRef.current?.generateNewNote();
  };

  return (
    <div className="min-h-screen h-screen bg-gradient-to-br from-indigo-50/80 via-white to-fuchsia-50/80 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950">
      {/* Subtle animated gradient background */}
      <div className="absolute inset-0 bg-grid-indigo-500/[0.02] -z-10" />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-fuchsia-500/5 animate-gradient-shift -z-10" />
      
      <main className="h-full container mx-auto px-6 py-8">
        <div className="h-full flex gap-8">
          {/* Left side - Music Display and Piano */}
          <div className="flex-[3] flex flex-col gap-8">
            <div className={`bg-white/90 backdrop-blur-xl dark:bg-gray-900/90 rounded-3xl shadow-2xl shadow-indigo-500/5 dark:shadow-indigo-500/10 border border-indigo-100/50 dark:border-indigo-500/10 p-12 flex items-center justify-center transition-all duration-500 ${
              mode === 'chord' ? 'h-[300px]' : 'flex-1'
            }`}>
              <div className="w-full">
                <div className="flex justify-end mb-6">
                  <CheatModeToggle 
                    enabled={cheatMode}
                    onToggle={setCheatMode}
                  />
                </div>
                <MusicDisplay 
                  ref={musicDisplayRef}
                  difficulty={difficulty}
                  mode={mode}
                  onNoteGenerated={setCurrentNote}
                  cheatMode={cheatMode}
                  playedSequence={playedSequence}
                  feedback={feedback}
                  clef={clef}
                />
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-xl dark:bg-gray-900/90 rounded-3xl shadow-2xl shadow-indigo-500/5 dark:shadow-indigo-500/10 border border-indigo-100/50 dark:border-indigo-500/10 p-10 h-[400px] transition-all duration-500">
              <PianoKeyboard 
                currentNote={currentNote}
                mode={mode}
                onCorrectGuess={handleCorrectGuess}
                onIncorrectGuess={handleIncorrectGuess}
                difficulty={difficulty}
                cheatMode={cheatMode}
                onSequenceChange={setPlayedSequence}
                onFeedbackChange={setFeedback}
              />
            </div>
          </div>

          {/* Right side - Title, Scores, and Difficulty */}
          <div className="flex-1 flex flex-col gap-8">
            <div className="bg-white/90 backdrop-blur-xl dark:bg-gray-900/90 rounded-3xl shadow-2xl shadow-indigo-500/5 dark:shadow-indigo-500/10 border border-indigo-100/50 dark:border-indigo-500/10 p-8 transition-all duration-500">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600 dark:from-indigo-400 dark:to-fuchsia-400 tracking-tight mb-4">
                Learn Sheet Music
              </h1>
              <p className="text-sm text-indigo-950/70 dark:text-indigo-200/70 mb-8 font-medium">
                Master reading music notes through interactive practice
              </p>
              <ModeSelector 
                currentMode={mode}
                onModeChange={handleModeChange}
              />
              {mode !== 'chord' && (
                <div className="mt-6">
                  <ClefSelector 
                    currentClef={clef}
                    onClefChange={handleClefChange}
                  />
                </div>
              )}
              {mode === 'note' && (
                <div className="space-y-4 mt-8">
                  <div className="group">
                    <div className="bg-gradient-to-br from-indigo-50 to-fuchsia-50 dark:from-indigo-950/50 dark:to-fuchsia-950/50 rounded-2xl px-6 py-4 shadow-lg shadow-indigo-500/5 dark:shadow-indigo-500/10 border border-indigo-100/50 dark:border-indigo-500/10 transition-all duration-300 hover:scale-[1.02]">
                      <p className="text-sm text-indigo-600/90 dark:text-indigo-400/90 font-medium">Current Streak</p>
                      <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                        {currentStreak} <span className="animate-pulse inline-block">🔥</span>
                      </p>
                    </div>
                  </div>
                  <div className="group">
                    <div className="bg-gradient-to-br from-indigo-50 to-fuchsia-50 dark:from-indigo-950/50 dark:to-fuchsia-950/50 rounded-2xl px-6 py-4 shadow-lg shadow-indigo-500/5 dark:shadow-indigo-500/10 border border-indigo-100/50 dark:border-indigo-500/10 transition-all duration-300 hover:scale-[1.02]">
                      <p className="text-sm text-indigo-600/90 dark:text-indigo-400/90 font-medium">Best Streak</p>
                      <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                        {bestStreak} <span className="animate-bounce inline-block">🏆</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1 bg-white/90 backdrop-blur-xl dark:bg-gray-900/90 rounded-3xl shadow-2xl shadow-indigo-500/5 dark:shadow-indigo-500/10 border border-indigo-100/50 dark:border-indigo-500/10 p-8 transition-all duration-500">
              <DifficultySelector onDifficultyChange={handleDifficultyChange} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
