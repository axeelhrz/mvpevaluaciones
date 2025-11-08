"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  GripVertical,
  Save,
  Settings,
  FileText,
  Loader2,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Clock,
  Palette,
  BarChart3,
  CheckSquare,
  List,
  Scale,
  Type,
  FileEdit,
  Hash,
  ToggleLeft,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

interface Opcion {
  id?: string;
  texto: string;
  valor: number;
  orden: number;
}

interface Pregunta {
  id?: string;
  tipo: string;
  texto: string;
  descripcion?: string;
  orden: number;
  requerida: boolean;
  opciones: Opcion[];
  configuracion?: unknown;
}

interface Cuestionario {
  id: string;
  titulo: string;
  descripcion?: string;
  colorPrimario: string;
  colorSecundario: string;
  textoInicio?: string;
  textoFinal?: string;
  mostrarProgreso: boolean;
  permitirRetroceso: boolean;
  tiempoLimite?: number;
  preguntas: Pregunta[];
}

const TIPOS_PREGUNTA = [
  { value: "LIKERT", label: "Escala Likert", icon: BarChart3 },
  { value: "OPCION_MULTIPLE", label: "Opción Múltiple", icon: List },
  { value: "SELECCION_MULTIPLE", label: "Selección Múltiple", icon: CheckSquare },
  { value: "ELECCION_FORZADA", label: "Elección Forzada (A o B)", icon: Scale },
  { value: "TEXTO_CORTO", label: "Texto Corto", icon: Type },
  { value: "TEXTO_LARGO", label: "Texto Largo", icon: FileEdit },
  { value: "ESCALA_NUMERICA", label: "Escala Numérica", icon: Hash },
  { value: "SI_NO", label: "Sí/No", icon: ToggleLeft }
];

export default function EditarCuestionarioPage() {
  const params = useParams();
  const cuestionarioId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cuestionario, setCuestionario] = useState<Cuestionario | null>(null);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [mostrarFormPregunta, setMostrarFormPregunta] = useState(false);
  const [preguntaEditando, setPreguntaEditando] = useState<Pregunta | null>(null);
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);

  const cargarCuestionario = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cuestionarios/${cuestionarioId}`);
      const data = await res.json();
      setCuestionario(data);
      setPreguntas(data.preguntas || []);
    } catch (error) {
      console.error("Error al cargar cuestionario:", error);
      toast.error("Error al cargar el cuestionario");
    } finally {
      setLoading(false);
    }
  }, [cuestionarioId]);

  useEffect(() => {
    cargarCuestionario();
  }, [cargarCuestionario]);

  async function guardarCuestionario() {
    if (!cuestionario) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/cuestionarios/${cuestionarioId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuestionario)
      });

      if (res.ok) {
        toast.success("Cuestionario guardado exitosamente");
      } else {
        toast.error("Error al guardar cuestionario");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al guardar cuestionario");
    } finally {
      setSaving(false);
    }
  }

  function agregarPregunta() {
    const nuevaPregunta: Pregunta = {
      tipo: "OPCION_MULTIPLE",
      texto: "",
      orden: preguntas.length + 1,
      requerida: true,
      opciones: []
    };
    setPreguntaEditando(nuevaPregunta);
    setMostrarFormPregunta(true);
  }

  function editarPregunta(pregunta: Pregunta) {
    setPreguntaEditando(pregunta);
    setMostrarFormPregunta(true);
  }

  async function guardarPregunta(pregunta: Pregunta) {
    try {
      if (pregunta.id) {
        const res = await fetch(`/api/preguntas/${pregunta.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pregunta)
        });
        
        if (res.ok) {
          const preguntaActualizada = await res.json();
          setPreguntas(prev => prev.map(p => p.id === pregunta.id ? preguntaActualizada : p));
          toast.success("Pregunta actualizada correctamente");
        }
      } else {
        const res = await fetch(`/api/cuestionarios/${cuestionarioId}/preguntas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pregunta)
        });
        
        if (res.ok) {
          const nuevaPregunta = await res.json();
          setPreguntas(prev => [...prev, nuevaPregunta]);
          toast.success("Pregunta creada correctamente");
        }
      }
      
      setMostrarFormPregunta(false);
      setPreguntaEditando(null);
    } catch (error) {
      console.error("Error al guardar pregunta:", error);
      toast.error("Error al guardar pregunta");
    }
  }

  async function eliminarPregunta(preguntaId: string) {
    if (!confirm("¿Estás seguro de eliminar esta pregunta?")) return;

    try {
      const res = await fetch(`/api/preguntas/${preguntaId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setPreguntas(prev => prev.filter(p => p.id !== preguntaId));
        toast.success("Pregunta eliminada correctamente");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al eliminar pregunta");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <Loader2 className="relative h-14 w-14 animate-spin text-blue-600 mx-auto" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Cargando cuestionario...</p>
        </div>
      </div>
    );
  }

  if (!cuestionario) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Card className="max-w-md w-full border-red-200 dark:border-red-900 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="p-4 bg-red-100 dark:bg-red-950 rounded-2xl">
                <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Cuestionario no encontrado</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">El cuestionario que buscas no existe</p>
              </div>
              <Link href="/admin/cuestionarios">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Volver a Cuestionarios
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header mejorado */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4 flex-1">
                <Link href="/admin/cuestionarios">
                  <Button variant="ghost" size="sm" className="hover:bg-slate-100 dark:hover:bg-slate-800">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                  </Button>
                </Link>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {cuestionario.titulo}
                      </h1>
                      <p className="text-slate-600 dark:text-slate-400 mt-1">
                        {preguntas.length} {preguntas.length === 1 ? 'pregunta' : 'preguntas'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setMostrarVistaPrevia(true)}
                  className="gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm"
                >
                  <Eye className="h-4 w-4" />
                  Vista Previa
                </Button>
                <Button 
                  onClick={guardarCuestionario} 
                  disabled={saving}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de preguntas */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                      Preguntas del Cuestionario
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Arrastra las preguntas para reordenarlas
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={agregarPregunta}
                    className="gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg"
                  >
                    <Plus className="h-4 w-4" />
                    Nueva Pregunta
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {preguntas.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20"></div>
                      <div className="relative p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl inline-block">
                        <FileText className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                      No hay preguntas aún
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      Comienza agregando tu primera pregunta al cuestionario
                    </p>
                    <Button 
                      onClick={agregarPregunta}
                      className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                    >
                      <Plus className="h-5 w-5" />
                      Agregar Primera Pregunta
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {preguntas.map((pregunta, index) => {
                      const TipoIcon = TIPOS_PREGUNTA.find(t => t.value === pregunta.tipo)?.icon || FileText;
                      return (
                        <Card 
                          key={pregunta.id || index} 
                          className="group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800"
                        >
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300"></div>
                          
                          <CardContent className="p-5 relative">
                            <div className="flex items-start gap-4">
                              <div className="mt-1">
                                <GripVertical className="h-5 w-5 text-slate-400 cursor-move hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-sm flex items-center gap-1">
                                        <TipoIcon className="h-3 w-3" />
                                        {TIPOS_PREGUNTA.find(t => t.value === pregunta.tipo)?.label}
                                      </Badge>
                                      {pregunta.requerida && (
                                        <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white border-0 shadow-sm">
                                          <AlertCircle className="h-3 w-3 mr-1" />
                                          Requerida
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="font-semibold text-slate-900 dark:text-white text-lg mb-1">
                                      {pregunta.texto || "Sin texto"}
                                    </p>
                                    {pregunta.descripcion && (
                                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                        {pregunta.descripcion}
                                      </p>
                                    )}
                                    {pregunta.opciones.length > 0 && (
                                      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-1.5">
                                        {pregunta.opciones.map((opcion, idx) => (
                                          <div key={idx} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                            {opcion.texto}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => editarPregunta(pregunta)}
                                      className="gap-2 hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm"
                                    >
                                      <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                      Editar
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => pregunta.id && eliminarPregunta(pregunta.id)}
                                      className="hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 dark:hover:border-red-700 transition-all shadow-sm"
                                    >
                                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Panel de configuración mejorado */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Configuración General
                </CardTitle>
                <CardDescription>
                  Personaliza el comportamiento del cuestionario
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <Palette className="h-4 w-4 text-blue-600" />
                    Color Primario
                  </Label>
                  <div className="flex gap-3">
                    <div className="relative">
                      <Input
                        type="color"
                        value={cuestionario.colorPrimario}
                        onChange={(e) => setCuestionario({...cuestionario, colorPrimario: e.target.value})}
                        className="w-16 h-12 cursor-pointer border-2 shadow-sm"
                      />
                    </div>
                    <Input
                      value={cuestionario.colorPrimario}
                      onChange={(e) => setCuestionario({...cuestionario, colorPrimario: e.target.value})}
                      className="flex-1 font-mono text-sm shadow-sm"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent"></div>

                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Opciones de Visualización
                  </Label>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
                          <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <Label htmlFor="mostrarProgreso" className="cursor-pointer font-medium text-slate-900 dark:text-white">
                          Mostrar progreso
                        </Label>
                      </div>
                      <input
                        type="checkbox"
                        id="mostrarProgreso"
                        checked={cuestionario.mostrarProgreso}
                        onChange={(e) => setCuestionario({...cuestionario, mostrarProgreso: e.target.checked})}
                        className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-950 rounded-lg">
                          <ArrowLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <Label htmlFor="permitirRetroceso" className="cursor-pointer font-medium text-slate-900 dark:text-white">
                          Permitir retroceso
                        </Label>
                      </div>
                      <input
                        type="checkbox"
                        id="permitirRetroceso"
                        checked={cuestionario.permitirRetroceso}
                        onChange={(e) => setCuestionario({...cuestionario, permitirRetroceso: e.target.checked})}
                        className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {cuestionario.tiempoLimite && (
                  <>
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent"></div>
                    
                    <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 rounded-xl border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        <Label className="font-semibold text-amber-900 dark:text-amber-100">
                          Tiempo Límite
                        </Label>
                      </div>
                      <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                        {cuestionario.tiempoLimite} minutos
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Estadísticas rápidas */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Resumen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <span className="text-sm font-medium">Total de preguntas</span>
                  <span className="text-2xl font-bold">{preguntas.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <span className="text-sm font-medium">Preguntas requeridas</span>
                  <span className="text-2xl font-bold">
                    {preguntas.filter(p => p.requerida).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <span className="text-sm font-medium">Total de opciones</span>
                  <span className="text-2xl font-bold">
                    {preguntas.reduce((sum, p) => sum + p.opciones.length, 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de vista previa */}
      {mostrarVistaPrevia && cuestionario && (
        <VistaPrevia
          cuestionario={cuestionario}
          preguntas={preguntas}
          onClose={() => setMostrarVistaPrevia(false)}
        />
      )}

      {/* Modal de edición de pregunta mejorado */}
      {mostrarFormPregunta && preguntaEditando && (
        <FormularioPregunta
          pregunta={preguntaEditando}
          onGuardar={guardarPregunta}
          onCancelar={() => {
            setMostrarFormPregunta(false);
            setPreguntaEditando(null);
          }}
        />
      )}
    </div>
  );
}

// Componente de Vista Previa
function VistaPrevia({
  cuestionario,
  preguntas,
  onClose
}: {
  cuestionario: Cuestionario;
  preguntas: Pregunta[];
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string | number | number[]>>({});

  const preguntaActual = preguntas[currentIndex];
  const progreso = preguntas.length > 0 ? ((currentIndex + 1) / preguntas.length) * 100 : 0;

  function renderPregunta(pregunta: Pregunta) {
    const respuestaActual = respuestas[pregunta.id || pregunta.orden];

    switch (pregunta.tipo) {
      case "ELECCION_FORZADA":
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Selecciona la opción que mejor te describa:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pregunta.opciones?.slice(0, 2).map((opcion, index) => (
                <button
                  key={index}
                  onClick={() => setRespuestas(prev => ({ ...prev, [pregunta.id || pregunta.orden]: opcion.valor }))}
                  className={`p-6 text-left border-2 rounded-lg transition-all ${
                    respuestaActual === opcion.valor
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-md"
                      : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      respuestaActual === opcion.valor
                        ? "bg-blue-500 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{opcion.texto}</p>
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
            {pregunta.opciones?.map((opcion, index) => (
              <button
                key={index}
                onClick={() => setRespuestas(prev => ({ ...prev, [pregunta.id || pregunta.orden]: opcion.valor }))}
                className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                  respuestaActual === opcion.valor
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                    : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
                }`}
              >
                {opcion.texto}
              </button>
            ))}
          </div>
        );

      case "SELECCION_MULTIPLE":
        const seleccionados = Array.isArray(respuestaActual) ? respuestaActual : [];
        return (
          <div className="space-y-3">
            {pregunta.opciones?.map((opcion, index) => {
              const isSelected = seleccionados.includes(opcion.valor);
              return (
                <button
                  key={index}
                  onClick={() => {
                    const nuevosSeleccionados = isSelected
                      ? seleccionados.filter((v: number) => v !== opcion.valor)
                      : [...seleccionados, opcion.valor];
                    setRespuestas(prev => ({ ...prev, [pregunta.id || pregunta.orden]: nuevosSeleccionados }));
                  }}
                  className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 border-2 rounded ${
                      isSelected ? "bg-blue-500 border-blue-500" : "border-slate-300 dark:border-slate-600"
                    }`}>
                      {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                    </div>
                    {opcion.texto}
                  </div>
                </button>
              );
            })}
          </div>
        );

      case "LIKERT":
      case "ESCALA_NUMERICA":
        const valores = Array.from({ length: 5 }, (_, i) => i + 1);
        return (
          <div className="space-y-4">
            <div className="flex justify-between gap-2">
              {valores.map((valor) => (
                <button
                  key={valor}
                  onClick={() => setRespuestas(prev => ({ ...prev, [pregunta.id || pregunta.orden]: valor }))}
                  className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                    respuestaActual === valor
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
                  }`}
                >
                  {valor}
                </button>
              ))}
            </div>
          </div>
        );

      case "SI_NO":
        return (
          <div className="flex gap-4">
            <button
              onClick={() => setRespuestas(prev => ({ ...prev, [pregunta.id || pregunta.orden]: 1 }))}
              className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                respuestaActual === 1
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
              }`}
            >
              Sí
            </button>
            <button
              onClick={() => setRespuestas(prev => ({ ...prev, [pregunta.id || pregunta.orden]: 0 }))}
              className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                respuestaActual === 0
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
              }`}
            >
              No
            </button>
          </div>
        );

      case "TEXTO_CORTO":
        return (
          <Input
            value={typeof respuestaActual === 'string' || typeof respuestaActual === 'number' ? respuestaActual : ""}
            onChange={(e) => setRespuestas(prev => ({ ...prev, [pregunta.id || pregunta.orden]: e.target.value }))}
            placeholder="Escribe tu respuesta..."
            className="w-full"
          />
        );

      case "TEXTO_LARGO":
        return (
          <Textarea
            value={typeof respuestaActual === 'string' || typeof respuestaActual === 'number' ? respuestaActual : ""}
            onChange={(e) => setRespuestas(prev => ({ ...prev, [pregunta.id || pregunta.orden]: e.target.value }))}
            placeholder="Escribe tu respuesta..."
            className="w-full min-h-32"
          />
        );

      default:
        return <p className="text-slate-500">Tipo de pregunta no soportado en vista previa</p>;
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Vista Previa</h2>
            <p className="text-blue-100 mt-1">Así verán los usuarios el cuestionario</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {preguntas.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                No hay preguntas para mostrar en la vista previa
              </p>
            </div>
          ) : (
            <>
              {/* Progreso */}
              {cuestionario.mostrarProgreso && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                    <span>Pregunta {currentIndex + 1} de {preguntas.length}</span>
                    <span>{Math.round(progreso)}%</span>
                  </div>
                  <Progress value={progreso} className="h-2" />
                </div>
              )}

              {/* Pregunta actual */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">
                    {preguntaActual.texto}
                    {preguntaActual.requerida && <span className="text-red-500 ml-1">*</span>}
                  </CardTitle>
                  {preguntaActual.descripcion && (
                    <CardDescription>{preguntaActual.descripcion}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  {renderPregunta(preguntaActual)}

                  {/* Botones de navegación */}
                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                      disabled={!cuestionario.permitirRetroceso || currentIndex === 0}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Anterior
                    </Button>

                    <Button
                      onClick={() => {
                        if (currentIndex < preguntas.length - 1) {
                          setCurrentIndex(currentIndex + 1);
                        }
                      }}
                      disabled={currentIndex === preguntas.length - 1}
                    >
                      {currentIndex === preguntas.length - 1 ? (
                        "Finalizar"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente para el formulario de pregunta mejorado
function FormularioPregunta({
  pregunta,
  onGuardar,
  onCancelar
}: {
  pregunta: Pregunta;
  onGuardar: (pregunta: Pregunta) => void;
  onCancelar: () => void;
}) {
  const [formData, setFormData] = useState<Pregunta>(pregunta);

  function agregarOpcion() {
    const nuevaOpcion: Opcion = {
      texto: "",
      valor: formData.opciones.length + 1,
      orden: formData.opciones.length + 1
    };
    setFormData({
      ...formData,
      opciones: [...formData.opciones, nuevaOpcion]
    });
  }

  function actualizarOpcion(index: number, campo: keyof Opcion, valor: string | number) {
    const nuevasOpciones = [...formData.opciones];
    nuevasOpciones[index] = { ...nuevasOpciones[index], [campo]: valor };
    setFormData({ ...formData, opciones: nuevasOpciones });
  }

  function eliminarOpcion(index: number) {
    setFormData({
      ...formData,
      opciones: formData.opciones.filter((_, i) => i !== index)
    });
  }

  const necesitaOpciones = ["OPCION_MULTIPLE", "SELECCION_MULTIPLE", "ELECCION_FORZADA", "LIKERT"].includes(formData.tipo);
  const tipoSeleccionado = TIPOS_PREGUNTA.find(t => t.value === formData.tipo);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden border-0 shadow-2xl bg-white dark:bg-slate-900">
        {/* Header mejorado */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                <FileText className="h-7 w-7" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  {formData.id ? "Editar" : "Nueva"} Pregunta
                </CardTitle>
                <p className="text-blue-100 mt-1 text-sm">
                  Configura los detalles de tu pregunta
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelar}
              className="text-white hover:bg-white/20 rounded-lg"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Content con scroll */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <CardContent className="p-6 space-y-6">
            {/* Tipo de Pregunta */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Settings className="h-4 w-4 text-blue-600" />
                Tipo de Pregunta *
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {TIPOS_PREGUNTA.map(tipo => {
                  const Icon = tipo.icon;
                  const isSelected = formData.tipo === tipo.value;
                  return (
                    <button
                      key={tipo.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, tipo: tipo.value, opciones: [] })}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 shadow-md'
                          : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className={`flex flex-col items-center gap-2 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100 dark:bg-blue-900' : 'bg-slate-100 dark:bg-slate-800'}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-medium text-center leading-tight">
                          {tipo.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {tipoSeleccionado && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Tipo seleccionado:</span> {tipoSeleccionado.label}
                  </p>
                </div>
              )}
            </div>

            {/* Texto de la Pregunta */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Type className="h-4 w-4 text-purple-600" />
                Texto de la Pregunta *
              </Label>
              <Textarea
                value={formData.texto}
                onChange={(e) => setFormData({ ...formData, texto: e.target.value })}
                placeholder="¿Cuál es tu pregunta?"
                required
                rows={3}
                className="text-base border-2 border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 shadow-sm resize-none"
              />
            </div>

            {/* Descripción */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <FileEdit className="h-4 w-4 text-green-600" />
                Descripción (opcional)
              </Label>
              <Textarea
                value={formData.descripcion || ""}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Agrega contexto o instrucciones adicionales..."
                rows={2}
                className="text-sm border-2 border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 shadow-sm resize-none"
              />
            </div>

            {/* Pregunta Requerida */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950 border-2 border-red-200 dark:border-red-800 hover:shadow-md transition-all">
              <input
                type="checkbox"
                id="requerida"
                checked={formData.requerida}
                onChange={(e) => setFormData({ ...formData, requerida: e.target.checked })}
                className="h-5 w-5 rounded border-red-300 text-red-600 focus:ring-red-500 cursor-pointer"
              />
              <Label htmlFor="requerida" className="cursor-pointer font-semibold text-red-900 dark:text-red-100 flex items-center gap-2 flex-1">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                Marcar como pregunta obligatoria
              </Label>
            </div>

            {/* Opciones de Respuesta */}
            {necesitaOpciones && (
              <div className="space-y-4 p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <List className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <Label className="text-base font-bold text-slate-900 dark:text-white">
                      Opciones de Respuesta
                    </Label>
                  </div>
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={agregarOpcion}
                    className="gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar
                  </Button>
                </div>
                
                {formData.opciones.length > 0 ? (
                  <div className="space-y-3">
                    {formData.opciones.map((opcion, index) => (
                      <div key={index} className="group flex gap-3 items-start p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border-2 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all">
                        <div className="flex items-center justify-center min-w-[40px] h-11 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg font-bold text-sm shadow-md">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-2">
                          <Input
                            value={opcion.texto}
                            onChange={(e) => actualizarOpcion(index, "texto", e.target.value)}
                            placeholder={`Texto de la opción ${index + 1}`}
                            className="border-2 border-slate-300 dark:border-slate-600 focus:border-blue-500 shadow-sm"
                          />
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Valor numérico</Label>
                              <Input
                                type="number"
                                value={opcion.valor}
                                onChange={(e) => actualizarOpcion(index, "valor", parseInt(e.target.value))}
                                placeholder="Valor"
                                className="border-2 border-slate-300 dark:border-slate-600 focus:border-blue-500 shadow-sm"
                              />
                            </div>
                            <div className="flex items-end">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => eliminarOpcion(index)}
                                className="h-11 px-3 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 dark:hover:border-red-700 transition-all group-hover:opacity-100 opacity-70"
                              >
                                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600">
                    <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full inline-block mb-4">
                      <FileText className="h-10 w-10 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-2">
                      No hay opciones agregadas
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      Haz clic en &quot;Agregar&quot; para crear opciones de respuesta
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </div>

        {/* Footer con botones */}
        <div className="sticky bottom-0 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 border-t-2 border-slate-200 dark:border-slate-700 p-6">
          <div className="flex gap-3">
            <Button
              onClick={() => onGuardar(formData)}
              disabled={!formData.texto || (necesitaOpciones && formData.opciones.length === 0)}
              className="flex-1 gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all py-6 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="h-5 w-5" />
              {formData.id ? "Actualizar" : "Guardar"} Pregunta
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancelar}
              className="px-8 py-6 text-base hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm border-2 font-semibold"
            >
              <XCircle className="h-5 w-5 mr-2" />
              Cancelar
            </Button>
          </div>
          {!formData.texto && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-3 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              El texto de la pregunta es obligatorio
            </p>
          )}
          {necesitaOpciones && formData.opciones.length === 0 && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-3 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Debes agregar al menos una opción de respuesta
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}