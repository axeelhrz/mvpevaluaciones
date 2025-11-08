"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Mail, User, CheckCircle2, FileText, AlertCircle, Send, ArrowLeft, Calendar, Info, ListChecks, Shield, Users } from "lucide-react";
import Link from "next/link";

type PoliticaEntrega = "SOLO_ADMIN" | "AUTOMATICO_EVALUADO" | "TERCERO";

export default function NuevaInvitacion() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [politicaEntrega, setPoliticaEntrega] = useState<PoliticaEntrega>("AUTOMATICO_EVALUADO");
  const [correoTercero, setCorreoTercero] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const validarFormulario = (): boolean => {
    if (!nombre.trim()) {
      toast.error("Por favor ingresa un nombre");
      return false;
    }
    
    if (!correo.trim()) {
      toast.error("Por favor ingresa un correo electrónico");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo.trim())) {
      toast.error("Por favor ingresa un correo electrónico válido");
      return false;
    }

    if (politicaEntrega === "TERCERO") {
      if (!correoTercero.trim()) {
        toast.error("Por favor ingresa el correo del tercero");
        return false;
      }
      if (!emailRegex.test(correoTercero.trim())) {
        toast.error("Por favor ingresa un correo válido para el tercero");
        return false;
      }
    }

    return true;
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/invitaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          nombre: nombre.trim(), 
          correo: correo.trim(),
          politicaEntrega,
          correoTercero: politicaEntrega === "TERCERO" ? correoTercero.trim() : null,
          envioAutomatico: politicaEntrega === "AUTOMATICO_EVALUADO"
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const mensajeDestino = 
          politicaEntrega === "AUTOMATICO_EVALUADO" 
            ? `Se ha enviado un correo a ${correo}`
            : politicaEntrega === "TERCERO"
            ? `Se ha enviado un correo a ${correoTercero}`
            : `Invitación creada. El enlace está disponible en el panel de administración`;

        toast.success("¡Invitación enviada exitosamente!", {
          description: mensajeDestino,
          icon: <CheckCircle2 className="h-5 w-5" />,
        });
        
        // Limpiar formulario
        setNombre("");
        setCorreo("");
        setCorreoTercero("");
        setPoliticaEntrega("AUTOMATICO_EVALUADO");
        setShowPreview(false);
      } else {
        toast.error("Error al enviar la invitación", {
          description: data.error || "Por favor intenta nuevamente",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor",
      });
    } finally {
      setLoading(false);
    }
  }

  const getPoliticaDescripcion = (politica: PoliticaEntrega): string => {
    switch (politica) {
      case "SOLO_ADMIN":
        return "Solo disponible para administrador";
      case "AUTOMATICO_EVALUADO":
        return "Se envía automáticamente al evaluado";
      case "TERCERO":
        return "Se envía a un tercero especificado";
      default:
        return "";
    }
  };

  const getPoliticaIcon = (politica: PoliticaEntrega) => {
    switch (politica) {
      case "SOLO_ADMIN":
        return <Shield className="h-4 w-4" />;
      case "AUTOMATICO_EVALUADO":
        return <Mail className="h-4 w-4" />;
      case "TERCERO":
        return <Users className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container max-w-3xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/invitaciones">
            <Button variant="ghost" size="sm" className="mb-4 hover:bg-white/60">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Invitaciones
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Send className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Enviar Invitación</h1>
              <p className="text-slate-600 mt-1">Invita a un evaluado a completar el cuestionario psicofinanciero</p>
            </div>
          </div>
        </div>

        {/* Información del Cuestionario */}
        <Card className="mb-6 border-slate-200 shadow-md bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
              <FileText className="h-5 w-5 text-blue-600" />
              Cuestionario: Evaluación Psicofinanciera
            </CardTitle>
            <CardDescription>
              Evaluación completa de competencias psicofinancieras y habilidades de gestión
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">193</div>
                <div className="text-xs text-slate-600 mt-1">Preguntas</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-emerald-200">
                <div className="text-2xl font-bold text-emerald-600">4</div>
                <div className="text-xs text-slate-600 mt-1">Secciones</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
                <div className="text-2xl font-bold text-amber-600">~30</div>
                <div className="text-xs text-slate-600 mt-1">Minutos</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">30</div>
                <div className="text-xs text-slate-600 mt-1">Días válido</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulario */}
        <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
            <CardTitle className="text-xl flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Datos del Evaluado
            </CardTitle>
            <CardDescription>
              Completa la información de la persona que realizará la evaluación
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Nombre del Evaluado */}
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Nombre completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Juan Pérez García"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 border-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500">Este nombre aparecerá en el correo de invitación</p>
              </div>

              {/* Correo Electrónico del Evaluado */}
              <div className="space-y-2">
                <Label htmlFor="correo" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-green-600" />
                  Correo electrónico del evaluado <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="correo"
                  type="email"
                  placeholder="Ej: juan.perez@ejemplo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 border-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500">Correo del evaluado que completará el cuestionario</p>
              </div>

              {/* Política de Entrega */}
              <div className="space-y-2">
                <Label htmlFor="politica" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  Política de Entrega <span className="text-red-500">*</span>
                </Label>
                <Select value={politicaEntrega} onValueChange={(value) => setPoliticaEntrega(value as PoliticaEntrega)}>
                  <SelectTrigger className="h-11 border-2 border-slate-300 focus:border-blue-500">
                    <SelectValue placeholder="Selecciona una política" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOLO_ADMIN">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Solo disponible para admin
                      </div>
                    </SelectItem>
                    <SelectItem value="AUTOMATICO_EVALUADO">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Envío automático al evaluado
                      </div>
                    </SelectItem>
                    <SelectItem value="TERCERO">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Envío a tercero
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">{getPoliticaDescripcion(politicaEntrega)}</p>
              </div>

              {/* Correo de Tercero (condicional) */}
              {politicaEntrega === "TERCERO" && (
                <div className="space-y-2 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <Label htmlFor="correoTercero" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Users className="h-4 w-4 text-amber-600" />
                    Correo del tercero <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="correoTercero"
                    type="email"
                    placeholder="Ej: tercero@ejemplo.com"
                    value={correoTercero}
                    onChange={(e) => setCorreoTercero(e.target.value)}
                    disabled={loading}
                    className="h-11 border-2 border-amber-300 focus:border-amber-500 focus:ring-amber-500"
                  />
                  <p className="text-xs text-amber-900">El enlace de invitación se enviará a este correo</p>
                </div>
              )}

              {/* Información de Validez */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Calendar className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-900">
                  El enlace de invitación será válido por <strong>30 días</strong> desde el envío
                </p>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  disabled={loading}
                  className="flex-1 h-11 border-2 border-slate-300 hover:bg-slate-50"
                >
                  {showPreview ? "Ocultar" : "Ver"} Resumen
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Enviar invitación
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Resumen de Invitación */}
        {showPreview && (
          <Card className="mt-6 border-slate-200 shadow-lg bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Resumen de la Invitación
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Evaluado</p>
                  <p className="font-semibold text-slate-900">{nombre || "No especificado"}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Correo Evaluado</p>
                  <p className="font-semibold text-slate-900 text-sm break-all">{correo || "No especificado"}</p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 mb-2">Política de Entrega</p>
                <div className="flex items-center gap-2">
                  {getPoliticaIcon(politicaEntrega)}
                  <span className="font-semibold text-slate-900">{getPoliticaDescripcion(politicaEntrega)}</span>
                </div>
              </div>

              {politicaEntrega === "TERCERO" && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs text-amber-700 mb-1">Correo del Tercero</p>
                  <p className="font-semibold text-amber-900 text-sm break-all">{correoTercero || "No especificado"}</p>
                </div>
              )}

              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-700 mb-1">Validez</p>
                <p className="font-semibold text-green-900">30 días desde el envío</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estructura del Cuestionario */}
        <Card className="mt-6 border-slate-200 shadow-md bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
              <ListChecks className="h-5 w-5 text-purple-600" />
              Estructura del Cuestionario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-1">Datos Estadísticos</h4>
                  <p className="text-sm text-slate-600">11 campos de información demográfica y profesional</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-1">Pareamiento Forzado Positivo</h4>
                  <p className="text-sm text-slate-600">96 pares de afirmaciones positivas (reactivos 1-192)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-violet-50 rounded-lg border border-violet-200">
                <div className="flex-shrink-0 w-8 h-8 bg-violet-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-1">Pareamiento Forzado Negativo</h4>
                  <p className="text-sm text-slate-600">72 pares de afirmaciones negativas (reactivos 193-336)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-1">Habilidades Financieras</h4>
                  <p className="text-sm text-slate-600">25 preguntas con escala Likert 1-5 (reactivos 337-361)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información Importante */}
        <Card className="mt-6 border-slate-200 shadow-md bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
              <Info className="h-5 w-5 text-blue-600" />
              Información importante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>El evaluado recibirá un correo con un enlace único y personalizado</span>
              </li>
              <li className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>El enlace expira automáticamente en <strong>30 días</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Cada enlace es de un solo uso y se desactiva al completar el cuestionario</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Si el evaluado ya tiene una invitación activa, será reemplazada por la nueva</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                <span>Los resultados estarán disponibles inmediatamente después de completar la evaluación</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}