# 📄 Generador de PDF Unificado - Guía Completa

## 🎨 Características del PDF Unificado

El generador de PDF unificado ofrece un diseño **profesional, moderno y estético** con las siguientes características:

### ✨ Diseño Visual
- **Portada Premium**: Degradado de colores profesionales con decoración geométrica
- **Encabezados Dinámicos**: Secciones claramente diferenciadas con iconos
- **Cards Modernas**: Información organizada en tarjetas con bordes y sombras
- **Tipografía Profesional**: Fuentes Helvetica optimizadas para legibilidad
- **Paleta de Colores**: Colores corporativos consistentes en todo el documento

### 📊 Secciones Incluidas

1. **Portada Premium**
   - Título principal con degradado
   - Nombre del evaluado
   - Información de contacto
   - Estado de evaluación (badge)
   - Fecha de generación

2. **Información del Evaluado**
   - Card con datos personales
   - Estadísticas rápidas (Evaluación, Secciones, Competencias)
   - Información demográfica

3. **Resultados de la Evaluación**
   - Puntajes Naturales con barras de progreso
   - Puntajes Deciles con badges de color
   - Interpretación visual de resultados

4. **Análisis Gráfico**
   - Gráfica de barras de distribución
   - Histograma de valores
   - Ejes y etiquetas claras

5. **Análisis y Recomendaciones**
   - Fortalezas identificadas
   - Áreas de mejora
   - Recomendaciones personalizadas

6. **Footer Profesional**
   - Numeración de páginas
   - Información de confidencialidad
   - Timestamp de generación

### 🎯 Características Técnicas

- **Generador**: PDFKit (máximo control y rendimiento)
- **Formato**: A4 (210 x 297 mm)
- **Márgenes**: Personalizados para mejor presentación
- **Gráficas**: Generadas dinámicamente en el PDF
- **Colores**: Paleta profesional de 15+ colores
- **Fuentes**: Helvetica (estándar PDF)

## 🚀 Cómo Usar

### Descargar PDF desde la Interfaz

1. Ve a **Admin → Evaluados**
2. Selecciona un evaluado completado
3. Haz clic en **"Descargar PDF"**
4. El PDF se descargará automáticamente

### Generar PDF Programáticamente

```typescript
import { generateUnifiedPDF } from '@/lib/pdf-generator-unified';

const evaluadoData = {
  nombre: 'Juan Pérez',
  correo: 'juan@example.com',
  estado: 'completado',
  createdAt: new Date().toISOString(),
  datosEstadisticos: {
    edad: '35',
    genero: 'Masculino',
    region: 'Bogotá',
    ocupacion: 'Ingeniero',
    nivelEducativo: 'Profesional',
    estadoCivil: 'Casado'
  },
  resultados: [
    {
      puntajesNaturales: {
        'Esfuerzo': 45,
        'Optimismo': 52,
        // ... más puntajes
      },
      puntajesDeciles: {
        'Esfuerzo': 5,
        'Optimismo': 6,
        // ... más deciles
      },
      createdAt: new Date().toISOString()
    }
  ]
};

const pdf = generateUnifiedPDF(evaluadoData);
const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
```

## 🎨 Paleta de Colores

```
Primario:      #667eea (Azul Índigo)
Secundario:    #764ba2 (Púrpura)
Acento:        #10b981 (Verde Esmeralda)
Éxito:         #22c55e (Verde Brillante)
Advertencia:   #eab308 (Amarillo)
Error:         #ef4444 (Rojo)
Texto Oscuro:  #1f2937 (Gris Oscuro)
Texto Claro:   #6b7280 (Gris Medio)
Fondo Claro:   #f9fafb (Gris Muy Claro)
```

## 📐 Estructura del Documento

```
┌─────────────────────────────────────┐
│         PORTADA PREMIUM             │
│  - Degradado de colores             │
│  - Nombre del evaluado              │
│  - Estado badge                     │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│   INFORMACIÓN DEL EVALUADO          │
│  - Card con datos personales        │
│  - Estadísticas rápidas             │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│   RESULTADOS DE LA EVALUACIÓN       │
│  - Puntajes Naturales (barras)      │
│  - Puntajes Deciles (badges)        │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│      ANÁLISIS GRÁFICO               │
│  - Gráfica de barras                │
│  - Histograma de distribución       │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  ANÁLISIS Y RECOMENDACIONES         │
│  - Fortalezas                       │
│  - Áreas de mejora                  │
│  - Recomendaciones                  │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│      FOOTER PROFESIONAL             │
│  - Numeración de páginas            │
│  - Información de confidencialidad  │
└─────────────────────────────────────┘
```

## 🔧 Personalización

### Cambiar Colores

Edita `lib/pdf-generator-unified.ts`:

```typescript
const COLORES = {
  primario: [102, 126, 234] as [number, number, number],      // #667eea
  secundario: [118, 75, 162] as [number, number, number],     // #764ba2
  acento: [16, 185, 129] as [number, number, number],         // #10b981
  exito: [34, 197, 94] as [number, number, number],           // #22c55e
  advertencia: [234, 179, 8] as [number, number, number],     // #eab308
  error: [239, 68, 68] as [number, number, number],           // #ef4444
  // ... más colores
};
```

### Agregar Nuevas Secciones

```typescript
function generarSeccionPersonalizada(doc: jsPDF, evaluado: EvaluadoData, pageWidth: number, pageHeight: number) {
  let y = 20;

  // Encabezado
  doc.setFillColor(...COLORES.primario);
  doc.rect(0, y, pageWidth, 15, 'F');
  doc.setTextColor(...COLORES.blanco);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('🎯 MI SECCIÓN', 10, y + 10);

  y += 25;

  // Contenido
  doc.setTextColor(...COLORES.textoDark);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('Contenido aquí', 10, y);

  doc.addPage();
}
```

## 📊 Gráficas Incluidas

### 1. Gráfica de Barras
- Muestra distribución de puntajes
- Colores dinámicos según valores
- Etiquetas y valores en cada barra

### 2. Histograma de Distribución
- Agrupa valores en bins
- Muestra frecuencia de cada rango
- Útil para análisis de distribución

## 🎯 Casos de Uso

### Reporte Ejecutivo
- Portada profesional
- Resumen de resultados
- Gráficas de análisis
- Recomendaciones

### Evaluación Detallada
- Información completa del evaluado
- Todos los puntajes
- Análisis gráfico completo
- Análisis y recomendaciones

### Seguimiento
- Comparación de evaluaciones
- Progreso en competencias
- Recomendaciones de desarrollo

## 🚀 Mejoras Futuras

- [ ] Gráficas de radar integradas
- [ ] Gráficas de cuadrantes
- [ ] Comparación con normas
- [ ] Análisis de tendencias
- [ ] Exportación a otros formatos
- [ ] Personalización de plantillas
- [ ] Múltiples idiomas
- [ ] Firma digital
- [ ] QR con enlace a resultados
- [ ] Temas personalizables

## 📝 Notas Técnicas

- **Librería**: jsPDF + jsPDF-AutoTable
- **Formato**: PDF estándar (compatible)
- **Tamaño**: ~150-400 KB por documento
- **Tiempo de generación**: 0.5-2 segundos
- **Compatibilidad**: Todos los lectores PDF
- **Renderizado**: Síncrono (sin async/await)

## 🐛 Solución de Problemas

### El PDF no se descarga
- Verifica que el evaluado tenga resultados
- Comprueba los permisos de acceso
- Revisa la consola del navegador

### Las gráficas no aparecen
- Verifica que haya datos en puntajes
- Comprueba que los valores sean válidos
- Revisa los logs del servidor

### El PDF se ve cortado
- Verifica los márgenes (40px por defecto)
- Comprueba el tamaño de página (A4)
- Revisa la posición Y de elementos

## 📞 Soporte

Para reportar problemas o sugerencias:
1. Abre un issue en el repositorio
2. Incluye capturas de pantalla
3. Describe los pasos para reproducir
4. Adjunta el PDF problemático si es posible