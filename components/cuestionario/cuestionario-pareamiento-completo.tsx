"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, ChevronRight, ClipboardList, Sparkles, BookOpen, Save } from "lucide-react";
import { toast } from "sonner";
import { CUESTIONARIO_COMPLETO, getAllPreguntas } from "@/lib/cuestionario-completo";
import FormularioDatosEstadisticos from "./formulario-datos-estadisticos";

interface Props {
  token: string;
  nombre: string;
  evaluadoId: string;
}

type RespuestaPareamiento = { mas: string; menos: string };
type RespuestaLikert = number;
type Respuesta = RespuestaPareamiento | RespuestaLikert;

export default function CuestionarioPareamientoCompleto({ token, nombre, evaluadoId }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<number, Respuesta>>({});
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [started, setStarted] = useState(false);
  const [mostrarDatosEstadisticos, setMostrarDatosEstadisticos] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [mostrarInstrucciones, setMostrarInstrucciones] = useState<string | null>(null);
  const [guardandoRespuesta, setGuardandoRespuesta] = useState(false);

  const preguntas = getAllPreguntas();
  const preguntaActual = preguntas[currentIndex];
  const progreso = ((currentIndex + 1) / preguntas.length) * 100;

  // Colores del cuestionario
  const colorPrimario = "#667eea";
  const colorSecundario = "#764ba2";

  // Calcular secciones para la barra de progreso
  const secciones = [
    { nombre: 'Pareamiento Positivo', inicio: 0, fin: 96, color: '#10b981' },
    { nombre: 'Pareamiento Negativo', inicio: 96, fin: 168, color: '#f59e0b' },
    { nombre: 'Habilidades Financieras', inicio: 168, fin: 193, color: '#8b5cf6' }
  ];

  // Función para guardar respuesta en el servidor
  const guardarRespuestaEnServidor = useCallback(async (orden: number, respuesta: Respuesta) => {
    try {
      setGuardandoRespuesta(true);
      
      const res = await fetch("/api/cuestionario/guardar-respuesta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          evaluadoId,
          orden,
          respuesta
        }),
      });

      if (!res.ok) {
        throw new Error("Error al guardar");
      }
      
      console.log(`✅ Respuesta ${orden} guardada`);
    } catch (error) {
      console.error("Error al guardar respuesta:", error);
      toast.error("Error al guardar la respuesta. Intenta de nuevo.");
    } finally {
      setGuardandoRespuesta(false);
    }
  }, [evaluadoId]);

  // Función para obtener el título del par
  function getTituloPar(pregunta: Record<string, unknown>): string {
    const tipo = pregunta.tipo as string;
    if (tipo !== 'pareamiento') {
      const texto = pregunta.texto as string;
      return typeof texto === 'string' ? texto : '';
    }
    
    const competenciaA = typeof pregunta.competenciaA === 'string' ? pregunta.competenciaA : '';
    const competenciaB = typeof pregunta.competenciaB === 'string' ? pregunta.competenciaB : '';
    
    if (competenciaA && competenciaB) {
      return `${competenciaA} vs ${competenciaB}`;
    }
    
    const afirmacionAStr = typeof pregunta.afirmacionA === 'string' ? pregunta.afirmacionA : '';
    const afirmacionBStr = typeof pregunta.afirmacionB === 'string' ? pregunta.afirmacionB : '';
    
    const palabrasA = afirmacionAStr ? afirmacionAStr.split(' ').slice(0, 3).join(' ') : '';
    const palabrasB = afirmacionBStr ? afirmacionBStr.split(' ').slice(0, 3).join(' ') : '';
    
    if (palabrasA && palabrasB) {
      return `${palabrasA}... vs ${palabrasB}...`;
    }
    
    return `Par ${currentIndex + 1}`;
  }

  // Guardar respuesta de pareamiento con lógica exclusiva
  function guardarRespuestaPareamiento(afirmacion: 'A' | 'B', tipo: 'mas' | 'menos') {
    const orden = getOrdenActual();
    const actual = respuestas[orden] as RespuestaPareamiento || { mas: '', menos: '' };
    
    let nuevaRespuesta: RespuestaPareamiento;
    
    if (actual[tipo] === afirmacion) {
      nuevaRespuesta = { ...actual, [tipo]: '' };
    } else {
      const otraAfirmacion = afirmacion === 'A' ? 'B' : 'A';
      if (actual[tipo] === otraAfirmacion) {
        const tipoOpuesto = tipo === 'mas' ? 'menos' : 'mas';
        nuevaRespuesta = { 
          [tipo]: afirmacion,
          [tipoOpuesto]: otraAfirmacion
        } as RespuestaPareamiento;
      } else {
        nuevaRespuesta = { ...actual, [tipo]: afirmacion };
      }
    }
    
    guardarRespuestaLocal(orden, nuevaRespuesta);
    
    // Guardar en servidor si la respuesta está completa
    if (nuevaRespuesta.mas && nuevaRespuesta.menos && nuevaRespuesta.mas !== nuevaRespuesta.menos) {
      guardarRespuestaEnServidor(orden, nuevaRespuesta);
    }
  }

  function guardarRespuestaLocal(orden: number, respuesta: Respuesta) {
    setRespuestas(prev => ({
      ...prev,
      [orden]: respuesta
    }));
    
    // Si es respuesta Likert, guardar inmediatamente
    if (typeof respuesta === 'number') {
      guardarRespuestaEnServidor(orden, respuesta);
    }
  }

  // Helper para obtener el orden de la pregunta actual
  function getOrdenActual(): number {
    return typeof preguntaActual.orden === 'number' ? preguntaActual.orden : 0;
  }

  function detectarCambioSeccion(indexActual: number, indexNuevo: number): boolean {
    const seccionActual = preguntas[indexActual]?.seccion;
    const seccionNueva = preguntas[indexNuevo]?.seccion;
    return seccionActual !== seccionNueva;
  }

  function siguiente() {
    const orden = getOrdenActual();
    const respuestaActual = respuestas[orden];
    
    if (!respuestaActual) {
      toast.error("Por favor responde antes de continuar");
      return;
    }

    if (preguntaActual.tipo === 'pareamiento') {
      const resp = respuestaActual as RespuestaPareamiento;
      if (!resp.mas || !resp.menos) {
        toast.error("Debes seleccionar una opción para MÁS y otra para MENOS");
        return;
      }
      if (resp.mas === resp.menos) {
        toast.error("Debes seleccionar opciones diferentes para MÁS y MENOS");
        return;
      }
    }

    if (currentIndex < preguntas.length - 1) {
      const cambioSeccion = detectarCambioSeccion(currentIndex, currentIndex + 1);
      
      if (cambioSeccion) {
        const nuevaSeccion = preguntas[currentIndex + 1].seccion as string;
        setMostrarInstrucciones(nuevaSeccion);
        return;
      }

      setDirection('forward');
      setAnimating(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setAnimating(false);
      }, 300);
    } else {
      submitCuestionario();
    }
  }

  function continuarDespuesInstrucciones() {
    setMostrarInstrucciones(null);
    setDirection('forward');
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      setAnimating(false);
    }, 300);
  }

  async function submitCuestionario() {
    setSaving(true);
    try {
      const res = await fetch("/api/cuestionario/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token,
          evaluadoId,
          respuestas: [] // Las respuestas ya están guardadas
        }),
      });

      if (res.ok) {
        setCompleted(true);
        toast.success("¡Cuestionario completado!");
      } else {
        const error = await res.json();
        throw new Error(error.message || "Error al enviar");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al enviar el cuestionario");
    } finally {
      setSaving(false);
    }
  }

  if (mostrarDatosEstadisticos) {
    return (
      <FormularioDatosEstadisticos
        evaluadoId={evaluadoId}
        onComplete={() => setMostrarDatosEstadisticos(false)}
        colorPrimario={colorPrimario}
        colorSecundario={colorSecundario}
      />
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full border-0 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-4 p-8 pb-6">
            <div 
              style={{ background: `linear-gradient(to bottom right, ${colorPrimario}, ${colorSecundario})` }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mx-auto mb-2 animate-in zoom-in duration-700"
            >
              <ClipboardList className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white animate-in fade-in slide-in-from-bottom-2 duration-700">
              {CUESTIONARIO_COMPLETO.titulo}
            </CardTitle>
            <CardDescription className="text-base text-slate-600 dark:text-slate-400 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
              {CUESTIONARIO_COMPLETO.descripcion}
            </CardDescription>
          </div>
          <CardContent className="space-y-6 px-8 pb-8">
            <div 
              style={{ 
                background: `linear-gradient(to bottom right, ${colorPrimario}15, ${colorSecundario}15)`,
                borderColor: `${colorPrimario}40`
              }}
              className="p-6 rounded-xl border-2 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200"
            >
              <p className="text-xl font-semibold text-slate-900 dark:text-white mb-2">¡Hola {nombre}! 👋</p>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                {CUESTIONARIO_COMPLETO.textoInicio}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total de preguntas</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{preguntas.length}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Tiempo estimado</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{CUESTIONARIO_COMPLETO.tiempoEstimado} min</p>
              </div>
            </div>

            <Button 
              onClick={() => {
                setStarted(true);
                setMostrarInstrucciones('pareamiento_positivo');
              }} 
              size="lg" 
              style={{ background: `linear-gradient(to right, ${colorPrimario}, ${colorSecundario})` }}
              className="w-full h-14 text-white text-lg font-semibold shadow-lg hover:shadow-xl hover:opacity-90 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-500"
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
        <Card className="max-w-2xl w-full border-0 shadow-2xl animate-in zoom-in duration-700">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6">
            <div className="relative mb-6 animate-in zoom-in duration-1000">
              <div 
                style={{ backgroundColor: `${colorPrimario}30` }}
                className="absolute inset-0 rounded-full blur-xl animate-pulse"
              ></div>
              <CheckCircle2 style={{ color: colorPrimario }} className="relative h-20 w-20" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              ¡Cuestionario Completado!
            </h2>
            <p className="text-center text-lg text-slate-600 dark:text-slate-400 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              {CUESTIONARIO_COMPLETO.textoFinal}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mostrarInstrucciones) {
    const siguienteSeccion = preguntas.find(p => {
      const seccion = p.seccion as string;
      return seccion === mostrarInstrucciones;
    });
    const nombreSeccion = mostrarInstrucciones === 'pareamiento_negativo' 
      ? 'Pareamiento Negativo' 
      : mostrarInstrucciones === 'habilidades_financieras'
      ? 'Habilidades Financieras'
      : 'Pareamiento Positivo';

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
        <Card className="max-w-3xl w-full border-0 shadow-2xl animate-in zoom-in duration-500">
          <div 
            style={{ 
              background: `linear-gradient(135deg, ${colorPrimario} 0%, ${colorSecundario} 100%)`
            }}
            className="p-8 rounded-t-xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm animate-in zoom-in duration-500">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-white">
                  {nombreSeccion}
                </CardTitle>
                <CardDescription className="text-white/90 text-base mt-1">
                  Lee las instrucciones antes de continuar
                </CardDescription>
              </div>
            </div>
          </div>

          <CardContent className="p-8 space-y-6">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <div className="p-6 bg-blue-50 dark:bg-blue-950 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                <p className="text-base text-blue-900 dark:text-blue-100 whitespace-pre-line leading-relaxed">
                  {typeof siguienteSeccion?.instrucciones === 'string' ? siguienteSeccion.instrucciones : ''}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={continuarDespuesInstrucciones}
                size="lg"
                style={{ background: `linear-gradient(to right, ${colorPrimario}, ${colorSecundario})` }}
                className="h-14 px-8 text-white text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Entendido, continuar
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const respuestaActualPareamiento = (preguntaActual.tipo as string) === 'pareamiento' 
    ? (respuestas[getOrdenActual()] as RespuestaPareamiento || { mas: '', menos: '' })
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Indicador de guardado */}
        {guardandoRespuesta && (
          <div className="fixed top-4 right-4 z-50 bg-white dark:bg-slate-800 shadow-lg rounded-lg px-4 py-3 flex items-center gap-2 animate-in slide-in-from-top-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Guardando...</span>
          </div>
        )}

        <div className="mb-6">
          <div className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            <span>Pregunta {currentIndex + 1} de {preguntas.length}</span>
            <div className="flex items-center gap-2">
              <span>{Math.round(progreso)}% completado</span>
              {Object.keys(respuestas).length > 0 && (
                <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Save className="h-3 w-3" />
                  {Object.keys(respuestas).length} guardadas
                </span>
              )}
            </div>
          </div>
          
          <div className="relative h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            {secciones.map((seccion, index) => {
              const seccionWidth = ((seccion.fin - seccion.inicio) / preguntas.length) * 100;
              const seccionLeft = (seccion.inicio / preguntas.length) * 100;
              const progresoEnSeccion = Math.min(
                Math.max(((currentIndex + 1 - seccion.inicio) / (seccion.fin - seccion.inicio)) * 100, 0),
                100
              );
              
              return (
                <div
                  key={index}
                  className="absolute h-full"
                  style={{
                    left: `${seccionLeft}%`,
                    width: `${seccionWidth}%`,
                  }}
                >
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{ backgroundColor: seccion.color }}
                  />
                  
                  <div
                    className="absolute inset-y-0 left-0 transition-all duration-500 ease-out"
                    style={{
                      width: `${progresoEnSeccion}%`,
                      backgroundColor: seccion.color,
                    }}
                  />
                  
                  {index < secciones.length - 1 && (
                    <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white dark:bg-slate-900" />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
            {secciones.map((seccion, index) => (
              <div 
                key={index}
                className="flex items-center gap-1"
                style={{ 
                  opacity: currentIndex >= seccion.inicio && currentIndex < seccion.fin ? 1 : 0.5 
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: seccion.color }}
                />
                <span className="font-medium">{seccion.nombre}</span>
              </div>
            ))}
          </div>
        </div>

        <Card 
          className={`border-0 shadow-2xl overflow-hidden transition-all duration-300 ${
            animating 
              ? direction === 'forward' 
                ? 'animate-out fade-out slide-out-to-left-4' 
                : 'animate-out fade-out slide-out-to-right-4'
              : 'animate-in fade-in slide-in-from-right-4'
          }`}
        >
          <div 
            style={{ 
              background: `linear-gradient(135deg, ${colorPrimario} 0%, ${colorSecundario} 100%)`
            }}
            className="p-8 rounded-t-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-2xl font-bold text-white flex-1">
                {getTituloPar(preguntaActual)}
              </CardTitle>
              <span className="text-white/80 text-sm font-medium bg-white/20 px-3 py-1 rounded-full animate-in zoom-in duration-300">
                {preguntaActual.seccion === 'pareamiento_positivo' && 'Sección 2'}
                {preguntaActual.seccion === 'pareamiento_negativo' && 'Sección 3'}
                {preguntaActual.seccion === 'habilidades_financieras' && 'Sección 4'}
              </span>
            </div>
          </div>
          
          <CardContent className="p-8 space-y-6">
            {(preguntaActual.tipo as string) === 'pareamiento' && 'afirmacionA' in preguntaActual && 'afirmacionB' in preguntaActual && respuestaActualPareamiento && (
              <div className="space-y-6">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 text-center font-medium animate-in fade-in duration-500">
                  Selecciona con cuál afirmación te identificas <strong>MÁS</strong> y con cuál <strong>MENOS</strong>
                </p>
                
                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
                  <p className="text-lg text-slate-900 dark:text-white mb-4 font-medium">
                    {typeof preguntaActual.afirmacionA === 'string' ? preguntaActual.afirmacionA : ''}
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => guardarRespuestaPareamiento('A', 'mas')}
                      variant={respuestaActualPareamiento.mas === 'A' ? 'default' : 'outline'}
                      disabled={respuestaActualPareamiento.menos === 'A'}
                      className="flex-1 h-12 transition-all duration-300 hover:scale-105"
                      style={{
                        backgroundColor: respuestaActualPareamiento.mas === 'A' ? colorPrimario : undefined,
                        color: respuestaActualPareamiento.mas === 'A' ? 'white' : undefined
                      }}
                    >
                      (+) Me identifico MÁS
                    </Button>
                    <Button
                      onClick={() => guardarRespuestaPareamiento('A', 'menos')}
                      variant={respuestaActualPareamiento.menos === 'A' ? 'default' : 'outline'}
                      disabled={respuestaActualPareamiento.mas === 'A'}
                      className="flex-1 h-12 transition-all duration-300 hover:scale-105"
                      style={{
                        backgroundColor: respuestaActualPareamiento.menos === 'A' ? colorSecundario : undefined,
                        color: respuestaActualPareamiento.menos === 'A' ? 'white' : undefined
                      }}
                    >
                      (-) Me identifico MENOS
                    </Button>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-right-4 duration-500 delay-200">
                  <p className="text-lg text-slate-900 dark:text-white mb-4 font-medium">
                    {typeof preguntaActual.afirmacionB === 'string' ? preguntaActual.afirmacionB : ''}
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => guardarRespuestaPareamiento('B', 'mas')}
                      variant={respuestaActualPareamiento.mas === 'B' ? 'default' : 'outline'}
                      disabled={respuestaActualPareamiento.menos === 'B'}
                      className="flex-1 h-12 transition-all duration-300 hover:scale-105"
                      style={{
                        backgroundColor: respuestaActualPareamiento.mas === 'B' ? colorPrimario : undefined,
                        color: respuestaActualPareamiento.mas === 'B' ? 'white' : undefined
                      }}
                    >
                      (+) Me identifico MÁS
                    </Button>
                    <Button
                      onClick={() => guardarRespuestaPareamiento('B', 'menos')}
                      variant={respuestaActualPareamiento.menos === 'B' ? 'default' : 'outline'}
                      disabled={respuestaActualPareamiento.mas === 'B'}
                      className="flex-1 h-12 transition-all duration-300 hover:scale-105"
                      style={{
                        backgroundColor: respuestaActualPareamiento.menos === 'B' ? colorSecundario : undefined,
                        color: respuestaActualPareamiento.menos === 'B' ? 'white' : undefined
                      }}
                    >
                      (-) Me identifico MENOS
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {(preguntaActual.tipo as string) === 'likert' && 'escala' in preguntaActual && (
              <div className="space-y-4">
                {(() => {
                  const orden = getOrdenActual();
                  const escala = preguntaActual.escala as Record<string, unknown>;
                  const etiquetas = Array.isArray(escala.etiquetas) ? (escala.etiquetas as unknown[]) : [];
                  
                  return etiquetas.map((etiqueta: unknown, index: number) => {
                    const valor = index + 1;
                    const isSelected = respuestas[orden] === valor;
                    const etiquetaStr = typeof etiqueta === 'string' ? etiqueta : '';
                    
                    return (
                      <button
                        key={valor}
                        onClick={() => guardarRespuestaLocal(orden, valor)}
                        style={{
                          borderColor: isSelected ? colorPrimario : undefined,
                          background: isSelected ? `linear-gradient(to right, ${colorPrimario}, ${colorSecundario})` : undefined,
                          animationDelay: `${index * 50}ms`
                        }}
                        className={`w-full p-5 border-2 rounded-xl transition-all duration-300 text-left hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-2 ${
                          isSelected
                            ? "text-white shadow-lg"
                            : "border-slate-200 dark:border-slate-700 hover:border-opacity-50"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-3xl font-bold flex-shrink-0">{valor}</span>
                          <span className={`text-sm font-medium ${
                            isSelected
                              ? "text-white"
                              : "text-slate-700 dark:text-slate-300"
                          }`}>
                            {etiquetaStr}
                          </span>
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>
            )}

            <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-700 animate-in fade-in duration-500 delay-300">
              <Button
                onClick={siguiente}
                disabled={saving}
                style={{ background: `linear-gradient(to right, ${colorPrimario}, ${colorSecundario})` }}
                className="h-12 px-8 text-white font-semibold shadow-lg hover:opacity-90 hover:scale-105 transition-all duration-300"
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