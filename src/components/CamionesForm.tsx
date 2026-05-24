import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Truck, User, Plus, RefreshCw } from 'lucide-react';
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
