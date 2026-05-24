import React from 'react';
import { useApp } from '../context/AppContext';
import { DollarSign, Scale, TrendingUp, Inbox, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { ventas, lotes } = useApp();

  // Calcular métricas
  const totalInversión = ventas.reduce((acc, v) => acc + (v.costoTotal || 0), 0);
  const totalIngresos = ventas.reduce((acc, v) => acc + (v.ventaNeta || 0), 0);
  const margenNeto = totalIngresos - totalInversión;
  const rentabilidadPonderada = totalInversión > 0 ? (margenNeto / totalInversión) * 100 : 0;
  const totalKilosLlegada = ventas.reduce((acc, v) => acc + (v.pesoLlegada || 0), 0);
  
  // Lotes activos
  const totalLotes = lotes.length;
  const totalBajasTransporte = lotes.reduce((acc, l) => acc + (l.pollosMuertos || 0), 0);

  // Datos para gráficos (últimos 5 registros)
  const ultimosRegistros = [...ventas].slice(-5).reverse();

  // Calcular costos promedios por lote para graficar
  // Haremos un gráfico SVG dinámico
  const maxVal = Math.max(...ultimosRegistros.map(v => Math.max(v.ventaNeta / (v.pesoLlegada || 1), v.costoTotal / (v.pesoOrigen || 1), 8)), 10);
  const minVal = 0;
  
  const getSvgCoordinates = (val: number, index: number, total: number, width: number, height: number) => {
    const x = (index / (total - 1 || 1)) * (width - 80) + 40;
    const y = height - ((val - minVal) / (maxVal - minVal || 1)) * (height - 60) - 30;
    return { x, y };
  };

  const drawSvgLine = (values: number[], width: number, height: number) => {
    if (values.length === 0) return '';
    return values.map((val, idx) => {
      const { x, y } = getSvgCoordinates(val, idx, values.length, width, height);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const chartWidth = 500;
  const chartHeight = 200;

  // Extraer valores de costo/kg y venta/kg
  const costoKgVals = ultimosRegistros.map(v => {
    return v.costoTotal / (v.pesoOrigen || 1); // Costo por kg en origen/AQP
  }).reverse();

  const ventaKgVals = ultimosRegistros.map(v => {
    const peso = v.pesoLlegada || 1;
    return v.ventaNeta / peso; // Precio de venta por kg
  }).reverse();

  const lineCosto = drawSvgLine(costoKgVals, chartWidth, chartHeight);
  const lineVenta = drawSvgLine(ventaKgVals, chartWidth, chartHeight);

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-slate-800">
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

          <div className="relative w-full aspect-[2.2/1] md:aspect-[2.5/1] min-h-[200px]">
            {ultimosRegistros.length >= 2 ? (
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
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
                <p className="text-xs text-slate-400">Se necesitan al menos 2 ventas registradas para dejas la gráfica activa</p>
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
                <span className="text-xs text-slate-505 font-medium">Rendimiento Promedio</span>
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
    </div>
  );
};
