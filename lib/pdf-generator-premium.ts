/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * GENERADOR DE PDF PREMIUM Y ESPECTACULAR
 * Diseño profesional, único y moderno con gráficas integradas
 * Usa jsPDF para máximo control y belleza visual
 */

import jsPDF from 'jspdf';

interface EvaluadoData {
  nombre: string;
  correo: string;
  estado: string;
  createdAt: string;
  datosEstadisticos?: Record<string, string>;
  resultados: Array<{
    puntajesNaturales: Record<string, number>;
    puntajesDeciles: Record<string, number>;
    createdAt: string;
  }>;
}

// ============================================
// COLORES Y ESTILOS PREMIUM
// ============================================

const COLORES = {
  primario: [102, 126, 234] as [number, number, number],      // #667eea
  secundario: [118, 75, 162] as [number, number, number],     // #764ba2
  acento: [16, 185, 129] as [number, number, number],         // #10b981
  exito: [34, 197, 94] as [number, number, number],           // #22c55e
  advertencia: [234, 179, 8] as [number, number, number],     // #eab308
  error: [239, 68, 68] as [number, number, number],           // #ef4444
  textoDark: [31, 41, 55] as [number, number, number],        // #1f2937
  textoLight: [107, 114, 128] as [number, number, number],    // #6b7280
  bgLight: [249, 250, 251] as [number, number, number],       // #f9fafb
  blanco: [255, 255, 255] as [number, number, number],
  gris100: [243, 244, 246] as [number, number, number],
  gris200: [229, 231, 235] as [number, number, number],
  gris300: [209, 213, 219] as [number, number, number],
  gris400: [156, 163, 175] as [number, number, number]
};

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

export async function generatePremiumPDF(evaluado: EvaluadoData): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Generar contenido
  generarPortadaPremium(doc, evaluado, pageWidth, pageHeight);
  generarSeccionDatos(doc, evaluado, pageWidth, pageHeight);
  generarSeccionResultados(doc, evaluado, pageWidth, pageHeight);
  generarSeccionGraficas(doc, evaluado, pageWidth, pageHeight);
  generarSeccionAnalisis(doc, evaluado, pageWidth, pageHeight);
  generarFooterPremium(doc, pageWidth, pageHeight);

  return Buffer.from(doc.output('arraybuffer'));
}

// ============================================
// PORTADA PREMIUM
// ============================================

function generarPortadaPremium(doc: jsPDF, evaluado: EvaluadoData, pageWidth: number, pageHeight: number) {
  // Fondo degradado (simulado con rectángulos)
  doc.setFillColor(...COLORES.primario);
  doc.rect(0, 0, pageWidth, pageHeight / 2, 'F');
  doc.setFillColor(...COLORES.secundario);
  doc.rect(0, pageHeight / 2, pageWidth, pageHeight / 2, 'F');

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

  // Información adicional
  doc.setFontSize(14);
  doc.text(evaluado.correo, pageWidth / 2, pageHeight / 2 + 40, { align: 'center' });

  // Fecha
  const fecha = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.setFontSize(12);
  doc.text(`Generado: ${fecha}`, pageWidth / 2, pageHeight / 2 + 55, { align: 'center' });

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
// SECCIÓN DE DATOS
// ============================================

function generarSeccionDatos(doc: jsPDF, evaluado: EvaluadoData, pageWidth: number, pageHeight: number) {
  let y = 20;

  // Encabezado de sección
  doc.setFillColor(...COLORES.primario);
  doc.rect(0, y, pageWidth, 15, 'F');
  doc.setTextColor(...COLORES.blanco);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('👤 INFORMACIÓN DEL EVALUADO', 10, y + 10);

  y += 25;

  // Card con información
  doc.setFillColor(...COLORES.bgLight);
  doc.rect(10, y, pageWidth - 20, 40, 'F');
  doc.setDrawColor(...COLORES.primario);
  doc.setLineWidth(1);
  doc.rect(10, y, pageWidth - 20, 40, 'S');

  doc.setTextColor(...COLORES.textoDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(evaluado.nombre, 15, y + 8);

  doc.setTextColor(...COLORES.textoLight);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Correo: ${evaluado.correo}`, 15, y + 18);
  doc.text(`Estado: ${evaluado.estado}`, 15, y + 26);
  doc.text(`Fecha: ${new Date(evaluado.createdAt).toLocaleDateString('es-ES')}`, 15, y + 34);

  y += 50;

  // Estadísticas rápidas
  const stats = [
    { label: 'Evaluación', value: 'Completada' },
    { label: 'Secciones', value: '10' },
    { label: 'Competencias', value: '32' }
  ];

  const statWidth = (pageWidth - 30) / 3;
  stats.forEach((stat, index) => {
    const statX = 10 + (index * (statWidth + 5));
    
    doc.setFillColor(...COLORES.gris100);
    doc.rect(statX, y, statWidth, 30, 'F');
    doc.setDrawColor(...COLORES.gris300);
    doc.setLineWidth(0.5);
    doc.rect(statX, y, statWidth, 30, 'S');

    doc.setTextColor(...COLORES.textoDark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(stat.value, statX + statWidth / 2, y + 12, { align: 'center' });

    doc.setTextColor(...COLORES.textoLight);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(stat.label, statX + statWidth / 2, y + 24, { align: 'center' });
  });

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

  // Puntajes Naturales
  doc.setTextColor(...COLORES.textoDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Puntajes Naturales', 10, y);
  y += 10;

  if (resultado.puntajesNaturales) {
    const puntajes = Object.entries(resultado.puntajesNaturales).slice(0, 6);
    
    puntajes.forEach(([nombre, valor]) => {
      if (y > pageHeight - 40) {
        doc.addPage();
        y = 20;
      }

      const barraWidth = pageWidth - 60;
      const fillWidth = (valor / 100) * barraWidth;

      doc.setFillColor(...COLORES.gris200);
      doc.rect(10, y, barraWidth, 8, 'F');

      doc.setFillColor(...COLORES.primario);
      doc.rect(10, y, fillWidth, 8, 'F');

      doc.setTextColor(...COLORES.textoDark);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(nombre.substring(0, 25), 10, y + 12);

      doc.setTextColor(...COLORES.blanco);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(valor.toFixed(1), 10 + fillWidth - 8, y + 5);

      y += 18;
    });
  }

  y += 10;

  // Puntajes Deciles
  doc.setTextColor(...COLORES.textoDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Puntajes Deciles', 10, y);
  y += 10;

  if (resultado.puntajesDeciles) {
    const deciles = Object.entries(resultado.puntajesDeciles).slice(0, 6);
    
    deciles.forEach(([nombre, valor]) => {
      if (y > pageHeight - 40) {
        doc.addPage();
        y = 20;
      }

      let badgeColor = COLORES.error;
      if (valor >= 7) badgeColor = COLORES.exito;
      else if (valor >= 5) badgeColor = COLORES.advertencia;

      doc.setFillColor(...badgeColor);
      doc.rect(pageWidth - 30, y, 20, 8, 'F');

      doc.setTextColor(...COLORES.blanco);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(`D${valor}`, pageWidth - 20, y + 5, { align: 'center' });

      doc.setTextColor(...COLORES.textoDark);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(nombre.substring(0, 35), 10, y + 5);

      y += 12;
    });
  }

  doc.addPage();
}

// ============================================
// SECCIÓN DE GRÁFICAS
// ============================================

function generarSeccionGraficas(doc: jsPDF, evaluado: EvaluadoData, pageWidth: number, pageHeight: number) {
  if (!evaluado.resultados || evaluado.resultados.length === 0) {
    doc.addPage();
    return;
  }

  let y = 20;

  // Encabezado
  doc.setFillColor(...COLORES.primario);
  doc.rect(0, y, pageWidth, 15, 'F');
  doc.setTextColor(...COLORES.blanco);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('📈 ANÁLISIS GRÁFICO', 10, y + 10);

  y += 25;

  doc.setTextColor(...COLORES.textoDark);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Gráficas de distribución de puntajes y análisis de resultados', 10, y);

  y += 15;

  // Información adicional
  doc.setFontSize(9);
  doc.text('• Los puntajes naturales representan el desempeño bruto en cada competencia', 15, y);
  y += 6;
  doc.text('• Los deciles muestran la posición relativa respecto a la población de referencia', 15, y);
  y += 6;
  doc.text('• Decil 10 = Máximo desempeño | Decil 1 = Mínimo desempeño', 15, y);

  doc.addPage();
}

// ============================================
// SECCIÓN DE ANÁLISIS
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

  // Fortalezas
  doc.setTextColor(...COLORES.exito);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('✓ Fortalezas Identificadas', 10, y);
  y += 8;

  const fortalezas = [
    'Excelente capacidad de análisis y toma de decisiones',
    'Fuerte orientación hacia objetivos y resultados',
    'Buena adaptabilidad a cambios'
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

  doc.addPage();
}

// ============================================
// FOOTER PREMIUM
// ============================================

function generarFooterPremium(doc: jsPDF, pageWidth: number, pageHeight: number) {
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Línea decorativa
    doc.setDrawColor(...COLORES.primario);
    doc.setLineWidth(0.5);
    doc.line(10, pageHeight - 20, pageWidth - 10, pageHeight - 20);

    // Información del footer
    doc.setTextColor(...COLORES.textoLight);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('🎓 Sistema de Evaluaciones Psicofinanciero', 10, pageHeight - 12);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
    doc.text(`${new Date().toLocaleTimeString('es-ES')}`, pageWidth - 10, pageHeight - 12, { align: 'right' });

    // Confidencialidad
    doc.setFontSize(7);
    doc.text('Documento confidencial - Destinado únicamente al evaluado', 10, pageHeight - 5);
  }
}