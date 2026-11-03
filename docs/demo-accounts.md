# Demo accounts (Phase 1 only)

These sign in to the dummy data on the preview site and on `npm run dev`. They stop working when Phase 2 brings real accounts.

- **Password:** anything works (for example `demo`).
- **Two-step code:** filled in for you (`123456`). Any 6 digits work, except `000000` (which shows the "wrong code" message).
- **Email code after sign-up:** same rule, any 6 digits except `000000`.
- The sign-in page fills in the client account for you. Change the email to use another role.
- The demo bar at the top of the app switches roles and resets the dummy data. In the Client view it also has a picker to view each client state (active, free 2 weeks, calls booked, approve strategy, setting up, paused).
- "Simulate errors" in the demo bar makes every action fail after its loading state, so you can see the error toasts and dialogs. Turn it off to go back to normal. Your data is kept in this browser until you reset.
- Changes are saved in this browser, so they survive a reload. "Reset demo" puts everything back, including an account you deleted from Account.

| Role | Email | Asks for a code | State |
| --- | --- | --- | --- |
| Client | chidi@paystream.example | No | Active, fully set up (Paystream) |
| Client | sarah@lumenhealth.example | No | In the free first 2 weeks (Lumen Health) |
| Client | david@adeyemilaw.example | No | Still setting up, 33% (Adeyemi & Co) |
| Client | kemi@northwind.example | No | Paused, unpaid (Northwind) |
| Client | ngozi@harvestfoods.example | No | Set up, both calls booked, goals call today (Harvest Foods) |
| Client | femi@brightgrid.example | No | Calls done, "What we agreed" waiting for approval (BrightGrid Energy) |
| Client | zainab@carecircle.example | No | Active, slow to review, asked for a fix (CareCircle) |
| Client | tobi@ledgerly.example | No | Active, open complaint (Ledgerly) |
| Client | musa@sahelventures.example | No | Pulled out, refund waiting (Sahel Ventures) |
| Manager | ada@bluecut.example | Yes | Active, manages Chidi, Sarah, Ngozi, Femi and Zainab |
| Manager | tunde@bluecut.example | Yes | Active, manages Kemi, Tobi and Musa |
| Manager | kola@bluecut.example | Yes | Waiting for training |
| Owner | fola@bluecut.example | Yes | Owner |

## Staff invite

- Link: `/invite/demo-invite` (for Bisi Adebayo, a new account manager).
- It works once. Use "Reset demo" in the demo bar to use it again.

## Reset password

- `/reset`, enter any email, then follow "Demo: open the link from the email".

## Notifications and assistants (C18, C19)

- Chidi has WhatsApp confirmed (+234 802 555 0187) and one assistant, Amaka Obi (EA).
- WhatsApp code: 482913 (pre-filled; any 6 digits work).
- "Sent messages" in the demo bar lists every email and WhatsApp message the live app would send. "Open link" on a message to an assistant opens their task page (`/a/...`).
- Sign-in with `?next=/tasks/t-chidi-headline` lands on that task.

## Engagement quick tasks (C17, M6)

- Chidi has Comment on 3 posts, React to 3 posts and Follow 2 people and Pages on Home.
- Manager view: Chidi > Engagement has 6 suggestions to check (one off limits), 1 ready to send.

## No-API publishing (Flow 1)

- Posts are no longer auto-posted. After approval and a recommended time, they appear in "Posts to publish" (`/content/publish`) and Home > Coming up.
- Sarah has a ready-to-publish post past its best time (demonstrates the overdue flag). Chidi has ready-to-publish posts at future times.
- "Mark as posted" moves a post to Live and counts it toward the week.
