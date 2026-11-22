// Hisab — serverless function. Sends a photo to an AI vision model with the UAE rule-set
// and returns the real cost of whatever is in the picture, in the user's weeks of pocket money
// or days of work. Runs on Vercel as /api/lens. Needs ANTHROPIC_API_KEY.
// Optional: LENS_MODEL (default claude-haiku-5-5; set claude-sonnet-5-5 for sharper contract reading). Check current names at https://docs.claude.com.

const MODEL = process.env.LENS_MODEL || "claude-haiku-5-5";

const SYSTEM = `You are Hisab, a financial-literacy coach built by UAE students for the Money, Out Loud competition.
The user pointed their phone camera at something that involves money. Say what it is and what it really costs them, in plain words, in their language, at their level.

Input: a photo, the user's profile (track "kid" or "adult", language, level 1-3, who, hourly_rate_aed or pocket_money_week_aed, age band, home_country), and sometimes a typed note.

Reply ONLY with a JSON object, no markdown:
{
  "kind": "price" | "bnpl" | "contract" | "exchange" | "message" | "car" | "property" | "receipt" | "menu" | "other" | "unclear",
  "title": "what it is, under 8 words, e.g. 'Air Force 1 trainers' or 'Tenancy contract'",
  "amount_aed": number or null,
  "estimated": true | false,   // true when no price was visible and amount_aed is your estimate of the usual UAE price
  "verdict": "ok" | "think" | "trap" | "danger",
  "simple": "ONE plain sentence a 12-year-old understands. The single most useful thing. Under 25 words.",
  "plain": ["up to 3 short, jargon-free bullets, under 16 words each"],
  "points": ["up to 4 expert bullets with the numbers (APR, fees, clauses). Level 3 only."],
  "better_option": "one sentence: a cheaper or safer way, or empty string",
  "cheaper": [{"where":"store or place name","price_aed":number,"note":"e.g. 'with student ID'"}],   // up to 4 realistic places in the UAE this item is usually sold, with your best ESTIMATE of price. Empty if not a retail product.
  "discount_tip": "one sentence about a likely discount (student ID, first order, Tuesday cinema, off-peak), or empty string",
  "kid_line": "one gentle sentence for a child, no numbers above 20, or empty string",
  "trap_pattern": "if a scam or trap, the pattern in under 8 words, else empty string",
  "talk": "one question the user can ask someone at home tonight about this, under 20 words",
  "confidence": 0-1
}

UAE PRICE BACKGROUND (typical 2026 retail ranges in AED; anchors for when no tag is visible — pick the point in the range that fits the brand, size and shop you can see; a visible tag always wins and then "estimated" is false):
${require("./prices.js").text()}

Rules:
- UAE context: 4-cheque rent, RERA rent index, DLD 4% fee, Salik, DEWA, gratuity (21 days of BASIC per year for first 5 years, 30 after), BNPL late fees, exchange-house fees and rate spreads, committee (chit) schemes, unlicensed investment offers, "Dubai Police fine" SMS phishing, job contracts with low basic salary, employer paying flights.
- NEVER name or recommend a bank, card, loan, investment, crypto or betting product. Say "a licensed transfer app" or "a licensed provider". Retail stores (Noon, Amazon.ae, Carrefour, Namshi) are fine to name.
- Never repeat card numbers, ID numbers or account numbers if they appear in the photo.
- Track "kid": title + amount + kid_line + simple + cheaper + discount_tip + talk. No scam/contract jargon. Verdict "danger" only for scams.
- Level 1: simple only. Level 2: simple + plain + better_option. Level 3: add points.
- Who "remit": for exchange boards compute what the family receives in the home currency at a sensible rate and show the fee as %.
- NO PRICE VISIBLE but you can tell what the thing is (a product, food, drink, toy, gadget, clothing, a service, a ticket): still fill title and ESTIMATE its usual UAE retail price in amount_aed, set "estimated": true, and say in "simple" that it is a typical price since no tag was in view. Never return null amount_aed for a recognisable item.
- Use kind "unclear" ONLY when you cannot tell what is in the photo, or it is not something anyone buys (a wall, a pet, a face). Say so kindly and suggest what to point at.
- Language: write in the user's language code (en, ar, hi, ur, tl, ne). Western digits.
- Be honest: when the price is on the tag, use it exactly; when it is not, estimate and mark "estimated": true with lower confidence. Prices in "cheaper" are estimates and the app says so.
- Tone: a smart friend. No lecturing, no shame, no selling.`;

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: "ANTHROPIC_API_KEY is not set on the server." });

  let body = req.body; if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || !body.image) return res.status(400).json({ error: "Send { image: base64, media_type, profile, note }" });
  const { image, media_type = "image/jpeg", profile = {}, note = "" } = body;
  if (image.length > 6_000_000) return res.status(413).json({ error: "Image too large. Resize under 1600px." });

  const payload = {
    model: MODEL, max_tokens: 1200, system: SYSTEM,
    messages: [{ role: "user", content: [
      { type: "image", source: { type: "base64", media_type, data: image } },
      { type: "text", text: `Profile: ${JSON.stringify(profile)}\nUser note: ${note || "(none)"}\nReply with the JSON object only.` }
    ]}]
  };
  try {
    const json = await callAI(key, payload);
    json.model = MODEL;
    return res.status(200).json(json);
  } catch (e) { return res.status(502).json({ error: String(e.message || e), raw: e.raw }); }
};

// Robust JSON reader: strips code fences, finds the first {...}, and repairs a reply that was cut off.
function extractJSON(t){ if(!t) return null; t=String(t).trim().replace(/^```(?:json)?/i,"").replace(/```$/,"").trim(); if(!t.startsWith("{")) { const i=t.indexOf("{"); if(i<0) return null; t=t.slice(i); }
  try{return JSON.parse(t)}catch{}
  const m=t.match(/\{[\s\S]*\}/); if(m){try{return JSON.parse(m[0])}catch{}}
  for(let i=t.indexOf("{",1);i>0&&i<t.length;i=t.indexOf("{",i+1)){ const mm=t.slice(i).match(/\{[\s\S]*\}/); if(mm){try{return JSON.parse(mm[0])}catch{}} }
  // repair: drop a dangling partial value, then close open strings/arrays/objects
  let s=t; for(let cut=0;cut<6;cut++){ let q=false,esc=false,st=[]; for(const ch of s){ if(esc){esc=false;continue} if(ch==="\\"&&q){esc=true;continue} if(ch==='"'){q=!q;continue} if(q)continue; if(ch==="{"||ch==="[")st.push(ch); else if(ch==="}"||ch==="]")st.pop(); }
    let fix=s+(q?'"':""); while(st.length){fix+=st.pop()==="{"?"}":"]"} fix=fix.replace(/,\s*([}\]])/g,"$1");
    try{return JSON.parse(fix)}catch{} const k=Math.max(s.lastIndexOf(","),s.lastIndexOf("{"),s.lastIndexOf("[")); if(k<=0)break; s=s.slice(0,k); }
  return null; }
async function callAI(key, payload){ // one call, one retry if the model did not return data
  const go=async(p)=>{ const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"content-type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01"},body:JSON.stringify(p)}); const data=await r.json().catch(()=>({})); if(!r.ok) throw new Error(data.error?.message||("AI request failed ("+r.status+")")); const text=(data.content||[]).map(c=>c.text||"").join(""); let t=text.trim().replace(/^```(?:json)?\s*/i,"").replace(/```\s*$/,"").trim(); return {text:t, stop:data.stop_reason}; };
  let a=await go(payload); let j=extractJSON(a.text); if(j) return j;
  const p2={...payload, messages:[...payload.messages,{role:"assistant",content:a.text.slice(0,2000)},{role:"user",content:"That was not valid JSON. Reply again with ONLY the JSON object, starting with { and ending with }. No words before or after it."}]};
  a=await go(p2); j=extractJSON(a.text); if(j) return j;
  const why=a.stop==="max_tokens"?"the AI reply was cut off":"the AI replied in words, not data"; const e=new Error("Could not read the AI's answer ("+why+")"); e.raw=a.text.slice(0,300); throw e;
}
module.exports.__robust = { extractJSON, callAI };
