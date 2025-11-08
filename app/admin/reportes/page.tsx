"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  FileText,
  Download,
  Mail,
  Search,
  MoreHorizontal,
  Trash2,
  RefreshCw,
  Calendar,
  User,
  Loader2,
  BarChart3,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

interface Reporte {
  id: string;
  urlPdf: string;
  fechaGeneracion: string;
  evaluado: {
    id: string;
    nombre: string;
    correo: string;
  };
}

export default function ReportesPage() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [filteredReportes, setFilteredReportes] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState<string | null>(null);

  useEffect(() => {
    cargarReportes();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = reportes.filter(
        (r) =>
          r.evaluado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.evaluado.correo.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredReportes(filtered);
    } else {
      setFilteredReportes(reportes);
    }
  }, [searchTerm, reportes]);

  async function cargarReportes() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reportes");
      if (!res.ok) throw new Error("Error al cargar reportes");
      const data = await res.json();
      setReportes(data);
      setFilteredReportes(data);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar los reportes");
    } finally {
      setLoading(false);
    }
  }

  async function descargarReporte(evaluadoId: string, nombreEvaluado: string) {
    setDownloading(evaluadoId);
    try {
      const res = await fetch(`/api/evaluados/${evaluadoId}/pdf`);
      if (!res.ok) throw new Error("Error al descargar PDF");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-${nombreEvaluado.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Reporte descargado exitosamente");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al descargar el reporte");
    } finally {
      setDownloading(null);
    }
  }

  async function enviarReporte(evaluadoId: string, correo: string) {
    setSending(evaluadoId);
    try {
      const res = await fetch(`/api/evaluados/${evaluadoId}/enviar-resultados`, {
        method: 'POST',
      });
      
      if (!res.ok) throw new Error("Error al enviar reporte");
      
      toast.success(`Reporte enviado a ${correo}`);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al enviar el reporte");
    } finally {
      setSending(null);
    }
  }

  async function regenerarReporte(evaluadoId: string) {
    setRegenerating(evaluadoId);
    try {
      const res = await fetch(`/api/evaluados/${evaluadoId}/pdf`);
      if (!res.ok) throw new Error("Error al regenerar reporte");
      
      toast.success("Reporte regenerado exitosamente");
      await cargarReportes();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al regenerar el reporte");
    } finally {
      setRegenerating(null);
    }
  }

  async function eliminarReporte(reporteId: string) {
    if (!confirm("¿Estás seguro de eliminar este reporte?")) return;

    try {
      const res = await fetch(`/api/admin/reportes/${reporteId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error("Error al eliminar reporte");
      
      toast.success("Reporte eliminado");
      await cargarReportes();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al eliminar el reporte");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Reportes Generados</h1>
              <p className="text-slate-600 mt-1">
                Gestiona y descarga los reportes de evaluación
              </p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 text-lg px-6 py-2 shadow-lg">
            {reportes.length} Reportes
          </Badge>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card className="border-slate-200 shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-white to-slate-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Total Reportes</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{reportes.length}</div>
              <p className="text-xs text-slate-500 mt-1">Documentos generados</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-white to-green-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Evaluados</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">
                {new Set(reportes.map(r => r.evaluado.id)).size}
              </div>
              <p className="text-xs text-slate-500 mt-1">Personas evaluadas</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-white to-purple-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Último Reporte</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-purple-700">
                {reportes.length > 0 
                  ? formatDate(reportes[0].fechaGeneracion).split(',')[0]
                  : 'N/A'}
              </div>
              <p className="text-xs text-slate-500 mt-1">Fecha de generación</p>
            </CardContent>
          </Card>
        </div>

        {/* Buscador */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Buscar por nombre o correo electrónico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Tabla de Reportes */}
        {filteredReportes.length === 0 ? (
          <Card className="border-slate-200 shadow-md">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-slate-100 rounded-full mb-4">
                <FileText className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {searchTerm ? "No se encontraron reportes" : "No hay reportes generados"}
              </h3>
              <p className="text-slate-600 text-center max-w-md">
                {searchTerm
                  ? "Intenta con otro término de búsqueda o ajusta los filtros"
                  : "Los reportes se generan automáticamente cuando los evaluados completan sus cuestionarios"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50 hover:from-slate-100 hover:to-blue-100">
                      <TableHead className="font-semibold text-slate-700">Evaluado</TableHead>
                      <TableHead className="font-semibold text-slate-700">Correo</TableHead>
                      <TableHead className="font-semibold text-slate-700">Fecha Generación</TableHead>
                      <TableHead className="font-semibold text-slate-700">Estado</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReportes.map((reporte) => (
                      <TableRow key={reporte.id} className="hover:bg-blue-50/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="font-semibold text-slate-900">{reporte.evaluado.nombre}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            {reporte.evaluado.correo}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            {formatDate(reporte.fechaGeneracion)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Generado
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-blue-100">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel className="font-semibold">Acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => descargarReporte(reporte.evaluado.id, reporte.evaluado.nombre)}
                                disabled={downloading === reporte.evaluado.id}
                                className="cursor-pointer"
                              >
                                {downloading === reporte.evaluado.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Download className="mr-2 h-4 w-4 text-blue-600" />
                                )}
                                Descargar PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => enviarReporte(reporte.evaluado.id, reporte.evaluado.correo)}
                                disabled={sending === reporte.evaluado.id}
                                className="cursor-pointer"
                              >
                                {sending === reporte.evaluado.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Mail className="mr-2 h-4 w-4 text-green-600" />
                                )}
                                Enviar por Correo
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => regenerarReporte(reporte.evaluado.id)}
                                disabled={regenerating === reporte.evaluado.id}
                                className="cursor-pointer"
                              >
                                {regenerating === reporte.evaluado.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="mr-2 h-4 w-4 text-purple-600" />
                                )}
                                Regenerar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => eliminarReporte(reporte.id)}
                                className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
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