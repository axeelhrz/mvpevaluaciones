export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      Cuestionario: {
        Row: {
          id: string
          titulo: string
          descripcion: string | null
          activo: boolean
          createdAt: string
          updatedAt: string
          colorPrimario: string
          colorSecundario: string
          logoUrl: string | null
          imagenFondoUrl: string | null
          textoInicio: string | null
          textoFinal: string | null
          mostrarProgreso: boolean
          permitirRetroceso: boolean
          tiempoLimite: number | null
          usarScoringCustom: boolean
          reglasScoring: Json | null
        }
        Insert: {
          id?: string
          titulo: string
          descripcion?: string | null
          activo?: boolean
          createdAt?: string
          updatedAt?: string
          colorPrimario?: string
          colorSecundario?: string
          logoUrl?: string | null
          imagenFondoUrl?: string | null
          textoInicio?: string | null
          textoFinal?: string | null
          mostrarProgreso?: boolean
          permitirRetroceso?: boolean
          tiempoLimite?: number | null
          usarScoringCustom?: boolean
          reglasScoring?: Json | null
        }
        Update: {
          id?: string
          titulo?: string
          descripcion?: string | null
          activo?: boolean
          createdAt?: string
          updatedAt?: string
          colorPrimario?: string
          colorSecundario?: string
          logoUrl?: string | null
          imagenFondoUrl?: string | null
          textoInicio?: string | null
          textoFinal?: string | null
          mostrarProgreso?: boolean
          permitirRetroceso?: boolean
          tiempoLimite?: number | null
          usarScoringCustom?: boolean
          reglasScoring?: Json | null
        }
      }
    }
  }
}
