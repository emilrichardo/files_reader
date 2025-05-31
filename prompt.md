# 📄 Aplicación Web para Gestión de Documentos – Especificación del Prompt

## 🔹 Objetivo

Construir una aplicación web tipo dashboard para subir y estructurar información extraída de documentos como PDF, JPG, PNG, DOC, etc. La interfaz permitirá definir campos personalizados, ver metadatos, guardar plantillas reutilizables y gestionar configuraciones específicas por usuario.

## 🔹 Tecnologías Utilizadas

La aplicación está desarrollada utilizando las siguientes tecnologías:

- **Next.js**: Framework de React para aplicaciones web modernas.
- **Hero UI o Next UI**: Componentes de interfaz de usuario para un diseño limpio y funcional.
- **Tailwind CSS**: Framework de estilos para diseño responsivo y personalizado.
- **TypeScript**: Lenguaje tipado para mayor seguridad y escalabilidad en el desarrollo.

## 🔹 Interfaz

El diseño tiene una navegación lateral izquierda con las siguientes secciones:

- Home
- Documents
- Create New Document
- Templates
- Settings
- (parte inferior) Iniciar/Cerrar sesión

## 🔹 Home

- Mostrar lista de documentos editados recientemente
- Botón: 'Ver todos los documentos'
- Llamado a la acción destacado: 'Crear nuevo documento'

## 🔹 Crear Nuevo Documento

**Información Inicial**

- Nombre del proyecto y descripción editables

**Tabla de Campos**

- Tabla editable al estilo Notion
- Comienza con una columna precargada llamada `title` como ejemplo
- Cada columna representa un campo con:

  - `field_name` (obligatorio)
  - `formats` (valores separados por comas)
  - `type` (text, date, number, boolean, etc.)
  - `description`
  - `metadata` (botón que muestra información del archivo, fecha de carga y nombre del archivo)

- Las columnas pueden ser agregadas, editadas o eliminadas
- Los campos pueden guardarse como plantillas reutilizables

## 🔹 Entrada Manual de Filas

- El usuario puede agregar filas manualmente completando los datos por columna

## 🔹 Carga de Archivos

- Zona de carga debajo de la tabla
- Soporta arrastrar y soltar o cargar desde el dispositivo
- Al subir un archivo:
  - Se procesa automáticamente
  - Se muestra una vista previa con los campos extraídos
  - Los campos pueden ser editados o agregados a la tabla
- Al confirmar, se cierra el modal y se pueden agregar más archivos al documento

📌 Cada archivo subido guarda automáticamente:

- Nombre del archivo
- Fecha de carga
- El archivo en sí

## 🔹 Exportar Documento

Cada documento (tabla) puede descargarse en formato:

- CSV
- PDF
- Excel
- Google Sheets (opcional)

## 🔹 Plantillas

- Lista de plantillas guardadas
- Crear nuevas plantillas desde cero o desde un documento existente
- Las plantillas almacenan grupos de campos reutilizables

## 🔹 Configuración

Panel de configuración por usuario:

- Endpoint de API para procesamiento de archivos (POST)
- API Keys:
  - Supabase
  - OpenAI
  - Google Vision
  - (Permitir agregar más claves dinámicamente)
- Selector de esquema de colores
- Subir logotipo de empresa

✅ Las configuraciones se almacenan por usuario registrado
🔒 Para guardar es necesario estar logueado

## 🔹 Autenticación de Usuario

- Login con cuenta de Google
- Usar el proveedor definido en la base de datos
- Documentos, plantillas y configuraciones se vinculan al usuario

## 🔹 Base de Datos

- Registro, autenticación y almacenamiento con Supabase
- Las credenciales se gestionan mediante variables de entorno

## 🔹 UI y Responsividad

- Interfaz limpia y minimalista
- Responsive para escritorio y móvil
- Tipografía: Inter o similar sans serif
- Color principal: #53ff45
- Gradientes sutiles desde el color principal hacia el fondo
- Selector de modo claro u oscuro
