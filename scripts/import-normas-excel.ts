import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

interface NormaDecil {
  escala: string;
  percentil: number;
  decil: number;
  puntajeNatural: number;
}

async function importarNormasDesdeExcel() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📊 IMPORTANDO NORMAS DECÍLICAS DESDE EXCEL');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    // Leer el archivo Excel
    const workbook = XLSX.readFile('Reactivos.xlsx');
    
    // Buscar la hoja de Norma
    const normaSheetName = workbook.SheetNames.find(name => 
      name.toLowerCase().includes('norma')
    );

    if (!normaSheetName) {
      throw new Error('No se encontró la hoja de Norma en el Excel');
    }

    console.log(`✅ Hoja de Norma encontrada: "${normaSheetName}"\n`);

    const worksheet = workbook.Sheets[normaSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: '', header: 1 }) as any[][];

    console.log(`📋 Total de filas en Norma: ${data.length}\n`);

    if (data.length < 2) {
      throw new Error('La hoja de Norma no tiene suficientes datos');
    }

    // Buscar la fila que contiene "ESCALAS" o los nombres de las escalas
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(5, data.length); i++) {
      const row = data[i];
      const hasEscalas = row.some((cell: any) => {
        const cellStr = String(cell).toLowerCase();
        return cellStr.includes('escala') || 
               cellStr.includes('adaptación') || 
               cellStr.includes('mente abierta') ||
               cellStr.includes('pensamiento');
      });
      
      if (hasEscalas) {
        headerRowIndex = i;
        console.log(`✅ Fila de encabezados encontrada en índice: ${i}\n`);
        break;
      }
    }

    if (headerRowIndex === -1) {
      throw new Error('No se encontró la fila de encabezados con los nombres de las escalas');
    }

    const headerRow = data[headerRowIndex];
    console.log(`📋 Total de columnas: ${headerRow.length}`);

    // Extraer nombres de escalas y sus índices
    const escalasMap = new Map<string, number>(); // nombre -> primera columna donde aparece
    
    for (let i = 1; i < headerRow.length; i++) {
      const nombreEscala = headerRow[i];
      if (nombreEscala && nombreEscala !== '' && String(nombreEscala).trim() !== '') {
        const nombreLimpio = String(nombreEscala).trim();
        // Solo agregar si no es un número y no está ya en el mapa
        if (isNaN(Number(nombreLimpio)) && !escalasMap.has(nombreLimpio)) {
          escalasMap.set(nombreLimpio, i);
        }
      }
    }

    const escalas = Array.from(escalasMap.keys());
    const escalasIndices = Array.from(escalasMap.values());

    console.log(`✅ Total de escalas únicas encontradas: ${escalas.length}`);
    console.log(`📋 Primeras 10 escalas:`);
    escalas.slice(0, 10).forEach((escala, index) => {
      console.log(`   ${index + 1}. ${escala} (columna ${escalasIndices[index]})`);
    });
    console.log('');

    if (escalas.length === 0) {
      throw new Error('No se encontraron escalas en la hoja de Norma');
    }

    // Procesar filas de datos
    const normasMap = new Map<string, NormaDecil>(); // key: escala-percentil
    
    for (let rowIndex = headerRowIndex + 1; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      
      const percentil = parseFloat(row[0]);
      
      if (isNaN(percentil)) continue;

      for (let escalaIdx = 0; escalaIdx < escalas.length; escalaIdx++) {
        const colEscala = escalasIndices[escalaIdx];
        
        const puntajeNatural = parseFloat(row[colEscala]);
        const decil = parseInt(row[colEscala + 1]);
        
        if (!isNaN(puntajeNatural) && !isNaN(decil)) {
          const key = `${escalas[escalaIdx]}-${percentil}`;
          
          // Solo agregar si no existe (evitar duplicados)
          if (!normasMap.has(key)) {
            normasMap.set(key, {
              escala: escalas[escalaIdx],
              percentil,
              decil,
              puntajeNatural
            });
          }
        }
      }
    }

    const normas = Array.from(normasMap.values());

    console.log(`📊 Total de normas únicas procesadas: ${normas.length}`);
    if (escalas.length > 0) {
      console.log(`📊 Normas por escala: ${Math.floor(normas.length / escalas.length)}\n`);
    }

    // Mostrar ejemplos
    console.log('📋 Ejemplos de normas (primeras 15):');
    normas.slice(0, 15).forEach((norma, index) => {
      console.log(`   ${index + 1}. ${norma.escala}: Percentil ${norma.percentil} → Puntaje ${norma.puntajeNatural} → Decil ${norma.decil}`);
    });
    console.log('');

    if (normas.length === 0) {
      throw new Error('No se procesaron normas. Verifica la estructura del Excel.');
    }

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
    const { error: deleteError } = await supabase
      .from('NormaDecil')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      console.error('❌ Error al limpiar datos:', deleteError.message);
    } else {
      console.log('✅ Datos existentes eliminados\n');
    }

    // Insertar en lotes de 50 (más pequeño para evitar problemas)
    console.log('📥 Insertando normas en lotes...');
    const batchSize = 50;
    let insertados = 0;
    let errores = 0;

    for (let i = 0; i < normas.length; i += batchSize) {
      const batch = normas.slice(i, i + batchSize).map(n => ({
        escala: n.escala,
        percentil: n.percentil,
        decil: n.decil,
        puntaje_natural: n.puntajeNatural
      }));

      const { error } = await supabase
        .from('NormaDecil')
        .insert(batch);

      if (error) {
        console.error(`❌ Error al insertar lote ${Math.floor(i / batchSize) + 1}:`, error.message);
        errores += batch.length;
        
        // Intentar insertar uno por uno para identificar el problema
        console.log('   Intentando insertar individualmente...');
        for (const item of batch) {
          const { error: singleError } = await supabase
            .from('NormaDecil')
            .insert(item);
          
          if (singleError) {
            console.error(`   ❌ Error en: ${item.escala} - Percentil ${item.percentil}`);
          } else {
            insertados++;
          }
        }
      } else {
        insertados += batch.length;
        console.log(`✅ Lote ${Math.floor(i / batchSize) + 1}: ${batch.length} normas insertadas (Total: ${insertados})`);
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ IMPORTACIÓN DE NORMAS COMPLETADA');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`📊 Total de normas importadas: ${insertados}`);
    console.log(`📊 Escalas con normas: ${escalas.length}`);
    if (errores > 0) {
      console.log(`⚠️  Errores: ${errores} normas no se pudieron insertar`);
    }
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error al importar normas:', error);
    process.exit(1);
  }
}

importarNormasDesdeExcel();