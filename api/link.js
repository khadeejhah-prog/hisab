// Hisab — Link Check. Real checks: domain age (RDAP), HTTPS, page text, then an AI verdict
// against UAE scam patterns. No bank or product is ever recommended. Needs ANTHROPIC_API_KEY.
const MODEL = process.env.LENS_MODEL || "claude-haiku-5-5";
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  let body = req.body; if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
  let url = (body && body.url || "").trim(); if (!url) return res.status(400).json({ error: "Send { url }" });
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  let host; try { host = new URL(url).hostname.replace(/^www\./, ""); } catch { return res.status(400).json({ error: "Not a valid link" }); }
  const checks = { host, https: url.startsWith("https://"), gov: /\.gov\.ae$|\.ae$/.test(host) && /\.gov\.ae$/.test(host), registered: null, ageDays: null, title: "", text: "", reachable: false };
  // Domain age via RDAP (public, no key)
  try { const tld = host.split(".").slice(-1)[0]; const r = await fetchT(`https://rdap.org/domain/${host}`, 6000); if (r.ok) { const j = await r.json(); const ev = (j.events || []).find(e => e.eventAction === "registration"); if (ev) { checks.registered = ev.eventDate; checks.ageDays = Math.round((Date.now() - new Date(ev.eventDate)) / 864e5); } } } catch {}
  // Page text (short, with timeout)
  try { const r = await fetchT(url, 6000, { headers: { "user-agent": "Mozilla/5.0 DirhamLens/1.0" } }); checks.reachable = r.ok; const html = (await r.text()).slice(0, 200000); checks.title = (html.match(/<title[^>]*>([^<]{0,200})/i) || [,""])[1].trim(); checks.text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 4000); } catch {}
  const key = process.env.ANTHROPIC_API_KEY; if (!key) return res.status(500).json({ error: "ANTHROPIC_API_KEY is not set." });
  const SYSTEM = `You are Hisab Link Check, built by UAE students. Given a URL and what we could learn about it, decide if it is safe, risky, or a scam, for an ordinary person in the UAE.
Reply ONLY with JSON: {"verdict":"ok"|"risky"|"scam","title":"short label under 6 words","rows":[{"k":"check name","v":"finding","s":"ok"|"warn"|"bad"}],"say":"2-3 plain sentences: what this is and what to do","report":true|false}
Rules: Government fines, visas and police never arrive as SMS payment links; official UAE government domains end in .gov.ae. "Guaranteed" returns, "limited slots", urgency, crypto/forex bots, licences claimed with no number = unlicensed investment scam. Shops with no address, Instagram-only contact, bank-transfer-only payment, brand-new domains = risky. Established UAE retailers and .gov.ae domains with normal content are ok. Never name or recommend a bank, card, loan or investment product. Include rows for: domain age, official/government domain, HTTPS, licence/registration signals, pressure or scam language, contact/address, payment method (when known). Be honest about what you could not verify.`;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODEL, max_tokens: 700, system: SYSTEM, messages: [{ role: "user", content: `URL: ${url}\nFacts: ${JSON.stringify({ host: checks.host, https: checks.https, is_gov_ae: checks.gov, registered: checks.registered, age_days: checks.ageDays, reachable: checks.reachable, title: checks.title })}\nPage text (may be empty): ${checks.text}\nReply with the JSON object only.` }] }) });
    const data = await r.json(); if (!r.ok) return res.status(502).json({ error: data.error?.message || "AI request failed" });
    const text = (data.content || []).map(c => c.text || "").join(""); const json = extractJSON(text);
    if (!json) return res.status(502).json({ error: "Could not read the AI's answer" });
    json.checks = { host: checks.host, ageDays: checks.ageDays, https: checks.https, reachable: checks.reachable };
    return res.status(200).json(json);
  } catch (e) { return res.status(500).json({ error: "Server error", detail: String(e) }); }
};
async function fetchT(u, ms, opt = {}) { const c = new AbortController(); const t = setTimeout(() => c.abort(), ms); try { return await fetch(u, { ...opt, signal: c.signal, redirect: "follow" }); } finally { clearTimeout(t); } }
function extractJSON(t){ try{return JSON.parse(t)}catch{} const m=t.match(/\{[\s\S]*\}/); if(m){try{return JSON.parse(m[0])}catch{}} return null; }
