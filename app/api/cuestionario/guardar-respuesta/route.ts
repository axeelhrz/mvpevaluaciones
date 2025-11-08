import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { scoreEvaluado } from "@/lib/scoring";

export async function POST(req: Request) {
  try {
    const { evaluadoId, orden, respuesta } = await req.json();

    if (!evaluadoId || !orden || respuesta === undefined) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Determinar el tipo de respuesta
    if (typeof respuesta === 'object' && respuesta !== null && 'mas' in respuesta && 'menos' in respuesta) {
      // RESPUESTA DE PAREAMIENTO
      // El orden es el número del par (1, 2, 3, ..., 168)
      // Lo guardamos como "pair-1", "pair-2", etc. para identificarlo fácilmente
      const preguntaId = `pair-${orden}`;
      const respuestaValor = respuesta.mas === 'A' ? 1 : 2;
      
      const { error } = await supabase
        .from('RespuestaCustom')
        .upsert({
          evaluadoId,
          preguntaId: preguntaId,
          valorNumerico: respuestaValor,
          updatedAt: new Date().toISOString()
        }, {
          onConflict: 'evaluadoId,preguntaId'
        });
      
      if (error) {
        console.error(`❌ Error al guardar pareamiento ${orden}:`, error);
        throw error;
      }
      
      console.log(`✅ Pareamiento ${orden} guardado: ${preguntaId} = ${respuestaValor}`);
      
    } else if (typeof respuesta === 'number') {
      // RESPUESTA LIKERT
      const preguntaId = `likert-${orden}`;
      
      const { error } = await supabase
        .from('RespuestaCustom')
        .upsert({
          evaluadoId,
          preguntaId: preguntaId,
          valorNumerico: respuesta,
          updatedAt: new Date().toISOString()
        }, {
          onConflict: 'evaluadoId,preguntaId'
        });
      
      if (error) {
        console.error(`❌ Error al guardar Likert ${orden}:`, error);
        throw error;
      }
      
      console.log(`✅ Likert ${orden} guardado: ${preguntaId} = ${respuesta}`);
      
    } else {
      return NextResponse.json(
        { error: "Formato de respuesta inválido" },
        { status: 400 }
      );
    }

    // ============================================
    // CALCULAR ESTADÍSTICAS EN TIEMPO REAL
    // ============================================
    
    console.log('\n' + '='.repeat(80));
    console.log(`📊 CALCULANDO ESTADÍSTICAS EN TIEMPO REAL - Pregunta ${orden}`);
    console.log('='.repeat(80) + '\n');

    try {
      const resultado = await scoreEvaluado(evaluadoId);

      // Mostrar resumen de escalas
      if (resultado.escalas.length > 0) {
        console.log('📈 ESCALAS CALCULADAS:');
        console.log('-'.repeat(80));
        resultado.escalas.forEach(escala => {
          console.log(`  ${escala.nombre.padEnd(35)} | Puntaje: ${escala.puntajeNatural.toFixed(2).padStart(6)} | Decil: ${escala.decil.toString().padStart(2)}`);
        });
        console.log('');
      }

      // Mostrar competencias A
      if (resultado.competenciasA.length > 0) {
        console.log('🎯 COMPETENCIAS A (32 Competencias):');
        console.log('-'.repeat(80));
        resultado.competenciasA.forEach(comp => {
          console.log(`  ${comp.nombre.padEnd(35)} | Puntaje: ${comp.puntajeNatural.toFixed(2).padStart(6)} | Decil: ${comp.decil.toString().padStart(2)}`);
        });
        console.log('');
      }

      // Mostrar competencias B
      if (resultado.competenciasB.length > 0) {
        console.log('🚀 COMPETENCIAS B (Potenciales):');
        console.log('-'.repeat(80));
        resultado.competenciasB.forEach(comp => {
          console.log(`  ${comp.nombre.padEnd(35)} | Puntaje: ${comp.puntajeNatural.toFixed(2).padStart(6)} | Decil: ${comp.decil.toString().padStart(2)}`);
        });
        console.log('');
      }

      // Mostrar estadísticas generales
      const totalEscalas = resultado.escalas.length;
      const totalCompetenciasA = resultado.competenciasA.length;
      const totalCompetenciasB = resultado.competenciasB.length;

      const promedioDecilesEscalas = totalEscalas > 0
        ? (resultado.escalas.reduce((sum, e) => sum + e.decil, 0) / totalEscalas).toFixed(2)
        : '0.00';

      const promedioDecilesCompA = totalCompetenciasA > 0
        ? (resultado.competenciasA.reduce((sum, c) => sum + c.decil, 0) / totalCompetenciasA).toFixed(2)
        : '0.00';

      const promedioDecilesCompB = totalCompetenciasB > 0
        ? (resultado.competenciasB.reduce((sum, c) => sum + c.decil, 0) / totalCompetenciasB).toFixed(2)
        : '0.00';

      console.log('📊 RESUMEN ESTADÍSTICO:');
      console.log('-'.repeat(80));
      console.log(`  Total Escalas Calculadas:        ${totalEscalas}`);
      console.log(`  Total Competencias A Calculadas: ${totalCompetenciasA}`);
      console.log(`  Total Competencias B Calculadas: ${totalCompetenciasB}`);
      console.log(`  Promedio Deciles Escalas:        ${promedioDecilesEscalas}`);
      console.log(`  Promedio Deciles Competencias A: ${promedioDecilesCompA}`);
      console.log(`  Promedio Deciles Competencias B: ${promedioDecilesCompB}`);
      console.log('');

      // Mostrar warnings si existen
      if (resultado.warnings.length > 0) {
        console.log('⚠️  ADVERTENCIAS:');
        console.log('-'.repeat(80));
        resultado.warnings.forEach((warning, index) => {
          console.log(`  ${index + 1}. [${warning.type.toUpperCase()}] ${warning.message}`);
        });
        console.log('');
      }

      // Mostrar top 5 competencias más fuertes
      if (resultado.competenciasA.length > 0) {
        const top5 = [...resultado.competenciasA]
          .sort((a, b) => b.decil - a.decil)
          .slice(0, 5);
        
        console.log('🏆 TOP 5 COMPETENCIAS MÁS FUERTES:');
        console.log('-'.repeat(80));
        top5.forEach((comp, index) => {
          console.log(`  ${(index + 1)}. ${comp.nombre.padEnd(35)} | Decil: ${comp.decil}`);
        });
        console.log('');
      }

      // Mostrar áreas de oportunidad
      if (resultado.competenciasA.length > 0) {
        const areasOportunidad = resultado.competenciasA
          .filter(comp => comp.decil <= 3)
          .sort((a, b) => a.decil - b.decil);
        
        if (areasOportunidad.length > 0) {
          console.log('💡 ÁREAS DE OPORTUNIDAD (Decil ≤ 3):');
          console.log('-'.repeat(80));
          areasOportunidad.forEach((comp, index) => {
            console.log(`  ${(index + 1)}. ${comp.nombre.padEnd(35)} | Decil: ${comp.decil}`);
          });
          console.log('');
        }
      }

      console.log('='.repeat(80));
      console.log('✅ CÁLCULO DE ESTADÍSTICAS COMPLETADO');
      console.log('='.repeat(80) + '\n');

    } catch (scoringError) {
      console.error('❌ Error al calcular estadísticas:', scoringError);
      // No lanzamos el error para que la respuesta se guarde de todos modos
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Error al guardar respuesta:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al guardar respuesta" },
      { status: 500 }
    );
  }
}