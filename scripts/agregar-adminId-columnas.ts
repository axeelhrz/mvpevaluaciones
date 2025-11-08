import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

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
  console.log('🔧 Agregando columnas adminId a las tablas...\n');

  try {
    // SQL para agregar columnas
    const sqlQueries = [
      `ALTER TABLE "Cuestionario" ADD COLUMN IF NOT EXISTS "adminId" UUID REFERENCES auth.users(id) ON DELETE CASCADE;`,
      `ALTER TABLE "Invitacion" ADD COLUMN IF NOT EXISTS "adminId" UUID REFERENCES auth.users(id) ON DELETE CASCADE;`,
      `ALTER TABLE "Evaluado" ADD COLUMN IF NOT EXISTS "adminId" UUID REFERENCES auth.users(id) ON DELETE CASCADE;`,
      `ALTER TABLE "Resultado" ADD COLUMN IF NOT EXISTS "adminId" UUID REFERENCES auth.users(id) ON DELETE CASCADE;`,
      `CREATE INDEX IF NOT EXISTS idx_cuestionario_adminId ON "Cuestionario"("adminId");`,
      `CREATE INDEX IF NOT EXISTS idx_invitacion_adminId ON "Invitacion"("adminId");`,
      `CREATE INDEX IF NOT EXISTS idx_evaluado_adminId ON "Evaluado"("adminId");`,
      `CREATE INDEX IF NOT EXISTS idx_resultado_adminId ON "Resultado"("adminId");`
    ];

    for (const sql of sqlQueries) {
      console.log(`⏳ Ejecutando: ${sql.substring(0, 60)}...`);
      
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: sql
      });

      if (error) {
        // Si el RPC no existe, intentar con query directo
        console.log(`   ⚠️  RPC no disponible, intenta manualmente en Supabase SQL Editor`);
        break;
      } else {
        console.log(`   ✅ Ejecutado correctamente\n`);
      }
    }

    console.log('\n📝 Si el RPC no está disponible, copia y pega esto en Supabase SQL Editor:\n');
    console.log('------- SQL PARA EJECUTAR MANUALMENTE -------\n');
    sqlQueries.forEach(sql => console.log(sql));
    console.log('\n------- FIN SQL -------\n');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();