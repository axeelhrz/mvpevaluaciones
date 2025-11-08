import * as XLSX from 'xlsx';
import * as fs from 'fs';

interface Reactivo {
  idOrd: number;
  itemPareado: string;
  reactivo: string;
  tipo: string;
  puntajeFijo: number;
  test: string;
  escala: string;
}

async function analizarReactivosXLSX() {
  console.log('📊 Analizando archivo Reactivos.xlsx...\n');

  try {
    // Leer el archivo Excel
    const workbook = XLSX.readFile('Reactivos.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convertir a JSON
    const data: Reactivo[] = XLSX.utils.sheet_to_json(worksheet);

    console.log('✅ Archivo leído correctamente\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📋 RESUMEN GENERAL');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // 1. Total de reactivos
    console.log(`📌 Total de reactivos: ${data.length}`);

    // 2. Análisis por tipo
    const tiposPOS = data.filter(r => r.tipo === 'POS');
    const tiposNEG = data.filter(r => r.tipo === 'NEG');
    
    console.log(`\n🟢 Reactivos POSITIVOS (POS): ${tiposPOS.length}`);
    console.log(`🔴 Reactivos NEGATIVOS (NEG): ${tiposNEG.length}`);

    // 3. Análisis por test
    const testTypes = [...new Set(data.map(r => r.test))];
    console.log(`\n📝 Tipos de test encontrados: ${testTypes.length}`);
    testTypes.forEach(test => {
      const count = data.filter(r => r.test === test).length;
      console.log(`   - ${test}: ${count} reactivos`);
    });

    // 4. Análisis por escala
    const escalas = [...new Set(data.map(r => r.escala))];
    console.log(`\n📏 Escalas encontradas: ${escalas.length}`);
    escalas.forEach(escala => {
      const count = data.filter(r => r.escala === escala).length;
      console.log(`   - ${escala}: ${count} reactivos`);
    });

    // 5. Análisis de puntajes
    const puntajesPOS = [...new Set(tiposPOS.map(r => r.puntajeFijo))];
    const puntajesNEG = [...new Set(tiposNEG.map(r => r.puntajeFijo))];
    
    console.log(`\n🎯 Puntajes fijos:`);
    console.log(`   - Positivos: ${puntajesPOS.join(', ')}`);
    console.log(`   - Negativos: ${puntajesNEG.join(', ')}`);

    // 6. Análisis de items pareados
    const itemsPareados = [...new Set(data.map(r => r.itemPareado))];
    console.log(`\n🔗 Items pareados únicos: ${itemsPareados.length}`);

    // Verificar que cada par tenga exactamente 2 reactivos
    const paresIncompletos: string[] = [];
    const paresCompletos: string[] = [];
    
    itemsPareados.forEach(item => {
      const count = data.filter(r => r.itemPareado === item).length;
      if (count !== 2) {
        paresIncompletos.push(`${item} (${count} reactivos)`);
      } else {
        paresCompletos.push(item);
      }
    });

    console.log(`   - Pares completos (2 reactivos): ${paresCompletos.length}`);
    if (paresIncompletos.length > 0) {
      console.log(`   ⚠️  Pares incompletos: ${paresIncompletos.length}`);
      paresIncompletos.forEach(par => console.log(`      - ${par}`));
    }

    // 7. Verificar estructura de columnas
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('🔍 VERIFICACIÓN DE ESTRUCTURA');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const columnasEsperadas = ['idOrd', 'itemPareado', 'reactivo', 'tipo', 'puntajeFijo', 'test', 'escala'];
    const columnasEncontradas = Object.keys(data[0] || {});
    
    console.log('✅ Columnas esperadas:');
    columnasEsperadas.forEach(col => {
      const existe = columnasEncontradas.includes(col);
      console.log(`   ${existe ? '✓' : '✗'} ${col}`);
    });

    // 8. Verificar datos faltantes
    console.log('\n🔎 Verificando datos faltantes...');
    let datosFaltantes = 0;
    
    data.forEach((reactivo, index) => {
      const camposFaltantes: string[] = [];
      
      if (!reactivo.idOrd) camposFaltantes.push('idOrd');
      if (!reactivo.itemPareado) camposFaltantes.push('itemPareado');
      if (!reactivo.reactivo) camposFaltantes.push('reactivo');
      if (!reactivo.tipo) camposFaltantes.push('tipo');
      if (reactivo.puntajeFijo === undefined || reactivo.puntajeFijo === null) camposFaltantes.push('puntajeFijo');
      if (!reactivo.test) camposFaltantes.push('test');
      if (!reactivo.escala) camposFaltantes.push('escala');
      
      if (camposFaltantes.length > 0) {
        datosFaltantes++;
        console.log(`   ⚠️  Fila ${index + 2}: Faltan campos [${camposFaltantes.join(', ')}]`);
      }
    });

    if (datosFaltantes === 0) {
      console.log('   ✅ No se encontraron datos faltantes');
    } else {
      console.log(`   ⚠️  Total de filas con datos faltantes: ${datosFaltantes}`);
    }

    // 9. Verificar duplicados en idOrd
    console.log('\n🔢 Verificando IDs únicos...');
    const ids = data.map(r => r.idOrd);
    const idsDuplicados = ids.filter((id, index) => ids.indexOf(id) !== index);
    
    if (idsDuplicados.length === 0) {
      console.log('   ✅ Todos los IDs son únicos');
    } else {
      console.log(`   ⚠️  IDs duplicados encontrados: ${[...new Set(idsDuplicados)].join(', ')}`);
    }

    // 10. Verificar secuencia de IDs
    console.log('\n📊 Verificando secuencia de IDs...');
    const idsOrdenados = [...ids].sort((a, b) => a - b);
    const gaps: number[] = [];
    
    for (let i = 1; i < idsOrdenados.length; i++) {
      if (idsOrdenados[i] - idsOrdenados[i - 1] > 1) {
        for (let j = idsOrdenados[i - 1] + 1; j < idsOrdenados[i]; j++) {
          gaps.push(j);
        }
      }
    }
    
    if (gaps.length === 0) {
      console.log('   ✅ Secuencia de IDs es continua');
    } else {
      console.log(`   ⚠️  IDs faltantes en la secuencia: ${gaps.join(', ')}`);
    }

    // 11. Análisis de longitud de reactivos
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📏 ANÁLISIS DE CONTENIDO');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const longitudes = data.map(r => r.reactivo.length);
    const longitudMin = Math.min(...longitudes);
    const longitudMax = Math.max(...longitudes);
    const longitudPromedio = Math.round(longitudes.reduce((a, b) => a + b, 0) / longitudes.length);

    console.log('📝 Longitud de reactivos:');
    console.log(`   - Mínima: ${longitudMin} caracteres`);
    console.log(`   - Máxima: ${longitudMax} caracteres`);
    console.log(`   - Promedio: ${longitudPromedio} caracteres`);

    // 12. Reactivos más largos y más cortos
    const reactivoMasCorto = data.reduce((prev, curr) => 
      prev.reactivo.length < curr.reactivo.length ? prev : curr
    );
    const reactivoMasLargo = data.reduce((prev, curr) => 
      prev.reactivo.length > curr.reactivo.length ? prev : curr
    );

    console.log(`\n📌 Reactivo más corto (${reactivoMasCorto.reactivo.length} caracteres):`);
    console.log(`   ID: ${reactivoMasCorto.idOrd} - "${reactivoMasCorto.reactivo}"`);
    
    console.log(`\n📌 Reactivo más largo (${reactivoMasLargo.reactivo.length} caracteres):`);
    console.log(`   ID: ${reactivoMasLargo.idOrd} - "${reactivoMasLargo.reactivo}"`);

    // 13. Muestra de datos
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📋 MUESTRA DE DATOS (Primeros 3 reactivos)');
    console.log('═══════════════════════════════════════════════════════════════\n');

    data.slice(0, 3).forEach((reactivo, index) => {
      console.log(`${index + 1}. ID: ${reactivo.idOrd}`);
      console.log(`   Par: ${reactivo.itemPareado}`);
      console.log(`   Tipo: ${reactivo.tipo}`);
      console.log(`   Puntaje: ${reactivo.puntajeFijo}`);
      console.log(`   Test: ${reactivo.test}`);
      console.log(`   Escala: ${reactivo.escala}`);
      console.log(`   Reactivo: "${reactivo.reactivo}"`);
      console.log('');
    });

    // 14. Resumen final
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ RESUMEN FINAL');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const problemas: string[] = [];
    
    if (paresIncompletos.length > 0) {
      problemas.push(`${paresIncompletos.length} pares incompletos`);
    }
    if (datosFaltantes > 0) {
      problemas.push(`${datosFaltantes} filas con datos faltantes`);
    }
    if (idsDuplicados.length > 0) {
      problemas.push(`IDs duplicados`);
    }
    if (gaps.length > 0) {
      problemas.push(`${gaps.length} IDs faltantes en la secuencia`);
    }

    if (problemas.length === 0) {
      console.log('🎉 ¡El archivo está completo y bien estructurado!');
      console.log('✅ Todos los datos están presentes');
      console.log('✅ Todos los pares están completos');
      console.log('✅ No hay duplicados');
      console.log('✅ La secuencia de IDs es continua');
    } else {
      console.log('⚠️  Se encontraron los siguientes problemas:');
      problemas.forEach(problema => console.log(`   - ${problema}`));
    }

    console.log('\n═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error al analizar el archivo:', error);
    process.exit(1);
  }
}

// Ejecutar el análisis
analizarReactivosXLSX();
