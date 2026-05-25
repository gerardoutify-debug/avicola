import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { type Venta, calcularMétricasLote, calcularMétricasVenta, generarIdVenta } from '../utils/calculations';
import { Save, Search, Scale, ShoppingCart, Percent, Inbox, Sparkles, Trash2 } from 'lucide-react';

export const VentasForm: React.FC = () => {
  const { lotes, ventas, addVenta, deleteVenta, showToast, showConfirm } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [selectedLoteCodigo, setSelectedLoteCodigo] = useState('');
  const [fecha, setFecha] = useState(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  });
  const [cliente, setCliente] = useState('Distribuidora San Juan');
  const [tipoVenta, setTipoVenta] = useState<'Entero' | 'Carcasa'>('Carcasa');

  // ID de venta generado automáticamente
  const [idPedido, setIdPedido] = useState<string>('');

  // Cargar ID inicial
  React.useEffect(() => {
    if (!idPedido) {
      setIdPedido(generarIdVenta());
    }
  }, []);

  // Input states
  const [pesoLlegada, setPesoLlegada] = useState<number>(10450.00);
  const [muertos] = useState<number>(5);
  const [ventaNeta, setVentaNeta] = useState<number>(78500.00);

  // Carcasa-specific states
  const [pesoCarcasa, setPesoCarcasa] = useState<number>(7524.00);
  const [pesoCabezas, setPesoCabezas] = useState<number>(522.00);
  const [pesoHigados, setPesoHigados] = useState<number>(418.00);
  const [pesoRinones, setPesoRinones] = useState<number>(209.00);
  const [pesoOtras, setPesoOtras] = useState<number>(156.00);

  // Seleccionar automáticamente el primer lote disponible si no hay seleccionado
  React.useEffect(() => {
    if (lotes.length > 0 && !selectedLoteCodigo) {
      const firstLoteMetrics = calcularMétricasLote(lotes[0]);
      setSelectedLoteCodigo(firstLoteMetrics.codigoLote);
    }
  }, [lotes, selectedLoteCodigo]);

  // Obtener lote seleccionado
  const selectedLote = lotes.find(l => {
    const m = calcularMétricasLote(l);
    return m.codigoLote === selectedLoteCodigo;
  });

  const metricsLote = selectedLote ? calcularMétricasLote(selectedLote) : null;

  // Calculadora en tiempo real para el formulario de venta
  const currentVenta: Venta = {
    fecha,
    cliente,
    tipoVenta,
    loteCodigo: selectedLoteCodigo,
    pesoLlegada: Number(pesoLlegada) || 0,
    muertos: Number(muertos) || 0,
    ventaNeta: Number(ventaNeta) || 0,
    pesoCarcasa: tipoVenta === 'Carcasa' ? (Number(pesoCarcasa) || 0) : 0,
    pesoCabezas: tipoVenta === 'Carcasa' ? (Number(pesoCabezas) || 0) : 0,
    pesoHigados: tipoVenta === 'Carcasa' ? (Number(pesoHigados) || 0) : 0,
    pesoRinones: tipoVenta === 'Carcasa' ? (Number(pesoRinones) || 0) : 0,
    pesoOtras: tipoVenta === 'Carcasa' ? (Number(pesoOtras) || 0) : 0,
  };

  const results = (selectedLote && metricsLote) 
    ? calcularMétricasVenta(currentVenta, selectedLote, metricsLote)
    : null;

  // Acción sugerir peso y precio sugerido
  const handleSugerirDatos = () => {
    if (!metricsLote) return;
    
    // Sugerimos el peso total estimado del lote
    setPesoLlegada(Number(metricsLote.kilosTotalesEstimados.toFixed(3)));
    
    // Sugerimos venta neta aplicando un 25% de margen sobre el costo total puesto en AQP
    const ventaSugerida = metricsLote.costoTotalPolloVivoAQP * 1.25;
    setVentaNeta(Number(ventaSugerida.toFixed(2)));

    // Si es carcasa, sugerimos un rendimiento estándar de carcasa del 72%
    if (tipoVenta === 'Carcasa') {
      const pesoCarcasaSugerido = metricsLote.kilosTotalesEstimados * 0.72;
      setPesoCarcasa(Number(pesoCarcasaSugerido.toFixed(3)));
      setPesoCabezas(Number((metricsLote.kilosTotalesEstimados * 0.05).toFixed(3)));
      setPesoHigados(Number((metricsLote.kilosTotalesEstimados * 0.04).toFixed(3)));
      setPesoRinones(Number((metricsLote.kilosTotalesEstimados * 0.02).toFixed(3)));
      setPesoOtras(Number((metricsLote.kilosTotalesEstimados * 0.015).toFixed(3)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoteCodigo) {
      showToast('Debes seleccionar un Lote de origen.', 'error');
      return;
    }
    try {
      // Usar el ID que ya tenemos en el estado (el que el usuario ve)
      const ventaConId = {
        ...currentVenta,
        idPedido: idPedido
      };
      
      await addVenta(ventaConId);
      showToast('Registro de procesamiento y venta guardado correctamente.', 'success');
      
      // Limpiar formulario
      setCliente('Distribuidora San Juan');
      setTipoVenta('Carcasa');
      
      // Generar nuevo ID para la SIGUIENTE venta
      setIdPedido(generarIdVenta());
    } catch (e) {
      // Error manejado en el contexto
    }
  };

  const filteredVentas = ventas.filter(v =>
    v.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.loteCodigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.idPedido.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-slate-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Formulario de Ventas (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSubmit} className="bg-brandCard border border-brandBorder rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-indigo-600" />
                Registrar Venta / Procesamiento
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

            {/* Fila 1: Selección de Lote, ID y Fecha */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider">ID Venta</label>
                <div className="w-full bg-slate-50 border border-indigo-200 rounded-xl px-4 py-2.5 text-xs text-indigo-700 font-bold font-mono shadow-sm">
                  {idPedido || 'GENERANDO...'}
                </div>
              </div>

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
                <label className="block text-xxs font-semibold text-slate-505 uppercase tracking-wider">Fecha Operación</label>
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
                <label className="block text-xxs font-semibold text-slate-505 uppercase tracking-wider">Cliente</label>
                <input
                  type="text"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="w-full bg-white border border-[#B0B5B9] rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xxs font-semibold text-slate-505 uppercase tracking-wider">Tipo de Venta</label>
                <div className="flex rounded-xl bg-slate-50 p-1 border border-brandBorder">
                  <button
                    type="button"
                    onClick={() => setTipoVenta('Carcasa')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold focus:outline-none transition-all ${
                      tipoVenta === 'Carcasa'
                        ? 'bg-indigo-650 text-slate-100 bg-indigo-600'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Carcasa
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoVenta('Entero')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold focus:outline-none transition-all ${
                      tipoVenta === 'Entero'
                        ? 'bg-indigo-650 text-slate-100 bg-indigo-600'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Pollo Entero
                  </button>
                </div>
              </div>
            </div>

            {/* Datos Físicos y Financieros */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-brandBorder pt-6">
              <div className="space-y-1.5">
                <label className="block text-xxs font-semibold text-slate-505 uppercase tracking-wider">Peso Llegada (KG)</label>
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
                <label className="block text-xxs font-semibold text-slate-505 uppercase tracking-wider">Venta Neta Cobrada (S/.)</label>
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

            {/* Módulo de procesamiento detallado */}
            {tipoVenta === 'Carcasa' && (
              <div className="border-t border-brandBorder pt-6 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="h-4 w-4 text-indigo-600" />
                  Pesos de Desglose de Carcasa (Beneficio)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xxs text-slate-500 font-semibold">Carcasa (KG)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={pesoCarcasa}
                      onChange={(e) => setPesoCarcasa(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-[#B0B5B9] rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xxs text-slate-500 font-semibold">Cabezas (KG)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={pesoCabezas}
                      onChange={(e) => setPesoCabezas(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-[#B0B5B9] rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xxs text-slate-500 font-semibold">Hígados (KG)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={pesoHigados}
                      onChange={(e) => setPesoHigados(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-[#B0B5B9] rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xxs text-slate-500 font-semibold">Riñones (KG)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={pesoRinones}
                      onChange={(e) => setPesoRinones(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-[#B0B5B9] rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xxs text-slate-500 font-semibold">Otras (KG)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={pesoOtras}
                      onChange={(e) => setPesoOtras(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-[#B0B5B9] rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-slate-100 font-bold py-3 rounded-xl shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 text-sm transition-all"
            >
              <Save className="h-4.5 w-4.5" />
              Guardar y Sincronizar Registro
            </button>
          </form>
        </div>

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
                <span className="text-slate-505">Merma Viaje</span>
                <span className="font-semibold text-rose-600">
                  {results.mermaTotal.toFixed(2)} kg ({results.porcentajeMerma.toFixed(2)}%)
                </span>
              </div>

              {/* Menudencia total */}
              {tipoVenta === 'Carcasa' && (
                <div className="flex justify-between border-b border-brandBorder pb-2">
                  <span className="text-slate-505">Total Menudencia</span>
                  <span className="font-semibold text-slate-800">
                    {results.totalMenudencia.toFixed(3)} kg
                  </span>
                </div>
              )}

              {/* Rendimiento Carcasa */}
              {tipoVenta === 'Carcasa' && (
                <div className="flex flex-col gap-1.5 border-b border-brandBorder pb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-505">Rendimiento de Carcasa</span>
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
                <span className="text-slate-505">Costo Final por KG</span>
                <span className="font-bold text-slate-800">S/. {results.costoKgFinal.toFixed(2)}</span>
              </div>

              {/* Margen */}
              <div className="flex justify-between border-b border-brandBorder pb-2">
                <span className="text-slate-505">Margen de Venta</span>
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
            <p className="text-xs text-slate-400">Registros guardados de ventas y procesamiento</p>
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
          <div className="overflow-x-auto w-full border border-brandBorder rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brandBorder text-slate-500 uppercase tracking-wider font-semibold text-xxs bg-slate-50">
                  <th className="py-2.5 px-4 whitespace-nowrap">ID</th>
                  <th className="py-2.5 px-4 whitespace-nowrap">Fecha</th>
                  <th className="py-2.5 px-4 whitespace-nowrap">Cliente</th>
                  <th className="py-2.5 px-4 whitespace-nowrap">Lote Código</th>
                  <th className="py-2.5 px-4 whitespace-nowrap">Tipo</th>
                  <th className="py-2.5 px-4 text-right whitespace-nowrap">Llegada (KG)</th>
                  <th className="py-2.5 px-4 text-right whitespace-nowrap">Carcasa (KG)</th>
                  <th className="py-2.5 px-4 text-right whitespace-nowrap">Rend. Carcasa</th>
                  <th className="py-2.5 px-4 text-right whitespace-nowrap">Venta Neta</th>
                  <th className="py-2.5 px-4 text-right whitespace-nowrap">Rentabilidad</th>
                  <th className="py-2.5 px-4 text-center whitespace-nowrap"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brandBorder/60">
                {filteredVentas.map((venta, index) => (
                  <tr key={index} className="hover:bg-[#E5F0FA] transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-600 whitespace-nowrap">{venta.idPedido}</td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{venta.fecha}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">{venta.cliente}</td>
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">{venta.loteCodigo}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xxs font-semibold ${
                        venta.tipoVenta === 'Carcasa'
                          ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                          : 'bg-teal-50 text-teal-600 border border-teal-100'
                      }`}>
                        {venta.tipoVenta}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600 whitespace-nowrap">
                      {venta.pesoLlegada.toLocaleString('es-PE', { minimumFractionDigits: 3 })} kg
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600 whitespace-nowrap">
                      {venta.pesoCarcasa > 0 ? `${venta.pesoCarcasa.toLocaleString('es-PE', { minimumFractionDigits: 3 })} kg` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-teal-600 whitespace-nowrap">{venta.rendimientoCarcasa}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800 whitespace-nowrap">
                      S/. {venta.ventaNeta.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold whitespace-nowrap ${
                      parseFloat(venta.porcentajeRentabilidad) >= 0 ? 'text-teal-600' : 'text-rose-600'
                    }`}>
                      {venta.porcentajeRentabilidad}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => showConfirm(
                          'Eliminar Registro',
                          `¿Eliminar el registro "${venta.idPedido}"? Esta acción no se puede deshacer.`,
                          () => deleteVenta(venta.idPedido),
                          { confirmLabel: 'Eliminar', variant: 'danger' }
                        )}
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors inline-flex items-center justify-center focus:outline-none"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
    </div>
  );
};
