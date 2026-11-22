// Hisab — GET /api/selftest: proves the server can reach the AI. Makes one tiny text call and one tiny vision call.
const MODEL = process.env.LENS_MODEL || "claude-haiku-5-5";
const { extractJSON } = require("./lens.js").__robust;
const PX = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q==";
module.exports = async (req, res) => {
  const key = process.env.ANTHROPIC_API_KEY; const out = { ok: false, model: MODEL, keySet: !!key, keyLooksRight: !!key && /^sk-ant-/.test(key) && key.length > 60 && !/\s|…|\.\.\./.test(key), time: new Date().toISOString() };
  if (!key) return res.status(200).json({ ...out, error: "ANTHROPIC_API_KEY not set" });
  const call = async (content, max_tokens) => { const t0 = Date.now(); try {
      const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" }, body: JSON.stringify({ model: MODEL, max_tokens, messages: [{ role: "user", content }] }) });
      const d = await r.json().catch(() => ({})); const text = (d.content || []).map(c => c.text || "").join("");
      return { status: r.status, ms: Date.now() - t0, error: r.ok ? undefined : (d.error?.message || "failed"), type: d.error?.type, text: text.slice(0, 200), stop: d.stop_reason };
    } catch (e) { return { status: 0, ms: Date.now() - t0, error: String(e) }; } };
  out.textCall = await call("Reply with exactly: {\"ok\":true}", 20);
  out.textParsed = !!extractJSON(out.textCall.text || "");
  out.visionCall = await call([{ type: "image", source: { type: "base64", media_type: "image/jpeg", data: PX } }, { type: "text", text: "Reply with exactly: {\"seen\":true}" }], 20);
  out.ok = out.textCall.status === 200 && out.visionCall.status === 200;
  res.status(200).json(out);
};
