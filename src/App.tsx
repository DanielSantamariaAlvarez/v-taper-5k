import React, { useState } from 'react';
import {
  BookOpen,
  Camera,
  Dumbbell,
  LayoutDashboard,
  ShieldCheck,
  Timer,
} from 'lucide-react';
import {
  AppTabId,
  BodyMeasurementRecord,
  ExerciseId,
  PersistedAppData,
} from './types/workout';
import { getCurrentDayIndexMondayFirst } from './data/weeklyPlan';
import {
  addBodyMeasurementRecord,
  deleteBodyMeasurementRecord,
  exportNumericalDataToJsonFile,
  loadPersistedAppData,
  parseAndValidateImportedJson,
  recordCompletedWorkoutSession,
} from './services/storageService';
import { DashboardView } from './components/views/DashboardView';
import { ActiveWorkoutView } from './components/views/ActiveWorkoutView';
import { CatalogView } from './components/views/CatalogView';
import { ProgressView } from './components/views/ProgressView';

// Renders the main desktop navigation header with 4 tabs
export function renderTopDesktopNavbar(
  activeTab: AppTabId,
  onSelectTab: (tab: AppTabId) => void
): React.ReactNode {
  const navItems: Array<{
    id: AppTabId;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard Semanal',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'workout',
      label: 'Entrenamiento Activo',
      icon: <Timer className="w-4 h-4" />,
    },
    {
      id: 'catalog',
      label: 'Catálogo Técnico (10)',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'progress',
      label: 'Progreso y Transformación',
      icon: <Camera className="w-4 h-4" />,
    },
  ];

  return (
    <header className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      {/* Brand Identity */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-950/50">
          <Dumbbell className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-slate-100">
              V-TAPER <span className="text-emerald-400">5K</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Menisco Cero
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Hipertrofia Metabólica de Torso y Abdomen en Casa · Ritmo 1s / 3s / 20s
          </p>
        </div>
      </div>

      {/* Main View Switcher Tabs */}
      <nav
        aria-label="Navegación principal"
        className="flex flex-wrap items-center gap-2.5"
      >
        {navItems.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-950/70 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-slate-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}

// Root Application Component
export function App(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<AppTabId>('dashboard');
  const [appData, setAppData] = useState<PersistedAppData>(() =>
    loadPersistedAppData()
  );
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(() =>
    getCurrentDayIndexMondayFirst()
  );
  const [selectedCatalogExerciseId, setSelectedCatalogExerciseId] =
    useState<ExerciseId>('E1');
  const [overrideWorkoutExerciseId, setOverrideWorkoutExerciseId] =
    useState<ExerciseId | null>(null);
  const [autoStartRoutineOnOpen, setAutoStartRoutineOnOpen] =
    useState<boolean>(false);
  const [notificationBanner, setNotificationBanner] = useState<string | null>(
    null
  );

  // Shows a transient notification message in the top bar
  const showTransientBanner = (message: string) => {
    setNotificationBanner(message);
    window.setTimeout(() => {
      setNotificationBanner((current) => (current === message ? null : current));
    }, 4500);
  };

  // Handler to launch active workout modal for a specific day of the week with 10s initial preparation
  const handleStartRoutineForDay = (dayIndex: number) => {
    setSelectedDayIndex(dayIndex);
    setOverrideWorkoutExerciseId(null);
    setAutoStartRoutineOnOpen(true);
    setActiveTab('workout');
  };

  // Handler to inspect an exercise in the Technical Catalog
  const handleInspectExerciseInCatalog = (exerciseId: ExerciseId) => {
    setSelectedCatalogExerciseId(exerciseId);
    setActiveTab('catalog');
  };

  // Handler to jump from Catalog into Active Workout modal for a specific exercise with 10s initial preparation
  const handlePracticeExerciseLive = (exerciseId: ExerciseId) => {
    setOverrideWorkoutExerciseId(exerciseId);
    setAutoStartRoutineOnOpen(true);
    setActiveTab('workout');
  };

  // Handler when a workout session finishes
  const handleSessionCompleted = (sessionPayload: {
    dayId: string;
    dayName: string;
    focusTitle: string;
    totalSetsCompleted: number;
    totalRepsCompleted: number;
    durationSeconds: number;
  }) => {
    setAppData((prev) => recordCompletedWorkoutSession(prev, sessionPayload));
    showTransientBanner(
      `¡Sesión "${sessionPayload.focusTitle}" guardada en tu historial local!`
    );
  };

  // Handler to add a new body measurement entry
  const handleAddMeasurement = (
    measurementInput: Omit<BodyMeasurementRecord, 'id'>
  ) => {
    setAppData((prev) => addBodyMeasurementRecord(prev, measurementInput));
    showTransientBanner(
      `Medidas del ${measurementInput.dateIso} registradas correctamente.`
    );
  };

  // Handler to delete a body measurement entry
  const handleDeleteMeasurement = (measurementId: string) => {
    setAppData((prev) => deleteBodyMeasurementRecord(prev, measurementId));
  };

  // Handler to export numerical data as JSON
  const handleExportJson = () => {
    exportNumericalDataToJsonFile(appData);
    showTransientBanner('Archivo JSON de respaldo numérico exportado.');
  };

  // Handler to import numerical data from JSON file
  const handleImportJsonFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || '');
        const imported = parseAndValidateImportedJson(text);
        setAppData(imported);
        showTransientBanner('Datos numéricos JSON importados con éxito.');
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : 'Error al importar el archivo JSON.';
        showTransientBanner(errorMsg);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Top Desktop Navigation Header */}
        {renderTopDesktopNavbar(activeTab, setActiveTab)}

        {/* Optional Feedback Banner */}
        {notificationBanner && (
          <div className="bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 px-6 py-4 rounded-2xl text-sm font-semibold flex items-center justify-between">
            <span>{notificationBanner}</span>
            <button
              type="button"
              onClick={() => setNotificationBanner(null)}
              className="text-xs text-emerald-400 hover:text-emerald-200 font-mono"
            >
              CERRAR
            </button>
          </div>
        )}

        {/* Active View Content with consistent breathing room */}
        <main className="flex flex-col gap-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              appData={appData}
              selectedDayIndex={selectedDayIndex}
              onSelectDayIndex={setSelectedDayIndex}
              onStartRoutineForDay={handleStartRoutineForDay}
              onInspectExerciseInCatalog={handleInspectExerciseInCatalog}
              onExportJson={handleExportJson}
              onImportJsonFile={handleImportJsonFile}
            />
          )}

          {activeTab === 'workout' && (
            <ActiveWorkoutView
              selectedDayIndex={selectedDayIndex}
              overrideExerciseId={overrideWorkoutExerciseId}
              autoStartRoutine={autoStartRoutineOnOpen}
              onConsumeAutoStart={() => setAutoStartRoutineOnOpen(false)}
              onCloseModal={() => {
                setAutoStartRoutineOnOpen(false);
                setOverrideWorkoutExerciseId(null);
                setActiveTab('dashboard');
              }}
              onSessionCompleted={handleSessionCompleted}
            />
          )}

          {activeTab === 'catalog' && (
            <CatalogView
              selectedExerciseId={selectedCatalogExerciseId}
              onSelectExerciseId={setSelectedCatalogExerciseId}
              onPracticeExerciseLive={handlePracticeExerciseLive}
            />
          )}

          {activeTab === 'progress' && (
            <ProgressView
              appData={appData}
              onAddMeasurement={handleAddMeasurement}
              onDeleteMeasurement={handleDeleteMeasurement}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
