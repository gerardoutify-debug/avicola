import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, Search, Save, Trash2, Inbox, RefreshCw, CheckCircle2, XCircle, Phone, User } from 'lucide-react';

export const ProveedoresForm: React.FC = () => {
  const { proveedores, addProveedor, deleteProveedor, showToast, showConfirm } = useApp();

  const [ruc, setRuc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [estado, setEstado] = useState('');
  const [condicion, setCondicion] = useState('');
  const [direccion, setDireccion] = useState('');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [rucStatus, setRucStatus] = useState<'found' | 'not_found' | null>(null);

  const resetForm = () => {
    setRuc(''); setRazonSocial(''); setEstado(''); setCondicion('');
    setDireccion(''); setContacto(''); setTelefono(''); setRucStatus(null);
  };

  const handleBuscarRUC = async () => {
    if (!/^\d{11}$/.test(ruc)) {
      showToast('El RUC debe tener exactamente 11 dígitos.', 'error');
      return;
    }
    setIsSearching(true);
    setRucStatus(null);
    try {
      const res = await fetch(`/api/ruc?numero=${ruc}`);
      if (!res.ok) throw new Error('No encontrado');
      const data = await res.json();
      if (data.razonSocial) {
        setRazonSocial(data.razonSocial);
        setEstado(data.estado || '');
        setCondicion(data.condicion || '');
        setDireccion(data.direccion || '');
        setRucStatus('found');
      } else {
        setRucStatus('not_found');
      }
    } catch {
      setRucStatus('not_found');
      showToast('No se pudo consultar SUNAT. Ingresa los datos manualmente.', 'info');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruc || !razonSocial) {
      showToast('RUC y Razón Social son obligatorios.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await addProveedor({
        ruc,
        razonSocial,
        estado,
        condicion,
        direccion,
        contacto,
        telefono,
        fechaRegistro: new Date().toLocaleDateString('es-PE'),
      });
      showToast('Proveedor registrado correctamente.', 'success');
      resetForm();
    } catch {
      // handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = (proveedores || []).filter(p =>
    p.ruc.includes(searchTerm) ||
    p.razonSocial.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-slate-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Formulario */}
        <div className="lg:col-span-4">
          <form onSubmit={handleSubmit} className="bg-brandCard border border-brandBorder rounded-2xl p-6 space-y-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
              Registrar Proveedor
            </h3>

            {/* RUC + botón buscar */}
            <div className="space-y-1.5">
              <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider">RUC</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={11}
                  value={ruc}
                  onChange={(e) => { setRuc(e.target.value.replace(/\D/g, '')); setRucStatus(null); }}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleBuscarRUC())}
                  placeholder="20601048761"
                  className="flex-1 bg-white border border-[#B0B5B9] rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleBuscarRUC}
                  disabled={isSearching || ruc.length !== 11}
                  className="px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-all focus:outline-none"
                >
                  {isSearching
                    ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    : <Search className="h-3.5 w-3.5" />}
                  {!isSearching && 'Buscar'}
                </button>
              </div>
              {rucStatus === 'found' && (
                <p className="text-xxs text-emerald-600 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="h-3 w-3" /> Encontrado en SUNAT
                </p>
              )}
              {rucStatus === 'not_found' && (
                <p className="text-xxs text-amber-600 flex items-center gap-1 font-semibold">
                  <XCircle className="h-3 w-3" /> No encontrado — ingresa manualmente
                </p>
              )}
            </div>

            {/* Razón Social */}
            <div className="space-y-1.5">
              <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider">Razón Social</label>
              <input
                type="text"
                value={razonSocial}
                onChange={(e) => setRazonSocial(e.target.value)}
                placeholder="Auto-completado o ingresa manualmente"
                className="w-full bg-white border border-[#B0B5B9] rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Estado + Condición (solo si hay datos de SUNAT) */}
            {(estado || condicion) && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider">Estado</label>
                  <div className={`text-xxs font-bold px-2.5 py-2 rounded-lg border text-center ${
                    estado === 'ACTIVO'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {estado || '—'}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider">Condición</label>
                  <div className="text-xxs font-medium px-2.5 py-2 rounded-lg border bg-slate-50 text-slate-700 border-brandBorder text-center">
                    {condicion || '—'}
                  </div>
                </div>
              </div>
            )}

            {/* Dirección */}
            <div className="space-y-1.5">
              <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider">Dirección</label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Auto-completado o ingresa manualmente"
                className="w-full bg-white border border-[#B0B5B9] rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Contacto + Teléfono */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider">Contacto</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={contacto}
                    onChange={(e) => setContacto(e.target.value)}
                    placeholder="Nombre"
                    className="w-full bg-white border border-[#B0B5B9] rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="999 999 999"
                    className="w-full bg-white border border-[#B0B5B9] rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50"
            >
              {isSubmitting
                ? <RefreshCw className="h-4 w-4 animate-spin" />
                : <Save className="h-4 w-4" />}
              Registrar Proveedor
            </button>
          </form>
        </div>

        {/* Tabla */}
        <div className="lg:col-span-8 bg-brandCard border border-brandBorder rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Proveedores Registrados</h3>
              <p className="text-xs text-slate-400">Directorio de proveedores avícolas</p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por RUC o razón social..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-[#B0B5B9] rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="overflow-x-auto border border-brandBorder rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-brandBorder text-slate-500 uppercase tracking-wider font-semibold text-xxs bg-slate-50">
                    <th className="py-2.5 px-4 whitespace-nowrap">RUC</th>
                    <th className="py-2.5 px-4 whitespace-nowrap">Razón Social</th>
                    <th className="py-2.5 px-4 whitespace-nowrap">Estado</th>
                    <th className="py-2.5 px-4 whitespace-nowrap">Contacto</th>
                    <th className="py-2.5 px-4 whitespace-nowrap">Teléfono</th>
                    <th className="py-2.5 px-4 whitespace-nowrap">Registro</th>
                    <th className="py-2.5 px-4 text-center whitespace-nowrap"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brandBorder/60">
                  {filtered.map((p, idx) => (
                    <tr key={idx} className="hover:bg-[#E5F0FA] transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-600 whitespace-nowrap">{p.ruc}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800 max-w-[200px] truncate">{p.razonSocial}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {p.estado ? (
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xxs font-bold border ${
                            p.estado === 'ACTIVO'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {p.estado}
                          </span>
                        ) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{p.contacto || '—'}</td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{p.telefono || '—'}</td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{p.fechaRegistro || '—'}</td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => showConfirm(
                            'Eliminar Proveedor',
                            `¿Eliminar a "${p.razonSocial}" (${p.ruc})? Esta acción no se puede deshacer.`,
                            () => deleteProveedor(p.ruc),
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
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <Inbox className="h-10 w-10 text-slate-300" />
              <span className="text-xs">
                {searchTerm ? 'Sin resultados para esa búsqueda.' : 'No hay proveedores registrados.'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
