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

function colToLetter(n: number): string {
  let s = '';
  while (n > 0) {
    n--;
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
}

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
  // Verificar existencia real via metadata (no via lectura de rango, que puede engañar)
  const metadata = await requestSheetsAPI('');
  const existingSheets: any[] = metadata.sheets || [];
  const sheetExists = existingSheets.some((s: any) => s.properties?.title === sheetName);

  if (!sheetExists) {
    await requestSheetsAPI(':batchUpdate', {
      method: 'POST',
      body: JSON.stringify({
        requests: [{ addSheet: { properties: { title: sheetName } } }]
      })
    });
  }

  // Escribir cabeceras si A1 está vacío
  const headerRow = await readSheetRange(sheetName, 'A1:A1');
  if (!headerRow || headerRow.length === 0) {
    const lastCol = colToLetter(headers.length);
    await requestSheetsAPI(`/values/${encodeURIComponent(`'${sheetName}'!A1:${lastCol}1`)}?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      body: JSON.stringify({ values: [headers] })
    });
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
