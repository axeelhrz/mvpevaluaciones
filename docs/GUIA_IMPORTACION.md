# 📥 Guía de Importación de Datos

Esta guía te ayudará a importar los datos del sistema de pareamiento forzado desde un archivo Excel.

## 📋 Requisitos Previos

1. ✅ Base de datos Supabase configurada
2. ✅ Migración SQL ejecutada (`scripts/migracion-pareamiento.sql`)
3. ✅ Variables de entorno configuradas en `.env.local`
4. ✅ Archivo Excel con los datos preparado

---

## 🚀 Proceso de Importación Completo

### **Paso 1: Preparar el archivo Excel**

Tu archivo Excel debe tener **4 hojas**:

1. **Competencias** - 33 competencias
2. **Escalas** - 48 escalas (24 positivas + 24 negativas)
3. **Reactivos** - 391 reactivos (168 positivos + 168 negativos + 55 neutrales)
4. **Normas** - Percentiles y puntuaciones (opcional)

📖 **Ver formato detallado:** [FORMATO_EXCEL_IMPORTACION.md](./FORMATO_EXCEL_IMPORTACION.md)

---

### **Paso 2: Verificar variables de entorno**

Asegúrate de tener en tu archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

⚠️ **Importante:** Usa el `service_role_key`, NO el `anon_key`.

---

### **Paso 3: Importar datos desde Excel**

Ejecuta el script de importación:

```bash
npm run import:excel ruta/al/archivo.xlsx
```

**Ejemplo:**
```bash
npm run import:excel ./datos/pareamiento_2024.xlsx
```

**Salida esperada:**
```
🚀 Iniciando importación de datos desde Excel
============================================================
📖 Leyendo archivo: ./datos/pareamiento_2024.xlsx
✓ Archivo leído. Hojas disponibles: Competencias, Escalas, Reactivos, Normas

📦 Extrayendo datos del Excel...
🎯 Procesando hoja: Competencias
✓ 33 competencias extraídas
📊 Procesando hoja: Escalas
✓ 48 escalas extraídas
📋 Procesando hoja: Reactivos
✓ 391 reactivos extraídos
📈 Procesando hoja: Normas
✓ 2400 normas extraídas

📊 Resumen de datos extraídos:
  - Competencias: 33
  - Escalas: 48
  - Reactivos: 391
  - Normas: 2400

⚠️  ¿Deseas continuar con la importación? (Ctrl+C para cancelar)

💾 Importando a Supabase...
============================================================

🎯 Importando competencias...
✓ 33 competencias importadas

📊 Importando escalas...
✓ 48 escalas importadas

📋 Importando reactivos...
  ✓ Lote 1: 100 reactivos
  ✓ Lote 2: 100 reactivos
  ✓ Lote 3: 100 reactivos
  ✓ Lote 4: 91 reactivos
✓ 391 reactivos importados en total

📈 Importando normas...
✓ Versión de norma creada: Norma 2024-01-15
  ✓ Lote 1: 100 normas
  ...
✓ 2400 normas importadas en total

============================================================
✅ IMPORTACIÓN COMPLETADA EXITOSAMENTE
============================================================

📊 Resumen:
  ✓ 33 competencias
  ✓ 48 escalas
  ✓ 391 reactivos
  ✓ 2400 normas

🎉 ¡Datos importados correctamente!
```

---

### **Paso 4: Asignar pares automáticamente**

Después de importar los reactivos, debes emparejar los reactivos POSITIVOS con los NEGATIVOS:

```bash
npm run asignar:pares
```

**Salida esperada:**
```
🚀 Iniciando asignación automática de pares

============================================================
📋 Obteniendo reactivos de la base de datos...
✓ 391 reactivos obtenidos
📊 Obteniendo escalas de la base de datos...
✓ 48 escalas obtenidas

🔗 Iniciando asignación de pares...
============================================================
  ✓ E01: 7 pares creados
  ✓ E02: 7 pares creados
  ✓ E03: 7 pares creados
  ...
  ✓ E48: 7 pares creados

💾 Actualizando 336 reactivos en la base de datos...
  ✓ Lote 1: 100 reactivos actualizados
  ✓ Lote 2: 100 reactivos actualizados
  ✓ Lote 3: 100 reactivos actualizados
  ✓ Lote 4: 36 reactivos actualizados

============================================================
✅ Asignación completada:
  - Total de pares creados: 168
  - Total de reactivos actualizados: 336
  - Reactivos emparejados: 336

🔍 Verificando integridad de los pares...
============================================================

📊 Resultados de la verificación:
  ✓ Pares válidos: 168

============================================================
✅ ¡Todos los pares están correctamente asignados!

🎉 ¡Proceso completado exitosamente!
```

---

### **Paso 5 (Opcional): Importación completa en un solo comando**

Si quieres ejecutar ambos pasos de una vez:

```bash
npm run setup:pareamiento ruta/al/archivo.xlsx
```

Este comando ejecuta:
1. `import:excel` - Importa datos desde Excel
2. `asignar:pares` - Asigna pares automáticamente

---

## 🔍 Verificación Post-Importación

### **1. Verificar en Supabase**

Accede a tu proyecto en Supabase y verifica:

**Tabla Competencia:**
```sql
SELECT COUNT(*) FROM "Competencia";
-- Esperado: 33
```

**Tabla Escala:**
```sql
SELECT COUNT(*) FROM "Escala";
-- Esperado: 48

SELECT tipo, COUNT(*) FROM "Escala" GROUP BY tipo;
-- Esperado: 24 POSITIVO, 24 NEGATIVO
```

**Tabla Reactivo:**
```sql
SELECT COUNT(*) FROM "Reactivo";
-- Esperado: 391

SELECT tipo, COUNT(*) FROM "Reactivo" GROUP BY tipo;
-- Esperado: 168 POSITIVO, 168 NEGATIVO, 55 NEUTRAL
```

**Verificar pares:**
```sql
SELECT COUNT(DISTINCT "pairId") FROM "Reactivo" WHERE "pairId" IS NOT NULL;
-- Esperado: 168 pares únicos
```

**Tabla Norma:**
```sql
SELECT COUNT(*) FROM "Norma";
-- Esperado: ~2400 (50 percentiles × 48 escalas)
```

---

### **2. Verificar integridad de pares**

Ejecuta esta consulta para verificar que todos los pares estén correctos:

```sql
SELECT 
  r1."pairId",
  r1.codigo AS positivo_codigo,
  r2.codigo AS negativo_codigo,
  e.nombre AS escala
FROM "Reactivo" r1
JOIN "Reactivo" r2 ON r1."pairId" = r2."pairId" AND r1.id != r2.id
JOIN "Escala" e ON r1."escalaId" = e.id
WHERE r1.tipo = 'POSITIVO' AND r2.tipo = 'NEGATIVO'
ORDER BY r1."pairId"
LIMIT 10;
```

---

## ⚠️ Solución de Problemas

### **Error: "Archivo no encontrado"**

**Causa:** La ruta del archivo es incorrecta.

**Solución:**
```bash
# Usa ruta absoluta
npm run import:excel /Users/tu-usuario/Desktop/datos.xlsx

# O ruta relativa desde la raíz del proyecto
npm run import:excel ./datos/pareamiento.xlsx
```

---

### **Error: "Variables de entorno no configuradas"**

**Causa:** Faltan las variables de entorno.

**Solución:**
1. Crea o edita `.env.local`
2. Agrega las variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```
3. Reinicia el script

---

### **Error: "No se encontró la hoja de reactivos"**

**Causa:** El nombre de la hoja no coincide.

**Solución:**
- Renombra la hoja a: `Reactivos`, `Items` o `Preguntas`
- El script busca estos nombres (no sensible a mayúsculas)

---

### **Warning: "Competencia no encontrada para escala"**

**Causa:** El código de competencia en la hoja de Escalas no existe en la hoja de Competencias.

**Solución:**
1. Verifica que los códigos coincidan exactamente
2. Revisa mayúsculas/minúsculas
3. Elimina espacios en blanco

---

### **Warning: "Escala no encontrada para reactivo"**

**Causa:** El código de escala en la hoja de Reactivos no existe en la hoja de Escalas.

**Solución:**
1. Verifica que los códigos coincidan exactamente
2. Asegúrate de que las escalas se importaron correctamente primero

---

### **Error: "Pares inválidos encontrados"**

**Causa:** Algunos pares no tienen exactamente 1 positivo + 1 negativo.

**Solución:**
1. Ejecuta el script de verificación:
```bash
npm run asignar:pares
```
2. Revisa los warnings
3. Corrige manualmente en Supabase si es necesario

---

## 📊 Estructura de Datos Esperada

### **Resumen de cantidades:**

| Entidad | Cantidad | Descripción |
|---------|----------|-------------|
| Competencias | 33 | Competencias base del sistema |
| Escalas | 48 | 24 positivas + 24 negativas |
| Reactivos | 391 | 168 positivos + 168 negativos + 55 neutrales |
| Pares | 168 | Cada par = 1 positivo + 1 negativo |
| Normas | ~2400 | 50 percentiles × 48 escalas |

### **Distribución de reactivos:**

- **Positivos:** 168 (para pareamiento)
- **Negativos:** 168 (para pareamiento)
- **Neutrales:** 55 (para preguntas Likert)

---

## 🔄 Re-importación

Si necesitas volver a importar los datos:

### **Opción 1: Limpiar y re-importar**

```sql
-- ⚠️ CUIDADO: Esto borrará TODOS los datos
TRUNCATE TABLE "Norma" CASCADE;
TRUNCATE TABLE "Reactivo" CASCADE;
TRUNCATE TABLE "Escala" CASCADE;
TRUNCATE TABLE "Competencia" CASCADE;
TRUNCATE TABLE "VersionNorma" CASCADE;
```

Luego ejecuta:
```bash
npm run setup:pareamiento ruta/al/archivo.xlsx
```

### **Opción 2: Actualizar datos existentes**

El script usa `upsert`, por lo que si ejecutas la importación nuevamente:
- Los registros existentes se actualizarán
- Los nuevos registros se insertarán

---

## 📚 Recursos Adicionales

- [Formato de Excel](./FORMATO_EXCEL_IMPORTACION.md)
- [Sistema de Pareamiento](./SISTEMA_PARES_Y_NORMAS.md)
- [Documentación de Supabase](https://supabase.com/docs)

---

## 💡 Tips y Mejores Prácticas

1. **Backup antes de importar:**
   - Haz un backup de tu base de datos antes de importar
   - Usa Supabase Dashboard > Database > Backups

2. **Validar Excel primero:**
   - Revisa que todas las hojas existan
   - Verifica que las columnas requeridas estén presentes
   - Elimina filas vacías

3. **Importar en ambiente de prueba:**
   - Prueba primero en un proyecto de desarrollo
   - Verifica que todo funcione correctamente
   - Luego importa en producción

4. **Monitorear el proceso:**
   - No cierres la terminal durante la importación
   - Revisa los logs para detectar warnings
   - Guarda los logs para referencia futura

5. **Verificar después de importar:**
   - Ejecuta las consultas de verificación
   - Revisa que los conteos sean correctos
   - Prueba el cuestionario con datos reales

---

## 📞 Soporte

Si tienes problemas durante la importación:

1. Revisa esta guía completa
2. Verifica los logs del script
3. Consulta la documentación de formato de Excel
4. Revisa la consola de Supabase para errores de base de datos

---

¡Listo! Ahora tienes todos los datos importados y el sistema está listo para usarse. 🎉
