import React, { createContext, useContext, useState, useEffect } from 'react';
import { type Lote, type Venta, calcularMétricasLote, calcularMétricasVenta, generarIdVenta } from '../utils/calculations';
import { googleSheetsService } from '../services/googleSheets';
import { CheckCircle2, AlertTriangle, Info, X as XIcon, Trash2 } from 'lucide-react';

interface Credentials {
  clientId: string;
  spreadsheetId: string;
  apiKey: string;
  isConnected: boolean;
}

export interface Camion {
  placa: string;
  conductor: string;
  fechaRegistro?: string;
}

export interface Proveedor {
  ruc: string;
  razonSocial: string;
  estado?: string;
  condicion?: string;
  direccion?: string;
  contacto?: string;
  telefono?: string;
  fechaRegistro?: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  id: string;
}

interface ConfirmState {
  title: string;
  message: string;
  confirmLabel: string;
  variant: 'danger' | 'primary';
  onConfirm: () => void;
}

const ConfirmDialog: React.FC<{ state: ConfirmState; onClose: () => void }> = ({ state, onClose }) => {
  const isDanger = state.variant === 'danger';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-toast-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 space-y-5">
        <div className="flex items-start gap-3.5">
          <div className={`p-2 rounded-xl flex-shrink-0 ${isDanger ? 'bg-rose-50' : 'bg-indigo-50'}`}>
            {isDanger
              ? <Trash2 className="h-5 w-5 text-rose-600" />
              : <CheckCircle2 className="h-5 w-5 text-indigo-600" />}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">{state.title}</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{state.message}</p>
          </div>
        </div>
        <div className="flex gap-2.5 justify-end pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all focus:outline-none"
          >
            Cancelar
          </button>
          <button
            onClick={() => { state.onConfirm(); onClose(); }}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-sm transition-all focus:outline-none ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
            }`}
          >
            {state.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

const ToastContainer: React.FC<{ toasts: Toast[]; onClose: (id: string) => void }> = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-xs w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        const cfg = isSuccess
          ? { accent: 'bg-emerald-500', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', title: '¡Guardado!', Icon: CheckCircle2 }
          : isError
          ? { accent: 'bg-rose-500', iconBg: 'bg-rose-50', iconColor: 'text-rose-600', title: 'Error', Icon: AlertTriangle }
          : { accent: 'bg-indigo-500', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600', title: 'Aviso', Icon: Info };

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-stretch overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-900/10 animate-toast-in"
          >
            <div className={`w-1 flex-shrink-0 ${cfg.accent}`} />
            <div className="flex items-start gap-3 px-4 py-3.5 flex-1 min-w-0">
              <div className={`flex-shrink-0 p-1.5 rounded-xl ${cfg.iconBg} mt-0.5`}>
                <cfg.Icon className={`h-4 w-4 ${cfg.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold ${cfg.iconColor}`}>{cfg.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug break-words">{toast.message}</p>
              </div>
              <button
                onClick={() => onClose(toast.id)}
                className="flex-shrink-0 p-1 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-50 transition-colors mt-0.5 focus:outline-none"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface AppContextType {
  mode: 'demo' | 'live';
  setMode: (mode: 'demo' | 'live') => void;
  lotes: Lote[];
  ventas: any[];
  camiones: Camion[];
  proveedores: Proveedor[];
  isLoading: boolean;
  isConfigured: boolean;
  credentials: Credentials;
  saveConfig: (creds: Partial<Credentials>) => void;
  addLote: (lote: Lote) => Promise<void>;
  addVenta: (venta: Venta) => Promise<void>;
  addCamion: (camion: Camion) => Promise<void>;
  deleteLote: (nroFactura: string) => Promise<void>;
  deleteVenta: (idPedido: string) => Promise<void>;
  addProveedor: (proveedor: Proveedor) => Promise<void>;
  deleteProveedor: (ruc: string) => Promise<void>;
  showConfirm: (title: string, message: string, onConfirm: () => void, options?: { confirmLabel?: string; variant?: 'danger' | 'primary' }) => void;
  loginGoogle: () => Promise<void>;
  logoutGoogle: () => void;
  refreshData: () => Promise<void>;
  authActive: boolean;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Datos de prueba para el Modo Demo (Inicialmente vacíos para evitar confusión)
const SAMPLE_LOTES: Lote[] = [];
const SAMPLE_VENTAS: any[] = [];
const SAMPLE_CAMIONES: Camion[] = [];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<'demo' | 'live'>('live');
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [ventas, setVentas] = useState<any[]>([]);
  const [camiones, setCamiones] = useState<Camion[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [credentials, setCredentials] = useState<Credentials>({
    clientId: '',
    spreadsheetId: '',
    apiKey: '',
    isConnected: false,
  });
  const [authActive, setAuthActive] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: { confirmLabel?: string; variant?: 'danger' | 'primary' }
  ) => {
    setConfirmState({
      title,
      message,
      onConfirm,
      confirmLabel: options?.confirmLabel ?? 'Confirmar',
      variant: options?.variant ?? 'primary',
    });
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Inicializar credenciales y datos
  useEffect(() => {
    const creds = googleSheetsService.getCredentials();
    setCredentials(creds);

    // Si la cuenta de servicio está conectada y configurada, forzamos siempre el modo 'live'
    // para evitar que el usuario se quede atrapado en modo demo por fallos previos guardados en localStorage.
    if (creds.isConnected && creds.clientId && creds.spreadsheetId) {
      setModeState('live');
      localStorage.setItem('avicola_app_mode', 'live');
    } else {
      const savedMode = localStorage.getItem('avicola_app_mode') as 'demo' | 'live' | null;
      if (savedMode) {
        setModeState(savedMode);
      } else {
        setModeState('demo');
      }
    }

    // Cargar SDKs en segundo plano
    googleSheetsService.loadGoogleSDKs().catch(console.error);
  }, []);

  // Cargar datos dependiendo del modo
  useEffect(() => {
    localStorage.setItem('avicola_app_mode', mode);
    refreshData();
  }, [mode]);

  // Actualizar estado de autenticación periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      if (mode === 'live') {
        setAuthActive(googleSheetsService.isAuthenticated());
      } else {
        setAuthActive(false);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [mode]);

  const setMode = (newMode: 'demo' | 'live') => {
    if (newMode === 'live' && (!credentials.clientId || !credentials.spreadsheetId)) {
      showToast('Debes configurar tu Client ID y Spreadsheet ID en los ajustes primero.', 'error');
      return;
    }
    setModeState(newMode);
  };

  const refreshData = async () => {
    setIsLoading(true);
    
    // Si el modo es 'demo', cargamos exclusivamente desde localStorage (o samples si no hay datos guardados)
    if (mode === 'demo') {
      const localLotes = localStorage.getItem('avicola_local_lotes');
      setLotes(localLotes ? JSON.parse(localLotes) : SAMPLE_LOTES);
      const localVentas = localStorage.getItem('avicola_local_ventas');
      setVentas(localVentas ? JSON.parse(localVentas) : SAMPLE_VENTAS);
      const localCamiones = localStorage.getItem('avicola_local_camiones');
      setCamiones(localCamiones ? JSON.parse(localCamiones) : SAMPLE_CAMIONES);
      const localProveedores = localStorage.getItem('avicola_local_proveedores');
      setProveedores(localProveedores ? JSON.parse(localProveedores) : []);
      setIsLoading(false);
      return;
    }

    // Si el modo es 'live', consumimos de la API en el servidor
    try {
      const shLotes = await googleSheetsService.getLotes();
      const shVentas = await googleSheetsService.getVentas();
      
      setLotes(shLotes || []);
      setVentas(shVentas || []);

      // Intentamos cargar los camiones
      try {
        const resCamiones = await fetch('/api/camiones');
        if (resCamiones.ok) {
          const shCamiones = await resCamiones.json();
          setCamiones(shCamiones || []);
        } else {
          setCamiones([]);
        }
      } catch (camionErr) {
        console.warn('Error al cargar camiones de la API:', camionErr);
        setCamiones([]);
      }

      try {
        const resProveedores = await fetch('/api/proveedores');
        if (resProveedores.ok) setProveedores(await resProveedores.json());
        else setProveedores([]);
      } catch { setProveedores([]); }

      setAuthActive(true);
    } catch (err: any) {
      console.warn('Google Sheets API offline or error:', err);
      showToast('Error al conectar con la base de datos: ' + err.message, 'error');
      // No cambiamos silenciosamente a modo demo para no confundir al usuario,
      // simplemente vaciamos los estados para denotar falta de conexión.
      setLotes([]);
      setVentas([]);
      setCamiones([]);
      setProveedores([]);
      setAuthActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = (newCreds: Partial<Credentials>) => {
    googleSheetsService.saveCredentials(newCreds);
    const updated = googleSheetsService.getCredentials();
    setCredentials(updated);
    
    if (updated.isConnected && updated.clientId && updated.spreadsheetId) {
      setModeState('live');
    } else {
      setModeState('demo');
    }
  };

  const loginGoogle = async () => {
    setIsLoading(true);
    try {
      await googleSheetsService.authenticate();
      setAuthActive(true);
      await refreshData();
    } catch (err) {
      console.error('Error de autenticación Google:', err);
      showToast('Error al conectar con Google: ' + ((err as any)?.message || JSON.stringify(err)), 'error');
      setAuthActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logoutGoogle = () => {
    googleSheetsService.clearToken();
    googleSheetsService.saveCredentials({ isConnected: false });
    setCredentials(prev => ({ ...prev, isConnected: false }));
    setModeState('demo');
    setAuthActive(false);
    setLotes(SAMPLE_LOTES);
    setVentas(SAMPLE_VENTAS);
  };

  const addLote = async (lote: Lote) => {
    setIsLoading(true);
    try {
      if (mode === 'demo') {
        const localLotes = localStorage.getItem('avicola_local_lotes');
        const current: Lote[] = localLotes ? JSON.parse(localLotes) : [...SAMPLE_LOTES];
        const updated = [lote, ...current];
        localStorage.setItem('avicola_local_lotes', JSON.stringify(updated));
        setLotes(updated);
      } else {
        await googleSheetsService.syncLote(lote);
        await refreshData();
      }
    } catch (err) {
      console.error('Error guardando lote:', err);
      showToast('Error al guardar lote: ' + (err as Error).message, 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addVenta = async (venta: Venta) => {
    setIsLoading(true);
    try {
      const selectedLote = lotes.find(l => {
        const m = calcularMétricasLote(l);
        return m.codigoLote === venta.loteCodigo;
      });

      if (!selectedLote) {
        throw new Error('Lote asociado no encontrado en la lista de lotes.');
      }

      // Usar ID de venta proporcionado o generar uno nuevo
      const idPedido = venta.idPedido || generarIdVenta();

      if (mode === 'demo') {
        const mLote = calcularMétricasLote(selectedLote);
        const mv = calcularMétricasVenta(venta, selectedLote, mLote);
        
        const fullVentaRow = {
          idPedido,
          fecha: venta.fecha,
          proveedor: selectedLote.proveedor || 'Sin Proveedor',
          origen: selectedLote.origen || 'Origen',
          loteCodigo: mLote.codigoLote,
          tipoPollo: 'Pollo Vivo',
          sexo: 'Ponderado',
          costoTotal: mLote.costoTotalPolloVivoAQP,
          pesoOrigen: mLote.kilosTotalesEstimados,
          tipoVenta: venta.tipoVenta,
          cliente: venta.cliente,
          pesoLlegada: venta.pesoLlegada,
          muertos: venta.muertos,
          ventaNeta: venta.ventaNeta,
          pesoCarcasa: venta.pesoCarcasa,
          pesoCabezas: venta.pesoCabezas,
          pesoHigados: venta.pesoHigados,
          pesoRinones: venta.pesoRinones,
          pesoOtras: venta.pesoOtras,
          mermaTotal: mv.mermaTotal,
          porcentajeMerma: mv.porcentajeMerma.toFixed(2) + '%',
          totalMenudencia: mv.totalMenudencia,
          margenContribucion: mv.margenContribucion,
          porcentajeRentabilidad: mv.porcentajeRentabilidad.toFixed(2) + '%',
          costoKgFinal: mv.costoKgFinal,
          rendimientoCarcasa: mv.rendimientoCarcasa.toFixed(2) + '%'
        };

        const localVentas = localStorage.getItem('avicola_local_ventas');
        const current = localVentas ? JSON.parse(localVentas) : [...SAMPLE_VENTAS];
        const updated = [fullVentaRow, ...current];
        localStorage.setItem('avicola_local_ventas', JSON.stringify(updated));
        setVentas(updated);
      } else {
        await googleSheetsService.syncVenta({ ...venta, idPedido }, selectedLote);
        await refreshData();
      }
    } catch (err) {
      console.error('Error guardando venta:', err);
      showToast('Error al guardar registro de venta: ' + (err as Error).message, 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLote = async (nroFactura: string) => {
    setIsLoading(true);
    try {
      if (mode === 'demo') {
        const local = localStorage.getItem('avicola_local_lotes');
        const current: Lote[] = local ? JSON.parse(local) : [];
        const updated = current.filter(l => l.nroFactura !== nroFactura);
        localStorage.setItem('avicola_local_lotes', JSON.stringify(updated));
        setLotes(updated);
      } else {
        const res = await fetch('/api/lotes', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nroFactura }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Error al eliminar el lote.');
        }
        await refreshData();
      }
      showToast('Lote eliminado correctamente.', 'success');
    } catch (err) {
      showToast('Error al eliminar lote: ' + (err as Error).message, 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteVenta = async (idPedido: string) => {
    setIsLoading(true);
    try {
      if (mode === 'demo') {
        const local = localStorage.getItem('avicola_local_ventas');
        const current = local ? JSON.parse(local) : [];
        const updated = current.filter((v: any) => v.idPedido !== idPedido);
        localStorage.setItem('avicola_local_ventas', JSON.stringify(updated));
        setVentas(updated);
      } else {
        const res = await fetch('/api/ventas', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idPedido }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Error al eliminar la venta.');
        }
        await refreshData();
      }
      showToast('Registro eliminado correctamente.', 'success');
    } catch (err) {
      showToast('Error al eliminar venta: ' + (err as Error).message, 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addProveedor = async (proveedor: Proveedor) => {
    setIsLoading(true);
    try {
      if (mode === 'demo') {
        const local = localStorage.getItem('avicola_local_proveedores');
        const current: Proveedor[] = local ? JSON.parse(local) : [];
        if (current.some(p => p.ruc === proveedor.ruc)) throw new Error('Ya existe un proveedor con ese RUC.');
        const updated = [proveedor, ...current];
        localStorage.setItem('avicola_local_proveedores', JSON.stringify(updated));
        setProveedores(updated);
      } else {
        const res = await fetch('/api/proveedores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ proveedor }),
        });
        if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Error al guardar el proveedor.'); }
        await refreshData();
      }
    } catch (err) {
      showToast('Error al guardar proveedor: ' + (err as Error).message, 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProveedor = async (ruc: string) => {
    setIsLoading(true);
    try {
      if (mode === 'demo') {
        const local = localStorage.getItem('avicola_local_proveedores');
        const current: Proveedor[] = local ? JSON.parse(local) : [];
        const updated = current.filter(p => p.ruc !== ruc);
        localStorage.setItem('avicola_local_proveedores', JSON.stringify(updated));
        setProveedores(updated);
      } else {
        const res = await fetch('/api/proveedores', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ruc }),
        });
        if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Error al eliminar el proveedor.'); }
        await refreshData();
      }
      showToast('Proveedor eliminado correctamente.', 'success');
    } catch (err) {
      showToast('Error al eliminar proveedor: ' + (err as Error).message, 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

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
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(camion),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Error al guardar el camión en el servidor.');
        }
        await refreshData();
      }
    } catch (err) {
      console.error('Error guardando camión:', err);
      showToast('Error al guardar camión: ' + (err as Error).message, 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const isConfigured = !!(credentials.clientId && credentials.spreadsheetId);

  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        lotes,
        ventas,
        camiones,
        proveedores,
        isLoading,
        isConfigured,
        credentials,
        saveConfig,
        addLote,
        addVenta,
        addCamion,
        deleteLote,
        deleteVenta,
        addProveedor,
        deleteProveedor,
        showConfirm,
        loginGoogle,
        logoutGoogle,
        refreshData,
        authActive,
        showToast,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      {confirmState && (
        <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
};
