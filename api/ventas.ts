import { readSheetRange, ensureSheetExists, appendRowToSheet } from './_sheets.js';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const [rowsCarcasa, rowsEntero] = await Promise.all([
        readSheetRange('BD_Carcasas', 'A2:Z1000').catch(() => []),
        readSheetRange('BD_Enteros', 'A2:Z1000').catch(() => [])
      ]);

      const mapCarcasaRows = (rows: any[]) => {
        if (!rows || rows.length === 0) return [];
        return rows.map((row: any, idx: number) => ({
          idPedido: row[0] || `C-${idx+1}`,
          fecha: row[1] || '',
          proveedor: row[2] || '',
          origen: row[3] || '',
          loteCodigo: row[4] || '',
          tipoPollo: row[5] || '',
          sexo: row[6] || '',
          costoTotal: parseFloat(row[7]) || 0,
          pesoOrigen: parseFloat(row[8]) || 0,
          tipoVenta: row[9] || 'Carcasa',
          cliente: row[10] || '',
          pesoLlegada: parseFloat(row[11]) || 0,
          muertos: parseInt(row[12], 10) || 0,
          ventaNeta: parseFloat(row[13]) || 0,
          pesoCarcasa: parseFloat(row[14]) || 0,
          pesoCabezas: parseFloat(row[15]) || 0,
          pesoHigados: parseFloat(row[16]) || 0,
          pesoRinones: parseFloat(row[17]) || 0,
          pesoOtras: parseFloat(row[18]) || 0,
          mermaTotal: parseFloat(row[19]) || 0,
          porcentajeMerma: row[20] || '0%',
          totalMenudencia: parseFloat(row[21]) || 0,
          margenContribucion: parseFloat(row[22]) || 0,
          porcentajeRentabilidad: row[23] || '0%',
          costoKgFinal: parseFloat(row[24]) || 0,
          rendimientoCarcasa: row[25] || '0%',
        }));
      };

      const mapEnteroRows = (rows: any[]) => {
        if (!rows || rows.length === 0) return [];
        return rows.map((row: any, idx: number) => ({
          idPedido: row[0] || `E-${idx+1}`,
          fecha: row[1] || '',
          proveedor: row[2] || '',
          origen: row[3] || '',
          loteCodigo: row[4] || '',
          tipoPollo: row[5] || '',
          sexo: row[6] || '',
          costoTotal: parseFloat(row[7]) || 0,
          pesoOrigen: parseFloat(row[8]) || 0,
          tipoVenta: row[9] || 'Entero',
          cliente: row[10] || '',
          pesoLlegada: parseFloat(row[11]) || 0,
          muertos: parseInt(row[12], 10) || 0,
          ventaNeta: parseFloat(row[13]) || 0,
          pesoCarcasa: 0,
          pesoCabezas: 0,
          pesoHigados: 0,
          pesoRinones: 0,
          pesoOtras: 0,
          mermaTotal: 0,
          porcentajeMerma: '0%',
          totalMenudencia: 0,
          margenContribucion: parseFloat(row[14]) || 0,
          porcentajeRentabilidad: row[15] || '0%',
          costoKgFinal: parseFloat(row[16]) || 0,
          rendimientoCarcasa: '0%',
        }));
      };

      const ventasCarcasa = mapCarcasaRows(rowsCarcasa);
      const ventasEntero = mapEnteroRows(rowsEntero);
      
      // Combinar y opcionalmente ordenar por fecha o ID
      const allVentas = [...ventasCarcasa, ...ventasEntero];
      
      return res.status(200).json(allVentas);
    }

    if (req.method === 'POST') {
      const { venta, lote, metricsLote, metricsVenta } = req.body;
      
      const isCarcasa = venta.tipoVenta === 'Carcasa';
      const targetSheet = isCarcasa ? 'BD_Carcasas' : 'BD_Enteros';

      const baseRow = [
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
        parseFloat(venta.pesoLlegada.toFixed(3)),
        venta.muertos,
        parseFloat(venta.ventaNeta.toFixed(2)),
      ];

      let headers: string[];
      let rowValues: any[];

      if (isCarcasa) {
        headers = [
          'ID_Pedido', 'Fecha', 'Proveedor', 'Origen', 'Lote/Placa', 'Tipo Pollo', 'Sexo',
          'Costo Total', 'Peso Origen', 'Tipo Venta', 'Cliente', 'Peso Llegada', 'Muertos',
          'Venta Neta', 'Peso Carcasa', 'Peso Cabezas', 'Peso Hígados', 'Peso Riñones',
          'Peso Otras', 'Merma Total', '% Merma', 'Total Menudencia', 'Margen Contribución',
          '% Rentabilidad', 'Costo x KG Final', 'Rendimiento Carcasa'
        ];
        rowValues = [
          ...baseRow,
          parseFloat(venta.pesoCarcasa.toFixed(3)),
          parseFloat(venta.pesoCabezas.toFixed(3)),
          parseFloat(venta.pesoHigados.toFixed(3)),
          parseFloat(venta.pesoRinones.toFixed(3)),
          parseFloat(venta.pesoOtras.toFixed(3)),
          parseFloat(metricsVenta.mermaTotal.toFixed(3)),
          metricsVenta.porcentajeMerma.toFixed(2) + '%',
          parseFloat(metricsVenta.totalMenudencia.toFixed(3)),
          parseFloat(metricsVenta.margenContribucion.toFixed(2)),
          metricsVenta.porcentajeRentabilidad.toFixed(2) + '%',
          parseFloat(metricsVenta.costoKgFinal.toFixed(2)),
          metricsVenta.rendimientoCarcasa.toFixed(2) + '%',
        ];
      } else {
        headers = [
          'ID_Pedido', 'Fecha', 'Proveedor', 'Origen', 'Lote/Placa', 'Tipo Pollo', 'Sexo',
          'Costo Total', 'Peso Origen', 'Tipo Venta', 'Cliente', 'Peso Llegada', 'Muertos',
          'Venta Neta', 'Margen Contribución', '% Rentabilidad', 'Costo x KG Final'
        ];
        rowValues = [
          ...baseRow,
          parseFloat(metricsVenta.margenContribucion.toFixed(2)),
          metricsVenta.porcentajeRentabilidad.toFixed(2) + '%',
          parseFloat(metricsVenta.costoKgFinal.toFixed(2)),
        ];
      }

      await ensureSheetExists(targetSheet, headers);

      await appendRowToSheet(targetSheet, rowValues);
      
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('Error in /api/ventas serverless function:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
