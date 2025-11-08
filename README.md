# MVP Evaluaciones

Sistema de evaluaciones y cuestionarios personalizados construido con Next.js 15 y Supabase.

## 🚀 Características

### ✅ Sistema Base
- ✅ Cuestionarios personalizables con múltiples tipos de preguntas
- ✅ Sistema de invitaciones por email
- ✅ **Sistema de pares de preguntas con validación de integridad**
- ✅ **Normas decílicas para interpretación de resultados**
- ✅ Scoring automático con escalas y competencias
- ✅ Importación masiva de datos desde Excel con validaciones
- ✅ Panel de administración completo
- ✅ **Validación de datos en tiempo real**
- ✅ Diseño responsive con Tailwind CSS
- ✅ Base de datos PostgreSQL con Supabase

### ✨ Nuevas Funcionalidades (Fase 1)
- ✅ **Captura de datos estadísticos** - Formulario demográfico configurable
- ✅ **Reportes con gráficas** - PDFs profesionales con gráficas de barras y radar
- ✅ **Tablas comparativas** - Interpretación de resultados con normas
- ✅ **Gestión de versiones de normas** - Control de versiones y activación
- ✅ **Sistema de envío de reportes** - Envío automático por correo con PDF adjunto
- ✅ **Panel de configuración** - Configuración completa del sistema
- ✅ **Campos estadísticos configurables** - Define qué datos solicitar
- ✅ **Templates de reportes** - Múltiples plantillas personalizables

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase (gratuita)
- Cuenta de Resend (gratuita) - para envío de invitaciones

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd mvp-evaluaciones-main
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

#### a) Crear proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Espera a que el proyecto se inicialice (2-3 minutos)

#### b) Obtener credenciales

En tu proyecto de Supabase, ve a **Settings > API**:

- **Project URL**: `https://[PROJECT-REF].supabase.co`
- **anon/public key**: Clave pública para el cliente
- **service_role key**: Clave privada para operaciones del servidor

#### c) Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key-aqui"
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key-aqui"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Configuración de Resend para envío de emails
RESEND_API_KEY="re_tu_api_key_aqui"
RESEND_FROM_EMAIL="onboarding@resend.dev"
```

### 4. Configurar Resend (para envío de invitaciones)

El sistema de invitaciones requiere Resend para enviar correos electrónicos:

1. **Crea una cuenta gratuita** en [https://resend.com](https://resend.com)
2. **Obtén tu API Key** desde el dashboard
3. **Agrega la API Key** a tu archivo `.env.local`

📖 **Para instrucciones detalladas**, consulta: [CONFIGURACION_RESEND.md](./CONFIGURACION_RESEND.md)

**Inicio rápido con Resend:**
- El plan gratuito incluye 100 emails/día
- Usa `onboarding@resend.dev` para pruebas
- Para producción, verifica tu propio dominio

### 5. Crear las tablas en Supabase

**IMPORTANTE:** Ejecuta el script de actualización de base de datos:

Ve a **SQL Editor** en tu proyecto de Supabase y ejecuta el script completo que se encuentra en:

📄 **`scripts/database-updates.sql`**

Este script incluye:
- ✅ Todas las tablas base del sistema
- ✅ 6 nuevas tablas para funcionalidades extendidas
- ✅ Modificaciones a tablas existentes
- ✅ Índices y políticas RLS
- ✅ Datos iniciales (configuraciones, campos estadísticos, templates)

📖 **Para instrucciones detalladas**, consulta: [ACTUALIZACION_BASE_DATOS.md](./ACTUALIZACION_BASE_DATOS.md)

### 6. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📚 Documentación Adicional

- **[Funcionalidades Implementadas](./FUNCIONALIDADES_IMPLEMENTADAS.md)**: Documentación completa de todas las funcionalidades
- **[Sistema de Pares y Normas](./SISTEMA_PARES_Y_NORMAS.md)**: Documentación sobre preguntas pareadas y normas decílicas
- **[Actualización de Base de Datos](./ACTUALIZACION_BASE_DATOS.md)**: Guía para aplicar las actualizaciones de BD
- **[Configuración de Resend](./CONFIGURACION_RESEND.md)**: Guía para configurar el envío de emails

## 🎯 Características Principales

### Sistema de Pares de Preguntas

El sistema implementa un modelo de evaluación basado en **preguntas pareadas** (pares de reactivos):

- ✅ Cada par contiene exactamente 2 reactivos (ordenEnPar 1 y 2)
- ✅ Los pares son **indivisibles** y se mantienen como bloques
- ✅ Validación automática de integridad de pares
- ✅ Detección de pares incompletos o mal formados
- ✅ Sistema de scoring que respeta la estructura de pares

### Sistema de Normas Decílicas

Convierte puntajes naturales a deciles (1-10) para interpretación estandarizada:

- ✅ Normas por escala y competencia
- ✅ 10 deciles completos (1-10)
- ✅ Validación de rangos crecientes
- ✅ **Versionado de normas** - Control de versiones activas
- ✅ Gestión de normas desde la interfaz
- ✅ Importación/exportación de normas

### Captura de Datos Estadísticos

Sistema configurable para recopilar información demográfica:

- ✅ **Formulario dinámico** basado en configuración
- ✅ **5 tipos de campos**: Texto, Número, Fecha, Selección, Selección Múltiple
- ✅ **Campos configurables** desde el panel de administración
- ✅ **Validación automática** de campos requeridos
- ✅ **Integrado en el flujo** - Se muestra antes del cuestionario

### Reportes con Gráficas y Tablas

PDFs profesionales con visualización de datos:

- ✅ **Portada profesional** con diseño moderno
- ✅ **Gráficas de barras** para escalas (hasta 20 escalas)
- ✅ **Gráfica de radar** para competencias (8 competencias)
- ✅ **Tablas comparativas** con interpretaciones
- ✅ **Datos estadísticos** incluidos en el reporte
- ✅ **Secciones personalizables** (introducción, conclusiones)
- ✅ **Colores personalizables** por template
- ✅ **Interpretación de deciles** (Muy Alto, Alto, Medio, Bajo, Muy Bajo)

### Sistema de Envío de Reportes

Envío automático de reportes por correo:

- ✅ **Envío a múltiples destinatarios**
- ✅ **PDF adjunto** en el correo
- ✅ **Template de correo profesional**
- ✅ **Mensajes personalizables**
- ✅ **Registro de envíos** exitosos y fallidos
- ✅ **Políticas de entrega**:
  - Solo disponible para admin
  - Envío automático al evaluado
  - Envío a tercero

### Panel de Configuración

Configuración completa del sistema:

- ✅ **Configuración General**: Correo admin, precio de evaluación
- ✅ **Campos Estadísticos**: Crear, editar, eliminar campos demográficos
- ✅ **Reportes**: Política de entrega por defecto
- ✅ **Notificaciones**: Configurar notificaciones por correo

### Validación de Datos

Sistema completo de validación en múltiples niveles:

- ✅ **Validación en importación**: Verifica estructura antes de importar
- ✅ **Validación de datos existentes**: Endpoint `/api/admin/validate-data`
- ✅ **Validación en scoring**: Solo procesa pares completos y válidos
- ✅ **Interfaz de validación**: Panel en `/admin/normas`

## 📧 Envío de Invitaciones

Para enviar invitaciones por correo electrónico:

1. **Configura Resend** siguiendo las instrucciones en [CONFIGURACION_RESEND.md](./CONFIGURACION_RESEND.md)
2. **Accede a** `/admin/generar-invitacion`
3. **Completa el formulario** con nombre y correo del evaluado
4. **Envía la invitación** - el evaluado recibirá un correo con un enlace único

El enlace de invitación:
- ✅ Es único para cada evaluado
- ✅ Expira en 30 días
- ✅ Reemplaza invitaciones anteriores del mismo evaluado

## 📁 Estructura del Proyecto

```
mvp-evaluaciones-main/
├── app/                          # Rutas de Next.js 15 (App Router)
│   ├── api/                      # API Routes
│   │   ├── admin/                # Endpoints de administración
│   │   ├── cuestionarios/        # CRUD de cuestionarios
│   │   ├── preguntas/            # CRUD de preguntas
│   │   ├── respuestas/           # Manejo de respuestas
│   │   ├── invitaciones/         # Gestión de invitaciones
│   │   ├── datos-estadisticos/   # 🆕 Datos demográficos
│   │   ├── campos-estadisticos/  # 🆕 Configuración de campos
│   │   ├── configuracion/        # 🆕 Configuración del sistema
│   │   ├── templates-reporte/    # 🆕 Templates de PDF
│   │   └── versiones-norma/      # 🆕 Versionado de normas
│   ├── admin/                    # Panel de administración
│   │   ├── cuestionarios/        # Gestión de cuestionarios
│   │   ├── evaluados/            # Lista de evaluados
│   │   ├── invitaciones/         # Lista de invitaciones
│   │   ├── generar-invitacion/   # Envío de invitaciones
│   │   ├── reportes/             # Gestión de reportes
│   │   ├── normas/               # 🆕 Gestión de versiones de normas
│   │   └── configuracion/        # 🆕 Panel de configuración
│   ├── cuestionario/             # Vista pública de cuestionarios
│   └── layout.tsx                # Layout principal
├── components/                   # Componentes React
│   ├── ui/                       # Componentes de UI (shadcn)
│   ├── sidebar/                  # Componentes del sidebar
│   └── cuestionario/             # Componentes de cuestionarios
│       └── formulario-datos-estadisticos.tsx  # 🆕 Formulario demográfico
├── lib/                          # Utilidades y configuración
│   ├── supabase/                 # Cliente de Supabase
│   │   ├── client.ts             # Cliente para el navegador
│   │   ├── server.ts             # Cliente para el servidor
│   │   └── db.ts                 # Funciones helper de BD (actualizado)
│   ├── scoring.ts                # Sistema de puntuación con validación
│   ├── chart-generator.ts        # 🆕 Generador de gráficas 
│   ├── pdf-generator-unified.ts  # ✨ Generador de PDF unificado y profesional
│   └── utils.ts                  # Utilidades generales
├── hooks/                        # Custom React Hooks
├── public/                       # Archivos estáticos
├── scripts/                      # Scripts de utilidad
│   └── database-updates.sql      # 🆕 Script de actualización de BD
├── FUNCIONALIDADES_IMPLEMENTADAS.md  # 🆕 Documentación completa
├── ACTUALIZACION_BASE_DATOS.md       # 🆕 Guía de actualización de BD
├── SISTEMA_PARES_Y_NORMAS.md         # Documentación del sistema de pares
├── CONFIGURACION_RESEND.md           # Guía de configuración de Resend
└── .env.local                        # Variables de entorno
```

## 🎯 Uso

### Panel de Administración

#### Cuestionarios
Accede a `/admin/cuestionarios` para:
- Crear y gestionar cuestionarios
- Agregar preguntas personalizadas
- Ver resultados

#### Evaluados
Accede a `/admin/evaluados` para:
- Ver lista de evaluados
- Descargar PDFs individuales
- Enviar reportes por correo
- Exportar CSV (puntajes naturales y deciles)

#### Invitaciones
Accede a `/admin/invitaciones` para:
- Ver todas las invitaciones
- Generar nuevas invitaciones
- Ver estado de invitaciones

#### Normas (🆕)
Accede a `/admin/normas` para:
- Ver versiones de normas
- Crear nuevas versiones
- Activar/desactivar versiones
- Ver historial de cambios

#### Configuración (🆕)
Accede a `/admin/configuracion` para:
- Configurar datos del sistema
- Gestionar campos estadísticos
- Configurar políticas de reportes
- Configurar notificaciones

### Tipos de Preguntas Soportados

- **Elección Forzada**: Par de opciones (A o B)
- **Likert**: Escala de 1-5, 1-7, etc.
- **Opción Múltiple**: Varias opciones, una respuesta
- **Selección Múltiple**: Varias opciones, múltiples respuestas
- **Texto Corto**: Respuesta de texto corto
- **Texto Largo**: Respuesta de texto largo (textarea)
- **Escala Numérica**: Escala numérica personalizable
- **Sí/No**: Pregunta binaria

### Importación de Datos

Puedes importar escalas, competencias, reactivos y normas desde un archivo Excel:

1. Ve a `/admin/import`
2. Sube un archivo `.xlsx` con las hojas requeridas:
   - **Escalas**: `codigo`, `nombre`
   - **Competencias**: `codigo`, `nombre`
   - **CompEscalas**: `competenciaCodigo`, `escalaCodigo`, `peso`
   - **Reactivos**: `pairId`, `ordenEnPar`, `tipo`, `escalaCodigo`, `texto`, `puntosSiElegido`, `puntosSiNoElegido`
   - **NormaDecil**: `targetTipo`, `targetCodigo`, `decil`, `puntajeMin`

## 🔧 Tecnologías

- **Framework**: Next.js 15 (App Router)
- **Base de Datos**: PostgreSQL (Supabase)
- **Estilos**: Tailwind CSS 4
- **UI Components**: Radix UI + shadcn/ui
- **Validación**: Zod
- **Email**: Resend
- **Excel**: xlsx
- **Gráficas**: Chart.js + chartjs-node-canvas (🆕)
- **PDF**: jsPDF + jspdf-autotable

## 🚀 Despliegue

### Vercel (Recomendado)

1. Sube tu código a GitHub
2. Importa el proyecto en [Vercel](https://vercel.com)
3. Configura las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
4. Despliega

### Otras Plataformas

El proyecto es compatible con cualquier plataforma que soporte Next.js 15:
- Netlify
- Railway
- Render
- AWS Amplify

## 📊 Estado del Proyecto

### Fase 1 - MVP: 90% Completo

✅ **Completado:**
- Sistema base de cuestionarios
- Captura de datos estadísticos
- Reportes con gráficas y tablas
- Gestión de versiones de normas
- Sistema de envío de reportes
- Panel de configuración completo
- Versionado de normas

⏳ **Pendiente:**
- Integración con Stripe para pagos
- Filtros avanzados en panel de evaluados
- Búsqueda por características demográficas

### Próximas Fases

**Fase 2:**
- Panel de usuario con compra de reportes adicionales
- Nuevos templates de reportes
- Exportaciones filtradas
- Integración con Kajabi
- Constructor automático de normas

**Fase 3:**
- Multi-idioma (inglés)
- Panel de empresas
- Paquetes y créditos
- Estadísticas avanzadas
- Editor de normas en panel
- Integración con sistemas externos

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 🐛 Reporte de Bugs

Si encuentras un bug, por favor abre un issue en GitHub con:
- Descripción del problema
- Pasos para reproducirlo
- Comportamiento esperado vs actual
- Screenshots (si aplica)

## 📞 Soporte

Para preguntas o soporte, abre un issue en GitHub.

---

Desarrollado con ❤️ usando Next.js y Supabase