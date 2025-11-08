-- Agregar columna adminId a Cuestionario
ALTER TABLE "Cuestionario" ADD COLUMN "adminId" UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Agregar columna adminId a Invitacion
ALTER TABLE "Invitacion" ADD COLUMN "adminId" UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Agregar columna adminId a Evaluado
ALTER TABLE "Evaluado" ADD COLUMN "adminId" UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Agregar columna adminId a Resultado
ALTER TABLE "Resultado" ADD COLUMN "adminId" UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Crear índices para mejor rendimiento
CREATE INDEX idx_cuestionario_adminId ON "Cuestionario"("adminId");
CREATE INDEX idx_invitacion_adminId ON "Invitacion"("adminId");
CREATE INDEX idx_evaluado_adminId ON "Evaluado"("adminId");
CREATE INDEX idx_resultado_adminId ON "Resultado"("adminId");