import { readSheetRange, ensureSheetExists, appendRowToSheet, deleteRowFromSheet } from './_sheets.js';

const SHEET = 'BD_Proveedores';
const HEADERS = ['RUC', 'Razón Social', 'Estado', 'Condición', 'Dirección', 'Contacto', 'Teléfono', 'Fecha Registro'];

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const rows = await readSheetRange(SHEET, 'A2:H1000');
      if (!rows || rows.length === 0) return res.status(200).json([]);
      const proveedores = rows
        .filter((row: any) => row[0] && row[0].trim() !== '')
        .map((row: any) => ({
          ruc: row[0] || '',
          razonSocial: row[1] || '',
          estado: row[2] || '',
          condicion: row[3] || '',
          direccion: row[4] || '',
          contacto: row[5] || '',
          telefono: row[6] || '',
          fechaRegistro: row[7] || '',
        }));
      return res.status(200).json(proveedores);
    }

    if (req.method === 'POST') {
      const { proveedor } = req.body;
      const existing = await readSheetRange(SHEET, 'A2:A1000');
      if (existing.some((row: any) => row[0] === proveedor.ruc)) {
        return res.status(400).json({ error: 'Ya existe un proveedor con ese RUC.' });
      }
      await ensureSheetExists(SHEET, HEADERS);
      await appendRowToSheet(SHEET, [
        proveedor.ruc,
        proveedor.razonSocial,
        proveedor.estado || '',
        proveedor.condicion || '',
        proveedor.direccion || '',
        proveedor.contacto || '',
        proveedor.telefono || '',
        proveedor.fechaRegistro || '',
      ]);
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { ruc } = req.body;
      const rows = await readSheetRange(SHEET, 'A2:A1000');
      const idx = rows.findIndex((row: any) => row[0] === ruc);
      if (idx === -1) return res.status(404).json({ error: 'Proveedor no encontrado.' });
      await deleteRowFromSheet(SHEET, idx + 1);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('Error in /api/proveedores:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
