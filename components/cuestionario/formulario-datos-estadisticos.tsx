"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Mail, Phone, Calendar, Briefcase, GraduationCap, MapPin, Users, ChevronRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { CAMPOS_ESTADISTICOS, type CampoEstadisticoConfig } from "@/lib/campos-estadisticos-config";

interface Props {
  evaluadoId: string;
  onComplete: () => void;
  colorPrimario?: string;
  colorSecundario?: string;
}

export default function FormularioDatosEstadisticos({ 
  evaluadoId, 
  onComplete,
  colorPrimario = "#667eea",
  colorSecundario = "#764ba2"
}: Props) {
  const [valores, setValores] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const campos = CAMPOS_ESTADISTICOS;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validar campos requeridos
    const camposRequeridos = campos.filter(c => c.requerido);
    const faltantes = camposRequeridos.filter(c => !valores[c.nombre] || valores[c.nombre].trim() === "");
    
    if (faltantes.length > 0) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/datos-estadisticos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evaluadoId,
          datos: valores
        }),
      });

      if (res.ok) {
        toast.success("Datos guardados correctamente");
        onComplete();
      } else {
        throw new Error("Error al guardar");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al guardar los datos");
    } finally {
      setSaving(false);
    }
  }

  // Función para obtener el icono según el tipo de campo
  function getIconForField(nombre: string) {
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes('nombre')) return <User className="h-5 w-5" />;
    if (nombreLower.includes('correo') || nombreLower.includes('email')) return <Mail className="h-5 w-5" />;
    if (nombreLower.includes('teléfono') || nombreLower.includes('telefono')) return <Phone className="h-5 w-5" />;
    if (nombreLower.includes('edad') || nombreLower.includes('fecha')) return <Calendar className="h-5 w-5" />;
    if (nombreLower.includes('puesto') || nombreLower.includes('cargo') || nombreLower.includes('dedicas')) return <Briefcase className="h-5 w-5" />;
    if (nombreLower.includes('educación') || nombreLower.includes('escolaridad') || nombreLower.includes('académico') || nombreLower.includes('nivel')) return <GraduationCap className="h-5 w-5" />;
    if (nombreLower.includes('ciudad') || nombreLower.includes('ubicación') || nombreLower.includes('país')) return <MapPin className="h-5 w-5" />;
    if (nombreLower.includes('género') || nombreLower.includes('genero')) return <Users className="h-5 w-5" />;
    return <Sparkles className="h-5 w-5" />;
  }

  function renderCampo(campo: CampoEstadisticoConfig, index: number) {
    const valor = valores[campo.nombre] || "";
    const icon = getIconForField(campo.nombre);

    const inputClasses = "h-12 border-2 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg";
    const labelClasses = "text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2";

    switch (campo.tipo) {
      case "TEXTO":
      case "EMAIL":
      case "TELEFONO":
        return (
          <div 
            key={campo.nombre} 
            className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Label htmlFor={campo.nombre} className={labelClasses}>
              <span 
                className="p-2 rounded-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${colorPrimario}20, ${colorSecundario}20)`,
                  color: colorPrimario
                }}
              >
                {icon}
              </span>
              {campo.nombre}
              {campo.requerido && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={campo.nombre}
              type={campo.tipo === "EMAIL" ? "email" : campo.tipo === "TELEFONO" ? "tel" : "text"}
              value={valor}
              onChange={(e) => setValores({ ...valores, [campo.nombre]: e.target.value })}
              required={campo.requerido}
              placeholder={`Ingresa tu ${campo.nombre.toLowerCase()}`}
              className={inputClasses}
              style={{
                borderColor: valor ? colorPrimario : undefined,
              }}
            />
          </div>
        );

      case "NUMERO":
        return (
          <div 
            key={campo.nombre} 
            className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Label htmlFor={campo.nombre} className={labelClasses}>
              <span 
                className="p-2 rounded-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${colorPrimario}20, ${colorSecundario}20)`,
                  color: colorPrimario
                }}
              >
                {icon}
              </span>
              {campo.nombre}
              {campo.requerido && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={campo.nombre}
              type="number"
              value={valor}
              onChange={(e) => setValores({ ...valores, [campo.nombre]: e.target.value })}
              required={campo.requerido}
              placeholder={`Ingresa tu ${campo.nombre.toLowerCase()}`}
              className={inputClasses}
              style={{
                borderColor: valor ? colorPrimario : undefined,
              }}
            />
          </div>
        );

      case "FECHA":
        return (
          <div 
            key={campo.nombre} 
            className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Label htmlFor={campo.nombre} className={labelClasses}>
              <span 
                className="p-2 rounded-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${colorPrimario}20, ${colorSecundario}20)`,
                  color: colorPrimario
                }}
              >
                {icon}
              </span>
              {campo.nombre}
              {campo.requerido && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={campo.nombre}
              type="date"
              value={valor}
              onChange={(e) => setValores({ ...valores, [campo.nombre]: e.target.value })}
              required={campo.requerido}
              className={inputClasses}
              style={{
                borderColor: valor ? colorPrimario : undefined,
              }}
            />
          </div>
        );

      case "SELECCION":
        return (
          <div 
            key={campo.nombre} 
            className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Label htmlFor={campo.nombre} className={labelClasses}>
              <span 
                className="p-2 rounded-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${colorPrimario}20, ${colorSecundario}20)`,
                  color: colorPrimario
                }}
              >
                {icon}
              </span>
              {campo.nombre}
              {campo.requerido && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <select
              id={campo.nombre}
              value={valor}
              onChange={(e) => setValores({ ...valores, [campo.nombre]: e.target.value })}
              required={campo.requerido}
              className={`w-full ${inputClasses} bg-white dark:bg-slate-950 rounded-lg px-4`}
              style={{
                borderColor: valor ? colorPrimario : undefined,
              }}
            >
              <option value="">Selecciona una opción</option>
              {campo.opciones?.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
      <Card className="max-w-3xl w-full border-0 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Header con gradiente */}
        <div 
          style={{ 
            background: `linear-gradient(135deg, ${colorPrimario} 0%, ${colorSecundario} 100%)`
          }}
          className="p-8 rounded-t-xl"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm animate-in zoom-in duration-500">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-white">
                Información Personal
              </CardTitle>
              <CardDescription className="text-white/90 text-base mt-1">
                Por favor completa tus datos antes de comenzar
              </CardDescription>
            </div>
          </div>
          
          {/* Barra de progreso decorativa */}
          <div className="mt-6 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white/40 rounded-full animate-pulse"
              style={{ width: '30%' }}
            />
          </div>
        </div>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grid de campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {campos.map((campo, index) => renderCampo(campo, index))}
            </div>

            {/* Nota informativa */}
            <div 
              className="p-4 rounded-xl border-2 animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ 
                background: `linear-gradient(to right, ${colorPrimario}10, ${colorSecundario}10)`,
                borderColor: `${colorPrimario}30`
              }}
            >
              <p className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                <Sparkles className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: colorPrimario }} />
                <span>
                  Tus datos son confidenciales y solo se utilizarán con fines estadísticos para mejorar la evaluación.
                </span>
              </p>
            </div>

            {/* Botón de envío */}
            <div className="flex justify-end pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <Button
                type="submit"
                disabled={saving}
                size="lg"
                style={{ background: `linear-gradient(to right, ${colorPrimario}, ${colorSecundario})` }}
                className="h-14 px-8 text-white text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    Continuar al Cuestionario
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>

        {/* Footer decorativo */}
        <div 
          className="h-2 rounded-b-xl"
          style={{ 
            background: `linear-gradient(to right, ${colorPrimario}, ${colorSecundario})`
          }}
        />
      </Card>
    </div>
  );
}