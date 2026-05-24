import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Filter, Calendar, ShoppingCart, Tag, Inbox } from 'lucide-react';

export const Busqueda: React.FC = () => {
  const { ventas } = useApp();
  
  // Filtros
  const [searchId, setSearchId] = useState('');
  const [filterTipo, setFilterTipo] = useState<'Todos' | 'Faenado' | 'Vivo'>('Todos');
  const [filterFecha, setFilterFecha] = useState('');

  // Lógica de filtrado
  const filteredVentas = ventas.filter(venta => {
    const matchesId = searchId === '' || (venta.idPedido && venta.idPedido.toLowerCase().includes(searchId.toLowerCase()));
    const matchesTipo = filterTipo === 'Todos' || venta.tipoVenta === filterTipo;
    
    // Convertir la fecha del registro (DD/MM/YYYY) a (YYYY-MM-DD) para comparar con el input date
    let matchesFecha = true;
    if (filterFecha !== '') {
      const [day, month, year] = venta.fecha.split('/');
      const formattedVentaFecha = `${year}-${month}-${day}`;
      matchesFecha = formattedVentaFecha === filterFecha;
    }
    
    return matchesId && matchesTipo && matchesFecha;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-slate-800">
      {/* Panel de Filtros */}
      <div className="bg-brandCard border border-brandBorder rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-brandBorder pb-4">
          <Filter className="h-5 w-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-800">Búsqueda Avanzada y Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Buscar por ID */}
          <div className="space-y-1.5">
            <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="h-3 w-3" />
              Buscar por ID (PED-XXX)
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Ej: PED-001..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full bg-white border border-[#B0B5B9] rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Filtrar por Tipo */}
          <div className="space-y-1.5">
            <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingCart className="h-3 w-3" />
              Tipo de Venta
            </label>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value as any)}
              className="w-full bg-white border border-[#B0B5B9] rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="Todos">Todos los tipos</option>
              <option value="Faenado">Faenado</option>
              <option value="Vivo">Pollo Vivo</option>
            </select>
          </div>

          {/* Filtrar por Fecha con Calendario */}
          <div className="space-y-1.5">
            <label className="block text-xxs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              Seleccionar Fecha
            </label>
            <input
              type="date"
              value={filterFecha}
              onChange={(e) => setFilterFecha(e.target.value)}
              className="w-full bg-white border border-[#B0B5B9] rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Resultados de Búsqueda */}
      <div className="bg-brandCard border border-brandBorder rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Resultados Encontrados ({filteredVentas.length})</h3>
        </div>

        {filteredVentas.length > 0 ? (
          <div className="overflow-x-auto w-full border border-brandBorder rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brandBorder text-slate-500 uppercase tracking-wider font-semibold text-xxs bg-slate-50">
                  <th className="py-2.5 px-4">ID</th>
                  <th className="py-2.5 px-4">Fecha</th>
                  <th className="py-2.5 px-4">Cliente</th>
                  <th className="py-2.5 px-4">Tipo</th>
                  <th className="py-2.5 px-4 text-right">Peso Llegada</th>
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
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xxs font-semibold ${
                        venta.tipoVenta === 'Faenado'
                          ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                          : 'bg-teal-50 text-teal-600 border border-teal-100'
                      }`}>
                        {venta.tipoVenta}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {venta.pesoLlegada.toLocaleString('es-PE', { minimumFractionDigits: 3 })} kg
                    </td>
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
            <span className="text-xs">No se encontraron registros que coincidan con los filtros.</span>
          </div>
        )}
      </div>
    </div>
  );
};
