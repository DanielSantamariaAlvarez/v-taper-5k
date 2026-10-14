import { ExerciseDefinition, ExerciseId, MuscleGroupId } from '../types/workout';

// Dictionary of Spanish labels for each anatomical muscle group
export const MUSCLE_GROUP_LABELS: Record<MuscleGroupId, string> = {
  chest_major: 'Pectoral Mayor',
  chest_inner_upper: 'Pectoral Interno / Superior',
  delt_anterior: 'Deltoides Anterior',
  delt_lateral: 'Deltoides Lateral',
  delt_posterior: 'Deltoides Posterior',
  traps_upper: 'Trapecio Superior',
  traps_middle: 'Trapecio Medio',
  rhomboids: 'Romboides',
  lats: 'Dorsal Ancho',
  serratus: 'Serrato Anterior',
  biceps: 'Bíceps Braquial',
  brachioradialis: 'Braquiorradial',
  forearms: 'Antebrazo',
  triceps: 'Tríceps Braquial',
  anconeus: 'Ancóneo',
  abs_rectus: 'Recto Abdominal',
  obliques: 'Oblicuos',
};

// Complete catalog of the 10 bilateral 5kg dumbbell exercises (100% seated or floor-based for zero meniscus load)
export const EXERCISES_CATALOG: ExerciseDefinition[] = [
  {
    id: 'E1',
    code: 'E1',
    name: 'Aperturas + Press en Suelo',
    subtitle: 'Pecho y Tríceps',
    postureLabel: 'Acostado boca arriba en suelo',
    postureType: 'floor_supine',
    dumbbellLoadLabel: '2 × 5 kg (Bilateral)',
    description:
      'Acostado boca arriba con piernas en reposo total. Abrir ambos brazos semi-estirados en cruz hasta que los codos rocen el suelo y subir cerrando sobre el pecho con máxima tensión.',
    executionSteps: [
      'Túmbate boca arriba sobre una esterilla con las piernas relajadas sin tensión en las rodillas.',
      'En 1 segundo (fase concéntrica), sube y cierra ambas mancuernas sobre la línea media del pecho apretando el pectoral.',
      'En 3 segundos (fase excéntrica), abre los brazos semi-estirados en arco amplio hasta que los tríceps/codos rocen suavemente el suelo.',
    ],
    meniscusSafetyNote:
      'Piernas en reposo pasivo sobre el suelo. Prohibido empujar con los talones (cero leg-drive) para aislar el torso y proteger el menisco.',
    tempoNote: '1s subir y apretar pecho | 3s bajar abriendo en arco controlado',
    primaryMuscles: ['chest_major'],
    secondaryMuscles: ['delt_anterior', 'triceps'],
    primaryMusclesLabel: 'Pectoral Mayor',
    secondaryMusclesLabel: 'Deltoides Anterior, Tríceps',
  },
  {
    id: 'E2',
    code: 'E2',
    name: 'Squeeze Press en Suelo',
    subtitle: 'Pecho Interno y Superior',
    postureLabel: 'Acostado boca arriba en suelo',
    postureType: 'floor_supine',
    dumbbellLoadLabel: '2 × 5 kg (Prensa Isométrica)',
    description:
      'Acostado boca arriba, juntar las dos mancuernas de 5 kg en el centro apretándolas con fuerza una contra la otra durante todo el recorrido al subir y bajar.',
    executionSteps: [
      'Coloca ambas mancuernas con agarre neutro (palmas enfrentadas) en contacto total sobre el esternón.',
      'Presiona una mancuerna contra la otra con fuerza constante para activar el surco pectoral interno.',
      'Empuja verticalmente en 1 segundo manteniendo la presión entre pesas y desciende lento en 3 segundos hasta rozar el pecho.',
    ],
    meniscusSafetyNote:
      'Decúbito supino estricto sin apoyo activo de piernas. Toda la tensión proviene de la aducción isométrica de los brazos.',
    tempoNote: '1s empuje vertical apretando mancuernas | 3s descenso isométrico continuo',
    primaryMuscles: ['chest_inner_upper', 'chest_major'],
    secondaryMuscles: ['triceps', 'delt_anterior'],
    primaryMusclesLabel: 'Pectoral Interno/Superior',
    secondaryMusclesLabel: 'Tríceps, Deltoides Anterior',
  },
  {
    id: 'E3',
    code: 'E3',
    name: 'Press Militar Sentado',
    subtitle: 'Hombros Completos',
    postureLabel: 'Sentado con espalda apoyada',
    postureType: 'seated_upright',
    dumbbellLoadLabel: '2 × 5 kg (Bilateral)',
    description:
      'Sentado con espalda apoyada, empujar ambas mancuernas desde la altura de las orejas hacia el techo de forma simultánea y controlada.',
    executionSteps: [
      'Siéntate con la espalda firme contra el respaldo y las piernas descansando sin hacer fuerza contra el suelo.',
      'Inicia con las mancuernas a la altura de las orejas, codos ligeramente adelantados (plano escapular a 30°).',
      'Empuja hacia el techo en 1 segundo sin chocar las pesas y baja resistiendo la gravedad durante 3 segundos.',
    ],
    meniscusSafetyNote:
      'Al realizar el press estrictamente sentado con respaldo, se elimina el empuje de rodillas y la compresión articular del tren inferior.',
    tempoNote: '1s empuje explosivo controlado al techo | 3s bajada hasta nivel de las orejas',
    primaryMuscles: ['delt_anterior', 'delt_lateral'],
    secondaryMuscles: ['triceps'],
    primaryMusclesLabel: 'Deltoides Anterior y Lateral',
    secondaryMusclesLabel: 'Tríceps',
  },
  {
    id: 'E4',
    code: 'E4',
    name: 'Elevaciones Laterales Sentado',
    subtitle: 'Hombro Lateral / Efecto V',
    postureLabel: 'Sentado erguido sin impulso',
    postureType: 'seated_upright',
    dumbbellLoadLabel: '2 × 5 kg (Bilateral)',
    description:
      'Sentado erguido, levantar ambos brazos hacia los lados hasta la altura de los hombros y bajar en 3 segundos para maximizar la anchura clavicular.',
    executionSteps: [
      'Siéntate erguido en el borde o centro de la silla con el abdomen firme y los brazos a los lados.',
      'En 1 segundo, eleva ambos brazos hacia afuera guiando con los codos hasta llegar a la paralela del suelo (90°).',
      'Desciende en 3 segundos exactos frenando el peso sin dejar que las mancuernas descansen abajo.',
    ],
    meniscusSafetyNote:
      'La posición sentada anula por completo cualquier balanceo de cadera o flexión de rodilla.',
    tempoNote: '1s elevación lateral hasta la horizontal | 3s excéntrica lenta resistida',
    primaryMuscles: ['delt_lateral'],
    secondaryMuscles: ['traps_upper'],
    primaryMusclesLabel: 'Deltoides Lateral',
    secondaryMusclesLabel: 'Trapecio Superior',
  },
  {
    id: 'E5',
    code: 'E5',
    name: 'Remo Bilateral Sentado',
    subtitle: 'Espalda / Dorsales en V',
    postureLabel: 'Sentado inclinado 45° hacia adelante',
    postureType: 'seated_hinged',
    dumbbellLoadLabel: '2 × 5 kg (Bilateral)',
    description:
      'Sentado al borde de la silla, pies apoyados sin empujar, inclinar el torso 45° hacia adelante y tirar de ambas mancuernas a la vez hacia las caderas apretando escápulas.',
    executionSteps: [
      'Siéntate en la silla, apoya los talones suavemente sin cargar peso e inclina el torso recto 45° hacia adelante.',
      'En 1 segundo, tracciona ambas mancuernas hacia los bolsillos/caderas retrayendo y apretando fuerte las escápulas.',
      'En 3 segundos, extiende los brazos de forma controlada sintiendo el estiramiento completo del dorsal ancho.',
    ],
    meniscusSafetyNote:
      'Los pies solo mantienen el equilibrio pasivo; el peso recae en los isquiones sobre la silla, liberando las rodillas al 100%.',
    tempoNote: '1s tirón hacia caderas y retracción escapular | 3s descenso estirando dorsales',
    primaryMuscles: ['lats', 'rhomboids'],
    secondaryMuscles: ['biceps', 'delt_posterior'],
    primaryMusclesLabel: 'Dorsal Ancho, Romboides',
    secondaryMusclesLabel: 'Bíceps, Deltoides Posterior',
  },
  {
    id: 'E6',
    code: 'E6',
    name: 'Pájaros Sentado / Vuelos Posteriores',
    subtitle: 'Hombro Posterior y Postura',
    postureLabel: 'Sentado e inclinado hacia adelante',
    postureType: 'seated_hinged',
    dumbbellLoadLabel: '2 × 5 kg (Bilateral)',
    description:
      'Sentado e inclinado hacia adelante, abrir ambos brazos en cruz llevando los codos altos hacia atrás para esculpir la cara posterior del hombro.',
    executionSteps: [
      'Inclinado hacia adelante desde la cadera sobre la silla, deja colgar las mancuernas debajo de las rodillas.',
      'En 1 segundo, abre ambos brazos en cruz dirigiendo los codos altos y hacia afuera.',
      'Baja lentamente durante 3 segundos manteniendo la tensión constante en el deltoides posterior.',
    ],
    meniscusSafetyNote:
      'Postura 100% descargada sobre el asiento; cero estrés rotacional ni axial sobre la articulación de la rodilla.',
    tempoNote: '1s apertura posterior explosiva | 3s retorno lento sin perder tensión',
    primaryMuscles: ['delt_posterior', 'traps_middle'],
    secondaryMuscles: ['rhomboids'],
    primaryMusclesLabel: 'Deltoides Posterior, Trapecio Medio',
    secondaryMusclesLabel: 'Romboides',
  },
  {
    id: 'E7',
    code: 'E7',
    name: 'Pullover en Suelo con Doble Mancuerna',
    subtitle: 'Dorsales y Serratos',
    postureLabel: 'Acostado boca arriba en suelo',
    postureType: 'floor_supine',
    dumbbellLoadLabel: '2 × 5 kg juntas (10 kg totales)',
    description:
      'Acostado boca arriba, sostener una mancuerna en cada mano pegadas entre sí (10 kg totales), llevarlas atrás de la cabeza rozando el suelo y volver apretando el abdomen.',
    executionSteps: [
      'Túmbate boca arriba y une ambas mancuernas de 5 kg con agarre neutro firme sobre el pecho (10 kg combinados).',
      'En la fase excéntrica de 3 segundos, lleva los brazos semi-rígidos hacia atrás de la cabeza hasta rozar el suelo.',
      'En 1 segundo, tira con los dorsales y el serrato de vuelta hasta la línea vertical del pecho apretando el core.',
    ],
    meniscusSafetyNote:
      'Mantén la zona lumbar estable con las piernas relajadas en el suelo; evita arquear empujando con los pies.',
    tempoNote: '1s retorno dorsal hacia el pecho | 3s extensión amplia detrás de la cabeza',
    primaryMuscles: ['lats', 'serratus'],
    secondaryMuscles: ['chest_major', 'abs_rectus'],
    primaryMusclesLabel: 'Dorsal Ancho, Serrato',
    secondaryMusclesLabel: 'Pectoral, Core',
  },
  {
    id: 'E8',
    code: 'E8',
    name: 'Curl de Bíceps + Zottman Sentado',
    subtitle: 'Bíceps y Antebrazos',
    postureLabel: 'Sentado con codos pegados al torso',
    postureType: 'seated_upright',
    dumbbellLoadLabel: '2 × 5 kg (Bilateral)',
    description:
      'Sentado con codos pegados al torso, subir ambas mancuernas con palmas hacia arriba en 1s, girar muñecas arriba y bajar en 3s con palmas hacia abajo.',
    executionSteps: [
      'Siéntate erguido con los codos bloqueados a los costados del torso y las palmas mirando hacia adelante (supinación).',
      'Sube ambas mancuernas en 1 segundo apretando el bíceps al máximo y gira las muñecas arriba a pronación (palmas abajo).',
      'Desciende durante 3 segundos con las palmas hacia abajo para sobrecargar el braquiorradial y los extensores del antebrazo.',
    ],
    meniscusSafetyNote:
      'El giro Zottman convierte 5 kg en un estímulo intenso tanto en la subida supina como en la bajada prona, sentado y sin carga en piernas.',
    tempoNote: '1s subida supina + giro arriba | 3s bajada prona estricta (Zottman)',
    primaryMuscles: ['biceps', 'brachioradialis'],
    secondaryMuscles: ['forearms'],
    primaryMusclesLabel: 'Bíceps Braquial, Braquiorradial',
    secondaryMusclesLabel: 'Antebrazo',
  },
  {
    id: 'E9',
    code: 'E9',
    name: 'Rompecráneos en Suelo con Dos Mancuernas',
    subtitle: 'Tríceps Braquial',
    postureLabel: 'Acostado boca arriba en suelo',
    postureType: 'floor_supine',
    dumbbellLoadLabel: '2 × 5 kg (Bilateral)',
    description:
      'Acostado boca arriba, una mancuerna en cada mano en vertical, doblar solo los codos llevando las pesas a los lados de la frente y extender en 1s.',
    executionSteps: [
      'Túmbate en el suelo con los brazos verticales hacia el techo y los hombros fijos (húmeros ligeramente inclinados atrás).',
      'En 3 segundos, flexiona únicamente los codos bajando las mancuernas de forma controlada a los lados de las sienes/frente.',
      'En 1 segundo, extiende los codos con fuerza contrayendo las tres cabezas del tríceps sin mover los hombros.',
    ],
    meniscusSafetyNote:
      'Ejecución en suelo con estabilidad escapular total y cero intervención del tren inferior.',
    tempoNote: '1s extensión completa de codos | 3s flexión lenta hacia las sienes',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['anconeus'],
    primaryMusclesLabel: 'Tríceps Braquial',
    secondaryMusclesLabel: 'Ancóneo',
  },
  {
    id: 'E10',
    code: 'E10',
    name: 'Crunch Abdominal con Piernas en Silla',
    subtitle: 'Recto Abdominal y Oblicuos',
    postureLabel: 'Suelo con pantorrillas en silla (90°)',
    postureType: 'floor_legs_chair',
    dumbbellLoadLabel: 'Peso Corporal / Tensión Continua',
    description:
      'Acostado en el suelo con las pantorrillas reposando sobre el asiento de una silla (rodillas a 90° sin carga en menisco). Subir hombros en 1s apretando el abdomen y bajar en 3s.',
    executionSteps: [
      'Acuéstate boca arriba y apoya las pantorrillas pasivamente sobre el asiento de una silla (cadera y rodillas a 90° en descarga total).',
      'En 1 segundo, enrolla la columna dorsal elevando las escápulas del suelo mientras expulsas todo el aire y aprietas el abdomen.',
      'En 3 segundos, desciende vértebra por vértebra manteniendo tensión abdominal sin relajar la cabeza en el suelo.',
    ],
    meniscusSafetyNote:
      'Las pantorrillas descansan pasivamente sobre el acolchado de la silla: cero flexo-extensión activa de rodilla y pelvis neutralizada.',
    tempoNote: '1s contracción máxima expirando | 3s retorno excéntrico vértebra a vértebra',
    primaryMuscles: ['abs_rectus', 'obliques'],
    secondaryMuscles: ['serratus'],
    primaryMusclesLabel: 'Recto Abdominal, Oblicuos',
    secondaryMusclesLabel: 'Serrato Anterior',
  },
];

// Helper function to retrieve an exercise definition by its ID
export function getExerciseById(exerciseId: ExerciseId): ExerciseDefinition {
  const found = EXERCISES_CATALOG.find((item) => item.id === exerciseId);
  if (!found) {
    return EXERCISES_CATALOG[0];
  }
  return found;
}
