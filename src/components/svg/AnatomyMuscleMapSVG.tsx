import React from 'react';
import { MuscleGroupId } from '../../types/workout';
import { MUSCLE_GROUP_LABELS } from '../../data/exercisesCatalog';

export interface AnatomyMuscleMapSVGProps {
  primaryMuscles: MuscleGroupId[];
  secondaryMuscles: MuscleGroupId[];
  compact?: boolean;
}

interface MuscleVisualStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  filter?: string;
}

// Determines the SVG fill, stroke, and glow filter for a given muscle group based on activation role
export function resolveMuscleVisualStyle(
  muscleId: MuscleGroupId,
  primaryMuscles: MuscleGroupId[],
  secondaryMuscles: MuscleGroupId[]
): MuscleVisualStyle {
  if (primaryMuscles.includes(muscleId)) {
    return {
      fill: '#34d399', // emerald-400
      stroke: '#a7f3d0', // emerald-200
      strokeWidth: 1.5,
      filter: 'url(#primaryMuscleGlow)',
    };
  }
  if (secondaryMuscles.includes(muscleId)) {
    return {
      fill: 'rgba(251, 191, 36, 0.65)', // amber-400/60
      stroke: '#fcd34d', // amber-300
      strokeWidth: 1.2,
    };
  }
  return {
    fill: '#1e293b', // slate-800
    stroke: '#334155', // slate-700
    strokeWidth: 1,
  };
}

// Renders the anterior (front) human torso anatomical SVG view
export function renderAnteriorTorsoSvg(
  primaryMuscles: MuscleGroupId[],
  secondaryMuscles: MuscleGroupId[]
): React.ReactNode {
  const chestMajor = resolveMuscleVisualStyle('chest_major', primaryMuscles, secondaryMuscles);
  const chestInner = resolveMuscleVisualStyle(
    'chest_inner_upper',
    primaryMuscles,
    secondaryMuscles
  );
  const deltAnterior = resolveMuscleVisualStyle('delt_anterior', primaryMuscles, secondaryMuscles);
  const deltLateral = resolveMuscleVisualStyle('delt_lateral', primaryMuscles, secondaryMuscles);
  const trapsUpper = resolveMuscleVisualStyle('traps_upper', primaryMuscles, secondaryMuscles);
  const biceps = resolveMuscleVisualStyle('biceps', primaryMuscles, secondaryMuscles);
  const brachioradialis = resolveMuscleVisualStyle(
    'brachioradialis',
    primaryMuscles,
    secondaryMuscles
  );
  const forearms = resolveMuscleVisualStyle('forearms', primaryMuscles, secondaryMuscles);
  const serratus = resolveMuscleVisualStyle('serratus', primaryMuscles, secondaryMuscles);
  const latsFront = resolveMuscleVisualStyle('lats', primaryMuscles, secondaryMuscles);
  const absRectus = resolveMuscleVisualStyle('abs_rectus', primaryMuscles, secondaryMuscles);
  const obliques = resolveMuscleVisualStyle('obliques', primaryMuscles, secondaryMuscles);

  return (
    <g transform="translate(15, 10)">
      {/* View Header Label */}
      <text
        x="110"
        y="16"
        textAnchor="middle"
        className="fill-slate-400 text-[11px] font-semibold tracking-widest uppercase"
      >
        Vista Frontal
      </text>

      {/* V-Taper Ideal Guide Lines */}
      <path
        d="M 42 75 L 82 215 M 178 75 L 138 215"
        stroke="#0ea5e9"
        strokeWidth="1"
        strokeDasharray="3 3"
        opacity="0.35"
      />

      {/* Head & Neck Base Silhouette */}
      <circle cx="110" cy="40" r="15" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
      <path
        d="M 102 54 L 102 66 L 118 66 L 118 54 Z"
        fill="#1e293b"
        stroke="#475569"
        strokeWidth="1.2"
      />

      {/* Upper Traps (Anterior Collar Line) */}
      <path
        d="M 78 68 Q 95 57 103 63 L 98 72 Z"
        {...trapsUpper}
      />
      <path
        d="M 142 68 Q 125 57 117 63 L 122 72 Z"
        {...trapsUpper}
      />

      {/* Lateral Deltoids (Outer Shoulder Caps for V-Taper Width) */}
      <path
        d="M 52 72 Q 39 83 43 106 L 56 104 Q 56 85 66 74 Z"
        {...deltLateral}
      />
      <path
        d="M 168 72 Q 181 83 177 106 L 164 104 Q 164 85 154 74 Z"
        {...deltLateral}
      />

      {/* Anterior Deltoids (Front Shoulder Heads) */}
      <path
        d="M 66 72 L 80 74 L 72 103 L 56 102 Q 58 84 66 72 Z"
        {...deltAnterior}
      />
      <path
        d="M 154 72 L 140 74 L 148 103 L 164 102 Q 162 84 154 72 Z"
        {...deltAnterior}
      />

      {/* Pectoralis Major (Outer & Mid Chest) */}
      <path
        d="M 76 74 L 108 74 L 108 118 Q 84 122 72 106 Z"
        {...chestMajor}
      />
      <path
        d="M 144 74 L 112 74 L 112 118 Q 136 122 148 106 Z"
        {...chestMajor}
      />

      {/* Inner & Upper Pectoral (Clavicular / Sternal Squeeze Zone) */}
      <path
        d="M 88 73 L 109 73 L 109 115 L 96 112 Q 92 94 88 73 Z"
        {...chestInner}
      />
      <path
        d="M 132 73 L 111 73 L 111 115 L 124 112 Q 128 94 132 73 Z"
        {...chestInner}
      />

      {/* Front Lat Flare (V-Taper Wings visible from front) */}
      <path
        d="M 72 108 L 65 132 L 77 152 L 80 120 Z"
        {...latsFront}
      />
      <path
        d="M 148 108 L 155 132 L 143 152 L 140 120 Z"
        {...latsFront}
      />

      {/* Serratus Anterior (Ribcage Finger-like Muscles) */}
      <path
        d="M 76 118 L 89 121 L 87 146 L 76 142 Z"
        {...serratus}
      />
      <path
        d="M 144 118 L 131 121 L 133 146 L 144 142 Z"
        {...serratus}
      />

      {/* Rectus Abdominis (6-Pack Segments) */}
      <rect x="92" y="121" width="16" height="19" rx="4" {...absRectus} />
      <rect x="112" y="121" width="16" height="19" rx="4" {...absRectus} />
      <rect x="92" y="143" width="16" height="19" rx="4" {...absRectus} />
      <rect x="112" y="143" width="16" height="19" rx="4" {...absRectus} />
      <rect x="93" y="165" width="15" height="20" rx="4" {...absRectus} />
      <rect x="112" y="165" width="15" height="20" rx="4" {...absRectus} />
      <path
        d="M 94 188 L 108 188 L 108 212 L 98 208 Z"
        {...absRectus}
      />
      <path
        d="M 126 188 L 112 188 L 112 212 L 122 208 Z"
        {...absRectus}
      />

      {/* External Obliques (V-Cut Waist Framing) */}
      <path
        d="M 78 145 L 90 145 L 91 202 L 81 192 Z"
        {...obliques}
      />
      <path
        d="M 142 145 L 130 145 L 129 202 L 139 192 Z"
        {...obliques}
      />

      {/* Biceps Brachii (Left & Right Front Upper Arms) */}
      <path
        d="M 45 108 L 62 107 L 58 148 L 41 146 Q 40 126 45 108 Z"
        {...biceps}
      />
      <path
        d="M 175 108 L 158 107 L 162 148 L 179 146 Q 180 126 175 108 Z"
        {...biceps}
      />

      {/* Brachioradialis (Upper Lateral Forearm) */}
      <path
        d="M 39 150 L 56 150 L 52 178 L 35 175 Z"
        {...brachioradialis}
      />
      <path
        d="M 181 150 L 164 150 L 168 178 L 185 175 Z"
        {...brachioradialis}
      />

      {/* Forearm Flexors/Extensors (Lower Forearm) */}
      <path
        d="M 35 178 L 51 180 L 46 206 L 32 204 Z"
        {...forearms}
      />
      <path
        d="M 185 178 L 169 180 L 174 206 L 188 204 Z"
        {...forearms}
      />

      {/* Lower Pelvis Neutral Base (Zero Meniscus Impact Zone indicator) */}
      <path
        d="M 80 212 L 140 212 L 135 232 L 85 232 Z"
        fill="#0f172a"
        stroke="#334155"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
    </g>
  );
}

// Renders the posterior (back) human torso anatomical SVG view
export function renderPosteriorTorsoSvg(
  primaryMuscles: MuscleGroupId[],
  secondaryMuscles: MuscleGroupId[]
): React.ReactNode {
  const trapsUpper = resolveMuscleVisualStyle('traps_upper', primaryMuscles, secondaryMuscles);
  const trapsMiddle = resolveMuscleVisualStyle('traps_middle', primaryMuscles, secondaryMuscles);
  const rhomboids = resolveMuscleVisualStyle('rhomboids', primaryMuscles, secondaryMuscles);
  const deltLateral = resolveMuscleVisualStyle('delt_lateral', primaryMuscles, secondaryMuscles);
  const deltPosterior = resolveMuscleVisualStyle(
    'delt_posterior',
    primaryMuscles,
    secondaryMuscles
  );
  const lats = resolveMuscleVisualStyle('lats', primaryMuscles, secondaryMuscles);
  const triceps = resolveMuscleVisualStyle('triceps', primaryMuscles, secondaryMuscles);
  const anconeus = resolveMuscleVisualStyle('anconeus', primaryMuscles, secondaryMuscles);
  const forearms = resolveMuscleVisualStyle('forearms', primaryMuscles, secondaryMuscles);
  const obliquesBack = resolveMuscleVisualStyle('obliques', primaryMuscles, secondaryMuscles);

  return (
    <g transform="translate(245, 10)">
      {/* View Header Label */}
      <text
        x="110"
        y="16"
        textAnchor="middle"
        className="fill-slate-400 text-[11px] font-semibold tracking-widest uppercase"
      >
        Vista Posterior
      </text>

      {/* V-Taper Ideal Guide Lines */}
      <path
        d="M 42 75 L 82 215 M 178 75 L 138 215"
        stroke="#0ea5e9"
        strokeWidth="1"
        strokeDasharray="3 3"
        opacity="0.35"
      />

      {/* Head & Neck Posterior */}
      <circle cx="110" cy="40" r="15" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
      <path
        d="M 102 54 L 102 65 L 118 65 L 118 54 Z"
        fill="#1e293b"
        stroke="#475569"
        strokeWidth="1.2"
      />

      {/* Upper Trapezius */}
      <path
        d="M 74 70 Q 96 58 110 58 Q 124 58 146 70 L 132 82 L 88 82 Z"
        {...trapsUpper}
      />

      {/* Middle & Lower Trapezius Diamond */}
      <path
        d="M 92 82 L 128 82 L 118 134 L 110 144 L 102 134 Z"
        {...trapsMiddle}
      />

      {/* Rhomboids (Deep Scapulothoracic Retractors) */}
      <path
        d="M 76 84 L 91 84 L 100 128 L 80 122 Z"
        {...rhomboids}
      />
      <path
        d="M 144 84 L 129 84 L 120 128 L 140 122 Z"
        {...rhomboids}
      />

      {/* Lateral Deltoids (Outer Shoulder Caps) */}
      <path
        d="M 52 72 Q 39 83 43 106 L 56 104 Q 56 85 66 74 Z"
        {...deltLateral}
      />
      <path
        d="M 168 72 Q 181 83 177 106 L 164 104 Q 164 85 154 74 Z"
        {...deltLateral}
      />

      {/* Posterior Deltoids (Rear Shoulder Heads) */}
      <path
        d="M 64 73 L 78 82 L 73 105 L 56 103 Z"
        {...deltPosterior}
      />
      <path
        d="M 156 73 L 142 82 L 147 105 L 164 103 Z"
        {...deltPosterior}
      />

      {/* Latissimus Dorsi (Wide V-Taper Back Wings) */}
      <path
        d="M 72 110 L 100 130 L 106 192 L 84 185 Q 68 148 72 110 Z"
        {...lats}
      />
      <path
        d="M 148 110 L 120 130 L 114 192 L 136 185 Q 152 148 148 110 Z"
        {...lats}
      />

      {/* Triceps Brachii (Horseshoe 3 Heads on Back of Arms) */}
      <path
        d="M 45 108 L 62 107 L 58 149 L 41 146 Q 40 126 45 108 Z"
        {...triceps}
      />
      <path
        d="M 175 108 L 158 107 L 162 149 L 179 146 Q 180 126 175 108 Z"
        {...triceps}
      />

      {/* Anconeus (Elbow Extension Stabilizer) */}
      <path
        d="M 41 148 L 57 148 L 55 162 L 39 160 Z"
        {...anconeus}
      />
      <path
        d="M 179 148 L 163 148 L 165 162 L 181 160 Z"
        {...anconeus}
      />

      {/* Posterior Forearms */}
      <path
        d="M 38 164 L 54 164 L 46 205 L 32 203 Z"
        {...forearms}
      />
      <path
        d="M 182 164 L 166 164 L 174 205 L 188 203 Z"
        {...forearms}
      />

      {/* Posterior Waist / Oblique Flanks */}
      <path
        d="M 84 187 L 105 193 L 105 210 L 82 210 Z"
        {...obliquesBack}
      />
      <path
        d="M 136 187 L 115 193 L 115 210 L 138 210 Z"
        {...obliquesBack}
      />

      {/* Lower Pelvis Neutral Base */}
      <path
        d="M 80 212 L 140 212 L 135 232 L 85 232 Z"
        fill="#0f172a"
        stroke="#334155"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
    </g>
  );
}

// Renders the anatomical muscle map with front and back views side by side
export const AnatomyMuscleMapSVG: React.FC<AnatomyMuscleMapSVGProps> = ({
  primaryMuscles,
  secondaryMuscles,
  compact = false,
}) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="relative w-full bg-slate-950/90 border border-slate-800/90 rounded-xl p-3 flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 480 255"
          className={`w-full ${compact ? 'max-h-44' : 'max-h-72'} h-auto select-none`}
          role="img"
          aria-label="Mapa anatómico muscular frontal y posterior"
        >
          <defs>
            <filter id="primaryMuscleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Center Divider Line */}
          <line
            x1="240"
            y1="15"
            x2="240"
            y2="240"
            stroke="#1e293b"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Anterior & Posterior Views */}
          {renderAnteriorTorsoSvg(primaryMuscles, secondaryMuscles)}
          {renderPosteriorTorsoSvg(primaryMuscles, secondaryMuscles)}
        </svg>
      </div>

      {/* Color-Coded Muscle Activation Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span>Músculos Primarios (Foco Directo)</span>
          </div>
          <div className="text-slate-200 font-medium pl-5">
            {primaryMuscles.map((id) => MUSCLE_GROUP_LABELS[id]).join(' · ')}
          </div>
        </div>

        <div className="bg-amber-950/25 border border-amber-500/30 rounded-xl p-3 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-amber-400 font-semibold">
            <span className="w-3 h-3 rounded-full bg-amber-400/70 border border-amber-300" />
            <span>Músculos Sinergistas (Secundarios)</span>
          </div>
          <div className="text-slate-300 font-medium pl-5">
            {secondaryMuscles.length > 0
              ? secondaryMuscles.map((id) => MUSCLE_GROUP_LABELS[id]).join(' · ')
              : 'Aislamiento Primario Directo'}
          </div>
        </div>
      </div>
    </div>
  );
};
