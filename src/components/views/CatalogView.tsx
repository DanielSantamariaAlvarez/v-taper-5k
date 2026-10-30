import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Dumbbell,
  Play,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ExerciseDefinition, ExerciseId } from '../../types/workout';
import { EXERCISES_CATALOG, getExerciseById } from '../../data/exercisesCatalog';
import { ExerciseAnimationSVG } from '../svg/ExerciseAnimationSVG';
import { AnatomyMuscleMapSVG } from '../svg/AnatomyMuscleMapSVG';

export interface CatalogViewProps {
  selectedExerciseId: ExerciseId;
  onSelectExerciseId: (exerciseId: ExerciseId) => void;
  onPracticeExerciseLive: (exerciseId: ExerciseId) => void;
}

type PostureFilter = 'all' | 'floor' | 'seated';

// Filters the 10 bilateral exercises according to posture category
export function filterCatalogExercises(
  exercises: ExerciseDefinition[],
  filter: PostureFilter
): ExerciseDefinition[] {
  if (filter === 'floor') {
    return exercises.filter(
      (e) => e.postureType === 'floor_supine' || e.postureType === 'floor_legs_chair'
    );
  }
  if (filter === 'seated') {
    return exercises.filter(
      (e) => e.postureType === 'seated_upright' || e.postureType === 'seated_hinged'
    );
  }
  return exercises;
}

// Technical Exercise Catalog View with interactive biomechanics and muscle map
export const CatalogView: React.FC<CatalogViewProps> = ({
  selectedExerciseId,
  onSelectExerciseId,
  onPracticeExerciseLive,
}) => {
  const [postureFilter, setPostureFilter] = useState<PostureFilter>('all');

  const filteredList = filterCatalogExercises(EXERCISES_CATALOG, postureFilter);
  const currentExercise = getExerciseById(selectedExerciseId);

  return (
    <div className="flex flex-col gap-5 sm:gap-8">
      {/* Top Header & Filter Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-400">
            10 Ejercicios Bilaterales · 2 × 5 kg · Cero Impacto
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mt-1">
            Catálogo Técnico y Mapa Anatómico
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Ambos brazos simultáneamente sentado o en suelo para proteger el menisco al 100%.
          </p>
        </div>

        <div className="grid grid-cols-3 sm:flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setPostureFilter('all')}
            className={`px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold transition-all text-center ${
              postureFilter === 'all'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Todos (10)
          </button>
          <button
            type="button"
            onClick={() => setPostureFilter('floor')}
            className={`px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold transition-all text-center ${
              postureFilter === 'floor'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            En Suelo (5)
          </button>
          <button
            type="button"
            onClick={() => setPostureFilter('seated')}
            className={`px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold transition-all text-center ${
              postureFilter === 'seated'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Sentado (5)
          </button>
        </div>
      </div>

      {/* Master-Detail Grid (Horizontal pill selector on mobile, 4/8 split on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
        {/* Left Column: Exercise Selector (Horizontal scroll strip on mobile, vertical list on desktop) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col gap-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Selecciona un Ejercicio ({filteredList.length})
          </div>

          <div className="flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 -mx-1 px-1 snap-x">
            {filteredList.map((exercise) => {
              const isSelected = exercise.id === currentExercise.id;
              return (
                <button
                  key={exercise.id}
                  type="button"
                  onClick={() => onSelectExerciseId(exercise.id)}
                  className={`snap-start shrink-0 w-56 sm:w-64 lg:w-full text-left p-3 sm:p-4 rounded-xl border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/70 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  <span
                    className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold shrink-0 ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {exercise.code}
                  </span>

                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                      {exercise.name}
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-400 truncate">
                      {exercise.subtitle}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-emerald-400/90 font-medium truncate">
                      {exercise.primaryMusclesLabel}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Biomechanics & Muscle Map (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-8 flex flex-col gap-6 sm:gap-8">
          {/* Exercise Title & Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 sm:pb-6">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-mono text-xs font-extrabold">
                  {currentExercise.code}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
                  {currentExercise.dumbbellLoadLabel}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-500/30 text-xs font-semibold">
                  {currentExercise.postureLabel}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-100 mt-0.5">
                {currentExercise.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentExercise.description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onPracticeExerciseLive(currentExercise.id)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 transition-all shadow-lg shadow-emerald-500/15"
            >
              <Play className="w-4 h-4 fill-current" />
              Entrenar este Ejercicio
            </button>
          </div>

          {/* Side-by-Side Vector Animation & Anatomy Muscle Map */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Simulación en Tiempo Real (Ciclo 1s / 3s)
                </span>
              </div>

              <ExerciseAnimationSVG
                exerciseId={currentExercise.id}
                autoAnimate={true}
              />

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex items-center gap-3 text-xs text-slate-300">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong className="text-slate-100">Cadencia obligatoria: </strong>
                  {currentExercise.tempoNote}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Activación Anatómica (Frontal y Posterior)
              </span>
              <AnatomyMuscleMapSVG
                primaryMuscles={currentExercise.primaryMuscles}
                secondaryMuscles={currentExercise.secondaryMuscles}
                compact={true}
              />
            </div>
          </div>

          {/* Execution Steps & Meniscus Protection Box */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 border-t border-slate-800">
            <div className="md:col-span-7 flex flex-col gap-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Técnica Paso a Paso
              </h4>
              <div className="flex flex-col gap-3">
                {currentExercise.executionSteps.map((step, index) => (
                  <div
                    key={index}
                    className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-200 leading-relaxed">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-5 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-6 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  Garantía de Protección de Menisco
                </div>
                <p className="text-xs text-slate-200 leading-relaxed mt-1">
                  {currentExercise.meniscusSafetyNote}
                </p>
              </div>

              <div className="pt-3 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-emerald-300 font-mono">
                <span>CARGA: 2 × 5 KG</span>
                <span>TENSIÓN: 100% TORSO</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
