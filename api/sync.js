export default async function handler(req, res) {
  const UPSTASH_URL = process.env.KV_REST_API_URL;
  const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN;

  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return res.status(500).json({ error: 'KV not configured' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  async function redis(cmd, ...args) {
    const r = await fetch(`${UPSTASH_URL}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([cmd, ...args])
    });
    const j = await r.json();
    if (j.error) throw new Error(j.error);
    return j.result;
  }

  try {
    if (req.method === 'GET') {
      const raw = await redis('GET', 'buafc_data');
      return res.json(raw ? JSON.parse(raw) : null);
    }

    if (req.method === 'POST') {
      await redis('SET', 'buafc_data', JSON.stringify(req.body));
      return res.json({ ok: true, ts: Date.now() });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
