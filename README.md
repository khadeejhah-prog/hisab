# Hisab (حساب)

*Hisab means "the count". Formerly Dirham Lens.*

**Point your camera at anything that costs money in the UAE and see what it really costs, in hours of your own work, in your language.**

A student project for **Money, Out Loud 2026** (Squirrel Education × Wio). This README is also our "Built to Last" kit: any school can run Hisab tomorrow by following it. No coding needed.

---

## What it does (v3)

1. **Onboarding that shapes everything.** Language → three promises → nickname, **date of birth** and a buddy (16 animals, animated) → a 20-second **check-in** (the judged question: "How confident do you feel talking about money at home, 1–5?") → who you are (options change with age) → up to three goals (+ "interest-free first?" for adults) → detail level (Easy peasy / Confident / Expert) → your real money (pocket money and how often, or monthly pay and hours; or skip) → **Make it yours** (one thing you want + its price, three words that sound like you, who you talk to about money) → your money persona.
2. **Scan anything.** Real camera (or a photo from the gallery). The photo goes to an AI vision model with our UAE rule-set. Kids see **weeks of pocket money**, a week-by-week strip, "same money as N bubble teas", where it's cheaper, a discount tip, **Need or Want → Do you need it now? → Remind me in a week**. Adults see **days of work**, a Mon–Fri work bar, one plain sentence, the trap, the better option, and "Explain it simpler".
3. **Type a price** when there's no camera. **Edit my money** any time; every number recalculates.
4. **Reminders** are real: 7 days later the app asks "still want it?". Forgot it = **impulse caught**, the dirhams count as kept.
5. **Earn more**: legal, age-sized ways to add income (chores and lemonade for kids; tutoring and reselling for teens; overtime on the record, freelancing, upskilling for adults). Pick some and watch your goal get closer.
6. **Contract Reader** (adults): photograph up to 4 pages of any contract → what you're signing in five points, the ones that cost you flagged, what to ask before signing, "what happens if…". Read by AI with UAE rules (gratuity on basic, RERA index, auto-renewals, early-exit fees).
7. **Link Check** (adults): paste a link → the server looks up when the domain was registered (public RDAP record), checks HTTPS and whether it's an official .gov.ae site, reads the page, and the AI gives a verdict: looks real / risky / scam, with the reasons.
8. **Big purchases**: home, car, study. Both ways side by side — with interest, and interest-free (Murabaha / Ijara / Qard Hasan) — in dirhams a month and days of work.
9. **Payday Split** (workers), **Goal Jar / Safety Jar**, **Life after the UAE** (gratuity + savings → years), **Family Shield** (warning text ready to share), **Challenge a friend** (kids), **Family** (parents add children with their own date of birth and pocket money, and can open the child's Lens; badges are shared, scans never are), **Impact**, **Financial Passport**, **History**.
10. **Account on the phone, not in the cloud**: profile photo, nickname, optional 4-digit passcode lock (stored as a hash). Terms of use and a Privacy notice are accepted at setup and readable in Settings.
11. **Settings**: nickname, buddy, language, big text, read answers aloud (the phone speaks every result in your language), less motion, simpler adult answers, edit money, export, delete everything.
12. **Levels and prizes** (recognition only): Starter → Saver (25) → Guardian (60) → Mentor (120) → Legend (200). Each level unlocks a new buddy, a shareable certificate image, and badges. Streaks: 3, 7 and 14 days. No vouchers, no money, no products.
13. Everything is saved on the phone. No cloud account by design: see the Privacy notice inside the app. The **after check-in** opens from the Impact screen; both check-ins and every decision go to the anonymous log.

## Who can use it

Anyone with any phone: it is a link, not an app-store download, so it works on a Dh300 Android and an iPhone alike, with no account and no card. Children get a kid Lens by date of birth; adults get the full set; parents can add children. The AI answers in six languages. Big text, read-aloud and less-motion settings are built in for people who read slowly, see poorly or get overwhelmed by animation. The only cost is to whoever hosts it, and that is a fraction of a fils per scan.

## Languages

The AI answers in the language you pick (English, Arabic, Hindi, Urdu, Tagalog, Nepali). The screens themselves are in English in this version; translating them is the first job for the next team (all the text is in `public/index.html`).

## What it costs to run (checked Nov 2026)

Hosting is free: GitHub (code) and Vercel's Hobby plan (the app and the `/api` functions) cost nothing for a school project. The only running cost is the AI, billed per token on your own key at console.anthropic.com. Prices below are Anthropic's list prices (Sonnet 5.5: $2 per million input tokens, $10 per million output; Haiku 5.5: $0.10 / $0.50) converted at Dh3.67 to the dollar. A 1280px photo is about 1,600 tokens; our instructions add about 900.

| Action | Tokens (in / out) | Haiku 5.5 (default) | Sonnet 5.5 (`LENS_MODEL=claude-sonnet-5-5`) |
|---|---|---|---|
| One scan | ~2,700 / ~450 | ≈ 0.2 fils | ≈ 4 fils |
| Contract Reader, 4 pages | ~7,800 / ~900 | ≈ 0.5 fils | ≈ 9 fils |
| Link Check | ~1,900 / ~350 | ≈ 0.2 fils | ≈ 3 fils |
| A pilot: 100 people × 20 scans | 2,000 scans | ≈ Dh4 | ≈ Dh75 |

The app runs on Haiku by default: Dh20 of credit covers a whole school pilot. If contract reading is not sharp enough, set `LENS_MODEL` to `claude-sonnet-5-5` in Vercel and redeploy. Check current prices at platform.claude.com/docs before you budget; they change.

## The rules we follow (from the competition brief)

- **No selling.** The app never names or promotes a bank, card, loan, investment, crypto or betting product. Comparisons say "a licensed transfer app".
- **No private money details.** Pocket money, pay and date of birth are stored only in the phone's browser and never sent anywhere. A scan sends the photo plus only: kid/adult, age band, language, level, who you are. The weeks-of-pocket-money and days-of-work numbers are worked out on the phone.
- **Ask first.** Only scan things you are allowed to photograph. Never scan someone else's card, ID or account number.
- **Kind and all-ages.** The AI is instructed to be a smart friend, not a bank. Kid mode talks in weeks of pocket money and plain sentences.
- **AI note.** The AI reads the photo. We used AI to help build the app. The idea, the testing and the evidence are ours.

---

## Run it at your school in 15 minutes (no coding)

You need: a GitHub account (free), a Vercel account (free), an Anthropic API key (a fraction of a fils per scan; see the cost table above).

1. **Get the code.** Download this folder as a ZIP, or fork the GitHub repo.
2. **Put it on GitHub.** Create a new repository called `hisab`, upload all the files (keep the folders `api/` and `public/` as they are).
3. **Deploy on Vercel.** Go to vercel.com → Add New Project → Import your `hisab` repo → leave settings as default → Deploy. You get a link like `https://hisab-yourname.vercel.app`.
4. **Add the AI key.** In Vercel: Project → Settings → Environment Variables → add `ANTHROPIC_API_KEY` with your key from console.anthropic.com. Then Deployments → Redeploy. (The app uses `claude-haiku-5-5`, the cheapest model. Optional: `LENS_MODEL` = `claude-sonnet-5-5` for sharper contract reading. Check current model names at platform.claude.com/docs.)
5. **Test it.** Open the link on a phone. Go through onboarding, scan a price tag. If a scan says "Could not read it", check step 4.
6. **(Optional) Collect the impact log in a Google Sheet.**
   - Create a Google Sheet. Extensions → Apps Script. Paste `tools/apps-script.gs` from this repo. Deploy → New deployment → Web app → Execute as **Me**, Who has access **Anyone** → copy the URL.
   - In Vercel add `LOG_URL` = that URL. Redeploy. Every decision now lands in the sheet as one anonymous row.
7. **Share the link.** Open it on a phone → Add to Home Screen. It installs like an app.

That is the whole setup. A teacher or a Year 10 team can repeat it next year with this page alone.

---

## How we measured impact (copy this)

**Before form** (Google Form, with name and email so judges can trust it):
1. How confident do you feel talking about money at home? (1–5)
2. Before you buy something, do you ever work out how many hours of work it costs? (Never / Sometimes / Always)
3. In the last week, did you buy anything you now regret? (Yes / No)
4. Have you ever checked whether an "investment" message was a scam before replying? (Yes / No / Never had one)

**After form** (same people, two weeks later): questions 1–4 again, plus
5. What will you do differently now? (free text)
6. Did you use Hisab without anyone asking you to? (Yes / No)
7. Paste your "Your week" summary from the app's History screen.

**From the app itself:** Impact → "Download my evidence (CSV)" gives every scan, decision and both check-ins with dates and the phone's anonymous code. Collect one CSV per tester for the evidence pages.

**From the app log** (anonymous): scans per person, % of scans that ended in skip / save / switch / report, dirhams not spent, scams reported.

**The one number** for the pitch is the change in question 2 ("work out the hours") plus the dirhams not spent.

## How it could pay for itself (if a judge or investor asks)

During the competition Hisab sells nothing and promotes nothing; that is a rule and it is also why families trust it. After the competition, the honest routes are:

1. **Schools licence.** Dh5–10 per student per year for the class dashboard, the before/after evidence report and teacher materials. 300 students = Dh1,500–3,000 a year per school; AI cost for that school ≈ Dh30. The UAE has ~700 private schools with a financial-literacy requirement coming in.
2. **Employer edition for workers.** Companies with large blue-collar workforces pay per worker (Dh2–5 a month) for Payday Split, Contract Reader in six languages and scam protection. It is a welfare and retention line in their budget, not a sale to the worker.
3. **A non-selling sponsor.** A bank, exchange house or regulator pays to be "brought to you by" without ever appearing inside the advice. The app stays product-neutral; the sponsor buys reach and goodwill.
4. **Adult premium, later.** Unlimited Contract Reader, family accounts and export for Dh9 a month. Kids and the basic scan stay free forever.

What it will never do: take a referral fee from a loan, card, BNPL or investment product. The moment the app earns from what you buy, it stops being on your side.

Unit economics with the default model: one active user costs about 10 fils a month in AI plus nothing in hosting, so every route above is profitable from the first customer.

## Who keeps it going

- The deployed link stays live for free on Vercel. The only running cost is the AI key (a few dirhams a month for a school).
- Ownership passes to next year's Year 10 business/economics club, with the lead teacher as sponsor. Their first job: run the before form in Week 1, the after form in Week 3, and update the evidence page.
- Anyone can add a language: copy a block in the `I` object in `public/index.html` and translate the strings.

## What didn't work (honest notes for the next team)

- Some phones block the in-browser camera in private mode. The app falls back to the phone's camera app automatically.
- Blurry photos get "unclear". Fill the frame; in the camera tap "Add a note" for things like "this is a monthly price".
- The in-browser camera needs HTTPS. Vercel gives you that. Opening the file from your computer directly will not.
- Reminders fire when the app is opened a week later (no push notifications; that needs an app store build).
- The AI sometimes guesses a price when the photo has none. The confidence number shows that; we tell people to check before signing.

## Files

- `public/index.html` — the whole app (one file)
- `api/lens.js` — sends the photo to the AI with our UAE rule-set, returns the answer
- `api/contract.js` — Contract Reader (up to 4 photos → five points, flags, questions, what-ifs)
- `api/link.js` — Link Check (domain age via RDAP, HTTPS, .gov.ae, page text → AI verdict)
- `api/log.js` — anonymous decision log
- `tools/apps-script.gs` — Google Sheet collector
- `public/manifest.json`, `public/sw.js`, icons — makes it installable
