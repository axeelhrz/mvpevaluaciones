"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { 
  FileText, 
  CheckCircle,
  Loader2,
  BarChart3,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  ListChecks
} from "lucide-react";

export default function CuestionariosPage() {
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [stats, setStats] = useState({
    totalPreguntas: 193,
    totalInvitaciones: 0,
    totalRespuestas: 0,
    tiempoPromedio: 30
  });

  // Auto-refresh cada 5 segundos
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      cargarEstadisticas();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  async function cargarEstadisticas() {
    try {
      // Cargar las estadísticas reales del cuestionario único
      const res = await fetch("/api/cuestionarios/estadisticas");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading && stats.totalInvitaciones === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <Loader2 className="relative h-14 w-14 animate-spin text-blue-600 mx-auto" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                      Cuestionario Psicofinanciero
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      Evaluación de competencias psicofinancieras y habilidades de gestión
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 shadow-md px-4 py-2 text-base">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Activo
                </Badge>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    autoRefresh
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                  }`}
                  title={autoRefresh ? "Desactivar auto-actualización" : "Activar auto-actualización"}
                >
                  <span className={`inline-block w-2 h-2 rounded-full ${autoRefresh ? "bg-white animate-pulse" : "bg-slate-400"}`}></span>
                  {autoRefresh ? "Actualizando" : "Pausado"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide opacity-90">Preguntas</CardTitle>
              <div className="p-2 bg-white/20 rounded-lg">
                <ListChecks className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold mb-1">{stats.totalPreguntas}</div>
              <p className="text-xs text-blue-100 font-medium flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                4 secciones del cuestionario
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-emerald-500 to-green-600 text-white">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide opacity-90">Invitaciones</CardTitle>
              <div className="p-2 bg-white/20 rounded-lg">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold mb-1">{stats.totalInvitaciones}</div>
              <p className="text-xs text-emerald-100 font-medium flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Enviadas en total
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-violet-500 to-purple-600 text-white">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide opacity-90">Respuestas</CardTitle>
              <div className="p-2 bg-white/20 rounded-lg">
                <BarChart3 className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold mb-1">{stats.totalRespuestas}</div>
              <p className="text-xs text-violet-100 font-medium flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Cuestionarios completados
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide opacity-90">Tiempo Estimado</CardTitle>
              <div className="p-2 bg-white/20 rounded-lg">
                <Clock className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold mb-1">{stats.tiempoPromedio} min</div>
              <p className="text-xs text-amber-100 font-medium flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Duración promedio
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Información del Cuestionario */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-800">
            <CardTitle className="text-2xl">Estructura del Cuestionario</CardTitle>
            <CardDescription>
              Evaluación completa de competencias psicofinancieras en 4 secciones
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Sección 1 */}
              <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                      Sección 1: Datos Estadísticos
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Información demográfica y profesional del evaluado
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        11 campos
                      </Badge>
                      <span className="text-slate-500">• Obligatorios</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Sección 2 */}
              <div className="p-5 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                      Sección 2: Pareamiento Forzado Positivo
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Afirmaciones positivas sobre competencias y habilidades
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                        96 pares
                      </Badge>
                      <span className="text-slate-500">• Reactivos 1-192</span>
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-500 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Sección 3 */}
              <div className="p-5 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 rounded-xl border border-violet-200 dark:border-violet-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                      Sección 3: Pareamiento Forzado Negativo
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Afirmaciones sobre dificultades y áreas de mejora
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="secondary" className="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                        72 pares
                      </Badge>
                      <span className="text-slate-500">• Reactivos 193-336</span>
                    </div>
                  </div>
                  <div className="p-3 bg-violet-500 rounded-lg">
                    <ListChecks className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Sección 4 */}
              <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                      Sección 4: Habilidades Financieras
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Evaluación Likert de gestión de recursos financieros
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                        25 preguntas
                      </Badge>
                      <span className="text-slate-500">• Escala 1-5 • Reactivos 337-361</span>
                    </div>
                  </div>
                  <div className="p-3 bg-amber-500 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}