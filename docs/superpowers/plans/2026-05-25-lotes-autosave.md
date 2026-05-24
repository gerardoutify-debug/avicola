# Guardado Automático de Lotes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar el guardado automático de lotes incluyendo todas las métricas calculadas (33 columnas) en la hoja "Base de Datos Lotes" de Google Sheets.

**Architecture:** El frontend calculará las métricas antes de enviar el lote. La API de Vercel manejará el mapeo de las 33 columnas y el cambio de nombre de la hoja.

**Tech Stack:** React (TypeScript), Vercel Serverless Functions (Node.js), Google Sheets API.

---

### Task 1: Modificar Servicio Frontend para incluir Cálculos

**Files:**
- Modify: `src/services/googleSheets.ts`

- [ ] **Step 1: Importar función de cálculo y actualizar syncLote**

```typescript
// En src/services/googleSheets.ts
import { type Lote, type Venta, type VentaRow, calcularMétricasLote, calcularMétricasVenta } from '../utils/calculations';

// ... dentro de la clase GoogleSheetsService
  async syncLote(lote: Lote): Promise<void> {
    const metrics = calcularMétricasLote(lote); // Calcular métricas antes de enviar
    
    const res = await fetch('/api/lotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lote, metrics }), // Enviar ambos objetos
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al guardar el lote en el servidor.');
    }
  }
```

- [ ] **Step 2: Verificar que no haya errores de compilación**

### Task 2: Actualizar API Backend para manejar 33 columnas y nueva Hoja

**Files:**
- Modify: `api/lotes.ts`

- [ ] **Step 1: Actualizar constantes y mapeo en el POST handler**

```typescript
// En api/lotes.ts
// ... dentro del if (req.method === 'POST')
      const { lote, metrics } = req.body;
      const sheetName = 'Base de Datos Lotes';
      
      const headers = [
        'fechaIngreso', 'nroFactura', 'placaCamion', 'codigoLote', 'precioKg', 'totalJabas',
        'fleteTotal', 'pollosMuertos', 'porcentajeHembra', 'pesoMinHembra',
        'pesoMaxHembra', 'pollosxJabaHembra', 'porcentajeMacho', 'pesoMinMacho',
        'pesoMaxMacho', 'pollosxJabaMacho', 'proveedor', 'origen',
        'promPesoHembra', 'promPesoMacho', 'promPesoPolloPonderado', 'promPolloJabaPonderado',
        'cantidadPollosEstimada', 'kilosTotalesEstimados', 'montoPagarProveedor', 'mermaKilos',
        'mermaValorizada', 'valorizadoPollosMuertos', 'valorizadoPollos', 'costoTotalPolloVivoAQP',
        'cantidadPollosVendibles', 'costoPolloPorUnidad', 'precioKgPuestoAQP'
      ];
      
      await ensureSheetExists(sheetName, headers);

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

      await appendRowToSheet(sheetName, rowValues);
```

- [ ] **Step 2: Actualizar el GET handler para leer de la nueva hoja**

```typescript
// En api/lotes.ts
// ... dentro del if (req.method === 'GET')
      const sheetName = 'Base de Datos Lotes';
      const rows = await readSheetRange(sheetName, 'A2:AG1000'); // Leer hasta columna AG (33 columnas)
      // ... mantener el mapeo actual para el frontend (las primeras 18 columnas siguen igual)
```

### Task 3: Verificación, Commit y Push

- [ ] **Step 1: Realizar un guardado de prueba desde la UI (si es posible) o verificar logs**
- [ ] **Step 2: Realizar commit y push**

```bash
git add src/services/googleSheets.ts api/lotes.ts docs/superpowers/specs/2026-05-25-lotes-autosave-design.md
git commit -m "feat: implementacion de guardado automatico de lotes en Base de Datos Lotes con 33 columnas"
git push
```
