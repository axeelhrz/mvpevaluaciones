#!/bin/bash

echo "═══════════════════════════════════════════════════════════════"
echo "🚀 CONFIGURACIÓN COMPLETA DEL SISTEMA DE SCORING"
echo "═══════════════════════════════════════════════════════════════"
echo ""

echo "📋 PASO 1: Importando configuración de Scoring desde Excel..."
npx tsx scripts/import-scoring-excel.ts
if [ $? -ne 0 ]; then
    echo "❌ Error al importar configuración de scoring"
    exit 1
fi
echo ""

echo "📋 PASO 2: Importando normas decílicas desde Excel..."
npx tsx scripts/import-normas-excel.ts
if [ $? -ne 0 ]; then
    echo "❌ Error al importar normas decílicas"
    exit 1
fi
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "✅ CONFIGURACIÓN COMPLETADA EXITOSAMENTE"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📊 El sistema ahora está configurado con:"
echo "   • Escalas y competencias del Excel"
echo "   • Normas decílicas para interpretación"
echo "   • Sistema de scoring mejorado"
echo ""
echo "🎯 Próximos pasos:"
echo "   1. Enviar invitación a un evaluado"
echo "   2. Completar el cuestionario (196 preguntas)"
echo "   3. El sistema calculará automáticamente el scoring"
echo "   4. Generar PDF con resultados completos"
echo ""
