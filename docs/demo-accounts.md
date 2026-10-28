# Demo accounts (Phase 1 only)

These sign in to the dummy data on the preview site and on `npm run dev`. They stop working when Phase 2 brings real accounts.

- **Password:** anything works (for example `demo`).
- **Two-step code:** filled in for you (`123456`). Any 6 digits work, except `000000` (which shows the "wrong code" message).
- **Email code after sign-up:** same rule, any 6 digits except `000000`.
- The sign-in page fills in the client account for you. Change the email to use another role.
- The demo bar at the bottom of the app switches roles and resets the dummy data.

| Role | Email | Asks for a code | State |
| --- | --- | --- | --- |
| Client | chidi@paystream.example | No | Active, fully set up (Paystream) |
| Client | sarah@lumenhealth.example | No | In the free first 2 weeks (Lumen Health) |
| Client | david@adeyemilaw.example | No | Still setting up, 33% (Adeyemi & Co) |
| Client | kemi@northwind.example | No | Paused (Northwind) |
| Manager | ada@bluecut.example | Yes | Active, manages Chidi and Sarah |
| Manager | tunde@bluecut.example | Yes | Active, manages Kemi |
| Owner | fola@bluecut.example | Yes | Owner |

## Staff invite

- Link: `/invite/demo-invite` (for Bisi Adebayo, a new account manager).
- It works once. Use "Reset demo" in the demo bar to use it again.

## Reset password

- `/reset`, enter any email, then follow "Demo: open the link from the email".
