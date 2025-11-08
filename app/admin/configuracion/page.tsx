"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Save, Settings, Plus, Trash2, Mail, DollarSign, FileText, Bell } from "lucide-react";

interface CampoEstadistico {
  id?: string;
  nombre: string;
  etiqueta: string;
  tipo: string;
  requerido: boolean;
  activo: boolean;
  orden: number;
  opciones?: Record<string, unknown> | string[];
  ayuda?: string;
}

interface Configuraciones {
  email_admin?: string;
  precio_evaluacion?: number;
  politica_entrega_default?: string;
  [key: string]: string | number | boolean | undefined;
}

export default function ConfiguracionPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configuraciones, setConfiguraciones] = useState<Configuraciones>({});
  const [camposEstadisticos, setCamposEstadisticos] = useState<CampoEstadistico[]>([]);

  useEffect(() => {
    cargarConfiguraciones();
    cargarCamposEstadisticos();
  }, []);

  async function cargarConfiguraciones() {
    try {
      const res = await fetch('/api/configuracion');
      if (!res.ok) throw new Error('Error al cargar configuraciones');
      
      const data = await res.json();
      const configObj: Configuraciones = {};
      data.forEach((config: { clave: string; valor: string | number | boolean | null }) => {
        configObj[config.clave] = config.valor as string | number | boolean | undefined;
      });
      setConfiguraciones(configObj);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar configuraciones');
    } finally {
      setLoading(false);
    }
  }

  async function cargarCamposEstadisticos() {
    try {
      const res = await fetch('/api/campos-estadisticos?activos=false');
      if (!res.ok) throw new Error('Error al cargar campos');
      
      const data = await res.json();
      setCamposEstadisticos(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar campos estadísticos');
    }
  }

  async function guardarConfiguracion(clave: string, valor: string | number | boolean | null | undefined, categoria: string) {
    setSaving(true);
    try {
      const res = await fetch('/api/configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clave, valor, categoria })
      });

      if (!res.ok) throw new Error('Error al guardar');
      
      toast.success('Configuración guardada');
      await cargarConfiguraciones();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  }

  async function guardarCampoEstadistico(campo: CampoEstadistico) {
    try {
      const res = await fetch('/api/campos-estadisticos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campo)
      });

      if (!res.ok) throw new Error('Error al guardar');
      
      toast.success('Campo guardado');
      await cargarCamposEstadisticos();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar campo');
    }
  }

  async function eliminarCampo(id: string) {
    if (!confirm('¿Estás seguro de eliminar este campo?')) return;

    try {
      const res = await fetch(`/api/campos-estadisticos?id=${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Error al eliminar');
      
      toast.success('Campo eliminado');
      await cargarCamposEstadisticos();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar campo');
    }
  }

  function agregarNuevoCampo() {
    const nuevoCampo: CampoEstadistico = {
      nombre: '',
      etiqueta: '',
      tipo: 'TEXTO',
      requerido: false,
      activo: true,
      orden: camposEstadisticos.length + 1,
      opciones: {},
      ayuda: ''
    };
    setCamposEstadisticos([...camposEstadisticos, nuevoCampo]);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container max-w-6xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Configuración del Sistema</h1>
              <p className="text-slate-600 mt-1">
                Gestiona las configuraciones globales del sistema
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border-2 border-slate-200 p-1 rounded-lg shadow-sm">
            <TabsTrigger 
              value="general"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
            >
              General
            </TabsTrigger>
            <TabsTrigger 
              value="campos"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
            >
              Campos Estadísticos
            </TabsTrigger>
            <TabsTrigger 
              value="reportes"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
            >
              Reportes
            </TabsTrigger>
            <TabsTrigger 
              value="notificaciones"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
            >
              Notificaciones
            </TabsTrigger>
          </TabsList>

          {/* TAB: GENERAL */}
          <TabsContent value="general">
            <Card className="border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Configuración General
                </CardTitle>
                <CardDescription>
                  Configuraciones básicas del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email_admin" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    Correo del Administrador
                  </Label>
                  <Input
                    id="email_admin"
                    type="email"
                    value={configuraciones.email_admin || ''}
                    onChange={(e) => setConfiguraciones({
                      ...configuraciones,
                      email_admin: e.target.value
                    })}
                    placeholder="admin@ejemplo.com"
                    className="h-11 border-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-sm text-slate-500">
                    Correo para recibir notificaciones del sistema
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="precio_evaluacion" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    Precio de Evaluación (USD)
                  </Label>
                  <Input
                    id="precio_evaluacion"
                    type="number"
                    step="0.01"
                    value={configuraciones.precio_evaluacion || ''}
                    onChange={(e) => setConfiguraciones({
                      ...configuraciones,
                      precio_evaluacion: parseFloat(e.target.value)
                    })}
                    placeholder="29.99"
                    className="h-11 border-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-sm text-slate-500">
                    Precio para pagos directos con Stripe
                  </p>
                </div>

                <Button
                  onClick={() => {
                    guardarConfiguracion('email_admin', configuraciones.email_admin, 'general');
                    guardarConfiguracion('precio_evaluacion', configuraciones.precio_evaluacion, 'pagos');
                  }}
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: CAMPOS ESTADÍSTICOS */}
          <TabsContent value="campos">
            <Card className="border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      Campos Estadísticos
                    </CardTitle>
                    <CardDescription>
                      Configura los campos demográficos que se solicitan en el formulario
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={agregarNuevoCampo} 
                    size="sm"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Campo
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {camposEstadisticos.map((campo, index) => (
                    <Card key={campo.id || index} className="p-4 border-2 border-slate-200 hover:border-blue-300 transition-colors">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-slate-700">Nombre (clave)</Label>
                          <Input
                            value={campo.nombre}
                            onChange={(e) => {
                              const nuevos = [...camposEstadisticos];
                              nuevos[index].nombre = e.target.value;
                              setCamposEstadisticos(nuevos);
                            }}
                            placeholder="edad"
                            className="border-2 border-slate-300 focus:border-blue-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-slate-700">Etiqueta</Label>
                          <Input
                            value={campo.etiqueta}
                            onChange={(e) => {
                              const nuevos = [...camposEstadisticos];
                              nuevos[index].etiqueta = e.target.value;
                              setCamposEstadisticos(nuevos);
                            }}
                            placeholder="Edad"
                            className="border-2 border-slate-300 focus:border-blue-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-slate-700">Tipo</Label>
                          <select
                            value={campo.tipo}
                            onChange={(e) => {
                              const nuevos = [...camposEstadisticos];
                              nuevos[index].tipo = e.target.value;
                              setCamposEstadisticos(nuevos);
                            }}
                            className="w-full h-10 rounded-lg border-2 border-slate-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          >
                            <option value="TEXTO">Texto</option>
                            <option value="NUMERO">Número</option>
                            <option value="FECHA">Fecha</option>
                            <option value="SELECCION">Selección</option>
                            <option value="SELECCION_MULTIPLE">Selección Múltiple</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-slate-700">Orden</Label>
                          <Input
                            type="number"
                            value={campo.orden}
                            onChange={(e) => {
                              const nuevos = [...camposEstadisticos];
                              nuevos[index].orden = parseInt(e.target.value);
                              setCamposEstadisticos(nuevos);
                            }}
                            className="border-2 border-slate-300 focus:border-blue-500"
                          />
                        </div>

                        <div className="col-span-2 space-y-2">
                          <Label className="text-sm font-semibold text-slate-700">Texto de Ayuda</Label>
                          <Input
                            value={campo.ayuda || ''}
                            onChange={(e) => {
                              const nuevos = [...camposEstadisticos];
                              nuevos[index].ayuda = e.target.value;
                              setCamposEstadisticos(nuevos);
                            }}
                            placeholder="Texto opcional de ayuda"
                            className="border-2 border-slate-300 focus:border-blue-500"
                          />
                        </div>

                        <div className="col-span-2 flex items-center gap-4">
                          <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                            <input
                              type="checkbox"
                              checked={campo.requerido}
                              onChange={(e) => {
                                const nuevos = [...camposEstadisticos];
                                nuevos[index].requerido = e.target.checked;
                                setCamposEstadisticos(nuevos);
                              }}
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-slate-700">Requerido</span>
                          </label>

                          <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                            <input
                              type="checkbox"
                              checked={campo.activo}
                              onChange={(e) => {
                                const nuevos = [...camposEstadisticos];
                                nuevos[index].activo = e.target.checked;
                                setCamposEstadisticos(nuevos);
                              }}
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-slate-700">Activo</span>
                          </label>

                          <div className="ml-auto flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => guardarCampoEstadistico(campo)}
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            {campo.id && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => eliminarCampo(campo.id!)}
                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: REPORTES */}
          <TabsContent value="reportes">
            <Card className="border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                  Configuración de Reportes
                </CardTitle>
                <CardDescription>
                  Configura las opciones de generación y entrega de reportes
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Política de Entrega por Defecto</Label>
                  <select
                    value={configuraciones.politica_entrega_default || 'SOLO_ADMIN'}
                    onChange={(e) => setConfiguraciones({
                      ...configuraciones,
                      politica_entrega_default: e.target.value
                    })}
                    className="w-full h-11 rounded-lg border-2 border-slate-300 bg-white px-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="SOLO_ADMIN">Solo disponible para admin</option>
                    <option value="AUTOMATICO_EVALUADO">Envío automático al evaluado</option>
                    <option value="TERCERO">Envío a tercero</option>
                  </select>
                  <p className="text-sm text-slate-500">
                    Política por defecto para nuevas invitaciones
                  </p>
                </div>

                <Button
                  onClick={() => guardarConfiguracion(
                    'politica_entrega_default',
                    configuraciones.politica_entrega_default,
                    'reportes'
                  )}
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: NOTIFICACIONES */}
          <TabsContent value="notificaciones">
            <Card className="border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Bell className="h-5 w-5 text-yellow-600" />
                  Configuración de Notificaciones
                </CardTitle>
                <CardDescription>
                  Configura las notificaciones por correo electrónico
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    Correo de Notificaciones
                  </Label>
                  <Input
                    type="email"
                    value={configuraciones.email_admin || ''}
                    onChange={(e) => setConfiguraciones({
                      ...configuraciones,
                      email_admin: e.target.value
                    })}
                    placeholder="admin@ejemplo.com"
                    className="h-11 border-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Notificar cuando:</h3>
                  
                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-slate-700">Un evaluado completa una prueba</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-slate-700">Se genera un nuevo reporte</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-slate-700">Una invitación está por expirar</span>
                  </label>
                </div>

                <Button 
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}