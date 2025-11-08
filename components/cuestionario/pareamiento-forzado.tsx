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

interface Reactivo {
  id: string;
  texto: string;
  tipo: 'POS' | 'NEG';
  puntosSiElegido: number | null;
  puntosSiNoElegido: number | null;
  ordenEnPar: number;
}

interface ParReactivos {
  pairId: string;
  preguntaId: string;
  reactivo1: Reactivo;
  reactivo2: Reactivo;
  seccion: 'POSITIVOS' | 'NEGATIVOS';
  ordenGlobal: number;
}

interface Props {
  pares: ParReactivos[];
  seccion: 'POSITIVOS' | 'NEGATIVOS';
  evaluadoId: string;
  respuestasIniciales?: Record<string, { mas: number | null; menos: number | null }>;
  onSeccionCompletada: () => void;
  permitirRetroceso?: boolean;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function PareamientoForzado({
  pares,
  seccion,
  evaluadoId,
  respuestasIniciales = {},
  onSeccionCompletada,
  permitirRetroceso = false
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, { mas: number | null; menos: number | null }>>(respuestasIniciales);
  const [saving, setSaving] = useState(false);

  const parActual = pares[currentIndex];
  const progreso = pares.length > 0 ? ((currentIndex + 1) / pares.length) * 100 : 0;
  const totalRespondidas = Object.values(respuestas).filter(r => r.mas !== null && r.menos !== null).length;

  // ============================================
  // GUARDAR RESPUESTA
  // ============================================

  async function saveAnswer(preguntaId: string, tipo: 'mas' | 'menos', reactivoElegido: 1 | 2) {
    setSaving(true);
    try {
      // Actualizar estado local primero
      const respuestaActual = respuestas[preguntaId] || { mas: null, menos: null };
      const nuevaRespuesta = {
        ...respuestaActual,
        [tipo]: reactivoElegido
      };

      setRespuestas(prev => ({
        ...prev,
        [preguntaId]: nuevaRespuesta
      }));

      // Construir el mensaje de respuesta si ambas están completas
      let mensajeRespuesta = '';
      if (nuevaRespuesta.mas !== null && nuevaRespuesta.menos !== null) {
        const textoMas = nuevaRespuesta.mas === 1 ? parActual.reactivo1.texto : parActual.reactivo2.texto;
        const textoMenos = nuevaRespuesta.mas === 1 ? parActual.reactivo2.texto : parActual.reactivo1.texto;
        mensajeRespuesta = `Me identifico más con "${textoMas}", y menos con "${textoMenos}"`;
      }

      // Guardar en la base de datos
      const res = await fetch("/api/respuestas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evaluadoId,
          preguntaId: parseInt(preguntaId),
          respuestaMas: nuevaRespuesta.mas,
          respuestaMenos: nuevaRespuesta.menos,
          mensajeRespuesta: mensajeRespuesta
        }),
      });

      if (!res.ok) {
        throw new Error("Error al guardar respuesta");
      }

      toast.success(`Respuesta guardada`);

      // Si ambas respuestas están completas, avanzar automáticamente
      if (nuevaRespuesta.mas !== null && nuevaRespuesta.menos !== null) {
        setTimeout(() => {
          if (currentIndex < pares.length - 1) {
            setCurrentIndex(currentIndex + 1);
          } else {
            // Sección completada
            toast.success(`Sección de reactivos ${seccion.toLowerCase()} completada`);
            setTimeout(() => {
              onSeccionCompletada();
            }, 500);
          }
        }, 300);
      }
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
    const respuestaActual = respuestas[parActual.preguntaId];
    
    if (!respuestaActual || respuestaActual.mas === null || respuestaActual.menos === null) {
      toast.error("Debes responder ambas preguntas antes de continuar");
      return;
    }

    if (currentIndex < pares.length - 1) {
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

  if (!parActual) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay pares disponibles en esta sección.</p>
      </div>
    );
  }

  const respuestaActual = respuestas[parActual.preguntaId] || { mas: null, menos: null };
  const tituloSeccion = seccion === 'POSITIVOS' 
    ? 'Parte 1: Características Positivas' 
    : 'Parte 2: Características a Mejorar';
  
  const descripcionSeccion = seccion === 'POSITIVOS'
    ? 'Para cada par, indica con cuál te identificas MÁS y con cuál te identificas MENOS.'
    : 'Continúa indicando con cuál te identificas MÁS y con cuál te identificas MENOS.';

  return (
    <div className="space-y-6">
      {/* Header de la sección */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{tituloSeccion}</h2>
        <p className="text-muted-foreground">{descripcionSeccion}</p>
      </div>

      {/* Barra de progreso */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Par {currentIndex + 1} de {pares.length}</span>
          <span>{totalRespondidas} / {pares.length} completadas</span>
        </div>
        <Progress value={progreso} className="h-2" />
      </div>

      {/* Card del par actual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Par {currentIndex + 1}
            <span className="text-red-500 ml-1">*</span>
          </CardTitle>
          <CardDescription>
            Responde ambas preguntas para continuar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Tabla de respuestas */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground w-1/2">
                    {/* Columna vacía para las afirmaciones */}
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-sm">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-primary font-semibold">(+)</span>
                      <span className="text-xs">Me identifico más</span>
                      <span className="text-xs text-muted-foreground">(Mayormente)</span>
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-sm">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-destructive font-semibold">(-)</span>
                      <span className="text-xs">Me identifico menos</span>
                      <span className="text-xs text-muted-foreground">(Mayormente)</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Fila 1: Reactivo 1 */}
                <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-2">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 font-bold text-primary">
                        A
                      </div>
                      <p className="text-sm leading-relaxed pt-1">
                        {parActual.reactivo1.texto}
                      </p>
                    </div>
                  </td>
                  <td className="text-center py-4 px-4">
                    <button
                      onClick={() => saveAnswer(parActual.preguntaId, 'mas', 1)}
                      disabled={saving}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        respuestaActual.mas === 1
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/30 hover:border-primary/50"
                      } ${saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      aria-label="Me identifico más con A"
                    >
                      {respuestaActual.mas === 1 && (
                        <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                      )}
                    </button>
                  </td>
                  <td className="text-center py-4 px-4">
                    <button
                      onClick={() => saveAnswer(parActual.preguntaId, 'menos', 1)}
                      disabled={saving}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        respuestaActual.menos === 1
                          ? "border-destructive bg-destructive"
                          : "border-muted-foreground/30 hover:border-destructive/50"
                      } ${saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      aria-label="Me identifico menos con A"
                    >
                      {respuestaActual.menos === 1 && (
                        <div className="w-full h-full rounded-full bg-destructive flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                      )}
                    </button>
                  </td>
                </tr>

                {/* Fila 2: Reactivo 2 */}
                <tr className="hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-2">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 font-bold text-secondary">
                        B
                      </div>
                      <p className="text-sm leading-relaxed pt-1">
                        {parActual.reactivo2.texto}
                      </p>
                    </div>
                  </td>
                  <td className="text-center py-4 px-4">
                    <button
                      onClick={() => saveAnswer(parActual.preguntaId, 'mas', 2)}
                      disabled={saving}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        respuestaActual.mas === 2
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/30 hover:border-primary/50"
                      } ${saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      aria-label="Me identifico más con B"
                    >
                      {respuestaActual.mas === 2 && (
                        <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                      )}
                    </button>
                  </td>
                  <td className="text-center py-4 px-4">
                    <button
                      onClick={() => saveAnswer(parActual.preguntaId, 'menos', 2)}
                      disabled={saving}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        respuestaActual.menos === 2
                          ? "border-destructive bg-destructive"
                          : "border-muted-foreground/30 hover:border-destructive/50"
                      } ${saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      aria-label="Me identifico menos con B"
                    >
                      {respuestaActual.menos === 2 && (
                        <div className="w-full h-full rounded-full bg-destructive flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                      )}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mensaje de ayuda */}
          {(respuestaActual.mas === null || respuestaActual.menos === null) && (
            <div className="text-center py-2 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 Debes seleccionar una opción en cada columna
              </p>
            </div>
          )}

          {/* Validación de respuestas */}
          {respuestaActual.mas !== null && respuestaActual.menos !== null && respuestaActual.mas === respuestaActual.menos && (
            <div className="text-center py-2 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-sm text-destructive font-medium">
                ⚠️ No puedes seleccionar la misma opción en ambas columnas
              </p>
            </div>
          )}

          {/* Indicador de guardado */}
          {saving && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Guardando respuesta...</span>
            </div>
          )}

          {/* Botones de navegación */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={anterior}
              disabled={!permitirRetroceso || currentIndex === 0 || saving}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">{currentIndex + 1}</span>
              <span>/</span>
              <span>{pares.length}</span>
            </div>

            <Button
              onClick={siguiente}
              disabled={
                respuestaActual.mas === null || 
                respuestaActual.menos === null || 
                respuestaActual.mas === respuestaActual.menos ||
                saving
              }
            >
              {currentIndex === pares.length - 1 ? (
                "Finalizar Sección"
              ) : (
                <>
                  Siguiente
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Indicador de progreso visual */}
      <div className="flex justify-center gap-1">
        {pares.slice(0, 10).map((_, idx) => (
          <div
            key={idx}
            className={`h-2 w-2 rounded-full transition-colors ${
              idx < currentIndex
                ? "bg-primary"
                : idx === currentIndex
                ? "bg-primary/50 animate-pulse"
                : "bg-muted"
            }`}
          />
        ))}
        {pares.length > 10 && (
          <span className="text-xs text-muted-foreground ml-2">
            +{pares.length - 10} más
          </span>
        )}
      </div>
    </div>
  );
}