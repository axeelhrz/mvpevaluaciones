/**
 * Script para limpiar COMPLETAMENTE la tabla NormaDecil
 * Elimina TODOS los registros sin importar su estructura
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

async function main() {
  console.log('🗑️  Limpiando tabla NormaDecil COMPLETAMENTE...\n');

  try {
    // Contar registros actuales
    const { count: countBefore, error: countError } = await supabase
      .from('NormaDecil')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error al contar registros:', countError);
      throw countError;
    }

    console.log(`📊 Registros actuales: ${countBefore}`);

    // Eliminar TODOS los registros usando delete sin condiciones
    const { error: deleteError } = await supabase
      .from('NormaDecil')
      .delete()
      .neq('escala', ''); // Condición que siempre es verdadera para eliminar todo

    if (deleteError) {
      console.error('❌ Error al eliminar registros:', deleteError);
      throw deleteError;
    }

    // Verificar que se eliminaron todos
    const { count: countAfter, error: countAfterError } = await supabase
      .from('NormaDecil')
      .select('*', { count: 'exact', head: true });

    if (countAfterError) {
      console.error('❌ Error al verificar eliminación:', countAfterError);
      throw countAfterError;
    }

    console.log(`✅ Registros después de limpiar: ${countAfter}`);
    
    if (countAfter === 0) {
      console.log('✅ Tabla NormaDecil limpiada exitosamente\n');
    } else {
      console.warn(`⚠️  Aún quedan ${countAfter} registros en la tabla\n`);
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  }
}

main();