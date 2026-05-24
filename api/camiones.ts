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
      const sheetName = 'Base de Datos Camiones';
      const rows = await readSheetRange(sheetName, 'A2:C1000');
      if (!rows || rows.length === 0) {
        return res.status(200).json([]);
      }

      const camiones = rows
        .filter((row: any) => row[0] && row[0].trim() !== '') // Solo filas con Placa
        .map((row: any) => ({
          placa: row[0] || '',
          conductor: row[1] || '',
          fechaRegistro: row[2] || '',
        }));
      return res.status(200).json(camiones);
    } 
    
    if (req.method === 'POST') {
      const { placa, conductor } = req.body;
      const sheetName = 'Base de Datos Camiones';

      if (!placa || !conductor) {
        return res.status(400).json({ error: 'Falta placa o conductor' });
      }

      // Validar si la placa ya existe
      const existingRows = await readSheetRange(sheetName, 'A2:A1000');
      if (existingRows && existingRows.some((row: any) => row[0] === placa)) {
        return res.status(400).json({ error: 'La placa ya se encuentra registrada' });
      }

      const headers = ['Placa', 'Conductor', 'Fecha Registro'];
      await ensureSheetExists(sheetName, headers);

      const fechaRegistro = new Date().toLocaleDateString('es-ES');
      const rowValues = [placa, conductor, fechaRegistro];

      await appendRowToSheet(sheetName, rowValues);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('Error in /api/camiones serverless function:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
