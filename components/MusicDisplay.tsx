'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Vex } from 'vexflow';
import { generateRandomNote, noteToVexFlow, type Note } from '@/utils/noteGenerator';
import { generateChord, formatChordName, type Chord } from '@/utils/chordGenerator';
import { generateScale, formatScaleName, type Scale } from '@/utils/scaleGenerator';
import type { Mode } from '@/components/ModeSelector';

interface MusicDisplayProps {
  difficulty: number;
  mode: Mode;
  cheatMode?: boolean;
  clef?: Clef;
  onNoteGenerated?: (notes: Note[]) => void;
  playedSequence?: string[];
  feedback?: 'correct' | 'incorrect' | null;
}

export interface MusicDisplayHandle {
  generateNewNote: () => void;
}

const MusicDisplay = forwardRef<MusicDisplayHandle, MusicDisplayProps>(
  ({ difficulty, mode, cheatMode = false, clef = 'treble', onNoteGenerated, playedSequence = [], feedback = null }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentNotes, setCurrentNotes] = useState<Note[]>(generateRandomNote(difficulty));
    const [currentChord, setCurrentChord] = useState<Chord>(generateChord(difficulty));
    const [currentScale, setCurrentScale] = useState<Scale>(generateScale(difficulty));

    useImperativeHandle(ref, () => ({
      generateNewNote: () => {
        if (mode === 'note') {
          const newNotes = generateRandomNote(difficulty, clef);
          setCurrentNotes(newNotes);
          onNoteGenerated?.(newNotes);
        } else if (mode === 'chord') {
          const newChord = generateChord(difficulty);
          setCurrentChord(newChord);
          onNoteGenerated?.(newChord.notes.map(note => ({ key: note, octave: 4 })));
        } else {
          const newScale = generateScale(difficulty);
          setCurrentScale(newScale);
          onNoteGenerated?.(newScale.notes.map(note => {
            const [noteName, octave] = note.match(/([A-G]#?)(\d)/)?.slice(1) || [];
            return { key: noteName, octave: parseInt(octave) };
          }));
        }
      },
    }));

    useEffect(() => {
      if (mode === 'note') {
        const newNotes = generateRandomNote(difficulty, clef);
        setCurrentNotes(newNotes);
        onNoteGenerated?.(newNotes);
      } else if (mode === 'chord') {
        onNoteGenerated?.(currentChord.notes.map(note => ({ key: note, octave: 4 })));
      } else {
        onNoteGenerated?.(currentScale.notes.map(note => {
          const [noteName, octave] = note.match(/([A-G]#?)(\d)/)?.slice(1) || [];
          return { key: noteName, octave: parseInt(octave) };
        }));
      }
    }, [mode, difficulty, clef]);

    const getRandomClef = useCallback(() => {
      if (clef === 'both' && difficulty > 4) {
        return Math.random() > 0.5 ? 'treble' : 'bass';
      }
      return clef;
    }, [clef, difficulty]);

    const drawNote = () => {
      if (!containerRef.current) return;
      containerRef.current.innerHTML = '';

      if (mode === 'scale') {
        // Create containers
        const scaleContainer = document.createElement('div');
        scaleContainer.className = 'flex flex-col items-center justify-center gap-8';

        // Scale name and direction
        const headerContainer = document.createElement('div');
        headerContainer.className = 'flex flex-col items-center gap-4';

        const scaleName = document.createElement('div');
        scaleName.className = 'text-5xl font-bold text-indigo-600 dark:text-indigo-400';
        scaleName.textContent = formatScaleName(currentScale);

        const scaleDirection = document.createElement('div');
        scaleDirection.className = 'text-2xl text-gray-600 dark:text-gray-400 font-medium';
        scaleDirection.textContent = currentScale.direction === 'both' 
          ? '↑ Up and Down ↓'
          : currentScale.direction === 'up' 
            ? '↑ Ascending'
            : '↓ Descending';

        headerContainer.appendChild(scaleName);
        headerContainer.appendChild(scaleDirection);
        scaleContainer.appendChild(headerContainer);

        // Draw staff for scale
        const staffContainer = document.createElement('div');
        const renderer = new Vex.Flow.Renderer(
          staffContainer,
          Vex.Flow.Renderer.Backends.SVG
        );

        renderer.resize(800, 150);
        const context = renderer.getContext();
        context.setFont('Arial', 16);
        context.scale(1.5, 1.5);

        const stave = new Vex.Flow.Stave(20, 0, 500);
        const currentClef = getRandomClef();
        stave.addClef(currentClef);
        stave.setContext(context).draw();

        // Create notes for the scale
        const staveNotes = currentScale.notes.map((note, index) => {
          const [noteName, octave] = note.match(/([A-G]#?)(\d)/)?.slice(1) || [];
          const staveNote = new Vex.Flow.StaveNote({ 
            clef: currentClef,
            keys: [noteToVexFlow({ key: noteName, octave: parseInt(octave) })],
            duration: "q"
          });

          if (noteName.includes('#')) {
            staveNote.addModifier(new Vex.Flow.Accidental("#"), 0);
          }

          // Color the note based on played sequence
          if (index < playedSequence.length) {
            const isCorrect = playedSequence[index] === note;
            staveNote.setStyle({
              fillStyle: isCorrect ? "#22c55e" : "#ef4444",
              strokeStyle: isCorrect ? "#22c55e" : "#ef4444"
            });
          }

          return staveNote;
        });

        const voice = new Vex.Flow.Voice({ num_beats: currentScale.notes.length, beat_value: 4 });
        voice.addTickables(staveNotes);
        voice.setStrict(false);

        new Vex.Flow.Formatter()
          .joinVoices([voice])
          .format([voice], 400);
        voice.draw(context, stave);

        scaleContainer.appendChild(staffContainer);

        // Show notes in cheat mode
        if (cheatMode) {
          const notesList = document.createElement('div');
          notesList.className = 'mt-4 text-xl text-gray-600 dark:text-gray-400 font-medium';
          notesList.textContent = currentScale.notes.join(' → ');
          scaleContainer.appendChild(notesList);
        }

        containerRef.current.appendChild(scaleContainer);
        return;
      }

      if (mode === 'chord') {
        // Create a container for chord display
        const chordContainer = document.createElement('div');
        chordContainer.className = 'flex flex-col items-center justify-center gap-4';

        // Main chord name
        const chordName = document.createElement('div');
        chordName.className = 'text-7xl font-bold text-indigo-600 dark:text-indigo-400';
        chordName.textContent = formatChordName(currentChord);
        
        // Notes in the chord (always show in cheat mode)
        if (cheatMode) {
          const notesList = document.createElement('div');
          notesList.className = 'text-xl text-gray-600 dark:text-gray-400 font-medium';
          notesList.textContent = `(${currentChord.notes.join(' - ')})`;
          chordContainer.appendChild(chordName);
          chordContainer.appendChild(notesList);
        } else {
          chordContainer.appendChild(chordName);
        }

        containerRef.current.appendChild(chordContainer);
        return;
      }

      // Note mode - draw staff
      const renderer = new Vex.Flow.Renderer(
        containerRef.current,
        Vex.Flow.Renderer.Backends.SVG
      );

      renderer.resize(800, 250);
      const context = renderer.getContext();
      context.setFont('Arial', 16);
      context.scale(1.5, 1.5);

      const currentClef = getRandomClef();
      const stave = new Vex.Flow.Stave(20, 40, 500);
      stave.addClef(currentClef).addTimeSignature('4/4');
      stave.setContext(context).draw();

      try {
        const staveNote = new Vex.Flow.StaveNote({ 
          clef: currentClef, 
          keys: currentNotes.map(noteToVexFlow),
          duration: "w" 
        });

        staveNote.setStyle({
          fillStyle: "black",
          strokeStyle: "black",
          stemStyle: "black",
          fontSize: 40
        });

        currentNotes.forEach((note, index) => {
          if (note.key.includes('#')) {
            staveNote.addModifier(new Vex.Flow.Accidental("#"), index);
          }
        });

        const voice = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4 });
        voice.addTickables([staveNote]);
        voice.setStrict(false);

        new Vex.Flow.Formatter()
          .joinVoices([voice])
          .format([voice], 400);
        voice.draw(context, stave);

        // Add note names in cheat mode
        if (cheatMode) {
          const noteNames = document.createElement('div');
          noteNames.className = 'mt-4 text-center text-lg text-gray-600 dark:text-gray-400 font-medium';
          noteNames.textContent = currentNotes.map(note => `${note.key}${note.octave}`).join(' - ');
          containerRef.current.appendChild(noteNames);
        }
      } catch (error) {
        console.error('Error drawing note:', error);
        // Regenerate a new note if there's an error
        ref.current?.generateNewNote();
      }
    };

    useEffect(() => {
      drawNote();
    }, [currentNotes, currentChord, currentScale, mode, cheatMode, playedSequence, feedback]);

    return (
      <div 
        ref={containerRef} 
        className={`w-full overflow-x-auto flex justify-center items-center min-h-[250px] ${
          mode !== 'note' ? 'py-12' : ''
        }`}
      />
    );
  }
);

MusicDisplay.displayName = 'MusicDisplay';

export default MusicDisplay; 