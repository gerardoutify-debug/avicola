# Renombrar Tipos de Venta y Hojas de BD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Renombrar los tipos de venta de 'Faenado/Vivo' a 'Carcasa/Entero' y redirigir el guardado a las nuevas pestañas 'BD_Carcasas' y 'BD_Enteros' en Google Sheets.

**Architecture:** Se actualizarán las interfaces de TypeScript para reflejar los nuevos nombres, se modificará la UI del formulario de ventas y se ajustará la lógica de la API para el ruteo de hojas.

**Tech Stack:** React, TypeScript, Vercel Serverless Functions.

---

### Task 1: Actualizar Tipos en Utilidades

**Files:**
- Modify: `src/utils/calculations.ts`

- [ ] **Step 1: Cambiar literal types en interface Venta**

```typescript
// En src/utils/calculations.ts
export interface Venta {
  // ...
  tipoVenta: 'Entero' | 'Carcasa'; // Antes: 'Vivo' | 'Faenado'
  // ...
}
```

- [ ] **Step 2: Actualizar lógica de cálculo si usa los strings anteriores**

```typescript
// En src/utils/calculations.ts -> calcularMétricasVenta
const costoKgFinal = venta.tipoVenta === 'Carcasa' // Antes: 'Faenado'
    ? (venta.pesoCarcasa > 0 ? costoTotalProrrateado / venta.pesoCarcasa : 0)
    : (venta.pesoLlegada > 0 ? costoTotalProrrateado / venta.pesoLlegada : 0);
```

### Task 2: Actualizar Formulario de Ventas (UI)

**Files:**
- Modify: `src/components/VentasForm.tsx`

- [ ] **Step 1: Actualizar estados iniciales y tipos**

```typescript
// En src/components/VentasForm.tsx
const [tipoVenta, setTipoVenta] = useState<'Entero' | 'Carcasa'>('Carcasa'); // Antes: 'Faenado'

// ... en currentVenta
const currentVenta: Venta = {
    // ...
    tipoVenta,
    // ...
    pesoCarcasa: tipoVenta === 'Carcasa' ? (Number(pesoCarcasa) || 0) : 0,
    pesoCabezas: tipoVenta === 'Carcasa' ? (Number(pesoCabezas) || 0) : 0,
    // ... repetir para hígados, riñones, otras
};
```

- [ ] **Step 2: Actualizar etiquetas en el renderizado**

```tsx
{/* Ejemplo de cambio en los botones de tipo de venta */}
<button 
  onClick={() => setTipoVenta('Carcasa')} 
  className={tipoVenta === 'Carcasa' ? '...' : '...'}
>
  Carcasa
</button>
<button 
  onClick={() => setTipoVenta('Entero')} 
  className={tipoVenta === 'Entero' ? '...' : '...'}
>
  Entero
</button>
```

### Task 3: Actualizar API Backend y Hojas de Sheets

**Files:**
- Modify: `api/ventas.ts`

- [ ] **Step 1: Actualizar ruteo de hojas en el POST handler**

```typescript
// En api/ventas.ts -> handler POST
const { venta, lote, metricsLote, metricsVenta } = req.body;

// Determinar la hoja de destino según el tipo de venta
const targetSheet = venta.tipoVenta === 'Carcasa' ? 'BD_Carcasas' : 'BD_Enteros';
```

- [ ] **Step 2: Actualizar mapeo en el GET handler (si aplica)**

### Task 4: Verificación y Commit

- [ ] **Step 1: Verificar que no haya errores de TypeScript**
- [ ] **Step 2: Commit y Push**

```bash
git add src/utils/calculations.ts src/components/VentasForm.tsx api/ventas.ts
git commit -m "feat: renombrar tipos de venta a Carcasa/Entero y actualizar hojas BD_Carcasas/BD_Enteros"
git push
```
