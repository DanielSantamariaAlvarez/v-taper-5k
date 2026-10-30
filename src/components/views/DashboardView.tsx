import React, { useRef } from 'react';
import {
  Activity,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Dumbbell,
  Flame,
  Play,
  ShieldCheck,
  Sparkles,
  Upload,
} from 'lucide-react';
import {
  DayRoutine,
  ExerciseId,
  PersistedAppData,
} from '../../types/workout';
import { WEEKLY_PLAN, calculateRoutineMetrics } from '../../data/weeklyPlan';
import { getExerciseById } from '../../data/exercisesCatalog';
import {
  calculateCurrentDayStreak,
  calculateVTaperRatio,
} from '../../services/storageService';
import { ExerciseAnimationSVG } from '../svg/ExerciseAnimationSVG';

export interface DashboardViewProps {
  appData: PersistedAppData;
  selectedDayIndex: number;
  onSelectDayIndex: (index: number) => void;
  onStartRoutineForDay: (dayIndex: number) => void;
  onInspectExerciseInCatalog: (exerciseId: ExerciseId) => void;
  onExportJson: () => void;
  onImportJsonFile: (file: File) => void;
}

// Formats a duration in seconds into a readable Spanish minutes string
export function formatSecondsToMinutesLabel(totalSeconds: number): string {
  const minutes = Math.max(1, Math.round(totalSeconds / 60));
  return `${minutes} min`;
}

// Renders the top 4 KPI summary cards with generous spacing
export function renderTopKpiSummaryGrid(
  appData: PersistedAppData
): React.ReactNode {
  const activeStreak = calculateCurrentDayStreak(appData.completedSessions);
  const totalSessions = appData.completedSessions.length;
  const totalRepsAllTime = appData.completedSessions.reduce(
    (acc, item) => acc + item.totalRepsCompleted,
    0
  );

  const latestMeasurement =
    appData.measurements.length > 0
      ? appData.measurements[appData.measurements.length - 1]
      : null;

  const vTaperRatio = latestMeasurement
    ? calculateVTaperRatio(latestMeasurement.chestBackCm, latestMeasurement.waistCm)
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      {/* KPI 1: Day Streak */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col justify-between gap-2.5 sm:gap-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
            Racha Activa
          </span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            {activeStreak} {activeStreak === 1 ? 'día' : 'días'}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 line-clamp-1">
            Constancia 6 días/sem
          </p>
        </div>
      </div>

      {/* KPI 2: Completed Sessions & Reps */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col justify-between gap-2.5 sm:gap-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
            Sesiones
          </span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            {totalSessions} {totalSessions === 1 ? 'sesión' : 'sesiones'}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 line-clamp-1">
            {totalRepsAllTime.toLocaleString('es-ES')} reps totales
          </p>
        </div>
      </div>

      {/* KPI 3: V-Taper Index */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col justify-between gap-2.5 sm:gap-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
            Índice V-Taper
          </span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Award className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            {vTaperRatio > 0 ? `${vTaperRatio}x` : '—'}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 line-clamp-1">
            {latestMeasurement
              ? `Pecho ${latestMeasurement.chestBackCm} / Cintura ${latestMeasurement.waistCm}`
              : 'Registra en Progreso'}
          </p>
        </div>
      </div>

      {/* KPI 4: Meniscus Protection Protocol */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col justify-between gap-2.5 sm:gap-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
            Rodilla
          </span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div>
          <div className="text-base sm:text-2xl font-bold text-emerald-400 tracking-tight">
            Cero Impacto
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 line-clamp-1">
            Sentado/Suelo · 2×5 kg
          </p>
        </div>
      </div>
    </div>
  );
}

// Renders the interactive 7-day weekly selector strip
export function renderWeeklySelectorBar(
  selectedDayIndex: number,
  onSelectDayIndex: (index: number) => void
): React.ReactNode {
  return (
    <div className="flex lg:grid lg:grid-cols-7 gap-2.5 sm:gap-4 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
      {WEEKLY_PLAN.map((day) => {
        const isSelected = day.dayIndex === selectedDayIndex;
        const metrics = calculateRoutineMetrics(day);

        return (
          <button
            key={day.dayId}
            type="button"
            onClick={() => onSelectDayIndex(day.dayIndex)}
            className={`snap-start shrink-0 w-36 sm:w-44 lg:w-auto text-left rounded-2xl p-3.5 sm:p-4 border transition-all flex flex-col justify-between gap-2.5 ${
              isSelected
                ? 'bg-emerald-500/15 border-emerald-500/70 shadow-lg shadow-emerald-950/50'
                : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between gap-1.5">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isSelected ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                {day.dayName}
              </span>
              {day.isRestDay ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 font-semibold">
                  Descanso
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {metrics.totalSets}s
                </span>
              )}
            </div>

            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-100 line-clamp-1">
                {day.focusTitle}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                {day.estimatedMinutes}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// Renders the selected day's detailed workout prescription card
export function renderSelectedDayDetailCard(
  routine: DayRoutine,
  onStartRoutineForDay: (dayIndex: number) => void,
  onInspectExerciseInCatalog: (exerciseId: ExerciseId) => void
): React.ReactNode {
  const metrics = calculateRoutineMetrics(routine);

  if (routine.isRestDay) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-8 flex flex-col gap-5 sm:gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 sm:pb-6">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 border border-sky-500/30 px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              {routine.dayName} · Supercompensación Muscular
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">{routine.focusTitle}</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">{routine.subtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {(routine.recoveryTips || []).map((tip, idx) => (
            <div
              key={idx}
              className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 sm:p-6 flex flex-col gap-2.5 sm:gap-3"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                Pauta de Recuperación 0{idx + 1}
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-8 flex flex-col gap-5 sm:gap-8">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 border-b border-slate-800 pb-5 sm:pb-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {routine.dayName}
            </span>
            <span className="text-[11px] sm:text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {routine.estimatedMinutes} · 20s descanso
            </span>
            <span className="text-[11px] sm:text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
              {metrics.totalSets} series ({metrics.totalReps} reps)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mt-0.5">
            {routine.focusTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">{routine.subtitle}</p>
        </div>

        <button
          type="button"
          onClick={() => onStartRoutineForDay(routine.dayIndex)}
          className="w-full lg:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 sm:py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all shrink-0"
        >
          <Play className="w-5 h-5 fill-current" />
          Iniciar Rutina del {routine.dayName}
        </button>
      </div>

      {/* Prescribed Exercises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {routine.exercises.map((item, idx) => {
          const exercise = getExerciseById(item.exerciseId);
          const setDurationSeconds = item.reps * 4;

          return (
            <div
              key={`${routine.dayId}-${item.exerciseId}-${idx}`}
              className="bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-4 sm:p-6 flex flex-col justify-between gap-4 sm:gap-5 transition-all"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                    {exercise.code}
                  </span>
                  <span className="text-xs font-mono font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-3 py-1 rounded-lg">
                    {item.sets} series × {item.reps} reps ({setDurationSeconds}s/serie)
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    {exercise.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {exercise.postureLabel}
                  </p>
                </div>

                <ExerciseAnimationSVG
                  exerciseId={exercise.id}
                  autoAnimate={false}
                  contractionProgress={0.75}
                  phase="concentric"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2 border-t border-slate-800/80">
                <div className="text-xs text-slate-300">
                  <span className="text-emerald-400 font-semibold">Primario: </span>
                  {exercise.primaryMusclesLabel}
                </div>
                <button
                  type="button"
                  onClick={() => onInspectExerciseInCatalog(exercise.id)}
                  className="text-xs font-semibold text-sky-400 hover:text-sky-300 text-left transition-colors"
                >
                  Ver ficha biomecánica y mapa muscular →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Main Dashboard View Component
export const DashboardView: React.FC<DashboardViewProps> = ({
  appData,
  selectedDayIndex,
  onSelectDayIndex,
  onStartRoutineForDay,
  onInspectExerciseInCatalog,
  onExportJson,
  onImportJsonFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const selectedRoutine = WEEKLY_PLAN[selectedDayIndex] || WEEKLY_PLAN[0];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportJsonFile(file);
      event.target.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-5 sm:gap-8">
      {/* Top KPI Summary Cards */}
      {renderTopKpiSummaryGrid(appData)}

      {/* Tempo & Biomechanical Philosophy Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Activity className="w-4 h-4 shrink-0" />
            <span>Sistema de Hipertrofia Metabólica (Ritmo 1s / 3s / 20s)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
            Con mancuernas de <strong className="text-slate-100">5 kg</strong>, cada repetición dura{' '}
            <strong className="text-emerald-400">1s al subir apretando</strong> +{' '}
            <strong className="text-amber-400">3s al bajar resistiendo</strong> con{' '}
            <strong className="text-sky-400">20s de descanso</strong>.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onExportJson}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Exportar JSON</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Upload className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Importar JSON</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Weekly Plan Section */}
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400 shrink-0" />
            <h2 className="text-base sm:text-xl font-bold text-slate-100">
              Plan Semanal V-Taper (6 Días + 1 Descanso)
            </h2>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Selecciona cualquier día para inspeccionar o iniciar su entrenamiento
          </span>
        </div>

        {renderWeeklySelectorBar(selectedDayIndex, onSelectDayIndex)}
        {renderSelectedDayDetailCard(
          selectedRoutine,
          onStartRoutineForDay,
          onInspectExerciseInCatalog
        )}
      </div>

      {/* Recent Completed Sessions History */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-8 flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100">
              Historial Reciente de Sesiones Completadas
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 sm:mt-1">
              Almacenado localmente en tu navegador (solo métricas numéricas)
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Total: {appData.completedSessions.length} registros
          </span>
        </div>
        {appData.completedSessions.length === 0 ? (
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-6 text-center text-sm text-slate-400">
            Aún no has registrado sesiones completadas. ¡Inicia el entrenamiento de hoy para sumar tu primera racha!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appData.completedSessions.slice(0, 6).map((session) => (
              <div
                key={session.id}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    {session.dayName} · {session.focusTitle}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {session.dateIso}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                  <span>
                    <strong className="text-slate-100">{session.totalSetsCompleted}</strong> series
                  </span>
                  <span>
                    <strong className="text-slate-100">{session.totalRepsCompleted}</strong> reps
                  </span>
                  <span>
                    <strong className="text-slate-100">
                      {formatSecondsToMinutesLabel(session.durationSeconds)}
                    </strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
