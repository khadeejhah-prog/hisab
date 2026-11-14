// Hisab — setup check. The app calls this on first open and shows a banner if the AI key is missing.
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({ ok: true, keySet: !!process.env.ANTHROPIC_API_KEY, model: process.env.LENS_MODEL || "claude-haiku-5-5", logSet: !!process.env.LOG_URL, time: new Date().toISOString() });
};
