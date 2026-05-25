import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { type Lote, calcularMétricasLote } from '../utils/calculations';
import { Search, Save, FileText, Users, Eye, Inbox, Trash2 } from 'lucide-react';

export const LotesForm: React.FC = () => {
  const { lotes, addLote, deleteLote, camiones, showToast, showConfirm } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoteForModal, setSelectedLoteForModal] = useState<Lote | null>(null);

  // Form states
  const [fechaIngreso, setFechaIngreso] = useState(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  });
  const [nroFactura, setNroFactura] = useState('FT01-222');
  const [placaCamion, setPlacaCamion] = useState('');

  useEffect(() => {
    if (camiones && camiones.length > 0 && !placaCamion) {
      setPlacaCamion(camiones[0].placa);
    }
  }, [camiones, placaCamion]);
  const [precioKg, setPrecioKg] = useState<number>(5.00);
  const [totalJabas, setTotalJabas] = useState<number>(506);
  const [fleteTotal, setFleteTotal] = useState<number>(7700.00);
  const [pollosMuertos, setPollosMuertos] = useState<number>(20);
  
  // Biological parameters
  const [porcentajeHembra, setPorcentajeHembra] = useState<number>(20);
  const [pesoMinHembra, setPesoMinHembra] = useState<number>(2.45);
  const [pesoMaxHembra, setPesoMaxHembra] = useState<number>(2.65);
  const [pollosxJabaHembra, setPollosxJabaHembra] = useState<number>(8);

  const [porcentajeMacho, setPorcentajeMacho] = useState<number>(80);
  const [pesoMinMacho, setPesoMinMacho] = useState<number>(2.90);
  const [pesoMaxMacho, setPesoMaxMacho] = useState<number>(3.10);
  const [pollosxJabaMacho, setPollosxJabaMacho] = useState<number>(7);

  const [proveedor, setProveedor] = useState('Avícola Santa Cruz');
  const [origen, setOrigen] = useState('Lurín, Lima');

  // Ajustar machos automáticamente cuando hembras cambian
  const handleHembraPctChange = (val: number) => {
    setPorcentajeHembra(val);
    setPorcentajeMacho(Math.max(0, 100 - val));
  };

  // Ajustar hembras automáticamente cuando machos cambian
  const handleMachoPctChange = (val: number) => {
    setPorcentajeMacho(val);
    setPorcentajeHembra(Math.max(0, 100 - val));
  };

  // Crear objeto lote temporal para cálculos en tiempo real
  const currentLote: Lote = {
    fechaIngreso,
    nroFactura,
    placaCamion,
    precioKg: Number(precioKg) || 0,
    totalJabas: Number(totalJabas) || 0,
    fleteTotal: Number(fleteTotal) || 0,
    pollosMuertos: Number(pollosMuertos) || 0,
    porcentajeHembra: Number(porcentajeHembra) || 0,
    pesoMinHembra: Number(pesoMinHembra) || 0,
    pesoMaxHembra: Number(pesoMaxHembra) || 0,
    pollosxJabaHembra: Number(pollosxJabaHembra) || 0,
    porcentajeMacho: Number(porcentajeMacho) || 0,
    pesoMinMacho: Number(pesoMinMacho) || 0,
    pesoMaxMacho: Number(pesoMaxMacho) || 0,
    pollosxJabaMacho: Number(pollosxJabaMacho) || 0,
    proveedor,
    origen
  };

  const results = calcularMétricasLote(currentLote);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (porcentajeHembra + porcentajeMacho !== 100) {
      showToast('La suma de los porcentajes de hembras y machos debe ser exactamente 100%.', 'error');
      return;
    }
    try {
      await addLote(currentLote);
      showToast('Lote guardado correctamente.', 'success');
    } catch (e) {
      // Mensaje de error ya mostrado en el contexto
    }
  };

  const filteredLotes = lotes.filter(l => 
    l.nroFactura.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.placaCamion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.proveedor && l.proveedor.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-slate-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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
                {camiones && camiones.length > 0 ? (
                  <select
                    value={placaCamion}
                    onChange={(e) => setPlacaCamion(e.target.value)}
                    className="w-full bg-white border border-[#B0B5B9] rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                    required
                  >
                    {camiones.map((c) => (
                      <option key={c.placa} value={c.placa}>
                        {c.placa} - {c.conductor}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 text-xxs text-rose-600 font-semibold flex items-center justify-between">
                    <span>No hay camiones registrados</span>
                  </div>
                )}
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

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-slate-100 font-bold py-3 rounded-xl shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 text-sm transition-all"
            >
              <Save className="h-4.5 w-4.5" />
              Guardar y Registrar Lote
            </button>
          </form>
        </div>

        {/* Panel de Cálculo en Tiempo Real (4 cols) */}
        <div className="lg:col-span-4 bg-brandCard border border-brandBorder rounded-2xl p-6 space-y-6 shadow-sm relative overflow-hidden">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Calculadora en Tiempo Real</h3>
            <p className="text-xs text-slate-400">Previsualización del costo del lote antes de guardar</p>
          </div>

          <div className="space-y-3.5 text-xs text-slate-750">
            {/* Peso Ponderado */}
            <div className="flex justify-between border-b border-brandBorder pb-2">
              <span className="text-slate-500">Peso Ponderado/Pollo</span>
              <span className="font-semibold text-slate-800">{results.promPesoPolloPonderado.toFixed(3)} kg</span>
            </div>

            {/* Pollos por Jaba */}
            <div className="flex justify-between border-b border-brandBorder pb-2">
              <span className="text-slate-505">Pollos por Jaba Prom.</span>
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
              <span className="text-slate-505">Merma Est. (125g/pollo)</span>
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
              <span className="font-bold text-slate-850 text-xs">Costo Total Puesto AQP</span>
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
          <div className="overflow-x-auto w-full border border-brandBorder rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brandBorder text-slate-500 uppercase tracking-wider font-semibold text-xxs bg-slate-50">
                  <th className="py-2.5 px-4 whitespace-nowrap">Fecha</th>
                  <th className="py-2.5 px-4 whitespace-nowrap">Factura</th>
                  <th className="py-2.5 px-4 whitespace-nowrap">Placa</th>
                  <th className="py-2.5 px-4 whitespace-nowrap">Proveedor</th>
                  <th className="py-2.5 px-4 text-right whitespace-nowrap">Jabas</th>
                  <th className="py-2.5 px-4 text-right whitespace-nowrap">Kilos Est.</th>
                  <th className="py-2.5 px-4 text-right whitespace-nowrap">Costo Total AQP</th>
                  <th className="py-2.5 px-4 text-right whitespace-nowrap">Costo/KG AQP</th>
                  <th className="py-2.5 px-4 text-center whitespace-nowrap" colSpan={2}>Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brandBorder/60">
                {filteredLotes.map((lote, index) => {
                  const m = calcularMétricasLote(lote);
                  return (
                    <tr key={index} className="hover:bg-[#E5F0FA] transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-600 whitespace-nowrap">{lote.fechaIngreso}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">{lote.nroFactura}</td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{lote.placaCamion}</td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{lote.proveedor || '—'}</td>
                      <td className="py-3 px-4 text-right font-medium text-slate-600 whitespace-nowrap">{lote.totalJabas}</td>
                      <td className="py-3 px-4 text-right text-slate-600 whitespace-nowrap">
                        {m.kilosTotalesEstimados.toLocaleString('es-PE', { maximumFractionDigits: 1 })} kg
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-teal-600 whitespace-nowrap">
                        S/. {m.costoTotalPolloVivoAQP.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-indigo-600 whitespace-nowrap">S/. {m.precioKgPuestoAQP.toFixed(2)}</td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLoteForModal(lote)}
                          className="p-1.5 hover:bg-slate-100 text-indigo-600 hover:text-indigo-800 rounded-lg transition-colors inline-flex items-center justify-center gap-1 focus:outline-none"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="text-xxs">Breakdown</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => showConfirm(
                            'Eliminar Lote',
                            `¿Eliminar el lote de factura "${lote.nroFactura}"? Esta acción no se puede deshacer.`,
                            () => deleteLote(lote.nroFactura),
                            { confirmLabel: 'Eliminar', variant: 'danger' }
                          )}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors inline-flex items-center justify-center focus:outline-none"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Modal de Desglose Completo (Breakdown) */}
      {selectedLoteForModal && (() => {
        const m = calcularMétricasLote(selectedLoteForModal);
        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
                    <h5 className="font-semibold text-slate-505 border-b border-brandBorder/60 pb-1 uppercase tracking-wider text-xxs">Datos Lote</h5>
                    <div className="space-y-1 mt-2">
                      <div className="flex justify-between"><span className="text-slate-400">Proveedor:</span> <span className="text-slate-700 font-semibold">{selectedLoteForModal.proveedor}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Origen:</span> <span className="text-slate-700">{selectedLoteForModal.origen}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Precio/KG Origen:</span> <span className="text-slate-700">S/. {selectedLoteForModal.precioKg.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Total Jabas:</span> <span className="text-slate-700">{selectedLoteForModal.totalJabas}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Total Pollos Est.:</span> <span className="text-slate-700">{Math.round(m.cantidadPollosEstimada)}</span></div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-505 border-b border-brandBorder/60 pb-1 uppercase tracking-wider text-xxs">Distribución Sexo</h5>
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
                    <span className="text-slate-505">Merma de Peso Estimada (Deshidratación viaje 125g/pollo)</span>
                    <span className="font-semibold text-rose-600">S/. {m.mermaValorizada.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between p-3 hover:bg-slate-50">
                    <span className="text-slate-505">Pérdida por Bajas (Muertos en viaje: {selectedLoteForModal.pollosMuertos} pollos)</span>
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
          </div>
        );
      })()}
    </div>
  );
};
