# 🔐 Aislamiento de Sesiones por Usuario

## Problema Actual

Actualmente, todas las cuentas de admin ven los mismos datos:
- Mismas invitaciones
- Mismos cuestionarios
- Mismos evaluados
- Mismos resultados

Esto ocurre porque **no hay filtrado por usuario** en las consultas a la base de datos.

## Solución Requerida

Implementar aislamiento de datos por usuario autenticado. Cada admin solo verá sus propios datos.

---

## 📋 Cambios Necesarios

### 1. Agregar Campo `adminId` a las Tablas

Las siguientes tablas necesitan un campo `adminId` para asociar datos con el usuario:

```sql
-- Tabla Cuestionario
ALTER TABLE "Cuestionario" ADD COLUMN "adminId" UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Tabla Invitacion
ALTER TABLE "Invitacion" ADD COLUMN "adminId" UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Tabla Evaluado
ALTER TABLE "Evaluado" ADD COLUMN "adminId" UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Tabla Resultado
ALTER TABLE "Resultado" ADD COLUMN "adminId" UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Crear índices para mejor rendimiento
CREATE INDEX idx_cuestionario_adminId ON "Cuestionario"("adminId");
CREATE INDEX idx_invitacion_adminId ON "Invitacion"("adminId");
CREATE INDEX idx_evaluado_adminId ON "Evaluado"("adminId");
CREATE INDEX idx_resultado_adminId ON "Resultado"("adminId");
```

### 2. Actualizar Funciones de Base de Datos

Modificar todas las funciones en `lib/supabase/db.ts` para filtrar por `adminId`:

#### Ejemplo: `getAllInvitaciones()`

```typescript
// ❌ ACTUAL (sin filtro)
export async function getAllInvitaciones() {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Invitacion')
    .select(`...`)
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return data;
}

// ✅ NUEVO (con filtro por usuario)
export async function getAllInvitaciones(adminId: string) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Invitacion')
    .select(`...`)
    .eq('adminId', adminId)  // ← Filtro por usuario
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return data;
}
```

### 3. Actualizar Endpoints API

Todos los endpoints deben obtener el `adminId` del usuario autenticado:

```typescript
// Ejemplo: app/api/invitaciones/route.ts

import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // ✅ Obtener usuario autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // ✅ Pasar adminId a la función
    const invitaciones = await getAllInvitaciones(user.id);
    return NextResponse.json(invitaciones);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: "Error al obtener invitaciones" },
      { status: 500 }
    );
  }
}
```

### 4. Actualizar Creación de Datos

Al crear nuevos registros, incluir el `adminId`:

```typescript
// Ejemplo: Crear invitación

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // ✅ Obtener usuario autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const { nombre, correo, ... } = await req.json();

    // ... validaciones ...

    // ✅ Incluir adminId al crear
    const inv = await createInvitacion({
      evaluadoId: evaluado.id,
      cuestionarioId: cuestionario.id,
      adminId: user.id,  // ← Agregar adminId
      fechaExpiracion: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      politicaEntrega,
      correoTercero: politicaEntrega === "TERCERO" ? correoTercero : null,
    });

    return NextResponse.json({ ok: true, invitacionId: inv.id });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: "Error al crear invitación" },
      { status: 500 }
    );
  }
}
```

---

## 🔧 Funciones a Actualizar

### En `lib/supabase/db.ts`:

| Función | Cambio |
|---------|--------|
| `getAllInvitaciones()` | Agregar parámetro `adminId` y filtro |
| `getAllEvaluados()` | Agregar parámetro `adminId` y filtro |
| `getCuestionarios()` | Agregar parámetro `adminId` y filtro |
| `getResultadoByEvaluadoId()` | Agregar parámetro `adminId` y filtro |
| `createInvitacion()` | Incluir `adminId` en datos |
| `createCuestionario()` | Incluir `adminId` en datos |
| `upsertEvaluado()` | Incluir `adminId` en datos |
| `createResultado()` | Incluir `adminId` en datos |

### En endpoints API:

| Endpoint | Cambio |
|----------|--------|
| `GET /api/invitaciones` | Obtener `adminId` y pasar a función |
| `POST /api/invitaciones` | Incluir `adminId` al crear |
| `GET /api/cuestionarios` | Obtener `adminId` y pasar a función |
| `GET /api/evaluados` | Obtener `adminId` y pasar a función |
| `GET /api/cuestionarios/estadisticas` | Filtrar por `adminId` |

---

## 📊 Ejemplo Completo: Invitaciones

### 1. Actualizar función DB

```typescript
// lib/supabase/db.ts
export async function getAllInvitaciones(adminId: string) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Invitacion')
    .select(`
      *,
      evaluado:Evaluado(*),
      cuestionario:Cuestionario(id, titulo)
    `)
    .eq('adminId', adminId)  // ← Filtro
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return data;
}
```

### 2. Actualizar endpoint GET

```typescript
// app/api/invitaciones/route.ts
export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const invitaciones = await getAllInvitaciones(user.id);
    return NextResponse.json(invitaciones);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: "Error al obtener invitaciones" },
      { status: 500 }
    );
  }
}
```

### 3. Actualizar endpoint POST

```typescript
// app/api/invitaciones/route.ts
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const { nombre, correo, politicaEntrega, correoTercero } = await req.json();

    // ... validaciones ...

    const evaluado = await upsertEvaluado(correo, nombre, user.id);
    
    await updateInvitacionesEstado(evaluado.id, "expirada", user.id);

    const inv = await createInvitacion({
      evaluadoId: evaluado.id,
      cuestionarioId: cuestionario.id,
      adminId: user.id,  // ← Agregar
      fechaExpiracion: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      politicaEntrega,
      correoTercero: politicaEntrega === "TERCERO" ? correoTercero : null,
    });

    return NextResponse.json({ ok: true, invitacionId: inv.id });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: "Error al crear invitación" },
      { status: 500 }
    );
  }
}
```

---

## 🚀 Plan de Implementación

### Fase 1: Base de Datos
1. [ ] Agregar columna `adminId` a todas las tablas
2. [ ] Crear índices para mejor rendimiento
3. [ ] Migrar datos existentes (asignar a un admin por defecto)

### Fase 2: Funciones de BD
1. [ ] Actualizar `getAllInvitaciones()`
2. [ ] Actualizar `getAllEvaluados()`
3. [ ] Actualizar `getCuestionarios()`
4. [ ] Actualizar `getResultadoByEvaluadoId()`
5. [ ] Actualizar funciones de creación

### Fase 3: Endpoints API
1. [ ] Actualizar `GET /api/invitaciones`
2. [ ] Actualizar `POST /api/invitaciones`
3. [ ] Actualizar `GET /api/cuestionarios`
4. [ ] Actualizar `GET /api/evaluados`
5. [ ] Actualizar `GET /api/cuestionarios/estadisticas`

### Fase 4: Páginas Frontend
1. [ ] Verificar que las páginas usan los datos filtrados
2. [ ] Probar con múltiples usuarios

---

## ✅ Beneficios

✅ Cada admin solo ve sus propios datos  
✅ Datos completamente aislados por sesión  
✅ Seguridad mejorada  
✅ Multi-tenancy real  
✅ Escalable para múltiples organizaciones  

---

## ⚠️ Consideraciones

- **Migración de datos**: Los datos existentes necesitarán ser asignados a un admin
- **Backward compatibility**: Algunos endpoints pueden necesitar actualización
- **Testing**: Probar con múltiples usuarios simultáneamente
- **Performance**: Los índices son críticos para buen rendimiento