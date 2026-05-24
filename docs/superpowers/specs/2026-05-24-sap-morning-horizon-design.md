# Spec: Tema de Diseño SAP Morning Horizon (SAP S/4HANA) para Simulador Avícola

Este documento define la especificación de diseño visual para la conversión del Simulador Avícola Web de su tema oscuro original a la paleta de colores corporativa oficial **SAP S/4HANA Horizon Morning** (con Shell Header oscuro).

## Contexto & Objetivo
El usuario requiere una estética altamente profesional, corporativa y seria, alineada al diseño de los sistemas ERP de **SAP**. Se implementará un tema mixto:
1. **SAP Shell Sidebar (Navegación):** Barra lateral oscura estilo SAP Fiori (`#1C2D3D`).
2. **Morning Horizon Workspace (Contenido):** Área de trabajo de fondo claro grisáceo (`#F3F4F5`) con tarjetas blancas (`#FFFFFF`) y acentos de color azul SAP (`#0A6ED1`).
3. **Restricción de Colores:** Omitir tonos amarillos, naranjas o ámbar en los semánticos e indicadores de alerta.

---

## 🎨 Especificación de Fichas de Color (Tokens)

### Colores de Fondo y Estructura
* **Background General (`brandBg`):** `#F3F4F5` (Fondo gris claro estándar de SAP Fiori Horizon).
* **Card Container (`brandCard`):** `#FFFFFF` (Blanco puro para las tarjetas de formularios y KPIs).
* **Sidebar Sidebar (`brandShell`):** `#1C2D3D` (Azul oscuro de cabecera/consola de SAP).
* **Bordes y Separadores (`brandBorder`):** `#D3D7DB` (Gris claro limpio).
* **Foco de Inputs:** `#0A6ED1` (Azul oficial de SAP Horizon).

### Colores de Texto
* **Texto Primario:** `#32363A` (Gris oscuro/negro corporativo para títulos y lecturas principales).
* **Texto Secundario:** `#555A5F` (Muted text para etiquetas secundarias e información de apoyo).
* **Texto Blanco:** `#FFFFFF` (Para la barra de navegación lateral).

### Colores Semánticos (Alertas y Estados)
* **Éxito / Margen Positivo:** `#107F3E` (Verde corporativo de SAP).
* **Pérdidas / Bajas (Mortalidad):** `#BB0000` (Rojo corporativo de SAP).
* **Información / Fletes:** `#0A6ED1` (Azul SAP).

---

## 🛠️ Plan de Modificaciones por Componente

### 1. `tailwind.config.js`
* Reemplazar las clases oscuras por los nuevos tokens de SAP Horizon.
* Configurar la paleta `indigo` para que use el degradado oficial de SAP Blue.

### 2. `src/index.css`
* Cambiar el fondo del body a `#F3F4F5` y el color de texto por defecto a `#32363A`.
* Actualizar el scrollbar para usar `#F3F4F5` en el fondo y `#D3D7DB` en el deslizador.

### 3. `src/components/Layout.tsx`
* Modificar el fondo del sidebar a `bg-brandShell` con textos claros (`text-slate-200`).
* Cambiar el fondo del header superior a blanco puro (`bg-white`) con borde inferior (`border-brandBorder`).
* Cambiar las clases de hover y botones activos a los estilos de SAP.

### 4. `src/components/Dashboard.tsx`
* Actualizar las tarjetas KPI para usar fondos blancos, bordes finos `#D3D7DB` y textos oscuros.
* Ajustar el gráfico SVG para usar fondos y grillas claras, con líneas de costo (azul SAP) y venta (verde SAP).

### 5. `src/components/LotesForm.tsx` y `VentasForm.tsx`
* Modificar los formularios a fondos blancos y inputs con bordes `#B0B5B9`.
* Cambiar las tablas para tener cabeceras gris claro (`bg-slate-50`) e implementar hover de filas en azul suave (`hover:bg-[#E5F0FA]`).

### 6. `src/components/ConfigModal.tsx`
* Convertir a la paleta clara con tarjetas estructuradas en blanco.
