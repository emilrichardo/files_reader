# 📄 Aplicación Web para Gestión de Documentos – Especificación Completa del Prompt

## 🔹 Objetivo

Construir una aplicación web tipo dashboard para subir y estructurar información extraída de documentos como PDF, JPG, PNG, DOC, etc. La interfaz permitirá definir campos personalizados, ver metadatos, guardar plantillas reutilizables y gestionar configuraciones específicas por usuario con persistencia real en base de datos Supabase.

## 🔹 Tecnologías Utilizadas

La aplicación está desarrollada utilizando las siguientes tecnologías:

- **Next.js 14+**: Framework de React con App Router
- **Supabase**: Base de datos PostgreSQL con autenticación
- **shadcn/ui**: Componentes de interfaz de usuario para un diseño limpio y funcional
- **Tailwind CSS**: Framework de estilos para diseño responsivo y personalizado
- **TypeScript**: Lenguaje tipado para mayor seguridad y escalabilidad
- **Lucide React**: Iconografía moderna
- **Radix UI**: Primitivos de UI accesibles

## 🔹 Estructura de Base de Datos

### **Esquema de Supabase**

\`\`\`sql
-- Tabla de configuraciones de usuario
CREATE TABLE user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_name TEXT NOT NULL DEFAULT 'Mi Proyecto',
    api_endpoint TEXT,
    api_keys JSONB DEFAULT '{}',
    theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    color_scheme TEXT NOT NULL DEFAULT 'blue',
    custom_color TEXT,
    font_family TEXT NOT NULL DEFAULT 'Inter',
    style_mode TEXT NOT NULL DEFAULT 'flat',
    company_logo TEXT,
    company_logo_type TEXT CHECK (company_logo_type IN ('jpg', 'png', 'svg')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Tabla de plantillas
CREATE TABLE templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fields JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de documentos
CREATE TABLE documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fields JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de filas de documentos
CREATE TABLE document_rows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}',
    file_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### **Políticas de Seguridad (RLS)**
- Cada tabla tiene políticas que permiten solo acceso a datos del usuario autenticado
- Relaciones en cascada para mantener integridad referencial
- Índices optimizados para consultas frecuentes

## 🔹 Estructura del Proyecto

### **Contextos y Providers**
- `AuthProvider`: Manejo de autenticación con Supabase
- `AppProvider`: Estado global de documentos y plantillas con sincronización BD
- `ThemeProvider`: Gestión de temas y colores personalizados
- Sistema de notificaciones con `useToast`

### **Tipos de Datos (lib/types.ts)**
\`\`\`typescript
interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
}

interface Document {
  id: string
  name: string
  description?: string
  user_id: string
  fields: DocumentField[]
  rows: DocumentRow[]
  created_at: string
  updated_at: string
}

interface DocumentField {
  id: string
  field_name: string
  type: "text" | "date" | "number" | "boolean" | "email" | "url"
  description?: string
  formats?: string[]
  required: boolean
  order: number
}

interface DocumentRow {
  id: string
  document_id: string
  data: Record<string, any>
  file_metadata?: FileMetadata
  created_at: string
}

interface FileMetadata {
  filename: string
  file_size: number
  file_type: string
  upload_date: string
  file_url?: string
}

interface Template {
  id: string
  name: string
  description?: string
  user_id: string
  fields: DocumentField[]
  created_at: string
}

interface UserSettings {
  id: string
  user_id: string
  project_name: string
  api_endpoint?: string
  api_keys: Record<string, string>
  theme: "light" | "dark"
  color_scheme: string
  custom_color?: string
  font_family: string
  style_mode: string
  company_logo?: string
  company_logo_type?: string
  updated_at: string
}
\`\`\`

## 🔹 Interfaz y Navegación

### **Sidebar Navigation**
Navegación lateral izquierda con las siguientes secciones:
- **Home**: Dashboard principal
- **Documents**: Lista de documentos
- **Create New Document**: Crear nuevo documento
- **Templates**: Gestión de plantillas
- **Settings**: Configuraciones de usuario
- **(parte inferior)** Iniciar/Cerrar sesión con Google

### **Responsive Design**
- Sidebar colapsible en móvil con hamburger menu
- Diseño adaptativo para todas las pantallas
- Overlay para móvil cuando el sidebar está abierto
- Colores dinámicos basados en configuración del usuario

## 🔹 Páginas Principales

### **🏠 Home (app/page.tsx)**
- **Saludo personalizado** al usuario autenticado
- **Cards de acciones rápidas**:
  - Crear Nuevo Documento (destacado)
  - Contador de documentos totales
  - Actividad reciente
- **Lista de documentos recientes** (últimos 3 editados)
- **Botón "Ver todos los documentos"**
- **Estado vacío** para usuarios nuevos con onboarding

### **📄 Documents (app/documents/page.tsx)**
- **Lista completa** de documentos con cards
- **Funcionalidades de búsqueda y filtrado**:
  - Búsqueda por nombre y descripción
  - Ordenamiento por fecha, nombre
  - Orden ascendente/descendente
- **Información por documento**:
  - Nombre y descripción
  - Número de entradas y archivos
  - Fechas de creación y actualización
  - Preview de campos definidos
- **Menú de acciones** por documento:
  - Ver detalles
  - Editar
  - Eliminar (con confirmación)

### **📝 Create New Document (app/documents/create/page.tsx)**

#### **Información Inicial**
- **Título editable** (click para editar, por defecto "Nuevo Documento")
- **Descripción opcional** del proyecto

#### **Gestión de Plantillas**
- **Selector de plantillas** existentes para cargar campos
- **Botón "Guardar Plantilla"** para guardar estructura actual
- **Modal de guardado** con nombre y descripción

#### **Tabla de Campos Editable**
- **Tabla dinámica** al estilo Notion
- **Campo inicial** precargado: `document_title` como ejemplo
- **Cada columna representa un campo** con:
  - `field_name` (obligatorio)
  - `type` (text, date, number, boolean, email, url)
  - `formats` (valores separados por comas)
  - `description` (opcional)
  - `required` (checkbox)
- **Acciones**: Agregar, editar, eliminar columnas
- **Validaciones**: Nombres obligatorios, tipos válidos

#### **Entrada Manual de Filas**
- **Agregar filas manualmente** completando datos por columna
- **Edición inline** de cada celda
- **Eliminación** de filas individuales
- **Tabla responsive** con scroll horizontal

#### **Carga de Archivos**
- **Zona de drag & drop** debajo de la tabla
- **Soporte para**: PDF, JPG, PNG, DOC, DOCX
- **Proceso de carga completo**:
  1. Validación del nombre del documento y campos definidos
  2. Creación automática del documento si no existe
  3. Simulación de procesamiento con barra de progreso
  4. Extracción inteligente de datos basada en campos definidos y tipo de documento
  5. Modal de vista previa con datos extraídos y campos editables
  6. Validación de campos requeridos
  7. Confirmación y agregado a la tabla de datos
  8. Notificación de éxito con detalles del procesamiento

#### **Modal de Preview de Archivos**
- **Interfaz mejorada** con información completa del archivo
- **Campos extraídos editables** con validación en tiempo real
- **Tooltips** con descripciones de campos al pasar el mouse
- **Indicadores visuales** para campos requeridos
- **Botones de acción claros**: Cancelar, Confirmar y Agregar
- **Manejo de estado optimizado** para evitar loops y problemas de renderizado

#### **Exportación**
- **Selector de formato**: CSV, PDF, Excel
- **Simulación** de descarga con notificación

### **👁️ Document Detail (app/documents/[id]/page.tsx)**

#### **Estructura Simplificada**
1. **Nombre del documento editable**:
   - Click para editar inline
   - Guardado automático al perder foco (onBlur)
   - Botones guardar/cancelar visibles durante edición

2. **Estructura de campos (colapsable)**:
   - **Colapsada por defecto** con indicador de cantidad de campos
   - **Botón expandir/colapsar** con ícono
   - **Vista de solo lectura** por defecto
   - **Botón "Editar Campos"** para modificar estructura
   - **Selector de plantillas** para cargar estructura predefinida
   - **Botón "Guardar Plantilla"** para guardar estructura actual

3. **Tabla de datos principal**:
   - **Filas guardadas** (fondo verde claro)
   - **Filas pendientes** (fondo amarillo claro) 
   - **Botón "Guardar"** individual para cada fila pendiente
   - **Contador** de filas guardadas/pendientes
   - **Edición inline** de datos existentes
   - **Eliminación** de filas con confirmación

4. **Acciones de datos**:
   - **Botón "Agregar Fila"** para entrada manual
   - **Zona de drag & drop** para carga de archivos
   - **Modal de confirmación** para archivos subidos
   - **Botón "Exportar"** con opciones de formato

#### **Funcionalidades Avanzadas**
- **Guardado automático** de cambios en filas existentes
- **Estados visuales claros** para filas pendientes vs guardadas
- **Validación** de campos requeridos
- **Persistencia real** en base de datos Supabase
- **Sincronización** automática entre pestañas

### **✏️ Document Edit (app/documents/[id]/edit/page.tsx)**
- **Edición** de nombre y descripción del documento
- **Información** del documento (campos, entradas, fechas)
- **Validaciones** y guardado

### **📋 Templates (app/templates/page.tsx)**
- **Lista de plantillas** con búsqueda y filtrado
- **Información por plantilla**:
  - Nombre, descripción, fecha de creación
  - Número de campos definidos
  - Preview de campos
- **Acciones por plantilla**:
  - Crear documento desde plantilla
  - Duplicar plantilla
  - Editar plantilla
  - Eliminar plantilla
- **Modal de creación** de documento desde plantilla

### **➕ Create Template (app/templates/create/page.tsx)**
- **Información básica**: nombre y descripción
- **Definición de campos** igual que en crear documento
- **Validaciones** y guardado

### **⚙️ Settings (app/settings/page.tsx)**

#### **Perfil de Usuario**
- **Información** del usuario autenticado
- **Avatar** con inicial del email

#### **Configuración de APIs**
- **Endpoint de API** para procesamiento de archivos (POST)
- **Gestión dinámica de API Keys**:
  - OpenAI, Google Vision, Supabase (predefinidas)
  - Agregar nuevas API keys dinámicamente
  - Mostrar/ocultar valores
  - Eliminar API keys
- **Formulario** para agregar nuevas keys

#### **Apariencia**
- **Toggle de modo oscuro** (funcional)
- **Selector de esquema de colores**: Negro, Azul, Verde, Púrpura, Rojo
- **Subida de logo** de empresa con preview
- **Eliminación** de logo

#### **Persistencia**
- **Guardado en Supabase** para usuarios autenticados
- **Solo en memoria** para usuarios no autenticados
- **Carga automática** al inicializar
- **Notificación** de guardado exitoso

## 🔹 Componentes Especializados

### **FileUploadProgress**
- **Barra de progreso** animada
- **Información** del archivo siendo procesado
- **Botón de cancelación** opcional

### **FilePreviewModal**
- **Modal responsive** con scroll
- **Información del archivo** subido
- **Campos editables** basados en estructura definida
- **Validación** de campos requeridos
- **Manejo de estado** optimizado para evitar loops

### **Sidebar**
- **Navegación responsive** con estado colapsible
- **Indicador de página activa**
- **Sección de usuario** con información y logout
- **Overlay para móvil**
- **Colores dinámicos** basados en configuración

### **ThemeLoader**
- **Carga de configuración** de usuario al inicializar
- **Aplicación de estilos** dinámicos
- **Sincronización** con base de datos

## 🔹 Funcionalidades Avanzadas

### **Sistema de Notificaciones**
- **Hook useToast** completo con gestión de estado
- **Componentes Toast** con Radix UI
- **Variantes**: default, destructive
- **Auto-dismiss** configurable
- **Posicionamiento** responsive

### **Gestión de Estado**
- **Context API** para estado global
- **Supabase** para persistencia real
- **Sincronización** automática con BD
- **Operaciones CRUD** completas

### **Simulación de Extracción de Datos**
- **Algoritmo inteligente** basado en nombres de campos
- **Datos realistas** según el tipo de campo
- **Mapeo automático** de archivos a campos

### **Validaciones y Manejo de Errores**
- **Validación** de formularios en tiempo real
- **Mensajes de error** descriptivos
- **Confirmaciones** para acciones destructivas
- **Estados de carga** apropiados

### **Colores Dinámicos**
- **Función getPrimaryButtonStyles()** para botones principales
- **Aplicación automática** del color de configuración
- **Consistencia visual** en toda la aplicación
- **Soporte para colores personalizados**

## 🔹 Estilos y Diseño

### **Tema Visual**
- **Colores dinámicos** basados en configuración del usuario
- **Tipografía**: Inter (sans-serif)
- **Gradientes sutiles** desde color principal hacia gris
- **Modo claro/oscuro** funcional

### **Componentes UI**
- **shadcn/ui** como base
- **Customización** con Tailwind CSS
- **Iconos** de Lucide React
- **Animaciones** suaves y profesionales

### **Responsive Design**
- **Mobile-first** approach
- **Breakpoints** estándar de Tailwind
- **Navegación adaptativa**
- **Tablas** con scroll horizontal en móvil

## 🔹 Estructura de Archivos Requerida

\`\`\`
app/
├── layout.tsx (con AuthProvider, AppProvider, ThemeProvider, Sidebar, Toaster)
├── page.tsx (Home)
├── documents/
│   ├── page.tsx (Lista de documentos)
│   ├── create/page.tsx (Crear documento)
│   ├── [id]/page.tsx (Detalle de documento)
│   └── [id]/edit/page.tsx (Editar documento)
├── templates/
│   ├── page.tsx (Lista de plantillas)
│   └── create/page.tsx (Crear plantilla)
├── settings/page.tsx
├── auth/callback/page.tsx
└── globals.css

components/
├── sidebar.tsx
├── file-upload-progress.tsx
├── file-preview-modal.tsx
├── theme-loader.tsx
├── auth-guard.tsx
└── ui/ (shadcn components)

contexts/
├── auth-context.tsx
├── app-context.tsx
└── theme-context.tsx

hooks/
├── use-toast.ts
├── use-file-upload.ts
└── use-dynamic-styles.ts

lib/
├── types.ts
├── database.ts
├── supabase.ts
└── theme.ts
\`\`\`

## 🔹 Configuración de Supabase

### **Variables de Entorno**
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

### **Configuración de Autenticación**
- **Google OAuth** configurado
- **Redirect URLs** apropiadas
- **Políticas RLS** habilitadas

### **Funciones de Base de Datos**
- **CRUD operations** para todas las entidades
- **Manejo de errores** robusto
- **Logging** detallado para debugging
- **Transacciones** para operaciones complejas

## 🔹 Datos Mock para Desarrollo

### **Documentos de Ejemplo**
1. **Facturas Diciembre 2024** - Con campos de facturación
2. **Contratos de Clientes** - Con información contractual
3. **Inventario de Productos** - Control de stock

### **Plantillas Predefinidas**
1. **Plantilla de Facturas** - Estructura estándar
2. **Plantilla de Contratos** - Documentos contractuales

## 🔹 Funcionalidades Específicas a Implementar

### **Autenticación con Supabase**
- **Google OAuth** funcional
- **Gestión de sesión** automática
- **Redirecciones** apropiadas
- **Estados de carga** durante autenticación

### **Gestión de Documentos**
- **CRUD completo** con validaciones
- **Búsqueda y filtrado** avanzado
- **Exportación** simulada
- **Persistencia real** en Supabase

### **Sistema de Plantillas**
- **Creación** desde cero o desde documento
- **Aplicación** a nuevos documentos
- **Gestión completa** con CRUD
- **Sincronización** con base de datos

### **Carga de Archivos**
- **Drag & drop** funcional
- **Múltiples formatos** soportados
- **Progreso visual** de carga
- **Extracción simulada** inteligente
- **Modal de confirmación** con datos editables

### **Configuraciones Avanzadas**
- **API keys** dinámicas
- **Personalización** visual completa
- **Persistencia** en Supabase para usuarios autenticados
- **Aplicación automática** de estilos

## 🔹 Consideraciones Técnicas

### **Performance**
- **useCallback** para funciones costosas
- **useMemo** para cálculos complejos
- **Lazy loading** donde sea apropiado
- **Optimistic updates** para mejor UX

### **Accesibilidad**
- **ARIA labels** apropiados
- **Navegación por teclado**
- **Contraste** adecuado
- **Componentes** accesibles de Radix UI

### **Manejo de Errores**
- **Try-catch** en operaciones críticas
- **Fallbacks** para estados de error
- **Logging** detallado para debugging
- **Notificaciones** de error claras

### **Estado y Persistencia**
- **Supabase** para datos persistentes
- **Context API** para estado global
- **Sincronización** automática
- **Manejo de offline** básico

### **Seguridad**
- **Row Level Security** en Supabase
- **Validación** en cliente y servidor
- **Sanitización** de inputs
- **Políticas** de acceso apropiadas

## 🔹 Instrucciones de Implementación

1. **Configurar** Supabase con autenticación Google
2. **Crear** la estructura de base de datos con RLS
3. **Configurar** Next.js con TypeScript y Tailwind
4. **Instalar** shadcn/ui y configurar componentes
5. **Implementar** los contextos de autenticación, aplicación y tema
6. **Crear** los tipos de datos en lib/types.ts
7. **Desarrollar** las funciones de base de datos en lib/database.ts
8. **Implementar** los componentes de UI especializados
9. **Desarrollar** las páginas principales con funcionalidad completa
10. **Agregar** el sistema de notificaciones
11. **Configurar** la persistencia con Supabase
12. **Implementar** las validaciones y manejo de errores
13. **Agregar** los estilos dinámicos y temas
14. **Configurar** las variables de entorno
15. **Probar** toda la funcionalidad end-to-end

## 🔹 Resultado Esperado

Una aplicación web completa y funcional para gestión de documentos con:
- **Interfaz moderna** y responsive
- **Funcionalidad completa** de CRUD con persistencia real
- **Sistema de plantillas** reutilizables
- **Carga de archivos** con extracción simulada
- **Configuraciones** personalizables persistentes
- **Autenticación** real con Google OAuth
- **Base de datos** PostgreSQL con Supabase
- **Experiencia de usuario** fluida y profesional
- **Colores dinámicos** basados en configuración
- **Modo offline** básico con fallbacks

La aplicación debe ser completamente funcional con backend real (Supabase), autenticación, persistencia de datos y sincronización automática entre dispositivos.

## 🔹 Características Avanzadas

### **UX/UI Mejorada**
- **Estructura colapsable** para campos (cerrada por defecto)
- **Guardado automático** del nombre al perder foco
- **Estados visuales** claros para filas pendientes/guardadas
- **Botones con colores** dinámicos del tema
- **Drag & drop** completamente funcional

### **Gestión de Estado Robusta**
- **Sincronización** automática con BD
- **Estados de carga** apropiados
- **Manejo de errores** graceful
- **Optimistic updates** para mejor UX

### **Funcionalidades de Productividad**
- **Templates** aplicables desde cualquier documento
- **Exportación** en múltiples formatos
- **Búsqueda y filtrado** avanzado
- **Validaciones** en tiempo real
