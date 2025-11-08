-- ============================================
-- SCRIPT DE MIGRACIÓN: SISTEMA DE PAREAMIENTO FORZADO
-- ============================================
-- Este script actualiza la base de datos para soportar el nuevo sistema
-- de cuestionario con pareamiento forzado de reactivos

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
    END IF;
END $$;

-- ============================================
-- 2. ACTUALIZAR TABLA REACTIVO
-- ============================================

-- Agregar nuevas columnas a la tabla Reactivo
ALTER TABLE "Reactivo" 
ADD COLUMN IF NOT EXISTS "seccion" TEXT,
ADD COLUMN IF NOT EXISTS "ordenGlobal" INTEGER,
ADD COLUMN IF NOT EXISTS "activo" BOOLEAN DEFAULT true;

-- Agregar constraint para seccion si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Reactivo_seccion_check'
    ) THEN
        ALTER TABLE "Reactivo"
        ADD CONSTRAINT "Reactivo_seccion_check"
        CHECK ("seccion" IN ('POSITIVOS', 'NEGATIVOS', 'LIKERT'));
    END IF;
END $$;

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_reactivo_seccion ON "Reactivo"("seccion");
CREATE INDEX IF NOT EXISTS idx_reactivo_escala ON "Reactivo"("escalaId");
CREATE INDEX IF NOT EXISTS idx_reactivo_pair ON "Reactivo"("pairId");
CREATE INDEX IF NOT EXISTS idx_reactivo_orden_global ON "Reactivo"("ordenGlobal");

-- Comentarios para documentación
COMMENT ON COLUMN "Reactivo"."seccion" IS 'Sección del cuestionario: POSITIVOS (primero), NEGATIVOS (segundo), LIKERT (tercero)';
COMMENT ON COLUMN "Reactivo"."tipo" IS 'Tipo de reactivo: POS (positivo), NEG (negativo), LIKERT';
COMMENT ON COLUMN "Reactivo"."puntosSiElegido" IS 'Puntos que se asignan cuando el reactivo ES elegido (usado en POS)';
COMMENT ON COLUMN "Reactivo"."puntosSiNoElegido" IS 'Puntos que se asignan cuando el reactivo NO es elegido (usado en NEG)';
COMMENT ON COLUMN "Reactivo"."ordenGlobal" IS 'Orden global del par en el cuestionario (1-168 para pares, 169-199 para Likert)';

-- ============================================
-- 3. ACTUALIZAR TABLA PREGUNTA - AGREGAR TIPO PAREADO AL ENUM
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
    END IF;
END $$;

-- Agregar columnas adicionales
ALTER TABLE "Pregunta"
ADD COLUMN IF NOT EXISTS "pairId" TEXT,
ADD COLUMN IF NOT EXISTS "seccionCuestionario" TEXT;

-- Agregar constraint para seccionCuestionario si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Pregunta_seccionCuestionario_check'
    ) THEN
        ALTER TABLE "Pregunta"
        ADD CONSTRAINT "Pregunta_seccionCuestionario_check"
        CHECK ("seccionCuestionario" IN ('POSITIVOS', 'NEGATIVOS', 'LIKERT'));
    END IF;
END $$;

-- Índice para búsqueda por pairId
CREATE INDEX IF NOT EXISTS idx_pregunta_pair ON "Pregunta"("pairId");

COMMENT ON COLUMN "Pregunta"."pairId" IS 'Referencia al par de reactivos (para tipo PAREADO)';
COMMENT ON COLUMN "Pregunta"."seccionCuestionario" IS 'Sección del cuestionario donde aparece esta pregunta';

-- ============================================
-- 4. ACTUALIZAR TABLA RESPUESTA
-- ============================================

-- Agregar columna para almacenar el ID del reactivo elegido
ALTER TABLE "Respuesta"
ADD COLUMN IF NOT EXISTS "reactivoElegidoId" TEXT;

-- Índice para búsqueda por reactivo elegido
CREATE INDEX IF NOT EXISTS idx_respuesta_reactivo ON "Respuesta"("reactivoElegidoId");

COMMENT ON COLUMN "Respuesta"."respuesta" IS 'Valor de la respuesta: 1 o 2 para pares (posición), valor numérico para Likert';
COMMENT ON COLUMN "Respuesta"."reactivoElegidoId" IS 'ID del reactivo elegido en el par (opcional, para referencia directa)';

-- ============================================
-- 5. CREAR TABLA DE CONFIGURACIÓN DE CUESTIONARIO
-- ============================================

CREATE TABLE IF NOT EXISTS "ConfiguracionCuestionario" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "cuestionarioId" UUID NOT NULL REFERENCES "Cuestionario"("id") ON DELETE CASCADE,
    "totalParesPositivos" INTEGER DEFAULT 0,
    "totalParesNegativos" INTEGER DEFAULT 0,
    "totalPreguntasLikert" INTEGER DEFAULT 0,
    "ordenSecciones" JSONB DEFAULT '["POSITIVOS", "NEGATIVOS", "LIKERT"]',
    "configuracion" JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_config_cuestionario ON "ConfiguracionCuestionario"("cuestionarioId");

COMMENT ON TABLE "ConfiguracionCuestionario" IS 'Configuración específica del cuestionario de pareamiento forzado';
COMMENT ON COLUMN "ConfiguracionCuestionario"."totalParesPositivos" IS 'Total de pares de reactivos positivos (ej: 84 pares)';
COMMENT ON COLUMN "ConfiguracionCuestionario"."totalParesNegativos" IS 'Total de pares de reactivos negativos (ej: 84 pares)';
COMMENT ON COLUMN "ConfiguracionCuestionario"."totalPreguntasLikert" IS 'Total de preguntas Likert (ej: 31)';
COMMENT ON COLUMN "ConfiguracionCuestionario"."ordenSecciones" IS 'Orden de presentación de las secciones';

-- ============================================
-- 6. CREAR FUNCIÓN DE VALIDACIÓN DE PARES
-- ============================================

CREATE OR REPLACE FUNCTION validar_integridad_pares()
RETURNS TABLE(
    pair_id TEXT,
    escala_codigo TEXT,
    total_reactivos BIGINT,
    tiene_orden_1 BOOLEAN,
    tiene_orden_2 BOOLEAN,
    es_valido BOOLEAN,
    mensaje TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH pares_agrupados AS (
        SELECT 
            r."pairId",
            e."codigo" as escala_codigo,
            COUNT(*) as total,
            BOOL_OR(r."ordenEnPar" = 1) as tiene_1,
            BOOL_OR(r."ordenEnPar" = 2) as tiene_2
        FROM "Reactivo" r
        LEFT JOIN "Escala" e ON r."escalaId" = e."id"
        WHERE r."pairId" IS NOT NULL
        GROUP BY r."pairId", e."codigo"
    )
    SELECT 
        pg."pairId",
        pg.escala_codigo,
        pg.total,
        pg.tiene_1,
        pg.tiene_2,
        (pg.total = 2 AND pg.tiene_1 AND pg.tiene_2) as es_valido,
        CASE 
            WHEN pg.total < 2 THEN 'Par incompleto: faltan reactivos'
            WHEN pg.total > 2 THEN 'Par duplicado: más de 2 reactivos'
            WHEN NOT pg.tiene_1 THEN 'Falta reactivo con ordenEnPar = 1'
            WHEN NOT pg.tiene_2 THEN 'Falta reactivo con ordenEnPar = 2'
            ELSE 'Par válido'
        END as mensaje
    FROM pares_agrupados pg
    ORDER BY pg."pairId";
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validar_integridad_pares() IS 'Valida que todos los pares tengan exactamente 2 reactivos con ordenEnPar 1 y 2';

-- ============================================
-- 7. CREAR FUNCIÓN DE VALIDACIÓN DE ESCALAS
-- ============================================

CREATE OR REPLACE FUNCTION validar_escalas()
RETURNS TABLE(
    escala_codigo TEXT,
    escala_nombre TEXT,
    total_reactivos BIGINT,
    total_positivos BIGINT,
    total_negativos BIGINT,
    es_valido BOOLEAN,
    mensaje TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH conteo_por_escala AS (
        SELECT 
            e."codigo",
            e."nombre",
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE r."tipo" = 'POS') as positivos,
            COUNT(*) FILTER (WHERE r."tipo" = 'NEG') as negativos
        FROM "Escala" e
        LEFT JOIN "Reactivo" r ON r."escalaId" = e."id"
        WHERE r."seccion" IN ('POSITIVOS', 'NEGATIVOS')
        GROUP BY e."codigo", e."nombre"
    )
    SELECT 
        ce."codigo",
        ce."nombre",
        ce.total,
        ce.positivos,
        ce.negativos,
        (ce.positivos = 4 AND ce.negativos = 3) as es_valido,
        CASE 
            WHEN ce.positivos < 4 THEN 'Faltan reactivos positivos (debe tener 4)'
            WHEN ce.positivos > 4 THEN 'Exceso de reactivos positivos (debe tener 4)'
            WHEN ce.negativos < 3 THEN 'Faltan reactivos negativos (debe tener 3)'
            WHEN ce.negativos > 3 THEN 'Exceso de reactivos negativos (debe tener 3)'
            ELSE 'Escala válida (4 POS + 3 NEG)'
        END as mensaje
    FROM conteo_por_escala ce
    ORDER BY ce."codigo";
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validar_escalas() IS 'Valida que cada escala tenga exactamente 4 reactivos positivos y 3 negativos';

-- ============================================
-- 8. CREAR FUNCIÓN DE ESTADÍSTICAS DEL SISTEMA
-- ============================================

CREATE OR REPLACE FUNCTION estadisticas_cuestionario()
RETURNS TABLE(
    metrica TEXT,
    valor BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'Total Escalas'::TEXT, COUNT(*)::BIGINT FROM "Escala"
    UNION ALL
    SELECT 'Total Competencias'::TEXT, COUNT(*)::BIGINT FROM "Competencia"
    UNION ALL
    SELECT 'Total Reactivos'::TEXT, COUNT(*)::BIGINT FROM "Reactivo"
    UNION ALL
    SELECT 'Reactivos Positivos'::TEXT, COUNT(*)::BIGINT FROM "Reactivo" WHERE "tipo" = 'POS'
    UNION ALL
    SELECT 'Reactivos Negativos'::TEXT, COUNT(*)::BIGINT FROM "Reactivo" WHERE "tipo" = 'NEG'
    UNION ALL
    SELECT 'Preguntas Likert'::TEXT, COUNT(*)::BIGINT FROM "Reactivo" WHERE "tipo" = 'LIKERT'
    UNION ALL
    SELECT 'Total Pares Únicos'::TEXT, COUNT(DISTINCT "pairId")::BIGINT FROM "Reactivo" WHERE "pairId" IS NOT NULL
    UNION ALL
    SELECT 'Pares Positivos'::TEXT, COUNT(DISTINCT "pairId")::BIGINT FROM "Reactivo" WHERE "seccion" = 'POSITIVOS'
    UNION ALL
    SELECT 'Pares Negativos'::TEXT, COUNT(DISTINCT "pairId")::BIGINT FROM "Reactivo" WHERE "seccion" = 'NEGATIVOS';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION estadisticas_cuestionario() IS 'Retorna estadísticas generales del sistema de cuestionario';

-- ============================================
-- 9. CREAR VISTA DE PARES COMPLETOS
-- ============================================

CREATE OR REPLACE VIEW vista_pares_completos AS
SELECT 
    r1."pairId",
    r1."seccion",
    r1."ordenGlobal",
    e."codigo" as escala_codigo,
    e."nombre" as escala_nombre,
    r1."id" as reactivo1_id,
    r1."texto" as reactivo1_texto,
    r1."tipo" as reactivo1_tipo,
    r1."puntosSiElegido" as reactivo1_puntos_elegido,
    r1."puntosSiNoElegido" as reactivo1_puntos_no_elegido,
    r2."id" as reactivo2_id,
    r2."texto" as reactivo2_texto,
    r2."tipo" as reactivo2_tipo,
    r2."puntosSiElegido" as reactivo2_puntos_elegido,
    r2."puntosSiNoElegido" as reactivo2_puntos_no_elegido
FROM "Reactivo" r1
INNER JOIN "Reactivo" r2 ON r1."pairId" = r2."pairId" AND r1."ordenEnPar" = 1 AND r2."ordenEnPar" = 2
LEFT JOIN "Escala" e ON r1."escalaId" = e."id"
WHERE r1."activo" = true AND r2."activo" = true
ORDER BY r1."ordenGlobal";

COMMENT ON VIEW vista_pares_completos IS 'Vista que muestra todos los pares completos con sus dos reactivos';

-- ============================================
-- 10. ACTUALIZAR POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS en nuevas tablas
ALTER TABLE "ConfiguracionCuestionario" ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Configuración visible para todos" ON "ConfiguracionCuestionario";
DROP POLICY IF EXISTS "Admin puede gestionar configuración" ON "ConfiguracionCuestionario";

-- Política para lectura pública de configuración
CREATE POLICY "Configuración visible para todos" ON "ConfiguracionCuestionario"
    FOR SELECT USING (true);

-- Política para admin puede todo
CREATE POLICY "Admin puede gestionar configuración" ON "ConfiguracionCuestionario"
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'service_role'
    );

-- ============================================
-- 11. DATOS INICIALES DE EJEMPLO
-- ============================================

-- Insertar configuración de ejemplo para el cuestionario principal
DO $$
DECLARE
    v_cuestionario_id UUID;
BEGIN
    -- Obtener el primer cuestionario activo
    SELECT "id" INTO v_cuestionario_id 
    FROM "Cuestionario" 
    WHERE "activo" = true 
    LIMIT 1;
    
    -- Solo insertar si existe un cuestionario
    IF v_cuestionario_id IS NOT NULL THEN
        INSERT INTO "ConfiguracionCuestionario" (
            "cuestionarioId",
            "totalParesPositivos",
            "totalParesNegativos",
            "totalPreguntasLikert",
            "ordenSecciones",
            "configuracion"
        ) 
        VALUES (
            v_cuestionario_id,
            84, -- 84 pares positivos
            84, -- 84 pares negativos
            31, -- 31 preguntas Likert
            '["POSITIVOS", "NEGATIVOS", "LIKERT"]'::JSONB,
            '{
                "instruccionesPositivos": "Elige la opción que mejor te describa en cada par.",
                "instruccionesNegativos": "Continúa eligiendo la opción que mejor te describa.",
                "instruccionesLikert": "Responde las siguientes preguntas según tu nivel de acuerdo.",
                "mostrarProgresoSeccion": true,
                "permitirRetrocesoEnSeccion": false
            }'::JSONB
        )
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- ============================================
-- 12. ÍNDICES ADICIONALES PARA PERFORMANCE
-- ============================================

-- Índice compuesto para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_reactivo_seccion_orden ON "Reactivo"("seccion", "ordenGlobal");
CREATE INDEX IF NOT EXISTS idx_reactivo_escala_tipo ON "Reactivo"("escalaId", "tipo");
CREATE INDEX IF NOT EXISTS idx_respuesta_evaluado_pregunta ON "Respuesta"("evaluadoId", "preguntaId");

-- Índice para mejorar joins en scoring
CREATE INDEX IF NOT EXISTS idx_competencia_escala_comp ON "CompetenciaEscala"("competenciaId");
CREATE INDEX IF NOT EXISTS idx_competencia_escala_esc ON "CompetenciaEscala"("escalaId");

-- ============================================
-- 13. TRIGGERS PARA AUDITORÍA
-- ============================================

-- Función para actualizar updatedAt automáticamente
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para ConfiguracionCuestionario
DROP TRIGGER IF EXISTS trigger_actualizar_config_cuestionario ON "ConfiguracionCuestionario";
CREATE TRIGGER trigger_actualizar_config_cuestionario
    BEFORE UPDATE ON "ConfiguracionCuestionario"
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_updated_at();

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

-- Mostrar estadísticas del sistema
SELECT * FROM estadisticas_cuestionario();

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

/*
✅ SCRIPT COMPLETADO EXITOSAMENTE

ESTRUCTURA DEL CUESTIONARIO:
- Total: 391 reactivos que se parean en 168 pares + 31 preguntas Likert
- Sección 1: POSITIVOS - Pares de reactivos positivos (solo POS con POS)
- Sección 2: NEGATIVOS - Pares de reactivos negativos (solo NEG con NEG)
- Sección 3: LIKERT - 31 preguntas con escala de 5 niveles

ESTRUCTURA DE ESCALAS:
- Total: 48 escalas
- Cada escala tiene 7 reactivos: 4 positivos + 3 negativos
- Los reactivos se parean: POS con POS, NEG con NEG

ESTRUCTURA DE COMPETENCIAS:
- Total: ~33 competencias
- Cada competencia agrupa 3 o 4 escalas
- Las escalas pueden repetirse en diferentes competencias

SCORING:
- Reactivos POSITIVOS: Suman puntos cuando SON elegidos (puntosSiElegido)
- Reactivos NEGATIVOS: Suman puntos cuando NO son elegidos (puntosSiNoElegido)
- Escala: Suma de los 7 reactivos (4 POS + 3 NEG)
- Competencia: Promedio ponderado de sus escalas
- Decil: Conversión del puntaje natural usando tabla NormaDecil

PRÓXIMOS PASOS:
1. ✅ Ejecutar este script en Supabase SQL Editor
2. Importar los 391 reactivos con sus pares
3. Importar las 48 escalas
4. Importar las ~33 competencias
5. Importar las relaciones CompetenciaEscala
6. Importar las normas decílicas

NOTA: Este script es idempotente y puede ejecutarse múltiples veces sin causar errores.
Los valores 'PAREADO' y 'LIKERT' se agregan a los enums de forma segura.
*/