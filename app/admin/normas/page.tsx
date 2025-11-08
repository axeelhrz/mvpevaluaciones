"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { 
  Loader2, 
  CheckCircle, 
  Clock, 
  FileSpreadsheet,
  CheckCircle2,
  Plus,
  Info,
  Calendar,
  Settings,
  TrendingUp
} from "lucide-react";

interface VersionNorma {
  id: string;
  version: string;
  descripcion: string;
  activa: boolean;
  fechaActivacion: string | null;
  createdAt: string;
  createdBy: string | null;
}

export default function NormasPage() {
  const [versiones, setVersiones] = useState<VersionNorma[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nuevaVersion, setNuevaVersion] = useState({
    version: '',
    descripcion: '',
    activa: false
  });

  useEffect(() => {
    cargarVersiones();
  }, []);

  async function cargarVersiones() {
    try {
      const res = await fetch('/api/versiones-norma');
      if (!res.ok) throw new Error('Error al cargar versiones');
      
      const data = await res.json();
      setVersiones(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar versiones de normas');
    } finally {
      setLoading(false);
    }
  }

  async function crearVersion() {
    if (!nuevaVersion.version) {
      toast.error('Debes especificar un número de versión');
      return;
    }

    try {
      const res = await fetch('/api/versiones-norma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaVersion)
      });

      if (!res.ok) throw new Error('Error al crear versión');

      toast.success('Versión creada exitosamente');
      setDialogOpen(false);
      setNuevaVersion({ version: '', descripcion: '', activa: false });
      await cargarVersiones();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear versión');
    }
  }

  async function activarVersion(id: string) {
    if (!confirm('¿Estás seguro de activar esta versión? Se desactivarán las demás.')) {
      return;
    }

    try {
      const res = await fetch(`/api/versiones-norma/${id}/activar`, {
        method: 'POST'
      });

      if (!res.ok) throw new Error('Error al activar versión');

      toast.success('Versión activada exitosamente');
      await cargarVersiones();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al activar versión');
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
          <p className="text-slate-600 font-medium">Cargando normas...</p>
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
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Gestión de Normas</h1>
              <p className="text-slate-600 mt-1">
                Administra las versiones de normas del sistema
              </p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Versión
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-900">Crear Nueva Versión de Norma</DialogTitle>
                <DialogDescription className="text-slate-600">
                  Define una nueva versión de normas para el sistema
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5 py-4">
                <div className="space-y-2">
                  <Label htmlFor="version" className="text-sm font-semibold text-slate-700">
                    Versión <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="version"
                    placeholder="1.0.0"
                    value={nuevaVersion.version}
                    onChange={(e) => setNuevaVersion({
                      ...nuevaVersion,
                      version: e.target.value
                    })}
                    className="h-11 border-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descripcion" className="text-sm font-semibold text-slate-700">
                    Descripción
                  </Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Describe los cambios en esta versión..."
                    value={nuevaVersion.descripcion}
                    onChange={(e) => setNuevaVersion({
                      ...nuevaVersion,
                      descripcion: e.target.value
                    })}
                    rows={4}
                    className="border-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <input
                    type="checkbox"
                    id="activa"
                    checked={nuevaVersion.activa}
                    onChange={(e) => setNuevaVersion({
                      ...nuevaVersion,
                      activa: e.target.checked
                    })}
                    className="h-5 w-5 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <Label htmlFor="activa" className="cursor-pointer font-semibold text-slate-700">
                      Activar inmediatamente
                    </Label>
                    <p className="text-xs text-slate-600 mt-1">Esta versión se usará para todos los reportes futuros</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  className="border-2 border-slate-300 hover:bg-slate-100"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={crearVersion}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  Crear Versión
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card className="border-slate-200 shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-white to-slate-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Total Versiones</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{versiones.length}</div>
              <p className="text-xs text-slate-500 mt-1">Versiones registradas</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-white to-green-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Versión Activa</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">
                {versiones.find(v => v.activa)?.version || 'Ninguna'}
              </div>
              <p className="text-xs text-slate-500 mt-1">En uso actualmente</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-white to-purple-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Última Actualización</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-purple-700">
                {versiones.length > 0 
                  ? formatDate(versiones[0].createdAt).split(',')[0]
                  : 'N/A'
                }
              </div>
              <p className="text-xs text-slate-500 mt-1">Fecha de modificación</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de versiones */}
        <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Historial de Versiones
            </CardTitle>
            <CardDescription>
              Todas las versiones de normas registradas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {versiones.length === 0 ? (
              <div className="text-center py-16">
                <div className="p-4 bg-slate-100 rounded-full mb-4 inline-block">
                  <FileSpreadsheet className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No hay versiones</h3>
                <p className="text-slate-600 mb-6">
                  Crea la primera versión de normas para comenzar
                </p>
                <Button 
                  onClick={() => setDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Crear Primera Versión
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50 hover:from-slate-100 hover:to-blue-100">
                      <TableHead className="font-semibold text-slate-700">Versión</TableHead>
                      <TableHead className="font-semibold text-slate-700">Descripción</TableHead>
                      <TableHead className="font-semibold text-slate-700">Estado</TableHead>
                      <TableHead className="font-semibold text-slate-700">Fecha Creación</TableHead>
                      <TableHead className="font-semibold text-slate-700">Fecha Activación</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {versiones.map((version) => (
                      <TableRow key={version.id} className="hover:bg-blue-50/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                              <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="font-semibold text-slate-900">v{version.version}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md text-slate-700">
                          {version.descripcion || <span className="text-slate-400 italic">Sin descripción</span>}
                        </TableCell>
                        <TableCell>
                          {version.activa ? (
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Activa
                            </Badge>
                          ) : (
                            <Badge className="bg-gradient-to-r from-gray-500 to-slate-600 text-white border-0">
                              <Clock className="h-3 w-3 mr-1" />
                              Inactiva
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {formatDate(version.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {version.fechaActivacion 
                              ? formatDate(version.fechaActivacion)
                              : <span className="text-slate-400">-</span>
                            }
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {!version.activa && (
                            <Button
                              size="sm"
                              onClick={() => activarVersion(version.id)}
                              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Activar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información adicional */}
        <Card className="mt-6 border-slate-200 shadow-md bg-gradient-to-br from-white to-blue-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
              <Info className="h-5 w-5 text-blue-600" />
              Información sobre Versiones de Normas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Las normas se utilizan para comparar los puntajes de los evaluados con estándares establecidos</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Solo puede haber una versión activa a la vez en el sistema</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Al activar una nueva versión, todos los reportes futuros usarán esa versión</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Los reportes anteriores mantienen la referencia a la versión con la que fueron generados</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Puedes importar normas desde Excel en la sección de importación de datos</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}