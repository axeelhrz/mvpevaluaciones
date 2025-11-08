-- ============================================
-- SCRIPT DE POBLACIÓN: ESCALAS Y COMPETENCIAS
-- Sistema de Evaluación Psicofinanciera
-- ============================================

-- ============================================
-- PASO 1: AGREGAR COLUMNA TIPO A COMPETENCIA
-- ============================================

-- Agregar columna tipo si no existe
ALTER TABLE "Competencia" 
ADD COLUMN IF NOT EXISTS "tipo" TEXT;

-- Agregar constraint para tipo
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Competencia_tipo_check'
    ) THEN
        ALTER TABLE "Competencia"
        ADD CONSTRAINT "Competencia_tipo_check"
        CHECK ("tipo" IN ('A', 'B'));
    END IF;
END $$;

-- Crear índice para tipo
CREATE INDEX IF NOT EXISTS idx_competencia_tipo ON "Competencia"("tipo");

COMMENT ON COLUMN "Competencia"."tipo" IS 'Tipo de competencia: A (calculada desde escalas) o B (calculada desde competencias A)';

-- ============================================
-- PASO 2: INSERTAR ESCALAS (32 escalas)
-- ============================================

INSERT INTO "Escala" ("codigo", "nombre") VALUES
('ALINEAMIENTO_ACCIONES', 'Alineamiento de Acciones'),
('CLARIDAD_ESTRATEGIA', 'Claridad de Estrategia'),
('VISION_CLARA', 'Visión Clara'),
('CONTROL_PERCIBIDO', 'Control Percibido'),
('AUTOCONTROL', 'Autocontrol'),
('ANTEPOSICION_INTERESES', 'Anteposición de intereses'),
('HABILIDAD_ADMINISTRATIVA', 'Habilidad Administrativa'),
('TOLERANCIA_CONFLICTO', 'Tolerancia al Conflicto'),
('SALUD_FINANCIERA', 'Salud financiera'),
('MERECIMIENTO', 'Merecimiento'),
('AUTOCONFIANZA', 'Autoconfianza'),
('AUTOSUPERVISION', 'Autosupervisión'),
('CONFIABILIDAD', 'Confiabilidad'),
('RECTITUD', 'Rectitud'),
('TENACIDAD', 'Tenacidad'),
('APROVECHAMIENTO_TALENTOS', 'Aprovechamiento de talentos'),
('EMPRENDIMIENTO', 'Emprendimiento'),
('INFLUENCIA', 'Influencia'),
('APERTURA_OPORTUNIDADES', 'Apertura a Oportunidades'),
('ANTICIPACION', 'Anticipación'),
('CAPACIDAD_REACCION', 'Capacidad de Reacción'),
('TEMPLE', 'Temple'),
('PERSEVERANCIA', 'Perseverancia'),
('AUTOCONOCIMIENTO', 'Autoconocimiento'),
('AUTONOMIA', 'Autonomía'),
('SUPERACION', 'Superación'),
('CONSCIENCIA_ENTORNO', 'Consciencia del Entorno'),
('ESFUERZO', 'Esfuerzo'),
('ENFOQUE', 'Enfoque'),
('RECUPERACION', 'Recuperación'),
('RESOLUCION', 'Resolución'),
('SENTIDO_CONTRIBUCION', 'Sentido de Contribución')
ON CONFLICT ("codigo") DO UPDATE SET "nombre" = EXCLUDED."nombre";

-- ============================================
-- PASO 3: INSERTAR COMPETENCIAS A (32 competencias)
-- ============================================

INSERT INTO "Competencia" ("codigo", "nombre", "tipo") VALUES
('VISION_ESTRATEGICA', 'Visión estratégica', 'A'),
('AUTODOMINIO', 'Autodominio', 'A'),
('COMPETENCIA_FINANCIERA', 'Competencia financiera', 'A'),
('SITUACION_FINANCIERA', 'Situación financiera', 'A'),
('MERECIMIENTO_AUTOCONFIANZA', 'Merecimiento y Autoconfianza', 'A'),
('PROYECTAR_FUTURO', 'Proyectar el futuro', 'A'),
('CONTROL_FINANZAS', 'Control de las finanzas', 'A'),
('ADMINISTRACION_CONGRUENTE', 'Administración congruente', 'A'),
('TOLERANCIA_TENSION', 'Tolerancia a la tensión', 'A'),
('CONFIABILIDAD_RECTITUD', 'Confiabilidad y Rectitud', 'A'),
('TENACIDAD', 'Tenacidad', 'A'),
('APROVECHAMIENTO_TALENTOS', 'Aprovechamiento de talentos', 'A'),
('EMPRENDIMIENTO_EVOLUTIVO', 'Emprendimiento evolutivo', 'A'),
('FOCO_PERSISTENTE', 'Foco persistente', 'A'),
('INFLUENCIA_PROACTIVA', 'Influencia proactiva', 'A'),
('RESULTADO_DINAMICO', 'Resultado dinámico', 'A'),
('DECISION_CONGRUENTE', 'Decisión congruente', 'A'),
('GESTION_REFLEXIVA', 'Gestión reflexiva', 'A'),
('DISCIPLINA_FINANCIERA', 'Disciplina financiera', 'A'),
('ELECCION_AUTONOMA', 'Elección autónoma', 'A'),
('SUPERACION_PROGRESIVA', 'Superación progresiva', 'A'),
('AUTOCONTROL_CONSISTENTE', 'Autocontrol consistente', 'A'),
('ADMINISTRACION_INFORMADA', 'Administración informada', 'A'),
('ESFUERZO_CONSTANTE', 'Esfuerzo constante', 'A'),
('HABITOS_SALUDABLES', 'Hábitos saludables', 'A'),
('AUTONOMIA_RESOLUTIVA', 'Autonomía resolutiva', 'A'),
('RESPUESTA_AGIL', 'Respuesta ágil', 'A'),
('RESILIENCIA_ECONOMICA', 'Resiliencia económica', 'A'),
('MENTALIDAD_ABIERTA_INVERSIONES', 'Mentalidad abierta a las inversiones', 'A'),
('RESPUESTA_OPORTUNA', 'Respuesta oportuna', 'A'),
('ANTICIPACION_OPORTUNIDADES', 'Anticipación a oportunidades', 'A'),
('ESTRATEGIA_PROPOSITIVA', 'Estrategia propositiva', 'A')
ON CONFLICT ("codigo") DO UPDATE SET 
    "nombre" = EXCLUDED."nombre", 
    "tipo" = EXCLUDED."tipo";

-- ============================================
-- PASO 4: INSERTAR COMPETENCIAS B (5 competencias)
-- ============================================

INSERT INTO "Competencia" ("codigo", "nombre", "tipo") VALUES
('POTENCIAL_GENERACION_INGRESOS', 'Potencial generación de ingresos', 'B'),
('POTENCIAL_GESTION_GASTOS', 'Potencial gestión de gastos', 'B'),
('POTENCIAL_GENERACION_AHORRO', 'Potencial generación de ahorro', 'B'),
('POTENCIAL_CONTROL_DEUDA', 'Potencial control de la deuda', 'B'),
('POTENCIAL_GESTION_INVERSION', 'Potencial gestión de inversión', 'B')
ON CONFLICT ("codigo") DO UPDATE SET 
    "nombre" = EXCLUDED."nombre", 
    "tipo" = EXCLUDED."tipo";

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Contar escalas
SELECT 'Total Escalas' as descripcion, COUNT(*) as total FROM "Escala";

-- Contar competencias por tipo
SELECT 'Competencias Tipo A' as descripcion, COUNT(*) as total FROM "Competencia" WHERE "tipo" = 'A';
SELECT 'Competencias Tipo B' as descripcion, COUNT(*) as total FROM "Competencia" WHERE "tipo" = 'B';

-- ============================================
-- NOTAS
-- ============================================

/*
✅ SCRIPT COMPLETADO

ESTRUCTURA CREADA:
- 32 Escalas
- 32 Competencias A (calculadas desde escalas)
- 5 Competencias B (calculadas desde competencias A)

PRÓXIMOS PASOS:
1. Ejecutar el script populate-competencias-relaciones.sql
2. Importar las normas decílicas para cada escala y competencia

NOTA: Este script es idempotente y puede ejecutarse múltiples veces.
*/