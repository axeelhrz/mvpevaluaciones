// app/api/admin/import-ai/route.ts
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

// Función para analizar estructura con IA
type CellValue = string | number | null | undefined;

interface SheetInfo {
  name: string;
  headers: string[];
  sampleRows: CellValue[][];
  totalRows: number;
}

type ReactivosMapping = {
  pairId?: string | null;
  ordenEnPar?: string | null;
  tipo?: string | null;
  texto?: string | null;
  escalaCodigo?: string | null;
  [key: string]: string | null | undefined;
};

type NormasMapping = {
  escalaCodigo: string;
  decilesColumns: string[];
};

type CompetenciasMapping = {
  codigo: string;
  nombre: string;
  tipo?: string;
};

type AnalysisResult = {
  reactivos: { sheetName: string; mapping: ReactivosMapping; notes?: string } | null;
  normas: { sheetName: string; mapping: NormasMapping } | null;
  competencias: { sheetName: string; mapping: CompetenciasMapping } | null;
};

async function analyzeExcelStructureWithAI(workbook: XLSX.WorkBook): Promise<AnalysisResult> {
  console.log("\n🤖 Analizando estructura con IA...");
  
  // Extraer información de todas las hojas
  const sheetsInfo: SheetInfo[] = [];
  
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as CellValue[][];
    
    if (data.length < 2) continue;
    
    const headers = data[0].filter((h): h is string => h !== null && h !== undefined && h !== "") as string[];
    const sampleRows = data.slice(1, 6).filter(row => 
      row.some(cell => cell !== null && cell !== undefined && cell !== "")
    ) as CellValue[][];
    
    sheetsInfo.push({
      name: sheetName,
      headers,
      sampleRows,
      totalRows: data.length - 1
    });
  }

  // Preparar prompt para la IA
  const prompt = `Analiza la siguiente estructura de un archivo Excel y determina cómo importar los datos:

${sheetsInfo.map(sheet => `
HOJA: "${sheet.name}"
Columnas: ${sheet.headers.join(", ")}
Total de filas: ${sheet.totalRows}
Ejemplo de datos (primeras 3 filas):
${sheet.sampleRows.slice(0, 3).map((row, i) => 
  `Fila ${i + 1}: ${sheet.headers.map((h, j) => `${h}="${row[j] || ''}"`).join(", ")}`
).join("\n")}
`).join("\n---\n")}

INSTRUCCIONES:
1. Identifica qué hoja contiene REACTIVOS/PREGUNTAS
2. Identifica qué hoja contiene NORMAS/SCORING
3. Identifica qué hoja contiene COMPETENCIAS
4. Para cada hoja, mapea las columnas a estos campos:
   - Para reactivos: pairId, ordenEnPar, tipo, texto, escalaCodigo
   - Para normas: escalaCodigo, deciles (D1, D2, etc.)
   - Para competencias: codigo, nombre

Responde SOLO con un JSON válido en este formato:
{
  "reactivos": {
    "sheetName": "nombre de la hoja",
    "mapping": {
      "pairId": "nombre de columna",
      "ordenEnPar": "nombre de columna o null",
      "tipo": "nombre de columna",
      "texto": "nombre de columna",
      "escalaCodigo": "nombre de columna"
    },
    "notes": "observaciones importantes"
  },
  "normas": {
    "sheetName": "nombre de la hoja o null",
    "mapping": {
      "escalaCodigo": "nombre de columna",
      "decilesColumns": ["D1", "D2", "D3", ...]
    }
  },
  "competencias": {
    "sheetName": "nombre de la hoja o null",
    "mapping": {
      "codigo": "nombre de columna",
      "nombre": "nombre de columna"
    }
  }
}`;

  try {
    // Intentar con OpenAI primero
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (openaiKey) {
      console.log("   Usando OpenAI GPT-4...");
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Eres un experto en análisis de estructuras de datos de Excel. Respondes SOLO con JSON válido, sin explicaciones adicionales.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 2000
        })
      });

      if (response.ok) {
        const result = await response.json();
        const content = result.choices[0].message.content;
        
        // Extraer JSON del contenido
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]) as AnalysisResult;
          console.log("   ✅ Análisis completado con IA");
          return analysis;
        }
      }
    }

    // Si no hay OpenAI o falla, usar análisis heurístico mejorado
    console.log("   Usando análisis heurístico...");
    return analyzeWithHeuristics(sheetsInfo);
    
  } catch (error: unknown) {
    console.error("   ⚠️ Error en análisis IA, usando heurístico:", error);
    return analyzeWithHeuristics(sheetsInfo);
  }
}

// Análisis heurístico como fallback
function analyzeWithHeuristics(sheetsInfo: SheetInfo[]): AnalysisResult {
  const result: AnalysisResult = {
    reactivos: null,
    normas: null,
    competencias: null
  };

  for (const sheet of sheetsInfo) {
    const normalized = sheet.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Detectar hoja de reactivos
    if (/reactivo|test|pregunta|item/.test(normalized)) {
      const mapping: ReactivosMapping = {};
      
      for (const header of sheet.headers) {
        const norm = header.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
        
        if (/itempareado|pareado/.test(norm)) mapping.pairId = header;
        else if (/^reactivo$|^orden/.test(norm)) mapping.ordenEnPar = header;
        else if (/puntajefijo|fijo/.test(norm)) mapping.tipo = header;
        else if (/^tipo$/.test(norm)) mapping.texto = header;
        else if (/^escala$/.test(norm)) mapping.escalaCodigo = header;
        else if (/^test$/.test(norm) && !mapping.pairId) mapping.pairId = header;
      }
      
      result.reactivos = {
        sheetName: sheet.name,
        mapping,
        notes: "Detectado automáticamente"
      };
    }
    
    // Detectar hoja de normas
    else if (/norma|decil|scoring/.test(normalized)) {
      const decilesColumns: string[] = [];
      let escalaCodigo: string | null = null;
      
      for (const header of sheet.headers) {
        const norm = header.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
        
        if (/^d\d+$|decil\d+|^\d+$/.test(norm)) {
          decilesColumns.push(header);
        } else if (/escala|competencia/.test(norm)) {
          escalaCodigo = header;
        }
      }
      
      if (escalaCodigo && decilesColumns.length > 0) {
        result.normas = {
          sheetName: sheet.name,
          mapping: {
            escalaCodigo,
            decilesColumns
          }
        };
      }
    }
    
    // Detectar hoja de competencias
    else if (/competencia|sc2/.test(normalized)) {
      result.competencias = {
        sheetName: sheet.name,
        mapping: {
          tipo: "Tipo",
          codigo: "Escala/Competencia",
          nombre: "Escala/Competencia"
        }
      };
    }
  }

  return result;
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

    console.log("\n🤖 ===== IMPORTACIÓN CON IA =====");
    console.log(`📁 Archivo: ${file.name}`);
    console.log(`📄 Hojas: ${workbook.SheetNames.join(", ")}`);

    // Analizar estructura con IA
    const analysis = await analyzeExcelStructureWithAI(workbook);
    
    console.log("\n📊 Estructura detectada:");
    console.log(JSON.stringify(analysis, null, 2));

    const supabaseAdmin = await createAdminClient();
    const errors: string[] = [];
    const warnings: string[] = [];

    let reactivosProcessed = 0;
    let normasProcessed = 0;
    let escalasProcessed = 0;
    let competenciasProcessed = 0;

    // Paso 1: Extraer escalas
    console.log("\n📋 PASO 1: Extrayendo escalas...");
    const escalasSet = new Set<string>();
    
    if (analysis.reactivos && analysis.reactivos.sheetName) {
      const sheet = workbook.Sheets[analysis.reactivos.sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      const escalaCol = analysis.reactivos.mapping.escalaCodigo;
      
      for (const row of data) {
        const rowObj = row as Record<string, CellValue>;
        const escala = escalaCol ? rowObj[escalaCol as string] : undefined;
        if (escala && String(escala).trim()) {
          escalasSet.add(String(escala).trim());
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
        console.error(`   ❌ ${escalaCodigo}: ${msg}`);
      }
    }

    // Paso 2: Procesar reactivos
    if (analysis.reactivos && analysis.reactivos.sheetName) {
      console.log("\n📝 PASO 2: Procesando reactivos...");
      console.log(`   Hoja: "${analysis.reactivos.sheetName}"`);
      console.log(`   Mapeo detectado por IA:`);
      console.log(`     ${JSON.stringify(analysis.reactivos.mapping, null, 2)}`);
      
      const sheet = workbook.Sheets[analysis.reactivos.sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      const mapping = analysis.reactivos.mapping;
      
      for (let i = 0; i < data.length; i++) {
        const row = data[i] as Record<string, CellValue>;
        
        const pairIdRaw = mapping.pairId ? row[mapping.pairId as string] : (i + 1);
        const ordenEnPar = mapping.ordenEnPar ? row[mapping.ordenEnPar as string] : 1;
        const tipoRaw = mapping.tipo ? row[mapping.tipo as string] : 'POS';
        const texto = mapping.texto ? row[mapping.texto as string] : null;
        const escalaCodigo = mapping.escalaCodigo ? row[mapping.escalaCodigo as string] : null;

        if (!texto || !escalaCodigo) {
          warnings.push(`Fila ${i + 2}: Falta texto o escala`);
          continue;
        }

        try {
          const escala = await getEscalaByCodigo(String(escalaCodigo));
          if (!escala) {
            warnings.push(`Fila ${i + 2}: Escala "${escalaCodigo}" no encontrada`);
            continue;
          }

          const pairId = generateUUIDFromString(String(pairIdRaw));
          
          let tipoNormalizado = String(tipoRaw).toUpperCase();
          if (tipoNormalizado.includes('POSITIVO') || tipoNormalizado === 'POS') {
            tipoNormalizado = 'POS';
          } else if (tipoNormalizado.includes('NEGATIVO') || tipoNormalizado === 'NEG') {
            tipoNormalizado = 'NEG';
          } else {
            tipoNormalizado = 'POS';
          }

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
      
      console.log(`   ✅ Total: ${reactivosProcessed} reactivos`);
    }

    // Paso 3: Procesar normas
    if (analysis.normas && analysis.normas.sheetName) {
      console.log("\n📊 PASO 3: Procesando normas...");
      console.log(`   Hoja: "${analysis.normas.sheetName}"`);
      
      const sheet = workbook.Sheets[analysis.normas.sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      const mapping = analysis.normas.mapping;
      
      for (const row of data) {
        const rowObj = row as Record<string, CellValue>;
        const targetCodigo = mapping.escalaCodigo ? rowObj[mapping.escalaCodigo as string] : undefined;
        
        if (!targetCodigo) continue;

        try {
          await deleteAllNormaDecil();
          
          for (let i = 0; i < mapping.decilesColumns.length; i++) {
            const col = mapping.decilesColumns[i];
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
      
      console.log(`   ✅ Total: ${normasProcessed} normas`);
    }

    // Paso 4: Procesar competencias
    if (analysis.competencias && analysis.competencias.sheetName) {
      console.log("\n🔗 PASO 4: Procesando competencias...");
      console.log(`   Hoja: "${analysis.competencias.sheetName}"`);
      
      const sheet = workbook.Sheets[analysis.competencias.sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      const mapping = analysis.competencias.mapping;
      const competenciasSet = new Set<string>();
      
      for (const row of data) {
        const rowObj = row as Record<string, CellValue>;
        const tipo = mapping.tipo ? rowObj[mapping.tipo as string] : null;
        const competencia = mapping.codigo ? rowObj[mapping.codigo as string] : null;
        
        if (competencia && tipo && /competencia/i.test(String(tipo))) {
          competenciasSet.add(String(competencia));
        }
      }

      for (const comp of competenciasSet) {
        try {
          await upsertCompetencia({ codigo: comp, nombre: comp });
          competenciasProcessed++;
          console.log(`   ✓ ${comp}`);
        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : String(error);
          errors.push(`Competencia ${comp}: ${msg}`);
        }
      }
    }

    console.log("\n✅ ===== RESUMEN FINAL =====");
    console.log(`✓ Escalas: ${escalasProcessed}`);
    console.log(`✓ Reactivos: ${reactivosProcessed}`);
    console.log(`✓ Normas: ${normasProcessed}`);
    console.log(`✓ Competencias: ${competenciasProcessed}`);
    
    if (warnings.length > 0) {
      console.log(`\n⚠️ Advertencias: ${warnings.length}`);
      warnings.slice(0, 5).forEach(w => console.log(`  - ${w}`));
    }
    
    if (errors.length > 0) {
      console.log(`\n❌ Errores: ${errors.length}`);
      errors.slice(0, 5).forEach(e => console.log(`  - ${e}`));
    }

    return Response.json({
      ok: true,
      message: "Importación con IA completada",
      analysis,
      stats: {
        escalas: escalasProcessed,
        reactivos: reactivosProcessed,
        normas: normasProcessed,
        competencias: competenciasProcessed
      },
      warnings: warnings.slice(0, 20),
      errors: errors.slice(0, 20)
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
