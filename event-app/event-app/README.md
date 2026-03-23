# Event App

## 1. Install
```bash
npm install
```

## 2. Add env file
Create `.env` from `.env.example` and set:
- `VITE_API_URL` = your Google Apps Script web app URL ending in `/exec`
- `VITE_ADMIN_PASSWORD` = any password you want for the admin panel

## 3. Run locally
```bash
npm run dev
```

## 4. Deploy to Vercel
- Push this folder to your GitHub repo
- Import the repo in Vercel
- Add the same environment variables in Vercel
- Deploy

## Important
Your Apps Script must support:
- `GET ?action=event`
- `POST` for RSVP submit
- `POST` with `action: updateEvent` for admin updates
