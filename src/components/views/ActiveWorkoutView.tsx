import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  FastForward,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  DayPrescriptionItem,
  DayRoutine,
  ExerciseId,
  WorkoutPhase,
} from '../../types/workout';
import { WEEKLY_PLAN } from '../../data/weeklyPlan';
import { getExerciseById } from '../../data/exercisesCatalog';
import {
  ensureAudioContextResumed,
  playConcentricBeep,
  playEccentricBeep,
  playPreparationCountdownBeep,
  playPreparationStartCue,
  playRestStartBell,
  playRestWarningBeep,
  playWorkoutCompleteChime,
} from '../../services/soundSynthesizer';
import { ExerciseAnimationSVG } from '../svg/ExerciseAnimationSVG';
import { AnatomyMuscleMapSVG } from '../svg/AnatomyMuscleMapSVG';

// Duration of the initial positioning countdown (10 seconds, ONLY before the 1st exercise)
const INITIAL_PREPARE_DURATION_MS = 10000;

export interface ActiveWorkoutViewProps {
  selectedDayIndex: number;
  overrideExerciseId: ExerciseId | null;
  autoStartRoutine?: boolean;
  onConsumeAutoStart?: () => void;
  onCloseModal: () => void;
  onSessionCompleted: (sessionPayload: {
    dayId: string;
    dayName: string;
    focusTitle: string;
    totalSetsCompleted: number;
    totalRepsCompleted: number;
    durationSeconds: number;
  }) => void;
}

// Builds a fallback active routine if the user selected Sunday (rest day) or a single catalog exercise
export function resolveActiveRoutine(
  selectedDayIndex: number,
  overrideExerciseId: ExerciseId | null
): DayRoutine {
  if (overrideExerciseId) {
    const ex = getExerciseById(overrideExerciseId);
    return {
      dayIndex: selectedDayIndex,
      dayId: `practica-${ex.id.toLowerCase()}`,
      dayName: 'Práctica Técnica',
      focusTitle: `${ex.code}: ${ex.name}`,
      subtitle: ex.subtitle,
      isRestDay: false,
      estimatedMinutes: '5 min',
      exercises: [{ exerciseId: ex.id, sets: 4, reps: 12, restSeconds: 20 }],
    };
  }

  const chosen = WEEKLY_PLAN[selectedDayIndex];
  if (!chosen || chosen.isRestDay) {
    return WEEKLY_PLAN[0];
  }
  return chosen;
}

// Determines the next exercise and set number for the 20s rest preview
export function resolveNextSetPreviewInfo(
  exercises: DayPrescriptionItem[],
  currentExerciseIdx: number,
  currentSetNumber: number
): {
  nextExerciseId: ExerciseId;
  nextSetNumber: number;
  nextTotalSets: number;
  nextReps: number;
  isNewExercise: boolean;
} {
  const currentItem = exercises[currentExerciseIdx] || exercises[0];
  if (currentSetNumber < currentItem.sets) {
    return {
      nextExerciseId: currentItem.exerciseId,
      nextSetNumber: currentSetNumber + 1,
      nextTotalSets: currentItem.sets,
      nextReps: currentItem.reps,
      isNewExercise: false,
    };
  }

  const nextItem = exercises[currentExerciseIdx + 1] || currentItem;
  return {
    nextExerciseId: nextItem.exerciseId,
    nextSetNumber: 1,
    nextTotalSets: nextItem.sets,
    nextReps: nextItem.reps,
    isNewExercise: true,
  };
}

// Distraction-free, zero-scroll Full-Viewport Modal for Active Workout
// Displays ONLY: Timer & Controls, Current Exercise Animation, Next Exercises Queue, and Worked Muscles.
// Includes a 10-second preparation countdown EXCLUSIVELY for the first exercise of the routine.
export const ActiveWorkoutView: React.FC<ActiveWorkoutViewProps> = ({
  selectedDayIndex,
  overrideExerciseId,
  autoStartRoutine = false,
  onConsumeAutoStart,
  onCloseModal,
  onSessionCompleted,
}) => {
  const activeRoutine = resolveActiveRoutine(selectedDayIndex, overrideExerciseId);
  const exercisesQueue = activeRoutine.exercises;

  const [currentExerciseIdx, setCurrentExerciseIdx] = useState<number>(0);
  const [currentSetNumber, setCurrentSetNumber] = useState<number>(1);
  const [currentRepNumber, setCurrentRepNumber] = useState<number>(1);
  const [phase, setPhase] = useState<WorkoutPhase>('idle');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Sub-second tracking for smooth SVG animation and exact 10s prep / 1s concentric / 3s eccentric / 20s rest
  const [prepareRemainingMs, setPrepareRemainingMs] = useState<number>(
    INITIAL_PREPARE_DURATION_MS
  );
  const [repElapsedMs, setRepElapsedMs] = useState<number>(0);
  const [restRemainingMs, setRestRemainingMs] = useState<number>(20000);
  const [completedSetsCounter, setCompletedSetsCounter] = useState<number>(0);
  const [completedRepsCounter, setCompletedRepsCounter] = useState<number>(0);
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState<number>(0);

  const lastBeepKeyRef = useRef<string>('');

  const currentPrescription: DayPrescriptionItem =
    exercisesQueue[currentExerciseIdx] || exercisesQueue[0];
  const currentExercise = getExerciseById(currentPrescription.exerciseId);

  // Launches the 10-second preparation phase if at the very first exercise (Ex 1, Set 1), otherwise starts concentric
  const startFromIdleWithFirstExercisePrep = async (
    exerciseIdx: number,
    setNum: number
  ) => {
    await ensureAudioContextResumed();
    const isVeryFirstExerciseAndSet = exerciseIdx === 0 && setNum === 1;

    if (isVeryFirstExerciseAndSet) {
      setPhase('prepare');
      setPrepareRemainingMs(INITIAL_PREPARE_DURATION_MS);
      setRepElapsedMs(0);
      setIsRunning(true);
      lastBeepKeyRef.current = 'prep-10';
      playPreparationStartCue(isMuted);
    } else {
      setPhase('concentric');
      setRepElapsedMs(0);
      setIsRunning(true);
      lastBeepKeyRef.current = 'rep-1-sec-0';
      playConcentricBeep(isMuted);
    }
  };

  // Reset workout state when routine changes and optionally auto-start the 10s preparation
  useEffect(() => {
    setCurrentExerciseIdx(0);
    setCurrentSetNumber(1);
    setCurrentRepNumber(1);
    setRepElapsedMs(0);
    setRestRemainingMs(20000);
    setCompletedSetsCounter(0);
    setCompletedRepsCounter(0);
    setSessionElapsedSeconds(0);
    lastBeepKeyRef.current = '';

    if (autoStartRoutine) {
      setPhase('prepare');
      setPrepareRemainingMs(INITIAL_PREPARE_DURATION_MS);
      setIsRunning(true);
      lastBeepKeyRef.current = 'prep-10';
      void ensureAudioContextResumed().then(() => {
        playPreparationStartCue(isMuted);
      });
      if (onConsumeAutoStart) {
        onConsumeAutoStart();
      }
    } else {
      setPhase('idle');
      setPrepareRemainingMs(INITIAL_PREPARE_DURATION_MS);
      setIsRunning(false);
    }
  }, [selectedDayIndex, overrideExerciseId]);

  // Allow Escape key to close the workout modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCloseModal]);

  // Starts or resumes the active timer
  const handleStartOrResume = async () => {
    await ensureAudioContextResumed();

    if (phase === 'idle' || phase === 'completed') {
      if (phase === 'completed') {
        setCurrentExerciseIdx(0);
        setCurrentSetNumber(1);
        setCurrentRepNumber(1);
        setCompletedSetsCounter(0);
        setCompletedRepsCounter(0);
        setSessionElapsedSeconds(0);
        await startFromIdleWithFirstExercisePrep(0, 1);
        return;
      }
      await startFromIdleWithFirstExercisePrep(
        currentExerciseIdx,
        currentSetNumber
      );
      return;
    }

    setIsRunning(true);
  };

  // Toggles pause/resume state
  const handleTogglePause = async () => {
    if (!isRunning) {
      await handleStartOrResume();
    } else {
      setIsRunning(false);
    }
  };

  // Restarts the current set from repetition 1 (if it is Exercise 1 Set 1, restarts or jumps directly to rep 1)
  const handleRestartCurrentSet = async () => {
    await ensureAudioContextResumed();
    setCurrentRepNumber(1);
    setRepElapsedMs(0);
    setPhase('concentric');
    setIsRunning(true);
    lastBeepKeyRef.current = 'rep-1-sec-0';
    playConcentricBeep(isMuted);
  };

  // Advances from 10s preparation, 20s rest, or current set immediately
  const handleSkipPhaseOrAdvanceSet = async () => {
    await ensureAudioContextResumed();

    // If currently in the 10-second initial preparation phase, skip straight to Exercise 1 Rep 1
    if (phase === 'prepare') {
      setCurrentRepNumber(1);
      setRepElapsedMs(0);
      setPhase('concentric');
      setIsRunning(true);
      lastBeepKeyRef.current = 'rep-1-sec-0';
      playConcentricBeep(isMuted);
      return;
    }

    if (phase === 'rest') {
      // Transition from rest into the scheduled next set/exercise (NO 10s prep on subsequent sets/exercises)
      if (currentSetNumber < currentPrescription.sets) {
        setCurrentSetNumber((prev) => prev + 1);
      } else if (currentExerciseIdx + 1 < exercisesQueue.length) {
        setCurrentExerciseIdx((prev) => prev + 1);
        setCurrentSetNumber(1);
      } else {
        handleFinishEntireSession();
        return;
      }

      setCurrentRepNumber(1);
      setRepElapsedMs(0);
      setPhase('concentric');
      setIsRunning(true);
      lastBeepKeyRef.current = 'rep-1-sec-0';
      playConcentricBeep(isMuted);
      return;
    }

    // If user clicks skip while working a set, mark current set complete and enter 20s rest
    const addedReps = currentPrescription.reps;
    const newSetsTotal = completedSetsCounter + 1;
    const newRepsTotal = completedRepsCounter + addedReps;
    setCompletedSetsCounter(newSetsTotal);
    setCompletedRepsCounter(newRepsTotal);

    const isLastSetOfLastExercise =
      currentExerciseIdx === exercisesQueue.length - 1 &&
      currentSetNumber >= currentPrescription.sets;

    if (isLastSetOfLastExercise) {
      handleFinishEntireSession(newSetsTotal, newRepsTotal);
    } else {
      setPhase('rest');
      setRestRemainingMs(currentPrescription.restSeconds * 1000);
      lastBeepKeyRef.current = 'rest-start';
      playRestStartBell(isMuted);
    }
  };

  // Completes the entire workout session and saves to localStorage
  const handleFinishEntireSession = (
    overrideSets?: number,
    overrideReps?: number
  ) => {
    setIsRunning(false);
    setPhase('completed');
    playWorkoutCompleteChime(isMuted);

    const finalSets =
      typeof overrideSets === 'number'
        ? overrideSets
        : Math.max(1, completedSetsCounter);
    const finalReps =
      typeof overrideReps === 'number'
        ? overrideReps
        : Math.max(currentPrescription.reps, completedRepsCounter);

    onSessionCompleted({
      dayId: activeRoutine.dayId,
      dayName: activeRoutine.dayName,
      focusTitle: activeRoutine.focusTitle,
      totalSetsCompleted: finalSets,
      totalRepsCompleted: finalReps,
      durationSeconds: Math.max(60, sessionElapsedSeconds),
    });
  };

  // High-precision 50ms interval engine driving:
  // - 10s Initial Preparation (ONLY for Exercise 1, Set 1)
  // - 1s Concentric / 3s Eccentric repetitions
  // - 20s Rest between sets
  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const TICK_MS = 50;
    const timerId = window.setInterval(() => {
      setSessionElapsedSeconds((prev) => prev + TICK_MS / 1000);

      if (phase === 'prepare') {
        setPrepareRemainingMs((prevPrepMs) => {
          const nextPrepMs = prevPrepMs - TICK_MS;
          const ceilSec = Math.ceil(nextPrepMs / 1000);

          if (ceilSec >= 1 && ceilSec <= 9) {
            const prepKey = `prep-${ceilSec}`;
            if (lastBeepKeyRef.current !== prepKey) {
              lastBeepKeyRef.current = prepKey;
              playPreparationCountdownBeep(isMuted, ceilSec);
            }
          }

          if (nextPrepMs <= 0) {
            // 10s preparation finished -> start Exercise 1, Set 1, Rep 1 concentric phase
            setCurrentRepNumber(1);
            setRepElapsedMs(0);
            setPhase('concentric');
            lastBeepKeyRef.current = 'rep-1-sec-0';
            playConcentricBeep(isMuted);
            return INITIAL_PREPARE_DURATION_MS;
          }

          return nextPrepMs;
        });
      } else if (phase === 'concentric' || phase === 'eccentric') {
        setRepElapsedMs((prevMs) => {
          const nextMs = prevMs + TICK_MS;

          if (nextMs < 1000) {
            // Second 1: Concentric Phase (0..1000ms) -> "¡SUBE Y APRIETA! - 1s"
            if (phase !== 'concentric') {
              setPhase('concentric');
            }
            const beepKey = `rep-${currentRepNumber}-sec-0`;
            if (lastBeepKeyRef.current !== beepKey) {
              lastBeepKeyRef.current = beepKey;
              playConcentricBeep(isMuted);
            }
            return nextMs;
          }

          if (nextMs < 4000) {
            // Seconds 2, 3, 4: Eccentric Phase (1000..4000ms) -> "BAJA LENTO: 3... 2... 1..."
            if (phase !== 'eccentric') {
              setPhase('eccentric');
            }
            const eccentricSecIndex = Math.floor((nextMs - 1000) / 1000); // 0, 1, or 2
            const beepKey = `rep-${currentRepNumber}-ecc-${eccentricSecIndex}`;
            if (lastBeepKeyRef.current !== beepKey) {
              lastBeepKeyRef.current = beepKey;
              playEccentricBeep(isMuted);
            }
            return nextMs;
          }

          // Completed one full 4-second repetition
          if (currentRepNumber < currentPrescription.reps) {
            const nextRep = currentRepNumber + 1;
            setCurrentRepNumber(nextRep);
            setPhase('concentric');
            const beepKey = `rep-${nextRep}-sec-0`;
            lastBeepKeyRef.current = beepKey;
            playConcentricBeep(isMuted);
            return 0;
          }

          // Completed all repetitions in the current set
          const newSets = completedSetsCounter + 1;
          const newReps = completedRepsCounter + currentPrescription.reps;
          setCompletedSetsCounter(newSets);
          setCompletedRepsCounter(newReps);

          const isFinalSetOfSession =
            currentExerciseIdx === exercisesQueue.length - 1 &&
            currentSetNumber >= currentPrescription.sets;

          if (isFinalSetOfSession) {
            handleFinishEntireSession(newSets, newReps);
            return 0;
          }

          // Enter 20-second Rest Phase
          setPhase('rest');
          setRestRemainingMs(currentPrescription.restSeconds * 1000);
          lastBeepKeyRef.current = 'rest-start';
          playRestStartBell(isMuted);
          return 0;
        });
      } else if (phase === 'rest') {
        setRestRemainingMs((prevRestMs) => {
          const nextRestMs = prevRestMs - TICK_MS;
          const ceilSec = Math.ceil(nextRestMs / 1000);

          if (ceilSec <= 3 && ceilSec >= 1) {
            const warnKey = `rest-warn-${ceilSec}`;
            if (lastBeepKeyRef.current !== warnKey) {
              lastBeepKeyRef.current = warnKey;
              playRestWarningBeep(isMuted, ceilSec);
            }
          }

          if (nextRestMs <= 0) {
            // Rest finished -> automatically start the next set or exercise (no 10s prep here)
            if (currentSetNumber < currentPrescription.sets) {
              setCurrentSetNumber((s) => s + 1);
            } else if (currentExerciseIdx + 1 < exercisesQueue.length) {
              setCurrentExerciseIdx((e) => e + 1);
              setCurrentSetNumber(1);
            }
            setCurrentRepNumber(1);
            setRepElapsedMs(0);
            setPhase('concentric');
            lastBeepKeyRef.current = 'rep-1-sec-0';
            playConcentricBeep(isMuted);
            return 20000;
          }

          return nextRestMs;
        });
      }
    }, TICK_MS);

    return () => window.clearInterval(timerId);
  }, [
    isRunning,
    phase,
    currentRepNumber,
    currentSetNumber,
    currentExerciseIdx,
    currentPrescription,
    exercisesQueue.length,
    isMuted,
    completedSetsCounter,
    completedRepsCounter,
  ]);

  // Compute smooth normalized contraction (0..1) for ExerciseAnimationSVG
  const currentContractionProgress =
    phase === 'concentric'
      ? Math.min(1, repElapsedMs / 1000)
      : phase === 'eccentric'
      ? Math.max(0, 1 - (repElapsedMs - 1000) / 3000)
      : 0.35;

  // Preparation countdown (10..1) for the first exercise
  const prepareSecondsRemaining = Math.max(
    0,
    Math.ceil(prepareRemainingMs / 1000)
  );
  const prepareBarPercent = Math.max(
    0,
    Math.min(100, (prepareRemainingMs / INITIAL_PREPARE_DURATION_MS) * 100)
  );

  // Eccentric countdown number: 3, 2, or 1
  const eccentricCountdownNumber =
    phase === 'eccentric'
      ? Math.max(1, 3 - Math.floor((repElapsedMs - 1000) / 1000))
      : 3;

  // Eccentric progress percentage (100% -> 0% over 3 seconds)
  const eccentricBarPercent =
    phase === 'eccentric'
      ? Math.max(0, Math.min(100, ((4000 - repElapsedMs) / 3000) * 100))
      : 100;

  // Rest countdown in whole seconds (20..1)
  const restSecondsRemaining = Math.max(0, Math.ceil(restRemainingMs / 1000));
  const restBarPercent = Math.max(
    0,
    Math.min(
      100,
      (restRemainingMs / (currentPrescription.restSeconds * 1000)) * 100
    )
  );

  const nextPreview = resolveNextSetPreviewInfo(
    exercisesQueue,
    currentExerciseIdx,
    currentSetNumber
  );
  const nextPreviewExercise = getExerciseById(nextPreview.nextExerciseId);

  // During 20s rest, display the upcoming exercise's animation and muscles so the user knows what is coming next
  const displayedExercise =
    phase === 'rest' ? nextPreviewExercise : currentExercise;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Modo concentración de entrenamiento: ${activeRoutine.focusTitle}`}
      className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-md text-slate-100 flex flex-col overflow-y-auto lg:overflow-hidden"
    >
      <div className="max-w-7xl w-full h-full mx-auto px-6 py-5 flex flex-col gap-5 min-h-0">
        {/* Compact Modal Header: Routine Title, Current Exercise & Close Modal Button */}
        <header className="bg-slate-900/90 border border-slate-800 rounded-2xl px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-mono text-sm font-black shrink-0">
              {currentExercise.code}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  {activeRoutine.dayName} · {activeRoutine.focusTitle}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-[11px] font-mono text-slate-400">
                  {currentExercise.postureLabel} ({currentExercise.dumbbellLoadLabel})
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 truncate">
                {currentExercise.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-1.5 text-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Serie Actual
              </span>
              <span className="text-base font-mono font-extrabold text-slate-100">
                {currentSetNumber}{' '}
                <span className="text-slate-500 text-xs">
                  / {currentPrescription.sets}
                </span>
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-1.5 text-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Repetición
              </span>
              <span className="text-base font-mono font-extrabold text-emerald-400">
                {currentRepNumber}{' '}
                <span className="text-slate-500 text-xs">
                  / {currentPrescription.reps}
                </span>
              </span>
            </div>

            <button
              type="button"
              onClick={onCloseModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
              title="Salir del modo entrenamiento (Esc)"
            >
              <X className="w-4 h-4" />
              <span>Salir</span>
            </button>
          </div>
        </header>

        {/* Main Zero-Scroll 12-Column Modal Grid */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT 7 COLUMNS: 1. Temporizador & Controles + 2. Animación Centrada del Ejercicio */}
          <div className="lg:col-span-7 flex flex-col gap-6 min-h-0">
            {/* 1. TEMPORIZADOR Y FASE ACTIVA */}
            <div
              className={`rounded-2xl p-6 border-2 transition-colors flex flex-col justify-between gap-4 shrink-0 ${
                phase === 'concentric'
                  ? 'bg-emerald-950/35 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.18)]'
                  : phase === 'eccentric'
                  ? 'bg-amber-950/35 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.18)]'
                  : phase === 'prepare' || phase === 'rest'
                  ? 'bg-sky-950/35 border-sky-500 shadow-[0_0_30px_rgba(14,165,233,0.18)]'
                  : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              {/* Phase Specific Display */}
              {phase === 'prepare' && (
                <div className="flex flex-col items-center text-center gap-2.5">
                  <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[11px] font-bold uppercase tracking-widest">
                    Preparación Inicial (Solo 1.er Ejercicio) · Ubícate con tus Mancuernas
                  </span>
                  <div className="text-3xl sm:text-4xl font-black tracking-tight text-sky-400 font-mono">
                    ¡PREPÁRATE EN POSICIÓN! — {prepareSecondsRemaining}s
                  </div>
                  <p className="text-xs text-slate-200">
                    Colócate{' '}
                    <strong className="text-emerald-400">
                      {currentExercise.postureLabel.toLowerCase()}
                    </strong>{' '}
                    y toma tus mancuernas ({currentExercise.dumbbellLoadLabel}).
                  </p>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-sky-500/40">
                    <div
                      className="h-full bg-sky-500 transition-all duration-75"
                      style={{ width: `${prepareBarPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {phase === 'concentric' && (
                <div className="flex flex-col items-center text-center gap-2.5">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold uppercase tracking-widest">
                    Fase Concéntrica · Beep Agudo 880 Hz
                  </span>
                  <div className="text-3xl sm:text-4xl font-black tracking-tight text-emerald-400">
                    ¡SUBE Y APRIETA! - 1s
                  </div>
                  <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-emerald-500/40">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-75"
                      style={{
                        width: `${Math.min(100, (repElapsedMs / 1000) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {phase === 'eccentric' && (
                <div className="flex flex-col items-center text-center gap-2.5">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold uppercase tracking-widest">
                    Fase Excéntrica · 3 Beeps Graves 440 Hz
                  </span>
                  <div className="text-3xl sm:text-4xl font-black tracking-tight text-amber-400">
                    BAJA LENTO:{' '}
                    <span
                      className={
                        eccentricCountdownNumber === 3
                          ? 'text-white underline'
                          : 'opacity-45'
                      }
                    >
                      3...
                    </span>{' '}
                    <span
                      className={
                        eccentricCountdownNumber === 2
                          ? 'text-white underline'
                          : 'opacity-45'
                      }
                    >
                      2...
                    </span>{' '}
                    <span
                      className={
                        eccentricCountdownNumber === 1
                          ? 'text-white underline'
                          : 'opacity-45'
                      }
                    >
                      1...
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-amber-500/40">
                    <div
                      className="h-full bg-amber-500 transition-all duration-75"
                      style={{ width: `${eccentricBarPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {phase === 'rest' && (
                <div className="flex flex-col items-center text-center gap-2.5">
                  <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[11px] font-bold uppercase tracking-widest">
                    Descanso Entre Series · Siguiente:{' '}
                    {nextPreviewExercise.code} ({nextPreviewExercise.name}) — Serie{' '}
                    {nextPreview.nextSetNumber}/{nextPreview.nextTotalSets}
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-sky-400 font-mono">
                    DESCANSO: {restSecondsRemaining}s
                  </div>
                  <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-sky-500/40">
                    <div
                      className="h-full bg-sky-500 transition-all duration-75"
                      style={{ width: `${restBarPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {phase === 'idle' && (
                <div className="flex flex-col items-center text-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
                    {currentExerciseIdx === 0 && currentSetNumber === 1
                      ? 'Incluye 10s iniciales para ubicarte y tomar las mancuernas'
                      : `Listo para Serie ${currentSetNumber} (${currentPrescription.reps} reps)`}
                  </span>
                  <div className="text-2xl font-bold text-slate-100">
                    {currentExerciseIdx === 0 && currentSetNumber === 1
                      ? 'Pulsa "Iniciar Rutina (10s Prep)" para comenzar'
                      : 'Pulsa "Iniciar Serie" para activar el metrónomo 1s / 3s'}
                  </div>
                </div>
              )}

              {phase === 'completed' && (
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="flex items-center gap-2 text-2xl font-black text-emerald-400">
                    <CheckCircle2 className="w-7 h-7" />
                    <span>¡RUTINA COMPLETADA Y GUARDADA!</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {completedSetsCounter} series y {completedRepsCounter}{' '}
                    repeticiones registradas en tu historial.
                  </p>
                </div>
              )}

              {/* Live Action Controls Row */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-800/80">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => void handleTogglePause()}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                      isRunning
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                    }`}
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-4 h-4 fill-current" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        {phase === 'idle' || phase === 'completed'
                          ? currentExerciseIdx === 0 && currentSetNumber === 1
                            ? 'Iniciar Rutina (10s Prep)'
                            : 'Iniciar Serie'
                          : 'Reanudar'}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleRestartCurrentSet()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
                    Reiniciar Serie
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleSkipPhaseOrAdvanceSet()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-semibold transition-colors"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                    {phase === 'prepare'
                      ? 'Saltar Preparación (10s)'
                      : phase === 'rest'
                      ? 'Saltar Descanso (20s)'
                      : 'Completar / Saltar Serie'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMuted((m) => !m)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                      isMuted
                        ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                        : 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700'
                    }`}
                  >
                    {isMuted ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        Silenciado
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        Audio
                      </>
                    )}
                  </button>

                  {phase !== 'completed' && (
                    <button
                      type="button"
                      onClick={() => handleFinishEntireSession()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors"
                      title="Terminar y guardar sesión"
                    >
                      <FastForward className="w-3.5 h-3.5" />
                      Guardar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 2. EL EJERCICIO Y SU ANIMACIÓN VECTORIAL CENTRADA (SIN SCROLL) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex-1 min-h-0 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between gap-2 shrink-0">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  {phase === 'rest'
                    ? `Vista Previa Siguiente: ${displayedExercise.code} — ${displayedExercise.name}`
                    : `Ejecución Sincronizada: ${displayedExercise.code} — ${displayedExercise.name}`}
                </span>
                <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                  {displayedExercise.tempoNote}
                </span>
              </div>

              <div className="flex-1 min-h-0 flex items-center justify-center">
                <ExerciseAnimationSVG
                  exerciseId={displayedExercise.id}
                  phase={phase}
                  contractionProgress={
                    phase === 'rest' || phase === 'prepare'
                      ? undefined
                      : currentContractionProgress
                  }
                  autoAnimate={phase === 'rest' || phase === 'prepare'}
                  className="h-full max-h-full"
                />
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLUMNS: 3. Siguientes Ejercicios + 4. Músculos que se Ejercitan */}
          <div className="lg:col-span-5 flex flex-col gap-6 min-h-0">
            {/* 3. SIGUIENTES EJERCICIOS EN LA SESIÓN */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex-1 min-h-0 flex flex-col gap-3">
              <div className="flex items-center justify-between shrink-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Siguientes Ejercicios ({currentExerciseIdx + 1} de{' '}
                  {exercisesQueue.length})
                </h3>
                <span className="text-xs font-mono text-emerald-400">
                  {completedSetsCounter} series completadas
                </span>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-2">
                {exercisesQueue.map((item, idx) => {
                  const ex = getExerciseById(item.exerciseId);
                  const isCurrent = idx === currentExerciseIdx;
                  const isDone =
                    idx < currentExerciseIdx || phase === 'completed';

                  return (
                    <button
                      key={`${item.exerciseId}-${idx}`}
                      type="button"
                      onClick={() => {
                        setCurrentExerciseIdx(idx);
                        setCurrentSetNumber(1);
                        setCurrentRepNumber(1);
                        setRepElapsedMs(0);
                        setPhase('idle');
                        setIsRunning(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-emerald-500/15 border-emerald-500/70'
                          : isDone
                          ? 'bg-slate-950/40 border-emerald-500/20 opacity-75'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`px-2 py-0.5 rounded-lg font-mono text-xs font-bold shrink-0 ${
                            isCurrent
                              ? 'bg-emerald-500 text-slate-950'
                              : isDone
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {ex.code}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-100 truncate">
                            {ex.name}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {item.sets} series × {item.reps} reps ·{' '}
                            {ex.postureLabel}
                          </div>
                        </div>
                      </div>

                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        <span className="text-[10px] font-mono font-bold text-emerald-400 shrink-0">
                          ACTIVO
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                          SIGUIENTE
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. MÚSCULOS QUE SE EJERCITAN */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shrink-0 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Músculos que se Ejercitan ({displayedExercise.code})
                </h3>
                <span className="text-[11px] text-emerald-400 font-semibold truncate max-w-[220px]">
                  {displayedExercise.primaryMusclesLabel}
                </span>
              </div>
              <AnatomyMuscleMapSVG
                primaryMuscles={displayedExercise.primaryMuscles}
                secondaryMuscles={displayedExercise.secondaryMuscles}
                compact={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
