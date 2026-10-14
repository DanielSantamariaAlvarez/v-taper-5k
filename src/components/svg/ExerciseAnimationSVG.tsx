import React, { useEffect, useState } from 'react';
import { ExerciseId, WorkoutPhase } from '../../types/workout';

export interface ExerciseAnimationSVGProps {
  exerciseId: ExerciseId;
  phase?: WorkoutPhase;
  // Normalized contraction value from 0 (bottom / stretched eccentric end) to 1 (top / peak concentric contraction)
  contractionProgress?: number;
  // When true, runs an automatic 4-second (1s up / 3s down) biomechanical preview loop
  autoAnimate?: boolean;
  className?: string;
}

// Computes the normalized contraction value (0..1) from a 4-second cycle timestamp (0..1s up, 1..4s down)
export function calculateCycleContractionFromTime(elapsedMs: number): {
  contraction: number;
  simulatedPhase: 'concentric' | 'eccentric';
} {
  const cycleMs = elapsedMs % 4000;
  if (cycleMs <= 1000) {
    // 1 second concentric ascent (0 -> 1)
    const raw = cycleMs / 1000;
    const eased = 1 - Math.pow(1 - raw, 2);
    return { contraction: eased, simulatedPhase: 'concentric' };
  }
  // 3 seconds eccentric descent (1 -> 0)
  const downRaw = (cycleMs - 1000) / 3000;
  const contraction = Math.max(0, 1 - downRaw);
  return { contraction, simulatedPhase: 'eccentric' };
}

// Renders a 5kg hex dumbbell centered at (cx, cy) with optional rotation angle
export function renderDumbbellSvg(
  cx: number,
  cy: number,
  angleDeg: number = 0,
  accentColor: string = '#34d399',
  scale: number = 1
): React.ReactNode {
  return (
    <g transform={`translate(${cx}, ${cy}) rotate(${angleDeg}) scale(${scale})`}>
      <rect x="-14" y="-3" width="28" height="6" rx="2" fill="#94a3b8" />
      <rect
        x="-18"
        y="-9"
        width="8"
        height="18"
        rx="2"
        fill="#0f172a"
        stroke={accentColor}
        strokeWidth="2"
      />
      <rect
        x="10"
        y="-9"
        width="8"
        height="18"
        rx="2"
        fill="#0f172a"
        stroke={accentColor}
        strokeWidth="2"
      />
      <text
        x="0"
        y="2.5"
        textAnchor="middle"
        className="fill-slate-950 text-[6px] font-bold select-none"
      >
        5K
      </text>
    </g>
  );
}

// E1: Aperturas + Press en Suelo (Transverse/Front Supine View: Wide arc on floor -> Press together over chest)
export function renderFloorFlyPressE1(
  c: number,
  activeColor: string
): React.ReactNode {
  // Left & right hand coordinates interpolate from wide floor arc to top center over chest
  const leftElbowX = 95 + c * 42;
  const leftElbowY = 172 - c * 32;
  const leftHandX = 76 + c * 88;
  const leftHandY = 152 - c * 70;

  const rightElbowX = 305 - c * 42;
  const rightElbowY = 172 - c * 32;
  const rightHandX = 324 - c * 88;
  const rightHandY = 152 - c * 70;

  return (
    <g>
      {/* Floor Mat Cross-Section */}
      <rect x="40" y="182" width="320" height="10" rx="5" fill="#1e293b" stroke="#334155" />
      <text x="200" y="210" textAnchor="middle" className="fill-slate-400 text-[11px]">
        Vista Frontal en Suelo — Codos rozan el suelo al bajar y cierran arriba
      </text>

      {/* Motion Arc Guide */}
      <path
        d="M 76 152 Q 95 75 164 82 M 324 152 Q 305 75 236 82"
        fill="none"
        stroke={activeColor}
        strokeWidth="1.5"
        strokeDasharray="4 4"
        opacity="0.45"
      />

      {/* Supine Torso & Relaxed Knees in Perspective */}
      <ellipse cx="200" cy="162" rx="48" ry="20" fill="#1e293b" stroke="#475569" strokeWidth="2" />
      {/* Activated Pectorals Highlight */}
      <ellipse
        cx="182"
        cy="158"
        rx="18"
        ry="11"
        fill={activeColor}
        opacity={0.25 + c * 0.55}
      />
      <ellipse
        cx="218"
        cy="158"
        rx="18"
        ry="11"
        fill={activeColor}
        opacity={0.25 + c * 0.55}
      />
      <circle cx="200" cy="136" r="14" fill="#0f172a" stroke="#64748b" strokeWidth="2" />

      {/* Upper & Forearms */}
      <path
        d={`M 155 160 L ${leftElbowX} ${leftElbowY} L ${leftHandX} ${leftHandY}`}
        fill="none"
        stroke={activeColor}
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={`M 245 160 L ${rightElbowX} ${rightElbowY} L ${rightHandX} ${rightHandY}`}
        fill="none"
        stroke={activeColor}
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 5kg Dumbbells */}
      {renderDumbbellSvg(leftHandX, leftHandY, -15 + c * 15, activeColor)}
      {renderDumbbellSvg(rightHandX, rightHandY, 15 - c * 15, activeColor)}
    </g>
  );
}

// E2: Squeeze Press en Suelo (Dumbbells pressed tightly together at midline throughout ascent/descent)
export function renderFloorSqueezePressE2(
  c: number,
  activeColor: string
): React.ReactNode {
  const handY = 140 - c * 62;
  const leftElbowX = 128 + c * 28;
  const rightElbowX = 272 - c * 28;
  const elbowY = 174 - c * 42;

  return (
    <g>
      {/* Floor Mat */}
      <rect x="40" y="182" width="320" height="10" rx="5" fill="#1e293b" stroke="#334155" />
      <text x="200" y="210" textAnchor="middle" className="fill-slate-400 text-[11px]">
        Prensa Isométrica en Suelo — Presiona ambas mancuernas entre sí todo el tiempo
      </text>

      {/* Supine Torso */}
      <ellipse cx="200" cy="162" rx="46" ry="20" fill="#1e293b" stroke="#475569" strokeWidth="2" />
      {/* Inner Chest Squeeze Highlight */}
      <rect
        x="186"
        y="146"
        width="28"
        height="24"
        rx="6"
        fill={activeColor}
        opacity={0.35 + c * 0.55}
      />
      <circle cx="200" cy="136" r="14" fill="#0f172a" stroke="#64748b" strokeWidth="2" />

      {/* Arms Pressing Vertically in Center */}
      <path
        d={`M 156 160 L ${leftElbowX} ${elbowY} L 184 ${handY}`}
        fill="none"
        stroke={activeColor}
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={`M 244 160 L ${rightElbowX} ${elbowY} L 216 ${handY}`}
        fill="none"
        stroke={activeColor}
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Isometric Squeeze Force Arrows */}
      <path
        d={`M 145 ${handY} L 164 ${handY} M 255 ${handY} L 236 ${handY}`}
        stroke="#fbbf24"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Twin Dumbbells Touching in Center */}
      {renderDumbbellSvg(183, handY, 90, activeColor, 0.9)}
      {renderDumbbellSvg(217, handY, 90, activeColor, 0.9)}
    </g>
  );
}

// E3: Press Militar Sentado (Seated with backrest support, bilateral overhead press)
export function renderSeatedShoulderPressE3(
  c: number,
  activeColor: string
): React.ReactNode {
  const elbowY = 122 - c * 40;
  const leftElbowX = 126 + c * 14;
  const rightElbowX = 274 - c * 14;
  const handY = 92 - c * 52;
  const leftHandX = 132 + c * 22;
  const rightHandX = 268 - c * 22;

  return (
    <g>
      {/* Seated Bench & Backrest */}
      <rect x="155" y="95" width="90" height="92" rx="10" fill="#0f172a" stroke="#334155" strokeWidth="2" />
      <rect x="140" y="182" width="120" height="10" rx="4" fill="#1e293b" stroke="#475569" />
      <text x="200" y="212" textAnchor="middle" className="fill-slate-400 text-[11px]">
        Sentado con Espalda Apoyada — Empuje vertical bilateral desde las orejas
      </text>

      {/* V-Taper Torso & Head */}
      <path
        d="M 156 104 L 244 104 L 226 180 L 174 180 Z"
        fill="#1e293b"
        stroke="#475569"
        strokeWidth="2"
      />
      <circle cx="200" cy="78" r="16" fill="#0f172a" stroke="#64748b" strokeWidth="2" />

      {/* Shoulder Deltoid Glow */}
      <circle cx="154" cy="106" r="12" fill={activeColor} opacity={0.3 + c * 0.55} />
      <circle cx="246" cy="106" r="12" fill={activeColor} opacity={0.3 + c * 0.55} />

      {/* Bilateral Pressing Arms */}
      <path
        d={`M 154 106 L ${leftElbowX} ${elbowY} L ${leftHandX} ${handY}`}
        fill="none"
        stroke={activeColor}
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={`M 246 106 L ${rightElbowX} ${elbowY} L ${rightHandX} ${handY}`}
        fill="none"
        stroke={activeColor}
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {renderDumbbellSvg(leftHandX, handY, 0, activeColor)}
      {renderDumbbellSvg(rightHandX, handY, 0, activeColor)}
    </g>
  );
}

// E4: Elevaciones Laterales Sentado (Seated Lateral Raises for V-Taper Shoulder Width)
export function renderSeatedLateralRaiseE4(
  c: number,
  activeColor: string
): React.ReactNode {
  const leftElbowX = 140 - c * 32;
  const leftElbowY = 142 - c * 42;
  const leftHandX = 132 - c * 58;
  const leftHandY = 170 - c * 68;

  const rightElbowX = 260 + c * 32;
  const rightElbowY = 142 - c * 42;
  const rightHandX = 268 + c * 58;
  const rightHandY = 170 - c * 68;

  return (
    <g>
      {/* Chair Seat */}
      <rect x="145" y="180" width="110" height="10" rx="4" fill="#1e293b" stroke="#475569" />
      <line x1="160" y1="190" x2="160" y2="205" stroke="#475569" strokeWidth="3" />
      <line x1="240" y1="190" x2="240" y2="205" stroke="#475569" strokeWidth="3" />
      <text x="200" y="214" textAnchor="middle" className="fill-slate-400 text-[11px]">
        Sentado Erguido — Eleva ambos brazos hasta 90° para máxima anchura en V
      </text>

      {/* Lateral Arc Guides */}
      <path
        d="M 130 170 Q 82 145 74 102 M 270 170 Q 318 145 326 102"
        fill="none"
        stroke={activeColor}
        strokeWidth="1.5"
        strokeDasharray="4 4"
        opacity="0.45"
      />

      {/* V-Taper Torso & Head */}
      <path
        d="M 154 100 L 246 100 L 224 180 L 176 180 Z"
        fill="#1e293b"
        stroke="#475569"
        strokeWidth="2"
      />
      <circle cx="200" cy="74" r="16" fill="#0f172a" stroke="#64748b" strokeWidth="2" />

      {/* Lateral Deltoid Caps Highlight */}
      <circle cx="152" cy="102" r="12" fill={activeColor} opacity={0.35 + c * 0.55} />
      <circle cx="248" cy="102" r="12" fill={activeColor} opacity={0.35 + c * 0.55} />

      {/* Arms Raising Outward */}
      <path
        d={`M 152 102 L ${leftElbowX} ${leftElbowY} L ${leftHandX} ${leftHandY}`}
        fill="none"
        stroke={activeColor}
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={`M 248 102 L ${rightElbowX} ${rightElbowY} L ${rightHandX} ${rightHandY}`}
        fill="none"
        stroke={activeColor}
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {renderDumbbellSvg(leftHandX, leftHandY, -10 * c, activeColor)}
      {renderDumbbellSvg(rightHandX, rightHandY, 10 * c, activeColor)}
    </g>
  );
}

// E5: Remo Bilateral Sentado (Side view: Seated on chair, torso hinged 45°, rowing toward hips)
export function renderSeatedBilateralRowE5(
  c: number,
  activeColor: string
): React.ReactNode {
  // Shoulder at (225, 86), Hip at (170, 148). Row pulls from extended (240, 156) back to hip (168, 128)
  const elbowX = 228 - c * 74;
  const elbowY = 126 - c * 28;
  const handX = 242 - c * 62;
  const handY = 160 - c * 32;

  return (
    <g>
      {/* Floor & Chair Side View */}
      <line x1="60" y1="192" x2="340" y2="192" stroke="#334155" strokeWidth="2" />
      <rect x="130" y="150" width="58" height="10" rx="3" fill="#1e293b" stroke="#475569" />
      <line x1="138" y1="160" x2="138" y2="192" stroke="#475569" strokeWidth="4" />
      <line x1="180" y1="160" x2="180" y2="192" stroke="#475569" strokeWidth="4" />

      <text x="200" y="212" textAnchor="middle" className="fill-slate-400 text-[11px]">
        Vista Lateral (Torso a 45°) — Tracciona hacia las caderas apretando escápulas
      </text>

      {/* Passive Seated Legs (Zero Meniscus Push) */}
      <path
        d="M 170 148 L 235 148 L 252 188"
        fill="none"
        stroke="#475569"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 45-degree Hinged Torso */}
      <path
        d="M 170 148 L 226 86"
        fill="none"
        stroke="#334155"
        strokeWidth="24"
        strokeLinecap="round"
      />
      {/* Active Latissimus Dorsi Highlight along Back */}
      <path
        d="M 168 140 L 216 86"
        fill="none"
        stroke={activeColor}
        strokeWidth="10"
        strokeLinecap="round"
        opacity={0.3 + c * 0.6}
      />

      {/* Head aligned with spine */}
      <circle cx="244" cy="68" r="14" fill="#0f172a" stroke="#64748b" strokeWidth="2" />

      {/* Bilateral Rowing Arms */}
      <path
        d={`M 224 90 L ${elbowX} ${elbowY} L ${handX} ${handY}`}
        fill="none"
        stroke={activeColor}
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {renderDumbbellSvg(handX, handY, 25, activeColor)}
    </g>
  );
}

// E6: Pájaros Sentado / Vuelos Posteriores (Front-hinged view: high elbows wide rear delt fly)
export function renderSeatedRearDeltFlyE6(
  c: number,
  activeColor: string
): React.ReactNode {
  const leftElbowX = 148 - c * 48;
  const leftElbowY = 142 - c * 48;
  const leftHandX = 158 - c * 82;
  const leftHandY = 172 - c * 68;

  const rightElbowX = 252 + c * 48;
  const rightElbowY = 142 - c * 48;
  const rightHandX = 242 + c * 82;
  const rightHandY = 172 - c * 68;

  return (
    <g>
      {/* Chair & Hinged Torso Perspective */}
      <rect x="148" y="176" width="104" height="10" rx="4" fill="#1e293b" stroke="#475569" />
      <text x="200" y="212" textAnchor="middle" className="fill-slate-400 text-[11px]">
        Sentado Inclinado — Abre los brazos en cruz llevando los codos altos
      </text>

      {/* Hinged Torso & Forward Head */}
      <ellipse cx="200" cy="135" rx="42" ry="32" fill="#1e293b" stroke="#475569" strokeWidth="2" />
      {/* Rear Delts & Mid Traps Highlight */}
      <path
        d="M 156 112 L 244 112 L 222 135 L 178 135 Z"
        fill={activeColor}
        opacity={0.3 + c * 0.55}
      />
      <circle cx="200" cy="102" r="15" fill="#0f172a" stroke="#64748b" strokeWidth="2" />

      {/* Arms sweeping out in rear fly arc */}
      <path
        d={`M 158 114 L ${leftElbowX} ${leftElbowY} L ${leftHandX} ${leftHandY}`}
        fill="none"
        stroke={activeColor}
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={`M 242 114 L ${rightElbowX} ${rightElbowY} L ${rightHandX} ${rightHandY}`}
        fill="none"
        stroke={activeColor}
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {renderDumbbellSvg(leftHandX, leftHandY, -15 * c, activeColor)}
      {renderDumbbellSvg(rightHandX, rightHandY, 15 * c, activeColor)}
    </g>
  );
}

// E7: Pullover en Suelo con Doble Mancuerna (Side supine view: 10kg combined arc from behind head to over chest)
export function renderFloorDoublePulloverE7(
  c: number,
  activeColor: string
): React.ReactNode {
  // Angle moves from stretched behind head (-155 deg) to vertical over chest (-90 deg)
  const angleRad = ((-158 + c * 68) * Math.PI) / 180;
  const shoulderX = 148;
  const shoulderY = 156;
  const armLength = 68;
  const handX = shoulderX + Math.cos(angleRad) * armLength;
  const handY = shoulderY + Math.sin(angleRad) * armLength;

  return (
    <g>
      {/* Floor Mat */}
      <rect x="40" y="180" width="320" height="8" rx="4" fill="#1e293b" stroke="#334155" />
      <text x="200" y="210" textAnchor="middle" className="fill-slate-400 text-[11px]">
        Pullover en Suelo (10 kg juntos) — De atrás de la cabeza hacia el pecho
      </text>

      {/* Pullover Arc Trajectory */}
      <path
        d="M 85 130 Q 105 82 148 88"
        fill="none"
        stroke={activeColor}
        strokeWidth="1.8"
        strokeDasharray="4 4"
        opacity="0.5"
      />

      {/* Supine Body on Floor */}
      <circle cx="115" cy="164" r="13" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
      <rect x="132" y="152" width="86" height="26" rx="12" fill="#1e293b" stroke="#475569" strokeWidth="2" />
      {/* Lat & Serratus Highlight */}
      <rect
        x="140"
        y="154"
        width="55"
        height="14"
        rx="6"
        fill={activeColor}
        opacity={0.3 + c * 0.6}
      />

      {/* Relaxed Legs on Floor */}
      <path
        d="M 218 166 L 270 146 L 315 176"
        fill="none"
        stroke="#475569"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Arms moving in Pullover Arc */}
      <line
        x1={shoulderX}
        y1={shoulderY}
        x2={handX}
        y2={handY}
        stroke={activeColor}
        strokeWidth="9"
        strokeLinecap="round"
      />

      {renderDumbbellSvg(handX, handY, 20, activeColor, 1.1)}
    </g>
  );
}

// E8: Curl de Bíceps + Zottman Sentado (Seated with elbows pinned, supinated curl up + pronated 3s descent)
export function renderSeatedZottmanCurlE8(
  c: number,
  activeColor: string,
  isEccentricPhase: boolean
): React.ReactNode {
  const leftElbowX = 148;
  const rightElbowX = 252;
  const elbowY = 145;

  // Hands travel from down (y=176) to curled up near shoulders (y=108)
  const handY = 176 - c * 66;
  const leftHandX = 140 + c * 12;
  const rightHandX = 260 - c * 12;

  return (
    <g>
      <rect x="145" y="182" width="110" height="10" rx="4" fill="#1e293b" stroke="#475569" />
      <text x="200" y="212" textAnchor="middle" className="fill-slate-400 text-[11px]">
        {isEccentricPhase
          ? 'Bajada Zottman (3s): Palmas hacia ABAJO (Sobrecarga Braquiorradial)'
          : 'Subida Explosiva (1s): Palmas hacia ARRIBA + Giro en la cima'}
      </text>

      {/* Seated Torso & Head */}
      <path
        d="M 154 100 L 246 100 L 226 182 L 174 182 Z"
        fill="#1e293b"
        stroke="#475569"
        strokeWidth="2"
      />
      <circle cx="200" cy="74" r="16" fill="#0f172a" stroke="#64748b" strokeWidth="2" />

      {/* Pinned Upper Arms + Biceps Peak Highlight */}
      <line x1="154" y1="104" x2={leftElbowX} y2={elbowY} stroke="#475569" strokeWidth="9" strokeLinecap="round" />
      <line x1="246" y1="104" x2={rightElbowX} y2={elbowY} stroke="#475569" strokeWidth="9" strokeLinecap="round" />
      <circle cx="150" cy="125" r={7 + c * 4} fill={activeColor} opacity={0.4 + c * 0.5} />
      <circle cx="250" cy="125" r={7 + c * 4} fill={activeColor} opacity={0.4 + c * 0.5} />

      {/* Moving Forearms */}
      <line
        x1={leftElbowX}
        y1={elbowY}
        x2={leftHandX}
        y2={handY}
        stroke={activeColor}
        strokeWidth="8.5"
        strokeLinecap="round"
      />
      <line
        x1={rightElbowX}
        y1={elbowY}
        x2={rightHandX}
        y2={handY}
        stroke={activeColor}
        strokeWidth="8.5"
        strokeLinecap="round"
      />

      {renderDumbbellSvg(leftHandX, handY, isEccentricPhase ? 180 : 0, activeColor)}
      {renderDumbbellSvg(rightHandX, handY, isEccentricPhase ? 180 : 0, activeColor)}
    </g>
  );
}

// E9: Rompecráneos en Suelo con Dos Mancuernas (Side supine view: fixed vertical humerus, elbow hinge only)
export function renderFloorSkullCrusherE9(
  c: number,
  activeColor: string
): React.ReactNode {
  const shoulderX = 152;
  const shoulderY = 156;
  const elbowX = 148;
  const elbowY = 110;

  // Forearm rotates from near forehead (angle -155 deg) to vertical extension (-88 deg)
  const forearmAngle = ((-158 + c * 70) * Math.PI) / 180;
  const handX = elbowX + Math.cos(forearmAngle) * 44;
  const handY = elbowY + Math.sin(forearmAngle) * 44;

  return (
    <g>
      {/* Floor Mat */}
      <rect x="40" y="180" width="320" height="8" rx="4" fill="#1e293b" stroke="#334155" />
      <text x="200" y="210" textAnchor="middle" className="fill-slate-400 text-[11px]">
        Rompecráneos en Suelo — Codos fijos apuntando al techo, extiende en 1s
      </text>

      {/* Supine Body */}
      <circle cx="114" cy="164" r="13" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
      <rect x="132" y="152" width="86" height="26" rx="12" fill="#1e293b" stroke="#475569" strokeWidth="2" />
      <path
        d="M 218 166 L 270 146 L 315 176"
        fill="none"
        stroke="#475569"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Fixed Upper Arm with Triceps Glow */}
      <line
        x1={shoulderX}
        y1={shoulderY}
        x2={elbowX}
        y2={elbowY}
        stroke={activeColor}
        strokeWidth="9"
        strokeLinecap="round"
      />
      {/* Hinged Forearm */}
      <line
        x1={elbowX}
        y1={elbowY}
        x2={handX}
        y2={handY}
        stroke="#e2e8f0"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* Pivot Pin on Elbow */}
      <circle cx={elbowX} cy={elbowY} r="4" fill="#fbbf24" />

      {renderDumbbellSvg(handX, handY, 0, activeColor, 0.95)}
    </g>
  );
}

// E10: Crunch Abdominal con Piernas en Silla (Side view: calves resting on chair seat at 90°, torso curls up)
export function renderChairLegsCrunchE10(
  c: number,
  activeColor: string
): React.ReactNode {
  // Upper torso & shoulders curl up by c * 24 pixels
  const shoulderX = 128 + c * 22;
  const shoulderY = 162 - c * 26;
  const headX = 100 + c * 24;
  const headY = 156 - c * 32;

  return (
    <g>
      {/* Floor Mat */}
      <rect x="40" y="180" width="230" height="8" rx="4" fill="#1e293b" stroke="#334155" />

      {/* Support Chair for Calves (90° Zero Meniscus Stress) */}
      <rect x="255" y="122" width="75" height="10" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
      <line x1="265" y1="132" x2="265" y2="186" stroke="#475569" strokeWidth="4" />
      <line x1="320" y1="132" x2="320" y2="186" stroke="#475569" strokeWidth="4" />
      <text x="292" y="114" textAnchor="middle" className="fill-sky-400 text-[9px] font-semibold">
        90° Descarga Menisco
      </text>

      <text x="200" y="210" textAnchor="middle" className="fill-slate-400 text-[11px]">
        Pantorrillas en Silla — Eleva escápulas en 1s apretando abdomen y baja en 3s
      </text>

      {/* Pelvis -> Vertical Thighs -> Horizontal Calves on Chair */}
      <path
        d="M 218 168 L 258 122 L 318 122"
        fill="none"
        stroke="#64748b"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Lower & Upper Spine Curling */}
      <path
        d={`M 218 168 Q 170 172 ${shoulderX} ${shoulderY}`}
        fill="none"
        stroke={activeColor}
        strokeWidth="18"
        strokeLinecap="round"
      />

      {/* Head & Hands by Temples */}
      <circle cx={headX} cy={headY} r="13" fill="#0f172a" stroke="#e2e8f0" strokeWidth="2" />
      <path
        d={`M ${shoulderX} ${shoulderY} L ${headX + 12} ${headY - 10} L ${headX + 2} ${headY}`}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

// Dispatches to the appropriate vector biomechanical renderer for E1..E10
export function renderExerciseBiomechanicsById(
  exerciseId: ExerciseId,
  contraction: number,
  activeColor: string,
  isEccentricPhase: boolean
): React.ReactNode {
  switch (exerciseId) {
    case 'E1':
      return renderFloorFlyPressE1(contraction, activeColor);
    case 'E2':
      return renderFloorSqueezePressE2(contraction, activeColor);
    case 'E3':
      return renderSeatedShoulderPressE3(contraction, activeColor);
    case 'E4':
      return renderSeatedLateralRaiseE4(contraction, activeColor);
    case 'E5':
      return renderSeatedBilateralRowE5(contraction, activeColor);
    case 'E6':
      return renderSeatedRearDeltFlyE6(contraction, activeColor);
    case 'E7':
      return renderFloorDoublePulloverE7(contraction, activeColor);
    case 'E8':
      return renderSeatedZottmanCurlE8(contraction, activeColor, isEccentricPhase);
    case 'E9':
      return renderFloorSkullCrusherE9(contraction, activeColor);
    case 'E10':
      return renderChairLegsCrunchE10(contraction, activeColor);
    default:
      return renderFloorFlyPressE1(contraction, activeColor);
  }
}

// Main SVG animation component synchronized either to live timer props or an automatic 1s/3s preview loop
export const ExerciseAnimationSVG: React.FC<ExerciseAnimationSVGProps> = ({
  exerciseId,
  phase = 'idle',
  contractionProgress,
  autoAnimate = false,
  className = '',
}) => {
  const [previewState, setPreviewState] = useState<{
    contraction: number;
    simulatedPhase: 'concentric' | 'eccentric';
  }>({
    contraction: 0.5,
    simulatedPhase: 'concentric',
  });

  useEffect(() => {
    if (!autoAnimate) {
      return;
    }
    const startTimestamp = performance.now();

    const intervalId = window.setInterval(() => {
      const elapsed = performance.now() - startTimestamp;
      setPreviewState(calculateCycleContractionFromTime(elapsed));
    }, 100);

    return () => window.clearInterval(intervalId);
  }, [autoAnimate]);

  const effectiveContraction =
    typeof contractionProgress === 'number'
      ? Math.max(0, Math.min(1, contractionProgress))
      : previewState.contraction;

  const effectivePhase: WorkoutPhase = autoAnimate ? previewState.simulatedPhase : phase;

  const activeColor =
    effectivePhase === 'concentric'
      ? '#10b981' // emerald-500
      : effectivePhase === 'eccentric'
      ? '#f59e0b' // amber-500
      : '#0ea5e9'; // sky-500

  const phaseBadgeText =
    effectivePhase === 'concentric'
      ? 'CONCÉNTRICA · 1s SUBE'
      : effectivePhase === 'eccentric'
      ? 'EXCÉNTRICA · 3s BAJA'
      : effectivePhase === 'prepare'
      ? 'PREPARACIÓN · 10s'
      : effectivePhase === 'rest'
      ? 'DESCANSO · 20s'
      : 'EJECUCIÓN BIOMECÁNICA';

  return (
    <div
      className={`relative w-full bg-slate-950/90 border border-slate-800 rounded-xl overflow-hidden flex flex-col items-center justify-center p-4 ${className}`}
    >
      <svg
        viewBox="0 0 400 225"
        className="w-full h-full max-h-64 select-none"
        role="img"
        aria-label={`Animación biomecánica del ejercicio ${exerciseId}`}
      >
        {/* Subtle Technical Grid Background */}
        <defs>
          <pattern id={`grid-${exerciseId}`} width="25" height="25" patternUnits="userSpaceOnUse">
            <path
              d="M 25 0 L 0 0 0 25"
              fill="none"
              stroke="#1e293b"
              strokeWidth="0.6"
              opacity="0.6"
            />
          </pattern>
        </defs>
        <rect width="400" height="225" fill={`url(#grid-${exerciseId})`} />

        {/* Top Status Badges inside SVG */}
        <g transform="translate(12, 12)">
          <rect
            x="0"
            y="0"
            width="98"
            height="22"
            rx="6"
            fill="#0f172a"
            stroke="#334155"
            strokeWidth="1"
          />
          <text x="49" y="14.5" textAnchor="middle" className="fill-emerald-400 text-[9.5px] font-bold">
            CERO IMPACTO
          </text>
        </g>

        <g transform="translate(242, 12)">
          <rect
            x="0"
            y="0"
            width="146"
            height="22"
            rx="6"
            fill="#0f172a"
            stroke={activeColor}
            strokeWidth="1.2"
          />
          <text
            x="73"
            y="14.5"
            textAnchor="middle"
            fill={activeColor}
            className="text-[9.5px] font-bold tracking-wider"
          >
            {phaseBadgeText}
          </text>
        </g>

        {/* Exercise Specific Vector Illustration */}
        {renderExerciseBiomechanicsById(
          exerciseId,
          effectiveContraction,
          activeColor,
          effectivePhase === 'eccentric'
        )}
      </svg>
    </div>
  );
};
