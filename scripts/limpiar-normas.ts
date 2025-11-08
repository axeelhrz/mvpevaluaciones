/**
 * Script para limpiar completamente la tabla NormaDecil
 * 
 * Uso:
 * npx tsx scripts/limpiar-normas.ts
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

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function main() {
  console.log('🗑️  Limpiando tabla NormaDecil...\n');

  try {
    // Contar registros antes
    const { count: countBefore } = await supabase
      .from('NormaDecil')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Registros actuales: ${countBefore || 0}`);

    // Eliminar todos los registros
    const { error } = await supabase
      .from('NormaDecil')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todos

    if (error) {
      console.error('❌ Error al eliminar registros:', error);
      process.exit(1);
    }

    // Verificar que se eliminaron
    const { count: countAfter } = await supabase
      .from('NormaDecil')
      .select('*', { count: 'exact', head: true });

    console.log(`✅ Registros después de limpiar: ${countAfter || 0}`);
    console.log('\n✅ Tabla NormaDecil limpiada exitosamente\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  }
}

main();
