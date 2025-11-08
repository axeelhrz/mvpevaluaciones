export interface CampoEstadisticoConfig {
  nombre: string;
  tipo: 'TEXTO' | 'EMAIL' | 'TELEFONO' | 'NUMERO' | 'FECHA' | 'SELECCION';
  requerido: boolean;
  orden: number;
  opciones?: string[];
}

export const CAMPOS_ESTADISTICOS: CampoEstadisticoConfig[] = [
  {
    nombre: 'Correo electrónico',
    tipo: 'EMAIL',
    requerido: true,
    orden: 1
  },
  {
    nombre: 'Nombre y apellidos',
    tipo: 'TEXTO',
    requerido: true,
    orden: 2
  },
  {
    nombre: 'Situación Laboral',
    tipo: 'SELECCION',
    requerido: true,
    orden: 3,
    opciones: [
      'Empleado',
      'Desempleado',
      'Estudiante',
      'Independiente',
      'Empresario'
    ]
  },
  {
    nombre: 'Género',
    tipo: 'SELECCION',
    requerido: true,
    orden: 4,
    opciones: [
      'Masculino',
      'Femenino',
      'Otro',
      'Prefiero no decir'
    ]
  },
  {
    nombre: 'Edad',
    tipo: 'NUMERO',
    requerido: true,
    orden: 5
  },
  {
    nombre: 'País y Ciudad de residencia',
    tipo: 'TEXTO',
    requerido: true,
    orden: 6
  },
  {
    nombre: 'Nivel Académico',
    tipo: 'SELECCION',
    requerido: true,
    orden: 7,
    opciones: [
      'Secundaria',
      'Preparatoria',
      'Licenciatura',
      'Superior a licenciatura'
    ]
  },
  {
    nombre: '¿A qué te dedicas? (Tu área de especialización)',
    tipo: 'TEXTO',
    requerido: true,
    orden: 8
  },
  {
    nombre: '¿Cuál es tu puesto actual? Si estás desempleado, escribe por favor tu último puesto.',
    tipo: 'TEXTO',
    requerido: true,
    orden: 9
  },
  {
    nombre: 'Menciona las 3 áreas en las que tengas mayor experiencia (por ejemplo: Ventas, Almacén, Operaciones, Reclutamiento)',
    tipo: 'TEXTO',
    requerido: true,
    orden: 10
  },
  {
    nombre: 'Nivel máximo alcanzado',
    tipo: 'SELECCION',
    requerido: true,
    orden: 11,
    opciones: [
      'Analista o Especialista',
      'Supervisor, Jefe o Coordinador',
      'Gerente',
      'Subdirector, Director o Superior'
    ]
  },
  {
    nombre: 'Ingreso máximo alcanzado',
    tipo: 'SELECCION',
    requerido: true,
    orden: 12,
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

// Función helper para obtener todos los campos
export function getCamposEstadisticos(): CampoEstadisticoConfig[] {
  return CAMPOS_ESTADISTICOS.sort((a, b) => a.orden - b.orden);
}
