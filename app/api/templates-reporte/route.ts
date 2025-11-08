import { NextRequest, NextResponse } from "next/server";
import { getTemplatesReporte, createTemplateReporte, updateTemplateReporte } from "@/lib/supabase/db";

// GET - Obtener templates de reporte
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activosOnly = searchParams.get('activos') === 'true';

    const templates = await getTemplatesReporte(activosOnly);
    
    return NextResponse.json(templates || []);
  } catch (error: unknown) {
    console.error('Error al obtener templates:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al obtener templates" },
      { status: 500 }
    );
  }
}

// POST - Crear template
export async function POST(req: NextRequest) {
  try {
    const template = await req.json();

    const nuevoTemplate = await createTemplateReporte(template);

    return NextResponse.json({ 
      ok: true, 
      template: nuevoTemplate 
    });
  } catch (error: unknown) {
    console.error('Error al crear template:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al crear template" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar template
export async function PUT(req: NextRequest) {
  try {
    const { id, ...template } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "id es requerido" },
        { status: 400 }
      );
    }

    const templateActualizado = await updateTemplateReporte(id, template);

    return NextResponse.json({ 
      ok: true, 
      template: templateActualizado 
    });
  } catch (error: unknown) {
    console.error('Error al actualizar template:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al actualizar template" },
      { status: 500 }
    );
  }
}
