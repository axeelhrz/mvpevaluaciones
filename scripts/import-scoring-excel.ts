import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

interface ScoringRow {
  tipo: string;
  escalaCompetencia: string;
  escalaComposicion: string;
  normaContraste: string;
  nombrePDF: string;
  seccionPDF: string;
}

async function importarScoringDesdeExcel() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📊 IMPORTANDO MAPEO DE SCORING DESDE EXCEL');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    // Leer el archivo Excel
    const workbook = XLSX.readFile('Reactivos.xlsx');
    
    // Buscar la hoja de Scoring
    const scoringSheetName = workbook.SheetNames.find(name => 
      name.toLowerCase().includes('scoring')
    );

    if (!scoringSheetName) {
      throw new Error('No se encontró la hoja de Scoring en el Excel');
    }

    console.log(`✅ Hoja de Scoring encontrada: "${scoringSheetName}"\n`);

    const worksheet = workbook.Sheets[scoringSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as any[];

    console.log(`📋 Total de filas en Scoring: ${data.length}\n`);

    if (data.length === 0) {
      throw new Error('La hoja de Scoring está vacía');
    }

    // Mostrar columnas disponibles
    const columnas = Object.keys(data[0]);
    console.log('📋 Columnas encontradas:');
    columnas.forEach(col => console.log(`   • ${col}`));
    console.log('');

    // Mapear columnas con búsqueda más flexible
    const colTipo = columnas.find(c => c.toLowerCase().includes('tipo'));
    const colEscala = columnas.find(c => 
      c.toLowerCase().includes('escala') || 
      c.toLowerCase().includes('competencia')
    );
    const colComposicion = columnas.find(c => 
      c.toLowerCase().includes('compone') || 
      c.toLowerCase().includes('composición')
    );
    const colNorma = columnas.find(c => 
      c.toLowerCase().includes('norma') && 
      c.toLowerCase().includes('contraste')
    );
    const colNombrePDF = columnas.find(c => 
      c.toLowerCase().includes('visualización') || 
      (c.toLowerCase().includes('nombre') && c.toLowerCase().includes('pdf'))
    );
    const colSeccionPDF = columnas.find(c => 
      c.toLowerCase().includes('sección') || 
      c.toLowerCase().includes('seccion')
    );

    console.log('📋 Mapeo de columnas:');
    console.log(`   • Tipo: ${colTipo || 'NO ENCONTRADA'}`);
    console.log(`   • Escala/Competencia: ${colEscala || 'NO ENCONTRADA'}`);
    console.log(`   • Composición: ${colComposicion || 'NO ENCONTRADA'}`);
    console.log(`   • Norma: ${colNorma || 'NO ENCONTRADA'}`);
    console.log(`   • Nombre PDF: ${colNombrePDF || 'NO ENCONTRADA'}`);
    console.log(`   • Sección PDF: ${colSeccionPDF || 'NO ENCONTRADA'}`);
    console.log('');

    if (!colTipo || !colEscala) {
      throw new Error('No se encontraron las columnas necesarias en la hoja de Scoring');
    }

    // Mostrar primeras 3 filas completas para debug
    console.log('📋 Primeras 3 filas de ejemplo:\n');
    data.slice(0, 3).forEach((row: any, index) => {
      console.log(`Fila ${index + 1}:`);
      console.log(`   Tipo: ${row[colTipo!]}`);
      console.log(`   Escala/Competencia: ${row[colEscala!]}`);
      console.log(`   Composición: ${colComposicion ? row[colComposicion] : 'N/A'}`);
      console.log(`   Norma: ${colNorma ? row[colNorma] : 'N/A'}`);
      console.log(`   Nombre PDF: ${colNombrePDF ? row[colNombrePDF] : 'N/A'}`);
      console.log(`   Sección PDF: ${colSeccionPDF ? row[colSeccionPDF] : 'N/A'}`);
      console.log('');
    });

    // Procesar datos
    const escalas = new Map<string, ScoringRow>();
    const competenciasA = new Map<string, ScoringRow>();
    const competenciasB = new Map<string, ScoringRow>();

    data.forEach((row: any) => {
      const tipo = row[colTipo]?.toString().trim().toUpperCase();
      const nombre = row[colEscala]?.toString().trim();

      if (!tipo || !nombre) return;

      const scoringRow: ScoringRow = {
        tipo,
        escalaCompetencia: nombre,
        escalaComposicion: colComposicion ? (row[colComposicion]?.toString().trim() || '') : '',
        normaContraste: colNorma ? (row[colNorma]?.toString().trim() || '') : '',
        nombrePDF: colNombrePDF ? (row[colNombrePDF]?.toString().trim() || nombre) : nombre,
        seccionPDF: colSeccionPDF ? (row[colSeccionPDF]?.toString().trim() || '') : ''
      };

      if (tipo === 'ESCALA' || tipo === 'E') {
        escalas.set(nombre, scoringRow);
      } else if (tipo === 'COMPETENCIA A' || tipo === 'CA' || tipo === 'A') {
        competenciasA.set(nombre, scoringRow);
      } else if (tipo === 'COMPETENCIA B' || tipo === 'CB' || tipo === 'B' || tipo === 'POTENCIAL') {
        competenciasB.set(nombre, scoringRow);
      }
    });

    console.log('📊 Resumen de datos procesados:');
    console.log(`   • Escalas: ${escalas.size}`);
    console.log(`   • Competencias A: ${competenciasA.size}`);
    console.log(`   • Competencias B: ${competenciasB.size}`);
    console.log('');

    // Mostrar ejemplos con sección PDF
    console.log('📋 Ejemplos de Escalas (primeras 5):');
    let count = 0;
    for (const [nombre, data] of escalas.entries()) {
      if (count < 5) {
        console.log(`   ${count + 1}. ${nombre}`);
        console.log(`      - Composición: ${data.escalaComposicion || 'N/A'}`);
        console.log(`      - Norma: ${data.normaContraste || 'N/A'}`);
        console.log(`      - Nombre PDF: ${data.nombrePDF || 'N/A'}`);
        console.log(`      - Sección PDF: ${data.seccionPDF || 'N/A'}`);
        count++;
      }
    }
    console.log('');

    console.log('📋 Ejemplos de Competencias A (primeras 5):');
    count = 0;
    for (const [nombre, data] of competenciasA.entries()) {
      if (count < 5) {
        console.log(`   ${count + 1}. ${nombre}`);
        console.log(`      - Composición: ${data.escalaComposicion || 'N/A'}`);
        console.log(`      - Nombre PDF: ${data.nombrePDF || 'N/A'}`);
        console.log(`      - Sección PDF: ${data.seccionPDF || 'N/A'}`);
        count++;
      }
    }
    console.log('');

    console.log('📋 Competencias B (Potenciales):');
    count = 0;
    for (const [nombre, data] of competenciasB.entries()) {
      console.log(`   ${count + 1}. ${nombre}`);
      console.log(`      - Composición: ${data.escalaComposicion || 'N/A'}`);
      console.log(`      - Nombre PDF: ${data.nombrePDF || 'N/A'}`);
      console.log(`      - Sección PDF: ${data.seccionPDF || 'N/A'}`);
      count++;
    }
    console.log('');

    // Guardar en base de datos
    console.log('💾 Guardando en base de datos...\n');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variables de entorno faltantes:');
      console.error(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅' : '❌'}`);
      console.error(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseKey ? '✅' : '❌'}`);
      throw new Error('Faltan variables de entorno de Supabase');
    }

    console.log('✅ Variables de entorno cargadas correctamente\n');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Limpiar datos existentes
    console.log('🗑️  Limpiando datos existentes...');
    await supabase.from('ScoringConfig').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insertar escalas
    console.log('📥 Insertando escalas...');
    const escalasArray = Array.from(escalas.values()).map(e => ({
      tipo: 'ESCALA',
      nombre: e.escalaCompetencia,
      composicion: e.escalaComposicion,
      norma_contraste: e.normaContraste,
      nombre_pdf: e.nombrePDF,
      seccion_pdf: e.seccionPDF
    }));

    if (escalasArray.length > 0) {
      const { error: errorEscalas } = await supabase
        .from('ScoringConfig')
        .insert(escalasArray);

      if (errorEscalas) {
        console.error('❌ Error al insertar escalas:', errorEscalas);
      } else {
        console.log(`✅ ${escalasArray.length} escalas insertadas`);
      }
    }

    // Insertar competencias A
    console.log('📥 Insertando competencias A...');
    const competenciasAArray = Array.from(competenciasA.values()).map(c => ({
      tipo: 'COMPETENCIA_A',
      nombre: c.escalaCompetencia,
      composicion: c.escalaComposicion,
      norma_contraste: c.normaContraste,
      nombre_pdf: c.nombrePDF,
      seccion_pdf: c.seccionPDF
    }));

    if (competenciasAArray.length > 0) {
      const { error: errorCompA } = await supabase
        .from('ScoringConfig')
        .insert(competenciasAArray);

      if (errorCompA) {
        console.error('❌ Error al insertar competencias A:', errorCompA);
      } else {
        console.log(`✅ ${competenciasAArray.length} competencias A insertadas`);
      }
    }

    // Insertar competencias B
    console.log('📥 Insertando competencias B...');
    const competenciasBArray = Array.from(competenciasB.values()).map(c => ({
      tipo: 'COMPETENCIA_B',
      nombre: c.escalaCompetencia,
      composicion: c.escalaComposicion,
      norma_contraste: c.normaContraste,
      nombre_pdf: c.nombrePDF,
      seccion_pdf: c.seccionPDF
    }));

    if (competenciasBArray.length > 0) {
      const { error: errorCompB } = await supabase
        .from('ScoringConfig')
        .insert(competenciasBArray);

      if (errorCompB) {
        console.error('❌ Error al insertar competencias B:', errorCompB);
      } else {
        console.log(`✅ ${competenciasBArray.length} competencias B insertadas`);
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ IMPORTACIÓN COMPLETADA EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`📊 Total importado: ${escalasArray.length + competenciasAArray.length + competenciasBArray.length} registros`);
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error al importar scoring:', error);
    process.exit(1);
  }
}

importarScoringDesdeExcel();