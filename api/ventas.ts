import { readSheetRange, ensureSheetExists, appendRowToSheet, deleteRowFromSheet } from './_sheets.js';

const SHEET = 'BD_Ventas';
const HEADERS = [
  'ID_Pedido', 'Fecha', 'Proveedor', 'Origen', 'Lote Código', 'Tipo Pollo', 'Sexo',
  'Costo Total', 'Peso Origen', 'Tipo Venta', 'Cliente', 'Cantidad Pollos',
  'Peso Llegada', 'Peso Salida', 'Venta Neta', 'Merma Total', '% Merma',
  'Rendimiento Real', 'Margen Contribución', '% Rentabilidad', 'Costo x KG Final'
];

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const rows = await readSheetRange(SHEET, 'A2:U1000').catch(() => []);
      if (!rows || rows.length === 0) return res.status(200).json([]);

      const ventas = rows
        .filter((row: any) => row[0] && row[0].trim() !== '')
        .map((row: any, idx: number) => ({
          idPedido: row[0] || `V-${idx + 1}`,
          fecha: row[1] || '',
          proveedor: row[2] || '',
          origen: row[3] || '',
          loteCodigo: row[4] || '',
          tipoPollo: row[5] || '',
          sexo: row[6] || '',
          costoTotal: parseFloat(row[7]) || 0,
          pesoOrigen: parseFloat(row[8]) || 0,
          tipoVenta: row[9] || '',
          cliente: row[10] || '',
          cantidadPollos: parseInt(row[11], 10) || 0,
          pesoLlegada: parseFloat(row[12]) || 0,
          pesoSalida: parseFloat(row[13]) || 0,
          ventaNeta: parseFloat(row[14]) || 0,
          mermaTotal: parseFloat(row[15]) || 0,
          porcentajeMerma: row[16] || '0%',
          rendimientoReal: row[17] || '0%',
          margenContribucion: parseFloat(row[18]) || 0,
          porcentajeRentabilidad: row[19] || '0%',
          costoKgFinal: parseFloat(row[20]) || 0,
        }));

      return res.status(200).json(ventas);
    }

    if (req.method === 'POST') {
      const { venta, lote, metricsLote, metricsVenta } = req.body;

      const rowValues = [
        venta.idPedido,
        venta.fecha,
        lote.proveedor || 'Sin Proveedor',
        lote.origen || 'Origen',
        metricsLote.codigoLote,
        'Pollo Vivo',
        'Ponderado',
        parseFloat(metricsLote.costoTotalPolloVivoAQP.toFixed(2)),
        parseFloat(metricsLote.kilosTotalesEstimados.toFixed(3)),
        venta.tipoVenta,
        venta.cliente,
        venta.cantidadPollos,
        parseFloat(venta.pesoLlegada.toFixed(3)),
        parseFloat(venta.pesoSalida.toFixed(3)),
        parseFloat(venta.ventaNeta.toFixed(2)),
        parseFloat(metricsVenta.mermaTotal.toFixed(3)),
        metricsVenta.porcentajeMerma.toFixed(2) + '%',
        metricsVenta.rendimientoReal.toFixed(2) + '%',
        parseFloat(metricsVenta.margenContribucion.toFixed(2)),
        metricsVenta.porcentajeRentabilidad.toFixed(2) + '%',
        parseFloat(metricsVenta.costoKgFinal.toFixed(2)),
      ];

      await ensureSheetExists(SHEET, HEADERS);
      await appendRowToSheet(SHEET, rowValues);
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { idPedido } = req.body;
      const rows = await readSheetRange(SHEET, 'A2:A1000');
      const idx = rows.findIndex((row: any) => row[0] === idPedido);
      if (idx !== -1) {
        await deleteRowFromSheet(SHEET, idx + 1);
        return res.status(200).json({ success: true });
      }
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('Error in /api/ventas:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
