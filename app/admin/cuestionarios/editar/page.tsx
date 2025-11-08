"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Settings, MessageSquare, Clock, Eye, ArrowLeftRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ConfigurarCuestionarioPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    textoInicio: "",
    textoFinal: "",
    mostrarProgreso: true,
    permitirRetroceso: false,
    tiempoLimite: 30
  });

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  async function cargarConfiguracion() {
    try {
      const res = await fetch("/api/configuracion");
      if (res.ok) {
        const data = await res.json();
        setFormData(data);
      }
    } catch (error) {
      console.error("Error al cargar configuración:", error);
    }
  }

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
      const res = await fetch("/api/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success("Configuración guardada correctamente");
      } else {
        toast.error("Error al guardar configuración");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al guardar configuración");
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
              Volver
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Configuración del Cuestionario</h1>
              <p className="text-slate-600 mt-1">Personaliza los mensajes y opciones del cuestionario</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="min-h-[120px] border-slate-300 focus:border-green-500 focus:ring-green-500 resize-none"
                />
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
                  className="min-h-[120px] border-slate-300 focus:border-green-500 focus:ring-green-500 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuración */}
          <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-xl">Opciones del Cuestionario</CardTitle>
              </div>
              <CardDescription>
                Configura el comportamiento del cuestionario
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
                  Tiempo Estimado (minutos)
                </Label>
                <Input
                  id="tiempoLimite"
                  name="tiempoLimite"
                  type="number"
                  value={formData.tiempoLimite || ""}
                  onChange={handleChange}
                  placeholder="30"
                  min="1"
                  className="h-11 border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                />
                <p className="text-xs text-slate-500">Tiempo estimado para completar el cuestionario</p>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Guardar Configuración
                </>
              )}
            </Button>
            <Link href="/admin/cuestionarios">
              <Button 
                type="button" 
                variant="outline" 
                className="h-12 px-8 border-2 border-slate-300 hover:bg-slate-100 font-semibold"
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
