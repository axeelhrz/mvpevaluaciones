# 📊 Diagnóstico del Sistema de Scoring

## 🔍 Análisis Completo del Sistema

### Estado Actual

El sistema de scoring tiene **DOS implementaciones paralelas**:

1. **`lib/scoring.ts`** - Versión principal (26.7 KB)
   - Obtiene configuración desde la BD (tablas: Escala, Competencia, CompetenciaEscala)
   - Procesa pareamiento y Likert
   - Calcula deciles desde tabla NormaDecil
   - Valida pares completos
   - Genera warnings detallados

2. **`lib/scoring-enhanced.ts`** - Versión mejorada (15.9 KB)
   - Obtiene configuración desde tabla ScoringConfig
   - Procesa pareamiento y Likert
   - Calcula deciles desde tabla NormaDecil
   - Parsea composiciones de competencias
   - Genera nombres para PDF

### Problema Principal

**El endpoint `/api/cuestionario/submit` usa `scoreEvaluadoEnhanced`** pero debería usar la versión principal.

```typescript
// ❌ ACTUAL (submit/route.ts)
import { scoreEvaluadoEnhanced } from "@/lib/scoring-enhanced";
const scoringResult = await scoreEvaluadoEnhanced(evaluadoId);

// ✅ DEBERÍA SER
import { scoreEvaluado } from "@/lib/scoring";
const scoringResult = await scoreEvaluado(evaluadoId);
```

---

## 🔴 Problemas Identificados

### 1. **Datos NULL en Puntajes**

**Causa:** Validación insuficiente de datos antes de guardar

**Ubicación:** `lib/scoring.ts` líneas 380-410

```typescript
// ❌ PROBLEMA: No valida si puntajeNatural es null/undefined
puntajesNaturales[nombreClave] = Math.round(puntajeNatural * 100) / 100;
puntajesDeciles[nombreClave] = decil;
```

**Solución:** Validar antes de guardar

```typescript
// ✅ CORRECCIÓN
if (nombreClave && !isNaN(puntajeNatural) && !isNaN(decil)) {
  puntajesNaturales[nombreClave] = Math.round(puntajeNatural * 100) / 100;
  puntajesDeciles[nombreClave] = decil;
}
```

### 2. **Deciles Incorrectos (Siempre 1)**

**Causa:** Tabla NormaDecil vacía o mal estructurada

**Ubicación:** `lib/scoring.ts` línea 447

```typescript
async function calcularDecilDesdeDB(
  puntajeNatural: number,
  escala: string
): Promise<number> {
  // Si no hay normas, retorna 1 por defecto
  if (error || !data || data.length === 0) {
    console.warn(`⚠️  No se encontraron normas para la escala: ${escala}`);
    return 1; // ❌ SIEMPRE RETORNA 1
  }
  // ...
}
```

**Verificación necesaria:**

```sql
-- Verificar si hay normas en la BD
SELECT COUNT(*) FROM "NormaDecil";
SELECT DISTINCT escala FROM "NormaDecil" LIMIT 10;
SELECT * FROM "NormaDecil" WHERE escala = 'ESCALA_1' ORDER BY decil;
```

### 3. **Pares Incompletos No Detectados**

**Causa:** Validación débil de estructura de pares

**Ubicación:** `lib/scoring.ts` línea 200

```typescript
function validatePair(pairId: string, reactivos: Reactivo[]): ScoringWarning | null {
  if (reactivos.length !== 2) {
    return {
      type: 'error',
      pairId,
      message: `Par incompleto: "${pairId}" tiene ${reactivos.length} reactivo(s).`
    };
  }
  // ❌ Pero continúa procesando aunque haya error
}
```

### 4. **Escalas sin Reactivos**

**Causa:** No hay validación de que cada escala tenga reactivos

**Impacto:** Competencias A calculadas con escalas vacías = puntaje 0

### 5. **Respuestas Likert Mal Mapeadas**

**Causa:** El mapeo entre preguntaId y escala es frágil

**Ubicación:** `lib/scoring.ts` línea 310

```typescript
const numeroPregunta = parseInt(preguntaIdStr.replace('likert-', ''));
const preguntaConfig = PREGUNTAS_LIKERT.find(p => p.numero === numeroPregunta);

if (!preguntaConfig) {
  warnings.push({
    type: 'warning',
    message: `Pregunta Likert ${numeroPregunta} no encontrada en configuración`
  });
  continue; // ❌ Se salta la respuesta
}
```

---

## ✅ Soluciones Implementadas

### 1. Validación de Datos Antes de Guardar

```typescript
// En lib/scoring.ts línea 380
escalasResultados.forEach((escala) => {
  const nombreClave = escala.nombre || escala.codigo;
  const puntajeNatural = escala.puntajeNatural || 0;
  const decil = escala.decil || 1;
  
  // ✅ VALIDACIÓN COMPLETA
  if (nombreClave && !isNaN(puntajeNatural) && !isNaN(decil)) {
    puntajesNaturales[nombreClave] = Math.round(puntajeNatural * 100) / 100;
    puntajesDeciles[nombreClave] = decil;
  }
});
```

### 2. Verificación de Normas en BD

```typescript
// Agregar al inicio de scoreEvaluado
console.log('🔍 Verificando normas en base de datos...');
const { data: normas } = await supabase
  .from('NormaDecil')
  .select('COUNT(*)')
  .single();

if (!normas || normas.count === 0) {
  console.warn('⚠️  ADVERTENCIA: No hay normas decílicas en la base de datos');
  console.warn('   Los deciles serán 1 por defecto');
}
```

### 3. Validación Estricta de Pares

```typescript
// Mejorar validatePair
function validatePair(pairId: string, reactivos: Reactivo[]): ScoringWarning | null {
  if (reactivos.length !== 2) {
    return {
      type: 'error',
      pairId,
      message: `Par incompleto: "${pairId}" tiene ${reactivos.length} reactivo(s).`
    };
  }

  const orden1 = reactivos.find(r => r.ordenEnPar === 1);
  const orden2 = reactivos.find(r => r.ordenEnPar === 2);

  if (!orden1 || !orden2) {
    return {
      type: 'error',
      pairId,
      message: `Par mal formado: "${pairId}" no tiene ordenEnPar 1 y 2 correctos.`
    };
  }

  // ✅ Validar que ambos tengan escala
  if (!orden1.escala || !orden2.escala) {
    return {
      type: 'error',
      pairId,
      message: `Par sin escala: "${pairId}" tiene reactivos sin escala asignada.`
    };
  }

  return null;
}
```

### 4. Manejo de Pares Inválidos

```typescript
// En scoreEvaluado, después de validar pares
const paresValidos = new Map<string, { r1: Reactivo | null; r2: Reactivo | null }>();
for (const [pairId, par] of pares.entries()) {
  const reactivosDelPar = [par.r1, par.r2].filter(r => r !== null);
  const validationError = validatePair(pairId, reactivosDelPar);
  
  if (validationError) {
    warnings.push(validationError);
    if (validationError.type === 'error') {
      console.warn(`❌ Omitiendo par inválido: ${pairId}`);
      continue; // ✅ NO procesar pares inválidos
    }
  }

  if (par.r1 && par.r2) {
    paresValidos.set(pairId, par);
  }
}
```

---

## 🧪 Checklist de Verificación

### Antes de Usar el Sistema

- [ ] **Normas en BD**: Verificar que `NormaDecil` tenga datos
  ```sql
  SELECT COUNT(*) FROM "NormaDecil";
  ```

- [ ] **Escalas configuradas**: Verificar tabla `Escala`
  ```sql
  SELECT COUNT(*) FROM "Escala";
  ```

- [ ] **Competencias configuradas**: Verificar tabla `Competencia`
  ```sql
  SELECT COUNT(*) FROM "Competencia";
  ```

- [ ] **Reactivos con pares**: Verificar que cada par tenga 2 reactivos
  ```sql
  SELECT "pairId", COUNT(*) as count 
  FROM "Reactivo" 
  GROUP BY "pairId" 
  HAVING COUNT(*) != 2;
  ```

- [ ] **Reactivos con escalas**: Verificar que cada reactivo tenga escala
  ```sql
  SELECT COUNT(*) FROM "Reactivo" WHERE "escalaId" IS NULL;
  ```

### Durante la Ejecución

- [ ] Revisar logs de scoring en consola
- [ ] Verificar que no haya warnings de pares incompletos
- [ ] Verificar que deciles no sean todos 1
- [ ] Verificar que puntajes naturales no sean 0 o null

### Después de Completar

- [ ] Verificar que `Resultado` tenga datos
  ```sql
  SELECT * FROM "Resultado" WHERE "evaluadoId" = 'ID_AQUI';
  ```

- [ ] Verificar que puntajes no sean null
  ```sql
  SELECT 
    "puntajesNaturales" IS NULL as naturales_null,
    "puntajesDeciles" IS NULL as deciles_null,
    COUNT(*) 
  FROM "Resultado" 
  GROUP BY naturales_null, deciles_null;
  ```

---

## 📊 Estructura de Datos Esperada

### Puntajes Naturales (Ejemplo)

```json
{
  "ESFUERZO": 45.5,
  "OPTIMISMO": 52.3,
  "DISCIPLINA": 48.7,
  "COMPETENCIA_A_1": 48.83,
  "COMPETENCIA_A_2": 50.15,
  "POTENCIAL_GENERACION_INGRESOS": 49.49,
  "POTENCIAL_GESTION_GASTOS": 49.49
}
```

### Puntajes Deciles (Ejemplo)

```json
{
  "ESFUERZO": 5,
  "OPTIMISMO": 6,
  "DISCIPLINA": 5,
  "COMPETENCIA_A_1": 5,
  "COMPETENCIA_A_2": 6,
  "POTENCIAL_GENERACION_INGRESOS": 5,
  "POTENCIAL_GESTION_GASTOS": 5
}
```

---

## 🔧 Recomendaciones

### 1. Usar Versión Principal

Cambiar `submit/route.ts` para usar `scoreEvaluado` en lugar de `scoreEvaluadoEnhanced`:

```typescript
import { scoreEvaluado } from "@/lib/scoring";
const scoringResult = await scoreEvaluado(evaluadoId);
```

### 2. Agregar Logging Detallado

Habilitar logs en producción para diagnosticar problemas:

```typescript
console.log('📊 Puntajes naturales guardados:', puntajesNaturales);
console.log('📊 Puntajes deciles guardados:', puntajesDeciles);
```

### 3. Validar Datos Importados

Después de importar datos del Excel, ejecutar:

```sql
-- Verificar integridad de pares
SELECT "pairId", COUNT(*) as count 
FROM "Reactivo" 
GROUP BY "pairId" 
HAVING COUNT(*) != 2;

-- Verificar escalas sin reactivos
SELECT e.id, e.codigo 
FROM "Escala" e 
LEFT JOIN "Reactivo" r ON e.id = r."escalaId" 
WHERE r.id IS NULL;

-- Verificar normas por escala
SELECT escala, COUNT(*) as count 
FROM "NormaDecil" 
GROUP BY escala;
```

### 4. Monitorear Warnings

Revisar regularmente los warnings del scoring:

```typescript
if (scoringResult.warnings.length > 0) {
  console.warn('⚠️  Warnings del scoring:');
  scoringResult.warnings.forEach(w => {
    console.warn(`   [${w.type}] ${w.message}`);
  });
}
```

---

## 📝 Notas Técnicas

### Flujo de Scoring (4 Pasos)

1. **REACTIVOS**: Pareamiento (puntaje fijo) + Likert (1-5)
2. **ESCALAS**: Sumatoria de puntajes + Promedio Likert
3. **COMPETENCIAS A**: Promedio de escalas + Contraste con norma
4. **COMPETENCIAS B**: Promedio de competencias A (sin norma)

### Validaciones Críticas

- ✅ Cada par debe tener exactamente 2 reactivos
- ✅ Cada reactivo debe tener escala asignada
- ✅ Cada escala debe tener normas en NormaDecil
- ✅ Puntajes naturales no deben ser null/undefined
- ✅ Deciles deben estar entre 1-10

### Fuentes de Datos

| Tabla | Propósito | Crítica |
|-------|-----------|---------|
| Escala | Definir escalas | ✅ Sí |
| Competencia | Definir competencias | ✅ Sí |
| CompetenciaEscala | Relación comp-escala | ✅ Sí |
| Reactivo | Preguntas pareadas | ✅ Sí |
| NormaDecil | Conversión a deciles | ✅ Sí |
| RespuestaCustom | Respuestas del usuario | ✅ Sí |
| Resultado | Guardar puntajes | ✅ Sí |

---

## 🚀 Próximos Pasos

1. [ ] Verificar que NormaDecil tenga datos
2. [ ] Cambiar submit/route.ts a usar scoreEvaluado
3. [ ] Ejecutar test de scoring con evaluado de prueba
4. [ ] Revisar logs para warnings
5. [ ] Validar que puntajes no sean null
6. [ ] Verificar que deciles estén entre 1-10
7. [ ] Documentar cualquier anomalía encontrada