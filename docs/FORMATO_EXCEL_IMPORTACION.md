# 📊 Formato de Excel para Importación de Datos

Este documento describe el formato requerido para el archivo Excel que se utilizará para importar datos al sistema de pareamiento forzado.

## 📋 Estructura del Archivo Excel

El archivo Excel debe contener **4 hojas** con los siguientes nombres (no sensible a mayúsculas):

1. **Competencias** (o "Competency")
2. **Escalas** (o "Escala", "Scale")
3. **Reactivos** (o "Items", "Preguntas")
4. **Normas** (o "Percentil", "Baremo") - *Opcional*

---

## 🎯 Hoja 1: COMPETENCIAS

Define las 33 competencias del sistema.

### Columnas requeridas:

| Columna | Tipo | Requerido | Descripción | Ejemplo |
|---------|------|-----------|-------------|---------|
| Código | Texto | ✅ Sí | Identificador único | `C01` |
| Nombre | Texto | ✅ Sí | Nombre de la competencia | `Liderazgo` |
| Descripción | Texto | ❌ No | Descripción detallada | `Capacidad para dirigir equipos` |
| Categoría | Texto | ❌ No | Categoría o agrupación | `Interpersonal` |
| Orden | Número | ❌ No | Orden de visualización | `1` |

### Ejemplo de datos:

```
Código | Nombre              | Descripción                           | Categoría      | Orden
-------|---------------------|---------------------------------------|----------------|------
C01    | Liderazgo           | Capacidad para dirigir equipos        | Interpersonal  | 1
C02    | Comunicación        | Habilidad para transmitir ideas       | Interpersonal  | 2
C03    | Trabajo en equipo   | Colaboración efectiva con otros       | Interpersonal  | 3
C04    | Pensamiento crítico | Análisis y resolución de problemas    | Cognitiva      | 4
```

---

## 📊 Hoja 2: ESCALAS

Define las 48 escalas del sistema (24 positivas + 24 negativas).

### Columnas requeridas:

| Columna | Tipo | Requerido | Descripción | Ejemplo |
|---------|------|-----------|-------------|---------|
| Código | Texto | ✅ Sí | Identificador único | `E01` |
| Nombre | Texto | ✅ Sí | Nombre de la escala | `Dominancia` |
| Descripción | Texto | ❌ No | Descripción detallada | `Tendencia a tomar control` |
| Competencia | Texto | ✅ Sí | Código de competencia asociada | `C01` |
| Tipo | Texto | ✅ Sí | POSITIVO, NEGATIVO o NEUTRAL | `POSITIVO` |
| Orden | Número | ❌ No | Orden de visualización | `1` |

### Ejemplo de datos:

```
Código | Nombre       | Descripción                    | Competencia | Tipo     | Orden
-------|--------------|--------------------------------|-------------|----------|------
E01    | Dominancia   | Tendencia a tomar control      | C01         | POSITIVO | 1
E02    | Sumisión     | Tendencia a seguir órdenes     | C01         | NEGATIVO | 2
E03    | Asertividad  | Comunicación directa y clara   | C02         | POSITIVO | 3
E04    | Pasividad    | Evitación de confrontación     | C02         | NEGATIVO | 4
```

---

## 📋 Hoja 3: REACTIVOS

Define los 391 reactivos del sistema (168 positivos + 168 negativos + 55 neutrales).

### Columnas requeridas:

| Columna | Tipo | Requerido | Descripción | Ejemplo |
|---------|------|-----------|-------------|---------|
| Código | Texto | ✅ Sí | Identificador único | `R001` |
| Texto | Texto | ✅ Sí | Texto del reactivo | `Soy una persona dominante` |
| Tipo | Texto | ✅ Sí | POSITIVO, NEGATIVO o NEUTRAL | `POSITIVO` |
| Escala | Texto | ✅ Sí | Código de escala asociada | `E01` |
| Sección | Texto | ❌ No | Sección del cuestionario | `A` |
| Orden | Número | ✅ Sí | Orden global del reactivo | `1` |
| Activo | Booleano | ❌ No | Si está activo (default: true) | `TRUE` |

### Ejemplo de datos:

```
Código | Texto                              | Tipo     | Escala | Sección | Orden | Activo
-------|------------------------------------|---------|---------|---------|---------|---------
R001   | Soy una persona dominante          | POSITIVO | E01    | A       | 1     | TRUE
R002   | Prefiero seguir instrucciones      | NEGATIVO | E02    | A       | 2     | TRUE
R003   | Me comunico de forma directa       | POSITIVO | E03    | A       | 3     | TRUE
R004   | Evito expresar mis opiniones       | NEGATIVO | E04    | A       | 4     | TRUE
```

### ⚠️ Importante sobre reactivos:

- Los reactivos **POSITIVOS** y **NEGATIVOS** deben estar **emparejados** (pairId)
- Cada par debe tener el mismo `pairId` en la base de datos
- El script de importación NO asigna automáticamente los pares
- Debes crear los pares manualmente después de la importación o usar un script adicional

---

## 📈 Hoja 4: NORMAS (Opcional)

Define las normas y percentiles para cada escala.

### Columnas requeridas:

| Columna | Tipo | Requerido | Descripción | Ejemplo |
|---------|------|-----------|-------------|---------|
| Escala | Texto | ✅ Sí | Código de escala | `E01` |
| Percentil | Número | ✅ Sí | Percentil (1-99) | `50` |
| PuntuacionDirecta | Número | ✅ Sí | Puntuación directa | `15` |
| PuntuacionT | Número | ✅ Sí | Puntuación T (20-80) | `50` |
| Interpretación | Texto | ❌ No | Interpretación cualitativa | `Promedio` |

### Ejemplo de datos:

```
Escala | Percentil | PuntuacionDirecta | PuntuacionT | Interpretación
-------|-----------|-------------------|-------------|----------------
E01    | 10        | 5                 | 30          | Muy bajo
E01    | 25        | 10                | 40          | Bajo
E01    | 50        | 15                | 50          | Promedio
E01    | 75        | 20                | 60          | Alto
E01    | 90        | 25                | 70          | Muy alto
```

---

## 🚀 Uso del Script de Importación

### 1. Preparar el archivo Excel

Asegúrate de que tu archivo Excel tenga las 4 hojas con los nombres correctos y las columnas requeridas.

### 2. Instalar dependencias

```bash
npm install xlsx
```

### 3. Configurar variables de entorno

Asegúrate de tener en tu archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### 4. Ejecutar el script

```bash
npx tsx scripts/import-pareamiento-excel.ts ruta/al/archivo.xlsx
```

### 5. Verificar la importación

El script mostrará:
- ✅ Número de registros extraídos de cada hoja
- ✅ Progreso de importación por lotes
- ✅ Resumen final de registros importados
- ⚠️ Warnings si hay datos faltantes o inconsistencias

---

## 📝 Ejemplo de Salida del Script

```
🚀 Iniciando importación de datos desde Excel

============================================================
📖 Leyendo archivo: datos_pareamiento.xlsx
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
  ✓ Lote 2: 100 normas
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

## ⚠️ Consideraciones Importantes

### 1. Orden de importación

El script importa en el siguiente orden (respetando dependencias):
1. Competencias (sin dependencias)
2. Escalas (dependen de Competencias)
3. Reactivos (dependen de Escalas)
4. Normas (dependen de Escalas)

### 2. Códigos únicos

- Todos los códigos deben ser únicos dentro de su tabla
- Si un código ya existe, se actualizará (upsert)

### 3. Referencias

- Las escalas deben referenciar competencias existentes
- Los reactivos deben referenciar escalas existentes
- Las normas deben referenciar escalas existentes

### 4. Validaciones

El script valida:
- ✅ Existencia del archivo
- ✅ Existencia de las hojas requeridas
- ✅ Columnas requeridas presentes
- ✅ Referencias válidas entre tablas
- ⚠️ Muestra warnings para datos faltantes

### 5. Manejo de errores

- Si falla la importación de un lote, se detiene el proceso
- Los datos ya importados NO se revierten automáticamente
- Revisa los logs para identificar el problema

---

## 🔧 Troubleshooting

### Error: "No se encontró la hoja de reactivos"

**Solución:** Verifica que el nombre de la hoja sea exactamente "Reactivos", "Items" o "Preguntas" (no sensible a mayúsculas).

### Error: "Competencia no encontrada para escala"

**Solución:** Asegúrate de que el código de competencia en la hoja de Escalas coincida exactamente con un código en la hoja de Competencias.

### Error: "Escala no encontrada para reactivo"

**Solución:** Asegúrate de que el código de escala en la hoja de Reactivos coincida exactamente con un código en la hoja de Escalas.

### Warning: "Texto vacío, se omitirá"

**Solución:** Revisa que todas las filas tengan texto en la columna "Texto" o "Reactivo".

---

## 📞 Soporte

Si tienes problemas con la importación:

1. Revisa los logs del script
2. Verifica el formato del Excel
3. Asegúrate de que las variables de entorno estén configuradas
4. Consulta la documentación de Supabase

---

## 📚 Recursos Adicionales

- [Documentación de XLSX](https://www.npmjs.com/package/xlsx)
- [Documentación de Supabase](https://supabase.com/docs)
- [Sistema de Pareamiento Forzado](./SISTEMA_PARES_Y_NORMAS.md)
