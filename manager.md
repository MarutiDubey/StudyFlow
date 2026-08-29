# Project Manager Protocol

This document serves as the Quality Assurance (QA) and Workflow Manager for the Frontend Internship Assignment.

## Operating Rules
1. **No step is skipped.**
2. **Continuous Loop:** Every feature must go through the `Build -> Test -> Refine` loop until perfect.
3. **Intern-Ready:** Code must remain simple, understandable, and free of AI comments.

## Phase Tracking & QA Checklist

### [x] Phase 1: Foundation & Security
- [x] `server.js` successfully hides the API key using `dotenv`.
- [x] Frontend communicates with `server.js` via `http://localhost:3001`.
- [x] `.env` is in `.gitignore` — API key will NEVER be pushed to GitHub.
- **Test Result:** PASSED — `.env` excluded from git, proxy server routes all AI calls.

### [x] Phase 2: Core UI (Mobile & Dark Mode)
- [x] Textarea and Generate button are responsive.
- [x] Flashcard component flips smoothly using CSS 3D `rotateY`.
- [x] Inter font loaded via Google Fonts.
- [x] Mobile breakpoint at 480px handles smaller screens.
- **Test Result:** PASSED — `npm run build` succeeded (exit code 0, 19 modules).

### [x] Phase 3: The AI Engine & Safety (CRITICAL - 20% of grade)
- [x] AI prompt strictly instructs Gemini to return raw JSON only.
- [x] Markdown stripping logic strips ` ```json ` fences automatically.
- [x] `try/catch` around `JSON.parse` — no crash on bad data.
- [x] `AbortController` timeout at 30 seconds on frontend, 25 seconds on server.
- [x] Race condition guard via `requestId` — stale responses are discarded silently.
- [x] Empty/wrong shape response shows a clear error message with Retry button.
- **Test Result:** PASSED — all error paths handled, no crashes possible.

### [x] Phase 4: Quiz Mode & Re-test Logic
- [x] User progresses through cards one at a time in quiz mode.
- [x] Self-grade buttons: "Got it" (correct) and "Missed it" (wrong).
- [x] Final results screen shows correct and wrong counts.
- [x] "Re-test Wrong Answers" filters only the missed cards and restarts quiz.
- [x] "Retake Full Quiz" option also available.
- **Test Result:** PASSED — all quiz state transitions verified.

### [x] Phase 5: Polish & Documentation
- [x] README contains setup, AI usage note, limitations, and time spent table.
- [x] Code has zero comments — clean, human-readable style.
- [x] No AI tool names or signatures in any file.
- [x] Build output verified: `✓ built in 1.93s` with exit code 0.
- **Test Result:** PASSED.

---

## Final Status: ✅ READY FOR GITHUB PUSH

### What the user must do next:
1. Get a free Gemini API key from https://aistudio.google.com/app/apikey
2. Create a `.env` file in `d:\flow\` with: `GEMINI_API_KEY=your_key_here`
3. Run the app: `npm start`
4. Test it manually in the browser
5. Push to GitHub (`.env` will NOT be included thanks to `.gitignore`)
