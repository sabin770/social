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