/**
 * Script para asignar automáticamente pairId a los reactivos
 * 
 * Este script empareja reactivos POSITIVOS con NEGATIVOS de la misma escala
 * para crear los 168 pares necesarios para el sistema de pareamiento forzado.
 * 
 * Uso:
 * npx tsx scripts/asignar-pares-reactivos.ts
 */

import { createClient } from '@supabase/supabase-js';

// ============================================
// CONFIGURACIÓN
// ============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// TIPOS
// ============================================

interface Reactivo {
  id: number;
  codigo: string;
  texto: string;
  tipo: 'POSITIVO' | 'NEGATIVO' | 'NEUTRAL';
  escalaId: number;
  pairId: number | null;
  ordenGlobal: number;
}

interface Escala {
  id: number;
  codigo: string;
  nombre: string;
  tipo: 'POSITIVO' | 'NEGATIVO' | 'NEUTRAL';
}

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

async function obtenerReactivos(): Promise<Reactivo[]> {
  console.log('📋 Obteniendo reactivos de la base de datos...');
  
  const { data, error } = await supabase
    .from('Reactivo')
    .select('*')
    .order('ordenGlobal', { ascending: true });

  if (error) {
    throw new Error(`Error al obtener reactivos: ${error.message}`);
  }

  console.log(`✓ ${data.length} reactivos obtenidos`);
  return data;
}

async function obtenerEscalas(): Promise<Escala[]> {
  console.log('📊 Obteniendo escalas de la base de datos...');
  
  const { data, error } = await supabase
    .from('Escala')
    .select('*');

  if (error) {
    throw new Error(`Error al obtener escalas: ${error.message}`);
  }

  console.log(`✓ ${data.length} escalas obtenidas`);
  return data;
}

async function asignarPares(reactivos: Reactivo[], escalas: Escala[]) {
  console.log('\n🔗 Iniciando asignación de pares...');
  console.log('='.repeat(60));

  // Crear mapa de escalas por ID
  const escalasMap = new Map(escalas.map(e => [e.id, e]));

  // Agrupar reactivos por escala
  const reactivosPorEscala = new Map<number, Reactivo[]>();
  
  for (const reactivo of reactivos) {
    if (!reactivosPorEscala.has(reactivo.escalaId)) {
      reactivosPorEscala.set(reactivo.escalaId, []);
    }
    reactivosPorEscala.get(reactivo.escalaId)!.push(reactivo);
  }

  let totalPares = 0;
  let totalActualizados = 0;
  const updates: Array<{ id: number; pairId: number }> = [];

  // Procesar cada escala
  for (const [escalaId, reactivosEscala] of reactivosPorEscala.entries()) {
    const escala = escalasMap.get(escalaId);
    
    if (!escala) {
      console.warn(`⚠️  Escala no encontrada: ${escalaId}`);
      continue;
    }

    // Separar por tipo
    const positivos = reactivosEscala.filter(r => r.tipo === 'POSITIVO');
    const negativos = reactivosEscala.filter(r => r.tipo === 'NEGATIVO');

    // Validar que haya la misma cantidad
    if (positivos.length !== negativos.length) {
      console.warn(`⚠️  Escala ${escala.codigo} (${escala.nombre}): ${positivos.length} positivos vs ${negativos.length} negativos`);
    }

    // Emparejar
    const cantidadPares = Math.min(positivos.length, negativos.length);
    
    for (let i = 0; i < cantidadPares; i++) {
      const positivo = positivos[i];
      const negativo = negativos[i];
      
      // Usar el ID del positivo como pairId
      const pairId = positivo.id;
      
      updates.push({ id: positivo.id, pairId });
      updates.push({ id: negativo.id, pairId });
      
      totalPares++;
    }

    console.log(`  ✓ ${escala.codigo}: ${cantidadPares} pares creados`);
  }

  // Actualizar en lotes
  console.log(`\n💾 Actualizando ${updates.length} reactivos en la base de datos...`);
  
  const batchSize = 100;
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    
    // Actualizar uno por uno (Supabase no soporta bulk update con diferentes valores)
    for (const update of batch) {
      const { error } = await supabase
        .from('Reactivo')
        .update({ pairId: update.pairId })
        .eq('id', update.id);

      if (error) {
        console.error(`❌ Error al actualizar reactivo ${update.id}:`, error);
      } else {
        totalActualizados++;
      }
    }
    
    console.log(`  ✓ Lote ${Math.floor(i / batchSize) + 1}: ${batch.length} reactivos actualizados`);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Asignación completada:`);
  console.log(`  - Total de pares creados: ${totalPares}`);
  console.log(`  - Total de reactivos actualizados: ${totalActualizados}`);
  console.log(`  - Reactivos emparejados: ${totalPares * 2}`);
}

async function verificarIntegridad() {
  console.log('\n🔍 Verificando integridad de los pares...');
  console.log('='.repeat(60));

  // Obtener todos los pares
  const { data: pares, error } = await supabase
    .from('Reactivo')
    .select('pairId, tipo')
    .not('pairId', 'is', null);

  if (error) {
    throw new Error(`Error al verificar pares: ${error.message}`);
  }

  // Agrupar por pairId
  const paresPorId = new Map<number, string[]>();
  
  for (const par of pares) {
    if (!paresPorId.has(par.pairId)) {
      paresPorId.set(par.pairId, []);
    }
    paresPorId.get(par.pairId)!.push(par.tipo);
  }

  // Verificar que cada par tenga exactamente 2 reactivos (1 positivo + 1 negativo)
  let paresValidos = 0;
  let paresInvalidos = 0;

  for (const [pairId, tipos] of paresPorId.entries()) {
    if (tipos.length !== 2) {
      console.warn(`⚠️  Par ${pairId}: ${tipos.length} reactivos (esperado: 2)`);
      paresInvalidos++;
      continue;
    }

    const tienePositivo = tipos.includes('POSITIVO');
    const tieneNegativo = tipos.includes('NEGATIVO');

    if (!tienePositivo || !tieneNegativo) {
      console.warn(`⚠️  Par ${pairId}: tipos incorrectos [${tipos.join(', ')}]`);
      paresInvalidos++;
      continue;
    }

    paresValidos++;
  }

  console.log(`\n📊 Resultados de la verificación:`);
  console.log(`  ✓ Pares válidos: ${paresValidos}`);
  if (paresInvalidos > 0) {
    console.log(`  ⚠️  Pares inválidos: ${paresInvalidos}`);
  }

  // Verificar reactivos sin par
  const { data: sinPar, error: errorSinPar } = await supabase
    .from('Reactivo')
    .select('id, codigo, tipo')
    .is('pairId', null)
    .in('tipo', ['POSITIVO', 'NEGATIVO']);

  if (errorSinPar) {
    throw new Error(`Error al verificar reactivos sin par: ${errorSinPar.message}`);
  }

  if (sinPar.length > 0) {
    console.log(`\n⚠️  Reactivos sin par: ${sinPar.length}`);
    console.log('  Primeros 10:');
    sinPar.slice(0, 10).forEach(r => {
      console.log(`    - ${r.codigo} (${r.tipo})`);
    });
  }

  console.log('\n' + '='.repeat(60));
  
  if (paresInvalidos === 0 && sinPar.length === 0) {
    console.log('✅ ¡Todos los pares están correctamente asignados!');
  } else {
    console.log('⚠️  Se encontraron inconsistencias. Revisa los warnings anteriores.');
  }
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function main() {
  console.log('🚀 Iniciando asignación automática de pares\n');
  console.log('='.repeat(60));

  try {
    // 1. Obtener datos
    const reactivos = await obtenerReactivos();
    const escalas = await obtenerEscalas();

    // 2. Asignar pares
    await asignarPares(reactivos, escalas);

    // 3. Verificar integridad
    await verificarIntegridad();

    console.log('\n🎉 ¡Proceso completado exitosamente!\n');

  } catch (error) {
    console.error('\n❌ ERROR:');
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar
main();
