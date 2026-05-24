import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Boxes, 
  ShoppingCart, 
  Search,
  RefreshCw, 
  Database, 
  Menu,
  X,
  Truck
} from 'lucide-react';

interface LayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, children }) => {
  const { mode, authActive, refreshData, isLoading } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', id: 'dashboard', icon: LayoutDashboard },
    { name: 'Gestión de Lotes', id: 'lotes', icon: Boxes },
    { name: 'Procesamiento y Ventas', id: 'ventas', icon: ShoppingCart },
    { name: 'Búsqueda Histórica', id: 'busqueda', icon: Search },
    { name: 'Camiones', id: 'camiones', icon: Truck },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-brandBg relative">
      {/* Backdrop para móviles (cierra el menú al hacer clic fuera) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-20 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Lateral (100% Light Mode SAP Horizon, responsive drawer en pantallas pequeñas) */}
      <aside className={`w-64 bg-white border-r border-brandBorder flex flex-col flex-shrink-0 z-30 fixed inset-y-0 left-0 lg:static transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Header/Logo */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-brandBorder gap-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-lg tracking-wider">
              AV
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide uppercase text-slate-800 m-0">AVÍCOLA</h1>
              <p className="text-xs text-slate-500">Panel de Simulación</p>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Links de Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 gap-3 group relative ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-100/50 shadow-sm font-semibold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                {item.name}
                {isActive && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-indigo-600 rounded-l-md" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer / Barra de Estado de Conexión */}
        <div className="p-4 border-t border-brandBorder bg-slate-50/80">
          <div className="flex flex-col gap-2.5">
            <button
              onClick={refreshData}
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-sm border ${
                authActive 
                  ? 'bg-teal-50 text-teal-700 border-teal-200' 
                  : 'bg-white text-slate-700 border-brandBorder hover:bg-slate-50'
              }`}
            >
              {authActive ? (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-teal-500 rounded-full animate-pulse" />
                  Conectado a Sheets
                </div>
              ) : (
                <>
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''} text-indigo-600`} />
                  Sincronizar Datos
                </>
              )}
            </button>
            
            {isLoading && (
              <p className="text-[10px] text-center text-indigo-600 font-medium animate-pulse">
                Conectando con Google...
              </p>
            )}

            {!authActive && !isLoading && (
              <p className="text-[10px] text-center text-slate-400 font-medium">
                Modo Offline (Local)
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* Área de Contenido Principal (Morning Horizon Workspace) */}
      <main className="flex-1 flex flex-col overflow-hidden bg-brandBg relative">
        {/* Encabezado Móvil (Sólo visible en md y menores) */}
        <header className="lg:hidden h-16 px-6 flex items-center justify-between border-b border-brandBorder bg-white z-10 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-sm font-bold tracking-tight text-slate-800 capitalize">
              {navigation.find(n => n.id === activeTab)?.name || activeTab}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            {isLoading && (
              <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
            )}
            {mode === 'live' && authActive && (
              <Database className="h-4 w-4 text-teal-600" />
            )}
          </div>
        </header>

        {/* Encabezado Escritorio (Sólo visible en lg y mayores) */}
        <header className="hidden lg:flex h-16 px-8 flex items-center justify-between border-b border-brandBorder bg-white z-10 shadow-sm flex-shrink-0">
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

        {/* Vista activa */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          {children}
        </div>
      </main>
    </div>
  );
};
