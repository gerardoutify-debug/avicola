import { readSheetRange, ensureSheetExists, appendRowToSheet, deleteRowFromSheet } from './_sheets.js';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const sheetName = 'Base de Datos Lotes';
      const rows = await readSheetRange(sheetName, 'A2:AG1000');
      if (!rows || rows.length === 0) {
        return res.status(200).json([]);
      }

      const lotes = rows
        .filter((row: any) => row[1] && row[1].trim() !== '') // Solo filas con N° Factura
        .map((row: any) => ({
        fechaIngreso: row[0] || '',
        nroFactura: row[1] || '',
        placaCamion: row[2] || '',
        precioKg: parseFloat(row[4]) || 0,
        totalJabas: parseInt(row[5], 10) || 0,
        fleteTotal: parseFloat(row[6]) || 0,
        pollosMuertos: parseInt(row[7], 10) || 0,
        porcentajeHembra: parseFloat(row[8]) || 0,
        pesoMinHembra: parseFloat(row[9]) || 0,
        pesoMaxHembra: parseFloat(row[10]) || 0,
        pollosxJabaHembra: parseFloat(row[11]) || 0,
        porcentajeMacho: parseFloat(row[12]) || 0,
        pesoMinMacho: parseFloat(row[13]) || 0,
        pesoMaxMacho: parseFloat(row[14]) || 0,
        pollosxJabaMacho: parseFloat(row[15]) || 0,
        proveedor: row[16] || '',
        origen: row[17] || '',
      }));
      return res.status(200).json(lotes);
    } 
    
    if (req.method === 'POST') {
      const { lote, metrics } = req.body;
      const sheetName = 'Base de Datos Lotes';
      
      // 1. Validation: Check if nroFactura already exists
      const existingRows = await readSheetRange(sheetName, 'B2:B1000');
      if (existingRows && existingRows.some((row: any) => row[0] === lote.nroFactura)) {
        return res.status(400).json({ error: 'Factura duplicada' });
      }

      const headers = [
        'Fecha Ingreso', 'Nro Factura', 'Placa Camion', 'Codigo Lote', 'Precio Kg', 'Total Jabas', 
        'Flete Total', 'Bajas (Muertos)', 'Pct Hembra', 'Peso Min Hembra', 'Peso Max Hembra', 
        'Pollos/Jaba Hembra', 'Pct Macho', 'Peso Min Macho', 'Peso Max Macho', 'Pollos/Jaba Macho', 
        'Proveedor', 'Origen', 'Prom Peso Hembra', 'Prom Peso Macho', 'Prom Peso Pollo Ponderado', 
        'Prom Pollo/Jaba Ponderado', 'Cant Pollos Estimada', 'Kilos Totales Estimados', 
        'Monto Pagar Proveedor', 'Merma Kilos', 'Merma Valorizada', 'Val Pollos Muertos', 
        'Val Pollos', 'Costo Total Vivo AQP', 'Cant Pollos Vendibles', 'Costo Pollo/Unidad', 
        'Precio Kg Puesto AQP'
      ];
      
      await ensureSheetExists(sheetName, headers);

      const rowValues = [
        lote.fechaIngreso, lote.nroFactura, lote.placaCamion, metrics.codigoLote,
        lote.precioKg, lote.totalJabas, lote.fleteTotal, lote.pollosMuertos,
        lote.porcentajeHembra, lote.pesoMinHembra, lote.pesoMaxHembra, lote.pollosxJabaHembra,
        lote.porcentajeMacho, lote.pesoMinMacho, lote.pesoMaxMacho, lote.pollosxJabaMacho,
        lote.proveedor || '', lote.origen || '',
        metrics.promPesoHembra, metrics.promPesoMacho, metrics.promPesoPolloPonderado, metrics.promPolloJabaPonderado,
        metrics.cantidadPollosEstimada, metrics.kilosTotalesEstimados, metrics.montoPagarProveedor, metrics.mermaKilos,
        metrics.mermaValorizada, metrics.valorizadoPollosMuertos, metrics.valorizadoPollos, metrics.costoTotalPolloVivoAQP,
        metrics.cantidadPollosVendibles, metrics.costoPolloPorUnidad, metrics.precioKgPuestoAQP
      ];

      await appendRowToSheet(sheetName, rowValues);
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { nroFactura } = req.body;
      const sheetName = 'Base de Datos Lotes';
      const rows = await readSheetRange(sheetName, 'B2:B1000');
      const rowIdx = rows.findIndex((row: any) => row[0] === nroFactura);
      if (rowIdx === -1) return res.status(404).json({ error: 'Lote no encontrado' });
      await deleteRowFromSheet(sheetName, rowIdx + 1);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('Error in /api/lotes serverless function:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
