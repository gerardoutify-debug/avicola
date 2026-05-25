import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Truck, User, Plus, RefreshCw } from 'lucide-react';

const Truck3D = () => (
  <svg viewBox="0 0 240 155" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
    <defs>
      <linearGradient id="tg-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6366f1"/>
        <stop offset="100%" stopColor="#4338ca"/>
      </linearGradient>
      <linearGradient id="tg-top" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#818cf8"/>
        <stop offset="100%" stopColor="#6366f1"/>
      </linearGradient>
      <linearGradient id="tg-side" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3730a3"/>
        <stop offset="100%" stopColor="#312e81"/>
      </linearGradient>
      <linearGradient id="tg-cab" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4338ca"/>
        <stop offset="100%" stopColor="#3730a3"/>
      </linearGradient>
      <filter id="tg-shadow">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#312e81" floodOpacity="0.25"/>
      </filter>
    </defs>
    {/* Ground shadow */}
    <ellipse cx="115" cy="148" rx="95" ry="7" fill="#0f172a" opacity="0.1"/>
    {/* === CARGO === */}
    <rect x="12" y="36" width="118" height="72" rx="3" fill="url(#tg-body)" filter="url(#tg-shadow)"/>
    <polygon points="12,36 130,36 143,22 25,22" fill="url(#tg-top)"/>
    <polygon points="130,36 143,22 143,95 130,108" fill="url(#tg-side)"/>
    {/* Cargo details */}
    <line x1="12" y1="62" x2="130" y2="62" stroke="#a5b4fc" strokeWidth="1.5" opacity="0.35"/>
    <line x1="12" y1="82" x2="130" y2="82" stroke="#a5b4fc" strokeWidth="1" opacity="0.25"/>
    <line x1="55" y1="36" x2="55" y2="108" stroke="#a5b4fc" strokeWidth="1" opacity="0.2"/>
    <line x1="95" y1="36" x2="95" y2="108" stroke="#a5b4fc" strokeWidth="1" opacity="0.2"/>
    {/* Company mark */}
    <rect x="22" y="44" width="28" height="10" rx="2" fill="#818cf8" opacity="0.5"/>
    {/* === CAB === */}
    <path d="M130,58 L130,108 L196,108 L196,78 L174,58 Z" fill="url(#tg-cab)" filter="url(#tg-shadow)"/>
    <polygon points="130,58 143,44 182,44 196,58" fill="#4f46e5"/>
    <polygon points="196,58 182,44 182,78 196,78" fill="#312e81"/>
    {/* Windshield */}
    <polygon points="132,59 172,59 193,76 132,76" fill="#bfdbfe" opacity="0.82"/>
    {/* Side window */}
    <rect x="135" y="79" width="22" height="17" rx="2" fill="#bfdbfe" opacity="0.65"/>
    {/* Door line */}
    <line x1="162" y1="60" x2="162" y2="108" stroke="#3730a3" strokeWidth="1.5"/>
    <circle cx="156" cy="84" r="2.5" fill="#6366f1"/>
    {/* Headlight */}
    <rect x="191" y="78" width="7" height="13" rx="2" fill="#fef9c3"/>
    <ellipse cx="194" cy="84" rx="5" ry="7" fill="#fef08a" opacity="0.35"/>
    {/* === WHEELS === */}
    <circle cx="50" cy="116" r="19" fill="#0f172a"/>
    <circle cx="50" cy="116" r="12" fill="#334155"/>
    <circle cx="50" cy="116" r="6" fill="#64748b"/>
    <circle cx="50" cy="116" r="2.5" fill="#94a3b8"/>
    <circle cx="112" cy="116" r="19" fill="#0f172a"/>
    <circle cx="112" cy="116" r="12" fill="#334155"/>
    <circle cx="112" cy="116" r="6" fill="#64748b"/>
    <circle cx="112" cy="116" r="2.5" fill="#94a3b8"/>
    <circle cx="172" cy="116" r="17" fill="#0f172a"/>
    <circle cx="172" cy="116" r="10" fill="#334155"/>
    <circle cx="172" cy="116" r="5" fill="#64748b"/>
    <circle cx="172" cy="116" r="2" fill="#94a3b8"/>
    {/* Chassis */}
    <rect x="12" y="108" width="118" height="8" rx="2" fill="#312e81"/>
    <rect x="130" y="108" width="66" height="8" rx="2" fill="#281e73"/>
  </svg>
);

export const CamionesForm: React.FC = () => {
  const { camiones, addCamion, isLoading, showToast } = useApp();
  const [placa, setPlaca] = useState('');
  const [conductor, setConductor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placa.trim() || !conductor.trim()) return;

    // Validación formato de placa estándar de Perú (e.g. ABC-123 o A1B-234)
    const cleanPlaca = placa.trim().toUpperCase();
    if (!/^[A-Z0-9]{3}-[A-Z0-9]{3}$/.test(cleanPlaca)) {
      showToast('La placa debe tener el formato AAA-123 (tres letras/números, guion, tres letras/números)', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await addCamion({
        placa: cleanPlaca,
        conductor: conductor.trim(),
        fechaRegistro: new Date().toLocaleDateString('es-ES'),
      });
      showToast('Camión registrado correctamente.', 'success');
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
        <div className="w-44 h-36 flex items-center justify-center relative flex-shrink-0">
          <Truck3D />
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
              {camiones ? camiones.length : 0} activos
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
                {!camiones || camiones.length === 0 ? (
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
