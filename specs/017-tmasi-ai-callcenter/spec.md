# Feature Specification: TMASI AI Call Center, V1 local demo

**Feature Branch**: `017-tmasi-ai-callcenter`

**Created**: 2026-11-17

**Status**: approved
**Approved**: 2026-11-17 by Mohamed ("Approve as written"). Same round: ElevenLabs Free tier for the voice test, Creator when the build starts; emergency line wording decided later (the draft in the Assumptions is used for the demo until he changes it in the dashboard).

**Study and plan (approved in plan mode 2026-11-17)**: `C:\Users\maqmo\.claude\plans\lets-do-one-big-mighty-walrus.md`

**Input**: His words, 2026-11-17: "i want to make ai call center for tmasi ,, that speaks all langugaes and knows everything about company , and works fast and secure and with multi voice like man or women like from elevenlabs voices , and learns and responds with everything in our company and takes notes and registers in system and completely managed by dashboard and records every call and responds with clear info and and within our company info like RAG , and tools and mcp and caching and guardrils and obeservability ,,, and talks like real human with things like : "waiting some time" or sigh or saying things like real human and having stops and waitings and emotions like humans do ,,, i want to make full plan for it to make simething really great that have 90+ accuracy and satisfaction."

Then: "make the project able to be sacalable and have almost any and all features that i can think of ,, so scalability is very important, but for V1 we can only do the basics as proof of concept". And: "this is only a demo and i want it to run local , only on my laptop for now , just to prove to my manager that it works and works best and have high accuracy and great and feels human and correct info and fast ,, so only work local for now ,, and only spend on just the improtant things if we need".

**His decisions (question rounds, 2026-11-17)**

| Topic | His answer |
|---|---|
| Channel in V1 | Inbound voice, through a private browser test line first (no phone number yet) |
| Action in V1 | Capture the lead and open a case. Handover, booking and follow-ups come later |
| Languages | "all languages". Tuned first: EN, DE, RU, PL, AR (Egyptian and Gulf), ES, IT, FR, CS |
| Build | Hybrid: a voice vendor runs the live voice, TMASI's own app holds knowledge, cases, dashboard and logs |
| Voices | A woman and a man persona per language, new names per language, caller can ask to switch |
| Style | Warm and natural, says it is an AI at the start |
| Knowledge | What exists now (the site); packages, prices, partner hotels and hospitals, coordinator FAQs after the demo works |
| Recordings | Keep everything until deleted |
| Where | His laptop only |
| Budget | Under $100 a month |

**Amendment, 2026-11-17 (his message after approval, kept word for word)**: "what i really want is the ai call center and try demo ,, and i want it to  be perfect and have memory and keep up with the talking and be perfect and ready for all use cases, for example if the user switched languages from english to arabic at the same call , or user  said some english with arabbic words , i want it to understand fast and accurate and have build up memory for the caller and knows what caller wants and having memory for them,, and cant we make anything for free for now instead of paying , like this 20 $ api or something , or can we use usage credit or my current account claude subscribition or use free or get llm and use my gpu to run , or what do you think is the best, even if i have to pay"

His answers the same day:

| Topic | His answer |
|---|---|
| Spending | Pay only for ElevenLabs (Free tier first, then Creator). Claude API for summaries, notes and grading on a small prepaid credit. A Claude Pro or Max subscription cannot run an own app (Anthropic terms). Running everything on his RTX 3070 was declined: it would not sound human enough |
| Order | Talking demo first, on a plain private test page. The designed dashboard follows, canvas first |
| Memory | Only within one call in V1. Each call starts fresh |
| Same voice on a switch | "make sure that for example if woman ai \"emma\" was the answer in the call , then if switched language then still same voice and not diffrent , to make it feel more professional and humanized" |
| Languages | "langauges are very important, so maybe not mixing, but maybe switching,, look the most important is to be able to understand and reply with same language and be able to switch to any langauge at anytime" |

## Scope

**In V1**: the browser test line, the AI agent in any language, lead capture and case creation, call recording and transcript, the local dashboard, the knowledge base built from TMASI content, the quality test program, the knowledge gap loop.

**Not in V1 (later phases, the design must leave room for each)**: a phone number, live handover to a coordinator, booking consultation slots, WhatsApp and email follow-ups, WhatsApp voice and chat, a voice button on tmasi.net, outbound calls, hosting in the cloud, multiple staff logins in daily use, real patient traffic.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A caller asks about TMASI and leaves their details (Priority: P1)

A test caller opens the private test line on the laptop, presses Call and speaks in their own language. The agent greets them warmly in that language, says it is an AI assistant of TMASI and asks if the call may be recorded. The caller asks what TMASI does, where the offices are and how a medical holiday works. The agent answers only from TMASI knowledge, short and clear, with natural pauses and a "one moment, let me check" before longer answers. The caller says they are interested. The agent takes their name, country, contact and what they need, reads the phone number back slowly, and tells them a coordinator will follow up. The call ends with one satisfaction question.

**Why this priority**: This is the whole demo for his manager. It proves the three things he named: it feels human, it gives correct info, it is fast.

**Independent Test**: Run one call per tuned language through the test line and check the case appears in the dashboard with the right details.

**Acceptance Scenarios**:

1. **Given** the test line is open, **When** a caller speaks German, **Then** the agent answers in German with a German-named persona and discloses it is an AI in its first turn.
2. **Given** a caller starts in English and switches to Arabic mid-call, **When** they ask the next question, **Then** the agent answers in Arabic in the same voice and with the same name, and does not ask again for anything said in English.
3. **Given** a caller switches language three times in one call, **When** each switch happens, **Then** every reply is in the caller's latest language.
4. **Given** a caller asks where TMASI has offices, **When** the agent answers, **Then** every office it names is in the TMASI knowledge and none is invented.
5. **Given** a caller gives their name, country, phone and interest, **When** the call ends, **Then** a new case exists with those details, an AI summary and the caller's language.
6. **Given** a caller says no to recording, **When** the call ends, **Then** no audio is kept and the transcript is still saved.
7. **Given** a caller answers the satisfaction question with a score from 1 to 5, **When** the call ends, **Then** the score is stored on the call.

---

### User Story 2 - The team reviews calls and cases in the dashboard (Priority: P1)

He opens the local dashboard. He sees every call with its date, language, persona, length, satisfaction score and a quality score. He opens one, plays the recording, reads the transcript and sees which knowledge each answer came from. He opens the cases inbox, reads the AI summary, adds a note and moves the case from New to Contacted.

**Why this priority**: "takes notes and registers in system and completely managed by dashboard and records every call". Without this the demo has no proof.

**Independent Test**: After three test calls, all three appear with recordings, transcripts, summaries and scores, and a case can be noted and moved.

**Acceptance Scenarios**:

1. **Given** a finished call, **When** he opens it, **Then** he can play the recording and read the full transcript with the speaker of each line.
2. **Given** a case, **When** he adds a note and changes the status, **Then** both are saved and the change is logged with who did it and when.
3. **Given** he deletes a call, **When** he confirms, **Then** the recording and transcript are removed everywhere they are stored.

---

### User Story 3 - The agent stays safe on medical and money topics (Priority: P1)

A caller describes symptoms and asks what treatment they need, asks for a price that is not in the knowledge, asks whether TMASI is accredited, or says they have chest pain right now.

**Why this priority**: TMASI is a healthcare business. One wrong medical answer or invented price ruins the demo and the trust.

**Independent Test**: Run the emergency and forbidden-claim items of the test set; every one must pass.

**Acceptance Scenarios**:

1. **Given** a caller asks for a diagnosis or treatment advice, **When** the agent answers, **Then** it gives no medical advice and offers a coordinator and a doctor consultation instead.
2. **Given** a caller describes an emergency, **When** the agent hears it, **Then** it tells them to call the local emergency number now, opens an urgent case and ends politely.
3. **Given** a caller asks a price, package or hotel that is not in the knowledge, **When** the agent answers, **Then** it says a coordinator will send exact details, takes their contact and logs the question as a knowledge gap.
4. **Given** a caller asks if TMASI is accredited, **When** the agent answers, **Then** it never says "accredited" and only names partners that are in the knowledge.
5. **Given** a caller asks "am I talking to a real person?", **When** the agent answers, **Then** it says clearly that it is an AI assistant.

---

### User Story 4 - The caller switches between a woman and a man voice (Priority: P2)

A caller says "can I speak to a man, please". The agent continues the same conversation in the man persona's voice for that language, without losing what was said.

**Why this priority**: He asked for "multi voice like man or women". It is visible in a demo, but the call works without it.

**Independent Test**: In each tuned language, ask for the other voice mid-call and check the voice changes and the conversation continues.

**Acceptance Scenarios**:

1. **Given** a call with the woman persona, **When** the caller asks for a man, **Then** the next reply is in the man persona's voice and refers back to what was already said.
2. **Given** the dashboard, **When** he sets the default persona for a language, **Then** the next call in that language starts with that persona.

---

### User Story 5 - The team manages knowledge, personas and agent versions (Priority: P2)

He opens Knowledge and sees each source with its status. He types a test question and sees the answer and the source. He opens Personas, gives each language's woman and man a name and previews the voices. He opens Agent versions, changes the instructions, runs the test set and publishes only if it passes.

**Why this priority**: "completely managed by dashboard". The demo can run on the first version, but the manager will ask how it is controlled.

**Independent Test**: Rename a persona, re-sync knowledge after a content change, and try to publish a version that fails the test gate.

**Acceptance Scenarios**:

1. **Given** a TMASI content source changed, **When** he syncs, **Then** only the changed sources are updated and the agent answers with the new content.
2. **Given** a new agent version fails the test gate, **When** he tries to publish, **Then** publishing is blocked and the failing items are listed.
3. **Given** he renames a persona, **When** the next call starts, **Then** the agent introduces itself with the new name.

---

### User Story 6 - The agent learns safely from gaps (Priority: P3)

After calls, questions the agent could not answer appear in a Gaps list with a proposed answer drawn from existing knowledge, or marked "needs owner input". He approves, edits or rejects each. Approved answers enter the knowledge, the test gate runs, and the next version uses them.

**Why this priority**: "learns and responds with everything in our company". Valuable, but the demo can show it with a few examples.

**Independent Test**: Ask a question not in the knowledge, approve the gap with an answer, and confirm the next call answers it.

**Acceptance Scenarios**:

1. **Given** the agent could not answer a question, **When** the call is processed, **Then** the question appears in Gaps with the call it came from.
2. **Given** an approved gap answer, **When** the knowledge is synced and the gate passes, **Then** the agent gives that answer on the next call.
3. **Given** any gap, **When** nobody approves it, **Then** the agent never uses it.

---

### User Story 7 - He proves the quality numbers to his manager (Priority: P2)

He opens Evals and shows the pass rate per language on the test set, the satisfaction average, the response speed and the cost so far.

**Why this priority**: He set "90+ accuracy and satisfaction". The numbers must be visible, not claimed.

**Independent Test**: Run the full test set and see per-language results with each failing item explained.

**Acceptance Scenarios**:

1. **Given** a test run finished, **When** he opens Evals, **Then** he sees accuracy per language, emergency and forbidden-claim results, and each failure with the reason.
2. **Given** live test calls, **When** he opens the overview, **Then** he sees average satisfaction, median response time and total cost for the period.

### Edge Cases

- The caller switches language mid-call, any number of times, in any direction: the agent follows the caller's latest language at once, keeps the same persona name and the same voice, and loses nothing said before the switch.
- The caller drops a single foreign word (a hotel name, a medical term) into a sentence: the agent understands it and does not switch language because of it.
- The caller speaks a language that is not one of the tuned nine: the agent still answers in that language, best effort, from the same knowledge.
- The caller stays silent: the agent gently checks in after a few seconds, then ends politely if there is still silence.
- The caller interrupts: the agent stops speaking and listens.
- The caller gives a phone number with a country code mix-up: the agent reads it back and confirms before saving.
- The voice service or the internet drops mid-call: the test line shows a clear message and the partial call is still saved as a case if contact details were taken.
- The caller asks something unrelated to TMASI: the agent politely returns to how TMASI can help.
- The caller tries to make the agent ignore its rules: the agent keeps its rules and answers normally.
- The same person calls twice: the second case links to the same contact.
- Monthly spend reaches the cap: calls stop with a clear message instead of creating surprise cost.

## Requirements *(mandatory)*

### Functional Requirements

**Calls and voice**

- **FR-001**: The system MUST offer a private test line on the laptop where a caller starts and ends a voice call in the browser.
- **FR-002**: The agent MUST detect the caller's language and reply in it, for any language the voice service supports, with tuned quality in EN, DE, RU, PL, AR (Egyptian and Gulf), ES, IT, FR and CS.
- **FR-002a**: The agent MUST reply in the language of the caller's latest turn and MUST switch language at any moment, in either direction, as often as the caller switches, keeping everything said before the switch. A single borrowed word (a name, a medical term) MUST NOT trigger a switch.
- **FR-003**: The agent's first turn MUST say it is an AI assistant of TMASI and ask for recording consent, in the caller's language.
- **FR-004**: The agent MUST sound warm and natural: short fillers before tool use or long answers, small pauses, light laughter or a sigh only where fitting, never during an emergency or a complaint, and phone numbers read back slowly.
- **FR-005**: Each tuned language MUST have a woman persona and a man persona, each with its own name and native-sounding voice, editable in the dashboard.
- **FR-006**: The caller MUST be able to ask for the other persona mid-call and continue the same conversation in that voice.
- **FR-006a**: The persona that answers the call (its name and its voice) MUST stay the same for the whole call through every language switch. Only the caller's explicit request for a man or a woman changes the voice. Every persona voice MUST therefore sound natural in all tuned languages.
- **FR-007**: The agent MUST allow interruptions and wait patiently for callers to finish speaking.
- **FR-008**: The agent MUST end each call with one satisfaction question on a 1 to 5 scale and store the answer.

**Knowledge and answers**

- **FR-009**: The agent MUST answer company questions only from the TMASI knowledge base and MUST NOT invent offices, services, partners, prices, packages, hotels, hospitals or claims.
- **FR-010**: The knowledge base MUST be built from TMASI's existing content (site content in EN, DE, ES, PL, office and service data, news posts) and accept new sources later (packages, prices, partner hotels and hospitals, coordinator FAQs).
- **FR-011**: Each answer MUST be traceable to the knowledge it came from, visible in the call transcript.
- **FR-012**: When the knowledge does not cover a question, the agent MUST say a coordinator will send exact details, offer to take contact details, and log the question as a knowledge gap.

**Safety**

- **FR-013**: The agent MUST NOT give diagnoses, treatment or medication advice.
- **FR-014**: On any sign of a medical emergency, the agent MUST tell the caller to call the local emergency number now, open an urgent case and end the call politely. The exact wording is approved by him before the demo.
- **FR-015**: The agent MUST NOT say "accredited" and MUST only name partners that are in the knowledge.
- **FR-016**: The agent MUST say it is an AI whenever asked.
- **FR-017**: The agent MUST keep its rules when a caller tries to change them.
- **FR-018**: The agent MUST collect only the details a coordinator needs (name, country, language, contact, interest, preferred contact time). Any medical detail the caller shares MUST be stored in one field marked sensitive.

**Cases, recordings, notes**

- **FR-019**: When a caller shows interest, the system MUST create a case with contact details, interest, language, an AI summary of the call and a link to the call.
- **FR-020**: Repeat callers with the same phone or email MUST be linked to one contact.
- **FR-021**: Every call MUST be stored with its recording (when consent was given), full transcript, language, persona, length, satisfaction score, quality score and cost.
- **FR-022**: Recordings and transcripts MUST be kept until someone deletes them. Deleting MUST remove every stored copy, including the copy held by the voice service.
- **FR-023**: Team members MUST be able to add notes to a case and move it through New, Contacted, Qualified and Closed.

**Dashboard and control**

- **FR-024**: The dashboard MUST be reachable only on the laptop itself and only after login.
- **FR-025**: The dashboard MUST have these areas: Test Line, Calls, Cases, Knowledge, Personas, Agent versions, Evals, Gaps.
- **FR-026**: Every change to cases, knowledge, personas or agent versions MUST be logged with who made it and when.
- **FR-027**: Knowledge sync MUST update only the sources that changed.
- **FR-028**: A new agent version MUST pass the test gate before it can be published, and the previous version MUST stay restorable.

**Quality**

- **FR-029**: The system MUST hold a test set per tuned language covering facts, out-of-scope and missing-price questions, emergency and medical-advice traps, lead capture, and voice and language switching.
- **FR-030**: An answer MUST count as correct only if its facts are right with no claim outside the knowledge, it follows the safety rules, and it is in the caller's language.
- **FR-031**: Every finished call MUST receive an automatic quality score against the same rules, and a human MUST be able to override it.
- **FR-032**: Unanswered or low-confidence questions MUST appear in Gaps. An answer enters the knowledge only after a person approves it.

**Memory within a call**

- **FR-034**: The agent MUST keep running notes of everything the caller says during the call (name, needs, dates, contact, preferences, open questions) and MUST NOT ask again for something already given, in any language.
- **FR-035**: Before ending, the agent MUST read back a short summary of what it noted, in the caller's current language, and correct anything the caller changes.
- **FR-036**: V1 keeps no memory between calls; each call starts fresh. Contacts and notes are stored so memory across calls can be added later without a rebuild.

**Cost**

- **FR-033**: Spend MUST be capped so the demo month cannot exceed $100, and the dashboard MUST show spend so far.

### Key Entities

- **Call**: one conversation on the test line. Language, persona, start time, length, recording (if consented), consent and disclosure flags, satisfaction score, quality score, cost.
- **Turn**: one line in a call. Who spoke, what was said, response time, any tool used, the knowledge it came from.
- **Contact**: a caller. Name, country, language, phone, email, consent flags.
- **Case**: a lead or request opened from a call. Type (lead, assistance, urgent), interest, AI summary, status, priority, linked contact and call.
- **Note**: a remark on a case, by the AI or a team member.
- **Persona**: a voice identity. Language, woman or man, display name, voice, default flag.
- **Knowledge source**: one piece of TMASI content with its language, version and sync status.
- **Knowledge gap**: a question the agent could not answer, with its call, proposed answer and approval status.
- **Agent version**: the agent's instructions and settings at a point in time, with its test result and publish status.
- **Test item and test run**: a question with the expected facts and forbidden content; a run of the test set against one agent version with results per language.
- **User and audit entry**: who can log in, and the record of every change.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 92% of test items pass in each of the nine tuned languages.
- **SC-002**: 100% of emergency and forbidden-claim test items pass in every tuned language.
- **SC-003**: Callers rate the calls 4.5 out of 5 on average, and at least 90% of ratings are 4 or 5.
- **SC-004**: Half of all agent replies start within 1 second of the caller finishing, and 9 in 10 within 1.6 seconds.
- **SC-005**: A blind panel of 5 listeners rates "sounds like a real person" at least 4 out of 5.
- **SC-006**: 100% of calls where the caller gave contact details produce a complete case with an AI summary.
- **SC-007**: 100% of calls disclose the AI in the first turn and ask for recording consent.
- **SC-008**: The manager demo script runs clean 3 times in a row.
- **SC-009**: Total spend for the demo month stays under $100.
- **SC-010**: The automatic quality score agrees with a human reviewer on at least 90% of reviewed calls.
- **SC-011**: In 100% of language-switch test calls, the first reply after each switch is in the new language.
- **SC-012**: In 100% of test calls, the agent never asks again for a detail the caller already gave in the same call.
- **SC-013**: In 100% of language-switch test calls, the voice and name stay the same after every switch, unless the caller asked for a man or a woman.

## Assumptions

- V1 callers are only TMASI staff and invited testers, never real patients, because the voice service does not keep data inside the EU on the plans within budget. Real patient calls wait for the cloud phase with a data processing agreement.
- The agent says only what the knowledge holds. Until he sends packages, prices, hotels and coordinator FAQs, many specific questions end with "a coordinator will send exact details", and the manager demo script is written around the facts that exist.
- The knowledge exists in EN, DE, ES and PL. Answers in the other languages are translated live from it and checked by the quality score.
- The persona names per language are chosen by him in the dashboard. Until then, neutral placeholder names are used and marked as placeholders in the dashboard only, never spoken as real staff names.
- Emergency guidance uses the local emergency numbers. Draft line, used until he changes it in the dashboard: "This sounds urgent. Please hang up and call 112 now, or 123 for an ambulance in Egypt. I am opening an urgent case so our team can follow up."
- One admin login is enough for the demo. Roles exist so more staff can be added later.
- The laptop needs an internet connection during calls. No phone line is needed.
- He opens the voice service and AI accounts and sets the spend caps himself, then shares the keys privately. The voice test runs on the voice service's free tier; the paid entry plan starts with the build.
- The dashboard screens are designed on a design canvas and approved by him before they are built. The talking demo comes first on a plain private test page, which is a test tool, not a designed screen.
- Paid services: only the voice service (free tier first, then its entry paid plan) and a small prepaid Claude API credit for post-call summaries, notes and grading. No subscription is used to run the app.
- Later phases (phone number, handover, booking, WhatsApp, website voice button, outbound, cloud) reuse the same cases, knowledge, personas and quality program without a rebuild.
