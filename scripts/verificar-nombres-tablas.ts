import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

interface TableInfo {
  table_name: string;
}

// Cargar variables de entorno
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

async function main() {
  console.log('🔍 Verificando nombres de tablas en Supabase...\n');

  try {
    // Intentar con diferentes variaciones
    const tablesToCheck = [
      'Cuestionario',
      'cuestionario',
      'Invitacion',
      'invitacion',
      'Evaluado',
      'evaluado',
      'Resultado',
      'resultado'
    ];

    for (const tableName of tablesToCheck) {
      try {
        const { error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (!error) {
          console.log(`✅ Tabla encontrada: "${tableName}"`);
        } else if (error.code === 'PGRST116') {
          console.log(`✅ Tabla encontrada (vacía): "${tableName}"`);
        } else {
          console.log(`❌ Tabla no encontrada: "${tableName}" - Error: ${error.message}`);
        }
      } catch (err) {
        console.log(`❌ Error al verificar "${tableName}": ${err}`);
      }
    }

    // Obtener lista de todas las tablas
    console.log('\n📋 Obteniendo lista de todas las tablas...\n');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.log('⚠️  No se pudo obtener lista de tablas automáticamente');
      console.log('   Intenta verificar manualmente en Supabase Dashboard');
    } else if (tables) {
      console.log('📊 Tablas disponibles en la BD:');
      tables.forEach((table: TableInfo) => {
        console.log(`   - ${table.table_name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();