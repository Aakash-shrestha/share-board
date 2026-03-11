# ShareBoard

Real-time collaborative whiteboard. Create boards, drop sticky notes on a canvas, connect them with edges, attach images, and share with other users. Everything syncs live.

<img src="public/screenshots/board.png" alt="Board" width="600" />

## What it does

- Drag-and-drop notes on an infinite canvas (React Flow)
- Edit note title, content, and attach images
- Connect notes with edges (drag handle to handle)
- Share boards with other users by email
- All changes sync instantly across browsers (Socket.IO)
- Dashboard to manage your boards and see shared ones

## Screenshots

**Sign In** — Clean auth page with a dot-grid background. Email and password to get in.

<img src="public/screenshots/sign-in.png" alt="Sign In" width="600" />

**Sign Up** — Toggle to create a new account. Same page, no redirects.

<img src="public/screenshots/sign-up.png" alt="Sign Up" width="600" />

**Dashboard** — All your boards in one place. See note counts, share with others, or delete. Boards shared with you show up at the bottom in real time.

<img src="public/screenshots/dashboard.png" alt="Dashboard" width="600" />

**Share** — Search users by email and share your board. Manage who has access from the dropdown.

<img src="public/screenshots/share.png" alt="Share" width="600" />

**Real-time Sync** — Two browsers, same board. Move a note on one side, it moves on the other instantly.

<img src="public/screenshots/realtime.png" alt="Real-time" width="600" />

## Stack

- **Next.js 16** (App Router, React 19)
- **React Flow** for the canvas
- **Socket.IO** for real-time sync
- **PostgreSQL** + **Prisma** for persistence
- **shadcn/ui** + **Tailwind CSS v4** for UI
- **TypeScript**

## Setup

You need Node 18+, a PostgreSQL database, and two terminals.

**1. Install**

```
git clone https://github.com/your-username/share-board.git
cd share-board
npm install
```

**2. Database**

Create a `.env` file:

```
DATABASE_URL="postgresql://user:password@localhost:5432/shareboard"
```

Then run:

```
npm run prisma:migrate
npm run prisma:generate
```

**3. Run**

Terminal 1 (Next.js):

```
npm run dev
```

Terminal 2 (Socket server):

```
npm run dev:socket
```

Open [localhost:3000](http://localhost:3000).

## Project layout

```
app/
  page.tsx                    → auth page (sign in / sign up)
  dashboard/[id]/page.tsx     → user dashboard
  note/[id]/
    page.tsx                  → board page (server)
    Nodes.tsx                 → canvas with React Flow (client)
  components/ui/
    AuthForm.tsx              → sign in/up form
    TextUpdaterNode.tsx       → custom note node
    ShareDialog.tsx           → share board dropdown
    SharedBoardsList.tsx      → live-updating shared boards
    CreateBoardButton.tsx     → new board dropdown
    DeleteBoardButton.tsx     → delete with confirmation
  api/
    auth/signin/              → sign in
    auth/signup/              → sign up
    board/                    → create/delete boards
    note/                     → create/edit/delete notes
    save-layout/              → persist positions & edges
    share/                    → share/unshare boards
    upload/                   → image uploads
server.mjs                   → Socket.IO server (port 3001)
prisma/schema.prisma          → database schema
```

## How real-time works

The Socket.IO server (`server.mjs`) runs on port 3001. When a user opens a board, the client joins a room for that board. Any action (move, edit, add, delete, image upload, edge change) emits an event to the room, and all other clients in the room apply it immediately.

Board sharing notifications work the same way — each user joins a personal room on the dashboard, so when someone shares a board with them, it appears instantly.

## License

MIT
