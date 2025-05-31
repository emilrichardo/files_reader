# 📄 Aplicación Web para Gestión de Documentos – Especificación Completa del Prompt

## 🔹 Objetivo

Construir una aplicación web tipo dashboard para subir y estructurar información extraída de documentos como PDF, JPG, PNG, DOC, etc. La interfaz permitirá definir campos personalizados, ver metadatos, guardar plantillas reutilizables y gestionar configuraciones específicas por usuario.

## 🔹 Tecnologías Utilizadas

La aplicación está desarrollada utilizando las siguientes tecnologías:

- **Next.js 14+**: Framework de React con App Router
- **shadcn/ui**: Componentes de interfaz de usuario para un diseño limpio y funcional
- **Tailwind CSS**: Framework de estilos para diseño responsivo y personalizado
- **TypeScript**: Lenguaje tipado para mayor seguridad y escalabilidad
- **Lucide React**: Iconografía moderna
- **Radix UI**: Primitivos de UI accesibles

## 🔹 Estructura del Proyecto

### **Contextos y Providers**
- `AuthProvider`: Manejo de autenticación con usuario mock
- `AppProvider`: Estado global de documentos y plantillas con localStorage
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
  api_endpoint?: string
  api_keys: Record<string, string>
  theme: "light" | "dark"
  color_scheme: string
  company_logo?: string
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

#### **Edición Posterior de Datos**
- **Edición completa** de filas desde la página de edición del documento
- **Agregar nuevas filas** manualmente después de la carga
- **Eliminar filas** con confirmación
- **Actualización en tiempo real** de los datos modificados
- **Validación** de campos requeridos y tipos de datos
- **Persistencia** automática de cambios

#### **Exportación**
- **Selector de formato**: CSV, PDF, Excel
- **Simulación** de descarga con notificación

### **👁️ Document Detail (app/documents/[id]/page.tsx)**
- **Header** con título, descripción y acciones
- **Estadísticas**: número de entradas, archivos, última actualización
- **Estructura de campos** con tipos y formatos
- **Tabla completa de datos** con información de archivos
- **Acciones**: Editar, Exportar, Eliminar

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
- **Guardado en localStorage** con clave específica
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

## 🔹 Funcionalidades Avanzadas

### **Sistema de Notificaciones**
- **Hook useToast** completo con gestión de estado
- **Componentes Toast** con Radix UI
- **Variantes**: default, destructive
- **Auto-dismiss** configurable
- **Posicionamiento** responsive

### **Gestión de Estado**
- **Context API** para estado global
- **localStorage** para persistencia
- **Datos mock** para demostración
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

## 🔹 Estilos y Diseño

### **Tema Visual**
- **Color principal**: Negro (#000000)
- **Tipografía**: Inter (sans-serif)
- **Gradientes sutiles** desde negro hacia gris
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
├── layout.tsx (con AuthProvider, AppProvider, Sidebar, Toaster)
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
└── ui/ (shadcn components)

contexts/
├── auth-context.tsx
└── app-context.tsx

hooks/
├── use-toast.ts
└── use-file-upload.ts

lib/
├── types.ts
├── mock-data.ts
├── supabase.ts
└── theme.ts
\`\`\`

## 🔹 Datos Mock Incluidos

### **Documentos de Ejemplo**
1. **Facturas Diciembre 2024** - Con campos de facturación
2. **Contratos de Clientes** - Con información contractual
3. **Inventario de Productos** - Control de stock

### **Plantillas Predefinidas**
1. **Plantilla de Facturas** - Estructura estándar
2. **Plantilla de Contratos** - Documentos contractuales

## 🔹 Funcionalidades Específicas a Implementar

### **Autenticación Mock**
- **Usuario demo** predefinido
- **Simulación** de login/logout
- **Persistencia** de sesión

### **Gestión de Documentos**
- **CRUD completo** con validaciones
- **Búsqueda y filtrado** avanzado
- **Exportación** simulada

### **Sistema de Plantillas**
- **Creación** desde cero o desde documento
- **Aplicación** a nuevos documentos
- **Gestión completa** con CRUD

### **Carga de Archivos**
- **Drag & drop** funcional
- **Múltiples formatos** soportados
- **Progreso visual** de carga
- **Extracción simulada** inteligente

### **Configuraciones Avanzadas**
- **API keys** dinámicas
- **Personalización** visual
- **Persistencia** en localStorage

## 🔹 Consideraciones Técnicas

### **Performance**
- **useCallback** para funciones costosas
- **useMemo** para cálculos complejos
- **Lazy loading** donde sea apropiado

### **Accesibilidad**
- **ARIA labels** apropiados
- **Navegación por teclado**
- **Contraste** adecuado

### **Manejo de Errores**
- **Try-catch** en operaciones críticas
- **Fallbacks** para estados de error
- **Logging** para debugging

### **Estado y Persistencia**
- **localStorage** para datos del usuario
- **Context API** para estado global
- **Sincronización** entre pestañas

## 🔹 Instrucciones de Implementación

1. **Crear** la estructura base con Next.js y TypeScript
2. **Instalar** shadcn/ui y configurar Tailwind
3. **Implementar** los contextos de autenticación y aplicación
4. **Crear** los tipos de datos en lib/types.ts
5. **Desarrollar** los componentes de UI especializados
6. **Implementar** las páginas principales con funcionalidad completa
7. **Agregar** el sistema de notificaciones
8. **Configurar** la persistencia con localStorage
9. **Implementar** las validaciones y manejo de errores
10. **Agregar** los datos mock para demostración

## 🔹 Resultado Esperado

Una aplicación web completa y funcional para gestión de documentos con:
- **Interfaz moderna** y responsive
- **Funcionalidad completa** de CRUD
- **Sistema de plantillas** reutilizables
- **Carga de archivos** con extracción simulada
- **Configuraciones** personalizables
- **Experiencia de usuario** fluida y profesional

La aplicación debe ser completamente funcional sin necesidad de backend, utilizando datos mock y localStorage para persistencia.
