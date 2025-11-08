"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Mail, 
  CheckCircle, 
  Clock, 
  Search,
  FileText,
  Send,
  Eye,
  Calendar,
  Loader2,
  FileDown,
  UserCheck,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Filter,
  X,
  MoreVertical,
  RefreshCw,
  Zap,
  Target,
  Award,
  Activity,
  Percent,
  TrendingDown
} from "lucide-react";
import { toast } from "sonner";

interface Evaluado {
  id: string;
  nombre: string;
  correo: string;
  estado: string;
  createdAt: string;
  _count: {
    invitaciones: number;
    respuestas: number;
    resultados: number;
  };
}

interface EstadisticasAvanzadas {
  tasaCompletacion: number;
  tasaEnCurso: number;
  tasaPendiente: number;
  tiempoPromedio: string;
  ultimaActividad: string;
}

export default function EvaluadosPage() {
  const router = useRouter();
  const [evaluados, setEvaluados] = useState<Evaluado[]>([]);
  const [filteredEvaluados, setFilteredEvaluados] = useState<Evaluado[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("todos");
  const [exportingCSV, setExportingCSV] = useState(false);

  useEffect(() => {
    cargarEvaluados();
  }, []);

  useEffect(() => {
    let filtered = evaluados;

    if (searchTerm) {
      filtered = filtered.filter(
        (e) =>
          e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.correo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (estadoFilter !== "todos") {
      filtered = filtered.filter((e) => e.estado === estadoFilter);
    }

    setFilteredEvaluados(filtered);
  }, [searchTerm, estadoFilter, evaluados]);

  async function cargarEvaluados() {
    setLoading(true);
    try {
      const res = await fetch("/api/evaluados");
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setEvaluados(data);
        setFilteredEvaluados(data);
      }
    } catch (error) {
      console.error("Error al cargar evaluados:", error);
      toast.error("Error al cargar evaluados");
    } finally {
      setLoading(false);
    }
  }

  async function exportarCSV(tipo: 'naturales' | 'deciles') {
    setExportingCSV(true);
    try {
      const res = await fetch(`/api/admin/export?tipo=${tipo}`);
      if (!res.ok) throw new Error("Error al exportar CSV");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evaluaciones-psicofinancieras-${tipo}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`CSV de puntajes ${tipo} descargado exitosamente`);
    } catch (error) {
      console.error("Error al exportar CSV:", error);
      toast.error("Error al exportar CSV");
    } finally {
      setExportingCSV(false);
    }
  }

  function limpiarFiltros() {
    setSearchTerm("");
    setEstadoFilter("todos");
  }

  function getEstadoBadge(estado: string) {
    switch (estado) {
      case "completado":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-sm">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completado
          </Badge>
        );
      case "en_curso":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0 shadow-sm">
            <Clock className="h-3 w-3 mr-1" />
            En curso
          </Badge>
        );
      case "pendiente":
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-sm">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {estado}
          </Badge>
        );
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const estadisticas = {
    total: evaluados.length,
    completados: evaluados.filter((e) => e.estado === "completado").length,
    enCurso: evaluados.filter((e) => e.estado === "en_curso").length,
    pendientes: evaluados.filter((e) => e.estado === "pendiente").length,
  };

  const estadisticasAvanzadas: EstadisticasAvanzadas = {
    tasaCompletacion: estadisticas.total > 0 ? Math.round((estadisticas.completados / estadisticas.total) * 100) : 0,
    tasaEnCurso: estadisticas.total > 0 ? Math.round((estadisticas.enCurso / estadisticas.total) * 100) : 0,
    tasaPendiente: estadisticas.total > 0 ? Math.round((estadisticas.pendientes / estadisticas.total) * 100) : 0,
    tiempoPromedio: "~30 min",
    ultimaActividad: evaluados.length > 0 ? new Date(evaluados[0].createdAt).toLocaleDateString('es-ES') : "N/A"
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Cargando evaluados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header Premium */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-2xl p-8 border border-blue-500/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -ml-48 -mb-48"></div>
          
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-white tracking-tight">Evaluados</h1>
                  <p className="text-blue-100 mt-1 text-lg font-medium">
                    Gestión integral de evaluaciones psicofinancieras
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 flex-wrap lg:flex-nowrap">
              <Button
                variant="outline"
                size="lg"
                onClick={cargarEvaluados}
                className="border-2 border-white/30 bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Actualizar
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="lg"
                    disabled={exportingCSV}
                    className="border-2 border-white/30 bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm"
                  >
                    {exportingCSV ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <FileDown className="mr-2 h-5 w-5" />
                    )}
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Tipo de Exportación
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => exportarCSV('naturales')} className="cursor-pointer">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Puntajes Naturales
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportarCSV('deciles')} className="cursor-pointer">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Puntajes Deciles
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="/admin/generar-invitacion">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all font-semibold">
                  <Send className="mr-2 h-5 w-5" />
                  Nueva Invitación
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Estadísticas Avanzadas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Total */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-white to-slate-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Total</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900">{estadisticas.total}</div>
              <p className="text-xs text-slate-500 mt-2">Personas registradas</p>
            </CardContent>
          </Card>

          {/* Completados */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-white to-emerald-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Completados</CardTitle>
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-emerald-700">{estadisticas.completados}</div>
              <div className="flex items-center gap-1 text-xs text-emerald-600 mt-2">
                <Percent className="h-3 w-3" />
                {estadisticasAvanzadas.tasaCompletacion}% completación
              </div>
            </CardContent>
          </Card>

          {/* En Curso */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">En Curso</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-700">{estadisticas.enCurso}</div>
              <div className="flex items-center gap-1 text-xs text-blue-600 mt-2">
                <Zap className="h-3 w-3" />
                {estadisticasAvanzadas.tasaEnCurso}% en progreso
              </div>
            </CardContent>
          </Card>

          {/* Pendientes */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-white to-amber-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Pendientes</CardTitle>
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-amber-700">{estadisticas.pendientes}</div>
              <div className="flex items-center gap-1 text-xs text-amber-600 mt-2">
                <TrendingDown className="h-3 w-3" />
                {estadisticasAvanzadas.tasaPendiente}% pendiente
              </div>
            </CardContent>
          </Card>

          {/* Tiempo Promedio */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-white to-purple-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Tiempo</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700">{estadisticasAvanzadas.tiempoPromedio}</div>
              <p className="text-xs text-slate-500 mt-2">Duración promedio</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y Búsqueda Premium */}
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="🔍 Buscar por nombre, correo o estado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="flex gap-3 flex-wrap lg:flex-nowrap">
                <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                  <SelectTrigger className="h-12 border-2 border-slate-200 bg-white text-slate-900">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtrar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="completado">✅ Completados</SelectItem>
                    <SelectItem value="en_curso">⏳ En curso</SelectItem>
                    <SelectItem value="pendiente">⏸️ Pendientes</SelectItem>
                  </SelectContent>
                </Select>
                {(searchTerm || estadoFilter !== "todos") && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={limpiarFiltros}
                    className="border-2 border-red-300 bg-red-50 hover:bg-red-100 text-red-600 transition-all"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpiar
                  </Button>
                )}
              </div>
            </div>
            {(searchTerm || estadoFilter !== "todos") && (
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <Filter className="h-4 w-4 text-blue-600" />
                <span>
                  Mostrando <strong className="text-blue-700">{filteredEvaluados.length}</strong> de{" "}
                  <strong className="text-blue-700">{evaluados.length}</strong> evaluados
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de evaluados */}
        {filteredEvaluados.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="flex flex-col items-center justify-center py-24">
              <div className="p-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mb-6 animate-pulse">
                <Users className="h-20 w-20 text-slate-400" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-3">
                {searchTerm || estadoFilter !== "todos" ? "No se encontraron evaluados" : "Sin evaluados aún"}
              </h3>
              <p className="text-slate-600 text-center mb-8 max-w-md text-lg">
                {searchTerm || estadoFilter !== "todos"
                  ? "Intenta ajustar los filtros o términos de búsqueda"
                  : "Comienza enviando invitaciones para iniciar las evaluaciones psicofinancieras"}
              </p>
              {!searchTerm && estadoFilter === "todos" && (
                <Link href="/admin/generar-invitacion">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all">
                    <Send className="mr-2 h-5 w-5" />
                    Enviar Primera Invitación
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg bg-white overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 p-4 -m-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-slate-900 text-lg">Listado de Evaluados</CardTitle>
                    <p className="text-slate-600 text-xs mt-0.5">{filteredEvaluados.length} evaluados encontrados</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 hover:bg-slate-50">
                      <TableHead className="font-semibold text-slate-700 py-3 px-4">Evaluado</TableHead>
                      <TableHead className="font-semibold text-slate-700 py-3 px-4">Estado</TableHead>
                      <TableHead className="text-center font-semibold text-slate-700 py-3 px-4">Invitaciones</TableHead>
                      <TableHead className="text-center font-semibold text-slate-700 py-3 px-4">Respuestas</TableHead>
                      <TableHead className="text-center font-semibold text-slate-700 py-3 px-4">Resultados</TableHead>
                      <TableHead className="font-semibold text-slate-700 py-3 px-4">Fecha Registro</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700 py-3 px-4">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvaluados.map((evaluado) => (
                      <TableRow key={evaluado.id} className="border-b border-slate-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group">
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg border border-blue-200 group-hover:shadow-md transition-all flex-shrink-0">
                              <UserCheck className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <div className="font-semibold text-slate-900 text-sm">{evaluado.nombre}</div>
                              <div className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors truncate">
                                <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                <span className="truncate">{evaluado.correo}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex justify-center">
                            {getEstadoBadge(evaluado.estado)}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg w-fit mx-auto hover:shadow-md transition-all">
                            <Send className="h-3.5 w-3.5 text-purple-600" />
                            <span className="text-xs font-bold text-purple-700">{evaluado._count.invitaciones}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg w-fit mx-auto hover:shadow-md transition-all">
                            <FileText className="h-3.5 w-3.5 text-blue-600" />
                            <span className="text-xs font-bold text-blue-700">{evaluado._count.respuestas}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg w-fit mx-auto hover:shadow-md transition-all">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-700">{evaluado._count.resultados}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg w-fit">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="font-medium">{formatDate(evaluado.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-blue-100 text-slate-600 hover:text-blue-600 transition-all rounded-lg hover:shadow-md">
                                <span className="sr-only">Abrir menú</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem 
                                onClick={() => router.push(`/admin/evaluados/${evaluado.id}`)}
                                className="cursor-pointer"
                              >
                                <Eye className="h-4 w-4 mr-2 text-blue-600" />
                                Ver Detalle
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}