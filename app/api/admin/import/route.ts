// app/api/admin/import/route.ts
import { NextRequest } from "next/server";
import * as XLSX from "xlsx";
import {
  upsertEscala,
  upsertCompetencia,
  getEscalaByCodigo,
  deleteAllNormaDecil,
  createNormaDecil
} from "@/lib/supabase/db";
import { createAdminClient } from "@/lib/supabase/server";

function normalizeColumnName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function generateUUIDFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const hex = Math.abs(hash).toString(16).padStart(32, '0');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json({ ok: false, error: "No se proporcionó archivo" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "buffer" });

    console.log("\n📊 ===== ANÁLISIS INTELIGENTE DE EXCEL =====");
    console.log(`📁 Archivo: ${file.name}`);
    console.log(`📄 Hojas: ${workbook.SheetNames.join(", ")}`);

    const supabaseAdmin = await createAdminClient();
    const errors: string[] = [];
    const warnings: string[] = [];
    
    let reactivosProcessed = 0;
    let normasProcessed = 0;
    let escalasProcessed = 0;
    let competenciasProcessed = 0;

    // Paso 1: Extraer y crear todas las escalas únicas
    console.log("\n📋 PASO 1: Extrayendo escalas...");
    const escalasSet = new Set<string>();
    
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      for (const row of data) {
        const rowObj = row as Record<string, unknown>;
        // Buscar cualquier columna que pueda contener escalas
        for (const key of Object.keys(rowObj)) {
          const normalized = normalizeColumnName(key);
          if (/escala|scale|categoria|cat/.test(normalized)) {
            const value = rowObj[key];
            if (value && String(value).trim()) {
              escalasSet.add(String(value).trim());
            }
          }
        }
      }
    }

    console.log(`   Encontradas ${escalasSet.size} escalas únicas`);
    for (const escalaCodigo of escalasSet) {
      try {
        await upsertEscala({ codigo: escalaCodigo, nombre: escalaCodigo });
        escalasProcessed++;
        console.log(`   ✓ ${escalaCodigo}`);
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error(`   ❌ Error: ${escalaCodigo} - ${msg}`);
      }
    }

    // Paso 2: Procesar hoja de Reactivos/Test
    console.log("\n📝 PASO 2: Procesando reactivos...");
    
    for (const sheetName of workbook.SheetNames) {
      const normalized = normalizeColumnName(sheetName);
      
      // Detectar hojas de reactivos
      if (/reactivo|test|pregunta|item/.test(normalized)) {
        console.log(`\n   📄 Procesando hoja: "${sheetName}"`);
        
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        
        if (data.length === 0) {
          console.log(`   ⚠️ Hoja vacía`);
          continue;
        }

        // Analizar estructura de la primera fila
        const firstRow = data[0] as Record<string, unknown>;
        const columns = Object.keys(firstRow);
        
        console.log(`   Columnas detectadas: ${columns.join(", ")}`);
        
        // Mapear columnas automáticamente
        let pairIdCol: string | null = null;
        let ordenCol: string | null = null;
        let tipoCol: string | null = null;
        let textoCol: string | null = null;
        let escalaCol: string | null = null;
        
        for (const col of columns) {
          const norm = normalizeColumnName(col);
          
          if (/itempareado|pareado|par/.test(norm) && !pairIdCol) {
            pairIdCol = col;
          } else if (/^reactivo$|^orden/.test(norm) && !ordenCol) {
            ordenCol = col;
          } else if (/puntajefijo|fijo|tipo/.test(norm) && !tipoCol) {
            tipoCol = col;
          } else if (/^tipo$|texto|pregunta|enunciado/.test(norm) && !textoCol) {
            textoCol = col;
          } else if (/^escala$|categoria/.test(norm) && !escalaCol) {
            escalaCol = col;
          } else if (/^test$/.test(norm) && !pairIdCol) {
            pairIdCol = col;
          }
        }

        console.log(`   Mapeo:`);
        console.log(`     - pairId: ${pairIdCol || 'NO DETECTADO'}`);
        console.log(`     - orden: ${ordenCol || 'NO DETECTADO (preguntas individuales)'}`);
        console.log(`     - tipo: ${tipoCol || 'NO DETECTADO'}`);
        console.log(`     - texto: ${textoCol || 'NO DETECTADO'}`);
        console.log(`     - escala: ${escalaCol || 'NO DETECTADO'}`);

        // Procesar cada fila
        for (let i = 0; i < data.length; i++) {
          const row = data[i] as Record<string, unknown>;
          
          const pairIdRaw = pairIdCol ? row[pairIdCol] : (i + 1);
          const ordenEnPar = ordenCol ? row[ordenCol] : 1; // Default 1 si no hay orden
          const tipoRaw = tipoCol ? row[tipoCol] : 'POS';
          const texto = textoCol ? row[textoCol] : null;
          const escalaCodigo = escalaCol ? row[escalaCol] : null;

          // Validar campos mínimos
          if (!texto || !escalaCodigo) {
            warnings.push(`Fila ${i + 2}: Falta texto o escala`);
            continue;
          }

          try {
            // Obtener escala
            const escala = await getEscalaByCodigo(String(escalaCodigo));
            if (!escala) {
              warnings.push(`Fila ${i + 2}: Escala "${escalaCodigo}" no encontrada`);
              continue;
            }

            // Generar UUID para pairId
            const pairId = generateUUIDFromString(String(pairIdRaw));
            
            // Normalizar tipo
            let tipoNormalizado = String(tipoRaw).toUpperCase();
            if (tipoNormalizado.includes('POSITIVO') || tipoNormalizado === 'POS') {
              tipoNormalizado = 'POS';
            } else if (tipoNormalizado.includes('NEGATIVO') || tipoNormalizado === 'NEG') {
              tipoNormalizado = 'NEG';
            } else {
              // Si no es POS/NEG, asumir POS por defecto
              tipoNormalizado = 'POS';
            }

            // Insertar reactivo
            const { error: insertError } = await supabaseAdmin
              .from('Reactivo')
              .insert({
                pairId,
                ordenEnPar: Number(ordenEnPar) || 1,
                tipo: tipoNormalizado,
                texto: String(texto),
                escalaId: escala.id
              });

            if (insertError) {
              errors.push(`Fila ${i + 2}: ${insertError.message}`);
            } else {
              reactivosProcessed++;
              if (reactivosProcessed % 50 === 0) {
                console.log(`   ✓ ${reactivosProcessed} reactivos procesados...`);
              }
            }
          } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            errors.push(`Fila ${i + 2}: ${msg}`);
          }
        }
        
        console.log(`   ✅ Total procesados: ${reactivosProcessed}`);
      }
    }

    // Paso 3: Procesar normas/scoring
    console.log("\n📊 PASO 3: Procesando normas...");
    
    for (const sheetName of workbook.SheetNames) {
      const normalized = normalizeColumnName(sheetName);
      
      if (/norma|decil|baremo|scoring/.test(normalized)) {
        console.log(`\n   📄 Procesando hoja: "${sheetName}"`);
        
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        
        if (data.length === 0) {
          console.log(`   ⚠️ Hoja vacía`);
          continue;
        }

        const firstRow = data[0] as Record<string, unknown>;
        const columns = Object.keys(firstRow);
        
        console.log(`   Columnas: ${columns.join(", ")}`);
        
        // Buscar columnas de normas
        let escalaCol: string | null = null;
        const decilesColumns: string[] = [];
        
        for (const col of columns) {
          const norm = normalizeColumnName(col);
          
          if (/escala|competencia|categoria/.test(norm)) {
            escalaCol = col;
          } else if (/^d\d+$|decil\d+|^\d+$/.test(norm)) {
            decilesColumns.push(col);
          }
        }

        console.log(`   Escala/Competencia: ${escalaCol || 'NO DETECTADO'}`);
        console.log(`   Deciles: ${decilesColumns.length} columnas`);

        if (!escalaCol || decilesColumns.length === 0) {
          console.log(`   ⚠️ No se detectaron columnas necesarias`);
          continue;
        }

        // Procesar normas
        for (const row of data) {
          const rowObj = row as Record<string, unknown>;
          const targetCodigo = rowObj[escalaCol];
          
          if (!targetCodigo) continue;

          try {
            // Eliminar normas existentes
            await deleteAllNormaDecil();
            
            // Insertar nuevas normas
            for (let i = 0; i < decilesColumns.length; i++) {
              const col = decilesColumns[i];
              const puntajeMin = rowObj[col];
              
              if (puntajeMin !== undefined && puntajeMin !== null) {
                await createNormaDecil({
                  targetTipo: 'ESCALA',
                  targetCodigo: String(targetCodigo),
                  decil: i + 1,
                  puntajeMin: Number(puntajeMin)
                });
                normasProcessed++;
              }
            }
          } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            errors.push(`Norma ${targetCodigo}: ${msg}`);
          }
        }
        
        console.log(`   ✅ Total procesadas: ${normasProcessed}`);
      }
    }

    // Paso 4: Procesar competencias y relaciones
    console.log("\n🔗 PASO 4: Procesando competencias...");
    
    for (const sheetName of workbook.SheetNames) {
      const normalized = normalizeColumnName(sheetName);
      
      if (/sc2|competencia|relacion/.test(normalized)) {
        console.log(`\n   📄 Procesando hoja: "${sheetName}"`);
        
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        
        if (data.length === 0) continue;

        const firstRow = data[0] as Record<string, unknown>;
        const columns = Object.keys(firstRow);
        
        // Buscar columnas relevantes
        let tipoCol: string | null = null;
        let competenciaCol: string | null = null;
        
        for (const col of columns) {
          const norm = normalizeColumnName(col);
          
          if (/^tipo$/.test(norm)) {
            tipoCol = col;
          } else if (/escalacompetencia|competencia/.test(norm)) {
            competenciaCol = col;
          }
        }

        if (!competenciaCol) continue;

        // Procesar competencias
        const competenciasSet = new Set<string>();
        
        for (const row of data) {
          const rowObj = row as Record<string, unknown>;
          const tipo = tipoCol ? rowObj[tipoCol] : null;
          const competencia = rowObj[competenciaCol];
          
          if (competencia && tipo && /competencia/i.test(String(tipo))) {
            competenciasSet.add(String(competencia));
          }
        }

        for (const comp of competenciasSet) {
          try {
            await upsertCompetencia({ codigo: comp, nombre: comp });
            competenciasProcessed++;
          } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            errors.push(`Competencia ${comp}: ${msg}`);
          }
        }
      }
    }

    console.log("\n✅ ===== RESUMEN FINAL =====");
    console.log("\n✅ ===== RESUMEN FINAL =====");
    console.log(`✓ Escalas: ${escalasProcessed}`);
    console.log(`✓ Reactivos: ${reactivosProcessed}`);
    console.log(`✓ Normas: ${normasProcessed}`);
    console.log(`✓ Competencias: ${competenciasProcessed}`);
    
    if (warnings.length > 0) {
      console.log(`\n⚠️ Advertencias: ${warnings.length}`);
      warnings.slice(0, 5).forEach(w => console.log(`  - ${w}`));
      if (warnings.length > 5) {
        console.log(`  ... y ${warnings.length - 5} más`);
      }
    }
    
    if (errors.length > 0) {
      console.log(`\n❌ Errores: ${errors.length}`);
      errors.slice(0, 5).forEach(e => console.log(`  - ${e}`));
      if (errors.length > 5) {
        console.log(`  ... y ${errors.length - 5} más`);
      }
    }

    return Response.json({
      ok: true,
      message: "Importación completada",
      stats: {
        escalas: escalasProcessed,
        reactivos: reactivosProcessed,
        normas: normasProcessed,
        competencias: competenciasProcessed
      }
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("❌ Error en importación:", msg);
    return Response.json(
      { ok: false, error: msg },
      { status: 500 }
    );
  }
}