import { JWT } from 'google-auth-library';
import * as dotenv from 'dotenv';
dotenv.config();

const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const spreadsheetId = process.env.SPREADSHEET_ID || '1dK39Vod-d_Pe4u68aC7kI4Fx645t30zIcfB2jHs2iMA';

const jwt = new JWT({
  email,
  key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function clearSheets() {
  const token = await jwt.getAccessToken();
  const sheets = ['Base de Datos Lotes', 'BD_Carcasas', 'BD_Enteros', 'Registro_Lotes', 'Base de Datos'];
  
  console.log('Iniciando limpieza de hojas...');

  for (const sheet of sheets) {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheet)}!A2:Z1000:clear`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (res.ok) {
        console.log(`✅ Hoja "${sheet}" limpiada (datos eliminados, encabezados preservados).`);
      } else {
        const err = await res.json();
        console.warn(`⚠️ No se pudo limpiar "${sheet}": ${err.error?.message || 'Hoja no encontrada'}`);
      }
    } catch (e) {
      console.error(`❌ Error en "${sheet}":`, e);
    }
  }
  console.log('Limpieza completada.');
}

clearSheets();
