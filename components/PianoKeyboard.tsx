'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Note } from '@/utils/noteGenerator';
import { compareNotes } from '@/utils/noteGenerator';
import { compareChordNotes } from '@/utils/chordGenerator';
import { compareScaleNotes, isScaleComplete } from '@/utils/scaleGenerator';
import type { Mode } from '@/components/ModeSelector';

interface PianoKeyboardProps {
  currentNote: Note[] | null;
  mode: Mode;
  onCorrectGuess: () => void;
  onIncorrectGuess: () => void;
  difficulty: number;
  cheatMode?: boolean;
  onSequenceChange: (sequence: string[]) => void;
  onFeedbackChange: (feedback: 'correct' | 'incorrect' | null) => void;
}

// Update the keyboard mapping to only include middle octave
const KEYBOARD_MAP: { [key: string]: string } = {
  // Middle octave only (C4 to B4)
  'a': 'C4',
  'w': 'C#4',
  's': 'D4',
  'e': 'D#4',
  'd': 'E4',
  'f': 'F4',
  't': 'F#4',
  'g': 'G4',
  'y': 'G#4',
  'h': 'A4',
  'u': 'A#4',
  'j': 'B4',
};

// Update MIDI mapping for 3 octaves (keep full range for MIDI keyboard)
const MIDI_MAP: { [key: number]: string } = {
  48: 'C3', 49: 'C#3', 50: 'D3', 51: 'D#3', 52: 'E3', 53: 'F3',
  54: 'F#3', 55: 'G3', 56: 'G#3', 57: 'A3', 58: 'A#3', 59: 'B3',
  60: 'C4', 61: 'C#4', 62: 'D4', 63: 'D#4', 64: 'E4', 65: 'F4',
  66: 'F#4', 67: 'G4', 68: 'G#4', 69: 'A4', 70: 'A#4', 71: 'B4',
  72: 'C5', 73: 'C#5', 74: 'D5', 75: 'D#5', 76: 'E5', 77: 'F5',
  78: 'F#5', 79: 'G5'
};

// Update the piano key data for 3 octaves
const OCTAVES = ['3', '4', '5'];
const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_KEYS = ['C#', 'D#', 'F#', 'G#', 'A#'];

export default function PianoKeyboard({ 
  currentNote, 
  mode,
  onCorrectGuess,
  onIncorrectGuess,
  difficulty,
  cheatMode = false,
  onSequenceChange,
  onFeedbackChange,
}: PianoKeyboardProps) {
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [heldNotes, setHeldNotes] = useState<Set<string>>(new Set());
  const [playedSequence, setPlayedSequence] = useState<string[]>([]);

  const checkAnswer = useCallback((notes: Set<string>) => {
    if (!currentNote || notes.size === 0) return;

    if (mode === 'note') {
      // For single notes, wait until the user releases the key
      if (currentNote.length === 1 && notes.size === 1) {
        const playedNote = Array.from(notes)[0];
        const targetNote = currentNote[0];
        
        // Extract note and octave from played note (e.g., "C4")
        const [playedNoteName, playedOctave] = playedNote.match(/([A-G]#?)(\d)/)?.slice(1) || [];
        
        // Compare both note name and octave
        const isCorrect = playedNoteName === targetNote.key && 
                         playedOctave === targetNote.octave.toString();

        if (isCorrect) {
          setFeedback('correct');
          onCorrectGuess();
        } else {
          setFeedback('incorrect');
          onIncorrectGuess();
        }
      }
    } else if (mode === 'chord') {
      // For chord mode, check if all required notes are pressed
      if (notes.size === currentNote.length) {
        const allNotesCorrect = currentNote.every(targetNote => 
          Array.from(notes).some(playedNote => {
            const [playedNoteName, playedOctave] = playedNote.match(/([A-G]#?)(\d)/)?.slice(1) || [];
            return playedNoteName === targetNote.key && 
                   playedOctave === targetNote.octave.toString();
          })
        );

        if (allNotesCorrect) {
          setFeedback('correct');
          onCorrectGuess();
        } else {
          setFeedback('incorrect');
          onIncorrectGuess();
        }
      }
    } else {
      // Scale mode - handle sequence of notes
      const newNote = Array.from(notes)[0];
      const newSequence = [...playedSequence, newNote];
      
      // Create a Scale object from currentNote array
      const targetScale = {
        notes: currentNote.map(note => `${note.key}${note.octave}`),
        root: currentNote[0].key,
        type: 'major' as const, // Default to major since we don't have this info
        direction: 'up' as const // Default to up since we don't have this info
      };
      
      // Check if the sequence is correct so far
      const isSequenceCorrect = compareScaleNotes(newSequence, targetScale);

      if (isSequenceCorrect) {
        setPlayedSequence(newSequence);
        setFeedback('correct');
        
        // Check if scale is complete
        if (isScaleComplete(newSequence, targetScale)) {
          onCorrectGuess();
          setPlayedSequence([]);
        }
      } else {
        setFeedback('incorrect');
        onIncorrectGuess();
        setPlayedSequence([]);
      }
    }
  }, [currentNote, mode, onCorrectGuess, onIncorrectGuess, playedSequence]);

  const handleNotePlay = (note: string) => {
    if (!currentNote) return;
    
    // Add note to held notes
    const newHeldNotes = new Set(heldNotes).add(note);
    setHeldNotes(newHeldNotes);
    setActiveKeys(Array.from(newHeldNotes));
    
    if (mode === 'scale') {
      // For scales, check on key press
      checkAnswer(new Set([note]));
    } else {
      // For notes and chords, check all held notes
      checkAnswer(newHeldNotes);
    }
  };

  const handleNoteRelease = (note: string) => {
    const newHeldNotes = new Set(heldNotes);
    newHeldNotes.delete(note);
    setHeldNotes(newHeldNotes);
    setActiveKeys(Array.from(newHeldNotes));

    // Reset feedback when all keys are released
    if (newHeldNotes.size === 0) {
      setTimeout(() => {
        setFeedback(null);
      }, 200);
    }
  };

  // Computer keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (KEYBOARD_MAP[key] && !pressedKeys.has(key)) {
        setPressedKeys(prev => new Set(prev).add(key));
        handleNotePlay(KEYBOARD_MAP[key]);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (KEYBOARD_MAP[key]) {
        setPressedKeys(prev => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
        handleNoteRelease(KEYBOARD_MAP[key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [pressedKeys, handleNotePlay]);

  // MIDI keyboard handling
  useEffect(() => {
    if (!navigator.requestMIDIAccess) {
      console.log('WebMIDI is not supported in this browser.');
      return;
    }

    let midiAccess: WebMidi.MIDIAccess;

    const handleMIDIMessage = (message: WebMidi.MIDIMessageEvent) => {
      const [command, note, velocity] = message.data;
      const midiNote = MIDI_MAP[note];

      if (!midiNote) return;

      // Note On (velocity > 0)
      if (command === 144 && velocity > 0) {
        handleNotePlay(midiNote);
      }
      // Note Off or Note On with velocity 0
      else if (command === 128 || (command === 144 && velocity === 0)) {
        handleNoteRelease(midiNote);
      }
    };

    navigator.requestMIDIAccess()
      .then(access => {
        midiAccess = access;
        for (const input of midiAccess.inputs.values()) {
          input.onmidimessage = handleMIDIMessage;
        }

        midiAccess.onstatechange = (e) => {
          const port = e.port;
          if (port.type === 'input') {
            if (port.state === 'connected') {
              port.onmidimessage = handleMIDIMessage;
            }
          }
        };
      })
      .catch(error => console.log('MIDI access denied:', error));

    return () => {
      if (midiAccess) {
        for (const input of midiAccess.inputs.values()) {
          input.onmidimessage = null;
        }
      }
    };
  }, [handleNotePlay]);

  useEffect(() => {
    onSequenceChange(playedSequence);
  }, [playedSequence, onSequenceChange]);

  useEffect(() => {
    onFeedbackChange(feedback);
  }, [feedback, onFeedbackChange]);

  return (
    <div className="h-full flex flex-col">
      {/* Piano container */}
      <div className="relative flex-1 min-h-[200px]">
        <div className="absolute inset-0 flex">
          {/* White keys */}
          {OCTAVES.map((octave) => (
            WHITE_KEYS.map((note) => (
              <div
                key={`${note}${octave}`}
                className={`flex-1 border border-gray-200 rounded-b relative select-none
                  ${
                    activeKeys.includes(`${note}${octave}`)
                      ? feedback === 'correct'
                        ? 'bg-green-200 shadow-inner'
                        : feedback === 'incorrect'
                        ? 'bg-red-200 shadow-inner'
                        : 'bg-blue-200 shadow-inner'
                      : 'bg-white'
                  }`}
              >
                <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-600">
                  {`${note}${octave}`}
                </span>
                <span className="absolute top-2 left-2 text-xs font-medium text-gray-400">
                  {Object.entries(KEYBOARD_MAP).find(([_, n]) => n === `${note}${octave}`)?.[0]}
                </span>
              </div>
            ))
          ))}
          
          {/* Black keys */}
          <div className="absolute top-0 left-0 right-0 flex h-3/5">
            {OCTAVES.map((octave, octaveIndex) => (
              BLACK_KEYS.map((note, noteIndex) => (
                <div
                  key={`${note}${octave}`}
                  style={{
                    left: `${((noteIndex + (octaveIndex * 7)) * 4.76) + 3.5}%`,
                    width: '3%'
                  }}
                  className={`absolute h-full select-none shadow-xl ${
                    activeKeys.includes(`${note}${octave}`)
                      ? feedback === 'correct'
                        ? 'bg-green-700'
                        : feedback === 'incorrect'
                        ? 'bg-red-700'
                        : 'bg-blue-700'
                      : 'bg-gray-800'
                  } rounded-b`}
                >
                  <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm font-medium text-white">
                    {`${note}${octave}`}
                  </span>
                  <span className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-300">
                    {Object.entries(KEYBOARD_MAP).find(([_, n]) => n === `${note}${octave}`)?.[0]}
                  </span>
                </div>
              ))
            ))}
          </div>
        </div>
      </div>

      {/* Feedback and controls */}
      <div className="mt-4">
        {feedback && (
          <div className="text-center animate-fade-in mb-4">
            <div
              className={`inline-block px-6 py-2 rounded-full text-lg font-semibold ${
                feedback === 'correct'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
              }`}
            >
              {feedback === 'correct' ? '✓ Correct!' : '✗ Try again!'}
            </div>
          </div>
        )}

        {mode === 'scale' && (
          <div className="text-center mb-4 space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Progress: {playedSequence.length} / {currentNote?.length} notes
            </div>
            {playedSequence.length > 0 && (
              <div className="font-mono text-sm bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 inline-block">
                {playedSequence.join(' → ')}
              </div>
            )}
          </div>
        )}

        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {mode === 'note' 
              ? 'Play the note shown on the staff'
              : mode === 'chord'
                ? 'Play all notes in the chord simultaneously'
                : 'Play the scale notes in sequence'
            }
          </p>
          <div className="inline-block px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs text-gray-600 dark:text-gray-300">
            <div>
              <p className="font-semibold mb-1">Keyboard Controls (Middle Octave)</p>
              <p>White keys: <span className="font-mono">A S D F G H J</span></p>
              <p>Black keys: <span className="font-mono">W E T Y U</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 