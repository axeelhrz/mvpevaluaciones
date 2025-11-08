import * as XLSX from 'xlsx';
import { ESCALAS, COMPETENCIAS_A, COMPETENCIAS_B } from '../lib/competencias-config';

interface Reactivo {
  idOrd: number;
  itemPareado: string;
  reactivo: string;
  tipo: string;
  puntajeFijo: number;
  test: string;
  escala: string;
}

async function verificarCoberturaReactivos() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔍 VERIFICACIÓN DE COBERTURA DEL EXCEL DE REACTIVOS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Leer el archivo Excel
  const workbook = XLSX.readFile('Reactivos.xlsx');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data: Reactivo[] = XLSX.utils.sheet_to_json(worksheet);

  console.log(`📊 Total de reactivos en Excel: ${data.length}\n`);

  // ============================================
  // 1. VERIFICAR ESCALAS EN EL EXCEL
  // ============================================

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📏 VERIFICACIÓN DE ESCALAS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const escalasEnExcel = new Set(data.map(r => r.escala));
  console.log(`📋 Escalas únicas encontradas en Excel: ${escalasEnExcel.size}`);
  console.log(`📋 Escalas definidas en sistema: ${ESCALAS.length}\n`);

  // Mostrar escalas en Excel
  console.log('Escalas en el Excel:');
  escalasEnExcel.forEach(escala => {
    const count = data.filter(r => r.escala === escala).length;
    console.log(`   • ${escala}: ${count} reactivos`);
  });

  // ============================================
  // 2. VERIFICAR COBERTURA DE ESCALAS
  // ============================================

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🔍 ANÁLISIS DE COBERTURA');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Escalas A (Pareamiento Forzado)
  const escalasA = ESCALAS.filter(e => 
    !e.codigo.includes('HABILIDAD_') && e.codigo !== 'SATISFACCION'
  );

  // Escala Satisfacción
  const escalaSatisfaccion = ESCALAS.find(e => e.codigo === 'SATISFACCION');

  // Escalas B (Likert)
  const escalasB = ESCALAS.filter(e => e.codigo.includes('HABILIDAD_'));

  console.log('🔵 ESCALAS A (Pareamiento Forzado):');
  console.log(`   Total requeridas: ${escalasA.length}`);
  
  const escalasAFaltantes: string[] = [];
  escalasA.forEach(escala => {
    const enExcel = escalasEnExcel.has(escala.codigo);
    if (!enExcel) {
      escalasAFaltantes.push(escala.codigo);
      console.log(`   ❌ ${escala.nombre} (${escala.codigo}) - NO ENCONTRADA`);
    }
  });

  if (escalasAFaltantes.length === 0) {
    console.log(`   ✅ Todas las ${escalasA.length} escalas A están cubiertas`);
  } else {
    console.log(`   ⚠️  Faltan ${escalasAFaltantes.length} escalas A`);
  }

  console.log('\n🟡 ESCALA SATISFACCIÓN (Cuadrantes):');
  if (escalaSatisfaccion) {
    const enExcel = escalasEnExcel.has(escalaSatisfaccion.codigo);
    if (enExcel) {
      console.log(`   ✅ ${escalaSatisfaccion.nombre} - ENCONTRADA`);
    } else {
      console.log(`   ❌ ${escalaSatisfaccion.nombre} - NO ENCONTRADA`);
    }
  }

  console.log('\n🟢 ESCALAS B (Likert 1-5):');
  console.log(`   Total requeridas: ${escalasB.length}`);
  
  const escalasBFaltantes: string[] = [];
  escalasB.forEach(escala => {
    const enExcel = escalasEnExcel.has(escala.codigo);
    if (!enExcel) {
      escalasBFaltantes.push(escala.codigo);
      console.log(`   ❌ ${escala.nombre} (${escala.codigo}) - NO ENCONTRADA`);
    }
  });

  if (escalasBFaltantes.length === 0) {
    console.log(`   ✅ Todas las ${escalasB.length} escalas B están cubiertas`);
  } else {
    console.log(`   ⚠️  Faltan ${escalasBFaltantes.length} escalas B`);
  }

  // ============================================
  // 3. VERIFICAR SI TODAS LAS ESCALAS SON GENÉRICAS
  // ============================================

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('⚠️  PROBLEMA DETECTADO');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const todasGenericas = Array.from(escalasEnExcel).every(e => e === 'ESCALA_GENERICA');
  
  if (todasGenericas) {
    console.log('❌ PROBLEMA CRÍTICO: Todos los reactivos tienen "ESCALA_GENERICA"');
    console.log('   Esto significa que el Excel NO contiene las escalas específicas.\n');
    
    console.log('📋 El Excel debería tener escalas como:');
    console.log('   • ALINEAMIENTO_ACCIONES');
    console.log('   • CLARIDAD_ESTRATEGIA');
    console.log('   • VISION_CLARA');
    console.log('   • CONTROL_PERCIBIDO');
    console.log('   • AUTOCONTROL');
    console.log('   • ... y 33 escalas más\n');
    
    console.log('   Pero actualmente TODOS los reactivos tienen: "ESCALA_GENERICA"\n');
  }

  // ============================================
  // 4. IMPACTO EN COMPETENCIAS
  // ============================================

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📊 IMPACTO EN EL CÁLCULO DE COMPETENCIAS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (todasGenericas) {
    console.log('❌ SIN ESCALAS ESPECÍFICAS:');
    console.log('   • NO se pueden calcular las 32 Escalas individuales');
    console.log('   • NO se pueden calcular las 32 Competencias A');
    console.log('   • NO se pueden calcular los 5 Potenciales (Competencias B)');
    console.log('   • NO se puede generar el PDF con resultados detallados\n');
    
    console.log('✅ CON ESCALAS ESPECÍFICAS (lo que se necesita):');
    console.log('   • Se calculan 38 Escalas individuales');
    console.log('   • Se calculan 32 Competencias A (cada una con 1-3 escalas)');
    console.log('   • Se calculan 5 Potenciales (cada uno con 4 competencias A)');
    console.log('   • Se genera PDF completo con 10 secciones detalladas\n');
  }

  // ============================================
  // 5. EJEMPLO DE CÓMO DEBERÍA SER
  // ============================================

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📝 EJEMPLO: CÓMO DEBERÍA SER EL EXCEL');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('Actualmente (INCORRECTO):');
  console.log('┌────────┬──────────────┬─────────────────────────┬──────┬─────────────┬──────────────────┬─────────────────┐');
  console.log('│ idOrd  │ itemPareado  │ reactivo                │ tipo │ puntajeFijo │ test             │ escala          │');
  console.log('├────────┼──────────────┼─────────────────────────┼──────┼─────────────┼──────────────────┼─────────────────┤');
  console.log('│ 1      │ PAR_POS_001  │ Planeo certificarme...  │ POS  │ 2           │ Pareado Positivo │ ESCALA_GENERICA │');
  console.log('│ 2      │ PAR_POS_001  │ Soy bueno para ayudar...│ POS  │ 2           │ Pareado Positivo │ ESCALA_GENERICA │');
  console.log('└────────┴──────────────┴─────────────────────────┴──────┴─────────────┴──────────────────┴─────────────────┘\n');

  console.log('Debería ser (CORRECTO):');
  console.log('┌────────┬──────────────┬─────────────────────────┬──────┬─────────────┬──────────────────┬──────────────────────────┐');
  console.log('│ idOrd  │ itemPareado  │ reactivo                │ tipo │ puntajeFijo │ test             │ escala                   │');
  console.log('├────────┼──────────────┼─────────────────────────┼──────┼─────────────┼──────────────────┼──────────────────────────┤');
  console.log('│ 1      │ PAR_POS_001  │ Planeo certificarme...  │ POS  │ 2           │ Pareado Positivo │ SUPERACION               │');
  console.log('│ 2      │ PAR_POS_001  │ Soy bueno para ayudar...│ POS  │ 2           │ Pareado Positivo │ INFLUENCIA               │');
  console.log('│ 3      │ PAR_POS_002  │ Tengo una habilidad...  │ POS  │ 2           │ Pareado Positivo │ APROVECHAMIENTO_TALENTOS │');
  console.log('│ 4      │ PAR_POS_002  │ Soy bueno para hacer... │ POS  │ 2           │ Pareado Positivo │ EMPRENDIMIENTO           │');
  console.log('└────────┴──────────────┴─────────────────────────┴──────┴─────────────┴──────────────────┴──────────────────────────┘\n');

  // ============================================
  // 6. RESUMEN FINAL
  // ============================================

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📋 RESUMEN FINAL');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (todasGenericas) {
    console.log('❌ EL EXCEL NO CONTIENE TODO LO NECESARIO\n');
    console.log('Problemas encontrados:');
    console.log('   1. Todos los reactivos tienen "ESCALA_GENERICA"');
    console.log('   2. Faltan las 38 escalas específicas');
    console.log('   3. No se pueden calcular competencias individuales');
    console.log('   4. No se puede generar el PDF detallado\n');
    
    console.log('Solución requerida:');
    console.log('   ✅ Asignar a cada reactivo su escala específica');
    console.log('   ✅ Cada uno de los 336 reactivos debe tener una de las 38 escalas');
    console.log('   ✅ Las escalas deben coincidir con los códigos del sistema\n');
    
    console.log('Escalas que deben estar en el Excel:');
    console.log('\n🔵 Escalas A (32):');
    escalasA.forEach((e, i) => {
      console.log(`   ${i + 1}. ${e.codigo}`);
    });
    
    console.log('\n🟡 Escala Satisfacción (1):');
    if (escalaSatisfaccion) {
      console.log(`   1. ${escalaSatisfaccion.codigo}`);
    }
    
    console.log('\n🟢 Escalas B (5):');
    escalasB.forEach((e, i) => {
      console.log(`   ${i + 1}. ${e.codigo}`);
    });
  } else {
    console.log('✅ El Excel contiene las escalas específicas necesarias');
  }

  console.log('\n═══════════════════════════════════════════════════════════════\n');
}

verificarCoberturaReactivos();
