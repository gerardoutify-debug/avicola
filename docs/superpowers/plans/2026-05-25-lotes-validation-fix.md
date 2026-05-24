# Validación de Duplicados y Orden de Lotes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evitar el registro de lotes duplicados mediante la validación del N° de Factura y asegurar que el orden de las columnas en Google Sheets sea correcto y profesional.

**Architecture:** Se modificará el handler POST en la API de lotes para consultar los registros existentes antes de insertar. Se reestructurará el array de valores para garantizar el orden de las 33 columnas.

**Tech Stack:** Node.js, Vercel Serverless Functions, Google Sheets API.

---

### Task 1: Implementar Validación de Duplicados

**Files:**
- Modify: `api/lotes.ts`

- [ ] **Step 1: Leer registros existentes antes de guardar**

```typescript
// En api/lotes.ts -> handler POST
if (req.method === 'POST') {
  const { lote, metrics } = req.body;
  const sheetName = 'Base de Datos Lotes';

  // 1. Validar si ya existe el N° de Factura
  const existingRows = await readSheetRange(sheetName, 'B2:B1000'); // Columna B es nroFactura
  const facturaExiste = existingRows.some((row: any) => row[0] === lote.nroFactura);

  if (facturaExiste) {
    return res.status(400).json({ error: `El lote con Factura ${lote.nroFactura} ya está registrado.` });
  }
  
  // ... resto del código de guardado
}
```

### Task 2: Corregir Orden de Columnas en Sheets

**Files:**
- Modify: `api/lotes.ts`

- [ ] **Step 1: Asegurar coincidencia exacta entre Headers y RowValues**

```typescript
// En api/lotes.ts -> handler POST
const headers = [
  'Fecha Ingreso', 'Nro Factura', 'Placa Camion', 'Codigo Lote', 'Precio Kg', 'Total Jabas',
  'Flete Total', 'Pollos Muertos', 'Porcentaje Hembra', 'Peso Min Hembra',
  'Peso Max Hembra', 'Pollos/Jaba Hembra', 'Porcentaje Macho', 'Peso Min Macho',
  'Peso Max Macho', 'Pollos/Jaba Macho', 'Proveedor', 'Origen',
  'Prom Peso Hembra', 'Prom Peso Macho', 'Prom Peso Pollo Ponderado', 'Prom Pollo/Jaba Ponderado',
  'Cantidad Pollos Estimada', 'Kilos Totales Estimados', 'Monto Pagar Proveedor', 'Merma Kilos',
  'Merma Valorizada', 'Valorizado Pollos Muertos', 'Valorizado Pollos', 'Costo Total Pollo Vivo AQP',
  'Cantidad Pollos Vendibles', 'Costo Pollo/Unidad', 'Precio Kg Puesto AQP'
];

const rowValues = [
  lote.fechaIngreso, lote.nroFactura, lote.placaCamion, metrics.codigoLote,
  lote.precioKg, lote.totalJabas, lote.fleteTotal, lote.pollosMuertos,
  lote.porcentajeHembra, lote.pesoMinHembra, lote.pesoMaxHembra, lote.pollosxJabaHembra,
  lote.porcentajeMacho, lote.pesoMinMacho, lote.pesoMaxMacho, lote.pollosxJabaMacho,
  lote.proveedor || '', lote.origen || '',
  metrics.promPesoHembra, metrics.promPesoMacho, metrics.promPesoPolloPonderado, metrics.promPolloJabaPonderado,
  metrics.cantidadPollosEstimada, metrics.kilosTotalesEstimados, metrics.montoPagarProveedor, metrics.mermaKilos,
  metrics.mermaValorizada, metrics.valorizadoPollosMuertos, metrics.valorizadoPollos, metrics.costoTotalPolloVivoAQP,
  metrics.cantidadPollosVendibles, metrics.costoPolloPorUnidad, metrics.precioKgPuestoAQP
];
```

### Task 3: Verificación y Commit

- [ ] **Step 1: Realizar una prueba de guardado duplicado y verificar el error**
- [ ] **Step 2: Verificar el orden visual en el Google Sheets**
- [ ] **Step 3: Commit y Push**

```bash
git add api/lotes.ts
git commit -m "fix: validacion de facturas duplicadas y correccion de orden en columnas de lotes"
git push
```
