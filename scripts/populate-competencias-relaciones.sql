-- ============================================
-- SCRIPT: RELACIONES COMPETENCIA-ESCALA
-- Sistema de Evaluación Psicofinanciera
-- ============================================
-- Este script debe ejecutarse DESPUÉS de populate-competencias.sql

-- Función temporal para insertar relaciones
DO $$
DECLARE
    v_comp_id UUID;
    v_esc_id UUID;
BEGIN
    -- VISION_ESTRATEGICA
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'VISION_ESTRATEGICA';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'ALINEAMIENTO_ACCIONES';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'CLARIDAD_ESTRATEGIA';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'VISION_CLARA';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- AUTODOMINIO
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'AUTODOMINIO';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'CONTROL_PERCIBIDO';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'AUTOCONTROL';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'ANTEPOSICION_INTERESES';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- COMPETENCIA_FINANCIERA
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'COMPETENCIA_FINANCIERA';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'CONTROL_PERCIBIDO';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'HABILIDAD_ADMINISTRATIVA';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'TOLERANCIA_CONFLICTO';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- SITUACION_FINANCIERA
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'SITUACION_FINANCIERA';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'HABILIDAD_ADMINISTRATIVA';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'SALUD_FINANCIERA';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- MERECIMIENTO_AUTOCONFIANZA
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'MERECIMIENTO_AUTOCONFIANZA';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'MERECIMIENTO';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'AUTOCONFIANZA';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- PROYECTAR_FUTURO
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'PROYECTAR_FUTURO';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'VISION_CLARA';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'CLARIDAD_ESTRATEGIA';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- CONTROL_FINANZAS
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'CONTROL_FINANZAS';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'CONTROL_PERCIBIDO';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'HABILIDAD_ADMINISTRATIVA';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- ADMINISTRACION_CONGRUENTE
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'ADMINISTRACION_CONGRUENTE';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'ALINEAMIENTO_ACCIONES';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'AUTOSUPERVISION';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- TOLERANCIA_TENSION
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'TOLERANCIA_TENSION';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'AUTOCONTROL';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'TOLERANCIA_CONFLICTO';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- CONFIABILIDAD_RECTITUD
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'CONFIABILIDAD_RECTITUD';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'CONFIABILIDAD';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'RECTITUD';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- TENACIDAD
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'TENACIDAD';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'TENACIDAD';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- APROVECHAMIENTO_TALENTOS
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'APROVECHAMIENTO_TALENTOS';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'APROVECHAMIENTO_TALENTOS';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- EMPRENDIMIENTO_EVOLUTIVO
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'EMPRENDIMIENTO_EVOLUTIVO';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'EMPRENDIMIENTO';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'APROVECHAMIENTO_TALENTOS';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- FOCO_PERSISTENTE
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'FOCO_PERSISTENTE';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'CLARIDAD_ESTRATEGIA';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'TENACIDAD';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- INFLUENCIA_PROACTIVA
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'INFLUENCIA_PROACTIVA';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'INFLUENCIA';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'APERTURA_OPORTUNIDADES';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- RESULTADO_DINAMICO
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'RESULTADO_DINAMICO';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'ANTICIPACION';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'CAPACIDAD_REACCION';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- DECISION_CONGRUENTE
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'DECISION_CONGRUENTE';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'ANTEPOSICION_INTERESES';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'TEMPLE';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- GESTION_REFLEXIVA
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'GESTION_REFLEXIVA';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'AUTOSUPERVISION';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'TOLERANCIA_CONFLICTO';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- DISCIPLINA_FINANCIERA
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'DISCIPLINA_FINANCIERA';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'PERSEVERANCIA';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'RECTITUD';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- ELECCION_AUTONOMA
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'ELECCION_AUTONOMA';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'AUTOCONOCIMIENTO';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'AUTONOMIA';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- SUPERACION_PROGRESIVA
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'SUPERACION_PROGRESIVA';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'TENACIDAD';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'SUPERACION';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- AUTOCONTROL_CONSISTENTE
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'AUTOCONTROL_CONSISTENTE';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'AUTOCONTROL';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'PERSEVERANCIA';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- ADMINISTRACION_INFORMADA
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'ADMINISTRACION_INFORMADA';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'HABILIDAD_ADMINISTRATIVA';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'CONSCIENCIA_ENTORNO';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- ESFUERZO_CONSTANTE
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'ESFUERZO_CONSTANTE';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'ESFUERZO';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'SUPERACION';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- HABITOS_SALUDABLES
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'HABITOS_SALUDABLES';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'RECTITUD';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'HABILIDAD_ADMINISTRATIVA';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- AUTONOMIA_RESOLUTIVA
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'AUTONOMIA_RESOLUTIVA';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'AUTONOMIA';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'TOLERANCIA_CONFLICTO';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- RESPUESTA_AGIL
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'RESPUESTA_AGIL';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'CAPACIDAD_REACCION';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'ENFOQUE';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- RESILIENCIA_ECONOMICA
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'RESILIENCIA_ECONOMICA';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'RECUPERACION';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'TENACIDAD';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- MENTALIDAD_ABIERTA_INVERSIONES
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'MENTALIDAD_ABIERTA_INVERSIONES';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'APERTURA_OPORTUNIDADES';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'AUTOSUPERVISION';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- RESPUESTA_OPORTUNA
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'RESPUESTA_OPORTUNA';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'RESOLUCION';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'AUTOSUPERVISION';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- ANTICIPACION_OPORTUNIDADES
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'ANTICIPACION_OPORTUNIDADES';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'APERTURA_OPORTUNIDADES';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'ANTICIPACION';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

    -- ESTRATEGIA_PROPOSITIVA
    SELECT id INTO v_comp_id FROM "Competencia" WHERE codigo = 'ESTRATEGIA_PROPOSITIVA';
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'CLARIDAD_ESTRATEGIA';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;
    SELECT id INTO v_esc_id FROM "Escala" WHERE codigo = 'SENTIDO_CONTRIBUCION';
    INSERT INTO "CompetenciaEscala" ("competenciaId", "escalaId", "peso") VALUES (v_comp_id, v_esc_id, 1.0) ON CONFLICT DO NOTHING;

END $$;

-- Verificación
SELECT 'Relaciones creadas:' as descripcion, COUNT(*) as total FROM "CompetenciaEscala";
