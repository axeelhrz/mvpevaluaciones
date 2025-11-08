/**
 * Script para migrar la estructura de resultados
 * Convierte puntajes anidados en estructura plana con nombres descriptivos
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// ============================================
// CARGAR VARIABLES DE ENTORNO
// ============================================

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const equalIndex = trimmed.indexOf('=');
    if (equalIndex === -1) continue;
    
    const key = trimmed.substring(0, equalIndex).trim();
    let value = trimmed.substring(equalIndex + 1).trim();
    
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.substring(1, value.length - 1);
    }
    
    process.env[key] = value;
  }
}

loadEnvFile(path.join(process.cwd(), '.env.local'));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// MAPEO DE NOMBRES DESCRIPTIVOS
// ============================================

const MAPEO_NOMBRES: Record<string, string> = {
  // Escalas
  'E1': 'Esfuerzo',
  'E2': 'Apertura a oportunidades',
  'E3': 'Autorefuerzo',
  'E4': 'Confiabilidad',
  'E5': 'Optimismo',
  'E6': 'Aprovechamiento de talentos',
  'E7': 'Percepción Interpersonal',
  'E8': 'Merecimiento',
  'E9': 'Visión Sistémica',
  'E10': 'Emprendimiento',
  'E11': 'Habilidad administrativa',
  'E12': 'Autoconfianza',
  'E13': 'Capacidad de reacción',
  'E14': 'Expectativas',
  'E15': 'Tenacidad',
  'E16': 'Alineamiento de Acciones',
  'E17': 'Autocontrol',
  'E18': 'Recuperación',
  'E19': 'Pensamiento Lógico',
  'E20': 'Sociabilidad',
  'E21': 'Resolución',
  'E22': 'Tolerancia al Conflicto',
  'E23': 'Enfoque',
  'E24': 'Sentido de contribución',
  'E25': 'Influencia',
  'E26': 'Claridad de estrategia',
  'E27': 'Rectitud',
  'E28': 'Energía',
  'E29': 'Temple',
  'E30': 'Consciencia del entorno',
  'E31': 'Superación',
  'E32': 'Adaptación',
  'E33': 'Pensamiento divergente',
  'E34': 'Perseverancia',
  'E35': 'Satisfacción',
  'E36': 'Compromiso',
  'E37': 'Anticipación',
  'E38': 'Automejoramiento',
  'E39': 'Mente Abierta',
  'E40': 'Participación',
  'E41': 'Control Percibido',
  'E42': 'Autosupervisión',
  'E43': 'Salud Financiera',
  'E44': 'Visión Clara',
  'E45': 'Expectativa Profesional',
  'E46': 'Autoconocimiento',
  'E47': 'Anteposición de intereses',
  'E48': 'Autonomía',
  'HF1': 'Habilidad generación de ahorro',
  'HF2': 'Habilidad control de gasto',
  'HF3': 'Habilidad generación de ingresos',
  'HF4': 'Habilidad gestión de inversión',
  'HF5': 'Habilidad control de la deuda',
};

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function main() {
  console.log('🔄 MIGRACIÓN DE ESTRUCTURA DE RESULTADOS\n');
  console.log('═'.repeat(100));

  try {
    // Paso 1: Obtener todos los resultados
    console.log('\n📋 Paso 1: Obteniendo resultados...');
    
    const { data: resultados } = await supabase
      .from('Resultado')
      .select('id, evaluadoId, puntajesNaturales, puntajesDeciles');

    if (!resultados || resultados.length === 0) {
      console.log('⚠️  No hay resultados para migrar');
      return;
    }

    console.log(`✓ ${resultados.length} resultados encontrados`);

    // Paso 2: Procesar cada resultado
    console.log('\n📋 Paso 2: Procesando resultados...');
    
    let migrados = 0;
    let errores = 0;

    for (const resultado of resultados) {
      try {
        console.log(`\n  Procesando resultado ${resultado.id}...`);

        // Convertir estructura anidada a plana
        const puntajesNaturalesPlano: Record<string, number> = {};
        const puntajesDecilesPlano: Record<string, number> = {};

        // Procesar puntajes naturales
        if (resultado.puntajesNaturales && typeof resultado.puntajesNaturales === 'object') {
          const puntajes = resultado.puntajesNaturales as Record<string, any>;
          
          // Si tiene estructura anidada (escalas, competencias)
          if (puntajes.escalas && typeof puntajes.escalas === 'object') {
            for (const [codigo, valor] of Object.entries(puntajes.escalas)) {
              const nombre = MAPEO_NOMBRES[codigo] || codigo;
              const numValor = typeof valor === 'number' ? valor : parseFloat(String(valor));
              if (!isNaN(numValor)) {
                puntajesNaturalesPlano[nombre] = Math.round(numValor * 100) / 100;
              }
            }
          }
          
          if (puntajes.competencias && typeof puntajes.competencias === 'object') {
            for (const [codigo, valor] of Object.entries(puntajes.competencias)) {
              const nombre = MAPEO_NOMBRES[codigo] || codigo;
              const numValor = typeof valor === 'number' ? valor : parseFloat(String(valor));
              if (!isNaN(numValor)) {
                puntajesNaturalesPlano[nombre] = Math.round(numValor * 100) / 100;
              }
            }
          }
          
          // Si ya está plano, copiar directamente
          if (Object.keys(puntajesNaturalesPlano).length === 0) {
            for (const [key, valor] of Object.entries(puntajes)) {
              const numValor = typeof valor === 'number' ? valor : parseFloat(String(valor));
              if (!isNaN(numValor)) {
                puntajesNaturalesPlano[key] = Math.round(numValor * 100) / 100;
              }
            }
          }
        }

        // Procesar puntajes deciles
        if (resultado.puntajesDeciles && typeof resultado.puntajesDeciles === 'object') {
          const deciles = resultado.puntajesDeciles as Record<string, any>;
          
          // Si tiene estructura anidada (escalas, competencias)
          if (deciles.escalas && typeof deciles.escalas === 'object') {
            for (const [codigo, valor] of Object.entries(deciles.escalas)) {
              const nombre = MAPEO_NOMBRES[codigo] || codigo;
              const numValor = typeof valor === 'number' ? valor : parseInt(String(valor));
              if (!isNaN(numValor)) {
                puntajesDecilesPlano[nombre] = numValor;
              }
            }
          }
          
          if (deciles.competencias && typeof deciles.competencias === 'object') {
            for (const [codigo, valor] of Object.entries(deciles.competencias)) {
              const nombre = MAPEO_NOMBRES[codigo] || codigo;
              const numValor = typeof valor === 'number' ? valor : parseInt(String(valor));
              if (!isNaN(numValor)) {
                puntajesDecilesPlano[nombre] = numValor;
              }
            }
          }
          
          // Si ya está plano, copiar directamente
          if (Object.keys(puntajesDecilesPlano).length === 0) {
            for (const [key, valor] of Object.entries(deciles)) {
              const numValor = typeof valor === 'number' ? valor : parseInt(String(valor));
              if (!isNaN(numValor)) {
                puntajesDecilesPlano[key] = numValor;
              }
            }
          }
        }

        // Validar que no estén vacíos
        if (Object.keys(puntajesNaturalesPlano).length === 0) {
          console.log(`    ⚠️  Sin puntajes naturales válidos`);
          puntajesNaturalesPlano['Sin datos'] = 0;
        }
        
        if (Object.keys(puntajesDecilesPlano).length === 0) {
          console.log(`    ⚠️  Sin puntajes deciles válidos`);
          puntajesDecilesPlano['Sin datos'] = 1;
        }

        // Actualizar resultado
        const { error: updateError } = await supabase
          .from('Resultado')
          .update({
            puntajesNaturales: puntajesNaturalesPlano,
            puntajesDeciles: puntajesDecilesPlano
          })
          .eq('id', resultado.id);

        if (updateError) {
          console.log(`    ❌ Error: ${updateError.message}`);
          errores++;
        } else {
          console.log(`    ✓ Migrado exitosamente`);
          console.log(`      - ${Object.keys(puntajesNaturalesPlano).length} puntajes naturales`);
          console.log(`      - ${Object.keys(puntajesDecilesPlano).length} puntajes deciles`);
          migrados++;
        }

      } catch (error) {
        console.log(`    ❌ Error: ${error}`);
        errores++;
      }
    }

    console.log('\n' + '═'.repeat(100));
    console.log('✅ MIGRACIÓN COMPLETADA');
    console.log('═'.repeat(100));
    console.log(`\n📊 Resumen:`);
    console.log(`  ✓ Resultados migrados: ${migrados}`);
    console.log(`  ❌ Errores: ${errores}`);
    console.log(`\n🎉 ¡Migración completada!\n`);

  } catch (error) {
    console.error('\n❌ ERROR:');
    console.error(error);
    process.exit(1);
  }
}

main();