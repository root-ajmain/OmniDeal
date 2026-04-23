# OmniDeal — Full-Stack E-Commerce Platform

Production-ready multi-product e-commerce platform built for the Bangladesh market.

---

## Stack

| Layer | Tech |
|---|---|
| **Server** | Node.js + Express + MongoDB (Mongoose) + JWT + Passport.js |
| **Client** | React 18 + Vite + Tailwind CSS + Zustand + TanStack Query |
| **Admin** | React 18 + Vite + Tailwind CSS + Recharts |
| **Storage** | Cloudinary (images) |
| **Email** | Nodemailer (Gmail / any SMTP) |

---

## Features

### Customer Store
- Product catalog with categories, search, filters, sorting
- Flash Sale with live countdown timer
- Product detail: image gallery, reviews, variants, Buy Now button
- Recently Viewed products
- Wishlist (localStorage + server sync)
- Cart with coupon codes
- Checkout with Bangladesh delivery zones (all 8 divisions)
- Payment: Cash on Delivery, bKash, Nagad, Card
- Order tracking (no login needed)
- User accounts: register, login, Google OAuth, profile, order history
- Return / Refund request (7-day policy)
- Announcement bar (admin-controlled)
- WhatsApp chat button (floating)
- Mobile bottom navigation bar
- Fully responsive (mobile-first)

### Admin Panel
- Dashboard with revenue chart, category chart, order stats
- Product CRUD with multi-image upload (Cloudinary), featured image
- Category management
- Order management with status updates + email notifications
- Customer list
- Review moderation (approve/reject)
- Coupon CRUD (percentage + fixed amount)
- **Banner management** (hero, promo, announcement banners)
- **Flash Sale management** (schedule, products, prices, stock limits)
- **Returns & Refunds** management
- **Site Settings**: announcement bar, WhatsApp number, social links, SEO meta, delivery threshold
- Analytics with charts

---

## Default Admin Credentials

```
Email:    admin@omnideal.com
Password: Admin@123!
```

> Change this immediately in production via Admin Panel → Site Settings or directly in MongoDB.

---

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas free tier)
- Cloudinary account (free tier: 25GB storage)

### Setup

```bash
# 1. Server
cd server
npm install
cp .env.example .env
# Edit .env with your values

# 2. Client
cd ../client
npm install

# 3. Admin
cd ../admin
npm install

# 4. Seed 30 demo products (optional)
cd ../server
npm run seed
```

### Start (3 terminals)

```bash
# Terminal 1 — API  :5000
cd server && npm run dev

# Terminal 2 — Store  :3000
cd client && npm run dev

# Terminal 3 — Admin  :3001
cd admin && npm run dev
```

---

## Production Deployment

### Option A — VPS / Ubuntu (Recommended for production)

**1. Install Node.js 20 + PM2 + Nginx**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
npm install -g pm2
```

**2. Clone & build**
```bash
git clone <your-repo> /var/www/omnideal
cd /var/www/omnideal

cd client  && npm install && npm run build
cd ../admin && npm install && npm run build
cd ../server && npm install
```

**3. Set production .env in `server/.env`**
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
CLIENT_URL=https://omnideal.com
ADMIN_URL=https://admin.omnideal.com
# ... all other vars
```

**4. Start API**
```bash
cd /var/www/omnideal/server
pm2 start server.js --name omnideal-api
pm2 save && pm2 startup
```

**5. Nginx config — `/etc/nginx/sites-available/omnideal`**
```nginx
server {
    listen 80;
    server_name omnideal.com www.omnideal.com;
    root /var/www/omnideal/client/dist;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name admin.omnideal.com;
    root /var/www/omnideal/admin/dist;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/omnideal /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Free SSL
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d omnideal.com -d www.omnideal.com -d admin.omnideal.com
```

---

### Option B — Render.com (Free / Hobby)

| Service | Type | Root dir | Build cmd | Start cmd |
|---|---|---|---|---|
| API | Web Service | `server` | `npm install` | `node server.js` |
| Store | Static Site | `client` | `npm run build` | — |
| Admin | Static Site | `admin` | `npm run build` | — |

Set `VITE_API_URL=https://your-api.onrender.com/api` in client and admin env vars on Render.

---

### Option C — Vercel (frontend) + Railway (backend)

**Railway (server):**
1. New project → GitHub → select repo → root `server`
2. Add all env vars → copy Railway URL

**Vercel (client + admin):**
1. Import repo → root `client` → Vite framework
2. Env var: `VITE_API_URL=https://your-api.railway.app/api`
3. Repeat for `admin`

---

## Bangladesh Payments

| Method | Status | Notes |
|---|---|---|
| Cash on Delivery | ✅ Built-in | Default, most popular in BD |
| bKash | 🔧 Manual | Real API: apply at developer.bka.sh |
| Nagad | 🔧 Manual | Real API: apply at nagad.com.bd |
| Card | 🔧 Manual | Use SSLCommerz or ShurjoPay for BD cards |

For live store: manual bKash/Nagad verification is standard for new BD stores. Customer selects method → admin confirms payment before shipping.

For SSLCommerz integration (most popular BD payment gateway): [sslcommerz.com/developer](https://developer.sslcommerz.com)

---

## Third-party Setup

### Cloudinary (Image Upload)
1. Sign up at cloudinary.com (free: 25GB storage)
2. Dashboard → copy Cloud Name, API Key, API Secret → paste in `server/.env`

### Google OAuth
1. [console.cloud.google.com](https://console.cloud.google.com) → Create project
2. APIs & Services → Credentials → OAuth 2.0 Client ID → Web application
3. Redirect URIs: `http://localhost:5000/api/auth/google/callback` (dev) + your production URL
4. Copy Client ID + Secret → `server/.env`

### Gmail Email
1. Gmail → Settings → Security → 2FA → App Passwords
2. Generate password for "Mail" → use as `EMAIL_PASS` in `.env`
