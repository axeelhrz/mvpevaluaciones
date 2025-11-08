import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

interface NormaDecil {
  targetTipo: string;
  targetCodigo: string;
  decil: number;
  puntajeMin: number;
}

/**
 * GET - Obtener todas las normas agrupadas por target
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetTipo = searchParams.get('targetTipo');
    const targetCodigo = searchParams.get('targetCodigo');

    const supabaseAdmin = await createAdminClient();

    let query = supabaseAdmin
      .from('NormaDecil')
      .select('*')
      .order('targetTipo', { ascending: true })
      .order('targetCodigo', { ascending: true })
      .order('decil', { ascending: true });

    if (targetTipo) {
      query = query.eq('targetTipo', targetTipo);
    }

    if (targetCodigo) {
      query = query.eq('targetCodigo', targetCodigo);
    }

    const { data: normas, error } = await query;

    if (error) throw error;

    // Agrupar por target
    const grouped = new Map<string, NormaDecil[]>();
    for (const norma of normas || []) {
      const key = `${norma.targetTipo}:${norma.targetCodigo}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(norma);
    }

    // Convertir a array de objetos
    const result = Array.from(grouped.entries()).map(([key, normas]) => {
      const [targetTipo, targetCodigo] = key.split(':');
      return {
        targetTipo,
        targetCodigo,
        normas: normas.sort((a, b) => a.decil - b.decil)
      };
    });

    return NextResponse.json({
      ok: true,
      data: result
    });

  } catch (error: unknown) {
    console.error('Error obteniendo normas:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { ok: false, error: message || "Error al obtener normas" },
      { status: 500 }
    );
  }
}

/**
 * POST - Crear o actualizar normas para un target específico
 * Body: { targetTipo, targetCodigo, normas: [{ decil, puntajeMin }] }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetTipo, targetCodigo, normas } = body;

    if (!targetTipo || !targetCodigo || !normas || !Array.isArray(normas)) {
      return NextResponse.json(
        { ok: false, error: "Datos inválidos. Se requiere targetTipo, targetCodigo y normas[]" },
        { status: 400 }
      );
    }

    // Validar que sean 10 deciles
    if (normas.length !== 10) {
      return NextResponse.json(
        { ok: false, error: "Debe proporcionar exactamente 10 deciles (1-10)" },
        { status: 400 }
      );
    }

    // Validar que los deciles sean 1-10
    const deciles = normas.map(n => n.decil).sort((a, b) => a - b);
    const expectedDeciles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    if (JSON.stringify(deciles) !== JSON.stringify(expectedDeciles)) {
      return NextResponse.json(
        { ok: false, error: "Los deciles deben ser exactamente del 1 al 10 sin duplicados" },
        { status: 400 }
      );
    }

    // Validar que los puntajes sean crecientes
    const normasOrdenadas = [...normas].sort((a, b) => a.decil - b.decil);
    for (let i = 1; i < normasOrdenadas.length; i++) {
      if (normasOrdenadas[i].puntajeMin <= normasOrdenadas[i - 1].puntajeMin) {
        return NextResponse.json(
          { 
            ok: false, 
            error: `Los puntajes deben ser crecientes. Decil ${normasOrdenadas[i].decil} (${normasOrdenadas[i].puntajeMin}) <= Decil ${normasOrdenadas[i - 1].decil} (${normasOrdenadas[i - 1].puntajeMin})` 
          },
          { status: 400 }
        );
      }
    }

    const supabaseAdmin = await createAdminClient();

    // Eliminar normas existentes para este target
    const { error: deleteError } = await supabaseAdmin
      .from('NormaDecil')
      .delete()
      .eq('targetTipo', targetTipo)
      .eq('targetCodigo', targetCodigo);

    if (deleteError) throw deleteError;

    // Insertar nuevas normas
    const normasToInsert = normas.map(n => ({
      targetTipo,
      targetCodigo,
      decil: n.decil,
      puntajeMin: n.puntajeMin
    }));

    const { data, error: insertError } = await supabaseAdmin
      .from('NormaDecil')
      .insert(normasToInsert)
      .select();

    if (insertError) throw insertError;

    return NextResponse.json({
      ok: true,
      message: `Normas actualizadas para ${targetTipo} "${targetCodigo}"`,
      data
    });
  } catch (error: unknown) {
    console.error('Error creando/actualizando normas:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { ok: false, error: message || "Error al crear/actualizar normas" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Eliminar todas las normas de un target específico
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetTipo = searchParams.get('targetTipo');
    const targetCodigo = searchParams.get('targetCodigo');

    if (!targetTipo || !targetCodigo) {
      return NextResponse.json(
        { ok: false, error: "Se requiere targetTipo y targetCodigo" },
        { status: 400 }
      );
    }

    const supabaseAdmin = await createAdminClient();

    const { error } = await supabaseAdmin
      .from('NormaDecil')
      .delete()
      .eq('targetTipo', targetTipo)
      .eq('targetCodigo', targetCodigo);

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      message: `Normas eliminadas para ${targetTipo} "${targetCodigo}"`
    });

  } catch (error: unknown) {
    console.error('Error eliminando normas:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { ok: false, error: message || "Error al eliminar normas" },
      { status: 500 }
    );
  }
}
