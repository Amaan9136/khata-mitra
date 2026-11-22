# Khata Mitra (ಖಾತಾ ಮಿತ್ರ)

A small workflow tool for the revenue officers who process khata mutation applications in Karnataka, in Kannada first, with an English switch. One Next.js app, deployed on Vercel, MongoDB for data, Groq for the AI help.

**Live link:** `https://khata-mitra.vercel.app`

**Test logins** (both have the same access, two accounts so the history shows different people):

| Officer | Email | Password |
|---|---|---|
| Suresh Gowda, Revenue Inspector | `ri@khatamitra.in` | `Khata@2026` |
| Kavitha M, Grama Administrative Officer | `gao@khatamitra.in` | `Khata@2026` |

The login page also has one-tap buttons for both accounts.

## The problem I picked

When a farm plot is sold, or the owner dies, the name on the RTC (Pahani) has to change. That change is called mutation, and until it happens the buyer or the heirs can't get a loan against the land, can't sell it, and can't claim crop benefits in their own name. It touches a lot of people, since most landowning families go through it at some point.

How it works on paper, from the public sources I could find:

- A sale deed is registered on Kaveri, which sends a J-slip to Bhoomi, and Bhoomi opens a mutation record against the survey number. Inheritance (pouthi khata) and partitions don't have a registered deed, so those start from an application.
- A village-level officer (the Village Accountant, also referred to as the Grama Administrative Officer) checks the papers and the land. The Revenue Inspector reports on it and the Tahsildar approves it. A notice period lets neighbours and other heirs object.
- In February 2026 the state announced automatic mutation: a 7 day notice for registered transactions and 15 days for inheritance, court orders and partitions, with the khata changing by itself if nobody objects.

I could not confirm how far that rollout has actually reached on the ground, and I'm not a revenue officer, so please treat my picture of the process as researched, not lived. What I'm fairly sure of is that automation only helps the clean cases. The ones that still land on an officer's desk are the ones with a problem: a survey number that differs between the deed and the EC, a name spelled two ways, an heir missing from the certificate, a neighbour who objects. Those are exactly the cases where the officer has to read several documents side by side, visit the land, and write down why they decided what they decided. That is the work this tool is built for.

## What the app does

The officer logs in and lands on a dashboard.

**Dashboard.** Four numbers (pending, overdue, needing attention, decided this week), then the pending applications in priority order. The ones needing attention are pulled to the top under their own heading, each with chips saying why ("8 days overdue", "1 document missing", "serious mismatch", "objection raised"). Tabs for returned and decided applications, and a search box. A big "new application" button for something that arrives at the office or in the field.

**One application, four steps.** Each application moves through the same four steps. A step can't be skipped, and the server enforces that, not just the screen.

1. **Intake check (ಅರ್ಜಿ ಪರಿಶೀಲನೆ).** Shows the documents required for this type (sale or inheritance) and which have arrived. The officer confirms identity, survey number, and completeness. "All documents received" can't be ticked while something is missing.
2. **Document verification (ದಾಖಲೆ ಪರಿಶೀಲನೆ).** Cross-check of names, survey number, extent, dates and owner against the RTC. Each difference shows up as a flag with a severity. A serious flag blocks the step until the officer resolves it with a written note. The officer also has to tick that they reviewed the documents themselves.
3. **Field inspection (ಸ್ಥಳ ಪರಿಶೀಲನೆ).** A checklist built for the case, large tap targets, per-item notes, visit date, a button to record GPS, possession status (with the applicant, not with the applicant, disputed) and whether anyone objected. Every item has to be done before moving on.
4. **Decision (ತೀರ್ಮಾನ).** A recap of what the earlier steps found and three big buttons: approve, reject, return. Reject and return need a written reason. Each one opens a confirmation, so nothing happens on a stray tap.

An application can be returned at any step, for example straight at intake when a document is missing. When it comes back with the papers, "Resume" puts it back at intake and moves the due date forward by however long it sat with the applicant, so the officer isn't penalised for the applicant's delay.

**History.** Every application has a timeline: who did what and when, including each time the AI was used, each resolved flag, and the final decision with the reason. On the decision it also records whether the officer used an AI-drafted reason and whether they edited it.

## Where AI helps, and why there

I used AI only for the jobs where the officer is otherwise doing slow, careful reading, and always as a suggestion.

| Step | What the AI does | Why it's worth it |
|---|---|---|
| Any step | Reads a document and pulls out names, survey number, extent, dates, amounts | Typing these out of a scanned deed is the slowest part of verification |
| Verification | Compares all documents with the application and with each other and lists differences | Names appear in Kannada and English spellings, with and without the father's name. Plain string matching drowns in false alarms, a language model copes |
| Inspection | Drafts a checklist for this case, using the flags found earlier | A site visit for an inheritance with a disputed share isn't the same as a clean sale |
| Decision | Drafts the reason for a return or rejection | Writing a clear, polite reason in Kannada for every returned file is where officers lose time, and a vague reason makes the applicant come back again |
| Any step | Three-line case summary | Quick pick-up of a file someone else started |

Where I deliberately did **not** use AI:

- **Prioritising the queue.** The order on the dashboard is a plain scoring rule in `src/lib/priority.js` (overdue, due within 5 days, missing documents, unresolved serious flags, objection, sitting idle). An officer can see why a file is on top, and nobody has to trust a black box with who gets served first.
- **Any decision.** The AI never approves, rejects or returns anything. The decision endpoint only accepts a request that comes from the officer clicking the button, and the AI endpoint has no way to change an application's status.
- **Telling an officer a document is genuine or forged.** The prompt forbids it. The AI reports differences between documents, nothing more.

If Groq is down, rate-limited or not configured, the app says so in Kannada and every step can still be finished by hand. The AI is never on the critical path.

## How I would measure impact

I haven't had access to real data, so this is a plan and a hypothesis, not a result.

**What the delays probably are.** A mutation file waits in two ways: it sits in a queue nobody is looking at, and it bounces back because something was missing or wrong, sometimes more than once. The tool goes after both. The dashboard puts the file that is about to breach its deadline at the top. The intake check catches a missing document on day one instead of day twelve. The cross-check catches the survey number mismatch before a site visit instead of after it.

**What I'd track**, mostly from timestamps the app already stores in each application's history:

| Measure | Why |
|---|---|
| Median and 90th percentile days from receipt to decision | The headline number. The 90th percentile matters most, because the long tail is where applicants suffer |
| Share of applications decided past the service deadline | What the department is accountable for |
| Share of returns that happen at intake versus later steps | If the intake check works, returns move earlier, and late returns (wasted site visits) drop |
| Number of times a file is returned more than once | Measures rework directly |
| Flags the AI raised that the officer confirmed as real, versus dismissed | Precision of the cross-check. If officers dismiss most flags, it's noise and should be tuned or switched off |
| AI reason drafts accepted as is, edited, or thrown away | Whether the drafts are good enough to save time. The app already records the first two on every decision |
| Time spent per step, from the step timestamps | Shows which step actually costs time |
| Reversals and appeals after decision | The safety check. Faster must not mean worse |

**How I'd run it.** A pilot in a single hobli for about three months, compared against the same hobli's previous three months (the department's own Bhoomi timestamps give the baseline) and, if possible, a neighbouring hobli running the old way. Short interviews with the officers every few weeks, because a tool that is measurably faster but that officers quietly work around is not working.

**Why I think it will work.** Because it doesn't ask the officer to change how they decide, only to stop doing the parts that are copying, comparing and remembering. It is also honest about its limits: it's a worklist plus a second pair of eyes. The thing I'm least sure about is Kannada quality of the AI text, which is why every AI output is editable and why the edit rate is on the list above.

## Main technical decisions

**One Next.js app, no separate backend.** API routes in the App Router handle everything, so there is exactly one thing to deploy on Vercel. I used the same layout I used in Swaragni: `lib/` for server helpers, `models/` for Mongoose schemas, route handlers grouped by resource.

**MongoDB with Mongoose, one document per application.** The whole case (documents, flags, inspection, decision, history) lives in one document. A step change is one atomic write, and the detail page is one read. The cost is that the list endpoint has to project carefully so it doesn't drag document text along, which it does.

**Workflow rules live on the server, in one file.** `src/lib/process.js` defines the steps, the required documents per mutation type, and what has to be true before each step can complete. The API enforces it and the UI just mirrors it, so a clever request can't skip a step. It's also pure JavaScript with no framework imports, which is why it has unit tests.

**Auth is NextAuth with credentials and a JWT session**, and every route handler calls the same `requireOfficer()` check. A small `proxy.js` redirects logged-out visitors from the app pages.

**Groq through plain `fetch`, no SDK.** The Groq API is OpenAI-compatible, so one small function in `src/lib/groq.js` is enough: JSON mode on, a 40 second timeout, one retry on a rate limit, and typed errors that the UI turns into a Kannada message. Prompts and parsing are in `src/lib/ai.js`. Each task asks for a fixed JSON shape and the code trims and validates what comes back instead of trusting it.

**Models are environment variables.** I started with Llama 3.3 70B and Llama 4 Scout, then found out in Groq's own changelog that both were shut down in 2026. The defaults are now `openai/gpt-oss-120b` for text and `qwen/qwen3.8-27b` for images, and they're set with `GROQ_TEXT_MODEL` and `GROQ_VISION_MODEL`. Groq retires models often, so changing one should never need a code change.

**Kannada is a first-class language, not a translation pass.** All text lives in `src/lib/i18n.js` with a Kannada and an English entry per key, and a unit test fails if one side is missing. The app loads Noto Sans Kannada and Noto Serif Kannada next to the Latin fonts, and headings get extra line height in Kannada so the glyphs don't clip. The AI is asked to answer in the officer's current language. Names, numbers and survey numbers stay as written in the record.

**Built for a phone in a field.** Tap targets are at least 48px, the checklist uses big checkboxes, there's a bottom navigation bar on small screens, and the form inputs are 16px so mobile browsers don't zoom. Document photos are shrunk in the browser before upload so they stay small on slow connections.

**The visual design is carried over from Plastrack**: the same teal-and-lime palette, glass cards, animated hero with a three.js scene (land parcels and a document instead of a bottle), scroll reveals, and the dashboard shell. I kept it deliberately so the project reads as part of the same family.

**Priority and deadlines.** The due date is received date plus 30 days, set in `SLA_DAYS`. That is my assumption for the demo, I couldn't confirm the exact figure the department commits to. It's one constant.

## Testing

`npm test` runs 13 unit tests on the workflow rules, the priority scoring, the JSON parsing, the seed data, and Kannada/English string parity.

I also ran the whole API end to end against a real local MongoDB: login, the priority order, every step's blocking rules, adding documents, flag resolution (including a serious flag needing a note), early return, resume with the clock paused, approve, reject, and the history that results, about 48 checks in all. One thing to be upfront about: my sandbox could not reach Groq, so the AI calls in that run went to a small mock server that speaks the same API. The Groq request format follows their OpenAI-compatible docs, but **I have not seen a live Groq response**. Run one extraction and one cross-check on your deployment before you record a demo, and if the output shape looks different, `src/lib/ai.js` is the one file to adjust.

## Things I left out, and would do next

- **Offline mode.** Field connectivity is patchy. A service worker plus a queue for the checklist would be the first thing I'd add.
- **Real file storage.** Photos are stored as small base64 images inside the application document, which is fine for a demo and wrong for production. They should go to object storage.
- **Roles.** Right now every logged-in officer can do everything. The real process has the Village Accountant verifying, the Revenue Inspector reporting and the Tahsildar approving.
- **Applicant notifications** by SMS when an application is returned or decided.
- **Bhoomi and Kaveri integration** instead of manually registering the application.
- **Kannada review.** A native-speaking revenue officer should read the labels and the AI drafts and tell me what sounds wrong.
- The list endpoint loads up to 500 applications and sorts in memory. Fine for one hobli, a paginated query for a district.

## Run it locally

You need Node 22.7 or newer and a MongoDB database (a free Atlas cluster is fine).

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | What it is |
|---|---|
| `MONGODB_URI` | Your MongoDB connection string |
| `NEXTAUTH_URL` | `https://khata-mitra.vercel.app` locally, Vercel URL when deployed |
| `NEXTAUTH_SECRET` | Any long random string (`openssl rand -base64 32`) |
| `GROQ_API_KEY` | From console.groq.com |
| `GROQ_TEXT_MODEL`, `GROQ_VISION_MODEL` | Optional, defaults are in `.env.example` |
| `SEED_SECRET` | Any long random string, used once to load the demo data |
| `GROQ_BASE_URL` | Optional, only if you want to point at a different OpenAI-compatible server |
| `MONGODB_DNS_SERVERS` | Optional, comma separated DNS servers, only needed if `mongodb+srv` lookups fail |

Start it and load the demo data:

```bash
npm run dev
curl -X POST https://khata-mitra.vercel.app/api/seed -H "x-seed-secret: <your SEED_SECRET>"
```

Open `https://khata-mitra.vercel.app`. The seed creates the two officers above and ten applications in different states: one overdue with a survey number mismatch, one missing a document, one with an objection at the inspection step, one ready for a decision, one returned, one approved, one rejected. The seed route wipes users and applications first, so don't run it against data you care about. Run it again any time to reset the demo.

```bash
npm test
```

### If the database connection fails with `querySrv ECONNREFUSED`

This is a DNS problem on your machine or network, not an Atlas setting. Node can't resolve the `mongodb+srv://` address even though Compass can. The app now retries once using public DNS (8.8.8.8 and 1.1.1.1). If it still fails, either set `MONGODB_DNS_SERVERS` in `.env` to a resolver that works for you, or in Atlas choose Connect, Drivers, and copy the older non-SRV string that starts with `mongodb://` and lists the three shard hosts.

## Deploy on Vercel

1. Push the repo to GitHub and import it in Vercel. No build settings to change.
2. Add the environment variables from the table above. Set `NEXTAUTH_URL` to the deployed URL.
3. In MongoDB Atlas, allow connections from anywhere (`0.0.0.0/0`) under Network Access, since Vercel's addresses change.
4. Deploy, then run the seed `curl` once against the live URL.

## Project layout

```
src/
  app/                  pages and API route handlers
    api/applications/   list, create, detail, step, documents, flags, ai, decision, resume
    api/seed/           loads the demo data
    dashboard/ applications/ login/
  components/
    landing/            hero, 3D scene, how-it-works, AI section, benefits
    layout/             app shell with side and bottom navigation
    app/                step panels, decision dialog, timeline, documents
    ui/ brand/
  lib/
    process.js          steps, required documents, step rules
    priority.js         the dashboard scoring
    ai.js groq.js       prompts, parsing, Groq client
    i18n.js             every Kannada and English string
    seedData.js         the demo applications
  models/               User and Application schemas
  proxy.js              redirects logged-out visitors
tests/                  unit tests
```
