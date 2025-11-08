/**
 * CONFIGURACIÓN DEL CUESTIONARIO PSICOFINANCIERO
 * 
 * Este archivo contiene la estructura completa del cuestionario:
 * - Sección 1: Datos Estadísticos (11 campos)
 * - Sección 2: Pareamiento Forzado Positivo (96 pares)
 * - Sección 3: Pareamiento Forzado Negativo (72 pares)
 * - Sección 4: Escala Likert Habilidades Financieras (25 preguntas)
 */

// ============================================
// TIPOS
// ============================================

export interface CampoEstadistico {
  id: string;
  nombre: string;
  tipo: 'text' | 'email' | 'select' | 'textarea';
  obligatorio: boolean;
  opciones?: string[];
  placeholder?: string;
}

export interface PreguntaPareamiento {
  numero: number;
  itemPareado: number;
  opcionA: {
    texto: string;
    reactivoId: number;
    escala: string;
    tipo: 'Pos' | 'Neg';
    puntaje: number;
  };
  opcionB: {
    texto: string;
    reactivoId: number;
    escala: string;
    tipo: 'Pos' | 'Neg';
    puntaje: number;
  };
}

export interface PreguntaLikert {
  numero: number;
  reactivoId: number;
  texto: string;
  escala: string;
}

// ============================================
// SECCIÓN 1: DATOS ESTADÍSTICOS
// ============================================

export const INSTRUCCIONES_SECCION_1 = `
Estimado participante:

Te damos una cordial bienvenida a la evaluación en línea. El tiempo estimado para resolver el cuestionario es de 30 minutos y nos dará información valiosa sobre tu forma de ser en el trabajo.

Te recomendamos realizar la evaluación en una sola aplicación y de preferencia en condiciones que te permitan concentrarte.

La prueba consta de 3 secciones. En la primera se te pedirá información únicamente para tener un control estadístico de tus respuestas. La segunda y la tercera corresponden propiamente a la evaluación. En medida que vayas avanzando se te darán instrucciones para responder correctamente.

Adelante.

Por favor contesta lo que se te pide a continuación.
`;

export const CAMPOS_ESTADISTICOS: CampoEstadistico[] = [
  {
    id: 'email',
    nombre: 'Correo electrónico',
    tipo: 'email',
    obligatorio: true,
    placeholder: 'ejemplo@correo.com'
  },
  {
    id: 'nombre_completo',
    nombre: 'Nombre y apellidos',
    tipo: 'text',
    obligatorio: true,
    placeholder: 'Juan Pérez García'
  },
  {
    id: 'situacion_laboral',
    nombre: 'Situación Laboral',
    tipo: 'select',
    obligatorio: true,
    opciones: ['Empleado', 'Desempleado', 'Estudiante', 'Independiente', 'Otro']
  },
  {
    id: 'genero',
    nombre: 'Género',
    tipo: 'select',
    obligatorio: true,
    opciones: ['Masculino', 'Femenino', 'Otro', 'Prefiero no decir']
  },
  {
    id: 'edad',
    nombre: 'Edad',
    tipo: 'text',
    obligatorio: true,
    placeholder: '25'
  },
  {
    id: 'pais_ciudad',
    nombre: 'País y Ciudad de residencia',
    tipo: 'text',
    obligatorio: true,
    placeholder: 'México, Ciudad de México'
  },
  {
    id: 'nivel_academico',
    nombre: 'Nivel Académico',
    tipo: 'select',
    obligatorio: true,
    opciones: ['Secundaria', 'Preparatoria', 'Licenciatura', 'Superior a licenciatura']
  },
  {
    id: 'area_especializacion',
    nombre: '¿A qué te dedicas? (Tu área de especialización)',
    tipo: 'text',
    obligatorio: true,
    placeholder: 'Desarrollo de software'
  },
  {
    id: 'puesto_actual',
    nombre: '¿Cuál es tu puesto actual? Si estás desempleado, escribe por favor tu último puesto.',
    tipo: 'text',
    obligatorio: true,
    placeholder: 'Desarrollador Senior'
  },
  {
    id: 'areas_experiencia',
    nombre: 'Menciona las 3 áreas en las que tengas mayor experiencia (por ejemplo: Ventas, Almacén, Operaciones, Reclutamiento)',
    tipo: 'textarea',
    obligatorio: true,
    placeholder: 'Desarrollo web, Gestión de proyectos, Análisis de datos'
  },
  {
    id: 'nivel_maximo',
    nombre: 'Nivel máximo alcanzado',
    tipo: 'select',
    obligatorio: true,
    opciones: [
      'Analista o Especialista',
      'Supervisor, Jefe o Coordinador',
      'Gerente',
      'Subdirector, Director o Superior'
    ]
  },
  {
    id: 'ingreso_maximo',
    nombre: 'Ingreso máximo alcanzado',
    tipo: 'select',
    obligatorio: true,
    opciones: [
      'Hasta 10,000 pesos',
      'De 11,000 a 20,000 pesos',
      'De 21,000 a 30,000 pesos',
      'De 31,000 a 40,000',
      '41,000 a 50,000',
      'Más de 51,000'
    ]
  }
];

// ============================================
// SECCIÓN 2: PAREAMIENTO FORZADO POSITIVO
// ============================================

export const INSTRUCCIONES_SECCION_2 = `
Instrucciones Segunda Sección

En la siguiente sección se te presentarán pares de afirmaciones. Las afirmaciones pueden mostrar rasgos, comportamientos o actitudes con los que te podrás sentir más o menos identificado.

Para responder, deberás señalar para cada par de afirmaciones con cuál te identificas Más y con cuál te identificas Menos.

Toma en cuenta que solo se te permitirá elegir una opción de respuesta para cada afirmación.

Para facilitar tu elección, te recomendamos lo siguiente:

1. Primero lee atentamente cada una de las 2 afirmaciones.
2. Evalúa mentalmente qué tan identificado te sientes con cada afirmación, según sea tu caso particular.
3. Señala cuál es la afirmación con la que te identificas Más y con cuál Menos.

Para facilitar tus respuestas, también puedes pensar en cuál es la afirmación que es "Mayormente cierta" y cuál es "Mayormente Falsa".

Nota: Si te sientes igualmente identificado con las dos afirmaciones, o si sientes que no te identificas con ninguna, para ayudarte a elegir, piensa en lo que crees que diría de ti alguien que sea muy cercano a ti, o bien; escoge la afirmación que refleje el comportamiento que creas más posible de suceder en tu caso.

Considera que para este cuestionario no existen respuestas correctas o incorrectas sino que solo reflejan tu manera de ser, por lo que te pedimos contestar con total honestidad.

Agradecemos mucho tu tiempo y disposición.

Recuerda que para responder, deberás decidir para cada par de afirmaciones cuál de entre las 2 es con la que te identificas Más y con cuál te identificas Menos. Toma en cuenta que solo se te permitirá elegir una opción de respuesta para cada afirmación y que ambas afirmaciones deberán tener una opción seleccionada, una con "Me identifico más" y otra con "Me identifico menos".
`;

// Nota: Las preguntas de pareamiento se cargarán desde la base de datos
// basándose en los reactivos 1-96 (pares 1-96)

// ============================================
// SECCIÓN 3: PAREAMIENTO FORZADO NEGATIVO
// ============================================

export const INSTRUCCIONES_SECCION_3 = `
¡Felicidades! Has completado la segunda sección.

En esta última sección notarás que a diferencia de la anterior, las afirmaciones tienen un sentido negativo. Es decir, las afirmaciones reflejarán dificultades, inhabilidades, comportamientos o actitudes que también deberás comparar con tu forma de ser, sentir, pensar y actuar.

El procedimiento para responder es el mismo que en la sección anterior. Para cada par de afirmaciones deberás elegir con cuál de las dos afirmaciones te identificas Más y con cuál Menos.

Recuerda que si te sientes identificado con las dos afirmaciones por igual, o si no te identificas con ninguna, piensa en lo que crees que diría alguien que sea muy cercano a ti, o bien; escoge la afirmación que refleje el comportamiento más posible de suceder de acuerdo a tu caso particular.

Adelante. Continúa con la tercera sección.
`;

// Nota: Las preguntas de pareamiento negativo se cargarán desde la base de datos
// basándose en los reactivos 97-168 (pares 97-168)

// ============================================
// SECCIÓN 4: ESCALA LIKERT
// ============================================

export const INSTRUCCIONES_SECCION_4 = `
Instrucciones Cuarta Sección

A continuación encontrarás una serie de afirmaciones sobre rasgos que describen comportamientos relacionados con tu forma de administrar tus recursos.

Para cada afirmación, deberás seleccionar la casilla de la opción que más se acerque a tu situación particular.

Verás que las opciones de respuesta pretenden identificar qué tan Falsa o Verdadera es cada afirmación aplicada a tu caso.

Al responder, considera que la escala indica:
(1) Falso Completamente
(2) Moderadamente Falso
(3) Ni Falso ni Verdadero
(4) Moderadamente Verdadero
(5) Verdadero Completamente

Considera también que no existen respuestas buenas ni malas y que tu encuesta será tratada de manera absolutamente confidencial, por ello te pedimos que respondas con total honestidad.

Agradecemos mucho tu tiempo y disposición.

Adelante. Continúa con el cuestionario.

Recuerda que para responder, deberás decidir para cada afirmación qué tan verdadero o falso es de acuerdo a tu caso. Toma en cuenta que solo se te permitirá elegir una opción de respuesta para cada afirmación.
`;

export const OPCIONES_LIKERT = [
  { valor: 1, etiqueta: 'Falso Completamente' },
  { valor: 2, etiqueta: 'Moderadamente Falso' },
  { valor: 3, etiqueta: 'Ni Falso ni Verdadero' },
  { valor: 4, etiqueta: 'Moderadamente Verdadero' },
  { valor: 5, etiqueta: 'Verdadero Completamente' }
];

export const PREGUNTAS_LIKERT: PreguntaLikert[] = [
  {
    numero: 169,
    reactivoId: 337,
    texto: 'Tengo claras mis metas de ahorro, a corto, mediano y largo plazo.',
    escala: 'HABILIDAD_GENERACION_AHORRO'
  },
  {
    numero: 170,
    reactivoId: 338,
    texto: 'Gasto únicamente en lo necesario.',
    escala: 'HABILIDAD_CONTROL_GASTO'
  },
  {
    numero: 171,
    reactivoId: 339,
    texto: 'Tengo un plan para incrementar mis ingresos en el corto plazo.',
    escala: 'HABILIDAD_GENERACION_INGRESOS'
  },
  {
    numero: 172,
    reactivoId: 340,
    texto: 'Estoy ahorrando para un objetivo de largo plazo.',
    escala: 'HABILIDAD_GENERACION_AHORRO'
  },
  {
    numero: 173,
    reactivoId: 341,
    texto: 'Cuando se trata de dinero, tomo decisiones fría, racional y concienzudamente.',
    escala: 'HABILIDAD_CONTROL_GASTO'
  },
  {
    numero: 174,
    reactivoId: 342,
    texto: 'Invierto mi dinero en opciones que son convenientes para mí.',
    escala: 'HABILIDAD_GESTION_INVERSION'
  },
  {
    numero: 175,
    reactivoId: 343,
    texto: 'Nunca dejo ir una buena oportunidad para ganar un dinero extra.',
    escala: 'HABILIDAD_GENERACION_INGRESOS'
  },
  {
    numero: 176,
    reactivoId: 344,
    texto: 'Siempre guardo algo de lo que gano.',
    escala: 'HABILIDAD_GENERACION_AHORRO'
  },
  {
    numero: 177,
    reactivoId: 345,
    texto: 'Me implico activamente en crear oportunidades que me generen ingresos.',
    escala: 'HABILIDAD_GENERACION_INGRESOS'
  },
  {
    numero: 178,
    reactivoId: 346,
    texto: 'Realizo inversiones que me producen cada vez mejores rendimientos.',
    escala: 'HABILIDAD_GESTION_INVERSION'
  },
  {
    numero: 179,
    reactivoId: 347,
    texto: 'Mis deudas están perfectamente controladas.',
    escala: 'HABILIDAD_CONTROL_DEUDA'
  },
  {
    numero: 180,
    reactivoId: 348,
    texto: 'Me administro de una forma que siempre me queda algo para ahorrar.',
    escala: 'HABILIDAD_CONTROL_GASTO'
  },
  {
    numero: 181,
    reactivoId: 349,
    texto: 'Solo compro lo realmente necesario',
    escala: 'HABILIDAD_GENERACION_AHORRO'
  },
  {
    numero: 182,
    reactivoId: 350,
    texto: 'Al tomar decisiones de dinero me aseguro de obtener siempre el máximo rendimiento.',
    escala: 'HABILIDAD_CONTROL_GASTO'
  },
  {
    numero: 183,
    reactivoId: 351,
    texto: 'Me aseguro de sacar el mayor provecho a los recursos que tengo disponibles.',
    escala: 'HABILIDAD_GESTION_INVERSION'
  },
  {
    numero: 184,
    reactivoId: 352,
    texto: 'Estoy preparado para afrontar un imprevisto sin desestabilizar mis finanzas.',
    escala: 'HABILIDAD_CONTROL_DEUDA'
  },
  {
    numero: 185,
    reactivoId: 353,
    texto: 'De mis deudas siempre pago más del saldo mínimo.',
    escala: 'HABILIDAD_CONTROL_DEUDA'
  },
  {
    numero: 186,
    reactivoId: 354,
    texto: 'Actualmente estoy invirtiendo mi dinero.',
    escala: 'HABILIDAD_GESTION_INVERSION'
  },
  {
    numero: 187,
    reactivoId: 355,
    texto: 'Compro cosas solo cuando tengo la certeza de que las podré pagar.',
    escala: 'HABILIDAD_GENERACION_AHORRO'
  },
  {
    numero: 188,
    reactivoId: 356,
    texto: 'Constantemente estoy ideando formas de ganar dinero.',
    escala: 'HABILIDAD_GENERACION_INGRESOS'
  },
  {
    numero: 189,
    reactivoId: 357,
    texto: 'Acostumbro seguir un presupuesto de gasto.',
    escala: 'HABILIDAD_CONTROL_GASTO'
  },
  {
    numero: 190,
    reactivoId: 358,
    texto: 'Sacrifico parte de mis ganancias para volverlas a invertir.',
    escala: 'HABILIDAD_GESTION_INVERSION'
  },
  {
    numero: 191,
    reactivoId: 359,
    texto: 'Facilito las cosas para que el dinero venga a mí.',
    escala: 'HABILIDAD_GENERACION_INGRESOS'
  },
  {
    numero: 192,
    reactivoId: 360,
    texto: 'Nunca gasto más de lo que gano.',
    escala: 'HABILIDAD_CONTROL_DEUDA'
  },
  {
    numero: 193,
    reactivoId: 361,
    texto: 'Acostumbro Adelantar pagos para acabar más rápido con mis compromisos.',
    escala: 'HABILIDAD_CONTROL_DEUDA'
  }
];

// ============================================
// ESTRUCTURA DEL CUESTIONARIO COMPLETO
// ============================================

export interface EstructuraCuestionario {
  id: string;
  nombre: string;
  descripcion: string;
  tiempoEstimado: number; // en minutos
  secciones: {
    seccion1: {
      nombre: string;
      tipo: 'datos_estadisticos';
      instrucciones: string;
      campos: CampoEstadistico[];
    };
    seccion2: {
      nombre: string;
      tipo: 'pareamiento_positivo';
      instrucciones: string;
      rangoReactivos: { inicio: number; fin: number };
      totalPares: number;
    };
    seccion3: {
      nombre: string;
      tipo: 'pareamiento_negativo';
      instrucciones: string;
      rangoReactivos: { inicio: number; fin: number };
      totalPares: number;
    };
    seccion4: {
      nombre: string;
      tipo: 'likert';
      instrucciones: string;
      preguntas: PreguntaLikert[];
      opciones: typeof OPCIONES_LIKERT;
    };
  };
}

export const CUESTIONARIO_PSICOFINANCIERO: EstructuraCuestionario = {
  id: 'cuestionario-psicofinanciero-v1',
  nombre: 'Evaluación Psicofinanciera',
  descripcion: 'Cuestionario de evaluación de competencias psicofinancieras y habilidades de gestión de recursos',
  tiempoEstimado: 30,
  secciones: {
    seccion1: {
      nombre: 'Datos Estadísticos',
      tipo: 'datos_estadisticos',
      instrucciones: INSTRUCCIONES_SECCION_1,
      campos: CAMPOS_ESTADISTICOS
    },
    seccion2: {
      nombre: 'Pareamiento Forzado - Afirmaciones Positivas',
      tipo: 'pareamiento_positivo',
      instrucciones: INSTRUCCIONES_SECCION_2,
      rangoReactivos: { inicio: 1, fin: 192 },
      totalPares: 96
    },
    seccion3: {
      nombre: 'Pareamiento Forzado - Afirmaciones Negativas',
      tipo: 'pareamiento_negativo',
      instrucciones: INSTRUCCIONES_SECCION_3,
      rangoReactivos: { inicio: 193, fin: 336 },
      totalPares: 72
    },
    seccion4: {
      nombre: 'Habilidades Financieras',
      tipo: 'likert',
      instrucciones: INSTRUCCIONES_SECCION_4,
      preguntas: PREGUNTAS_LIKERT,
      opciones: OPCIONES_LIKERT
    }
  }
};

// ============================================
// FUNCIONES HELPER
// ============================================

/**
 * Obtener el número total de preguntas del cuestionario
 */
export function getTotalPreguntas(): number {
  return (
    CUESTIONARIO_PSICOFINANCIERO.secciones.seccion2.totalPares +
    CUESTIONARIO_PSICOFINANCIERO.secciones.seccion3.totalPares +
    CUESTIONARIO_PSICOFINANCIERO.secciones.seccion4.preguntas.length
  );
}

/**
 * Obtener el progreso del cuestionario
 */
export function calcularProgreso(seccionActual: number, preguntaActual: number): number {
  const total = getTotalPreguntas();
  let preguntasCompletadas = 0;

  if (seccionActual === 1) {
    preguntasCompletadas = 0;
  } else if (seccionActual === 2) {
    preguntasCompletadas = preguntaActual;
  } else if (seccionActual === 3) {
    preguntasCompletadas = 96 + preguntaActual;
  } else if (seccionActual === 4) {
    preguntasCompletadas = 96 + 72 + preguntaActual;
  }

  return Math.round((preguntasCompletadas / total) * 100);
}

/**
 * Validar respuesta de pareamiento
 */
export function validarRespuestaPareamiento(
  opcionA: 'mas' | 'menos' | null,
  opcionB: 'mas' | 'menos' | null
): { valida: boolean; error?: string } {
  if (!opcionA || !opcionB) {
    return {
      valida: false,
      error: 'Debes seleccionar una opción para ambas afirmaciones'
    };
  }

  if (opcionA === opcionB) {
    return {
      valida: false,
      error: 'Debes seleccionar "Me identifico más" en una afirmación y "Me identifico menos" en la otra'
    };
  }

  return { valida: true };
}

/**
 * Validar respuesta Likert
 */
export function validarRespuestaLikert(valor: number | null): { valida: boolean; error?: string } {
  if (valor === null || valor === undefined) {
    return {
      valida: false,
      error: 'Debes seleccionar una opción'
    };
  }

  if (valor < 1 || valor > 5) {
    return {
      valida: false,
      error: 'El valor debe estar entre 1 y 5'
    };
  }

  return { valida: true };
}
