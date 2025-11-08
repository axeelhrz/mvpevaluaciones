"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import CuestionarioPareamientoCompleto from "@/components/cuestionario/cuestionario-pareamiento-completo";
import { Loader2 } from "lucide-react";

interface Invitacion {
  evaluadoId: string;
  evaluado?: {
    nombre?: string;
  };
}

export default function CuestionarioPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [loading, setLoading] = useState(true);
  const [invitacion, setInvitacion] = useState<Invitacion | null>(null);

  const verificarInvitacion = useCallback(async () => {
    try {
      const res = await fetch(`/api/invitaciones/${token}`);
      
      if (!res.ok) {
        router.push(`/cuestionario/${token}/not-found`);
        return;
      }

      const data = await res.json();
      setInvitacion(data);
    } catch (error) {
      console.error('Error:', error);
      router.push(`/cuestionario/${token}/not-found`);
    } finally {
      setLoading(false);
    }
  }, [token, router]);

  useEffect(() => {
    verificarInvitacion();
  }, [verificarInvitacion]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <Loader2 className="relative h-14 w-14 animate-spin text-blue-600 mx-auto" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!invitacion) {
    return null;
  }

  return (
    <CuestionarioPareamientoCompleto 
      token={token}
      nombre={invitacion.evaluado?.nombre || ""}
      evaluadoId={invitacion.evaluadoId}
    />
  );
}