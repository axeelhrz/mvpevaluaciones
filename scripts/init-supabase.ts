import { supabaseAdmin } from '@/lib/supabase/server';

async function initSupabase() {
  console.log('🚀 Inicializando Supabase...');

  try {
    // Crear bucket para logos y imágenes de cuestionarios
    console.log('📦 Creando bucket de storage...');
    const { data: bucket, error: bucketError } = await supabaseAdmin.storage.createBucket('cuestionarios', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
    });

    if (bucketError && bucketError.message !== 'Bucket already exists') {
      throw bucketError;
    }

    console.log('✅ Bucket creado o ya existe');

    // Configurar políticas de storage
    console.log('🔐 Configurando políticas de storage...');
    
    // Política para lectura pública
    try {
      const { error: policyError } = await supabaseAdmin.rpc('create_storage_policy', {
        bucket_name: 'cuestionarios',
        policy_name: 'Public Access',
        definition: 'true'
      });
      if (policyError) {
        console.log('Política ya existe o no se pudo crear');
      }
    } catch (e) {
      console.log('Política ya existe o no se pudo crear');
    }

    console.log('✅ Supabase inicializado correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar Supabase:', error);
    throw error;
  }
}

initSupabase();
