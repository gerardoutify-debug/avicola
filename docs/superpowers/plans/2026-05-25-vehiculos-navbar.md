# Integración de Sección de Vehículos (Camiones) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir una sección de Camiones en la barra lateral, guardando registros en la hoja "Base de Datos Camiones" de Google Sheets, habilitando un selector de placas restringido en Gestión de Lotes y mostrando una animación Lottie de un camión.

**Architecture:** Se creará una serverless function `api/camiones.ts` para interactuar con Google Sheets. Se actualizará `AppContext.tsx` para persistir los camiones en modo local (localStorage) y live. Se modificará `Layout.tsx` para agregar la opción del menú y `LotesForm.tsx` para consumir el selector.

**Tech Stack:** React, TypeScript, Tailwind CSS, google-auth-library, lottie-react.

---

### Task 1: Instalar Dependencia Lottie

**Files:**
- Modify: [package.json](file:///C:/Avicola/package.json)

- [ ] **Step 1: Instalar la dependencia lottie-react**

Run: `npm install lottie-react`
Expected: Instala la biblioteca de reproducción de animaciones Lottie compatible con React 19.

- [ ] **Step 2: Verificar la instalación**

Verificar en [package.json](file:///C:/Avicola/package.json) que `lottie-react` esté listado en dependencies.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add lottie-react dependency"
```

---

### Task 2: Crear Endpoint Backend `api/camiones.ts`

**Files:**
- Create: [api/camiones.ts](file:///C:/Avicola/api/camiones.ts)

- [ ] **Step 1: Crear archivo con el handler de API**

Crear el archivo [api/camiones.ts](file:///C:/Avicola/api/camiones.ts) con el siguiente código completo:
```typescript
import { readSheetRange, ensureSheetExists, appendRowToSheet } from './_sheets.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const sheetName = 'Base de Datos Camiones';
      const rows = await readSheetRange(sheetName, 'A2:C1000');
      if (!rows || rows.length === 0) {
        return res.status(200).json([]);
      }

      const camiones = rows
        .filter((row: any) => row[0] && row[0].trim() !== '')
        .map((row: any) => ({
          placa: row[0] || '',
          conductor: row[1] || '',
          fechaRegistro: row[2] || '',
        }));
      return res.status(200).json(camiones);
    }

    if (req.method === 'POST') {
      const { placa, conductor } = req.body;
      const sheetName = 'Base de Datos Camiones';

      if (!placa || !conductor) {
        return res.status(400).json({ error: 'Falta placa o conductor' });
      }

      const existingRows = await readSheetRange(sheetName, 'A2:A1000');
      if (existingRows && existingRows.some((row: any) => row[0] === placa)) {
        return res.status(400).json({ error: 'La placa ya se encuentra registrada' });
      }

      const headers = ['Placa', 'Conductor', 'Fecha Registro'];
      await ensureSheetExists(sheetName, headers);

      const fechaRegistro = new Date().toLocaleDateString('es-ES');
      const rowValues = [placa, conductor, fechaRegistro];

      await appendRowToSheet(sheetName, rowValues);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('Error in /api/camiones serverless function:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add api/camiones.ts
git commit -m "feat: add api/camiones endpoint for sheets integration"
```

---

### Task 3: Modificar Contexto de React `AppContext.tsx`

**Files:**
- Modify: [src/context/AppContext.tsx](file:///C:/Avicola/src/context/AppContext.tsx)

- [ ] **Step 1: Añadir tipos y modificar interface `AppContextType`**

Actualizar imports e interfaces:
Definir `Camion` interface y añadir `camiones` y `addCamion` al tipo `AppContextType`.
```typescript
export interface Camion {
  placa: string;
  conductor: string;
  fechaRegistro?: string;
}
```

- [ ] **Step 2: Agregar datos semilla y estado en `AppProvider`**

Crear `SAMPLE_CAMIONES` al inicio del archivo:
```typescript
const SAMPLE_CAMIONES: Camion[] = [
  { placa: 'APX-755', conductor: 'Raúl Mendoza', fechaRegistro: '22/05/2026' },
  { placa: 'FGT-988', conductor: 'Carlos Ortega', fechaRegistro: '24/05/2026' }
];
```
Inicializar el estado en `AppProvider`:
```typescript
const [camiones, setCamiones] = useState<Camion[]>([]);
```

- [ ] **Step 3: Agregar lógica de fetch en `refreshData` y guardar en `addCamion`**

En `refreshData` dentro del bloque `try`:
```typescript
const resCamiones = await fetch('/api/camiones');
if (resCamiones.ok) {
  const shCamiones = await resCamiones.json();
  setCamiones(shCamiones || []);
}
```
En el bloque `catch` de `refreshData`:
```typescript
const localCamiones = localStorage.getItem('avicola_local_camiones');
setCamiones(localCamiones ? JSON.parse(localCamiones) : SAMPLE_CAMIONES);
```

Implementar `addCamion`:
```typescript
const addCamion = async (camion: Camion) => {
  setIsLoading(true);
  try {
    if (mode === 'demo') {
      const localCamiones = localStorage.getItem('avicola_local_camiones');
      const current = localCamiones ? JSON.parse(localCamiones) : [...SAMPLE_CAMIONES];
      const updated = [camion, ...current];
      localStorage.setItem('avicola_local_camiones', JSON.stringify(updated));
      setCamiones(updated);
    } else {
      const res = await fetch('/api/camiones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(camion)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Error al guardar el camión en el servidor.');
      }
      await refreshData();
    }
  } catch (err) {
    console.error('Error guardando camión:', err);
    alert('Error al guardar camión: ' + (err as Error).message);
    throw err;
  } finally {
    setIsLoading(false);
  }
};
```
Pasar `camiones` y `addCamion` en el provider value.

- [ ] **Step 4: Commit**

```bash
git add src/context/AppContext.tsx
git commit -m "feat: integrate camiones state and addCamion in AppContext"
```

---

### Task 4: Modificar Navegación y Ruteo

**Files:**
- Modify: [src/components/Layout.tsx](file:///C:/Avicola/src/components/Layout.tsx)
- Modify: [src/App.tsx](file:///C:/Avicola/src/App.tsx)

- [ ] **Step 1: Agregar navegación en `Layout.tsx`**

Importar `Truck` de `lucide-react` y agregarlo al array de navegación:
```typescript
import { 
  LayoutDashboard, 
  Boxes, 
  ShoppingCart, 
  Search,
  RefreshCw, 
  Database, 
  Wifi, 
  WifiOff,
  Menu,
  X,
  Truck
} from 'lucide-react';
```
Actualizar `navigation` array:
```typescript
  const navigation = [
    { name: 'Dashboard', id: 'dashboard', icon: LayoutDashboard },
    { name: 'Gestión de Lotes', id: 'lotes', icon: Boxes },
    { name: 'Procesamiento y Ventas', id: 'ventas', icon: ShoppingCart },
    { name: 'Búsqueda Histórica', id: 'busqueda', icon: Search },
    { name: 'Camiones', id: 'camiones', icon: Truck },
  ];
```

- [ ] **Step 2: Agregar caso de renderizado en `App.tsx`**

Importar `CamionesForm` de `./components/CamionesForm` y agregar el caso `'camiones'` en `renderContent`:
```typescript
import { CamionesForm } from './components/CamionesForm';
// ...
      case 'camiones':
        return <CamionesForm />;
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Layout.tsx src/App.tsx
git commit -m "feat: add Camiones item to sidebar navbar and app router"
```

---

### Task 5: Crear el Componente `CamionesForm.tsx`

**Files:**
- Create: [src/components/CamionesForm.tsx](file:///C:/Avicola/src/components/CamionesForm.tsx)

- [ ] **Step 1: Crear el componente con formulario y animación Lottie**

Crear el archivo [src/components/CamionesForm.tsx](file:///C:/Avicola/src/components/CamionesForm.tsx) completo:
```typescript
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Truck, User, Calendar, Plus, RefreshCw } from 'lucide-react';
import Lottie from 'lottie-react';

export const CamionesForm: React.FC = () => {
  const { camiones, addCamion, isLoading } = useApp();
  const [placa, setPlaca] = useState('');
  const [conductor, setConductor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lottieData, setLottieData] = useState<any>(null);

  useEffect(() => {
    // Animación Lottie gratuita de un camión de entrega
    fetch('https://lottie.host/82df0e2a-ce5b-430c-9759-3cb3e9bf00cf/aP14o48qjV.json')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Error cargando Lottie');
      })
      .then(data => setLottieData(data))
      .catch(err => console.warn('Lottie falló al cargar, usaremos un icono estático.', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placa.trim() || !conductor.trim()) return;

    // Validación formato de placa estándar de Perú (e.g. ABC-123 o A1B-234)
    const cleanPlaca = placa.trim().toUpperCase();
    if (!/^[A-Z0-9]{3}-[A-Z0-9]{3}$/.test(cleanPlaca)) {
      alert('La placa debe tener el formato AAA-123 (tres letras/números, guion, tres letras/números)');
      return;
    }

    setIsSubmitting(true);
    try {
      await addCamion({
        placa: cleanPlaca,
        conductor: conductor.trim(),
        fechaRegistro: new Date().toLocaleDateString('es-ES'),
      });
      setPlaca('');
      setConductor('');
    } catch (error) {
      // Error manejado en AppContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Sección Superior: Título y Lottie */}
      <div className="bg-white p-6 rounded-2xl border border-brandBorder shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="space-y-2 max-w-lg z-10">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Control de Vehículos y Camiones
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Registra y administra los camiones autorizados para el transporte de lotes de aves. Las placas registradas aquí se seleccionarán automáticamente en el formulario de ingreso de lotes.
          </p>
        </div>
        <div className="w-40 h-40 flex items-center justify-center relative flex-shrink-0">
          {lottieData ? (
            <Lottie animationData={lottieData} loop={true} style={{ width: 160, height: 160 }} />
          ) : (
            <div className="p-6 bg-indigo-50 rounded-full border border-indigo-100 text-indigo-600 animate-pulse">
              <Truck className="h-16 w-16" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de registro */}
        <div className="bg-white p-6 rounded-2xl border border-brandBorder shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-indigo-600" />
            Registrar Camión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Placa del Vehículo
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Truck className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="E.g., APX-755"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono tracking-wider"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Nombre del Conductor
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="E.g., Juan Pérez"
                  value={conductor}
                  onChange={(e) => setConductor(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shadow-sm shadow-indigo-100 hover:shadow-indigo-200/60"
            >
              {isSubmitting || isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Registrar
            </button>
          </form>
        </div>

        {/* Listado de vehículos */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-brandBorder shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-between">
            <span>Vehículos Registrados</span>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {camiones.length} activos
            </span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-2">Placa</th>
                  <th className="pb-3 px-2">Conductor</th>
                  <th className="pb-3 px-2 text-right">Fecha Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {camiones.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400">
                      No hay vehículos registrados todavía.
                    </td>
                  </tr>
                ) : (
                  camiones.map((camion) => (
                    <tr key={camion.placa} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-2 font-mono font-semibold text-indigo-600">
                        {camion.placa}
                      </td>
                      <td className="py-3.5 px-2 text-slate-700 font-medium">
                        {camion.conductor}
                      </td>
                      <td className="py-3.5 px-2 text-slate-400 text-right font-sans">
                        {camion.fechaRegistro || 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CamionesForm.tsx
git commit -m "feat: add CamionesForm component with Lottie truck animation"
```

---

### Task 6: Modificar el Formulario de Lotes

**Files:**
- Modify: [src/components/LotesForm.tsx](file:///C:/Avicola/src/components/LotesForm.tsx)

- [ ] **Step 1: Reemplazar input de placaCamion con un select**

Importar `useApp` (si no está importado) o extraer `camiones` del contexto. En `LotesForm.tsx`, el hook `useApp` ya está importado:
```typescript
const { addLote, refreshData, isLoading, lotes } = useApp();
```
Modificar para extraer `camiones`:
```typescript
const { addLote, refreshData, isLoading, lotes, camiones } = useApp();
```

En la inicialización del estado en `LotesForm.tsx`:
```typescript
const [placaCamion, setPlacaCamion] = useState('');
```
Y en un `useEffect`, establecer el valor inicial de `placaCamion` al primer camión disponible si existe, o dejarlo en blanco:
```typescript
useEffect(() => {
  if (camiones.length > 0 && !placaCamion) {
    setPlacaCamion(camiones[0].placa);
  }
}, [camiones]);
```

- [ ] **Step 2: Reemplazar el input de placaCamion por un select**

Ubicar la sección del formulario de Placa Camión en `LotesForm.tsx` (líneas ~130-136) y reemplazar:
```typescript
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Placa Camión
              </label>
              {camiones.length > 0 ? (
                <select
                  value={placaCamion}
                  onChange={(e) => setPlacaCamion(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                  required
                >
                  {camiones.map((c) => (
                    <option key={c.placa} value={c.placa}>
                      {c.placa} - {c.conductor}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-semibold flex items-center justify-between">
                  <span>No hay camiones registrados</span>
                  <span className="underline cursor-pointer">Registrar uno</span>
                </div>
              )}
            </div>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/LotesForm.tsx
git commit -m "feat: replace raw text placaCamion input with select dropdown in LotesForm"
```
