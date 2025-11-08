"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Palette, MessageSquare, Settings, Clock, Eye, ArrowLeftRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function NuevoCuestionarioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    colorPrimario: "#3b82f6",
    colorSecundario: "#1e40af",
    textoInicio: "Bienvenido a esta evaluación. Por favor responde todas las preguntas con honestidad.",
    textoFinal: "¡Gracias por completar el cuestionario! Tus respuestas han sido guardadas.",
    mostrarProgreso: true,
    permitirRetroceso: false,
    tiempoLimite: null as number | null
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/cuestionarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const cuestionario = await res.json();
        router.push(`/admin/cuestionarios/${cuestionario.id}/editar`);
      } else {
        alert("Error al crear cuestionario");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear cuestionario");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container max-w-5xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/cuestionarios">
            <Button variant="ghost" size="sm" className="mb-4 hover:bg-white/60">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Cuestionarios
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Nuevo Cuestionario</h1>
              <p className="text-slate-600 mt-1">Crea un cuestionario personalizado y comienza a agregar preguntas</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-xl">Información Básica</CardTitle>
              </div>
              <CardDescription>
                Define el título y descripción del cuestionario
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="titulo" className="text-sm font-semibold text-slate-700">
                  Título del Cuestionario <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  placeholder="Ej: Evaluación de Competencias 2024"
                  required
                  className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion" className="text-sm font-semibold text-slate-700">
                  Descripción
                </Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Describe el propósito y alcance de este cuestionario..."
                  className="min-h-[100px] border-slate-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Personalización visual */}
          <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-xl">Personalización Visual</CardTitle>
              </div>
              <CardDescription>
                Personaliza los colores del cuestionario
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="colorPrimario" className="text-sm font-semibold text-slate-700">
                    Color Primario
                  </Label>
                  <div className="flex gap-3">
                    <div className="relative">
                      <Input
                        id="colorPrimario"
                        name="colorPrimario"
                        type="color"
                        value={formData.colorPrimario}
                        onChange={handleChange}
                        className="w-16 h-11 cursor-pointer border-2 border-slate-300"
                      />
                    </div>
                    <Input
                      value={formData.colorPrimario}
                      onChange={(e) => setFormData(prev => ({ ...prev, colorPrimario: e.target.value }))}
                      placeholder="#3b82f6"
                      className="flex-1 h-11 font-mono border-slate-300"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Color principal de la interfaz</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="colorSecundario" className="text-sm font-semibold text-slate-700">
                    Color Secundario
                  </Label>
                  <div className="flex gap-3">
                    <div className="relative">
                      <Input
                        id="colorSecundario"
                        name="colorSecundario"
                        type="color"
                        value={formData.colorSecundario}
                        onChange={handleChange}
                        className="w-16 h-11 cursor-pointer border-2 border-slate-300"
                      />
                    </div>
                    <Input
                      value={formData.colorSecundario}
                      onChange={(e) => setFormData(prev => ({ ...prev, colorSecundario: e.target.value }))}
                      placeholder="#1e40af"
                      className="flex-1 h-11 font-mono border-slate-300"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Color para acentos y detalles</p>
                </div>
              </div>

              {/* Vista previa de colores */}
              <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm font-semibold text-slate-700 mb-3">Vista Previa</p>
                <div className="flex gap-3">
                  <div 
                    className="flex-1 h-20 rounded-lg shadow-sm flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: formData.colorPrimario }}
                  >
                    Primario
                  </div>
                  <div 
                    className="flex-1 h-20 rounded-lg shadow-sm flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: formData.colorSecundario }}
                  >
                    Secundario
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Textos personalizables */}
          <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <CardTitle className="text-xl">Mensajes Personalizados</CardTitle>
              </div>
              <CardDescription>
                Configura los mensajes de inicio y finalización
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="textoInicio" className="text-sm font-semibold text-slate-700">
                  Mensaje de Bienvenida
                </Label>
                <Textarea
                  id="textoInicio"
                  name="textoInicio"
                  value={formData.textoInicio}
                  onChange={handleChange}
                  placeholder="Mensaje que verá el usuario al iniciar el cuestionario..."
                  className="min-h-[90px] border-slate-300 focus:border-green-500 focus:ring-green-500 resize-none"
                />
                <p className="text-xs text-slate-500">Este mensaje se mostrará antes de comenzar</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="textoFinal" className="text-sm font-semibold text-slate-700">
                  Mensaje de Agradecimiento
                </Label>
                <Textarea
                  id="textoFinal"
                  name="textoFinal"
                  value={formData.textoFinal}
                  onChange={handleChange}
                  placeholder="Mensaje que verá el usuario al finalizar el cuestionario..."
                  className="min-h-[90px] border-slate-300 focus:border-green-500 focus:ring-green-500 resize-none"
                />
                <p className="text-xs text-slate-500">Este mensaje se mostrará al completar el cuestionario</p>
              </div>
            </CardContent>
          </Card>

          {/* Configuración */}
          <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-xl">Configuración Avanzada</CardTitle>
              </div>
              <CardDescription>
                Opciones adicionales para el comportamiento del cuestionario
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    id="mostrarProgreso"
                    name="mostrarProgreso"
                    checked={formData.mostrarProgreso}
                    onChange={handleChange}
                    className="h-5 w-5 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <Label htmlFor="mostrarProgreso" className="cursor-pointer font-semibold text-slate-700 flex items-center gap-2">
                      <Eye className="h-4 w-4 text-blue-600" />
                      Mostrar barra de progreso
                    </Label>
                    <p className="text-xs text-slate-500 mt-1">Los usuarios verán su avance durante el cuestionario</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    id="permitirRetroceso"
                    name="permitirRetroceso"
                    checked={formData.permitirRetroceso}
                    onChange={handleChange}
                    className="h-5 w-5 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <Label htmlFor="permitirRetroceso" className="cursor-pointer font-semibold text-slate-700 flex items-center gap-2">
                      <ArrowLeftRight className="h-4 w-4 text-blue-600" />
                      Permitir navegación hacia atrás
                    </Label>
                    <p className="text-xs text-slate-500 mt-1">Los usuarios podrán volver a preguntas anteriores</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiempoLimite" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  Tiempo Límite (minutos)
                </Label>
                <Input
                  id="tiempoLimite"
                  name="tiempoLimite"
                  type="number"
                  value={formData.tiempoLimite || ""}
                  onChange={handleChange}
                  placeholder="Sin límite de tiempo"
                  min="1"
                  className="h-11 border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                />
                <p className="text-xs text-slate-500">Dejar vacío para permitir tiempo ilimitado</p>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Creando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Crear Cuestionario
                </>
              )}
            </Button>
            <Link href="/admin/cuestionarios" className="flex-1 sm:flex-initial">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-12 px-8 border-2 border-slate-300 hover:bg-slate-100 font-semibold"
              >
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}