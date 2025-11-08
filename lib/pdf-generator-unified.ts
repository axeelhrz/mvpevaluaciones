/**
 * GENERADOR DE PDF UNIFICADO Y PROFESIONAL
 * Diseño único, moderno y estético
 * Combina lo mejor de todos los generadores anteriores
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface EvaluadoData {
  nombre: string;
  correo: string;
  estado: string;
  createdAt: string;
  datosEstadisticos?: Record<string, string>;
  respuestas?: Array<{
    preguntaId: string;
    valoresMultiples?: Record<string, unknown> | unknown[];
    updatedAt: string;
  }>;
  resultados: Array<{
    puntajesNaturales: Record<string, number>;
    puntajesDeciles: Record<string, number>;
    createdAt: string;
  }>;
}

// ============================================
// PALETA DE COLORES PROFESIONAL
// ============================================

const COLORES = {
  primario: [102, 126, 234] as [number, number, number],      // #667eea - Azul profesional
  secundario: [118, 75, 162] as [number, number, number],     // #764ba2 - Púrpura
  acento: [16, 185, 129] as [number, number, number],         // #10b981 - Verde
  exito: [34, 197, 94] as [number, number, number],           // #22c55e - Verde éxito
  advertencia: [234, 179, 8] as [number, number, number],     // #eab308 - Amarillo
  error: [239, 68, 68] as [number, number, number],           // #ef4444 - Rojo
  textoDark: [31, 41, 55] as [number, number, number],        // #1f2937 - Gris oscuro
  textoLight: [107, 114, 128] as [number, number, number],    // #6b7280 - Gris claro
  bgLight: [249, 250, 251] as [number, number, number],       // #f9fafb - Fondo claro
  blanco: [255, 255, 255] as [number, number, number],
  gris100: [243, 244, 246] as [number, number, number],
  gris200: [229, 231, 235] as [number, number, number],
  gris300: [209, 213, 219] as [number, number, number],
};

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

export function generateUnifiedPDF(evaluado: EvaluadoData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Generar secciones
  generarPortada(doc, evaluado, pageWidth, pageHeight);
  generarSeccionInformacion(doc, evaluado, pageWidth, pageHeight);
  generarSeccionResultados(doc, evaluado, pageWidth, pageHeight);
  generarSeccionAnalisis(doc, evaluado, pageWidth, pageHeight);
  generarFooterEnTodasLasPaginas(doc, pageWidth, pageHeight);

  return doc;
}

// ============================================
// PORTADA PROFESIONAL
// ============================================

function generarPortada(doc: jsPDF, evaluado: EvaluadoData, pageWidth: number, pageHeight: number) {
  // Fondo degradado (simulado con rectángulos)
  doc.setFillColor(...COLORES.primario);
  doc.rect(0, 0, pageWidth, pageHeight / 2, 'F');
  doc.setFillColor(...COLORES.secundario);
  doc.rect(0, pageHeight / 2, pageWidth, pageHeight / 2, 'F');

  // Círculos decorativos
  doc.setFillColor(139, 112, 200);
  doc.circle(pageWidth - 15, 15, 45, 'F');
  doc.circle(15, pageHeight - 30, 35, 'F');

  // Título principal
  doc.setTextColor(...COLORES.blanco);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(48);
  doc.text('REPORTE DE', pageWidth / 2, pageHeight / 3 - 10, { align: 'center' });
  doc.text('EVALUACIÓN', pageWidth / 2, pageHeight / 3 + 15, { align: 'center' });

  // Línea decorativa
  doc.setDrawColor(...COLORES.blanco);
  doc.setLineWidth(2);
  doc.line(pageWidth / 2 - 50, pageHeight / 3 + 25, pageWidth / 2 + 50, pageHeight / 3 + 25);

  // Nombre del evaluado
  doc.setFontSize(28);
  doc.text(evaluado.nombre.toUpperCase(), pageWidth / 2, pageHeight / 2 + 20, { align: 'center' });

  // Correo
  doc.setFontSize(12);
  doc.text(evaluado.correo, pageWidth / 2, pageHeight / 2 + 35, { align: 'center' });

  // Fecha
  const fecha = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.setFontSize(11);
  doc.text(`Generado: ${fecha}`, pageWidth / 2, pageHeight / 2 + 50, { align: 'center' });

  // Estado badge
  const estadoColor = evaluado.estado === 'completado' ? COLORES.exito : COLORES.advertencia;
  const estadoX = pageWidth / 2 - 20;
  const estadoY = pageHeight - 80;

  doc.setFillColor(...estadoColor);
  doc.rect(estadoX - 20, estadoY, 40, 15, 'F');
  doc.setTextColor(...COLORES.blanco);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(evaluado.estado.toUpperCase(), estadoX, estadoY + 8, { align: 'center' });

  doc.addPage();
}

// ============================================
// SECCIÓN DE INFORMACIÓN
// ============================================

function generarSeccionInformacion(doc: jsPDF, evaluado: EvaluadoData, pageWidth: number, pageHeight: number) {
  let y = 20;

  // Encabezado de sección
  doc.setFillColor(...COLORES.primario);
  doc.rect(0, y, pageWidth, 15, 'F');
  doc.setTextColor(...COLORES.blanco);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('👤 INFORMACIÓN DEL EVALUADO', 10, y + 10);

  y += 25;

  // Card con información principal
  doc.setFillColor(...COLORES.bgLight);
  doc.rect(10, y, pageWidth - 20, 50, 'F');
  doc.setDrawColor(...COLORES.primario);
  doc.setLineWidth(1);
  doc.rect(10, y, pageWidth - 20, 50, 'S');

  // Barra lateral de color
  doc.setFillColor(...COLORES.acento);
  doc.rect(10, y, 5, 50, 'F');

  doc.setTextColor(...COLORES.textoDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(evaluado.nombre, 20, y + 10);

  doc.setTextColor(...COLORES.textoLight);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Correo: ${evaluado.correo}`, 20, y + 20);
  doc.text(`Estado: ${evaluado.estado}`, 20, y + 28);
  doc.text(`Fecha de creación: ${new Date(evaluado.createdAt).toLocaleDateString('es-ES')}`, 20, y + 36);

  y += 60;

  // Datos estadísticos si existen
  if (evaluado.datosEstadisticos && Object.keys(evaluado.datosEstadisticos).length > 0) {
    doc.setFillColor(...COLORES.secundario);
    doc.rect(0, y, pageWidth, 15, 'F');
    doc.setTextColor(...COLORES.blanco);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('📋 INFORMACIÓN DEMOGRÁFICA', 10, y + 10);

    y += 20;

    // Grid de datos estadísticos
    const datos = Object.entries(evaluado.datosEstadisticos);
    const columnWidth = (pageWidth - 20) / 2;
    let currentY = y;
    let currentX = 10;

    datos.forEach(([ label, valor ], index) => {
      if (currentY > pageHeight - 60) {
        doc.addPage();
        currentY = 20;
      }

      // Alternar columnas
      if (index % 2 === 0) {
        currentX = 10;
      } else {
        currentX = 10 + columnWidth;
      }

      // Card para cada dato
      doc.setFillColor(...COLORES.gris100);
      doc.rect(currentX, currentY, columnWidth - 5, 20, 'F');
      doc.setDrawColor(...COLORES.gris300);
      doc.setLineWidth(0.3);
      doc.rect(currentX, currentY, columnWidth - 5, 20, 'S');

      // Label
      doc.setTextColor(...COLORES.textoLight);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(label, currentX + 3, currentY + 6);

      // Valor
      doc.setTextColor(...COLORES.textoDark);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const valorTexto = String(valor).substring(0, 30);
      doc.text(valorTexto, currentX + 3, currentY + 14);

      // Mover Y solo cuando completamos una fila
      if (index % 2 === 1) {
        currentY += 25;
      }
    });

    y = currentY + (datos.length % 2 === 1 ? 25 : 0) + 10;
  }

  doc.addPage();
}

// ============================================
// SECCIÓN DE RESULTADOS
// ============================================

function generarSeccionResultados(doc: jsPDF, evaluado: EvaluadoData, pageWidth: number, pageHeight: number) {
  if (!evaluado.resultados || evaluado.resultados.length === 0) {
    doc.addPage();
    return;
  }

  const resultado = evaluado.resultados[0];
  let y = 20;

  // Encabezado
  doc.setFillColor(...COLORES.primario);
  doc.rect(0, y, pageWidth, 15, 'F');
  doc.setTextColor(...COLORES.blanco);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('📊 RESULTADOS DE LA EVALUACIÓN', 10, y + 10);

  y += 25;

  // ============================================
  // PUNTAJES NATURALES
  // ============================================

  if (resultado.puntajesNaturales && Object.keys(resultado.puntajesNaturales).length > 0) {
    doc.setTextColor(...COLORES.textoDark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Puntajes Naturales', 10, y);
    y += 10;

    const puntajes = Object.entries(resultado.puntajesNaturales).slice(0, 8);

    puntajes.forEach(([nombre, valor]) => {
      if (y > pageHeight - 40) {
        doc.addPage();
        y = 20;
      }

      const barraWidth = pageWidth - 60;
      const fillWidth = Math.max(1, (valor / 100) * barraWidth);

      // Fondo de la barra
      doc.setFillColor(...COLORES.gris200);
      doc.rect(10, y, barraWidth, 8, 'F');

      // Barra de progreso
      doc.setFillColor(...COLORES.primario);
      doc.rect(10, y, fillWidth, 8, 'F');

      // Nombre
      doc.setTextColor(...COLORES.textoDark);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const nombreCorto = nombre.substring(0, 30);
      doc.text(nombreCorto, 10, y + 12);

      // Valor
      doc.setTextColor(...COLORES.blanco);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(valor.toFixed(1), 10 + fillWidth - 8, y + 5);

      y += 18;
    });

    y += 10;
  }

  // ============================================
  // PUNTAJES DECILES
  // ============================================

  if (resultado.puntajesDeciles && Object.keys(resultado.puntajesDeciles).length > 0) {
    if (y > pageHeight - 80) {
      doc.addPage();
      y = 20;
    }

    doc.setTextColor(...COLORES.textoDark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Puntajes Deciles', 10, y);
    y += 10;

    const deciles = Object.entries(resultado.puntajesDeciles).slice(0, 8);

    deciles.forEach(([nombre, valor]) => {
      if (y > pageHeight - 40) {
        doc.addPage();
        y = 20;
      }

      // Determinar color del badge según el decil
      let badgeColor = COLORES.error;
      if (valor >= 7) badgeColor = COLORES.exito;
      else if (valor >= 5) badgeColor = COLORES.advertencia;

      // Badge de decil
      doc.setFillColor(...badgeColor);
      doc.rect(pageWidth - 30, y, 20, 8, 'F');

      doc.setTextColor(...COLORES.blanco);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(`D${valor}`, pageWidth - 20, y + 5, { align: 'center' });

      // Nombre
      doc.setTextColor(...COLORES.textoDark);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const nombreCorto = nombre.substring(0, 40);
      doc.text(nombreCorto, 10, y + 5);

      y += 12;
    });

    y += 10;
  }

  // Tabla comparativa si hay suficientes datos
  if (y < pageHeight - 100 && resultado.puntajesNaturales && resultado.puntajesDeciles) {
    const tableData = Object.entries(resultado.puntajesNaturales)
      .slice(0, 6)
      .map(([nombre, natural]) => [
        nombre.substring(0, 25),
        natural.toFixed(2),
        resultado.puntajesDeciles[nombre]?.toString() || 'N/A',
        getInterpretacionDecil(resultado.puntajesDeciles[nombre] || 0)
      ]);

    if (tableData.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Competencia', 'Puntaje Natural', 'Decil', 'Interpretación']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: COLORES.primario,
          textColor: COLORES.blanco,
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 4
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { halign: 'center', cellWidth: 30 },
          2: { halign: 'center', cellWidth: 20 },
          3: { halign: 'center', cellWidth: 'auto' }
        },
        alternateRowStyles: {
          fillColor: COLORES.bgLight
        },
        margin: { left: 10, right: 10 }
      });
    }
  }

  doc.addPage();
}

// ============================================
// SECCIÓN DE ANÁLISIS Y RECOMENDACIONES
// ============================================

function generarSeccionAnalisis(doc: jsPDF, evaluado: EvaluadoData, pageWidth: number, pageHeight: number) {
  let y = 20;

  // Encabezado
  doc.setFillColor(...COLORES.primario);
  doc.rect(0, y, pageWidth, 15, 'F');
  doc.setTextColor(...COLORES.blanco);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('🎯 ANÁLISIS Y RECOMENDACIONES', 10, y + 10);

  y += 25;

  // Resumen ejecutivo
  doc.setTextColor(...COLORES.textoDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Resumen Ejecutivo', 10, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const resumen = 'Este reporte presenta los resultados de la evaluación realizada. Los puntajes naturales representan el desempeño bruto en cada competencia, mientras que los deciles muestran la posición relativa respecto a la población de referencia.';
  const resumenLines = doc.splitTextToSize(resumen, pageWidth - 20);
  doc.text(resumenLines, 10, y);
  y += (resumenLines.length * 5) + 10;

  // Fortalezas
  if (y > pageHeight - 100) {
    doc.addPage();
    y = 20;
  }

  doc.setTextColor(...COLORES.exito);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('✓ Fortalezas Identificadas', 10, y);
  y += 8;

  const fortalezas = [
    'Capacidad de análisis y toma de decisiones',
    'Orientación hacia objetivos y resultados',
    'Adaptabilidad a cambios'
  ];

  doc.setTextColor(...COLORES.textoDark);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  fortalezas.forEach(f => {
    doc.text(`• ${f}`, 15, y);
    y += 6;
  });

  y += 8;

  // Áreas de mejora
  if (y > pageHeight - 80) {
    doc.addPage();
    y = 20;
  }

  doc.setTextColor(...COLORES.advertencia);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('⚠ Áreas de Mejora', 10, y);
  y += 8;

  const mejoras = [
    'Desarrollar mayor disciplina en gestión del tiempo',
    'Fortalecer habilidades de comunicación',
    'Mejorar capacidad de delegación'
  ];

  doc.setTextColor(...COLORES.textoDark);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  mejoras.forEach(m => {
    doc.text(`• ${m}`, 15, y);
    y += 6;
  });

  y += 8;

  // Recomendaciones
  if (y > pageHeight - 80) {
    doc.addPage();
    y = 20;
  }

  doc.setTextColor(...COLORES.primario);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('💡 Recomendaciones', 10, y);
  y += 8;

  const recomendaciones = [
    'Participar en programas de desarrollo de liderazgo',
    'Realizar coaching ejecutivo personalizado',
    'Implementar plan de desarrollo de competencias'
  ];

  doc.setTextColor(...COLORES.textoDark);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  recomendaciones.forEach(r => {
    doc.text(`• ${r}`, 15, y);
    y += 6;
  });
}

// ============================================
// FOOTER EN TODAS LAS PÁGINAS
// ============================================

function generarFooterEnTodasLasPaginas(doc: jsPDF, pageWidth: number, pageHeight: number) {
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Fondo del footer
    doc.setFillColor(...COLORES.bgLight);
    doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');

    // Línea decorativa
    doc.setDrawColor(...COLORES.primario);
    doc.setLineWidth(0.5);
    doc.line(10, pageHeight - 20, pageWidth - 10, pageHeight - 20);

    // Información del footer
    doc.setTextColor(...COLORES.textoLight);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('🎓 Sistema de Evaluaciones', 10, pageHeight - 12);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
    doc.text(`${new Date().toLocaleTimeString('es-ES')}`, pageWidth - 10, pageHeight - 12, { align: 'right' });

    // Confidencialidad
    doc.setFontSize(7);
    doc.setTextColor(...COLORES.gris300);
    doc.text('Documento confidencial - Destinado únicamente al evaluado', 10, pageHeight - 5);
  }
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function getInterpretacionDecil(decil: number): string {
  if (decil >= 9) return 'Muy Alto';
  if (decil >= 7) return 'Alto';
  if (decil >= 5) return 'Medio Alto';
  if (decil >= 4) return 'Medio';
  if (decil >= 2) return 'Bajo';
  return 'Muy Bajo';
}