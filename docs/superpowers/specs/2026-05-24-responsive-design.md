# Especificación de Diseño: Simulador Avícola Responsivo con Tailwind CSS

**Fecha:** 2026-05-24
**Autor:** Antigravity (AI Assistant)
**Estado:** Aprobado por el usuario (enfoque recomendado)

---

## 1. Objetivos y Alcance
Hacer que toda la aplicación del **Simulador Avícola** sea completamente responsiva, interactiva y funcional en cualquier pantalla (dispositivos móviles, tablets y computadoras de escritorio) utilizando exclusivamente clases de utilidad de **Tailwind CSS**, manteniendo el diseño limpio, profesional y claro del tema **SAP Morning Horizon**.

---

## 2. Cambios de Arquitectura de UI

### 2.1 Estructura Principal (`Layout.tsx`)
- **Barra de Navegación Lateral (Sidebar / Drawer):**
  - **Desktop (`>= lg`):** Estática, visible al lado izquierdo (`w-64`, fija).
  - **Móvil/Tablet (`< lg`):** Se convierte en un panel flotante de ancho completo o parcial (`w-64`), posicionado de manera absoluta (`fixed inset-y-0 left-0 z-30`), controlado por un estado `isSidebarOpen: boolean`.
  - **Animación:** Transición suave con Tailwind (`transition-transform duration-300 ease-in-out -translate-x-full lg:translate-x-0`).
  - **Fondo translúcido (Backdrop):** Un div gris oscuro translúcido (`bg-slate-900/40 backdrop-blur-sm fixed inset-0 z-20`) para cerrar el panel haciendo clic fuera.
- **Barra Superior Móvil (Top Bar):**
  - Oculta en desktop (`lg:hidden`).
  - Visible en móviles/tablets con un botón de menú "hamburguesa" (usando el icono `Menu` de `lucide-react`) y el título del panel activo en formato compacto.

### 2.2 Dashboard (`Dashboard.tsx`)
- **Tarjetas de KPIs:** Rejilla flexible (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`).
- **Gráfico SVG:**
  - El elemento `<svg>` se configurará con `viewBox="0 0 500 200"` y clases de Tailwind `w-full h-auto max-h-64 aspect-[2.2/1]`.
  - El contenedor del gráfico usará un layout flexible para evitar desbordamientos horizontales.
- **Distribución de Columnas:** Rejilla responsiva (`grid grid-cols-1 lg:grid-cols-3 gap-8`).

### 2.3 Formularios de Lotes y Ventas (`LotesForm.tsx` y `VentasForm.tsx`)
- **Campos de Entrada (Formularios):**
  - Distribución fluida de los campos de entrada usando `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`.
- **Drawer Lateral de Previsualización (Lotes):**
  - **Desktop (`>= lg`):** Se mantiene como columna lateral fija a la derecha (`lg:col-span-4`).
  - **Móvil/Tablet (`< lg`):** Se reposiciona como un panel inferior deslizante o sección integrada que se abre de abajo hacia arriba o se muestra de forma compacta para no abrumar al usuario.
- **Tablas de Historial:**
  - Contenedor envolvente con `overflow-x-auto w-full` para permitir desplazamiento horizontal de las columnas de datos sin deformar el ancho de pantalla del dispositivo móvil.

### 2.4 Modal de Configuración (`ConfigModal.tsx`)
- Reorganización de la guía paso a paso y el formulario de credenciales de Google Cloud de un layout de columnas horizontales a un flujo apilado en dispositivos móviles.

---

## 3. Plan de Verificación
- Probar la responsividad en el navegador simulando dispositivos celulares (iPhone/Android) y tabletas (iPad).
- Asegurarse de que no haya desbordamiento horizontal en ninguna pantalla y que el menú drawer se abra y cierre correctamente.
- Validar que la compilación `npm run build` pase con 0 advertencias/errores.
