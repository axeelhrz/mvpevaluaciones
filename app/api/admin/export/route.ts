import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get('tipo') || 'naturales';

    const { data: evaluados, error } = await supabaseAdmin
      .from('Evaluado')
      .select(`
        id,
        nombre,
        correo,
        estado,
        createdAt,
        resultados:Resultado(
          puntajesNaturales,
          puntajesDeciles,
          createdAt
        )
      `)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    const escalasSet = new Set<string>();
    const competenciasSet = new Set<string>();

    evaluados?.forEach(evaluado => {
      if (evaluado.resultados && evaluado.resultados.length > 0) {
        const resultado = evaluado.resultados[0];
        const puntajes = tipo === 'naturales' ? resultado.puntajesNaturales : resultado.puntajesDeciles;
        
        if (puntajes?.escalas) {
          Object.keys(puntajes.escalas).forEach(escala => escalasSet.add(escala));
        }
        if (puntajes?.competencias) {
          Object.keys(puntajes.competencias).forEach(comp => competenciasSet.add(comp));
        }
      }
    });

    const escalas = Array.from(escalasSet).sort();
    const competencias = Array.from(competenciasSet).sort();

    const headers = [
      'ID',
      'Nombre',
      'Correo',
      'Estado',
      'Fecha Registro',
      'Fecha Evaluacion',
      ...escalas.map(e => `Escala_${e}`),
      ...competencias.map(c => `Competencia_${c}`)
    ];

    const rows = evaluados?.map(evaluado => {
      const resultado = evaluado.resultados?.[0];
      const puntajes = resultado 
        ? (tipo === 'naturales' ? resultado.puntajesNaturales : resultado.puntajesDeciles)
        : null;

      const row = [
        evaluado.id,
        `"${evaluado.nombre}"`,
        evaluado.correo,
        evaluado.estado,
        new Date(evaluado.createdAt).toLocaleDateString('es-ES'),
        resultado ? new Date(resultado.createdAt).toLocaleDateString('es-ES') : 'N/A',
      ];

      escalas.forEach(escala => {
        const valor = puntajes?.escalas?.[escala];
        row.push(valor !== undefined ? String(valor) : 'N/A');
      });

      competencias.forEach(comp => {
        const valor = puntajes?.competencias?.[comp];
        row.push(valor !== undefined ? String(valor) : 'N/A');
      });

      return row.join(',');
    }) || [];

    const csv = [headers.join(','), ...rows].join('\n');
    const bom = '\uFEFF';
    const csvWithBom = bom + csv;

    const fileName = `evaluaciones-${tipo}-${new Date().toISOString().split('T')[0]}.csv`;
    
    return new NextResponse(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error al exportar CSV:", error);
    return NextResponse.json(
      { error: "Error al exportar datos" },
      { status: 500 }
    );
  }
}
