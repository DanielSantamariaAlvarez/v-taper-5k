import { DayRoutine } from '../types/workout';

// Complete 7-day weekly V-Taper 5K plan (25-30 min sessions, 20s rest between sets)
export const WEEKLY_PLAN: DayRoutine[] = [
  {
    dayIndex: 0,
    dayId: 'lunes',
    dayName: 'Lunes',
    focusTitle: 'Empuje + Core',
    subtitle: 'Pectoral denso, hombros redondos, tríceps y pared abdominal',
    isRestDay: false,
    estimatedMinutes: '28 min',
    exercises: [
      { exerciseId: 'E1', sets: 4, reps: 15, restSeconds: 20 },
      { exerciseId: 'E2', sets: 4, reps: 12, restSeconds: 20 },
      { exerciseId: 'E3', sets: 4, reps: 12, restSeconds: 20 },
      { exerciseId: 'E4', sets: 4, reps: 15, restSeconds: 20 },
      { exerciseId: 'E9', sets: 3, reps: 12, restSeconds: 20 },
      { exerciseId: 'E10', sets: 4, reps: 15, restSeconds: 20 },
    ],
  },
  {
    dayIndex: 1,
    dayId: 'martes',
    dayName: 'Martes',
    focusTitle: 'Tirón + Brazos',
    subtitle: 'Amplitud dorsal, romboides, deltoides posterior y bíceps Zottman',
    isRestDay: false,
    estimatedMinutes: '25 min',
    exercises: [
      { exerciseId: 'E5', sets: 4, reps: 15, restSeconds: 20 },
      { exerciseId: 'E7', sets: 4, reps: 12, restSeconds: 20 },
      { exerciseId: 'E6', sets: 4, reps: 15, restSeconds: 20 },
      { exerciseId: 'E8', sets: 4, reps: 12, restSeconds: 20 },
      { exerciseId: 'E10', sets: 3, reps: 15, restSeconds: 20 },
    ],
  },
  {
    dayIndex: 2,
    dayId: 'miercoles',
    dayName: 'Miércoles',
    focusTitle: 'Hombros 3D + Cintura en V',
    subtitle: 'Énfasis en anchura clavicular, postura posterior y control abdominal',
    isRestDay: false,
    estimatedMinutes: '29 min',
    exercises: [
      { exerciseId: 'E3', sets: 4, reps: 12, restSeconds: 20 },
      { exerciseId: 'E4', sets: 5, reps: 15, restSeconds: 20 },
      { exerciseId: 'E6', sets: 5, reps: 15, restSeconds: 20 },
      { exerciseId: 'E2', sets: 3, reps: 12, restSeconds: 20 },
      { exerciseId: 'E10', sets: 5, reps: 15, restSeconds: 20 },
    ],
  },
  {
    dayIndex: 3,
    dayId: 'jueves',
    dayName: 'Jueves',
    focusTitle: 'Empuje + Densidad de Pecho',
    subtitle: 'Prensa isométrica prioritaria, volumen de pectoral, deltoides y tríceps',
    isRestDay: false,
    estimatedMinutes: '26 min',
    exercises: [
      { exerciseId: 'E2', sets: 4, reps: 15, restSeconds: 20 },
      { exerciseId: 'E1', sets: 4, reps: 15, restSeconds: 20 },
      { exerciseId: 'E3', sets: 4, reps: 12, restSeconds: 20 },
      { exerciseId: 'E4', sets: 4, reps: 15, restSeconds: 20 },
      { exerciseId: 'E9', sets: 4, reps: 12, restSeconds: 20 },
    ],
  },
  {
    dayIndex: 4,
    dayId: 'viernes',
    dayName: 'Viernes',
    focusTitle: 'Espalda en V + Brazos',
    subtitle: 'Tracción de alta densidad metabólica y bombeo completo de brazos',
    isRestDay: false,
    estimatedMinutes: '26 min',
    exercises: [
      { exerciseId: 'E5', sets: 4, reps: 15, restSeconds: 20 },
      { exerciseId: 'E7', sets: 4, reps: 15, restSeconds: 20 },
      { exerciseId: 'E6', sets: 4, reps: 15, restSeconds: 20 },
      { exerciseId: 'E8', sets: 4, reps: 15, restSeconds: 20 },
      { exerciseId: 'E9', sets: 3, reps: 12, restSeconds: 20 },
    ],
  },
  {
    dayIndex: 5,
    dayId: 'sabado',
    dayName: 'Sábado',
    focusTitle: 'Circuito Fight Club Full Torso',
    subtitle: '3 series de 15 repeticiones por ejercicio para definición atlética en V',
    isRestDay: false,
    isCircuit: true,
    circuitRounds: 3,
    estimatedMinutes: '28 min',
    exercises: [
      { exerciseId: 'E1', sets: 3, reps: 15, restSeconds: 20 },
      { exerciseId: 'E5', sets: 3, reps: 15, restSeconds: 20 },
      { exerciseId: 'E3', sets: 3, reps: 15, restSeconds: 20 },
      { exerciseId: 'E4', sets: 3, reps: 15, restSeconds: 20 },
      { exerciseId: 'E8', sets: 3, reps: 15, restSeconds: 20 },
      { exerciseId: 'E9', sets: 3, reps: 15, restSeconds: 20 },
      { exerciseId: 'E10', sets: 3, reps: 15, restSeconds: 20 },
    ],
  },
  {
    dayIndex: 6,
    dayId: 'domingo',
    dayName: 'Domingo',
    focusTitle: 'Descanso de Pesas (Recuperación Activa)',
    subtitle: 'Supercompensación muscular de torso y cuidado articular del menisco',
    isRestDay: true,
    estimatedMinutes: '15 min (Opcional)',
    exercises: [],
    recoveryTips: [
      'Movilidad torácica y escapular suave sentado (rotaciones controladas y respiración diafragmática).',
      'Hidratación óptima y aporte proteico para consolidar la hipertrofia sarcoplasmática de la semana.',
      'Descarga total del tren inferior: elevación pasiva de piernas y cero torsión en la rodilla.',
    ],
  },
];

// Helper function to map JavaScript Date.getDay() (0=Sunday..6=Saturday) to Monday-first index (0=Monday..6=Sunday)
export function getCurrentDayIndexMondayFirst(date: Date = new Date()): number {
  const jsDay = date.getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

// Helper function to calculate total sets, total reps, and estimated duration in seconds for a DayRoutine
export function calculateRoutineMetrics(routine: DayRoutine): {
  totalSets: number;
  totalReps: number;
  estimatedTotalSeconds: number;
} {
  let totalSets = 0;
  let totalReps = 0;
  let estimatedTotalSeconds = 0;

  for (const item of routine.exercises) {
    totalSets += item.sets;
    totalReps += item.sets * item.reps;
    const workSecondsPerSet = item.reps * 4;
    estimatedTotalSeconds += item.sets * (workSecondsPerSet + item.restSeconds);
  }

  return {
    totalSets,
    totalReps,
    estimatedTotalSeconds,
  };
}
