# Diseño de Integración de Sección de Vehículos (Camiones)

Este documento especifica el diseño técnico para añadir la sección "Vehículos" (Camiones) al sistema, incluyendo sincronización con Google Sheets, API endpoints, actualizaciones de navegación, y un selector combobox en la gestión de lotes.

## Objetivo
Permitir a los usuarios registrar y gestionar camiones de transporte en una hoja de cálculo centralizada de Google Sheets, y asegurar que la entrada de placas en la pestaña de Gestión de Lotes sea a través de un selector restrictivo (combobox) poblado por estos vehículos registrados, evitando errores tipográficos.

## Cambios Propuestos

### 1. Base de Datos (Google Sheets)
* Pestaña destino: `Base de Datos Camiones`
* Columnas a crear:
  1. `Placa`: Placa de rodaje única (e.g. `APX-755`).
  2. `Conductor`: Nombre del conductor asignado (e.g. `Juan Pérez`).
  3. `Fecha Registro`: Fecha y hora de creación de la fila.

### 2. Endpoints del Backend (Vercel Serverless Functions)
* **`api/camiones.ts`**:
  * `GET`: Obtiene todas las filas de la pestaña `Base de Datos Camiones` (excluyendo cabecera), mapeándolas a objetos `{ placa, conductor, fechaRegistro }`. Si la hoja no existe, se retorna un array vacío `[]`.
  * `POST`: Recibe un cuerpo JSON `{ placa, conductor }`. Valida que no exista un camión previo con la misma placa. Asegura la existencia de la hoja `Base de Datos Camiones` con sus cabeceras, y añade una fila con `[placa, conductor, fechaActual]`.

### 3. Modificaciones al Contexto React (`AppContext.tsx`)
* Crear el tipo `Camion` en el frontend:
  ```typescript
  export interface Camion {
    placa: string;
    conductor: string;
    fechaRegistro?: string;
  }
  ```
* Añadir al estado y tipo de contexto:
  * `camiones: Camion[]`
  * `addCamion: (camion: Camion) => Promise<void>`
* En la carga de datos (`refreshData`):
  * Intentar llamar a `GET /api/camiones` para actualizar la lista en modo `live`.
  * En modo `demo` (offline), leer de `localStorage` (`avicola_local_camiones`) con valores iniciales por defecto (e.g. `APX-755` y `FGT-988`).
* En `addCamion`:
  * En modo `demo`, añadir a la lista local en `localStorage`.
  * En modo `live`, realizar `POST /api/camiones` y refrescar.

### 4. Navegación e Interfaz de Usuario
* **Navegación (`Layout.tsx`)**:
  * Añadir el item de navegación con ID `'camiones'`, nombre `'Camiones'`, y el icono `Truck` de `lucide-react`.
* **Ruteo Interno (`App.tsx`)**:
  * Agregar el caso `'camiones'` para cargar el componente `<CamionesForm />`.
* **Nuevo Componente (`CamionesForm.tsx`)**:
  * Creado en `src/components/CamionesForm.tsx`.
  * Presentará el formulario para registrar un camión (Placa con validación de formato y Conductor) y la lista de camiones registrados.
  * Añadir animación visual de un camión usando la librería `lottie-react` (instalada como dependencia).
* **Selector en Lotes (`LotesForm.tsx`)**:
  * Modificar el input de texto de `Placa Camión` para ser un selector `<select>` que cargue las opciones de `camiones`.
  * Si no hay camiones, deshabilitar y sugerir al usuario registrar uno en la nueva pestaña.

## Plan de Verificación

### Pruebas Manuales
1. **Modo Demo**:
   * Verificar que se cargan camiones predeterminados.
   * Registrar un camión y verificar que se añade a la lista local.
   * Entrar a "Gestión de Lotes" y verificar que el nuevo camión aparece en el combobox de Placa Camión.
2. **Modo Live**:
   * Simular la respuesta de API para registrar y listar camiones.
   * Verificar que la pestaña `Base de Datos Camiones` se cree automáticamente en Google Sheets y se registren los camiones correctamente.
