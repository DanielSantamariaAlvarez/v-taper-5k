// Core TypeScript definitions for the V-Taper 5K application
// All identifiers and comments are in English; UI strings stored in data models are in Spanish.

export type ExerciseId =
  | 'E1'
  | 'E2'
  | 'E3'
  | 'E4'
  | 'E5'
  | 'E6'
  | 'E7'
  | 'E8'
  | 'E9'
  | 'E10';

export type MuscleGroupId =
  | 'chest_major'
  | 'chest_inner_upper'
  | 'delt_anterior'
  | 'delt_lateral'
  | 'delt_posterior'
  | 'traps_upper'
  | 'traps_middle'
  | 'rhomboids'
  | 'lats'
  | 'serratus'
  | 'biceps'
  | 'brachioradialis'
  | 'forearms'
  | 'triceps'
  | 'anconeus'
  | 'abs_rectus'
  | 'obliques';

export type PostureType =
  | 'floor_supine'
  | 'seated_upright'
  | 'seated_hinged'
  | 'floor_legs_chair';

export interface ExerciseDefinition {
  id: ExerciseId;
  code: string;
  name: string;
  subtitle: string;
  postureLabel: string;
  postureType: PostureType;
  dumbbellLoadLabel: string;
  description: string;
  executionSteps: string[];
  meniscusSafetyNote: string;
  tempoNote: string;
  primaryMuscles: MuscleGroupId[];
  secondaryMuscles: MuscleGroupId[];
  primaryMusclesLabel: string;
  secondaryMusclesLabel: string;
}

export type WorkoutPhase =
  | 'idle'
  | 'prepare'
  | 'concentric'
  | 'eccentric'
  | 'rest'
  | 'completed';

export interface DayPrescriptionItem {
  exerciseId: ExerciseId;
  sets: number;
  reps: number;
  restSeconds: number;
}

export interface DayRoutine {
  dayIndex: number; // 0 = Monday (Lunes) ... 6 = Sunday (Domingo)
  dayId: string;
  dayName: string;
  focusTitle: string;
  subtitle: string;
  isRestDay: boolean;
  isCircuit?: boolean;
  circuitRounds?: number;
  estimatedMinutes: string;
  exercises: DayPrescriptionItem[];
  recoveryTips?: string[];
}

export interface CompletedSessionRecord {
  id: string;
  dateIso: string; // YYYY-MM-DD
  timestamp: string;
  dayId: string;
  dayName: string;
  focusTitle: string;
  totalSetsCompleted: number;
  totalRepsCompleted: number;
  durationSeconds: number;
}

export interface BodyMeasurementRecord {
  id: string;
  dateIso: string; // YYYY-MM-DD
  weightKg: number;
  waistCm: number;
  chestBackCm: number;
  armCm: number;
}

export interface PersistedAppData {
  completedSessions: CompletedSessionRecord[];
  measurements: BodyMeasurementRecord[];
}

export interface VolatilePhotoItem {
  fileName: string;
  dateLabel: string;
  sortKey: string;
  objectUrl: string;
  sizeBytes: number;
}

export type AppTabId = 'dashboard' | 'workout' | 'catalog' | 'progress';

// Ambient Web API type extensions for File System Access API on macOS Chromium browsers
export interface LocalFileSystemWritableFileStream extends WritableStream {
  write: (data: Blob | BufferSource | string) => Promise<void>;
  close: () => Promise<void>;
}

export interface LocalFileSystemFileHandle {
  kind: 'file';
  name: string;
  getFile: () => Promise<File>;
  createWritable: () => Promise<LocalFileSystemWritableFileStream>;
}

export interface LocalFileSystemDirectoryHandle {
  kind: 'directory';
  name: string;
  values: () => AsyncIterableIterator<LocalFileSystemFileHandle | LocalFileSystemDirectoryHandle>;
  getFileHandle: (
    name: string,
    options?: { create?: boolean }
  ) => Promise<LocalFileSystemFileHandle>;
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
    showDirectoryPicker?: (options?: {
      id?: string;
      mode?: 'read' | 'readwrite';
    }) => Promise<LocalFileSystemDirectoryHandle>;
  }
}
