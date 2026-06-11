# 🎬 BollywoodReal

**India's platform for Bollywood movies based on real events.**  
Rate how real the stories are, share your opinion, and discover the truth behind the silver screen.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express.js |
| Frontend | React 18 + Vite + Tailwind CSS |
| Database | MySQL + Sequelize ORM |
| Auth | Mobile OTP (Fast2SMS free tier) + JWT |
| Uploads | Multer (local, S3-ready) |
| Ads | Google AdSense ready (placeholders in dev) |

---

## 📁 Project Structure

```
bollywood-real/
├── backend/                  # Node.js + Express API
│   ├── config/
│   │   ├── database.js       # Sequelize MySQL config
│   │   └── seed.js           # Sample data seeder
│   ├── controllers/          # Route handlers
│   ├── middleware/           # Auth, upload
│   ├── models/               # Sequelize models
│   ├── routes/               # API routes
│   ├── uploads/              # Uploaded images (gitignored)
│   ├── .env.example          # Environment template
│   └── server.js             # Entry point
│
└── frontend/                 # React + Vite SPA
    ├── src/
    │   ├── components/       # Reusable components
    │   │   ├── admin/        # Admin layout
    │   │   ├── auth/         # OTP Login modal
    │   │   ├── common/       # Navbar, Footer, AdSlot
    │   │   └── movies/       # Cards, Slider, Rating, Share
    │   ├── context/          # Auth context
    │   ├── pages/            # Route pages
    │   │   ├── admin/        # Dashboard, Movies, Users, Feedbacks
    │   │   └── ...           # Home, Detail, Search, Feedback
    │   └── utils/            # Axios API client
    └── .env.example
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js >= 18
- MySQL 8.0+
- npm or yarn

---

### 1. Database Setup

```sql
CREATE DATABASE bollywood_real CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
DB_HOST=localhost
DB_NAME=bollywood_real
DB_USER=root
DB_PASS=yourpassword
JWT_SECRET=change_this_to_a_long_random_string
OTP_DEV_MODE=true          # Set false in production & add Fast2SMS key
ADMIN_PHONE=9999999999     # Your mobile number for admin login
```

Seed the database with sample movies:
```bash
npm run seed
```

Start the dev server:
```bash
npm run dev
```

Backend runs at: **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Start the dev server:
```bash
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🔐 Admin Access

1. The seed script creates an admin with the phone in `ADMIN_PHONE` (default: `9999999999`)
2. Go to the website → click **Login** → enter that phone number
3. In dev mode (`OTP_DEV_MODE=true`), the OTP is printed in the **backend console**
4. After login, navigate to `/admin`

---

## 📱 OTP Setup (Production)

1. Sign up at [fast2sms.com](https://www.fast2sms.com) — free credits on signup
2. Get your API key from the dashboard
3. Set in `.env`:
```env
FAST2SMS_API_KEY=your_key_here
OTP_DEV_MODE=false
```

---

## 💰 Google AdSense Setup

1. Apply at [Google AdSense](https://adsense.google.com)
2. Once approved, get your Publisher ID and Ad Slot IDs
3. In `frontend/index.html`, uncomment and update:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXX" crossorigin="anonymous"></script>
```
4. In `frontend/.env`:
```env
VITE_ADSENSE_CLIENT=ca-pub-XXXXX
VITE_AD_SLOT_BANNER=1234567890
VITE_AD_SLOT_RECTANGLE=0987654321
VITE_AD_SLOT_INLINE=1122334455
```
5. In `AdSlot.jsx`, uncomment the `useEffect` that pushes to `adsbygoogle`

---

## 🚀 Production Deployment

### Backend
```bash
NODE_ENV=production
# Use PM2: pm2 start server.js --name bollywood-real-api
```

### Frontend
```bash
npm run build
# Serve dist/ via Nginx or deploy to Vercel/Netlify
```

### Moving Uploads to AWS S3 (when ready)
1. Install: `npm install @aws-sdk/client-s3 multer-s3`
2. Replace the `multer.diskStorage` in `middleware/upload.js` with `multer-s3` storage
3. Add `AWS_ACCESS_KEY`, `AWS_SECRET_KEY`, `AWS_BUCKET` to `.env`

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 🏠 Home | Trending slider (Swiper) + grid/list movie grid |
| 🎬 Movie Detail | Cast, true story, real event details, streaming info |
| ⭐ Star Rating | 1-5 stars with hover effects |
| 📊 Real % Slider | 0-100% slider to vote how real the story is |
| 📱 OTP Login | Mobile number → SMS OTP → JWT auth |
| 🔍 Search | Live suggestions + full search page |
| 📤 Share | WhatsApp, Twitter, Facebook, Copy Link |
| 🌙 Dark Mode | Full dark cinema aesthetic |
| 💬 Feedback | Multi-type feedback form |
| 🛠️ Admin Panel | Dashboard, movie CRUD, user management, feedbacks |
| 📢 Ad Slots | AdSense-ready banner, rectangle, inline placements |
| 📱 Responsive | Mobile-first design throughout |

---

## 🗄️ API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-otp` | Send OTP to mobile |
| POST | `/api/auth/verify-otp` | Verify OTP & get token |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update name |

### Movies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/movies` | List with filters & pagination |
| GET | `/api/movies/trending` | Trending movies |
| GET | `/api/movies/:slug` | Movie details + ratings |
| POST | `/api/movies/:id/rate` | Submit rating (auth) |
| POST | `/api/movies/:id/share` | Track share count |
| GET | `/api/movies/search/suggestions` | Search suggestions |

### Admin (requires admin JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard stats |
| POST | `/api/admin/movies` | Create movie |
| PUT | `/api/admin/movies/:id` | Update movie |
| DELETE | `/api/admin/movies/:id` | Delete movie |
| GET | `/api/admin/users` | List users |
| PUT | `/api/admin/users/:id/toggle` | Ban/unban user |
| GET | `/api/admin/feedbacks` | List feedbacks |
| PUT | `/api/admin/feedbacks/:id` | Update feedback status |

---

## 📝 License

MIT — feel free to use and modify.
