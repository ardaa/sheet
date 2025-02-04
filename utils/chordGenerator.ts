export type ChordType = 'major' | 'minor' | 'dim' | '7' | 'm7' | 'maj7';

export interface Chord {
  root: string;
  type: ChordType;
  notes: string[];
}

const CHORD_TYPES: Record<ChordType, number[]> = {
  'major': [0, 4, 7],          // 1, 3, 5
  'minor': [0, 3, 7],          // 1, ♭3, 5
  'dim': [0, 3, 6],           // 1, ♭3, ♭5
  '7': [0, 4, 7, 10],         // 1, 3, 5, ♭7
  'm7': [0, 3, 7, 10],        // 1, ♭3, 5, ♭7
  'maj7': [0, 4, 7, 11],      // 1, 3, 5, 7
};

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function generateChord(difficulty: number): Chord {
  const rootNote = NOTES[Math.floor(Math.random() * NOTES.length)];
  
  let availableTypes: ChordType[] = [];
  if (difficulty <= 3) {
    availableTypes = ['major', 'minor'];
  } else if (difficulty <= 6) {
    availableTypes = ['major', 'minor', 'dim'];
  } else if (difficulty <= 8) {
    availableTypes = ['major', 'minor', 'dim', '7'];
  } else {
    availableTypes = ['major', 'minor', 'dim', '7', 'm7', 'maj7'];
  }

  const chordType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
  const intervals = CHORD_TYPES[chordType];

  const rootIndex = NOTES.indexOf(rootNote);
  const notes = intervals.map(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    return NOTES[noteIndex];
  });

  return {
    root: rootNote,
    type: chordType,
    notes: notes
  };
}

export function formatChordName(chord: Chord): string {
  const typeSymbols: Record<ChordType, string> = {
    'major': '',
    'minor': 'm',
    'dim': '°',
    '7': '7',
    'm7': 'm7',
    'maj7': 'maj7'
  };

  return `${chord.root}${typeSymbols[chord.type]}`;
}

export function compareChordNotes(playedNotes: Set<string>, targetChord: Chord): boolean {
  if (playedNotes.size !== targetChord.notes.length) return false;

  return targetChord.notes.every(note => 
    Array.from(playedNotes).some(played => 
      played.replace('#', 's').toUpperCase() === note.replace('#', 's').toUpperCase()
    )
  );
} 