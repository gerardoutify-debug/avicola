export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const { numero } = req.query;
  if (!numero || typeof numero !== 'string' || !/^\d{11}$/.test(numero)) {
    return res.status(400).json({ error: 'RUC inválido. Debe tener 11 dígitos.' });
  }

  try {
    const response = await fetch(`https://apis.net.pe/api-ruc?numero=${numero}`, {
      headers: { 'Referer': 'https://apis.net.pe/', 'Accept': 'application/json' },
    });
    if (!response.ok) throw new Error(`Error SUNAT: ${response.status}`);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error al consultar el RUC' });
  }
}
