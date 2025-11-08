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
  console.log('📋 Listando todas las tablas en Supabase...\n');

  try {
    // Usar RPC para obtener lista de tablas
    const { data, error } = await supabase.rpc('get_tables', {
      schema_name: 'public'
    });

    if (error) {
      console.log('⚠️  No se pudo usar RPC, intentando con query directa...\n');
      
      // Intentar con una query SQL directa
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      if (tablesError) {
        console.log('❌ Error:', tablesError.message);
        console.log('\n💡 Intenta esto en Supabase SQL Editor:');
        console.log('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\';');
      } else if (tables) {
        console.log('✅ Tablas encontradas:\n');
        tables.forEach((table: TableInfo) => {
          console.log(`   - ${table.table_name}`);
        });
      }
    } else if (data) {
      console.log('✅ Tablas encontradas:\n');
      data.forEach((table: TableInfo) => {
        console.log(`   - ${table.table_name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();