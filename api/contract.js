// Hisab — Contract Reader. Photo(s) of a contract → what you're signing in five points,
// red flags, what to ask, and "what happens if". UAE-aware. Needs ANTHROPIC_API_KEY.
const MODEL = process.env.LENS_MODEL || "claude-haiku-5-5";
const SYSTEM = `You are Hisab Contract Reader, built by UAE students. The user photographed a contract (tenancy, job, gym, phone plan, car finance, school, loan, anything). Read it and explain it so a 15-year-old could understand what they are signing.
Reply ONLY with JSON:
{"kind":"tenancy"|"employment"|"membership"|"telecom"|"finance"|"school"|"other"|"unclear","title":"what this is, under 8 words","amount_aed":number or null,"period":"e.g. 12 months, 24 months, or empty","plain":"ONE sentence: what this contract is, in plain words","key":["exactly 5 short points of what the person is actually agreeing to, each under 28 words, concrete numbers where present"],"bad":[indexes 0-4 of the points that could cost the person money or freedom],"ask":["3-4 exact questions to ask before signing, in quotes"],"whatif":[{"if":"short scenario","then":"what the contract says happens"}],"talk":"one question to ask someone they trust about this","confidence":0-1}
UAE rules to apply: tenancy (RERA rent index caps increases; 4-cheque norms; Ejari; deposit 5%; early-exit penalties), employment (gratuity on BASIC only, 21 days per year first 5 years then 30; probation max 6 months; overtime over 48h at 125%; employer normally pays repatriation ticket; MOHRE standard contract), memberships (auto-renewal, non-refundable upfront, freeze limits), telecom (early exit = remaining months; price after term), finance (flat vs reducing rate; late fees; BNPL stacking). If text is unreadable, kind "unclear" and say what to photograph. Never name or recommend a bank, lender or product. Never repeat ID, passport or account numbers. Plain words, no legal jargon, no shame.`;
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const key = process.env.ANTHROPIC_API_KEY; if (!key) return res.status(500).json({ error: "ANTHROPIC_API_KEY is not set." });
  let body = req.body; if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
  const images = (body && (body.images || (body.image ? [body.image] : []))) || []; if (!images.length) return res.status(400).json({ error: "Send { images: [base64,...], profile }" });
  if (images.some(d => typeof d !== "string" || d.length > 6_000_000)) return res.status(413).json({ error: "A page image is too large. Resize under 1600px." });
  const content = images.slice(0, 4).map(d => ({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: d } }));
  content.push({ type: "text", text: `Profile: ${JSON.stringify(body.profile || {})}\nReply with the JSON object only.` });
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" }, body: JSON.stringify({ model: MODEL, max_tokens: 1100, system: SYSTEM, messages: [{ role: "user", content }] }) });
    const data = await r.json(); if (!r.ok) return res.status(502).json({ error: data.error?.message || "AI request failed" });
    const text = (data.content || []).map(c => c.text || "").join(""); const json = extractJSON(text);
    if (!json) return res.status(502).json({ error: "Could not read the AI's answer" });
    return res.status(200).json(json);
  } catch (e) { return res.status(500).json({ error: "Server error", detail: String(e) }); }
};
function extractJSON(t){ try{return JSON.parse(t)}catch{} const m=t.match(/\{[\s\S]*\}/); if(m){try{return JSON.parse(m[0])}catch{}} return null; }
