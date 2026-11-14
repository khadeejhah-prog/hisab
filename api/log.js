// Hisab — anonymous action log for your impact evidence.
// The app sends one small event per decision: { id, who, level, lang, kind, verdict, action, amount_aed, hours }.
// No names, no photos, no private details. "id" is a random code the phone made up.
//
// If you set LOG_URL to a Google Apps Script web-app URL, events are forwarded there
// and land in a Google Sheet (see README, step 6). If LOG_URL is not set, events are
// accepted and dropped, so the app still works.

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body) return res.status(400).json({ error: "No event" });

  const allowed = ["id","track","who","level","lang","age","kind","verdict","action","amount_aed","saved","q1b","q1a","q2b","q2a","q3b"];
  const event = { ts: new Date().toISOString() };
  for (const k of allowed) if (body[k] !== undefined) event[k] = String(body[k]).slice(0, 40);

  const url = process.env.LOG_URL;
  if (!url) return res.status(200).json({ ok: true, stored: false });
  try {
    await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(event) });
    return res.status(200).json({ ok: true, stored: true });
  } catch (e) {
    return res.status(200).json({ ok: true, stored: false, note: String(e) });
  }
};
