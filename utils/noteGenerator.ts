import type { Clef } from '@/components/ClefSelector';

export type Note = {
  key: string;
  octave: number;
};

export type DifficultyLevel = {
  level: number;
  noteCount: number;
  includesSharps: boolean;
  octaveRange: number[];
  description: string;
};

// Use consistent sharp notation ('s' instead of '#')
const NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const SHARP_NOTES = ['C#', 'D#', 'F#', 'G#', 'A#']; // Keep using # for internal representation

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  { level: 1, noteCount: 1, includesSharps: false, octaveRange: [4], description: 'Single notes in middle octave' },
  { level: 2, noteCount: 1, includesSharps: false, octaveRange: [4, 5], description: 'Single notes in two octaves' },
  { level: 3, noteCount: 1, includesSharps: true, octaveRange: [4], description: 'Single notes with sharps' },
  { level: 4, noteCount: 1, includesSharps: true, octaveRange: [4, 5], description: 'Single notes with sharps in two octaves' },
  { level: 5, noteCount: 2, includesSharps: false, octaveRange: [4], description: 'Two-note chords' },
  { level: 6, noteCount: 2, includesSharps: true, octaveRange: [4], description: 'Two-note chords with sharps' },
  { level: 7, noteCount: 3, includesSharps: false, octaveRange: [4], description: 'Three-note chords' },
  { level: 8, noteCount: 3, includesSharps: true, octaveRange: [4], description: 'Three-note chords with sharps' },
  { level: 9, noteCount: 3, includesSharps: true, octaveRange: [4, 5], description: 'Complex chords' },
  { level: 10, noteCount: 4, includesSharps: true, octaveRange: [4, 5], description: 'Advanced chords' },
];

// Helper function to normalize note representation
function normalizeNote(note: string): string {
  return note.toUpperCase();
}

// Update the note ranges for each clef
const TREBLE_NOTES = [
  'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4',
  'C5', 'D5', 'E5', 'F5'
].map(note => parseNote(note));

const BASS_NOTES = [
  'C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2',
  'C3', 'D3', 'E3', 'F3', 'G3'
].map(note => parseNote(note));

export function generateRandomNote(difficulty: number, clef: Clef = 'treble'): Note[] {
  const availableNotes = clef === 'bass' ? BASS_NOTES : TREBLE_NOTES;
  
  // For difficulty > 4 in 'both' mode, randomly choose clef
  if (clef === 'both' && difficulty > 4) {
    const selectedNotes = Math.random() > 0.5 ? TREBLE_NOTES : BASS_NOTES;
    const randomNote = selectedNotes[Math.floor(Math.random() * selectedNotes.length)];
    return [randomNote];
  }

  const difficultySettings = DIFFICULTY_LEVELS[difficulty - 1];
  const notes: Note[] = [];

  for (let i = 0; i < difficultySettings.noteCount; i++) {
    const note = availableNotes[Math.floor(Math.random() * availableNotes.length)];

    // Avoid duplicates
    if (notes.some(n => n.key === note.key && n.octave === note.octave)) {
      i--;
      continue;
    }

    notes.push(note);
  }

  // Sort notes by octave and key for proper chord display
  return notes.sort((a, b) => {
    if (a.octave !== b.octave) return a.octave - b.octave;
    const aIndex = [...NOTES, ...SHARP_NOTES].indexOf(normalizeNote(a.key));
    const bIndex = [...NOTES, ...SHARP_NOTES].indexOf(normalizeNote(b.key));
    return aIndex - bIndex;
  });
}

export function noteToVexFlow(note: Note): string {
  // VexFlow expects notes in the format "c/4" or "c#/4"
  return `${note.key.toLowerCase()}/${note.octave}`;
}

// Helper function to parse note strings into Note objects
function parseNote(noteStr: string): Note {
  const match = noteStr.match(/([A-G]#?)(\d)/);
  if (!match) throw new Error(`Invalid note format: ${noteStr}`);
  const [_, key, octave] = match;
  return { key, octave: parseInt(octave) };
}

export function compareNotes(played: string, target: Note[]): boolean {
  const normalizedPlayed = normalizeNote(played);
  return target.some(note => normalizeNote(note.key) === normalizedPlayed);
}

// Helper function to check if a note is within treble clef range
export function isInTrebleClefRange(note: Note): boolean {
  if (note.octave === 4 || note.octave === 5) {
    return true;
  }
  return false;
} 