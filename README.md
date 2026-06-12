<div align="center">

# 🌊 Pulse

### A full-featured Instagram-style social platform built on the MERN stack

**MongoDB · Express · React (Vite) · Node.js**

Authentication · Profiles · Image Posts · Likes & Comments · Follow System · Dark Mode

</div>

---

## 📑 Table of Contents

- [Overview](#overview)
- [Why This Stack](#why-this-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
  - [Using the App](#3-using-the-app)
- [API Reference](#api-reference)
  - [Auth Routes](#auth-apiauth)
  - [User Routes](#users-apiusers)
  - [Post Routes](#posts-apiposts)
- [Deployment](#deployment-free-tier-friendly)
- [Troubleshooting](#troubleshooting)
- [Roadmap / Possible Add-ons](#roadmap--possible-add-ons)

---

## Overview

**Pulse** is a fully functional social media application — register, build a profile, post text and images, like and comment, follow other users, search the community, and switch between light and dark mode. It's built with plain MERN + Tailwind CSS, so it runs locally with no extra infrastructure beyond Node.js and MongoDB.

---

## Why This Stack

This project follows the social-app patterns most commonly used in production apps today:

- **JWT-based stateless auth** — scales cleanly across serverless environments and containers
- **Image uploads** — local disk storage out of the box, Cloudinary-ready for production
- **Optimistic UI updates** — likes and comments feel instant, with no full-page reloads
- **Mobile-first responsive layout** — looks good on every screen size
- **Dark mode** — included as a baseline, not an afterthought

---

## Features

| Area | Details |
|---|---|
| **Auth** | Register, login, logout, and `GET /api/auth/me`. Passwords hashed with bcrypt. JWT (30-day expiry) stored in `localStorage` and sent via `Authorization: Bearer <token>`. |
| **Profiles** | View any user's profile; edit your own name and bio; upload a profile picture (stored via Multer, served from `/uploads`). |
| **Posts** | Create text and/or image posts, delete your own posts, like/unlike (toggle), comment, and delete your own comments (or any comment on your post). |
| **Feed** | Paginated, newest-first, with "Load more". |
| **Follow System** | Follow/unfollow users, see follower/following counts, view modal lists of followers and following. |
| **Search** | Live user search by name or username from the navbar. |
| **UI / UX** | Tailwind CSS, custom coral/plum gradient theme, dark mode toggle, loading spinners, toast notifications, mobile-responsive layout. |
| **Security** | `helmet`, `cors`, `express-mongo-sanitize`, rate limiting on auth routes, file-type/size validation on uploads, ownership checks on delete actions. |

---

## Project Structure

```
mern-social/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   └── upload.js          # Multer image upload config
│   ├── models/
│   │   ├── User.js
│   │   └── Post.js
│   ├── routes/
│   │   ├── auth.js            # register, login, logout, me
│   │   ├── users.js           # profile, follow/unfollow, search, pic upload
│   │   └── posts.js           # CRUD, like/unlike, comments
│   ├── uploads/                # uploaded images stored here
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js        # axios instance + JWT interceptor
    │   ├── components/         # Navbar, PostCard, modals, Spinner, etc.
    │   ├── context/             # AuthContext, ThemeContext
    │   ├── pages/               # Login, Register, Home, Profile
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## Getting Started

### Prerequisites

- **Node.js v18+** and npm
- A MongoDB database — choose one:
  - **Local MongoDB** — install MongoDB Community Server and run `mongod`
  - **MongoDB Atlas** *(recommended)* — free cluster, no local install needed → [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

---

### 1. Backend Setup

```bash
cd mern-social/backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mern-social
# or your Atlas connection string:
# MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/mern-social

JWT_SECRET=replace_this_with_a_long_random_secret_string
CLIENT_URL=http://localhost:5173
```

> 💡 **Tip:** Generate a strong `JWT_SECRET` with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
> ```

Install dependencies and start the server:

```bash
npm install
npm run dev      # runs on http://localhost:5000 (nodemon)
# or: npm start
```

Expected output:

```
MongoDB connected: ...
Server running on port 5000
```

---

### 2. Frontend Setup

Open a **new terminal**:

```bash
cd mern-social/frontend
cp .env.example .env
```

`frontend/.env` should contain:

```env
VITE_API_URL=http://localhost:5000/api
```

Install dependencies and start the dev server:

```bash
npm install
npm run dev      # runs on http://localhost:5173
```

---

### 3. Using the App

Open **http://localhost:5173** in your browser:

1. Click **Sign up** and create an account.
2. You'll land on the **Home feed**.
3. Click the **+** icon in the navbar to create a post (text and/or image).
4. Click your avatar to open your **profile**, then **Edit Profile** to add a bio or picture.
5. Use the **search bar** to find other users, visit their profile, and click **Follow**.
6. **Like** and **comment** on posts — updates appear instantly, no page reload needed.

---

## API Reference

### Auth (`/api/auth`)

| Method | Endpoint | Body | Auth Required |
|---|---|---|---|
| `POST` | `/register` | `{ name, username, email, password }` | No |
| `POST` | `/login` | `{ emailOrUsername, password }` | No |
| `POST` | `/logout` | — | No |
| `GET` | `/me` | — | Yes |

### Users (`/api/users`)

| Method | Endpoint | Body | Auth Required |
|---|---|---|---|
| `GET` | `/:userId` | — | Yes |
| `PUT` | `/:userId` | `{ name?, bio? }` | Yes *(self only)* |
| `POST` | `/upload-pic` | `multipart/form-data: profilePic` | Yes |
| `POST` | `/:userId/follow` | — | Yes |
| `DELETE` | `/:userId/follow` | — | Yes |
| `GET` | `/:userId/follow` | — | Yes *(returns `{ followers, following }`)* |
| `GET` | `/search?q=term` | — | Yes |

### Posts (`/api/posts`)

| Method | Endpoint | Body | Auth Required |
|---|---|---|---|
| `GET` | `/?page=1&limit=10` | — | Yes |
| `GET` | `/user/:userId` | — | Yes |
| `POST` | `/` | `multipart/form-data: text?, image?` | Yes |
| `DELETE` | `/:postId` | — | Yes *(owner only)* |
| `PUT` | `/:postId/like` | — | Yes |
| `POST` | `/:postId/comment` | `{ text }` | Yes |
| `DELETE` | `/:postId/comment/:commentId` | — | Yes *(comment or post owner)* |

---

## Deployment (Free-Tier Friendly)

**Recommended stack:** MongoDB Atlas (database) + Render (backend API) + Vercel (frontend)

### Step A — Database: MongoDB Atlas

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user (username/password).
3. Under **Network Access**, add IP `0.0.0.0/0` to allow access from anywhere (required for Render).
4. Copy your connection string, e.g.:
   ```
   mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/mern-social
   ```

### Step B — Backend: Render

1. Push this project to a GitHub repo.
2. On [render.com](https://render.com), choose **New → Web Service** and connect your repo.
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add environment variables:
   - `MONGO_URI` → your Atlas connection string
   - `JWT_SECRET` → a long random string
   - `CLIENT_URL` → your future Vercel URL (e.g. `https://pulse-app.vercel.app`) — update after Step C
   - `PORT` → `5000` *(Render also sets this automatically, but it's safe to keep)*
5. Deploy and note your backend URL, e.g. `https://pulse-backend.onrender.com`.

> ⚠️ **About uploads on Render:** Render's free tier uses an *ephemeral* filesystem — files in `/uploads` are lost on restart or redeploy. For production, swap the `multer.diskStorage` config in `backend/middleware/upload.js` for `multer-storage-cloudinary` (free Cloudinary tier) so images persist. The disk-based setup is fine for local development and demos.

### Step C — Frontend: Vercel

1. On [vercel.com](https://vercel.com), choose **New Project** and import the same repo.
2. Configure:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add environment variable:
   - `VITE_API_URL` → `https://pulse-backend.onrender.com/api` *(your Render URL + `/api`)*
4. Deploy — you'll get a URL like `https://pulse-app.vercel.app`.

### Step D — Connect Everything

1. Go back to Render → your backend service → **Environment**, and update `CLIENT_URL` to your Vercel URL.
2. Redeploy the backend.
3. Visit your Vercel URL, register an account, and test the full flow.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| **"MongoDB connection error"** | Check `MONGO_URI`, confirm your IP is whitelisted in Atlas, or that local `mongod` is running. |
| **CORS errors in browser console** | Make sure `CLIENT_URL` in the backend `.env` exactly matches the frontend origin (no trailing slash). |
| **Images not showing after deploy** | See the Render ephemeral storage note above — switch to Cloudinary for persistent storage. |
| **"Not authorized, no token provided"** | Your JWT may have expired or `localStorage` was cleared — log in again. |
| **Upload fails with "File too large"** | Max upload size is **5MB**. |

---

## Roadmap / Possible Add-ons

- ✅ Dark / light mode *(already included)*
- ⬜ Stories feature (24h posts)
- ⬜ Real-time chat (Socket.io)
- ⬜ Notifications for likes, comments, and follows
- ⬜ Cloudinary integration for persistent image storage in production


