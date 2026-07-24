# DevTinder

A developer networking and matchmaking platform, built dating-app style but for finding collaborators, co-founders, and coding buddies. Create a profile, swipe through other developers, send/accept connection requests, and chat in real time with people you've connected with.

**Stack:** React + Vite + Tailwind (frontend) · Node.js + Express + MongoDB + Socket.IO (backend) · JWT cookie auth.

---

## 1. Architecture Overview

```
devtinder/
├── backend/     Express REST API + Socket.IO server
├── frontend/    React SPA (Vite)
└── docs/        Postman collection
```

### Authentication flow
1. User signs up or logs in via `POST /api/auth/signup` or `/api/auth/login`.
2. Backend hashes/verifies the password with bcrypt and issues a JWT.
3. JWT is set as an **HTTP-only cookie** (`token`) — never stored in localStorage, so it's not readable by JS/XSS.
4. Every subsequent request automatically includes the cookie (`axios` configured with `withCredentials: true`).
5. `authMiddleware.requireAuth` verifies the JWT on protected REST routes; the Socket.IO server verifies the same cookie during the WebSocket handshake (`io.use(...)`).
6. Logout clears the cookie.

### Data relationships
- **User** — a developer profile.
- **ConnectionRequest** — an edge between two Users (`fromUserId` → `toUserId`) with a `status` of `interested | ignored | accepted | rejected`. A unique compound index on `(fromUserId, toUserId)` blocks duplicate requests. Both directions are checked before a new request is created, so A→B and B→A can't coexist.
- **Message** — belongs to a `senderId`/`receiverId` pair. Sending is only allowed if an `accepted` ConnectionRequest exists between the two users (enforced server-side, both over REST and Socket.IO — never trust the frontend).

### Feed logic (server-side, not client-side)
`GET /api/feed` excludes: the logged-in user themself, and any user who already has *any* ConnectionRequest row with the logged-in user in either direction (regardless of status — interested, ignored, accepted, or rejected all hide the profile from future feeds). This guarantees a user is never shown someone they've already acted on.

### Socket.IO event flow
| Event | Direction | Payload | Purpose |
|---|---|---|---|
| `joinChat` | client → server | `{ targetUserId }` | Joins a private room shared by the two users |
| `sendMessage` | client → server | `{ targetUserId, text }` | Validates the pair is an accepted connection, persists to MongoDB, emits `messageReceived` to the room |
| `messageReceived` | server → client | message object | New message delivered live |
| `typing` | both | `{ targetUserId }` / `{ userId }` | Typing indicator |
| `userOnline` / `userOffline` | server → client | `{ userId }` | Presence |

---

## 2. Database Schema

### User
| Field | Type | Notes |
|---|---|---|
| firstName, lastName | String | required |
| email | String | required, unique, validated |
| password | String | bcrypt hash, `select: false` — never returned by default |
| age | Number | 18–100 |
| gender | String | enum: male / female / other |
| photoUrl | String | defaults to a generated avatar |
| about | String | max 500 chars |
| skills | [String] | |
| location | String | |
| createdAt / updatedAt | Date | timestamps |

### ConnectionRequest
| Field | Type | Notes |
|---|---|---|
| fromUserId / toUserId | ObjectId → User | required |
| status | String | enum: interested / ignored / accepted / rejected |
| createdAt | Date | timestamp |

Unique index on `(fromUserId, toUserId)`.

### Message
| Field | Type | Notes |
|---|---|---|
| senderId / receiverId | ObjectId → User | required |
| text | String | max 2000 chars |
| read | Boolean | default false |
| createdAt | Date | timestamp |

---

## 3. API Reference

All responses follow:
```json
// success
{ "success": true, "message": "...", "data": { } }
// error
{ "success": false, "message": "..." }
```

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Create account, auto-login (sets cookie) |
| POST | `/api/auth/login` | — | Log in, sets cookie |
| POST | `/api/auth/logout` | ✓ | Clears the cookie |
| GET | `/api/auth/me` | ✓ | Current authenticated user |
| GET | `/api/profile/view` | ✓ | View own profile + connection count |
| PATCH | `/api/profile/edit` | ✓ | Update allowed profile fields |
| GET | `/api/feed?page=&limit=` | ✓ | Paginated list of discoverable developers |
| POST | `/api/request/send/:status/:userId` | ✓ | `status` = `interested` or `ignored` |
| PATCH | `/api/request/review/:status/:requestId` | ✓ | `status` = `accepted` or `rejected`, receiver only |
| GET | `/api/request/received` | ✓ | Pending requests sent to you |
| GET | `/api/request/sent` | ✓ | Requests you've sent |
| GET | `/api/connections` | ✓ | Your accepted connections |
| GET | `/api/messages/:userId` | ✓ | Chat history with a connection |
| POST | `/api/messages` | ✓ | REST fallback for sending a message |

A ready-to-import Postman collection is in `docs/DevTinder.postman_collection.json`.

---

## 4. Local Setup

### Prerequisites
- Node.js 18+
- A MongoDB instance (local `mongod` or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### Backend
```bash
cd backend
cp .env.example .env      # fill in MONGO_URI and JWT_SECRET
npm install
npm run dev                # starts on http://localhost:7777
npm run seed                # optional: adds 6 sample developer profiles (password: Password123)
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev                # starts on http://localhost:5173
```

Open `http://localhost:5173`, sign up, and — if you ran the seed script — you'll immediately see sample developers in your feed to test requests, connections, and chat against.

---

## 5. Deployment

### Backend (Render / Railway / AWS)
1. Push the `backend/` folder as its own service (or set the service root to `backend/`).
2. Set env vars: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRY`, `COOKIE_EXPIRY_DAYS`, `CLIENT_URL` (your deployed frontend origin), `NODE_ENV=production`.
3. Start command: `npm start`.
4. Because cookies are used cross-origin in production, the cookie is set with `secure: true; sameSite: "none"` — this requires HTTPS, which Render/Railway provide by default.

### Frontend (Vercel)
1. Import the `frontend/` folder as the project root.
2. Build command: `npm run build`, output dir: `dist`.
3. Set env vars: `VITE_API_URL` (e.g. `https://your-backend.onrender.com/api`), `VITE_SOCKET_URL` (e.g. `https://your-backend.onrender.com`).

### Database (MongoDB Atlas)
1. Create a free cluster, add a database user, and whitelist your backend host's IP (or `0.0.0.0/0` for simplicity).
2. Copy the connection string into `MONGO_URI`.

---

## 6. Security Notes
- Passwords hashed with bcrypt (cost factor 10), never returned in API responses (`select: false` + `toJSON` transform strips it as defense in depth).
- JWT stored in an HTTP-only, `secure` (in production) cookie — not accessible to client-side JS.
- Every mutating endpoint re-derives the acting user from the verified JWT (`req.user`), never trusts a user id supplied in the request body for authorization decisions.
- Connection request creation/review re-validates ownership (`toUserId: loggedInUser._id`) so only the actual receiver can accept/reject.
- Messaging is blocked both over REST and Socket.IO unless an `accepted` ConnectionRequest exists between the two parties.
- Rate limiting (20 requests / 15 min) on `/api/auth/signup` and `/api/auth/login`.
- Centralized error middleware normalizes Mongoose duplicate-key, validation, and cast errors into consistent 4xx responses instead of leaking stack traces.

## 7. Known Limitations / Next Steps
- No file upload for profile photos yet — `photoUrl` is a plain URL field (swap in S3/Cloudinary later).
- No pagination UI for the feed beyond "load next" — infinite scroll would be a nice addition.
- No read-receipt UI in chat (the `read` field is tracked server-side but not surfaced in the UI).
- No automated test suite included — see `docs/DevTinder.postman_collection.json` for manual/CI-driven API testing.
