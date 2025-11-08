-- ============================================
-- SCRIPT DE MIGRACIÓN: SISTEMA DE PAREAMIENTO FORZADO - PARTE 1
-- ============================================
-- IMPORTANTE: Ejecutar PRIMERO esta parte, luego ejecutar la parte 2
-- Esta parte agrega los nuevos valores a los enums

-- ============================================
-- 1. ACTUALIZAR ENUM TipoReactivo - AGREGAR LIKERT
-- ============================================

-- Agregar el valor 'LIKERT' al enum TipoReactivo si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'LIKERT' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'TipoReactivo')
    ) THEN
        ALTER TYPE "TipoReactivo" ADD VALUE 'LIKERT';
        RAISE NOTICE 'Valor LIKERT agregado al enum TipoReactivo';
    ELSE
        RAISE NOTICE 'Valor LIKERT ya existe en el enum TipoReactivo';
    END IF;
END $$;

-- ============================================
-- 2. ACTUALIZAR ENUM TipoPregunta - AGREGAR PAREADO
-- ============================================

-- Agregar el valor 'PAREADO' al enum TipoPregunta si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'PAREADO' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'TipoPregunta')
    ) THEN
        ALTER TYPE "TipoPregunta" ADD VALUE 'PAREADO';
        RAISE NOTICE 'Valor PAREADO agregado al enum TipoPregunta';
    ELSE
        RAISE NOTICE 'Valor PAREADO ya existe en el enum TipoPregunta';
    END IF;
END $$;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Mostrar los valores actuales de los enums
SELECT 'TipoReactivo' as enum_name, enumlabel as valor
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'TipoReactivo')
ORDER BY enumsortorder;

SELECT 'TipoPregunta' as enum_name, enumlabel as valor
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'TipoPregunta')
ORDER BY enumsortorder;

-- ============================================
-- NOTAS
-- ============================================

/*
✅ PARTE 1 COMPLETADA

Los valores 'LIKERT' y 'PAREADO' han sido agregados a los enums.

IMPORTANTE: 
- Ahora ejecuta la PARTE 2 del script (database-pareamiento-forzado-parte2.sql)
- La parte 2 creará las tablas, funciones, vistas e índices
*/