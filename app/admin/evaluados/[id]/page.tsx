"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Mail, 
  CheckCircle, 
  Clock, 
  FileText,
  Send,
  Calendar,
  ChevronRight,
  Download,
  Loader2,
  ArrowLeft,
  Award,
  Target,
  Activity,
  ChevronDown,
  ExternalLink,
  Eye
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface EvaluadoDetalle {
  id: string;
  nombre: string;
  correo: string;
  estado: string;
  createdAt: string;
  invitaciones: Array<{
    id: string;
    token: string;
    estado: string;
    createdAt: string;
    fechaExpiracion: string;
    cuestionario: {
      id: string;
      titulo: string;
    } | null;
  }>;
  respuestas: Array<{
    id: string;
    valorNumerico: number | null;
    valorTexto: string | null;
    valoresMultiples: unknown[] | null;
    createdAt: string;
    updatedAt: string;
    preguntaId?: string;
    pregunta?: {
      id: string;
      texto: string;
      tipo: string;
      cuestionarioId: string;
      opciones: Array<{
        id: string;
        texto: string;
        valor: number;
      }>;
    };
    pairReactivos?: {
      reactivo1: {
        id: string;
        texto: string;
        tipo: string;
        pairId: string;
        ordenEnPar: number;
        escala: {
          id: string;
          codigo: string;
          nombre: string;
        };
      };
      reactivo2: {
        id: string;
        texto: string;
        tipo: string;
        pairId: string;
        ordenEnPar: number;
        escala: {
          id: string;
          codigo: string;
          nombre: string;
        };
      };
    };
  }>;
  resultados: Array<{
    id: string;
    puntajesNaturales: unknown;
    puntajesDeciles: unknown;
    createdAt: string;
  }>;
}

export default function EvaluadoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const evaluadoId = params.id as string;

  const [evaluado, setEvaluado] = useState<EvaluadoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [expandedCuestionario, setExpandedCuestionario] = useState<string | null>(null);

  useEffect(() => {
    async function cargarEvaluado() {
      setLoading(true);
      try {
        const res = await fetch(`/api/evaluados/${evaluadoId}`);
        if (!res.ok) throw new Error("Error al cargar evaluado");
        const data = await res.json();
        setEvaluado(data);
      } catch (error) {
        console.error("Error al cargar evaluado:", error);
        toast.error("Error al cargar el detalle del evaluado");
        router.push('/admin/evaluados');
      } finally {
        setLoading(false);
      }
    }

    cargarEvaluado();
  }, [evaluadoId, router]);

  async function descargarPDF() {
    if (!evaluado) return;
    
    setDownloadingPDF(true);
    try {
      const res = await fetch(`/api/evaluados/${evaluado.id}/pdf`);
      if (!res.ok) throw new Error("Error al generar PDF");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-psicofinanciero-${evaluado.nombre.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("PDF descargado exitosamente");
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      toast.error("Error al descargar el PDF");
    } finally {
      setDownloadingPDF(false);
    }
  }

  async function enviarPorCorreo() {
    if (!evaluado) return;
    
    setSendingEmail(true);
    try {
      const res = await fetch(`/api/evaluados/${evaluado.id}/enviar-resultados`, {
        method: 'POST',
      });
      
      if (!res.ok) throw new Error("Error al enviar correo");
      
      toast.success(`Resultados enviados a ${evaluado.correo}`);
    } catch (error) {
      console.error("Error al enviar correo:", error);
      toast.error("Error al enviar el correo");
    } finally {
      setSendingEmail(false);
    }
  }

  function getEstadoBadge(estado: string) {
    switch (estado) {
      case "completado":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-sm text-base px-4 py-2">
            <CheckCircle className="h-4 w-4 mr-2" />
            Completado
          </Badge>
        );
      case "en_curso":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0 shadow-sm text-base px-4 py-2">
            <Clock className="h-4 w-4 mr-2" />
            En curso
          </Badge>
        );
      case "pendiente":
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-sm text-base px-4 py-2">
            <Clock className="h-4 w-4 mr-2" />
            Pendiente
          </Badge>
        );
      default:
        return <Badge variant="secondary" className="text-base px-4 py-2">{estado}</Badge>;
    }
  }

  function getInvitacionEstadoBadge(estado: string) {
    switch (estado) {
      case "completada":
        return <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">Completada</Badge>;
      case "activa":
        return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0">Activa</Badge>;
      case "expirada":
        return <Badge className="bg-gradient-to-r from-gray-500 to-slate-600 text-white border-0">Expirada</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
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

  function getRespuestaTexto(respuesta: EvaluadoDetalle['respuestas'][0]) {
    // Si es un pareamiento, primero intentar mostrar valorTexto (que contiene el mensaje completo)
    if (respuesta.preguntaId?.toString().startsWith('pair-')) {
      if (respuesta.valorTexto) {
        return respuesta.valorTexto;
      }
      
      // Si no hay valorTexto pero hay pairReactivos, construir el mensaje
      if (respuesta.pairReactivos && respuesta.valorNumerico !== null) {
        const { reactivo1, reactivo2 } = respuesta.pairReactivos;
        
        if (respuesta.valorNumerico === 1) {
          return `Me identifico más con "${reactivo1.texto}", y menos con "${reactivo2.texto}"`;
        } else if (respuesta.valorNumerico === 2) {
          return `Me identifico más con "${reactivo2.texto}", y menos con "${reactivo1.texto}"`;
        }
      }
      
      // Si no hay nada, mostrar el pairId
      return respuesta.preguntaId;
    }
    
    // Si hay texto directo, devolverlo
    if (respuesta.valorTexto) {
      return respuesta.valorTexto;
    }
    
    // Si hay múltiples valores, procesarlos
    if (respuesta.valoresMultiples && Array.isArray(respuesta.valoresMultiples)) {
      return respuesta.valoresMultiples.join(', ');
    }
    
    // Si hay valor numérico, devolverlo
    if (respuesta.valorNumerico !== null) {
      return String(respuesta.valorNumerico);
    }
    
    return "Sin respuesta";
  }

  function getTipoDisplay(respuesta: EvaluadoDetalle['respuestas'][0]) {
    // Si es un pair (pair-X), mostrar como pareamiento
    if (respuesta.preguntaId?.toString().startsWith('pair-')) {
      return 'Pareamiento Forzado';
    }
    
    // Si tiene pregunta con tipo, mostrar ese tipo
    if (respuesta.pregunta?.tipo) {
      return respuesta.pregunta.tipo;
    }
    
    // Si tiene pregunta pero sin tipo, mostrar genérico
    if (respuesta.pregunta) {
      return 'Pregunta';
    }
    
    // Si es un pair sin pregunta, mostrar pareamiento
    if (respuesta.preguntaId?.toString().startsWith('pair-')) {
      return 'Pareamiento Forzado';
    }
    
    return 'Tipo desconocido';
  }

  function getInitials(nombre: string) {
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  function agruparRespuestasPorCuestionario(respuestas: EvaluadoDetalle['respuestas']) {
    const grupos: { [key: string]: { titulo: string; respuestas: EvaluadoDetalle['respuestas'] } } = {};
    
    respuestas.forEach(resp => {
      // Use pregunta.cuestionarioId if available, otherwise use a default key
      const cuestionarioId = resp.pregunta?.cuestionarioId || 'default';
      if (!grupos[cuestionarioId]) {
        grupos[cuestionarioId] = {
          titulo: "Cuestionario Psicofinanciero",
          respuestas: []
        };
      }
      grupos[cuestionarioId].respuestas.push(resp);
    });
    
    return grupos;
  }

  function renderPuntajesTable(puntajes: unknown, tipo: 'naturales' | 'deciles') {
    if (!puntajes || typeof puntajes !== 'object') return null;
    
    const entries = Object.entries(puntajes as Record<string, unknown>);
    if (entries.length === 0) return null;

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-bold">Competencia</TableHead>
              <TableHead className="font-bold text-right">Puntaje</TableHead>
              <TableHead className="font-bold">Visualización</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map(([key, value]) => {
              const numValue = typeof value === 'number' ? value : 0;
              const maxValue = tipo === 'deciles' ? 10 : 100;
              const percentage = (numValue / maxValue) * 100;
              
              return (
                <TableRow key={key}>
                  <TableCell className="font-medium">{key}</TableCell>
                  <TableCell className="text-right font-bold text-lg">{numValue}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            percentage >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                            percentage >= 40 ? 'bg-gradient-to-r from-blue-500 to-cyan-600' :
                            'bg-gradient-to-r from-amber-500 to-orange-600'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-600 min-w-[50px]">{percentage.toFixed(0)}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium text-lg">Cargando detalle del evaluado...</p>
        </div>
      </div>
    );
  }

  if (!evaluado) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Botón Volver */}
        <Link href="/admin/evaluados">
          <Button variant="outline" size="lg" className="border-2 border-slate-300 hover:bg-white hover:border-blue-500 transition-all">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Volver a Evaluados
          </Button>
        </Link>

        {/* Header del Evaluado */}
        <Card className="border-0 shadow-xl bg-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl"></div>
          <CardContent className="p-8 relative">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-6 flex-1">
                {/* Avatar con iniciales */}
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-4xl font-bold text-white">
                    {getInitials(evaluado.nombre)}
                  </span>
                </div>
                
                {/* Información principal */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-4xl font-bold text-slate-900 mb-3">
                    {evaluado.nombre}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="h-5 w-5" />
                      <span className="text-base">{evaluado.correo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="h-5 w-5" />
                      <span className="text-base">{formatDate(evaluado.createdAt)}</span>
                    </div>
                    {getEstadoBadge(evaluado.estado)}
                  </div>
                  
                  {/* Estadísticas rápidas */}
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg border border-purple-200">
                      <Send className="h-5 w-5 text-purple-600" />
                      <span className="text-base font-semibold text-purple-700">
                        {evaluado.invitaciones.length} invitaciones
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span className="text-base font-semibold text-blue-700">
                        {evaluado.respuestas.length} respuestas
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                      <Award className="h-5 w-5 text-green-600" />
                      <span className="text-base font-semibold text-green-700">
                        {evaluado.resultados.length} resultados
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Botones de acción */}
              {evaluado.respuestas.length > 0 && (
                <div className="flex gap-3 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={descargarPDF}
                    disabled={downloadingPDF}
                    className="border-2 hover:bg-slate-100"
                  >
                    {downloadingPDF ? (
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-5 w-5 mr-2" />
                    )}
                    Descargar PDF
                  </Button>
                  <Button
                    size="lg"
                    onClick={enviarPorCorreo}
                    disabled={sendingEmail}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {sendingEmail ? (
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <Mail className="h-5 w-5 mr-2" />
                    )}
                    Enviar Email
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contenido con Tabs */}
        <Tabs defaultValue="invitaciones" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-16 mb-6 bg-white shadow-md">
            <TabsTrigger value="invitaciones" className="text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
              <Send className="h-5 w-5 mr-2" />
              Invitaciones
              <Badge variant="secondary" className="ml-2">{evaluado.invitaciones.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="respuestas" className="text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
              <FileText className="h-5 w-5 mr-2" />
              Respuestas
              <Badge variant="secondary" className="ml-2">{evaluado.respuestas.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="resultados" className="text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
              <Award className="h-5 w-5 mr-2" />
              Resultados
              <Badge variant="secondary" className="ml-2">{evaluado.resultados.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Tab de Invitaciones */}
          <TabsContent value="invitaciones" className="space-y-4">
            {evaluado.invitaciones.length === 0 ? (
              <Card className="border-2 border-dashed border-slate-300">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="p-6 bg-slate-100 rounded-full mb-4">
                    <Send className="h-12 w-12 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No hay invitaciones</h3>
                  <p className="text-slate-500 text-center max-w-md">
                    Este evaluado aún no tiene invitaciones registradas
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {evaluado.invitaciones.map((inv, index) => (
                  <Card key={inv.id} className="border-2 border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Timeline indicator */}
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
                              <span className="text-white font-bold text-lg">{index + 1}</span>
                            </div>
                            {index < evaluado.invitaciones.length - 1 && (
                              <div className="w-0.5 h-8 bg-gradient-to-b from-purple-300 to-transparent mt-2" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h4 className="font-bold text-slate-900 text-xl">
                                {inv.cuestionario?.titulo || "Cuestionario Psicofinanciero"}
                              </h4>
                              {getInvitacionEstadoBadge(inv.estado)}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 bg-gradient-to-br from-slate-50 to-purple-50 p-4 rounded-xl border border-slate-200">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                  <Calendar className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                  <div className="text-xs text-slate-500 font-medium">Enviada</div>
                                  <div className="text-sm font-semibold text-slate-900">
                                    {formatDate(inv.createdAt)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                  <Clock className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                  <div className="text-xs text-slate-500 font-medium">Expira</div>
                                  <div className="text-sm font-semibold text-slate-900">
                                    {formatDate(inv.fechaExpiracion)}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                              <ExternalLink className="h-3.5 w-3.5" />
                              <span className="font-mono">Token: {inv.token.slice(0, 16)}...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab de Respuestas */}
          <TabsContent value="respuestas" className="space-y-4">
            {evaluado.respuestas.length === 0 ? (
              <Card className="border-2 border-dashed border-slate-300">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="p-6 bg-slate-100 rounded-full mb-4">
                    <FileText className="h-12 w-12 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No hay respuestas</h3>
                  <p className="text-slate-500 text-center max-w-md">
                    Este evaluado aún no ha respondido ningún cuestionario
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {Object.entries(agruparRespuestasPorCuestionario(evaluado.respuestas)).map(([cuestionarioId, grupo]) => (
                  <Collapsible
                    key={cuestionarioId}
                    open={expandedCuestionario === cuestionarioId}
                    onOpenChange={(isOpen) => setExpandedCuestionario(isOpen ? cuestionarioId : null)}
                  >
                    <Card className="border-2 border-slate-200 hover:border-blue-300 transition-all overflow-hidden">
                      <CollapsibleTrigger className="w-full">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                                <FileText className="h-6 w-6 text-white" />
                              </div>
                              <div className="text-left">
                                <CardTitle className="text-xl font-bold text-slate-900">
                                  {grupo.titulo}
                                </CardTitle>
                                <p className="text-sm text-slate-600 mt-1">
                                  {grupo.respuestas.length} respuestas registradas
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                                {grupo.respuestas.length} preguntas
                              </Badge>
                              <ChevronDown 
                                className={`h-6 w-6 text-slate-600 transition-transform ${
                                  expandedCuestionario === cuestionarioId ? 'rotate-180' : ''
                                }`}
                              />
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <CardContent className="p-6 bg-white">
                          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                            {grupo.respuestas.map((resp, index) => (
                              <div 
                                key={resp.id} 
                                className="p-4 border-2 border-slate-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all bg-gradient-to-br from-white to-slate-50"
                              >
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                                    <span className="text-white font-bold text-sm">{index + 1}</span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-slate-900 text-base leading-relaxed">
                                      {resp.pregunta?.texto || `Pregunta ID: ${resp.preguntaId || 'N/A'}`}
                                    </p>
                                    <Badge variant="outline" className="mt-2 text-xs">
                                      {getTipoDisplay(resp)}
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div className="flex items-start gap-3 bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 ml-11">
                                  <ChevronRight className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <div className="text-xs text-green-700 font-semibold mb-1">RESPUESTA:</div>
                                    <span className="text-slate-900 font-medium">{getRespuestaTexto(resp)}</span>
                                  </div>
                                </div>
                                
                                <div className="text-xs text-slate-500 flex items-center gap-2 mt-3 ml-11">
                                  <Clock className="h-3.5 w-3.5" />
                                  Respondida el {formatDate(resp.updatedAt)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab de Resultados */}
          <TabsContent value="resultados" className="space-y-4">
            {evaluado.resultados.length === 0 ? (
              <Card className="border-2 border-dashed border-slate-300">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="p-6 bg-slate-100 rounded-full mb-4">
                    <Award className="h-12 w-12 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No hay resultados</h3>
                  <p className="text-slate-500 text-center max-w-md">
                    Este evaluado aún no tiene resultados procesados
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {evaluado.resultados.map((resultado, index) => (
                  <Card key={resultado.id} className="border-2 border-slate-200 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 border-b-2 border-orange-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-md">
                            <Award className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              Evaluación #{index + 1}
                            </CardTitle>
                            <p className="text-sm text-slate-600 mt-1">
                              Completada el {formatDate(resultado.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-base px-4 py-2">
                          Completado
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 space-y-6">
                      {/* Puntajes Naturales */}
                      {resultado.puntajesNaturales != null && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
                              <Target className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-xl">Puntajes Naturales</h3>
                              <p className="text-sm text-slate-600">Puntuación directa obtenida</p>
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border-2 border-blue-200">
                            {renderPuntajesTable(resultado.puntajesNaturales as unknown, 'naturales')}
                          </div>
                          
                          {/* JSON Colapsable */}
                          <Collapsible>
                            <CollapsibleTrigger asChild>
                              <Button variant="outline" size="sm" className="w-full">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver datos en formato JSON
                                <ChevronDown className="h-4 w-4 ml-2" />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-3">
                              <pre className="text-xs bg-slate-900 text-green-400 p-4 rounded-xl overflow-x-auto border-2 border-slate-700 font-mono">
                                {JSON.stringify(resultado.puntajesNaturales || {}, null, 2)}
                              </pre>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      )}
                      
                      {/* Separador */}
                      {resultado.puntajesNaturales != null && resultado.puntajesDeciles != null && (
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-slate-300"></div>
                          </div>
                          <div className="relative flex justify-center">
                            <span className="bg-white px-4 text-sm text-slate-500 font-semibold">
                              <Activity className="h-4 w-4 inline mr-2" />
                              Comparación de Puntajes
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Puntajes Deciles */}
                      {resultado.puntajesDeciles != null && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                              <Award className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-xl">Puntajes Deciles</h3>
                              <p className="text-sm text-slate-600">Puntuación normalizada (escala 1-10)</p>
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
                            {renderPuntajesTable(resultado.puntajesDeciles as unknown, 'deciles')}
                          </div>
                          
                          {/* JSON Colapsable */}
                          <Collapsible>
                            <CollapsibleTrigger asChild>
                              <Button variant="outline" size="sm" className="w-full">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver datos en formato JSON
                                <ChevronDown className="h-4 w-4 ml-2" />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-3">
                              <pre className="text-xs bg-slate-900 text-green-400 p-4 rounded-xl overflow-x-auto border-2 border-slate-700 font-mono">
                                {JSON.stringify(resultado.puntajesDeciles || {}, null, 2)}
                              </pre>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      )}
                      
                      {/* Información adicional */}
                      <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Target className="h-4 w-4" />
                          <span className="font-semibold">ID del Resultado:</span>
                          <code className="bg-white px-2 py-1 rounded border border-slate-300 font-mono text-xs">
                            {resultado.id.slice(0, 16)}...
                          </code>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}