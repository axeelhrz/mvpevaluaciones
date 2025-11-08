"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
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
  MoreHorizontal, 
  Mail, 
  Calendar, 
  User, 
  FileText,
  Copy,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Send,
  Search,
  Filter,
  MailOpen,
  Shield,
  Users
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Invitacion {
  id: string;
  token: string;
  estado: string;
  fechaExpiracion: string;
  createdAt: string;
  politicaEntrega?: string;
  correoTercero?: string | null;
  evaluado: {
    id: string;
    nombre: string;
    correo: string;
  } | null;
  cuestionario: {
    id: string;
    titulo: string;
  } | null;
}

export default function InvitacionesPage() {
  const [invitaciones, setInvitaciones] = useState<Invitacion[]>([]);
  const [filteredInvitaciones, setFilteredInvitaciones] = useState<Invitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("todas");
  useEffect(() => {
    fetchInvitaciones();
  }, []);

  useEffect(() => {
    let filtered = invitaciones;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (inv) =>
          inv.evaluado?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.evaluado?.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.cuestionario?.titulo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (filterEstado !== "todas") {
      filtered = filtered.filter((inv) => {
        const isExpired = new Date(inv.fechaExpiracion) < new Date();
        if (filterEstado === "activa") return inv.estado === "activa" && !isExpired;
        if (filterEstado === "completada") return inv.estado === "completada";
        if (filterEstado === "expirada") return inv.estado === "expirada" || isExpired;
        return true;
      });
    }

    setFilteredInvitaciones(filtered);
  }, [searchTerm, filterEstado, invitaciones]);

  const fetchInvitaciones = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/invitaciones");
      if (!response.ok) throw new Error("Error al cargar invitaciones");
      const data = await response.json();
      console.log("Invitaciones cargadas:", data);
      setInvitaciones(data);
      setFilteredInvitaciones(data);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar las invitaciones");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/cuestionario/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Enlace copiado al portapapeles");
  };

  const deleteInvitacion = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta invitación?")) return;

    try {
      const response = await fetch(`/api/invitaciones/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar");

      toast.success("Invitación eliminada");
      fetchInvitaciones();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al eliminar la invitación");
    }
  };

  const getEstadoBadge = (estado: string, fechaExpiracion: string) => {
    const isExpired = new Date(fechaExpiracion) < new Date();
    
    if (estado === "completada") {
      return (
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Completada
        </Badge>
      );
    }
    
    if (estado === "expirada" || isExpired) {
      return (
        <Badge className="bg-gradient-to-r from-gray-500 to-slate-600 text-white border-0">
          <XCircle className="w-3 h-3 mr-1" />
          Expirada
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0">
        <Clock className="w-3 h-3 mr-1" />
        Activa
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEstadisticas = () => {
    const activas = invitaciones.filter(
      (inv) => inv.estado === "activa" && new Date(inv.fechaExpiracion) >= new Date()
    ).length;
    const completadas = invitaciones.filter((inv) => inv.estado === "completada").length;
    const expiradas = invitaciones.filter(
      (inv) => inv.estado === "expirada" || new Date(inv.fechaExpiracion) < new Date()
    ).length;
    const total = invitaciones.length;

    return { total, activas, completadas, expiradas };
  };

  const stats = getEstadisticas();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Cargando invitaciones...</p>
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
              <MailOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Invitaciones</h1>
              <p className="text-slate-600 mt-1">
                Gestiona todas las invitaciones enviadas a los evaluados
              </p>
            </div>
          </div>
          <Link href="/admin/generar-invitacion">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all">
              <Send className="mr-2 h-4 w-4" />
              Nueva Invitación
            </Button>
          </Link>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="border-slate-200 shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-white to-slate-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Enviadas</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <MailOpen className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
              <p className="text-xs text-slate-500 mt-1">Invitaciones en total</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Activas</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">{stats.activas}</div>
              <p className="text-xs text-slate-500 mt-1">Pendientes de completar</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-white to-green-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Completadas</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">{stats.completadas}</div>
              <p className="text-xs text-slate-500 mt-1">Cuestionarios finalizados</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Expiradas</CardTitle>
              <div className="p-2 bg-gray-100 rounded-lg">
                <XCircle className="h-5 w-5 text-gray-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-700">{stats.expiradas}</div>
              <p className="text-xs text-slate-500 mt-1">Fuera de plazo</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Buscar por evaluado, correo o cuestionario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 bg-white shadow-sm"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="h-12 px-6 border-2 border-slate-300 hover:bg-white hover:border-blue-500 transition-all"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtrar: {filterEstado === "todas" ? "Todas" : filterEstado.charAt(0).toUpperCase() + filterEstado.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuLabel>Estado</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilterEstado("todas")} className="cursor-pointer">
                Todas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterEstado("activa")} className="cursor-pointer">
                <Clock className="mr-2 h-4 w-4 text-blue-600" />
                Activas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterEstado("completada")} className="cursor-pointer">
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                Completadas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterEstado("expirada")} className="cursor-pointer">
                <XCircle className="mr-2 h-4 w-4 text-gray-600" />
                Expiradas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            className="h-12 px-6 border-2 border-slate-300 hover:bg-white hover:border-blue-500 transition-all"
            onClick={() => fetchInvitaciones()}
          >
            Actualizar ahora
          </Button>
        </div>

        {/* Tabla de invitaciones */}
        <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            {filteredInvitaciones.length === 0 ? (
              <div className="text-center py-16">
                <div className="p-4 bg-slate-100 rounded-full mb-4 inline-block">
                  <Mail className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {searchTerm || filterEstado !== "todas" 
                    ? "No se encontraron invitaciones" 
                    : "No hay invitaciones"}
                </h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  {searchTerm || filterEstado !== "todas"
                    ? "Intenta ajustar los filtros o el término de búsqueda"
                    : "Comienza enviando invitaciones a los evaluados para realizar las evaluaciones"}
                </p>
                {!searchTerm && filterEstado === "todas" && (
                  <Link href="/admin/generar-invitacion">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg">
                      <Send className="mr-2 h-5 w-5" />
                      Generar Primera Invitación
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50 hover:from-slate-100 hover:to-blue-100">
                      <TableHead className="font-semibold text-slate-700">Evaluado</TableHead>
                      <TableHead className="font-semibold text-slate-700">Cuestionario</TableHead>
                      <TableHead className="font-semibold text-slate-700">Política</TableHead>
                      <TableHead className="font-semibold text-slate-700">Estado</TableHead>
                      <TableHead className="font-semibold text-slate-700">Fecha Creación</TableHead>
                      <TableHead className="font-semibold text-slate-700">Fecha Expiración</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvitaciones.map((invitacion) => (
                      <TableRow key={invitacion.id} className="hover:bg-blue-50/50 transition-colors">
                        <TableCell>
                          {invitacion.evaluado ? (
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900">{invitacion.evaluado.nombre}</div>
                                <div className="flex items-center gap-1 text-sm text-slate-500">
                                  <Mail className="w-3 h-3" />
                                  {invitacion.evaluado.correo}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-slate-400">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm">Evaluado no disponible</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {invitacion.cuestionario ? (
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-purple-600" />
                              <span className="text-slate-700">{invitacion.cuestionario.titulo}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-slate-400">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm">Cuestionario no disponible</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {invitacion.politicaEntrega === "SOLO_ADMIN" && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full">
                                <Shield className="w-3 h-3 text-blue-600" />
                                <span className="text-xs font-medium text-blue-700">Admin</span>
                              </div>
                            )}
                            {invitacion.politicaEntrega === "AUTOMATICO_EVALUADO" && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                                <Mail className="w-3 h-3 text-green-600" />
                                <span className="text-xs font-medium text-green-700">Auto</span>
                              </div>
                            )}
                            {invitacion.politicaEntrega === "TERCERO" && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded-full">
                                <Users className="w-3 h-3 text-amber-600" />
                                <span className="text-xs font-medium text-amber-700">Tercero</span>
                              </div>
                            )}
                            {!invitacion.politicaEntrega && (
                              <span className="text-xs text-slate-500">-</span>
                            )}
                          </div>
                          {invitacion.correoTercero && (
                            <div className="text-xs text-slate-500 mt-1">{invitacion.correoTercero}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          {getEstadoBadge(invitacion.estado, invitacion.fechaExpiracion)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {formatDate(invitacion.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock className="w-4 h-4 text-slate-400" />
                            {formatDate(invitacion.fechaExpiracion)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-blue-100">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel className="font-semibold">Acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => copyLink(invitacion.token)}
                                className="cursor-pointer"
                              >
                                <Copy className="mr-2 h-4 w-4 text-blue-600" />
                                Copiar enlace
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => deleteInvitacion(invitacion.id)}
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}