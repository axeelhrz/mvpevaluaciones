import * as XLSX from 'xlsx';

async function analizarExcelCompleto() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📊 ANÁLISIS COMPLETO DEL EXCEL - TODAS LAS HOJAS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    // Leer el archivo Excel
    const workbook = XLSX.readFile('Reactivos.xlsx');
    
    console.log(`📋 Hojas encontradas: ${workbook.SheetNames.length}\n`);
    
    // Listar todas las hojas
    console.log('Hojas en el archivo:');
    workbook.SheetNames.forEach((name, index) => {
      console.log(`   ${index + 1}. "${name}"`);
    });
    
    console.log('\n═══════════════════════════════════════════════════════════════\n');

    // Analizar cada hoja
    for (const sheetName of workbook.SheetNames) {
      console.log(`\n📄 HOJA: "${sheetName}"`);
      console.log('─────────────────────────────────────────────────────────────\n');
      
      const worksheet = workbook.Sheets[sheetName];
      
      if (!worksheet) {
        console.log('   ⚠️  Hoja no encontrada o vacía\n');
        continue;
      }
      
      const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      
      console.log(`   Total de filas: ${data.length}`);
      
      if (data.length > 0) {
        // Mostrar columnas
        const columnas = Object.keys(data[0] as Record<string, unknown>);
        console.log(`   Columnas (${columnas.length}):`);
        columnas.forEach(col => {
          console.log(`      • ${col}`);
        });
        
        // Mostrar primeras 3 filas como ejemplo
        console.log(`\n   Primeras 3 filas de ejemplo:\n`);
        (data.slice(0, 3) as Array<Record<string, unknown>>).forEach((row, index) => {
          console.log(`   Fila ${index + 1}:`);
          Object.entries(row).slice(0, 5).forEach(([key, value]) => {
            const valorStr = String(value).length > 60 
              ? String(value).substring(0, 60) + '...' 
              : String(value);
            console.log(`      ${key}: ${valorStr}`);
          });
          if (Object.keys(row).length > 5) {
            console.log(`      ... y ${Object.keys(row).length - 5} columnas más`);
          }
          console.log('');
        });
      } else {
        console.log('   ⚠️  Hoja vacía o sin datos');
      }
      
      console.log('─────────────────────────────────────────────────────────────');
    }

    // ============================================
    // ANÁLISIS ESPECÍFICO: HOJA SCORING
    // ============================================

    console.log('\n\n═══════════════════════════════════════════════════════════════');
    console.log('🔍 ANÁLISIS DETALLADO: HOJA SCORING');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const scoringSheetName = workbook.SheetNames.find(name => 
      name.toLowerCase().includes('scoring')
    );

    if (scoringSheetName) {
      console.log(`✅ Hoja de Scoring encontrada: "${scoringSheetName}"\n`);
      
      const worksheet = workbook.Sheets[scoringSheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      
      console.log(`📊 Total de filas: ${data.length}\n`);
      
      if (data.length > 0) {
        const columnas = Object.keys(data[0] as Record<string, unknown>);
        
        console.log('📋 Todas las columnas:');
        columnas.forEach(col => {
          console.log(`   • ${col}`);
        });
        
        // Buscar columnas de Escala y Reactivo
        const colEscala = columnas.find(c => c.toLowerCase().includes('escala'));
        const colReactivo = columnas.find(c => 
          c.toLowerCase().includes('reactivo') || 
          c.toLowerCase().includes('id') ||
          c.toLowerCase().includes('idord')
        );
        const colCompetencia = columnas.find(c => c.toLowerCase().includes('competencia'));
        
        console.log('\n📋 Columnas clave identificadas:');
        console.log(`   • Escala: ${colEscala || 'NO ENCONTRADA'}`);
        console.log(`   • Reactivo/ID: ${colReactivo || 'NO ENCONTRADA'}`);
        console.log(`   • Competencia: ${colCompetencia || 'NO ENCONTRADA'}`);
        
        if (colEscala) {
          // Analizar escalas
          const escalasUnicas = new Set(
            (data as Array<Record<string, unknown>>)
              .map((r: Record<string, unknown>) => r[colEscala])
              .filter(e => e && e !== '')
          );
          
          console.log(`\n📏 Escalas únicas encontradas: ${escalasUnicas.size}\n`);
          
          if (escalasUnicas.size > 0) {
            console.log('Escalas en la hoja Scoring:');
            const escalasArray = Array.from(escalasUnicas).sort();
            escalasArray.forEach((escala, index) => {
              const count = (data as Array<Record<string, unknown>>).filter((r: Record<string, unknown>) => r[colEscala] === escala).length;
              console.log(`   ${index + 1}. ${escala}: ${count} reactivos`);
            });
            
            // Verificar si son escalas específicas o genéricas
            const tieneEscalasEspecificas = escalasArray.some(e => 
              String(e).includes('ALINEAMIENTO') ||
              String(e).includes('CLARIDAD') ||
              String(e).includes('VISION') ||
              String(e).includes('CONTROL') ||
              String(e).includes('HABILIDAD')
            );
            
            console.log('\n═══════════════════════════════════════════════════════════════');
            if (tieneEscalasEspecificas) {
              console.log('✅ ¡EXCELENTE! La hoja Scoring contiene escalas específicas');
            } else {
              console.log('⚠️  Las escalas parecen ser genéricas o códigos');
            }
            console.log('═══════════════════════════════════════════════════════════════\n');
          }
        }
        
        // Mostrar mapeo de ejemplo
        if (colReactivo && colEscala) {
          console.log('\n📋 Ejemplo de mapeo Reactivo → Escala (primeros 15):\n');
          (data.slice(0, 15) as Array<Record<string, unknown>>).forEach((row, index) => {
            const reactivo = row[colReactivo];
            const escala = row[colEscala];
            const competencia = colCompetencia ? row[colCompetencia] : '';
            
            console.log(`   ${index + 1}. Reactivo ${reactivo} → ${escala}${competencia ? ` (${competencia})` : ''}`);
          });
        }
      }
    } else {
      console.log('❌ No se encontró la hoja de Scoring');
    }

    // ============================================
    // ANÁLISIS ESPECÍFICO: HOJA NORMA
    // ============================================

    console.log('\n\n═══════════════════════════════════════════════════════════════');
    console.log('🔍 ANÁLISIS DETALLADO: HOJA NORMA');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const normaSheetName = workbook.SheetNames.find(name => 
      name.toLowerCase().includes('norma')
    );

    if (normaSheetName) {
      console.log(`✅ Hoja de Norma encontrada: "${normaSheetName}"\n`);
      
      const worksheet = workbook.Sheets[normaSheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      
      console.log(`📊 Total de filas: ${data.length}\n`);
      
        if (data.length > 0) {
        const columnas = Object.keys(data[0] as Record<string, unknown>);
        console.log('Columnas:');
        columnas.forEach(col => {
          console.log(`   • ${col}`);
        });
        
        console.log('\n📋 Primeras 5 filas de normas:');
        (data.slice(0, 5) as Array<Record<string, unknown>>).forEach((row, index) => {
          console.log(`   ${index + 1}. ${JSON.stringify(row)}`);
        });
      }
    } else {
      console.log('❌ No se encontró la hoja de Norma');
    }

    // ============================================
    // RESUMEN FINAL
    // ============================================

    console.log('\n\n═══════════════════════════════════════════════════════════════');
    console.log('📋 RESUMEN FINAL');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const tieneScoring = workbook.SheetNames.some(n => n.toLowerCase().includes('scoring'));
    const tieneNorma = workbook.SheetNames.some(n => n.toLowerCase().includes('norma'));
    const tieneProcedimiento = workbook.SheetNames.some(n => n.toLowerCase().includes('procedimiento'));
    const tieneReactivos = workbook.SheetNames.some(n => n.toLowerCase().includes('reactivo'));

    console.log('Hojas encontradas:');
    console.log(`   ${tieneProcedimiento ? '✅' : '❌'} Procedimiento`);
    console.log(`   ${tieneReactivos ? '✅' : '❌'} Reactivos Test`);
    console.log(`   ${tieneScoring ? '✅' : '❌'} Scoring`);
    console.log(`   ${tieneNorma ? '✅' : '❌'} Norma`);

    if (tieneScoring) {
      const scoringSheet = workbook.SheetNames.find(n => n.toLowerCase().includes('scoring'));
      if (scoringSheet) {
        const worksheet = workbook.Sheets[scoringSheet];
        const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        const columnas = data.length > 0 ? Object.keys(data[0] as Record<string, unknown>) : [];
        const colEscala = columnas.find(c => c.toLowerCase().includes('escala'));
        
        if (colEscala && data.length > 0) {
          const escalasUnicas = new Set(
            (data as Array<Record<string, unknown>>)
              .map((r: Record<string, unknown>) => r[colEscala])
              .filter(e => e && e !== '')
          );
          
          console.log(`\n✅ La hoja Scoring contiene ${escalasUnicas.size} escalas únicas`);
          console.log(`✅ Total de mapeos: ${data.length} reactivos`);
          
          if (escalasUnicas.size >= 30) {
            console.log('\n🎉 ¡EXCELENTE! El Excel contiene todas las escalas necesarias');
            console.log('✅ El sistema puede calcular:');
            console.log('   • 38 Escalas individuales');
            console.log('   • 32 Competencias A');
            console.log('   • 5 Potenciales (Competencias B)');
            console.log('   • PDF completo con 10 secciones detalladas');
          } else if (escalasUnicas.size > 1) {
            console.log('\n⚠️  El Excel tiene escalas específicas pero podrían faltar algunas');
            console.log(`   Se necesitan al menos 32 escalas, se encontraron: ${escalasUnicas.size}`);
          } else {
            console.log('\n❌ El Excel solo tiene escalas genéricas');
          }
        }
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error al analizar el archivo:', error);
    process.exit(1);
  }
}

analizarExcelCompleto();