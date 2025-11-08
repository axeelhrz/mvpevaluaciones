"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Lock, Mail, User, Loader2, ArrowRight, UserPlus, Check, X } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Validación de fortaleza de contraseña
  const passwordStrength = {
    hasMinLength: password.length >= 6,
    hasMatch: password === confirmPassword && password.length > 0,
  };

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear la cuenta");
      }

      toast.success("Cuenta creada correctamente. Iniciando sesión...");
      
      // Auto login después del registro
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (loginRes.ok) {
        router.push('/admin/cuestionarios');
        router.refresh();
      } else {
        router.push('/login');
      }
    } catch (error: unknown) {
      console.error("Error:", error);
      const message =
        error instanceof Error ? error.message : typeof error === "string" ? error : "Error al crear la cuenta";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo con gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-950 dark:to-blue-950">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
      </div>
      
      {/* Elementos decorativos */}
      <div className="absolute top-10 right-20 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 left-20 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <Card className="w-full max-w-md relative z-10 shadow-strong animate-scale-in border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl"></div>
              <div className="relative p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-medium">
                <UserPlus className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Crear Cuenta
          </CardTitle>
          <CardDescription className="text-base">
            Completa el formulario para registrarte en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nombre Completo
              </Label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-11 input-focus"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Correo Electrónico
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 input-focus"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 input-focus"
                  disabled={loading}
                  required
                  minLength={6}
                />
              </div>
              {password && (
                <div className="flex items-center gap-2 text-xs mt-2">
                  <div className={`flex items-center gap-1 ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-400'}`}>
                    {passwordStrength.hasMinLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    <span>Mínimo 6 caracteres</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar Contraseña
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 h-11 input-focus"
                  disabled={loading}
                  required
                />
              </div>
              {confirmPassword && (
                <div className="flex items-center gap-2 text-xs mt-2">
                  <div className={`flex items-center gap-1 ${passwordStrength.hasMatch ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordStrength.hasMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    <span>{passwordStrength.hasMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}</span>
                  </div>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 transition-all shadow-md hover:shadow-lg group" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  Crear Cuenta
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-900 text-muted-foreground">
                  ¿Ya tienes una cuenta?
                </span>
              </div>
            </div>
            
            <Link 
              href="/login" 
              className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
            >
              Inicia sesión aquí
              <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}