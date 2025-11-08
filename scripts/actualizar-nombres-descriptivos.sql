-- ACTUALIZAR NOMBRES DESCRIPTIVOS EN LA BD
-- Este script actualiza los nombres de escalas y competencias
-- para que sean descriptivos en lugar de códigos

-- ACTUALIZAR TABLA ESCALA
UPDATE "Escala" SET nombre = 'Esfuerzo' WHERE codigo = 'E1';
UPDATE "Escala" SET nombre = 'Apertura a oportunidades' WHERE codigo = 'E2';
UPDATE "Escala" SET nombre = 'Autorefuerzo' WHERE codigo = 'E3';
UPDATE "Escala" SET nombre = 'Confiabilidad' WHERE codigo = 'E4';
UPDATE "Escala" SET nombre = 'Optimismo' WHERE codigo = 'E5';
UPDATE "Escala" SET nombre = 'Aprovechamiento de talentos' WHERE codigo = 'E6';
UPDATE "Escala" SET nombre = 'Percepción Interpersonal' WHERE codigo = 'E7';
UPDATE "Escala" SET nombre = 'Merecimiento' WHERE codigo = 'E8';
UPDATE "Escala" SET nombre = 'Visión Sistémica' WHERE codigo = 'E9';
UPDATE "Escala" SET nombre = 'Emprendimiento' WHERE codigo = 'E10';
UPDATE "Escala" SET nombre = 'Habilidad administrativa' WHERE codigo = 'E11';
UPDATE "Escala" SET nombre = 'Autoconfianza' WHERE codigo = 'E12';
UPDATE "Escala" SET nombre = 'Capacidad de reacción' WHERE codigo = 'E13';
UPDATE "Escala" SET nombre = 'Expectativas' WHERE codigo = 'E14';
UPDATE "Escala" SET nombre = 'Tenacidad' WHERE codigo = 'E15';
UPDATE "Escala" SET nombre = 'Alineamiento de Acciones' WHERE codigo = 'E16';
UPDATE "Escala" SET nombre = 'Autocontrol' WHERE codigo = 'E17';
UPDATE "Escala" SET nombre = 'Recuperación' WHERE codigo = 'E18';
UPDATE "Escala" SET nombre = 'Pensamiento Lógico' WHERE codigo = 'E19';
UPDATE "Escala" SET nombre = 'Sociabilidad' WHERE codigo = 'E20';
UPDATE "Escala" SET nombre = 'Resolución' WHERE codigo = 'E21';
UPDATE "Escala" SET nombre = 'Tolerancia al Conflicto' WHERE codigo = 'E22';
UPDATE "Escala" SET nombre = 'Enfoque' WHERE codigo = 'E23';
UPDATE "Escala" SET nombre = 'Sentido de contribución' WHERE codigo = 'E24';
UPDATE "Escala" SET nombre = 'Influencia' WHERE codigo = 'E25';
UPDATE "Escala" SET nombre = 'Claridad de estrategia' WHERE codigo = 'E26';
UPDATE "Escala" SET nombre = 'Rectitud' WHERE codigo = 'E27';
UPDATE "Escala" SET nombre = 'Energía' WHERE codigo = 'E28';
UPDATE "Escala" SET nombre = 'Temple' WHERE codigo = 'E29';
UPDATE "Escala" SET nombre = 'Consciencia del entorno' WHERE codigo = 'E30';
UPDATE "Escala" SET nombre = 'Superación' WHERE codigo = 'E31';
UPDATE "Escala" SET nombre = 'Adaptación' WHERE codigo = 'E32';
UPDATE "Escala" SET nombre = 'Pensamiento divergente' WHERE codigo = 'E33';
UPDATE "Escala" SET nombre = 'Perseverancia' WHERE codigo = 'E34';
UPDATE "Escala" SET nombre = 'Satisfacción' WHERE codigo = 'E35';
UPDATE "Escala" SET nombre = 'Compromiso' WHERE codigo = 'E36';
UPDATE "Escala" SET nombre = 'Anticipación' WHERE codigo = 'E37';
UPDATE "Escala" SET nombre = 'Automejoramiento' WHERE codigo = 'E38';
UPDATE "Escala" SET nombre = 'Mente Abierta' WHERE codigo = 'E39';
UPDATE "Escala" SET nombre = 'Participación' WHERE codigo = 'E40';
UPDATE "Escala" SET nombre = 'Control Percibido' WHERE codigo = 'E41';
UPDATE "Escala" SET nombre = 'Autosupervisión' WHERE codigo = 'E42';
UPDATE "Escala" SET nombre = 'Salud Financiera' WHERE codigo = 'E43';
UPDATE "Escala" SET nombre = 'Visión Clara' WHERE codigo = 'E44';
UPDATE "Escala" SET nombre = 'Expectativa Profesional' WHERE codigo = 'E45';
UPDATE "Escala" SET nombre = 'Autoconocimiento' WHERE codigo = 'E46';
UPDATE "Escala" SET nombre = 'Anteposición de intereses' WHERE codigo = 'E47';
UPDATE "Escala" SET nombre = 'Autonomía' WHERE codigo = 'E48';

-- Habilidades Financieras
UPDATE "Escala" SET nombre = 'Habilidad generación de ahorro' WHERE codigo = 'HF1';
UPDATE "Escala" SET nombre = 'Habilidad control de gasto' WHERE codigo = 'HF2';
UPDATE "Escala" SET nombre = 'Habilidad generación de ingresos' WHERE codigo = 'HF3';
UPDATE "Escala" SET nombre = 'Habilidad gestión de inversión' WHERE codigo = 'HF4';
UPDATE "Escala" SET nombre = 'Habilidad control de la deuda' WHERE codigo = 'HF5';

-- ACTUALIZAR TABLA COMPETENCIA
-- 3 Capacidades clave de éxito financiero
UPDATE "Competencia" SET nombre = 'Visión estratégica' WHERE codigo = 'VISION_ESTRATEGICA';
UPDATE "Competencia" SET nombre = 'Autodominio' WHERE codigo = 'AUTODOMINIO';
UPDATE "Competencia" SET nombre = 'Competencia financiera' WHERE codigo = 'COMPETENCIA_FINANCIERA';

-- Cuadrantes de Realización
UPDATE "Competencia" SET nombre = 'Situación financiera' WHERE codigo = 'SITUACION_FINANCIERA';

-- 8 Factores de disposición psicoemocional a la abundancia
UPDATE "Competencia" SET nombre = 'Merecimiento y Autoconfianza' WHERE codigo = 'MERECIMIENTO_AUTOCONFIANZA';
UPDATE "Competencia" SET nombre = 'Proyectar el futuro' WHERE codigo = 'PROYECTAR_FUTURO';
UPDATE "Competencia" SET nombre = 'Control de las finanzas' WHERE codigo = 'CONTROL_FINANZAS';
UPDATE "Competencia" SET nombre = 'Administración congruente' WHERE codigo = 'ADMINISTRACION_CONGRUENTE';
UPDATE "Competencia" SET nombre = 'Tolerancia a la tensión' WHERE codigo = 'TOLERANCIA_TENSION';
UPDATE "Competencia" SET nombre = 'Confiabilidad y Rectitud' WHERE codigo = 'CONFIABILIDAD_RECTITUD';
UPDATE "Competencia" SET nombre = 'Tenacidad' WHERE codigo = 'TENACIDAD';
UPDATE "Competencia" SET nombre = 'Aprovechamiento de talentos' WHERE codigo = 'APROVECHAMIENTO_TALENTOS';

-- Precursores en la Generación de Ingresos
UPDATE "Competencia" SET nombre = 'Emprendimiento evolutivo' WHERE codigo = 'EMPRENDIMIENTO_EVOLUTIVO';
UPDATE "Competencia" SET nombre = 'Foco persistente' WHERE codigo = 'FOCO_PERSISTENTE';
UPDATE "Competencia" SET nombre = 'Influencia proactiva' WHERE codigo = 'INFLUENCIA_PROACTIVA';
UPDATE "Competencia" SET nombre = 'Resultado dinámico' WHERE codigo = 'RESULTADO_DINAMICO';

-- Precursores del Control Efectivo del Gasto
UPDATE "Competencia" SET nombre = 'Decisión congruente' WHERE codigo = 'DECISION_CONGRUENTE';
UPDATE "Competencia" SET nombre = 'Gestión reflexiva' WHERE codigo = 'GESTION_REFLEXIVA';
UPDATE "Competencia" SET nombre = 'Disciplina financiera' WHERE codigo = 'DISCIPLINA_FINANCIERA';
UPDATE "Competencia" SET nombre = 'Elección autónoma' WHERE codigo = 'ELECCION_AUTONOMA';

-- Precursores de la Generación de Ahorros
UPDATE "Competencia" SET nombre = 'Superación progresiva' WHERE codigo = 'SUPERACION_PROGRESIVA';
UPDATE "Competencia" SET nombre = 'Autocontrol consistente' WHERE codigo = 'AUTOCONTROL_CONSISTENTE';
UPDATE "Competencia" SET nombre = 'Administración informada' WHERE codigo = 'ADMINISTRACION_INFORMADA';
UPDATE "Competencia" SET nombre = 'Esfuerzo constante' WHERE codigo = 'ESFUERZO_CONSTANTE';

-- Precursores de la Gestión Efectiva de la Deuda
UPDATE "Competencia" SET nombre = 'Hábitos saludables' WHERE codigo = 'HABITOS_SALUDABLES';
UPDATE "Competencia" SET nombre = 'Autonomía resolutiva' WHERE codigo = 'AUTONOMIA_RESOLUTIVA';
UPDATE "Competencia" SET nombre = 'Respuesta ágil' WHERE codigo = 'RESPUESTA_AGIL';
UPDATE "Competencia" SET nombre = 'Resiliencia económica' WHERE codigo = 'RESILIENCIA_ECONOMICA';

-- Precursores de Gestión de Inversiones Financieras
UPDATE "Competencia" SET nombre = 'Mentalidad abierta a las inversiones' WHERE codigo = 'MENTALIDAD_ABIERTA_INVERSIONES';
UPDATE "Competencia" SET nombre = 'Respuesta oportuna' WHERE codigo = 'RESPUESTA_OPORTUNA';
UPDATE "Competencia" SET nombre = 'Anticipación a oportunidades' WHERE codigo = 'ANTICIPACION_OPORTUNIDADES';
UPDATE "Competencia" SET nombre = 'Estrategia propositiva' WHERE codigo = 'ESTRATEGIA_PROPOSITIVA';

-- Competencias B (Potenciales)
UPDATE "Competencia" SET nombre = 'Potencial generación de ingresos' WHERE codigo = 'POTENCIAL_GENERACION_INGRESOS';
UPDATE "Competencia" SET nombre = 'Potencial gestión de gastos' WHERE codigo = 'POTENCIAL_GESTION_GASTOS';
UPDATE "Competencia" SET nombre = 'Potencial generación de ahorro' WHERE codigo = 'POTENCIAL_GENERACION_AHORRO';
UPDATE "Competencia" SET nombre = 'Potencial control de la deuda' WHERE codigo = 'POTENCIAL_CONTROL_DEUDA';
UPDATE "Competencia" SET nombre = 'Potencial gestión de inversión' WHERE codigo = 'POTENCIAL_GESTION_INVERSION';

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Mostrar escalas actualizadas
SELECT 'ESCALAS ACTUALIZADAS' as tipo, COUNT(*) as total FROM "Escala" WHERE nombre NOT LIKE 'E%' AND nombre NOT LIKE 'HF%';

-- Mostrar competencias actualizadas
SELECT 'COMPETENCIAS ACTUALIZADAS' as tipo, COUNT(*) as total FROM "Competencia" WHERE nombre NOT LIKE '%_%';

-- Mostrar primeras 10 escalas
SELECT codigo, nombre FROM "Escala" ORDER BY codigo LIMIT 10;

-- Mostrar primeras 10 competencias
SELECT codigo, nombre FROM "Competencia" ORDER BY codigo LIMIT 10;