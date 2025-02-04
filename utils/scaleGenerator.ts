export type ScaleType = 'major' | 'natural_minor' | 'harmonic_minor' | 'melodic_minor' | 'pentatonic_major' | 'pentatonic_minor' | 'chromatic';

export interface Scale {
  root: string;
  type: ScaleType;
  notes: string[];
  direction: 'up' | 'down' | 'both';
}

const SCALE_PATTERNS: Record<ScaleType, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11, 12], // Whole, Whole, Half, Whole, Whole, Whole, Half
  natural_minor: [0, 2, 3, 5, 7, 8, 10, 12], // Whole, Half, Whole, Whole, Half, Whole, Whole
  harmonic_minor: [0, 2, 3, 5, 7, 8, 11, 12], // Whole, Half, Whole, Whole, Half, Aug 2nd, Half
  melodic_minor: [0, 2, 3, 5, 7, 9, 11, 12], // Whole, Half, Whole, Whole, Whole, Whole, Half
  pentatonic_major: [0, 2, 4, 7, 9, 12], // Major without 4th and 7th
  pentatonic_minor: [0, 3, 5, 7, 10, 12], // Minor without 2nd and 6th
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // All semitones
};

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const SCALE_NAMES: Record<ScaleType, string> = {
  major: 'Major',
  natural_minor: 'Natural Minor',
  harmonic_minor: 'Harmonic Minor',
  melodic_minor: 'Melodic Minor',
  pentatonic_major: 'Major Pentatonic',
  pentatonic_minor: 'Minor Pentatonic',
  chromatic: 'Chromatic',
};

export function generateScale(difficulty: number): Scale {
  const rootNote = NOTES[Math.floor(Math.random() * NOTES.length)];
  const octave = 4; // Middle octave

  let availableTypes: ScaleType[] = [];
  let direction: 'up' | 'down' | 'both';

  if (difficulty <= 3) {
    availableTypes = ['major', 'pentatonic_major'];
    direction = 'up';
  } else if (difficulty <= 5) {
    availableTypes = ['major', 'natural_minor', 'pentatonic_major', 'pentatonic_minor'];
    direction = 'up';
  } else if (difficulty <= 7) {
    availableTypes = ['major', 'natural_minor', 'harmonic_minor', 'pentatonic_major', 'pentatonic_minor'];
    direction = Math.random() > 0.5 ? 'up' : 'down';
  } else {
    availableTypes = ['major', 'natural_minor', 'harmonic_minor', 'melodic_minor', 'chromatic'];
    direction = 'both';
  }

  const scaleType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
  const pattern = SCALE_PATTERNS[scaleType];

  const rootIndex = NOTES.indexOf(rootNote);
  const ascendingNotes = pattern.map(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    const noteOctave = octave + Math.floor((rootIndex + interval) / 12);
    return `${NOTES[noteIndex]}${noteOctave}`;
  });

  let notes: string[];
  if (direction === 'up') {
    notes = ascendingNotes;
  } else if (direction === 'down') {
    notes = [...ascendingNotes].reverse();
  } else {
    notes = [...ascendingNotes, ...ascendingNotes.slice(0, -1).reverse()];
  }

  return {
    root: rootNote,
    type: scaleType,
    notes,
    direction
  };
}

export function formatScaleName(scale: Scale): string {
  return `${scale.root} ${SCALE_NAMES[scale.type]}`;
}

export function compareScaleNotes(playedNotes: string[], targetScale: Scale): boolean {
  if (playedNotes.length > targetScale.notes.length) return false;
  
  // Check if played notes match the scale up to the current point
  return playedNotes.every((note, index) => {
    const [playedNoteName, playedOctave] = note.match(/([A-G]#?)(\d)/)?.slice(1) || [];
    const [targetNoteName, targetOctave] = targetScale.notes[index].match(/([A-G]#?)(\d)/)?.slice(1) || [];
    return playedNoteName === targetNoteName && playedOctave === targetOctave;
  });
}

export function isScaleComplete(playedNotes: string[], targetScale: Scale): boolean {
  return playedNotes.length === targetScale.notes.length && 
         compareScaleNotes(playedNotes, targetScale);
} 