import { JWT } from 'google-auth-library';
import crypto from 'crypto';

function sanitizeEnvVar(value: string | undefined): string | undefined {
  if (!value) return undefined;
  let sanitized = value.trim();
  // Quitar comillas dobles si existen
  if (sanitized.startsWith('"') && sanitized.endsWith('"')) {
    sanitized = sanitized.substring(1, sanitized.length - 1).trim();
  }
  // Quitar comillas simples si existen
  else if (sanitized.startsWith("'") && sanitized.endsWith("'")) {
    sanitized = sanitized.substring(1, sanitized.length - 1).trim();
  }
  return sanitized;
}

let email = sanitizeEnvVar(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);

let keyRaw = sanitizeEnvVar(process.env.GOOGLE_PRIVATE_KEY);
let key = keyRaw ? keyRaw.replace(/\\n/g, '\n') : undefined;

let spreadsheetId = sanitizeEnvVar(process.env.SPREADSHEET_ID);
if (!spreadsheetId) {
  spreadsheetId = '1dK39Vod-d_Pe4u68aC7kI4Fx645t30zIcfB2jHs2iMA';
}

if (!email || !key) {
  console.error('GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY is missing in environment variables');
} else {
  console.log('Environment variables loaded successfully for Google Sheets API');
}

const jwt = new JWT({
  email,
  key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export async function requestSheetsAPI(endpoint: string, options: RequestInit = {}) {
  const token = await jwt.getAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}${endpoint}`;
  
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token.token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `HTTP ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// Leer rango de celdas
export async function readSheetRange(sheetName: string, range: string = 'A1:Z1000') {
  try {
    const data = await requestSheetsAPI(`/values/${encodeURIComponent(`'${sheetName}'!${range}`)}`);
    return data.values || [];
  } catch (err: any) {
    const msg = err.message ? err.message.toLowerCase() : '';
    if (msg.includes('not found') || msg.includes('unable to parse range') || msg.includes('bad request') || msg.includes('range')) {
      return [];
    }
    throw err;
  }
}

// Asegurar que la pestaña exista, si no, crearla con cabeceras
export async function ensureSheetExists(sheetName: string, headers: string[]) {
  let sheetExists = false;
  let isEmpty = true;

  try {
    const data = await readSheetRange(sheetName, 'A1:A1');
    sheetExists = true;
    if (data && data.length > 0) {
      isEmpty = false;
    }
  } catch (e) {
    // Si falla la lectura, asumimos que no existe la hoja
  }

  // Si la hoja no existe, la creamos
  if (!sheetExists) {
    try {
      await requestSheetsAPI(':batchUpdate', {
        method: 'POST',
        body: JSON.stringify({
          requests: [{
            addSheet: {
              properties: {
                title: sheetName,
              }
            }
          }]
        })
      });
      isEmpty = true; // Recién creada, por lo tanto vacía
    } catch (err) {
      console.error(`Error creando pestaña ${sheetName}:`, err);
    }
  }

  // Si está vacía (sea porque ya existía pero vacía, o porque la acabamos de crear), escribimos cabeceras
  if (isEmpty) {
    try {
      const colLetter = String.fromCharCode(65 + headers.length - 1);
      await requestSheetsAPI(`/values/${encodeURIComponent(`'${sheetName}'!A1:${colLetter}1`)}?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        body: JSON.stringify({
          values: [headers]
        })
      });
    } catch (err) {
      console.error(`Error escribiendo cabeceras en pestaña ${sheetName}:`, err);
    }
  }
}

// Agregar fila
export async function appendRowToSheet(sheetName: string, values: any[]) {
  return requestSheetsAPI(`/values/${encodeURIComponent(`'${sheetName}'!A1`)}:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    body: JSON.stringify({
      values: [values]
    })
  });
}
