"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2, ChevronLeft, ChevronRight, ClipboardList, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Opcion {
  id: string;
  texto: string;
  valor: number;
  orden: number;
}

interface Configuracion {
  min?: number;
  max?: number;
  etiquetaMin?: string;
  etiquetaMax?: string;
}

interface Pregunta {
  id: string;
  tipo: string;
  texto: string;
  descripcion?: string;
  orden: number;
  requerida: boolean;
  opciones?: Opcion[];
  configuracion?: Configuracion;
}

interface Cuestionario {
  id: string;
  titulo: string;
  descripcion?: string;
  preguntas: Pregunta[];
  colorPrimario?: string;
  colorSecundario?: string;
  mostrarProgreso?: boolean;
  permitirRetroceso?: boolean;
  textoInicio?: string;
  textoFinal?: string;
}

type RespuestaValor =
  | { valorNumerico: number }
  | { valoresMultiples: number[] }
  | { valorTexto: string };

interface Props {
  token: string;
  nombre: string;
  cuestionario: Cuestionario;
  evaluadoId: string;
}

export default function CuestionarioClient({ token, nombre, cuestionario, evaluadoId }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, RespuestaValor>>({});
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [started, setStarted] = useState(false);

  const preguntas = cuestionario.preguntas;
  
  // Colores del cuestionario
  const colorPrimario = cuestionario.colorPrimario || "#3b82f6";
  const colorSecundario = cuestionario.colorSecundario || "#1e40af";

  // Guardar respuesta
  const progreso = preguntas.length > 0 ? ((currentIndex + 1) / preguntas.length) * 100 : 0;

  async function saveAnswer(preguntaId: string, valor: RespuestaValor) {
    setSaving(true);
    try {
      const res = await fetch("/api/respuestas-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evaluadoId,
          preguntaId,
          ...valor
        }),
      });

      if (!res.ok) {
        throw new Error("Error al guardar respuesta");
      }

      setRespuestas(prev => ({
        ...prev,
        [preguntaId]: valor
      }));

      toast.success("Respuesta guardada");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al guardar respuesta");
    } finally {
      setSaving(false);
    }
  }

  function siguiente() {
    const preguntaActual = preguntas[currentIndex];
    if (preguntaActual.requerida && !respuestas[preguntaActual.id]) {
      toast.error("Esta pregunta es obligatoria");
      return;
    }

    if (currentIndex < preguntas.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      submitCuestionario();
    }
  }

  function anterior() {
    if (cuestionario.permitirRetroceso && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  async function submitCuestionario() {
    setSaving(true);
    try {
      const res = await fetch("/api/cuestionario/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (res.ok) {
        setCompleted(true);
        toast.success("¡Cuestionario completado!");
      } else {
        throw new Error("Error al enviar");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al enviar el cuestionario");
    } finally {
      setSaving(false);
    }
  }

  function renderPregunta(pregunta: Pregunta) {
    const respuestaActual = respuestas[pregunta.id];

    switch (pregunta.tipo) {
      case "ELECCION_FORZADA":
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Selecciona la opción que mejor te describa:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pregunta.opciones?.slice(0, 2).map((opcion: Opcion, index: number) => (
                <button
                  key={opcion.id}
                  onClick={() => saveAnswer(pregunta.id, { valorNumerico: opcion.valor })}
                  style={{
                    borderColor: respuestaActual && "valorNumerico" in respuestaActual && (respuestaActual as { valorNumerico: number }).valorNumerico === opcion.valor ? colorPrimario : undefined,
                    backgroundColor: respuestaActual && "valorNumerico" in respuestaActual && (respuestaActual as { valorNumerico: number }).valorNumerico === opcion.valor ? `${colorPrimario}15` : undefined
                  }}
                  className={`p-6 text-left border-2 rounded-xl transition-all ${
                    respuestaActual && "valorNumerico" in respuestaActual && (respuestaActual as { valorNumerico: number }).valorNumerico === opcion.valor
                      ? "shadow-lg scale-[1.02]"
                      : "border-slate-200 dark:border-slate-700 hover:border-opacity-50 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      style={{
                        backgroundColor: respuestaActual && "valorNumerico" in respuestaActual && respuestaActual.valorNumerico === opcion.valor ? colorPrimario : undefined
                      }}
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        respuestaActual && "valorNumerico" in respuestaActual && respuestaActual.valorNumerico === opcion.valor
                          ? "text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white">{opcion.texto}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case "OPCION_MULTIPLE":
        return (
          <div className="space-y-3">
            {pregunta.opciones?.map((opcion) => (
              <button
                key={opcion.id}
                onClick={() => saveAnswer(pregunta.id, { valorNumerico: opcion.valor })}
                style={{
                  borderColor: respuestaActual && "valorNumerico" in respuestaActual && respuestaActual.valorNumerico === opcion.valor ? colorPrimario : undefined,
                  backgroundColor: respuestaActual && "valorNumerico" in respuestaActual && respuestaActual.valorNumerico === opcion.valor ? `${colorPrimario}15` : undefined
                }}
                className={`w-full p-4 text-left border-2 rounded-xl transition-all ${
                  respuestaActual && "valorNumerico" in respuestaActual && respuestaActual.valorNumerico === opcion.valor
                    ? "shadow-md"
                    : "border-slate-200 dark:border-slate-700 hover:border-opacity-50"
                }`}
              >
                <span className="text-slate-900 dark:text-white font-medium">{opcion.texto}</span>
              </button>
            ))}
          </div>
        );

      case "SELECCION_MULTIPLE":
        const seleccionados =
          respuestaActual && "valoresMultiples" in respuestaActual
            ? respuestaActual.valoresMultiples
            : [];
        return (
          <div className="space-y-3">
            {pregunta.opciones?.map((opcion) => {
              const isSelected = seleccionados.includes(opcion.valor);
              return (
                <button
                  key={opcion.id}
                  onClick={() => {
                    const nuevosSeleccionados = isSelected
                      ? seleccionados.filter((v: number) => v !== opcion.valor)
                      : [...seleccionados, opcion.valor];
                    saveAnswer(pregunta.id, { valoresMultiples: nuevosSeleccionados });
                  }}
                  style={{
                    borderColor: isSelected ? colorPrimario : undefined,
                    backgroundColor: isSelected ? `${colorPrimario}15` : undefined
                  }}
                  className={`w-full p-4 text-left border-2 rounded-xl transition-all ${
                    isSelected
                      ? ""
                      : "border-slate-200 dark:border-slate-700 hover:border-opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      style={{
                        backgroundColor: isSelected ? colorPrimario : undefined,
                        borderColor: isSelected ? colorPrimario : undefined
                      }}
                      className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                        isSelected ? "" : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-slate-900 dark:text-white font-medium">{opcion.texto}</span>
                  </div>
                </button>
              );
            })}
          </div>
        );

      case "LIKERT":
      case "ESCALA_NUMERICA":
        const min = pregunta.configuracion?.min || 1;
        const max = pregunta.configuracion?.max || 5;
        const valores = Array.from({ length: max - min + 1 }, (_, i) => min + i);
        
        const opcionesOrdenadas = pregunta.opciones?.sort((a, b) => a.orden - b.orden) || [];
        
        return (
          <div className="space-y-6">
            <div className="hidden md:flex justify-between gap-3">
              {valores.map((valor, ) => {
                const opcion = opcionesOrdenadas.find(o => o.valor === valor);
                const isSelected = respuestaActual && "valorNumerico" in respuestaActual && respuestaActual.valorNumerico === valor;
                return (
                  <button
                    key={valor}
                    onClick={() => saveAnswer(pregunta.id, { valorNumerico: valor })}
                    style={{
                      borderColor: isSelected ? colorPrimario : undefined,
                      background: isSelected ? `linear-gradient(to bottom right, ${colorPrimario}, ${colorSecundario})` : undefined
                    }}
                    className={`flex-1 p-6 border-2 rounded-xl transition-all ${
                      isSelected
                        ? "text-white shadow-xl scale-105"
                        : "border-slate-200 dark:border-slate-700 hover:border-opacity-50 hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      {opcion && (
                        <span className={`text-xs text-center font-medium leading-tight min-h-[2.5rem] flex items-center ${
                          isSelected
                            ? "text-white"
                            : "text-slate-600 dark:text-slate-400"
                        }`}>
                          {opcion.texto}
                        </span>
                      )}
                      <span className="text-4xl font-bold">{valor}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="md:hidden space-y-3">
              {valores.map((valor) => {
                const opcion = opcionesOrdenadas.find(o => o.valor === valor);
                const isSelected = respuestaActual && "valorNumerico" in respuestaActual && respuestaActual.valorNumerico === valor;
                return (
                  <button
                    key={valor}
                    onClick={() => saveAnswer(pregunta.id, { valorNumerico: valor })}
                    style={{
                      borderColor: isSelected ? colorPrimario : undefined,
                      background: isSelected ? `linear-gradient(to right, ${colorPrimario}, ${colorSecundario})` : undefined
                    }}
                    className={`w-full p-5 border-2 rounded-xl transition-all ${
                      isSelected
                        ? "text-white shadow-lg"
                        : "border-slate-200 dark:border-slate-700 hover:border-opacity-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-bold flex-shrink-0">{valor}</span>
                      {opcion && (
                        <span className={`text-sm font-medium text-left ${
                          isSelected
                            ? "text-white"
                            : "text-slate-700 dark:text-slate-300"
                        }`}>
                          {opcion.texto}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {(!pregunta.opciones || pregunta.opciones.length === 0) && pregunta.configuracion?.etiquetaMin && pregunta.configuracion?.etiquetaMax && (
              <div className="flex justify-between text-sm font-medium text-slate-600 dark:text-slate-400 px-2">
                <span className="text-left max-w-[45%]">← {pregunta.configuracion.etiquetaMin}</span>
                <span className="text-right max-w-[45%]">{pregunta.configuracion.etiquetaMax} →</span>
              </div>
            )}
          </div>
        );

      case "SI_NO":
        return (
          <div className="flex gap-4">
            <button
              onClick={() => saveAnswer(pregunta.id, { valorNumerico: 1 })}
              style={{
                borderColor: respuestaActual && "valorNumerico" in respuestaActual && respuestaActual.valorNumerico === 1 ? colorPrimario : undefined,
                backgroundColor: respuestaActual && "valorNumerico" in respuestaActual && respuestaActual.valorNumerico === 1 ? colorPrimario : undefined
              }}
              className={`flex-1 p-6 border-2 rounded-xl transition-all ${
                respuestaActual && "valorNumerico" in respuestaActual && respuestaActual.valorNumerico === 1
                  ? "text-white shadow-lg"
                  : "border-slate-200 dark:border-slate-700 hover:border-opacity-50"
              }`}
            >
              <span className="text-xl font-bold">Sí</span>
            </button>
            <button
              onClick={() => saveAnswer(pregunta.id, { valorNumerico: 0 })}
              style={{
                borderColor: respuestaActual && "valorNumerico" in respuestaActual && respuestaActual.valorNumerico === 0 ? colorSecundario : undefined,
                backgroundColor: respuestaActual && "valorNumerico" in respuestaActual && respuestaActual.valorNumerico === 0 ? colorSecundario : undefined
              }}
              className={`flex-1 p-6 border-2 rounded-xl transition-all ${
                respuestaActual && "valorNumerico" in respuestaActual && respuestaActual.valorNumerico === 0
                  ? "text-white shadow-lg"
                  : "border-slate-200 dark:border-slate-700 hover:border-opacity-50"
              }`}
            >
              <span className="text-xl font-bold">No</span>
            </button>
          </div>
        );

      case "TEXTO_CORTO":
        return (
          <Input
            value={
              respuestaActual && "valorTexto" in respuestaActual
                ? respuestaActual.valorTexto
                : ""
            }
            onChange={(e) => setRespuestas(prev => ({
              ...prev,
              [pregunta.id]: { valorTexto: e.target.value }
            }))}
            onBlur={(e) => saveAnswer(pregunta.id, { valorTexto: e.target.value })}
            placeholder="Escribe tu respuesta..."
            style={{ borderColor: colorPrimario }}
            className="w-full h-12 border-2 focus:border-opacity-100"
          />
        );

      case "TEXTO_LARGO":
        return (
          <Textarea
            value={respuestaActual && "valorTexto" in respuestaActual ? respuestaActual.valorTexto : ""}
            onChange={(e) => setRespuestas(prev => ({
              ...prev,
              [pregunta.id]: { valorTexto: e.target.value }
            }))}
            onBlur={(e) => saveAnswer(pregunta.id, { valorTexto: e.target.value })}
            placeholder="Escribe tu respuesta..."
            style={{ borderColor: colorPrimario }}
            className="w-full min-h-32 border-2 focus:border-opacity-100"
          />
        );

      default:
        return (
          <div className="p-6 bg-yellow-50 dark:bg-yellow-950 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl">
            <p className="text-yellow-800 dark:text-yellow-200 font-medium">
              ⚠️ Tipo de pregunta no soportado: <code className="bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">{pregunta.tipo}</code>
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
              Por favor contacta al administrador para reportar este problema.
            </p>
          </div>
        );
    }
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full border-0 shadow-2xl">
          <div className="text-center space-y-4 p-8 pb-6">
            <div 
              style={{ background: `linear-gradient(to bottom right, ${colorPrimario}, ${colorSecundario})` }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mx-auto mb-2"
            >
              <ClipboardList className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">{cuestionario.titulo}</CardTitle>
            {cuestionario.descripcion && (
              <CardDescription className="text-base text-slate-600 dark:text-slate-400">{cuestionario.descripcion}</CardDescription>
            )}
          </div>
          <CardContent className="space-y-6 px-8 pb-8">
            <div 
              style={{ 
                background: `linear-gradient(to bottom right, ${colorPrimario}15, ${colorSecundario}15)`,
                borderColor: `${colorPrimario}40`
              }}
              className="p-6 rounded-xl border-2"
            >
              <p className="text-xl font-semibold text-slate-900 dark:text-white mb-2">¡Hola {nombre}! 👋</p>
              {cuestionario.textoInicio && (
                <p className="text-slate-700 dark:text-slate-300">{cuestionario.textoInicio}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total de preguntas</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{preguntas.length}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Tiempo estimado</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{Math.ceil(preguntas.length * 0.5)} min</p>
              </div>
            </div>

            <Button 
              onClick={() => setStarted(true)} 
              size="lg" 
              style={{ background: `linear-gradient(to right, ${colorPrimario}, ${colorSecundario})` }}
              className="w-full h-14 text-white text-lg font-semibold shadow-lg hover:shadow-xl hover:opacity-90"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Comenzar Cuestionario
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full border-0 shadow-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6">
            <div className="relative mb-6">
              <div 
                style={{ backgroundColor: `${colorPrimario}30` }}
                className="absolute inset-0 rounded-full blur-xl animate-pulse"
              ></div>
              <CheckCircle2 style={{ color: colorPrimario }} className="relative h-20 w-20" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white text-center">¡Cuestionario Completado!</h2>
            {cuestionario.textoFinal ? (
              <p className="text-center text-lg text-slate-600 dark:text-slate-400 max-w-md">{cuestionario.textoFinal}</p>
            ) : (
              <p className="text-center text-lg text-slate-600 dark:text-slate-400 max-w-md">
                Gracias por completar el cuestionario. Tus respuestas han sido guardadas exitosamente.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const preguntaActual = preguntas[currentIndex];
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {cuestionario.mostrarProgreso && (
          <div className="mb-6">
            <div className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              <span>Pregunta {currentIndex + 1} de {preguntas.length}</span>
              <span>{Math.round(progreso)}% completado</span>
            </div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                style={{ 
                  width: `${progreso}%`,
                  background: `linear-gradient(to right, ${colorPrimario}, ${colorSecundario})`
                }}
                className="h-full transition-all duration-300"
              />
            </div>
          </div>
        )}

        <Card className="border-0 shadow-2xl overflow-hidden">
          <div 
            style={{ 
              background: `linear-gradient(135deg, ${colorPrimario} 0%, ${colorSecundario} 100%)`
            }}
            className="p-8 rounded-t-xl"
          >
            <CardTitle className="text-2xl font-bold text-white mb-2">
              {preguntaActual.texto}
              {preguntaActual.requerida && <span className="text-yellow-300 ml-1">*</span>}
            </CardTitle>
            {preguntaActual.descripcion && (
              <CardDescription className="text-base text-white/90">{preguntaActual.descripcion}</CardDescription>
            )}
          </div>
          
          <CardContent className="p-8 space-y-6">
            {renderPregunta(preguntaActual)}

            <div className="flex justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="outline"
                onClick={anterior}
                disabled={!cuestionario.permitirRetroceso || currentIndex === 0}
                className="h-12 px-6 border-2"
              >
                <ChevronLeft className="mr-2 h-5 w-5" />
                Anterior
              </Button>

              <Button
                onClick={siguiente}
                disabled={saving}
                style={{ background: `linear-gradient(to right, ${colorPrimario}, ${colorSecundario})` }}
                className="h-12 px-8 text-white font-semibold shadow-lg hover:opacity-90"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Guardando...
                  </>
                ) : currentIndex === preguntas.length - 1 ? (
                  "Finalizar"
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
      </div>
    </div>
  );
}