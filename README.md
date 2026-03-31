# DeliverGuard AI

AI-powered parametric insurance platform protecting gig delivery workers from income loss caused by external disruptions.

## Tech Stack

- **Frontend**: React (Vite), TailwindCSS, React Router, Recharts, Axios
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT
- **Payments**: Razorpay (test mode)
- **APIs**: Open-Meteo (rain/weather), WAQI (AQI), TomTom Traffic

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB
- API keys (see `.env.example`)

### Installation

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### Running the App

```bash
# From root — runs both frontend and backend
npm run dev

# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
```

## Environment Setup

**Never commit your `.env` file.** It is listed in `.gitignore`.

```bash
# Copy the example file
cp .env.example backend/.env

# Fill in your real values
nano backend/.env
```

Required variables:

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Random secret string (min 32 chars) |
| `WAQI_TOKEN` | WAQI air quality token — [get free token](https://aqicn.org/data-platform/token/) |
| `TOMTOM_API_KEY` | TomTom traffic API key — [get free key](https://developer.tomtom.com/) |
| `RAZORPAY_KEY_ID` | Razorpay key (test mode) |
| `RAZORPAY_SECRET` | Razorpay secret (test mode) |
| `PORT` | Backend port (default: 5000) |

> **Note:** Weather data uses [Open-Meteo](https://open-meteo.com/) — completely free, no API key required.

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Render Deployment

### Backend
1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node server.js`
6. Add all environment variables in **Render Dashboard → Environment**

### Frontend
1. Create a new **Static Site** on Render
2. Set **Root Directory** to `frontend`
3. Set **Build Command**: `npm run build`
4. Set **Publish Directory**: `dist`
5. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-service.onrender.com/api
   ```

## Project Structure

```
DeliverGuard-AI/
├── frontend/        # React + Vite app
├── backend/         # Node.js + Express API
├── shared/          # Shared constants
├── docs/            # Architecture & API docs
├── .env.example     # Safe template — copy to backend/.env
├── .gitignore
└── package.json
```

## Disruption Triggers

| Type | Condition |
|------|-----------|
| Heavy Rain | Rain > 50 mm/hr |
| Extreme Heat | Temp > 42°C |
| AQI Hazard | AQI > 300 |
| Traffic Jam | Speed ratio < 0.4 |

## Insurance Plans

| Plan | Premium | Max Weekly Payout |
|------|---------|-------------------|
| Basic | 5% of income | ₹2,000 |
| Standard | 8% of income | ₹4,000 |
| Premium | 10% of income | ₹8,000 |

## Security

- `.env` is excluded from git via `.gitignore`
- All secrets are loaded via `process.env`
- No hardcoded credentials in source code
- Passwords hashed with bcrypt
- JWT used for all authenticated routes
