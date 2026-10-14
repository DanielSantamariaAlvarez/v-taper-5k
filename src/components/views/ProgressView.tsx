import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  FolderLock,
  FolderOpen,
  Info,
  Lock,
  PlusCircle,
  RefreshCw,
  Ruler,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  TrendingUp,
  Video,
  VideoOff,
} from 'lucide-react';
import {
  BodyMeasurementRecord,
  LocalFileSystemDirectoryHandle,
  PersistedAppData,
  VolatilePhotoItem,
} from '../../types/workout';
import { calculateVTaperRatio } from '../../services/storageService';
import { playCameraCountdownBeep } from '../../services/soundSynthesizer';

export interface ProgressViewProps {
  appData: PersistedAppData;
  onAddMeasurement: (record: Omit<BodyMeasurementRecord, 'id'>) => void;
  onDeleteMeasurement: (id: string) => void;
}

type ChartMetricKey = 'chestBackCm' | 'waistCm' | 'weightKg' | 'armCm';

const CHART_METRIC_KEYS: ChartMetricKey[] = [
  'chestBackCm',
  'waistCm',
  'weightKg',
  'armCm',
];

const CHART_METRIC_CONFIG: Record<
  ChartMetricKey,
  { label: string; unit: string; color: string }
> = {
  chestBackCm: { label: 'Pecho / Espalda', unit: 'cm', color: '#10b981' },
  waistCm: { label: 'Cintura', unit: 'cm', color: '#f59e0b' },
  weightKg: { label: 'Peso Corporal', unit: 'kg', color: '#38bdf8' },
  armCm: { label: 'Brazo Contraído', unit: 'cm', color: '#a855f7' },
};

// Extracts a YYYY-MM-DD date string from a filename matching YYYY-MM-DD_*.png/.jpg or falls back to file timestamp
export function extractChronologicalDateFromPhoto(
  fileName: string,
  fallbackLastModified: number
): { dateLabel: string; sortKey: string } {
  const regexMatch = fileName.match(/^(\d{4}-\d{2}-\d{2})/);
  if (regexMatch && regexMatch[1]) {
    return {
      dateLabel: regexMatch[1],
      sortKey: `${regexMatch[1]}_${fileName}`,
    };
  }

  const fallbackDate = new Date(fallbackLastModified || Date.now())
    .toISOString()
    .split('T')[0];
  return {
    dateLabel: fallbackDate,
    sortKey: `${fallbackDate}_${fileName}`,
  };
}

// Checks whether a filename corresponds to a supported progress image (.png, .jpg, .jpeg, .webp)
export function isSupportedProgressImageFile(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  // Prioritizes YYYY-MM-DD_*.png / .jpg while accepting standard image extensions in the connected folder
  return (
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.webp')
  );
}

// Revokes all volatile RAM ObjectURLs to guarantee zero lingering browser memory footprint
export function revokeAllVolatilePhotoUrls(photos: VolatilePhotoItem[]): void {
  for (const item of photos) {
    try {
      URL.revokeObjectURL(item.objectUrl);
    } catch {
      // Ignore already revoked URLs
    }
  }
}

// Renders the SVG line & area evolution chart for body measurements
export function renderMeasurementsEvolutionChart(
  measurements: BodyMeasurementRecord[],
  selectedMetric: ChartMetricKey
): React.ReactNode {
  const config = CHART_METRIC_CONFIG[selectedMetric];

  if (measurements.length === 0) {
    return (
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-8 text-center text-sm text-slate-400">
        Añade tu primer registro numérico para visualizar la gráfica de evolución.
      </div>
    );
  }

  const values = measurements.map((m) => Number(m[selectedMetric]));
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const spread = Math.max(2, maxVal - minVal);
  const yMin = Math.max(0, minVal - spread * 0.25);
  const yMax = maxVal + spread * 0.25;

  const width = 640;
  const height = 220;
  const padLeft = 48;
  const padRight = 28;
  const padTop = 24;
  const padBottom = 38;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const points = measurements.map((item, idx) => {
    const x =
      measurements.length === 1
        ? padLeft + plotW / 2
        : padLeft + (idx / (measurements.length - 1)) * plotW;
    const val = Number(item[selectedMetric]);
    const yRatio = (val - yMin) / (yMax - yMin || 1);
    const y = padTop + plotH - yRatio * plotH;
    return { x, y, val, dateIso: item.dateIso };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPath =
    points.length > 1
      ? `M ${points[0].x} ${padTop + plotH} L ${points
          .map((p) => `${p.x} ${p.y}`)
          .join(' L ')} L ${points[points.length - 1].x} ${padTop + plotH} Z`
      : '';

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto max-h-60 select-none"
        role="img"
        aria-label={`Gráfica de evolución de ${config.label}`}
      >
        {/* Horizontal Grid Lines */}
        {[0, 0.5, 1].map((step, i) => {
          const yPos = padTop + step * plotH;
          const labelValue = (yMax - step * (yMax - yMin)).toFixed(1);
          return (
            <g key={i}>
              <line
                x1={padLeft}
                y1={yPos}
                x2={width - padRight}
                y2={yPos}
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={padLeft - 8}
                y={yPos + 4}
                textAnchor="end"
                className="fill-slate-500 text-[10px] font-mono"
              >
                {labelValue}
              </text>
            </g>
          );
        })}

        {/* Shaded Gradient Area */}
        {areaPath && (
          <path d={areaPath} fill={config.color} opacity="0.14" />
        )}

        {/* Evolution Line */}
        {points.length > 1 && (
          <polyline
            fill="none"
            stroke={config.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylinePoints}
          />
        )}

        {/* Data Nodes & Value Labels */}
        {points.map((pt, idx) => (
          <g key={idx}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r="5"
              fill="#020617"
              stroke={config.color}
              strokeWidth="3"
            />
            <text
              x={pt.x}
              y={pt.y - 10}
              textAnchor="middle"
              className="fill-slate-200 text-[10px] font-mono font-bold"
            >
              {pt.val} {config.unit}
            </text>
            <text
              x={pt.x}
              y={height - 12}
              textAnchor="middle"
              className="fill-slate-400 text-[10px] font-mono"
            >
              {pt.dateIso.slice(5)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// Renders the semi-transparent V-Taper torso/shoulders SVG silhouette overlay on top of the live webcam
export function renderCameraVTaperSilhouetteOverlay(): React.ReactNode {
  return (
    <svg
      viewBox="0 0 400 300"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Center Alignment Crosshair */}
      <line
        x1="200"
        y1="15"
        x2="200"
        y2="285"
        stroke="#10b981"
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity="0.45"
      />
      {/* Shoulder Level Horizontal Guide */}
      <line
        x1="85"
        y1="96"
        x2="315"
        y2="96"
        stroke="#38bdf8"
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity="0.45"
      />

      {/* Head & Neck Guide Silhouette */}
      <circle
        cx="200"
        cy="52"
        r="22"
        fill="rgba(16, 185, 129, 0.06)"
        stroke="#34d399"
        strokeWidth="1.8"
        strokeDasharray="5 3"
      />

      {/* V-Taper Shoulders, Lats, and Waist Silhouette */}
      <path
        d="M 182 74 L 112 92 Q 92 98 96 128 L 116 195 M 218 74 L 288 92 Q 308 98 304 128 L 284 195"
        fill="none"
        stroke="#34d399"
        strokeWidth="2"
        strokeDasharray="6 4"
        opacity="0.75"
      />

      {/* V-Taper Torso Contour */}
      <path
        d="M 122 98 L 278 98 L 242 225 L 158 225 Z"
        fill="rgba(16, 185, 129, 0.08)"
        stroke="#10b981"
        strokeWidth="2"
      />

      {/* Waist Narrowing Markers */}
      <path
        d="M 142 225 L 158 225 M 242 225 L 258 225"
        stroke="#f59e0b"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <text
        x="200"
        y="272"
        textAnchor="middle"
        className="fill-emerald-300 text-[11px] font-bold uppercase tracking-widest"
      >
        Alinea Hombros y Cintura en la Silueta V-Taper
      </text>
    </svg>
  );
}

// Main Progress & Transformation View Component (RAM-Only Local Folder Photos + Measurements + Webcam + Before/After Slider)
export const ProgressView: React.FC<ProgressViewProps> = ({
  appData,
  onAddMeasurement,
  onDeleteMeasurement,
}) => {
  // Numerical form states
  const todayIso = new Date().toISOString().split('T')[0];
  const latestMeasurement =
    appData.measurements.length > 0
      ? appData.measurements[appData.measurements.length - 1]
      : null;

  const [dateIso, setDateIso] = useState<string>(todayIso);
  const [weightKg, setWeightKg] = useState<string>(
    latestMeasurement ? String(latestMeasurement.weightKg) : '75.0'
  );
  const [waistCm, setWaistCm] = useState<string>(
    latestMeasurement ? String(latestMeasurement.waistCm) : '81.0'
  );
  const [chestBackCm, setChestBackCm] = useState<string>(
    latestMeasurement ? String(latestMeasurement.chestBackCm) : '106.0'
  );
  const [armCm, setArmCm] = useState<string>(
    latestMeasurement ? String(latestMeasurement.armCm) : '36.0'
  );
  const [selectedMetric, setSelectedMetric] =
    useState<ChartMetricKey>('chestBackCm');

  // Volatile RAM-Only Photo Folder States (NEVER persisted to localStorage or IndexedDB)
  const [directoryHandle, setDirectoryHandle] =
    useState<LocalFileSystemDirectoryHandle | null>(null);
  const [connectedFolderName, setConnectedFolderName] = useState<string | null>(
    null
  );
  const [volatilePhotos, setVolatilePhotos] = useState<VolatilePhotoItem[]>([]);
  const [folderStatusMessage, setFolderStatusMessage] = useState<string | null>(
    null
  );

  // Before vs After interactive comparator states
  const [beforePhotoIndex, setBeforePhotoIndex] = useState<number>(0);
  const [afterPhotoIndex, setAfterPhotoIndex] = useState<number>(0);
  const [sliderPositionPercent, setSliderPositionPercent] =
    useState<number>(50);

  // Webcam & 5-second self-timer states
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [cameraCountdown, setCameraCountdown] = useState<number | null>(null);
  const [cameraStatusMessage, setCameraStatusMessage] = useState<string | null>(
    null
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fallbackDirInputRef = useRef<HTMLInputElement | null>(null);
  const volatilePhotosRef = useRef<VolatilePhotoItem[]>([]);

  // Keep ref synchronized for unmount cleanup
  useEffect(() => {
    volatilePhotosRef.current = volatilePhotos;
  }, [volatilePhotos]);

  // Guaranteed RAM cleanup and camera shutdown when component unmounts
  useEffect(() => {
    return () => {
      revokeAllVolatilePhotoUrls(volatilePhotosRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Handles submitting the rapid numerical measurement form
  const handleMeasurementSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsedWeight = parseFloat(weightKg);
    const parsedWaist = parseFloat(waistCm);
    const parsedChest = parseFloat(chestBackCm);
    const parsedArm = parseFloat(armCm);

    if (
      isNaN(parsedWeight) ||
      isNaN(parsedWaist) ||
      isNaN(parsedChest) ||
      isNaN(parsedArm)
    ) {
      return;
    }

    onAddMeasurement({
      dateIso: dateIso || todayIso,
      weightKg: parsedWeight,
      waistCm: parsedWaist,
      chestBackCm: parsedChest,
      armCm: parsedArm,
    });
  };

  // Reads all chronological progress photos from a connected FileSystemDirectoryHandle into volatile RAM
  const loadPhotosFromDirectoryHandle = async (
    handle: LocalFileSystemDirectoryHandle
  ) => {
    revokeAllVolatilePhotoUrls(volatilePhotosRef.current);

    const loadedItems: VolatilePhotoItem[] = [];
    for await (const entry of handle.values()) {
      if (entry.kind === 'file' && isSupportedProgressImageFile(entry.name)) {
        const file = await entry.getFile();
        const objectUrl = URL.createObjectURL(file);
        const { dateLabel, sortKey } = extractChronologicalDateFromPhoto(
          file.name,
          file.lastModified
        );

        loadedItems.push({
          fileName: file.name,
          dateLabel,
          sortKey,
          objectUrl,
          sizeBytes: file.size,
        });
      }
    }

    loadedItems.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    setVolatilePhotos(loadedItems);

    if (loadedItems.length > 0) {
      setBeforePhotoIndex(0);
      setAfterPhotoIndex(loadedItems.length - 1);
    }

    setFolderStatusMessage(
      `Carpeta "${handle.name}" conectada en RAM (${loadedItems.length} fotos encontradas).`
    );
  };

  // Opens macOS folder picker via File System Access API (with fallback to webkitdirectory input)
  const handleConnectLocalPhotoFolder = async () => {
    if (typeof window.showDirectoryPicker === 'function') {
      try {
        const handle = await window.showDirectoryPicker({
          id: 'vtaper5k_photos',
          mode: 'readwrite',
        });
        setDirectoryHandle(handle);
        setConnectedFolderName(handle.name);
        await loadPhotosFromDirectoryHandle(handle);
      } catch (err) {
        const isAbort = err instanceof Error && err.name === 'AbortError';
        if (!isAbort) {
          setFolderStatusMessage(
            'No se pudo abrir el selector nativo. Usando selector de carpeta alternativo...'
          );
          fallbackDirInputRef.current?.click();
        }
      }
    } else {
      fallbackDirInputRef.current?.click();
    }
  };

  // Fallback handler for <input type="file" webkitdirectory>
  const handleFallbackDirectoryInput = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) {
      return;
    }

    revokeAllVolatilePhotoUrls(volatilePhotosRef.current);
    const loadedItems: VolatilePhotoItem[] = [];
    let inferredFolderName = 'Carpeta Local Mac';

    Array.from(fileList).forEach((file) => {
      const relPath =
        'webkitRelativePath' in file &&
        typeof file.webkitRelativePath === 'string'
          ? file.webkitRelativePath
          : '';
      if (relPath && relPath.includes('/')) {
        inferredFolderName = relPath.split('/')[0];
      }

      if (isSupportedProgressImageFile(file.name)) {
        const objectUrl = URL.createObjectURL(file);
        const { dateLabel, sortKey } = extractChronologicalDateFromPhoto(
          file.name,
          file.lastModified
        );
        loadedItems.push({
          fileName: file.name,
          dateLabel,
          sortKey,
          objectUrl,
          sizeBytes: file.size,
        });
      }
    });

    loadedItems.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    setConnectedFolderName(inferredFolderName);
    setVolatilePhotos(loadedItems);
    if (loadedItems.length > 0) {
      setBeforePhotoIndex(0);
      setAfterPhotoIndex(loadedItems.length - 1);
    }
    setFolderStatusMessage(
      `Carpeta "${inferredFolderName}" cargada en memoria RAM volátil (${loadedItems.length} fotos).`
    );
    event.target.value = '';
  };

  // Immediately revokes all ObjectURLs and clears volatile memory ("Bloquear y Limpiar Memoria")
  const handleLockAndPurgeRamPhotos = () => {
    revokeAllVolatilePhotoUrls(volatilePhotos);
    setVolatilePhotos([]);
    setDirectoryHandle(null);
    setConnectedFolderName(null);
    setBeforePhotoIndex(0);
    setAfterPhotoIndex(0);
    setFolderStatusMessage(
      'Memoria RAM limpiada: todos los ObjectURLs fueron revocados y las fotos ocultadas.'
    );
  };

  // Starts or stops the webcam stream
  const handleToggleWebcam = async () => {
    if (isCameraOpen) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      setIsCameraOpen(false);
      setCameraCountdown(null);
      setCameraStatusMessage(null);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      });
      mediaStreamRef.current = stream;
      setIsCameraOpen(true);
      setCameraStatusMessage(
        'Cámara activa. Colócate a 1.5 m encuadrando tus hombros y cintura dentro de la silueta V-Taper.'
      );
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);
    } catch {
      setCameraStatusMessage(
        'No se pudo acceder a la cámara web. Verifica los permisos de cámara en macOS / navegador.'
      );
    }
  };

  // Captures a PNG frame from the webcam and writes it directly to disk using directoryHandle.getFileHandle('YYYY-MM-DD_progreso.png', { create: true })
  const captureAndSaveProgressPhotoToDisk = async () => {
    const videoEl = videoRef.current;
    if (!videoEl) {
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth || 1280;
    canvas.height = videoEl.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

    const pngBlob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/png')
    );

    if (!pngBlob) {
      return;
    }

    const currentDateIso = new Date().toISOString().split('T')[0];
    const targetFileName = `${currentDateIso}_progreso.png`;

    if (directoryHandle) {
      try {
        // Exact required File System Access API call
        const fileHandle = await directoryHandle.getFileHandle(targetFileName, {
          create: true,
        });
        const writable = await fileHandle.createWritable();
        await writable.write(pngBlob);
        await writable.close();

        await loadPhotosFromDirectoryHandle(directoryHandle);
        setCameraStatusMessage(
          `Foto guardada directamente en tu carpeta Mac como "${targetFileName}".`
        );
        return;
      } catch {
        // Fall through to direct browser download + RAM preview if write permission was denied
      }
    }

    // Fallback: save directly to disk via download + add to current RAM session
    const ramUrl = URL.createObjectURL(pngBlob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = ramUrl;
    downloadAnchor.download = targetFileName;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);

    const newItem: VolatilePhotoItem = {
      fileName: targetFileName,
      dateLabel: currentDateIso,
      sortKey: `${currentDateIso}_${targetFileName}_${Date.now()}`,
      objectUrl: ramUrl,
      sizeBytes: pngBlob.size,
    };

    setVolatilePhotos((prev) => {
      const next = [...prev, newItem];
      setAfterPhotoIndex(next.length - 1);
      return next;
    });
    setCameraStatusMessage(
      `Foto "${targetFileName}" descargada a tu Mac y cargada en RAM volátil.`
    );
  };

  // Triggers the 5-second countdown before capturing the photo
  const handleStartFiveSecondCaptureTimer = () => {
    if (!isCameraOpen || cameraCountdown !== null) {
      return;
    }

    let remaining = 5;
    setCameraCountdown(remaining);
    playCameraCountdownBeep(false, false);

    const intervalId = window.setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        setCameraCountdown(remaining);
        playCameraCountdownBeep(false, false);
      } else {
        window.clearInterval(intervalId);
        setCameraCountdown(null);
        playCameraCountdownBeep(false, true);
        void captureAndSaveProgressPhotoToDisk();
      }
    }, 1000);
  };

  const beforePhoto = volatilePhotos[beforePhotoIndex] || null;
  const afterPhoto = volatilePhotos[afterPhotoIndex] || null;

  return (
    <div className="flex flex-col gap-8">
      {/* SECTION 1: Rapid Numerical Log & Evolution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 5 Cols: Numerical Entry Form */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                1. Registro Numérico Rápido
              </span>
              <h2 className="text-xl font-bold text-slate-100 mt-1">
                Peso y Medidas Corporales
              </h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Ruler className="w-5 h-5" />
            </div>
          </div>

          <form onSubmit={handleMeasurementSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-300">
                Fecha de Medición
                <input
                  type="date"
                  value={dateIso}
                  onChange={(e) => setDateIso(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-300">
                Peso Corporal (kg)
                <input
                  type="number"
                  step="0.1"
                  min="35"
                  max="200"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-300">
                Cintura / Ombligo (cm)
                <input
                  type="number"
                  step="0.1"
                  min="50"
                  max="160"
                  value={waistCm}
                  onChange={(e) => setWaistCm(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-300">
                Pecho / Espalda Dorsal (cm)
                <input
                  type="number"
                  step="0.1"
                  min="65"
                  max="180"
                  value={chestBackCm}
                  onChange={(e) => setChestBackCm(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-300">
              Brazo Contraído (cm)
              <input
                type="number"
                step="0.1"
                min="20"
                max="65"
                value={armCm}
                onChange={(e) => setArmCm(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                required
              />
            </label>

            <button
              type="submit"
              className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/15"
            >
              <PlusCircle className="w-4 h-4" />
              Guardar Registro de Medidas
            </button>
          </form>

          {/* Calculated V-Taper Preview Box */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">
                Ratio V-Taper Calculado (Pecho ÷ Cintura)
              </div>
              <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                {calculateVTaperRatio(parseFloat(chestBackCm), parseFloat(waistCm))}x{' '}
                <span className="text-xs font-sans font-normal text-slate-400">
                  (Meta Atlética: 1.35x – 1.45x)
                </span>
              </div>
            </div>
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        {/* Right 7 Cols: Interactive SVG Evolution Chart & History Log */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-8 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Curva de Evolución Antropométrica
              </span>
              <h3 className="text-xl font-bold text-slate-100 mt-1">
                Progreso de Medidas y Ratio en V
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {CHART_METRIC_KEYS.map((metricKey) => {
                const item = CHART_METRIC_CONFIG[metricKey];
                const active = selectedMetric === metricKey;
                return (
                  <button
                    key={metricKey}
                    type="button"
                    onClick={() => setSelectedMetric(metricKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {renderMeasurementsEvolutionChart(appData.measurements, selectedMetric)}

          {/* Recorded Measurements Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase">
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Peso</th>
                  <th className="py-2.5 px-3">Cintura</th>
                  <th className="py-2.5 px-3">Pecho/Espalda</th>
                  <th className="py-2.5 px-3">Brazo</th>
                  <th className="py-2.5 px-3">Índice V</th>
                  <th className="py-2.5 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {[...appData.measurements].reverse().map((m) => (
                  <tr key={m.id} className="hover:bg-slate-950/40">
                    <td className="py-2.5 px-3 text-slate-200">{m.dateIso}</td>
                    <td className="py-2.5 px-3 text-sky-400">{m.weightKg} kg</td>
                    <td className="py-2.5 px-3 text-amber-400">{m.waistCm} cm</td>
                    <td className="py-2.5 px-3 text-emerald-400">
                      {m.chestBackCm} cm
                    </td>
                    <td className="py-2.5 px-3 text-purple-400">{m.armCm} cm</td>
                    <td className="py-2.5 px-3 font-bold text-slate-100">
                      {calculateVTaperRatio(m.chestBackCm, m.waistCm)}x
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onDeleteMeasurement(m.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 2: Private Local Folder Manager (RAM-ONLY PHOTOS, ZERO BROWSER STORAGE) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <FolderLock className="w-4 h-4" />
              2. Gestor de Carpeta Local Privada (File System Access API · RAM-Only)
            </div>
            <h3 className="text-2xl font-bold text-slate-100">
              Privacidad Absoluta: Cero Fotos en Navegador
            </h3>
            <p className="text-sm text-slate-400 max-w-3xl">
              Las fotografías jamás se suben a servidores ni se guardan en{' '}
              <code className="text-slate-200">localStorage</code> o{' '}
              <code className="text-slate-200">IndexedDB</code>. Se leen y escriben directamente en tu carpeta local de macOS y viven solo en memoria RAM volátil (<code className="text-emerald-400">URL.createObjectURL</code>).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={handleConnectLocalPhotoFolder}
              className="inline-flex items-center gap-2.5 px-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
            >
              <FolderOpen className="w-4 h-4" />
              Conectar Carpeta Local de Fotos
            </button>

            <button
              type="button"
              onClick={handleLockAndPurgeRamPhotos}
              className="inline-flex items-center gap-2.5 px-5 py-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all"
            >
              <Lock className="w-4 h-4" />
              Bloquear y Limpiar Memoria
            </button>

            {/* Fallback directory input for non-Chromium browsers */}
            <input
              ref={fallbackDirInputRef}
              type="file"
              // @ts-expect-error webkitdirectory is standard non-spec attribute for folder selection fallback
              webkitdirectory="true"
              directory="true"
              multiple
              onChange={handleFallbackDirectoryInput}
              className="hidden"
            />
          </div>
        </div>

        {/* Status Bar & Connected Folder Gallery */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3 text-xs">
            <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-200">
              {folderStatusMessage ||
                'Ninguna carpeta conectada actualmente. Conecta una carpeta de tu Mac con archivos YYYY-MM-DD_*.png o .jpg.'}
            </span>
          </div>

          {directoryHandle && (
            <button
              type="button"
              onClick={() => void loadPhotosFromDirectoryHandle(directoryHandle)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Recargar archivos de &ldquo;{connectedFolderName}&rdquo;
            </button>
          )}
        </div>

        {volatilePhotos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {volatilePhotos.map((photo, idx) => (
              <div
                key={photo.sortKey}
                className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex flex-col gap-2"
              >
                <div className="aspect-[3/4] w-full rounded-lg overflow-hidden bg-slate-900">
                  <img
                    src={photo.objectUrl}
                    alt={photo.fileName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-emerald-400 font-bold">
                    {photo.dateLabel}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setBeforePhotoIndex(idx)}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        beforePhotoIndex === idx
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      Antes
                    </button>
                    <button
                      type="button"
                      onClick={() => setAfterPhotoIndex(idx)}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        afterPhotoIndex === idx
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      Después
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3 & 4: Webcam Studio with V-Taper Silhouette + Interactive Before vs. After Comparator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 6 Cols: Webcam with 5s Self-Timer, Consistency Guide & V-Taper Silhouette */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                3. Cámara con Guía de Silueta y Guardado Directo en Disco
              </span>
              <h3 className="text-xl font-bold text-slate-100 mt-1">
                Estudio Fotográfico V-Taper (Temporizador 5s)
              </h3>
            </div>
            <Camera className="w-5 h-5 text-sky-400" />
          </div>

          {/* Pre-capture Consistency Tips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <strong className="text-slate-100 block">En Ayunas</strong>
                Toma la foto al despertar antes de desayunar para máxima consistencia abdominal.
              </div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <strong className="text-slate-100 block">Misma Luz</strong>
                Usa siempre la misma fuente de luz cenital o lateral para marcar el relieve muscular.
              </div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <strong className="text-slate-100 block">Distancia Fija</strong>
                Coloca la Mac siempre a ~1.5 m encajando los hombros en la silueta SVG.
              </div>
            </div>
          </div>

          {/* Webcam Viewport with Superimposed Semi-Transparent V-Taper SVG Silhouette */}
          <div className="relative aspect-[4/3] w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center">
            {isCameraOpen ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            ) : (
              <div className="flex flex-col items-center text-center gap-2 p-6">
                <Video className="w-10 h-10 text-slate-600" />
                <p className="text-sm font-semibold text-slate-300">
                  Vista previa de cámara desactivada
                </p>
                <p className="text-xs text-slate-500 max-w-sm">
                  Activa la cámara para superponer la silueta V-Taper y disparar con temporizador de 5 segundos.
                </p>
              </div>
            )}

            {/* Semi-Transparent SVG Silhouette of Torso/Shoulders */}
            {renderCameraVTaperSilhouetteOverlay()}

            {/* Giant 5-Second Countdown Overlay */}
            {cameraCountdown !== null && (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center">
                <div className="text-7xl font-black text-emerald-400 font-mono animate-pulse">
                  {cameraCountdown}
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-200 mt-2">
                  Mantén postura erguida y aprieta abdomen...
                </span>
              </div>
            )}
          </div>

          {cameraStatusMessage && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-slate-300">
              <Info className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{cameraStatusMessage}</span>
            </div>
          )}

          {/* Camera Action Controls */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => void handleToggleWebcam()}
              className={`inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-xs transition-all ${
                isCameraOpen
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
              }`}
            >
              {isCameraOpen ? (
                <>
                  <VideoOff className="w-4 h-4" />
                  Apagar Cámara
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  Activar Cámara con Silueta
                </>
              )}
            </button>

            <button
              type="button"
              disabled={!isCameraOpen || cameraCountdown !== null}
              onClick={handleStartFiveSecondCaptureTimer}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
            >
              <Camera className="w-4 h-4" />
              Capturar en 5s (Guardar YYYY-MM-DD_progreso.png)
            </button>
          </div>
        </div>

        {/* Right 6 Cols: Interactive Before vs. After Vertical Slider Comparator */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                4. Comparador Interactivo &ldquo;Antes vs. Después&rdquo;
              </span>
              <h3 className="text-xl font-bold text-slate-100 mt-1">
                Slider Deslizable de Transformación
              </h3>
            </div>
            <SlidersHorizontal className="w-5 h-5 text-amber-400" />
          </div>

          {volatilePhotos.length === 0 ? (
            <div className="aspect-[4/3] w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3">
              <FolderOpen className="w-10 h-10 text-slate-600" />
              <p className="text-sm font-bold text-slate-200">
                Conecta tu carpeta local o captura una foto para activar el comparador
              </p>
              <p className="text-xs text-slate-400 max-w-md">
                Selecciona dos fotografías cargadas desde tu carpeta de macOS para deslizar y comparar tu evolución física lado a lado con sus fechas.
              </p>
            </div>
          ) : (
            <>
              {/* Selectors for Before Photo and After Photo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-amber-400">
                  Foto &ldquo;ANTES&rdquo; (Izquierda)
                  <select
                    value={beforePhotoIndex}
                    onChange={(e) => setBeforePhotoIndex(Number(e.target.value))}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-mono"
                  >
                    {volatilePhotos.map((p, idx) => (
                      <option key={`before-${p.sortKey}`} value={idx}>
                        {p.dateLabel} — {p.fileName}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-semibold text-emerald-400">
                  Foto &ldquo;DESPUÉS&rdquo; (Derecha)
                  <select
                    value={afterPhotoIndex}
                    onChange={(e) => setAfterPhotoIndex(Number(e.target.value))}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-mono"
                  >
                    {volatilePhotos.map((p, idx) => (
                      <option key={`after-${p.sortKey}`} value={idx}>
                        {p.dateLabel} — {p.fileName}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Interactive Before/After Split Container */}
              <div className="relative aspect-[4/3] w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden select-none">
                {/* Base Layer: AFTER Photo */}
                {afterPhoto && (
                  <img
                    src={afterPhoto.objectUrl}
                    alt={`Después ${afterPhoto.dateLabel}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                {/* Clipped Top Layer: BEFORE Photo */}
                {beforePhoto && (
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{
                      clipPath: `inset(0 ${100 - sliderPositionPercent}% 0 0)`,
                    }}
                  >
                    <img
                      src={beforePhoto.objectUrl}
                      alt={`Antes ${beforePhoto.dateLabel}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Vertical Divider Handle */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 shadow-[0_0_12px_#10b981] pointer-events-none"
                  style={{ left: `${sliderPositionPercent}%` }}
                >
                  <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 text-xs font-bold shadow-lg">
                    ↔
                  </div>
                </div>

                {/* Date Badges on Corners */}
                {beforePhoto && (
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-slate-950/85 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold">
                    ANTES: {beforePhoto.dateLabel}
                  </span>
                )}
                {afterPhoto && (
                  <span className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-slate-950/85 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold">
                    DESPUÉS: {afterPhoto.dateLabel}
                  </span>
                )}
              </div>

              {/* Range Slider Control */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Desliza para comparar Antes vs. Después</span>
                  <span className="font-mono text-emerald-400">
                    {sliderPositionPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sliderPositionPercent}
                  onChange={(e) =>
                    setSliderPositionPercent(Number(e.target.value))
                  }
                  className="w-full accent-emerald-500 cursor-ew-resize"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
