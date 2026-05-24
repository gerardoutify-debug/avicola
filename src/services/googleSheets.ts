import { type Lote, type Venta, type VentaRow, calcularMétricasLote, calcularMétricasVenta } from '../utils/calculations';

interface Credentials {
  clientId: string;
  spreadsheetId: string;
  apiKey: string;
  isConnected: boolean;
}

class GoogleSheetsService {
  // En este nuevo esquema de cuenta de servicio, la autenticación se maneja en el servidor.
  // Retornamos valores para compatibilidad con el resto del código del frontend.
  getCredentials(): Credentials {
    return {
      clientId: 'service-account',
      spreadsheetId: '1dK39Vod-d_Pe4u68aC7kI4Fx645t30zIcfB2jHs2iMA',
      apiKey: 'api-key',
      isConnected: true,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  saveCredentials(_creds: Partial<Credentials>): void {
    // No hace falta guardar en cliente ya que está en las variables de entorno de Vercel/servidor
  }

  clearToken(): void {
    // No hace falta
  }

  async loadGoogleSDKs(): Promise<void> {
    // No hace falta cargar scripts de Google
    return Promise.resolve();
  }

  isAuthenticated(): boolean {
    // Siempre asumimos que está autenticado a través de la cuenta de servicio del servidor
    return true;
  }

  async authenticate(): Promise<string> {
    return Promise.resolve('service-account-token');
  }

  // Guardar un lote en Google Sheets
  async syncLote(lote: Lote): Promise<void> {
    const metrics = calcularMétricasLote(lote); // Calcular métricas antes de enviar
    
    const res = await fetch('/api/lotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lote, metrics }), // Enviar ambos objetos
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al guardar el lote en el servidor.');
    }
  }

  // Cargar lotes guardados desde Sheets
  async getLotes(): Promise<Lote[]> {
    const res = await fetch('/api/lotes');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al cargar los lotes del servidor.');
    }
    return res.json();
  }

  // Guardar una venta / proceso en Google Sheets (pestaña Base de Datos)
  async syncVenta(venta: Venta, lote: Lote): Promise<void> {
    const m = calcularMétricasLote(lote);
    const mv = calcularMétricasVenta(venta, lote, m);

    const res = await fetch('/api/ventas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        venta,
        lote,
        metricsLote: m,
        metricsVenta: mv,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al guardar la venta en el servidor.');
    }
  }

  // Cargar registros de la base de datos de ventas
  async getVentas(): Promise<VentaRow[]> {
    const res = await fetch('/api/ventas');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al cargar las ventas del servidor.');
    }
    return res.json();
  }
}

export const googleSheetsService = new GoogleSheetsService();
