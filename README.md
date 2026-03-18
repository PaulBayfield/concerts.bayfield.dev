# concerts.bayfield.dev

A personal concert tracking web app. Log the concerts you've attended, visualise venues on an interactive map, and browse your artists alphabetically.

## Features

- **Interactive map** — venue markers on an OpenStreetMap base layer; click a marker to highlight it, click a concert in the panel to fly to its venue
- **Concerts panel** — collapsible side panel (bottom sheet on mobile) listing all your concerts grouped by year, with search
- **Artists page** — alphabetical list with concert count, country flag, and expandable venue/date history
- **Concerts page** — full concert list grouped by year with search, edit, and delete
- **Add / Edit / Delete** — full CRUD for concerts and artists, authenticated users only
- **Per-user data** — each account sees only its own concerts; venues and artists are shared
- **Internationalisation** — French and English, locale-prefixed routing (`/fr/`, `/en/`)
- **Dark mode** — system-aware with manual toggle
- **Responsive** — mobile-first layout with collapsible map panel

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16, React 19, TypeScript 5 |
| Styling | Tailwind CSS 4, shadcn/ui |
| Map | React Leaflet 5, Leaflet 1.9, OpenStreetMap |
| Auth | NextAuth.js 4 (Google OAuth, JWT strategy) |
| Database | SQLite via better-sqlite3 |
| i18n | next-intl 4 |
| Notifications | Sonner |
| Icons | Lucide React, Tabler Icons |

## Getting started

### Prerequisites

- Node.js 20+
- A Google OAuth app ([console.cloud.google.com](https://console.cloud.google.com))

### Installation

```bash
git clone https://github.com/your-username/concerts.bayfield.dev.git
cd concerts.bayfield.dev
npm install
```

### Environment variables

Create a `.env.local` file at the root:

```env
ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

To generate a secret:

```bash
openssl rand -base64 32
```

For the Google OAuth credentials, set the authorised redirect URI to:

```
http://localhost:3000/api/auth/callback/google
```

### Run

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000). The SQLite database (`concerts.db`) is created automatically on first run and seeded with sample data.

## Database

SQLite, managed with `better-sqlite3`. The schema is initialised automatically at startup — no migrations to run.

```sql
venues  (id, name, address, city, state, country, latitude, longitude)
artists (id, name, country)
concerts(id, venue_id, artist_id, date, user_email)
```

The `user_email` column on `concerts` ties each record to a Google account. Venues and artists are shared across users.

## Project structure

```
src/
├── app/
│   ├── [locale]/           # Locale-prefixed pages (fr / en)
│   │   ├── page.tsx        # Map page
│   │   ├── artists/        # Artists list
│   │   ├── concerts/       # Concerts list
│   │   └── auth/signin/    # Sign-in page
│   └── api/
│       ├── concerts/       # GET, POST, PATCH, DELETE
│       ├── artists/        # GET, PATCH, DELETE
│       └── venues/         # GET
├── components/             # UI components
├── lib/                    # db, auth, db-init
├── i18n/                   # next-intl routing & config
└── messages/               # en.json, fr.json
```

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm start        # Start production server
npm run lint     # ESLint
```

## Production deployment

Set `ENV=production` in your environment variables. This enables secure cookies for the auth session. Make sure `NEXTAUTH_URL` matches your production domain exactly.
