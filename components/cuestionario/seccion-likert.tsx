"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

// ============================================
// TIPOS E INTERFACES
// ============================================

interface OpcionLikert {
  id?: string;
  texto: string;
  valor: number;
  orden: number;
}

interface PreguntaLikert {
  id: string;
  texto: string;
  descripcion?: string;
  orden: number;
  opciones: OpcionLikert[];
  escala?: {
    id: string;
    codigo: string;
    nombre: string;
  };
}

interface Props {
  preguntas: PreguntaLikert[];
  evaluadoId: string;
  respuestasIniciales?: Record<string, number>;
  onSeccionCompletada: () => void;
  permitirRetroceso?: boolean;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function SeccionLikert({
  preguntas,
  evaluadoId,
  respuestasIniciales = {},
  onSeccionCompletada,
  permitirRetroceso = false
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, number>>(respuestasIniciales);
  const [saving, setSaving] = useState(false);

  const preguntaActual = preguntas[currentIndex];
  const progreso = preguntas.length > 0 ? ((currentIndex + 1) / preguntas.length) * 100 : 0;
  const totalRespondidas = Object.keys(respuestas).length;

  // Obtener valores únicos de la escala
  const valoresEscala = preguntaActual?.opciones && preguntaActual.opciones.length > 0
    ? [...new Set(preguntaActual.opciones.map(o => o.valor))].sort((a, b) => a - b)
    : [1, 2, 3, 4, 5];

  // Obtener etiquetas min y max
  const opcionesOrdenadas = preguntaActual?.opciones?.sort((a, b) => a.orden - b.orden) || [];
  const etiquetaMin = opcionesOrdenadas[0]?.texto || "";
  const etiquetaMax = opcionesOrdenadas[opcionesOrdenadas.length - 1]?.texto || "";

  // ============================================
  // GUARDAR RESPUESTA
  // ============================================

  async function saveAnswer(preguntaId: string, valor: number) {
    setSaving(true);
    try {
      const res = await fetch("/api/respuestas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evaluadoId,
          preguntaId: parseInt(preguntaId),
          respuesta: valor
        }),
      });

      if (!res.ok) {
        throw new Error("Error al guardar respuesta");
      }

      // Actualizar estado local
      setRespuestas(prev => ({
        ...prev,
        [preguntaId]: valor
      }));

      toast.success("Respuesta guardada");

      // Avanzar automáticamente al siguiente
      setTimeout(() => {
        if (currentIndex < preguntas.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          // Sección completada
          toast.success("Sección Likert completada");
          setTimeout(() => {
            onSeccionCompletada();
          }, 500);
        }
      }, 300);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al guardar respuesta");
    } finally {
      setSaving(false);
    }
  }

  // ============================================
  // NAVEGACIÓN
  // ============================================

  function siguiente() {
    if (!respuestas[preguntaActual.id]) {
      toast.error("Debes seleccionar una opción antes de continuar");
      return;
    }

    if (currentIndex < preguntas.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onSeccionCompletada();
    }
  }

  function anterior() {
    if (permitirRetroceso && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  // ============================================
  // RENDER
  // ============================================

  if (!preguntaActual) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay preguntas disponibles en esta sección.</p>
      </div>
    );
  }

  const respuestaActual = respuestas[preguntaActual.id];

  return (
    <div className="space-y-6">
      {/* Header de la sección */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Preguntas de Evaluación</h2>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Responde según tu nivel de acuerdo con cada afirmación
        </p>
      </div>

      {/* Barra de progreso */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
          <span>Pregunta {currentIndex + 1} de {preguntas.length}</span>
          <span>{totalRespondidas} / {preguntas.length} respondidas</span>
        </div>
        <Progress value={progreso} className="h-3 bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Card de la pregunta actual */}
      <Card className="border-0 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            {preguntaActual.texto}
            <span className="text-red-500 ml-1">*</span>
          </CardTitle>
          {preguntaActual.descripcion && (
            <CardDescription className="text-base text-slate-600 dark:text-slate-400">{preguntaActual.descripcion}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {/* Escala Likert */}
          <div className="space-y-6">
            {/* Opciones en desktop - Solo números */}
            <div className="hidden md:flex justify-between gap-3">
              {valoresEscala.map((valor) => (
                <button
                  key={valor}
                  onClick={() => saveAnswer(preguntaActual.id, valor)}
                  disabled={saving}
                  className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                    respuestaActual === valor
                      ? "border-blue-500 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl scale-105"
                      : "border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:shadow-md"
                  } ${saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl font-bold">{valor}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Opciones en mobile - Solo números */}
            <div className="md:hidden space-y-3">
              {valoresEscala.map((valor) => (
                <button
                  key={valor}
                  onClick={() => saveAnswer(preguntaActual.id, valor)}
                  disabled={saving}
                  className={`w-full p-5 rounded-xl border-2 transition-all ${
                    respuestaActual === valor
                      ? "border-blue-500 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                      : "border-slate-200 dark:border-slate-700 hover:border-blue-300"
                  } ${saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex items-center justify-center">
                    <span className="text-3xl font-bold">{valor}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Leyenda de la escala - Solo si hay etiquetas */}
            {etiquetaMin && etiquetaMax && (
              <div className="flex justify-between text-sm font-medium text-slate-600 dark:text-slate-400 px-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-left max-w-[45%]">← {etiquetaMin}</span>
                <span className="text-right max-w-[45%]">{etiquetaMax} →</span>
              </div>
            )}
          </div>

          {/* Mensaje de ayuda */}
          {!respuestaActual && (
            <div className="text-center py-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                💡 Selecciona el número que mejor represente tu opinión
              </p>
            </div>
          )}

          {/* Indicador de guardado */}
          {saving && (
            <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Guardando respuesta...</span>
            </div>
          )}

          {/* Botones de navegación */}
          <div className="flex justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="outline"
              onClick={anterior}
              disabled={!permitirRetroceso || currentIndex === 0 || saving}
              className="h-12 px-6 border-2"
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Anterior
            </Button>

            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              <span className="text-lg">{currentIndex + 1}</span>
              <span>/</span>
              <span>{preguntas.length}</span>
            </div>

            <Button
              onClick={siguiente}
              disabled={!respuestaActual || saving}
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg"
            >
              {currentIndex === preguntas.length - 1 ? (
                "Finalizar Cuestionario"
              ) : (
                <>
                  Siguiente
                  <ChevronRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Indicador de progreso visual */}
      <div className="flex justify-center gap-1.5">
        {preguntas.slice(0, 10).map((_, idx) => (
          <div
            key={idx}
            className={`h-2.5 w-2.5 rounded-full transition-all ${
              idx < currentIndex
                ? "bg-blue-600 dark:bg-blue-500"
                : idx === currentIndex
                ? "bg-blue-400 dark:bg-blue-600 animate-pulse scale-125"
                : "bg-slate-300 dark:bg-slate-700"
            }`}
          />
        ))}
        {preguntas.length > 10 && (
          <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 self-center">
            +{preguntas.length - 10} más
          </span>
        )}
      </div>
    </div>
  );
}