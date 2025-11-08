"use client";
import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Home, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Mapeo de rutas a títulos
  const routeMap: Record<string, string> = {
    "/admin/cuestionarios": "Cuestionarios",
    "/admin/cuestionarios/nuevo": "Nuevo Cuestionario",
    "/admin/evaluados": "Evaluados",
    "/admin/invitaciones": "Invitaciones",
    "/admin/generar-invitacion": "Generar Invitación",
    "/admin/reportes": "Reportes",
    "/admin/normas": "Normas",
    "/admin/configuracion": "Configuración",
  };

  // Obtener breadcrumbs
  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = [];
    
    let currentPath = '';
    for (const path of paths) {
      currentPath += `/${path}`;
      const title = routeMap[currentPath] || path;
      breadcrumbs.push({ path: currentPath, title });
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 transition-all shadow-sm">
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4 flex-1">
          <SidebarTrigger className="-ml-1 hover:bg-slate-100 rounded-lg transition-all duration-200 p-2" />
          <Separator
            orientation="vertical"
            className="h-6 bg-slate-200"
          />
          
          {/* Breadcrumbs mejorados */}
          <nav className="flex items-center gap-2 text-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/cuestionarios')}
              className="h-8 px-2.5 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all duration-200"
            >
              <Home className="h-4 w-4" />
            </Button>
            
            {breadcrumbs.slice(1).map((crumb, index) => (
              <div key={crumb.path} className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-slate-400" />
                <button
                  onClick={() => router.push(crumb.path)}
                  className={`font-semibold transition-all duration-200 hover:text-blue-600 px-2 py-1 rounded-md hover:bg-blue-50 ${
                    index === breadcrumbs.length - 2
                      ? 'text-slate-900'
                      : 'text-slate-500'
                  }`}
                >
                  {crumb.title}
                </button>
              </div>
            ))}
          </nav>
        </div>

        {/* Sección derecha con fecha/hora y botón volver */}
        <div className="flex items-center gap-3">
          {/* Fecha y hora - solo renderizar después del montaje */}
          {mounted && currentTime && (
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-900 tabular-nums">
                    {formatTime(currentTime)}
                  </span>
                  <span className="text-[10px] text-slate-500 capitalize">
                    {formatDate(currentTime).split(',')[0]}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Botón de volver */}
          {breadcrumbs.length > 2 && (
            <>
              <Separator
                orientation="vertical"
                className="h-6 bg-slate-200 hidden sm:block"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 h-9 px-3"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline font-semibold">Volver</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}