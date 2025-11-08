import { createClient } from '@supabase/supabase-js';

interface TableInfo {
  table_name: string;
  table_schema: string;
}

const supabaseUrl = "https://ktqkijtkmlwagaxjyviy.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0cWtpanRrbWx3YWdheGp5dml5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDUzNjUwMSwiZXhwIjoyMDc2MTEyNTAxfQ.6f-gGS1jiTcvSV1_jTBwahWCmksE-SF2jJrsoB3TTjw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🔍 Diagnosticando estructura de base de datos...\n');

  try {
    // Intentar obtener información del schema
    console.log('📋 Intentando obtener lista de tablas...\n');

    // Método 1: Intentar con una tabla conocida
    const { error: testError } = await supabase
      .from('Cuestionario')
      .select('*')
      .limit(1);

    if (!testError) {
      console.log('✅ Tabla "Cuestionario" existe y es accesible');
    } else {
      console.log('❌ Tabla "Cuestionario" NO existe');
      console.log(`   Error: ${testError.message}\n`);
    }

    // Método 2: Intentar obtener información de schema
    console.log('\n📊 Intentando obtener información del schema...\n');
    
    const { data: schema, error: schemaError } = await supabase
      .rpc('get_schema_info');

    if (schemaError) {
      console.log('⚠️  RPC get_schema_info no disponible');
    } else if (schema) {
      console.log('✅ Información del schema:');
      console.log(JSON.stringify(schema, null, 2));
    }

    // Método 3: Intentar con información_schema
    console.log('\n📋 Intentando acceder a information_schema...\n');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'public')
      .limit(50);

    if (tablesError) {
      console.log('❌ No se puede acceder a information_schema');
      console.log(`   Error: ${tablesError.message}`);
    } else if (tables && tables.length > 0) {
      console.log('✅ Tablas en schema "public":');
      tables.forEach((t: TableInfo) => {
        console.log(`   - ${t.table_name}`);
      });
    } else {
      console.log('⚠️  No se encontraron tablas en schema "public"');
    }

    // Método 4: Intentar con diferentes esquemas
    console.log('\n🔎 Buscando en otros esquemas...\n');
    
    const { data: allTables, error: allTablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .limit(100);

    if (!allTablesError && allTables) {
      const schemas = new Set(allTables.map((t: TableInfo) => t.table_schema));
      console.log('✅ Esquemas encontrados:');
      schemas.forEach(schema => {
        console.log(`   - ${schema}`);
        const tablesInSchema = allTables.filter((t: TableInfo) => t.table_schema === schema);
        tablesInSchema.forEach((t: TableInfo) => {
          console.log(`      • ${t.table_name}`);
        });
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();