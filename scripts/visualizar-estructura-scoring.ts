import { 
  ESCALAS, 
  COMPETENCIAS_A, 
  COMPETENCIAS_B,
  SECCIONES_PDF 
} from '../lib/competencias-config';

console.log('═══════════════════════════════════════════════════════════════');
console.log('📊 ESTRUCTURA COMPLETA DEL SISTEMA DE SCORING');
console.log('═══════════════════════════════════════════════════════════════\n');

// ============================================
// 1. ESCALAS
// ============================================

console.log('📏 ESCALAS (38 escalas totales)');
console.log('─────────────────────────────────────────────────────────────\n');

const escalasA = ESCALAS.filter(e => 
  !e.codigo.includes('HABILIDAD_') && e.codigo !== 'SATISFACCION'
);
const escalaSatisfaccion = ESCALAS.find(e => e.codigo === 'SATISFACCION');
const escalasB = ESCALAS.filter(e => e.codigo.includes('HABILIDAD_'));

console.log(`🔵 Escalas A (Pareamiento Forzado): ${escalasA.length}`);
escalasA.forEach((escala, index) => {
  console.log(`   ${index + 1}. ${escala.nombre} (${escala.codigo})`);
});

console.log(`\n🟡 Escala Especial (Cuadrantes): 1`);
console.log(`   1. ${escalaSatisfaccion?.nombre} (${escalaSatisfaccion?.codigo})`);

console.log(`\n🟢 Escalas B (Likert 1-5): ${escalasB.length}`);
escalasB.forEach((escala, index) => {
  console.log(`   ${index + 1}. ${escala.nombre} (${escala.codigo})`);
});

// ============================================
// 2. COMPETENCIAS A
// ============================================

console.log('\n\n═══════════════════════════════════════════════════════════════');
console.log('🎯 COMPETENCIAS A (32 competencias)');
console.log('═══════════════════════════════════════════════════════════════\n');

// Agrupar por sección
const competenciasPorSeccion = new Map<string, typeof COMPETENCIAS_A>();
COMPETENCIAS_A.forEach(comp => {
  if (!competenciasPorSeccion.has(comp.seccionPDF)) {
    competenciasPorSeccion.set(comp.seccionPDF, []);
  }
  competenciasPorSeccion.get(comp.seccionPDF)!.push(comp);
});

// Ordenar secciones según SECCIONES_PDF
const seccionesOrdenadas = SECCIONES_PDF
  .filter(s => competenciasPorSeccion.has(s.nombre))
  .sort((a, b) => a.orden - b.orden);

seccionesOrdenadas.forEach((seccion, secIndex) => {
  const competencias = competenciasPorSeccion.get(seccion.nombre) || [];
  
  console.log(`${seccion.icono} SECCIÓN ${secIndex + 1}: ${seccion.nombre}`);
  console.log(`   ${seccion.descripcion}`);
  console.log(`   Total de competencias: ${competencias.length}\n`);
  
  competencias.forEach((comp, compIndex) => {
    console.log(`   ${compIndex + 1}. ${comp.nombre}`);
    console.log(`      Código: ${comp.codigo}`);
    console.log(`      Escalas que la componen (${comp.escalas.length}):`);
    comp.escalas.forEach(escala => {
      const escalaConfig = ESCALAS.find(e => e.codigo === escala);
      console.log(`         • ${escalaConfig?.nombre || escala}`);
    });
    console.log('');
  });
  
  console.log('─────────────────────────────────────────────────────────────\n');
});

// ============================================
// 3. COMPETENCIAS B (POTENCIALES)
// ============================================

console.log('═══════════════════════════════════════════════════════════════');
console.log('🚀 COMPETENCIAS B - POTENCIALES PSICOFINANCIEROS (5 potenciales)');
console.log('═══════════════════════════════════════════════════════════════\n');

COMPETENCIAS_B.forEach((comp, index) => {
  console.log(`${index + 1}. ${comp.nombre}`);
  console.log(`   Código: ${comp.codigo}`);
  console.log(`   Competencias A que lo componen (${comp.competenciasA.length}):`);
  comp.competenciasA.forEach(codCompA => {
    const compAConfig = COMPETENCIAS_A.find(c => c.codigo === codCompA);
    console.log(`      • ${compAConfig?.nombre || codCompA}`);
  });
  console.log('');
});

// ============================================
// 4. RESUMEN PARA PDF
// ============================================

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('📄 ESTRUCTURA DEL PDF DE RESULTADOS');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('El PDF contendrá las siguientes secciones en orden:\n');

SECCIONES_PDF.sort((a, b) => a.orden - b.orden).forEach((seccion, index) => {
  const competenciasA = COMPETENCIAS_A.filter(c => c.seccionPDF === seccion.nombre);
  const competenciasB = COMPETENCIAS_B.filter(c => c.seccionPDF === seccion.nombre);
  
  console.log(`${seccion.icono} ${index + 1}. ${seccion.nombre}`);
  console.log(`   ${seccion.descripcion}`);
  
  if (competenciasA.length > 0) {
    console.log(`   📊 Competencias A: ${competenciasA.length}`);
    competenciasA.forEach(comp => {
      console.log(`      • ${comp.nombre}`);
    });
  }
  
  if (competenciasB.length > 0) {
    console.log(`   🚀 Potenciales: ${competenciasB.length}`);
    competenciasB.forEach(comp => {
      console.log(`      • ${comp.nombre}`);
    });
  }
  
  console.log('');
});

// ============================================
// 5. ESTADÍSTICAS GENERALES
// ============================================

console.log('═══════════════════════════════════════════════════════════════');
console.log('📈 ESTADÍSTICAS DEL SISTEMA');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log(`📏 Total de Escalas: ${ESCALAS.length}`);
console.log(`   • Escalas A (Pareamiento): ${escalasA.length}`);
console.log(`   • Escala Satisfacción: 1`);
console.log(`   • Escalas B (Likert): ${escalasB.length}`);

console.log(`\n🎯 Total de Competencias A: ${COMPETENCIAS_A.length}`);
console.log(`   Distribuidas en ${seccionesOrdenadas.length} secciones`);

console.log(`\n🚀 Total de Potenciales (Competencias B): ${COMPETENCIAS_B.length}`);

console.log(`\n📄 Total de Secciones en PDF: ${SECCIONES_PDF.length}`);

// Calcular total de escalas únicas usadas
const escalasUsadas = new Set<string>();
COMPETENCIAS_A.forEach(comp => {
  comp.escalas.forEach(escala => escalasUsadas.add(escala));
});

console.log(`\n✅ Escalas utilizadas en Competencias A: ${escalasUsadas.size} de ${escalasA.length + 1}`);

// Verificar cobertura
const escalasNoUsadas = escalasA.filter(e => !escalasUsadas.has(e.codigo));
if (escalasNoUsadas.length > 0) {
  console.log(`\n⚠️  Escalas A no utilizadas en ninguna competencia:`);
  escalasNoUsadas.forEach(e => console.log(`   • ${e.nombre}`));
}

// ============================================
// 6. EJEMPLO DE VISUALIZACIÓN EN PDF
// ============================================

console.log('\n\n═══════════════════════════════════════════════════════════════');
console.log('📊 EJEMPLO DE VISUALIZACIÓN EN PDF');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('Para cada COMPETENCIA A, el PDF mostrará:');
console.log('┌─────────────────────────────────────────────────────────────┐');
console.log('│ 🎯 VISIÓN ESTRATÉGICA                          Decil: 7/10  │');
console.log('│                                                              │');
console.log('│ Puntaje Natural: 45.5                                        │');
console.log('│ Nivel: Alto                                                  │');
console.log('│                                                              │');
console.log('│ Escalas que la componen:                                     │');
console.log('│   • Alineamiento de Acciones: 23 pts (Decil 6)              │');
console.log('│   • Claridad de Estrategia: 28 pts (Decil 8)                │');
console.log('│   • Visión Clara: 25 pts (Decil 7)                           │');
console.log('│                                                              │');
console.log('│ [████████████████████░░░░░░░░░░] 70%                        │');
console.log('└─────────────────────────────────────────────────────────────┘');

console.log('\nPara cada POTENCIAL (Competencia B), el PDF mostrará:');
console.log('┌─────────────────────────────────────────────────────────────┐');
console.log('│ 🚀 POTENCIAL GENERACIÓN DE INGRESOS            Decil: 8/10  │');
console.log('│                                                              │');
console.log('│ Puntaje Natural: 52.3                                        │');
console.log('│ Nivel: Muy Alto                                              │');
console.log('│                                                              │');
console.log('│ Competencias que lo componen:                                │');
console.log('│   • Emprendimiento evolutivo: Decil 7                        │');
console.log('│   • Foco persistente: Decil 8                                │');
console.log('│   • Influencia proactiva: Decil 9                            │');
console.log('│   • Resultado dinámico: Decil 8                              │');
console.log('│                                                              │');
console.log('│ [████████████████████████░░░░░░] 80%                        │');
console.log('└─────────────────────────────────────────────────────────────┘');

console.log('\n═══════════════════════════════════════════════════════════════\n');
