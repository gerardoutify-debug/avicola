# SAP Morning Horizon Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the visual appearance of the Poultry Simulator from the dark theme to the official SAP S/4HANA Morning Horizon Light Theme, utilizing a dark Shell header sidebar.

**Architecture:** We will adjust the Tailwind CSS configuration for light-mode background color tokens, re-define the indigo color spectrum as SAP Blue, and update individual React components to swap deep dark classes for clean enterprise light-mode classes.

**Tech Stack:** React, Vite, TypeScript, Tailwind CSS, Lucide Icons.

---

### Task 1: Color Tokens and Base Styles

**Files:**
- Modify: `C:\Avicola\tailwind.config.js`
- Modify: `C:\Avicola\src\index.css`

- [ ] **Step 1: Modify Tailwind CSS configuration file**
  Add the `brandBg`, `brandCard`, `brandBorder`, and `brandShell` color tokens to `tailwind.config.js`. Redefine indigo to official SAP Fiori Horizon Blue.
  
  ```javascript
  /** @type {import('tailwindcss').Config} */
  export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          brandBg: '#F3F4F5', // SAP Fiori Horizon Light Background
          brandCard: '#FFFFFF', // Pure White for Fiori Cards
          brandBorder: '#D3D7DB', // Clean light border
          brandShell: '#1C2D3D', // Dark SAP Shell navigation header background
          brandTextPrimary: '#32363A', // SAP Primary dark text
          brandTextSecondary: '#555A5F', // SAP Secondary muted text
          indigo: {
            50: '#F2F8FC',
            100: '#E1F0FA',
            200: '#BBDCF5',
            300: '#8BC3F0',
            400: '#4DB3FF', // SAP Light blue
            500: '#0070F2', // SAP Horizon Blue
            600: '#0A6ED1', // SAP Primary Fiori Blue
            700: '#0854A0',
            800: '#063B70',
            900: '#032240',
          }
        }
      },
    },
    plugins: [],
  }
  ```

- [ ] **Step 2: Modify index.css base body styles**
  Overwrite `index.css` to use light mode backgrounds, dark text colors, and light scrollbars.
  
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  @layer base {
    body {
      @apply bg-brandBg text-slate-800 antialiased min-h-screen selection:bg-indigo-100 selection:text-indigo-900;
      font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  }

  /* Custom light premium scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #F3F4F5;
  }

  ::-webkit-scrollbar-thumb {
    background: #D3D7DB;
    border: 2px solid #F3F4F5;
    border-radius: 9999px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #B0B5B9;
  }
  ```

- [ ] **Step 3: Verify configuration compiling successfully**
  Run: `npm run build`
  Expected output: Built successfully without errors.

---

### Task 2: Layout Component Theme Update

**Files:**
- Modify: `C:\Avicola\src\components\Layout.tsx`

- [ ] **Step 1: Update navigation sidebar, header, and active indicators**
  Modify classes in `Layout.tsx` to set dark Shell Navigation bar (`brandShell`) and white main header with dark borders and texts.
  
  Replace lines 16-95 inside `Layout.tsx` with light Fiori styles:
  ```tsx
      <aside className="w-64 bg-brandShell flex flex-col flex-shrink-0">
        {/* Header/Logo */}
        <div className="h-16 px-6 flex items-center border-b border-slate-700/50 gap-3">
          <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white text-lg tracking-wider">
            AV
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide uppercase text-slate-100 m-0">AVÍCOLA</h1>
            <p className="text-xs text-slate-400">Panel de Simulación</p>
          </div>
        </div>

        {/* Links de Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 gap-3 group relative ${
                  isActive
                    ? 'bg-slate-800 text-white border border-slate-700/40'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white border border-transparent'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                {item.name}
                {isActive && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-indigo-500 rounded-l-md" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer / Barra de Estado de Conexión */}
        <div className="p-4 border-t border-slate-700/50 bg-slate-950/30">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Modo de Datos:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xxs font-medium tracking-wide uppercase border ${
                mode === 'live'
                  ? 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
              }`}>
                {mode === 'live' ? 'En Vivo' : 'Demo Local'}
              </span>
            </div>

            {mode === 'live' ? (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  {authActive ? (
                    <>
                      <Wifi className="h-3.5 w-3.5 text-teal-400" />
                      Sincronizado
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3.5 w-3.5 text-rose-400" />
                      Desconectado
                    </>
                  )}
                </span>
                {!authActive && (
                  <button 
                    onClick={loginGoogle}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold focus:outline-none"
                  >
                    Conectar
                  </button>
                )}
              </div>
            ) : (
              <div className="text-xxs text-slate-400 italic">
                Usando almacenamiento local
              </div>
            )}

            <button
              onClick={refreshData}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              Recargar Datos
            </button>
          </div>
        </div>
  ```

- [ ] **Step 2: Update Layout header and main workspace backgrounds**
  Modify header container to have a clean white background, dark grey borders, and dark gray text.
  
  Replace lines 102-127 inside `Layout.tsx`:
  ```tsx
      <main className="flex-1 flex flex-col overflow-hidden bg-brandBg relative">
        <header className="h-16 px-8 flex items-center justify-between border-b border-brandBorder bg-white z-10">
          <h2 className="text-lg font-bold tracking-tight text-slate-800 capitalize">
            {navigation.find(n => n.id === activeTab)?.name || activeTab}
          </h2>
          
          <div className="flex items-center gap-4">
            {/* Indicador de carga */}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Sincronizando...
              </div>
            )}
            
            {/* Conectado a Sheets info */}
            {mode === 'live' && authActive && (
              <div className="flex items-center gap-2 text-xs text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200">
                <Database className="h-3.5 w-3.5" />
                Sheets API OK
              </div>
            )}
          </div>
        </header>
  ```

- [ ] **Step 3: Validate compile integrity**
  Run: `npm run build`
  Expected output: Built successfully without errors.

---

### Task 3: Dashboard Theme Update

**Files:**
- Modify: `C:\Avicola\src\components\Dashboard.tsx`

- [ ] **Step 1: Modify Dashboard cards and text elements to light theme**
  Update metric panels to use white backgrounds, clean gray borders, and dark slate headings.
  
  Modify the card containers in `src/components/Dashboard.tsx` to look like this:
  ```tsx
      {/* Grid de Tarjetas KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Inversión Total */}
        <div className="bg-brandCard border border-brandBorder rounded-2xl p-6 flex items-center justify-between group hover:border-slate-300 transition-colors shadow-sm">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Inversión AQP</span>
            <span className="text-2xl font-bold text-slate-800 block">
              S/. {totalInversión.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xxs text-slate-400 flex items-center gap-1">
              Costo total pollo vivo + flete
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-600 group-hover:scale-110 transition-transform">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 2: Ingresos Totales */}
        <div className="bg-brandCard border border-brandBorder rounded-2xl p-6 flex items-center justify-between group hover:border-slate-300 transition-colors shadow-sm">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Ingresos Totales</span>
            <span className="text-2xl font-bold text-teal-600 block">
              S/. {totalIngresos.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xxs text-slate-400 flex items-center gap-1">
              Ventas netas registradas
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-teal-50 flex items-center justify-center border border-teal-100 text-teal-600 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 3: Margen y Rentabilidad */}
        <div className="bg-brandCard border border-brandBorder rounded-2xl p-6 flex items-center justify-between group hover:border-slate-300 transition-colors shadow-sm">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Margen Neto</span>
            <span className={`text-2xl font-bold block ${margenNeto >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
              S/. {margenNeto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xxs text-slate-400 flex items-center gap-1">
              {margenNeto >= 0 ? (
                <span className="text-teal-600 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  +{rentabilidadPonderada.toFixed(2)}%
                </span>
              ) : (
                <span className="text-rose-600 flex items-center">
                  <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  {rentabilidadPonderada.toFixed(2)}%
                </span>
              )}
              de rentabilidad promedio
            </span>
          </div>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center border transition-all duration-200 group-hover:scale-110 ${
            margenNeto >= 0 
              ? 'bg-teal-50 border-teal-100 text-teal-600' 
              : 'bg-rose-50 border-rose-100 text-rose-600'
          }`}>
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 4: Kilos Puestos en Destino */}
        <div className="bg-brandCard border border-brandBorder rounded-2xl p-6 flex items-center justify-between group hover:border-slate-300 transition-colors shadow-sm">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Masa en AQP</span>
            <span className="text-2xl font-bold text-slate-800 block">
              {totalKilosLlegada.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg
            </span>
            <span className="text-xxs text-slate-400 flex items-center gap-1">
              Peso total de llegada a destino
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-600 group-hover:scale-110 transition-transform">
            <Scale className="h-5 w-5" />
          </div>
        </div>
      </div>
  ```

- [ ] **Step 2: Modify Dashboard SVG graph and panels**
  Change graph grid lines to use light grey opacity and dark labels. Modify sidebar metrics block.
  
  Replace lines 112-280 inside `Dashboard.tsx`:
  ```tsx
      {/* Gráficos e Historial */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico SVG (2/3 de ancho) */}
        <div className="lg:col-span-2 bg-brandCard border border-brandBorder rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Tendencia de Precios (Costo/Kg vs Venta/Kg)</h3>
              <p className="text-xs text-slate-400">Comparación de los últimos 5 lotes operados</p>
            </div>
            <div className="flex items-center gap-4 text-xxs font-medium tracking-wide">
              <span className="flex items-center gap-1.5 text-indigo-600 uppercase">
                <span className="w-3 h-0.5 bg-indigo-500 inline-block" />
                Costo/KG Prom.
              </span>
              <span className="flex items-center gap-1.5 text-teal-600 uppercase">
                <span className="w-3 h-0.5 bg-teal-500 inline-block" />
                Venta/KG Prom.
              </span>
            </div>
          </div>

          <div className="relative">
            {ultimosRegistros.length >= 2 ? (
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-56 overflow-visible">
                {/* Grilla horizontal */}
                {[0, 1, 2, 3].map((g) => {
                  const yVal = chartHeight - 30 - (g / 3) * (chartHeight - 60);
                  const displayPrice = (minVal + (g / 3) * (maxVal - minVal)).toFixed(2);
                  return (
                    <g key={g} className="opacity-100">
                      <line x1="40" y1={yVal} x2={chartWidth - 40} y2={yVal} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="32" y={yVal + 3} textAnchor="end" fill="#64748B" fontSize="9" fontFamily="sans-serif">
                        S/.{displayPrice}
                      </text>
                    </g>
                  );
                })}

                {/* Etiquetas eje X */}
                {ultimosRegistros.map((v, idx) => {
                  const { x } = getSvgCoordinates(0, idx, ultimosRegistros.length, chartWidth, chartHeight);
                  return (
                    <text
                      key={idx}
                      x={x}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      fill="#64748B"
                      fontSize="9"
                      fontFamily="sans-serif"
                      className="opacity-90"
                    >
                      {v.idPedido}
                    </text>
                  );
                })}

                {/* Línea Costo */}
                <path d={lineCosto} fill="none" stroke="#0A6ED1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {costoKgVals.map((val, idx) => {
                  const { x, y } = getSvgCoordinates(val, idx, costoKgVals.length, chartWidth, chartHeight);
                  return (
                    <circle key={idx} cx={x} cy={y} r="4" fill="#FFFFFF" stroke="#0A6ED1" strokeWidth="2.5" />
                  );
                })}

                {/* Línea Venta */}
                <path d={lineVenta} fill="none" stroke="#107F3E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {ventaKgVals.map((val, idx) => {
                  const { x, y } = getSvgCoordinates(val, idx, ventaKgVals.length, chartWidth, chartHeight);
                  return (
                    <circle key={idx} cx={x} cy={y} r="4" fill="#FFFFFF" stroke="#107F3E" strokeWidth="2.5" />
                  );
                })}
              </svg>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center border border-dashed border-brandBorder rounded-xl gap-2">
                <Inbox className="h-8 w-8 text-slate-400" />
                <p className="text-xs text-slate-400">Se necesitan al menos 2 ventas registradas para dibujar el gráfico</p>
              </div>
            )}
          </div>
        </div>

        {/* Resumen del Negocio (1/3 de ancho) */}
        <div className="bg-brandCard border border-brandBorder rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Eficiencia Logística y Pérdidas</h3>
            <p className="text-xs text-slate-400">Control de mermas y mortalidad en transporte</p>
          </div>

          <div className="space-y-4">
            {/* Lotes Totales */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-brandBorder">
              <div>
                <span className="text-xs text-slate-500 block font-medium">Lotes Operados</span>
                <span className="text-sm font-semibold text-slate-800">{totalLotes} lotes</span>
              </div>
              <span className="text-xxs text-slate-400">Total acumulado</span>
            </div>

            {/* Mortalidad acumulada */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-brandBorder">
              <div>
                <span className="text-xs text-slate-500 block font-medium">Mortalidad</span>
                <span className="text-sm font-semibold text-rose-600">{totalBajasTransporte} pollos</span>
              </div>
              <span className="text-xxs text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Bajas en Viaje
              </span>
            </div>

            {/* Merma Estimada */}
            <div className="flex flex-col gap-2 p-3.5 bg-slate-50 rounded-xl border border-brandBorder">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Rendimiento Promedio</span>
                <span className="text-xs font-semibold text-teal-600">
                  {ventas.length > 0
                    ? (ventas.reduce((acc, v) => acc + parseFloat(v.rendimientoCarcasa || '0'), 0) / ventas.length).toFixed(2) + '%'
                    : '0.00%'}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: ventas.length > 0
                      ? `${Math.min(100, ventas.reduce((acc, v) => acc + parseFloat(v.rendimientoCarcasa || '0'), 0) / ventas.length)}%`
                      : '0%'
                  }}
                />
              </div>
              <span className="text-xxs text-slate-400">Rendimiento de carcasa faenado promedio</span>
            </div>
          </div>
        </div>
      </div>
  ```

- [ ] **Step 3: Verify compiling output**
  Run: `npm run build`
  Expected output: Built successfully without errors.

---

### Task 4: Lotes Form Theme Update

**Files:**
- Modify: `C:\Avicola\src\components\LotesForm.tsx`

- [ ] **Step 1: Update Lotes registration form layout and colors**
  Modify card backgrounds to `bg-brandCard`, borders to `border-brandBorder`, text colors, input element background (`bg-white`) and borders (`border-[#B0B5B9]`).
  
  Replace lines 150-320 inside `LotesForm.tsx` with light styles:
  ```tsx
        {/* Formulario y Calculadora (12 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSubmit} className="bg-brandCard border border-brandBorder rounded-2xl p-6 space-y-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Nuevo Lote: Datos de Entrada
            </h3>

            {/* Fila 1: Datos de Compra */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider">Fecha de Ingreso</label>
                <input
                  type="text"
                  value={fechaIngreso}
                  onChange={(e) => setFechaIngreso(e.target.value)}
                  placeholder="DD/MM/YYYY"
                  className="w-full bg-white border border-[#B0B5B9] rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider">N° Factura</label>
                <input
                  type="text"
                  value={nroFactura}
                  onChange={(e) => setNroFactura(e.target.value)}
                  className="w-full bg-white border border-[#B0B5B9] rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider">Placa Camión</label>
                <input
                  type="text"
                  value={placaCamion}
                  onChange={(e) => setPlacaCamion(e.target.value)}
                  className="w-full bg-white border border-[#B0B5B9] rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Fila 2: Proveedor y Origen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider">Proveedor</label>
                <input
                  type="text"
                  value={proveedor}
                  onChange={(e) => setProveedor(e.target.value)}
                  className="w-full bg-white border border-[#B0B5B9] rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider">Origen</label>
                <input
                  type="text"
                  value={origen}
                  onChange={(e) => setOrigen(e.target.value)}
                  className="w-full bg-white border border-[#B0B5B9] rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Fila 3: Precios e inputs numéricos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider">Precio / KG Compra</label>
                <input
                  type="number"
                  step="0.01"
                  value={precioKg}
                  onChange={(e) => setPrecioKg(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-[#B0B5B9] rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider">Total de Jabas</label>
                <input
                  type="number"
                  value={totalJabas}
                  onChange={(e) => setTotalJabas(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-white border border-[#B0B5B9] rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider">Costo Flete</label>
                <input
                  type="number"
                  step="0.01"
                  value={fleteTotal}
                  onChange={(e) => setFleteTotal(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-[#B0B5B9] rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider">Bajas (Muertos en Viaje)</label>
                <input
                  type="number"
                  value={pollosMuertos}
                  onChange={(e) => setPollosMuertos(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-white border border-[#B0B5B9] rounded-xl px-4 py-2.5 text-xs text-rose-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Parámetros biológicos (Sexo) */}
            <div className="border-t border-brandBorder pt-6 space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="h-4 w-4 text-indigo-600" />
                Parámetros Biológicos por Sexo
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hembra Card */}
                <div className="bg-slate-50 border border-brandBorder rounded-xl p-4 space-y-4">
                  <span className="text-xs font-semibold text-pink-600 block border-b border-brandBorder pb-2">HEMBRAS</span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-xxs text-slate-500">% del lote</label>
                      <input
                        type="number"
                        value={porcentajeHembra}
                        onChange={(e) => handleHembraPctChange(parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-white border border-[#B0B5B9] rounded-lg px-2.5 py-1.5"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xxs text-slate-500">Pollos/Jaba</label>
                      <input
                        type="number"
                        value={pollosxJabaHembra}
                        onChange={(e) => setPollosxJabaHembra(parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-white border border-[#B0B5B9] rounded-lg px-2.5 py-1.5"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xxs text-slate-500">Kg Mínimo</label>
                      <input
                        type="number"
                        step="0.01"
                        value={pesoMinHembra}
                        onChange={(e) => setPesoMinHembra(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-[#B0B5B9] rounded-lg px-2.5 py-1.5"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xxs text-slate-500">Kg Máximo</label>
                      <input
                        type="number"
                        step="0.01"
                        value={pesoMaxHembra}
                        onChange={(e) => setPesoMaxHembra(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-[#B0B5B9] rounded-lg px-2.5 py-1.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Macho Card */}
                <div className="bg-slate-50 border border-brandBorder rounded-xl p-4 space-y-4">
                  <span className="text-xs font-semibold text-blue-600 block border-b border-brandBorder pb-2">MACHOS</span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-xxs text-slate-500">% del lote</label>
                      <input
                        type="number"
                        value={porcentajeMacho}
                        onChange={(e) => handleMachoPctChange(parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-white border border-[#B0B5B9] rounded-lg px-2.5 py-1.5"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xxs text-slate-500">Pollos/Jaba</label>
                      <input
                        type="number"
                        value={pollosxJabaMacho}
                        onChange={(e) => setPollosxJabaMacho(parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-white border border-[#B0B5B9] rounded-lg px-2.5 py-1.5"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xxs text-slate-500">Kg Mínimo</label>
                      <input
                        type="number"
                        step="0.01"
                        value={pesoMinMacho}
                        onChange={(e) => setPesoMinMacho(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-[#B0B5B9] rounded-lg px-2.5 py-1.5"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xxs text-slate-500">Kg Máximo</label>
                      <input
                        type="number"
                        step="0.01"
                        value={pesoMaxMacho}
                        onChange={(e) => setPesoMaxMacho(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-[#B0B5B9] rounded-lg px-2.5 py-1.5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
  ```

- [ ] **Step 2: Modify Lotes sidebar real-time preview panel and table list**
  Change real-time calculation box background to `#FFFFFF`, text to `#32363A`, and table hover background to `#E5F0FA` (SAP Blue selection style).
  
  Replace lines 320-550 inside `LotesForm.tsx`:
  ```tsx
        {/* Panel de Cálculo en Tiempo Real (4 cols) */}
        <div className="lg:col-span-4 bg-brandCard border border-brandBorder rounded-2xl p-6 space-y-6 shadow-sm relative overflow-hidden">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Calculadora en Tiempo Real</h3>
            <p className="text-xs text-slate-400">Previsualización del costo del lote antes de guardar</p>
          </div>

          <div className="space-y-3.5 text-xs text-slate-700">
            {/* Peso Ponderado */}
            <div className="flex justify-between border-b border-brandBorder pb-2">
              <span className="text-slate-500">Peso Ponderado/Pollo</span>
              <span className="font-semibold text-slate-800">{results.promPesoPolloPonderado.toFixed(3)} kg</span>
            </div>

            {/* Pollos por Jaba */}
            <div className="flex justify-between border-b border-brandBorder pb-2">
              <span className="text-slate-500">Pollos por Jaba Prom.</span>
              <span className="font-semibold text-slate-800">{results.promPolloJabaPonderado.toFixed(1)} pollos</span>
            </div>

            {/* Cantidad estimada */}
            <div className="flex justify-between border-b border-brandBorder pb-2">
              <span className="text-slate-500">Cantidad Total Est.</span>
              <span className="font-semibold text-slate-800">{Math.round(results.cantidadPollosEstimada)} pollos</span>
            </div>

            {/* Kilos totales */}
            <div className="flex justify-between border-b border-brandBorder pb-2">
              <span className="text-slate-500">Kilos Totales Est.</span>
              <span className="font-semibold text-slate-800">{results.kilosTotalesEstimados.toLocaleString('es-PE', { maximumFractionDigits: 3 })} kg</span>
            </div>

            {/* Monto Proveedor */}
            <div className="flex justify-between border-b border-brandBorder pb-2">
              <span className="text-slate-500">Pago Proveedor (Bruto)</span>
              <span className="font-semibold text-slate-800">S/. {results.montoPagarProveedor.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            {/* Merma */}
            <div className="flex justify-between border-b border-brandBorder pb-2">
              <span className="text-slate-500">Merma Est. (125g/pollo)</span>
              <span className="font-semibold text-rose-600">S/. {results.mermaValorizada.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            {/* Valor muertos */}
            <div className="flex justify-between border-b border-brandBorder pb-2">
              <span className="text-slate-500">Pérdida por Bajas (Viaje)</span>
              <span className="font-semibold text-rose-600">S/. {results.valorizadoPollosMuertos.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            {/* Flete */}
            <div className="flex justify-between border-b border-brandBorder pb-2">
              <span className="text-slate-500">Costo Flete</span>
              <span className="font-semibold text-indigo-600">S/. {fleteTotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            {/* COSTO TOTAL AQP */}
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-brandBorder mt-4">
              <span className="font-bold text-slate-800 text-xs">Costo Total Puesto AQP</span>
              <span className="font-extrabold text-teal-600 text-base">
                S/. {results.costoTotalPolloVivoAQP.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Costos Unitarios */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-brandBorder text-center">
                <span className="text-xxs text-slate-500 block">Costo / Pollo Vendible</span>
                <span className="font-bold text-slate-800 text-sm">S/. {results.costoPolloPorUnidad.toFixed(2)}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-brandBorder text-center">
                <span className="text-xxs text-slate-500 block">Costo / KG Real AQP</span>
                <span className="font-bold text-teal-600 text-sm">S/. {results.precioKgPuestoAQP.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historial de Lotes */}
      <div className="bg-brandCard border border-brandBorder rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Historial de Lotes Ingresados</h3>
            <p className="text-xs text-slate-400">Lotes registrados y simulados</p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por factura, placa o proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#B0B5B9] rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {filteredLotes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brandBorder text-slate-500 uppercase tracking-wider font-semibold text-xxs bg-slate-50">
                  <th className="py-2.5 px-4">Fecha</th>
                  <th className="py-2.5 px-4">Factura</th>
                  <th className="py-2.5 px-4">Placa</th>
                  <th className="py-2.5 px-4">Proveedor</th>
                  <th className="py-2.5 px-4 text-right">Jabas</th>
                  <th className="py-2.5 px-4 text-right">Kilos Est.</th>
                  <th className="py-2.5 px-4 text-right">Costo Total AQP</th>
                  <th className="py-2.5 px-4 text-right">Costo/KG AQP</th>
                  <th className="py-2.5 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brandBorder/60">
                {filteredLotes.map((lote, index) => {
                  const m = calcularMétricasLote(lote);
                  return (
                    <tr key={index} className="hover:bg-[#E5F0FA] transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-600">{lote.fechaIngreso}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{lote.nroFactura}</td>
                      <td className="py-3 px-4 text-slate-600">{lote.placaCamion}</td>
                      <td className="py-3 px-4 text-slate-500">{lote.proveedor || '—'}</td>
                      <td className="py-3 px-4 text-right font-medium text-slate-600">{lote.totalJabas}</td>
                      <td className="py-3 px-4 text-right text-slate-600">
                        {m.kilosTotalesEstimados.toLocaleString('es-PE', { maximumFractionDigits: 1 })} kg
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-teal-600">
                        S/. {m.costoTotalPolloVivoAQP.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-indigo-600">S/. {m.precioKgPuestoAQP.toFixed(2)}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedLoteForModal(lote)}
                          className="p-1.5 hover:bg-slate-100 text-indigo-600 hover:text-indigo-800 rounded-lg transition-colors inline-flex items-center justify-center gap-1 focus:outline-none"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="text-xxs">Breakdown</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
            <Inbox className="h-10 w-10 text-slate-300" />
            <span className="text-xs">No se encontraron lotes registrados.</span>
          </div>
        )}
      </div>
  ```

- [ ] **Step 3: Adjust Breakdown modal in Lotes page**
  Modify Lotes modal popup container to use Fiori white colors, gray background borders and dark text colors.
  
  Modify the modal rendering at the bottom of `LotesForm.tsx`:
  ```tsx
            <div className="bg-white border border-brandBorder rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl animate-scaleIn text-slate-800">
              <div className="flex items-center justify-between border-b border-brandBorder pb-3">
                <div>
                  <h4 className="font-bold text-base text-slate-800">Desglose de Simulación Lote</h4>
                  <p className="text-xs text-slate-400">Lote: {m.codigoLote}</p>
                </div>
                <button
                  onClick={() => setSelectedLoteForModal(null)}
                  className="text-slate-600 hover:text-slate-800 text-sm font-bold bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors focus:outline-none"
                >
                  Cerrar
                </button>
              </div>

              {/* Contenido tipo Hoja Excel */}
              <div className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-brandBorder">
                  <div>
                    <h5 className="font-semibold text-slate-500 border-b border-brandBorder/60 pb-1 uppercase tracking-wider text-xxs">Datos Lote</h5>
                    <div className="space-y-1 mt-2">
                      <div className="flex justify-between"><span className="text-slate-400">Proveedor:</span> <span className="text-slate-700 font-semibold">{selectedLoteForModal.proveedor}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Origen:</span> <span className="text-slate-700">{selectedLoteForModal.origen}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Precio/KG Origen:</span> <span className="text-slate-700">S/. {selectedLoteForModal.precioKg.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Total Jabas:</span> <span className="text-slate-700">{selectedLoteForModal.totalJabas}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Total Pollos Est.:</span> <span className="text-slate-700">{Math.round(m.cantidadPollosEstimada)}</span></div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-500 border-b border-brandBorder/60 pb-1 uppercase tracking-wider text-xxs">Distribución Sexo</h5>
                    <div className="space-y-1 mt-2">
                      <div className="flex justify-between"><span className="text-slate-400">Hembra:</span> <span className="text-pink-600">{selectedLoteForModal.porcentajeHembra}% (Prom: {m.promPesoHembra.toFixed(2)} kg)</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Macho:</span> <span className="text-blue-600">{selectedLoteForModal.porcentajeMacho}% (Prom: {m.promPesoMacho.toFixed(2)} kg)</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Peso Ponderado:</span> <span className="text-slate-800 font-bold">{m.promPesoPolloPonderado.toFixed(3)} kg</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Pollos/Jaba Ponderado:</span> <span className="text-slate-700">{m.promPolloJabaPonderado.toFixed(1)} pollos</span></div>
                    </div>
                  </div>
                </div>

                <div className="border border-brandBorder rounded-xl overflow-hidden divide-y divide-brandBorder">
                  <div className="flex justify-between p-3 hover:bg-slate-50">
                    <span className="text-slate-500">Monto Compra Proveedor (Kilos Est. * Precio Base)</span>
                    <span className="font-semibold text-slate-800">S/. {m.montoPagarProveedor.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between p-3 hover:bg-slate-50">
                    <span className="text-slate-500">Merma de Peso Estimada (Deshidratación viaje 125g/pollo)</span>
                    <span className="font-semibold text-rose-600">S/. {m.mermaValorizada.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between p-3 hover:bg-slate-50">
                    <span className="text-slate-500">Pérdida por Bajas (Muertos en viaje: {selectedLoteForModal.pollosMuertos} pollos)</span>
                    <span className="font-semibold text-rose-600">S/. {m.valorizadoPollosMuertos.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between p-3 hover:bg-slate-50">
                    <span className="text-slate-500">Flete Transportista</span>
                    <span className="font-semibold text-indigo-600">S/. {m.valorizadoPollos.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-50 font-bold hover:bg-slate-100">
                    <span className="text-slate-700">Costo Total Puesto AQP</span>
                    <span className="text-teal-600">S/. {m.costoTotalPolloVivoAQP.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-brandBorder text-center">
                    <span className="text-xxs text-slate-400 block">COSTO POR POLLO VENDIBLE</span>
                    <span className="font-bold text-slate-800 text-sm">S/. {m.costoPolloPorUnidad.toFixed(2)}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-brandBorder text-center">
                    <span className="text-xxs text-slate-400 block">COSTO POR KG REAL (AQP)</span>
                    <span className="font-bold text-teal-600 text-sm">S/. {m.precioKgPuestoAQP.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
  ```

- [ ] **Step 4: Verify built target compiles**
  Run: `npm run build`
  Expected output: Built successfully without errors.

---

### Task 5: Ventas Form Theme Update

**Files:**
- Modify: `C:\Avicola\src\components\VentasForm.tsx`

- [ ] **Step 1: Modify Ventas registration forms and fields style**
  Update inputs and cards to use the Morning Horizon light color codes (`bg-brandCard`, `border-brandBorder` and grey inputs border `#B0B5B9`).
  
  Replace lines 112-280 inside `VentasForm.tsx` with light Fiori styles:
  ```tsx
        {/* Formulario de Ventas (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSubmit} className="bg-brandCard border border-brandBorder rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-indigo-600" />
                Registrar Venta / Faenado
              </h3>

              {metricsLote && (
                <button
                  type="button"
                  onClick={handleSugerirDatos}
                  className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 focus:outline-none bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition-all font-semibold"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Sugerir Datos Lote
                </button>
              )}
            </div>

            {/* Fila 1: Selección de Lote y Detalles Básicos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider">Lote de Origen</label>
                <select
                  value={selectedLoteCodigo}
                  onChange={(e) => setSelectedLoteCodigo(e.target.value)}
                  className="w-full bg-white border border-[#B0B5B9] rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  required
                >
                  <option value="" disabled>Selecciona Lote...</option>
                  {lotes.map((l, idx) => {
                    const m = calcularMétricasLote(l);
                    return (
                      <option key={idx} value={m.codigoLote}>
                        {m.codigoLote} ({l.fechaIngreso})
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider">ID Pedido / Venta</label>
                <input
                  type="text"
                  value={idPedido}
                  onChange={(e) => setIdPedido(e.target.value)}
                  className="w-full bg-white border border-[#B0B5B9] rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider">Fecha</label>
                <input
                  type="text"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  placeholder="DD/MM/YYYY"
                  className="w-full bg-white border border-[#B0B5B9] rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Fila 2: Cliente y Tipo de Venta */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider">Cliente</label>
                <input
                  type="text"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="w-full bg-white border border-[#B0B5B9] rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider">Tipo de Venta</label>
                <div className="flex rounded-xl bg-slate-50 p-1 border border-brandBorder">
                  <button
                    type="button"
                    onClick={() => setTipoVenta('Faenado')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold focus:outline-none transition-all ${
                      tipoVenta === 'Faenado'
                        ? 'bg-indigo-600 text-slate-100'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Faenado
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoVenta('Vivo')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold focus:outline-none transition-all ${
                      tipoVenta === 'Vivo'
                        ? 'bg-indigo-600 text-slate-100'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Pollo Vivo
                  </button>
                </div>
              </div>
            </div>

            {/* Datos Físicos y Financieros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-brandBorder pt-6">
              <div className="space-y-1.5">
                <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider">Peso Llegada (KG)</label>
                <input
                  type="number"
                  step="0.001"
                  value={pesoLlegada}
                  onChange={(e) => setPesoLlegada(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-[#B0B5B9] rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider">Muertos en Proceso / Recepción</label>
                <input
                  type="number"
                  value={muertos}
                  onChange={(e) => setMuertos(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-white border border-[#B0B5B9] rounded-xl px-4 py-2.5 text-xs text-rose-600 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider">Venta Neta Cobrada (S/.)</label>
                <input
                  type="number"
                  step="0.01"
                  value={ventaNeta}
                  onChange={(e) => setVentaNeta(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-[#B0B5B9] rounded-xl px-4 py-2.5 text-xs text-teal-600 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Módulo de faenado detallado */}
            {tipoVenta === 'Faenado' && (
              <div className="border-t border-brandBorder pt-6 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="h-4 w-4 text-indigo-600" />
                  Pesos de Desglose de Faenado (Beneficio)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xxs text-slate-500 font-semibold">Carcasa (KG)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={pesoCarcasa}
                      onChange={(e) => setPesoCarcasa(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-[#B0B5B9] rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xxs text-slate-500 font-semibold">Cabezas (KG)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={pesoCabezas}
                      onChange={(e) => setPesoCabezas(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-[#B0B5B9] rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xxs text-slate-500 font-semibold">Hígados (KG)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={pesoHigados}
                      onChange={(e) => setPesoHigados(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-[#B0B5B9] rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xxs text-slate-500 font-semibold">Riñones (KG)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={pesoRinones}
                      onChange={(e) => setPesoRinones(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-[#B0B5B9] rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xxs text-slate-500 font-semibold">Otras (KG)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={pesoOtras}
                      onChange={(e) => setPesoOtras(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-[#B0B5B9] rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
  ```

- [ ] **Step 2: Update Ventas sidebar calculations box and history table**
  Modify sidebar values display background to `#FFFFFF`, text to `#32363A`, and table hover style to `#E5F0FA`.
  
  Replace lines 280-500 inside `VentasForm.tsx`:
  ```tsx
        {/* Panel de Rendimiento en Tiempo Real (4 cols) */}
        <div className="lg:col-span-4 bg-brandCard border border-brandBorder rounded-2xl p-6 space-y-6 shadow-sm relative overflow-hidden text-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Rendimiento Real</h3>
            <p className="text-xs text-slate-400">Eficiencia biológica y márgenes comerciales</p>
          </div>

          {selectedLote && results ? (
            <div className="space-y-4 text-xs font-mono">
              {/* Costo Prorrateado */}
              <div className="flex justify-between border-b border-brandBorder pb-2">
                <span className="text-slate-500">Costo Lote Prorrateado</span>
                <span className="font-semibold text-slate-800">
                  S/. {(pesoLlegada * metricsLote!.precioKgPuestoAQP).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Merma de viaje */}
              <div className="flex justify-between border-b border-brandBorder pb-2">
                <span className="text-slate-500">Merma Viaje</span>
                <span className="font-semibold text-rose-600">
                  {results.mermaTotal.toFixed(2)} kg ({results.porcentajeMerma.toFixed(2)}%)
                </span>
              </div>

              {/* Menudencia total */}
              {tipoVenta === 'Faenado' && (
                <div className="flex justify-between border-b border-brandBorder pb-2">
                  <span className="text-slate-500">Total Menudencia</span>
                  <span className="font-semibold text-slate-800">
                    {results.totalMenudencia.toFixed(3)} kg
                  </span>
                </div>
              )}

              {/* Rendimiento Carcasa */}
              {tipoVenta === 'Faenado' && (
                <div className="flex flex-col gap-1.5 border-b border-brandBorder pb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rendimiento de Carcasa</span>
                    <span className="font-bold text-teal-600">{results.rendimientoCarcasa.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden border border-brandBorder">
                    <div
                      className="bg-teal-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, results.rendimientoCarcasa)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Costo final por KG */}
              <div className="flex justify-between border-b border-brandBorder pb-2">
                <span className="text-slate-500">Costo Final por KG</span>
                <span className="font-bold text-slate-800">S/. {results.costoKgFinal.toFixed(2)}</span>
              </div>

              {/* Margen */}
              <div className="flex justify-between border-b border-brandBorder pb-2">
                <span className="text-slate-500">Margen de Venta</span>
                <span className={`font-semibold ${results.margenContribucion >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
                  S/. {results.margenContribucion.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Rentabilidad */}
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-brandBorder mt-4">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                  <Percent className="h-3.5 w-3.5 text-indigo-600" />
                  Rentabilidad
                </span>
                <span className={`font-extrabold text-sm ${results.margenContribucion >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
                  {results.porcentajeRentabilidad.toFixed(2)}%
                </span>
              </div>
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center border border-dashed border-brandBorder rounded-xl gap-2">
              <Inbox className="h-8 w-8 text-slate-400" />
              <p className="text-xs text-slate-400 text-center px-4">Debes registrar y seleccionar al menos un lote para activar la calculadora</p>
            </div>
          )}
        </div>
      </div>

      {/* Historial de Ventas / Base de Datos */}
      <div className="bg-brandCard border border-brandBorder rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Histórico de la Base de Datos</h3>
            <p className="text-xs text-slate-400">Registros guardados de ventas y faenado</p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, ID o código de lote..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#B0B5B9] rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none"
            />
          </div>
        </div>

        {filteredVentas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brandBorder text-slate-500 uppercase tracking-wider font-semibold text-xxs bg-slate-50">
                  <th className="py-2.5 px-4">ID</th>
                  <th className="py-2.5 px-4">Fecha</th>
                  <th className="py-2.5 px-4">Cliente</th>
                  <th className="py-2.5 px-4">Lote Código</th>
                  <th className="py-2.5 px-4">Tipo</th>
                  <th className="py-2.5 px-4 text-right">Llegada (KG)</th>
                  <th className="py-2.5 px-4 text-right">Carcasa (KG)</th>
                  <th className="py-2.5 px-4 text-right">Rend. Carcasa</th>
                  <th className="py-2.5 px-4 text-right">Venta Neta</th>
                  <th className="py-2.5 px-4 text-right">Rentabilidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brandBorder/60">
                {filteredVentas.map((venta, index) => (
                  <tr key={index} className="hover:bg-[#E5F0FA] transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-600">{venta.idPedido}</td>
                    <td className="py-3 px-4 text-slate-600">{venta.fecha}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{venta.cliente}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{venta.loteCodigo}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-medium ${
                        venta.tipoVenta === 'Faenado'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-teal-50 text-teal-700'
                      }`}>
                        {venta.tipoVenta}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {venta.pesoLlegada.toLocaleString('es-PE', { minimumFractionDigits: 3 })} kg
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {venta.pesoCarcasa > 0 ? `${venta.pesoCarcasa.toLocaleString('es-PE', { minimumFractionDigits: 3 })} kg` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-teal-600">{venta.rendimientoCarcasa}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">
                      S/. {venta.ventaNeta.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold ${
                      parseFloat(venta.porcentajeRentabilidad) >= 0 ? 'text-teal-600' : 'text-rose-600'
                    }`}>
                      {venta.porcentajeRentabilidad}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
            <Inbox className="h-10 w-10 text-slate-300" />
            <span className="text-xs">No hay registros de ventas guardados.</span>
          </div>
        )}
      </div>
  ```

- [ ] **Step 3: Run production compilation check**
  Run: `npm run build`
  Expected output: Built successfully without errors.

---

### Task 6: Config Modal Theme Update

**Files:**
- Modify: `C:\Avicola\src\components\ConfigModal.tsx`

- [ ] **Step 1: Modify Config Modal card layout and connection panel**
  Convert the page elements to light Morning Horizon styling (white background cards, grey borders, grey input elements).
  
  Replace lines 20-140 inside `ConfigModal.tsx` with light Fiori styling:
  ```tsx
  return (
    <div className="max-w-4xl mx-auto space-y-8 text-slate-800">
      {/* Tarjeta de Estado de Conexión */}
      <div className="bg-brandCard border border-brandBorder rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-10 relative">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">Estado de la Integración</h3>
            <p className="text-sm text-slate-500">
              {mode === 'live'
                ? 'Conectado activamente a las APIs oficiales de Google Sheets'
                : 'Operando localmente en Modo Demo'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMode(mode === 'live' ? 'demo' : 'live')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all duration-200 ${
                mode === 'live'
                  ? 'bg-teal-50 hover:bg-teal-100 text-teal-600 border-teal-200'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-indigo-200'
              }`}
            >
              Cambiar a {mode === 'live' ? 'Modo Demo' : 'Modo En Vivo'}
            </button>
            
            {mode === 'live' && (
              authActive ? (
                <button
                  onClick={logoutGoogle}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesión
                </button>
              ) : (
                <button
                  onClick={loginGoogle}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-all"
                >
                  Iniciar Sesión Google
                </button>
              )
            )}
          </div>
        </div>

        {/* Decoración de fondo */}
        <div className={`absolute -right-20 -bottom-20 w-60 h-60 rounded-full blur-3xl opacity-5 ${
          mode === 'live' ? 'bg-teal-500' : 'bg-indigo-500'
        }`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Formulario de Configuración (Columna Izquierda 2/3) */}
        <div className="lg:col-span-2 bg-brandCard border border-brandBorder rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Settings className="h-5 w-5 text-indigo-600" />
              Credenciales de Google Cloud
            </h3>
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 focus:outline-none font-semibold"
            >
              <HelpCircle className="h-4 w-4" />
              {showGuide ? 'Ocultar Guía' : 'Ver Guía paso a paso'}
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="clientId" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                ID de Cliente Google OAuth (Client ID)
              </label>
              <input
                id="clientId"
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="xxxxxx-xxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
                className="w-full bg-white border border-[#B0B5B9] rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                required={mode === 'live'}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="spreadsheetId" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                ID de la Hoja de Cálculo (Spreadsheet ID)
              </label>
              <input
                id="spreadsheetId"
                type="text"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                placeholder="1dK39Vod-d_Pe4u68aC7kI4Fx645t30zIcfB2jHs2iMA"
                className="w-full bg-white border border-[#B0B5B9] rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                required={mode === 'live'}
              />
              <p className="text-xxs text-slate-400 leading-normal">
                Es la clave de texto que aparece en la URL del Google Sheets, justo entre `/d/` y `/edit`.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="apiKey" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                API Key de Google Cloud (Opcional)
              </label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSyAxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-white border border-[#B0B5B9] rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                {isSaved ? (
                  <span className="text-xs text-teal-600 flex items-center gap-1 font-semibold">
                    <CheckCircle className="h-4 w-4" />
                    ¡Configuración Guardada!
                  </span>
                ) : credentials.clientId && credentials.spreadsheetId ? (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-teal-600" />
                    Credenciales configuradas.
                  </span>
                ) : (
                  <span className="text-xs text-indigo-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Faltan credenciales para en vivo.
                  </span>
                )}
              </div>
              
              <button
                type="submit"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-slate-100 font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 text-sm"
              >
                <Save className="h-4 w-4" />
                Guardar Ajustes
              </button>
            </div>
          </form>
        </div>

        {/* Panel lateral informativo (Guía) */}
        <div className="bg-brandCard border border-brandBorder rounded-2xl p-6 space-y-6 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Info className="h-4 w-4 text-teal-600" />
            Integración Directa
          </h4>

          <div className="space-y-4 text-xs text-slate-500 leading-relaxed">
            <p>
              Esta aplicación web es 100% estática y se comunica directamente con las APIs de Google sin enviar tus datos a un servidor externo.
            </p>
            <div className="border-t border-brandBorder pt-4 space-y-3">
              <h5 className="font-semibold text-slate-700">Pestañas necesarias en tu Google Sheet:</h5>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <code className="text-xxs px-1 py-0.5 font-bold text-teal-700 bg-teal-50 border border-teal-200 rounded">Base de Datos</code>: El simulador registrará aquí las ventas e información de rendimiento de carcasa.
                </li>
                <li>
                  <code className="text-xxs px-1 py-0.5 font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded">Registro_Lotes</code>: Guardará la configuración biológica detallada de cada compra.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  ```

- [ ] **Step 2: Update Config guide box**
  Change guide box background to `#FFFFFF`, border `#D3D7DB`, and list item styles.
  
  Replace lines 140-180 inside `ConfigModal.tsx`:
  ```tsx
      {/* Guía Detallada (Colapsable) */}
      {showGuide && (
        <div className="bg-white border border-brandBorder rounded-2xl p-6 space-y-4 shadow-sm animate-fadeIn">
          <h4 className="text-sm font-bold text-slate-800">Guía de Configuración en Google Cloud Console</h4>
          <ol className="list-decimal pl-5 text-xs text-slate-500 space-y-3">
            <li>
              Entra a <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-semibold">Google Cloud Console</a> e inicia sesión con tu cuenta de Google.
            </li>
            <li>
              Crea un nuevo proyecto haciendo clic en el selector de proyectos en la barra superior.
            </li>
            <li>
              Busca e ingresa a **API de Google Sheets** en la barra de búsqueda y haz clic en **Habilitar (Enable)**.
            </li>
            <li>
              Ve al menú lateral izquierdo, selecciona **APIs y Servicios** &gt; **Pantalla de consentimiento de OAuth**:
              <ul className="list-disc pl-5 mt-1.5 space-y-1">
                <li>Selecciona tipo de usuario **Externo** o **Interno** (si usas cuenta Workspace de empresa).</li>
                <li>Llena los datos básicos (nombre de app, correos del programador) y dale a continuar.</li>
                <li>En **Ámbitos (Scopes)**, agrega `/auth/spreadsheets` para permitir lectura/escritura de las hojas de cálculo.</li>
                <li>En **Usuarios de prueba (Test Users)**, añade tu propio correo de Gmail si estás en modo de prueba.</li>
              </ul>
            </li>
            <li>
              Ve a **APIs y Servicios** &gt; **Credenciales**:
              <ul className="list-disc pl-5 mt-1.5 space-y-1">
                <li>Haz clic en **Crear credenciales** &gt; **ID de cliente de OAuth**.</li>
                <li>Selecciona tipo de aplicación: **Aplicación web**.</li>
                <li>En **Orígenes de JavaScript autorizados**, añade: <code className="text-xxs text-slate-600 font-bold bg-slate-100 border border-slate-200 px-1 py-0.5 rounded">http://localhost:5173</code> (y la URL del dominio de producción si lo despliegas).</li>
                <li>Haz clic en **Crear** y copia el **ID de Cliente** generado para pegarlo en esta app.</li>
              </ul>
            </li>
            <li>
              Asegúrate de que la hoja de cálculo de Google Sheets esté creada en tu cuenta de Gmail e ingresa su ID arriba.
            </li>
          </ol>
        </div>
      )}
    </div>
  );
  ```

- [ ] **Step 3: Run production compilation check**
  Run: `npm run build`
  Expected output: Built successfully without errors.
