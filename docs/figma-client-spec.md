# Figma client spec (screen by screen)

Source: Figma `Bluecut`, page node `197:1608`. This is the approved client experience. Everything the client sees follows it; the manager and owner views adopt the same language. Read with `docs/figma-alignment-plan.md` (design language) and `docs/client-manager-flow.md` (how client and manager interweave).

Two kinds of client:

| Figma name | Product name | `client.service` | Who acts on LinkedIn |
|---|---|---|---|
| Regular · "You do it yourself" | Standard | `self-serve` | The client. We prepare, they post, comment, update. |
| Premium · "We do it for you" | Premium | `full-service` | Us, through delegated access the client approves. |

## 1. Sign in

Left: form, max width 384px, logo mark, title (22px). Right: blue showcase panel (unchanged).

1. **Sign in** · Continue with Google · "or" · Email · Continue · divider · "New to Bluecut? Create your account".
2. **Sign in (password)** · email row with Change · Password (eye toggle) · Forgot your password? · Sign in · footer as above.
3. **Reset your password** (InfoTip beside title: "Enter your email and we will send you a link to set a new password.") · Email · Send link · "Remembered it? Sign in" · divider · "New to Bluecut? Create your account".
4. **Check your email** · "If an account uses {email}, we sent a link to set a new password." · Back to sign in.
5. **Set a new password** · New password (help: "At least 12 characters long and combine uppercase and lowercase letters, numbers, and special symbols.") · Type it again · Save password.
6. **Your password is changed** · Go to sign in (primary button).

No demo hints on screen. The reset link is opened from `/reset/new` (see `docs/demo-accounts.md`).

## 2. Sign up

1. **Create your account** · Google · or · Email · Continue · "Already have an account? Sign in".
2. **Choose a password** · email row · password with the rule above · Continue.
3. **Your name** · First name, Last name · Create account · "By creating an account you agree to our terms and privacy policy."
4. **Check your email** · "We sent a 6-digit code to {email}." · Code · Confirm email · "Send a new code in 25s" · "Wrong email? Change it".

The LinkedIn link moves out of sign-up into **Manage account access** (step 6).

## 3. Home during setup

Three columns (3 / 6 / 3):

- **Profile card**: light blue band, 56px avatar overlapping it, status badge top right (`Setup` grey dot → `Free` → `Active` green dot), name, then during setup a divider, "50% completed" and a progress bar; after setup the job title.
- **Account setup** card (InfoTip on the title). A vertical checklist joined by a line: done steps show a green check, struck-through label and "Done"; open steps show an empty circle and the time ("1 mins"). Footer under a divider: Continue setup (primary, right).
  - Steps: **Choose your preferred plan** · **Manage account access**. Nothing else.
- **Account manager** card: before a manager is assigned, "We are choosing the right manager for you…". Once the plan is signed: 56px photo, name, "Account manager", intro, **Message** button.

## 4. Choose your preferred plan

Breadcrumb above the card: Home / Set up / Choose your preferred plan. One centred card (max 640px), title with InfoTip. Under the header: "N% done" left, "N steps left" right, a progress bar. Each step is a sub-section with its own heading + InfoTip, then Back / primary in a footer.

1. **Select account type**: two option cards side by side, radio top right.
   - Regular · "You do it yourself" · "We prepare everything. You post, comment and update yourself."
   - Premium · "We do it for you" · "We prepare and do everything for you. You approve what goes out."
   - **Add-ons** (checkbox rows with icon and price): Company page (+$400 per page, with "How many pages?"), Sales Navigator (+$300), Recruiter tools (+$200), LinkedIn Learning and creator (+$1,000).
   - Back · Proceed.
2. **Select contract duration**: three cards: Starter · 3 months · $900/mo · "Get set up and build a steady presence." / Standard · 6 months · $800/mo · "Time to build real momentum toward your goal." / Steady · 12 months · $700/mo · "Become a known voice in your field." Then "Every plan includes" (5 lines). Back · Proceed.
3. **Review and sign contract**: rows: Account type (Regular, You do it yourself) · Plan (Standard 6 months, $800/mo) · each add-on (Company page $400 ×1) · Free 2 weeks (From today to 22 Nov 2026) · Contract (22 Nov 2026 to 21 May 2027) · **Total**. "Sign with your full name" (help: "Typing your name signs the contract."). Back · Sign the contract.
4. **Payment**: "Secured payment" · Amount due today · Card details (number, expiry, CVC) · "Pay now, or later before your free 2 weeks end on {date}." · Back (pay later) · Pay $X.
5. **Success**: check mark, "Your plan is set", confirmation line · Continue onboarding.

Signing assigns the account manager (Home shows them from now on).

## 5. Manage account access · Regular

Same frame as the plan. 2 steps for Regular.

1. **Add LinkedIn profile** (0%, 2 steps left): URL input with an attached blue send button; help "Input your LinkedIn profile link".
2. **We found your profile** (33%): avatar, name, headline, "Not you?" · Continue.
3. **Account permission** (66%): checklist of what we prepare: Draft my posts · Prepare my reactions, comments, reposts and follows · Prepare my connection requests and messages · Prepare my profile updates · Prepare for my company page too. Back · Proceed.
4. **Communication settings** (100%): "How would you want us to notify you?" Email · WhatsApp (Add number) · In the app. "If you do not reply within 24 hours": Wait for me · Follow up. Back · Finish.

Then Home: both steps done, "100% completed", **Complete setup**.

## 6. Manage account access · Premium

1. LinkedIn profile (0%, 5 steps left) → found (17%).
2. **Account permission** (33%): Post for me · Comment, react, repost and follow for me · Send connection requests and messages for me · Update my profile for me · Run my company page too.
3. **Communication settings** (50%): channels as above. If no reply in 24 hours: Wait for me · Follow up · Go ahead.
4. **Delegate my access** (67%): how it works (encrypted vault; we tell you before every sign-in and you approve; we can never change your account security) + checkbox "I understand my account team will sign in to my LinkedIn…".
5. **Set up secure access** (84%): turn on 2FA with an authenticator app, 3 steps, checkbox "I turned it on".
6. **LinkedIn login details** (100%): "Your login is encrypted in the vault the moment you save it." LinkedIn email · LinkedIn password · Back · Save securely and finish setup.

## 7. Home after setup (both kinds)

Centre: a tab card (grey segmented track, white active tab, count pill blue on active): **Feed · Calls · Coming up · Reports · History**. Left: profile card + **Resources** ("Brand assets and strategy documents"). Right: Account manager.

During the free period a **pay card** sits first: "Your free period is ending" · Meta "Ends Sat 14 Nov" · "Pay to keep going…" · rows Free until / Contract duration / Amount due · Pay now.

### Feed card

Header: "Feed" + InfoTip · right: **Filter** (sliders icon, toggles the filter row) · Pill "0 of 1 done". Filter row (inside a bordered inset): Any time ▾ · Newest first ▾ · Keywords 🔍. Empty: "When your manager sends posts for your review, they show up here."

### Feed item (one component, all tasks)

Bordered inset card:
- Header: status badge left, clock + "Fri 13 Nov · 2:00 PM" right, divider.
- Icon chip (light blue circle) + item title (16px semibold).
- Body (steps or the post text), long text clamps with "more".
- Divider · "Task resource" + InfoTip · link.
- Footer (grey band): actions right.

Status badges: **Drafting** (neutral) · **Pending review** (warning) · **Changes requested** (danger) · **Ready for action** (info) · **Completed** (success).

| Item | Regular actions | Premium actions |
|---|---|---|
| Post to review | Share with assistant · Request changes · Approve | Request changes · Approve |
| Task the client does (profile photo, comment, connect) | Share with assistant · Mark as done | not shown: becomes an information item "We are about to …" with no action |
| Completed | no actions, badge Completed, counts toward "N of M done" | same |

**Request changes** opens a page (Feed / Request change): card "Request change", Note, Back · Send.

### Calls tab

Card "Calls" + "0 of 1 done". Each call is a feed item:
- **Times proposed by the manager**: avatar + "Ada Obi, Account manager", agenda, "Time slots" chips (pick one) · Share with assistant · Reschedule · Accept.
- **Reschedule** opens a page (Calls / Reschedule): Note · Time slots (date + time chips, add more) · Back · Send.
- **Waiting on the manager** after you proposed: body + Revert (withdraw your times).
- **Booked**: Meeting details (link, time) · Reschedule.
- **Done**: Call note (the manager's notes and insights).

### Coming up · Reports · History

Same card language: scheduled posts, weekly/monthly reports, completed items.

## 8. Messages

One card "Messages" + Pill "3 conversations". Left: New conversation · Search conversations · Recent list (by subject). Right: header avatar + Ada Obi, Account manager · subject + "2 messages" · thread with attachments ("Add to your brand") · composer "Message Ada", hint "Enter to send. Shift and Enter for a new line.", text link "Need to talk? Book a call".

## Implications for the manager and owner

- The manager is the source of every feed item: posts to review, tasks (Regular) or notices (Premium), call times, call notes, reports. Manager screens use the same item card and the same five statuses, so both sides read the same state.
- Calls start from the manager proposing times after setup (the discovery call). The client accepts or reschedules.
- Setup is two steps; the manager sees plan, add-ons and access status on the client page.
- The owner sees add-ons and account type per client, and plan revenue includes add-ons.
