import {
  BodyMeasurementRecord,
  CompletedSessionRecord,
  PersistedAppData,
} from '../types/workout';

// Storage key strictly reserved for numerical workout history and body measurements.
// PRIVACY RULE: Zero images or photo blobs are ever stored in localStorage or IndexedDB.
const STORAGE_KEY = 'vtaper_5k_numerical_data_v1';

// Generates default numerical seed data so the portfolio charts and metrics are immediately demonstrable
export function createDefaultAppData(): PersistedAppData {
  const today = new Date();
  const formatOffsetDate = (daysAgo: number): string => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const initialMeasurements: BodyMeasurementRecord[] = [
    {
      id: 'm-seed-1',
      dateIso: formatOffsetDate(21),
      weightKg: 76.4,
      waistCm: 83.5,
      chestBackCm: 104.0,
      armCm: 35.2,
    },
    {
      id: 'm-seed-2',
      dateIso: formatOffsetDate(14),
      weightKg: 75.8,
      waistCm: 82.2,
      chestBackCm: 105.0,
      armCm: 35.6,
    },
    {
      id: 'm-seed-3',
      dateIso: formatOffsetDate(7),
      weightKg: 75.2,
      waistCm: 81.0,
      chestBackCm: 106.2,
      armCm: 36.1,
    },
  ];

  const initialSessions: CompletedSessionRecord[] = [
    {
      id: 's-seed-1',
      dateIso: formatOffsetDate(2),
      timestamp: new Date(today.getTime() - 2 * 86400000).toISOString(),
      dayId: 'lunes',
      dayName: 'Lunes',
      focusTitle: 'Empuje + Core',
      totalSetsCompleted: 23,
      totalRepsCompleted: 315,
      durationSeconds: 1680,
    },
    {
      id: 's-seed-2',
      dateIso: formatOffsetDate(1),
      timestamp: new Date(today.getTime() - 1 * 86400000).toISOString(),
      dayId: 'martes',
      dayName: 'Martes',
      focusTitle: 'Tirón + Brazos',
      totalSetsCompleted: 19,
      totalRepsCompleted: 261,
      durationSeconds: 1510,
    },
  ];

  return {
    completedSessions: initialSessions,
    measurements: initialMeasurements,
  };
}

// Loads numerical application data from localStorage with safe parsing
export function loadPersistedAppData(): PersistedAppData {
  if (typeof window === 'undefined') {
    return createDefaultAppData();
  }

  try {
    const rawJson = window.localStorage.getItem(STORAGE_KEY);
    if (!rawJson) {
      const defaults = createDefaultAppData();
      savePersistedAppData(defaults);
      return defaults;
    }

    const parsed = JSON.parse(rawJson) as Partial<PersistedAppData>;
    const completedSessions = Array.isArray(parsed.completedSessions)
      ? parsed.completedSessions
      : [];
    const measurements = Array.isArray(parsed.measurements)
      ? parsed.measurements
      : [];

    return {
      completedSessions,
      measurements,
    };
  } catch {
    return createDefaultAppData();
  }
}

// Saves numerical application data to localStorage
export function savePersistedAppData(data: PersistedAppData): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors
  }
}

// Appends a newly completed workout session and persists to localStorage
export function recordCompletedWorkoutSession(
  currentData: PersistedAppData,
  newSession: Omit<CompletedSessionRecord, 'id' | 'dateIso' | 'timestamp'>
): PersistedAppData {
  const now = new Date();
  const dateIso = now.toISOString().split('T')[0];

  const createdRecord: CompletedSessionRecord = {
    ...newSession,
    id: `session-${now.getTime()}`,
    dateIso,
    timestamp: now.toISOString(),
  };

  const updatedData: PersistedAppData = {
    ...currentData,
    completedSessions: [createdRecord, ...currentData.completedSessions],
  };

  savePersistedAppData(updatedData);
  return updatedData;
}

// Adds or updates a body measurement record sorted chronologically
export function addBodyMeasurementRecord(
  currentData: PersistedAppData,
  measurementInput: Omit<BodyMeasurementRecord, 'id'>
): PersistedAppData {
  const newRecord: BodyMeasurementRecord = {
    ...measurementInput,
    id: `measure-${Date.now()}`,
  };

  const merged = [...currentData.measurements, newRecord].sort((a, b) =>
    a.dateIso.localeCompare(b.dateIso)
  );

  const updatedData: PersistedAppData = {
    ...currentData,
    measurements: merged,
  };

  savePersistedAppData(updatedData);
  return updatedData;
}

// Removes a specific body measurement entry by ID
export function deleteBodyMeasurementRecord(
  currentData: PersistedAppData,
  measurementId: string
): PersistedAppData {
  const updatedData: PersistedAppData = {
    ...currentData,
    measurements: currentData.measurements.filter((item) => item.id !== measurementId),
  };

  savePersistedAppData(updatedData);
  return updatedData;
}

// Calculates the current active day streak based on unique completed session dates
export function calculateCurrentDayStreak(sessions: CompletedSessionRecord[]): number {
  if (sessions.length === 0) {
    return 0;
  }

  const uniqueDatesDesc = Array.from(new Set(sessions.map((s) => s.dateIso))).sort((a, b) =>
    b.localeCompare(a)
  );

  const todayIso = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayIso = yesterdayDate.toISOString().split('T')[0];

  // If the latest workout is older than yesterday, active streak is 0
  if (uniqueDatesDesc[0] !== todayIso && uniqueDatesDesc[0] !== yesterdayIso) {
    return 0;
  }

  let streakCount = 1;
  let currentCursorDate = new Date(`${uniqueDatesDesc[0]}T00:00:00`);

  for (let i = 1; i < uniqueDatesDesc.length; i++) {
    const previousExpected = new Date(currentCursorDate);
    previousExpected.setDate(previousExpected.getDate() - 1);
    const expectedIso = previousExpected.toISOString().split('T')[0];

    if (uniqueDatesDesc[i] === expectedIso) {
      streakCount += 1;
      currentCursorDate = previousExpected;
    } else {
      break;
    }
  }

  return streakCount;
}

// Calculates the V-Taper athletic ratio (Chest/Back circumference divided by Waist circumference)
export function calculateVTaperRatio(chestBackCm: number, waistCm: number): number {
  if (!waistCm || waistCm <= 0) {
    return 0;
  }
  return Number((chestBackCm / waistCm).toFixed(2));
}

// Triggers a JSON file download containing only the numerical workout and measurement data
export function exportNumericalDataToJsonFile(data: PersistedAppData): void {
  const payload = JSON.stringify(data, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const todayIso = new Date().toISOString().split('T')[0];
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `v-taper-5k-datos-${todayIso}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
}

// Validates and imports a JSON string into PersistedAppData
export function parseAndValidateImportedJson(rawJsonText: string): PersistedAppData {
  const parsed = JSON.parse(rawJsonText) as Partial<PersistedAppData>;

  if (
    !parsed ||
    !Array.isArray(parsed.completedSessions) ||
    !Array.isArray(parsed.measurements)
  ) {
    throw new Error('Formato de archivo JSON inválido para V-Taper 5K.');
  }

  const sanitizedData: PersistedAppData = {
    completedSessions: parsed.completedSessions.map((s, idx) => ({
      id: String(s.id || `imported-s-${idx}`),
      dateIso: String(s.dateIso || new Date().toISOString().split('T')[0]),
      timestamp: String(s.timestamp || new Date().toISOString()),
      dayId: String(s.dayId || 'lunes'),
      dayName: String(s.dayName || 'Lunes'),
      focusTitle: String(s.focusTitle || 'Sesión Importada'),
      totalSetsCompleted: Number(s.totalSetsCompleted || 0),
      totalRepsCompleted: Number(s.totalRepsCompleted || 0),
      durationSeconds: Number(s.durationSeconds || 0),
    })),
    measurements: parsed.measurements.map((m, idx) => ({
      id: String(m.id || `imported-m-${idx}`),
      dateIso: String(m.dateIso || new Date().toISOString().split('T')[0]),
      weightKg: Number(m.weightKg || 0),
      waistCm: Number(m.waistCm || 0),
      chestBackCm: Number(m.chestBackCm || 0),
      armCm: Number(m.armCm || 0),
    })),
  };

  savePersistedAppData(sanitizedData);
  return sanitizedData;
}
