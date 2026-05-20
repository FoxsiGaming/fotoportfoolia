# Photography Portfolio

A dark, minimal, cinematic photography portfolio built with Next.js 15, TypeScript, Tailwind CSS, and SQLite.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open in browser
open http://localhost:3000
```

## First Steps

1. Visit `http://localhost:3000/admin`
2. Log in with the default password: `admin123`
3. Create your first album (e.g., "Landscapes")
4. Upload photos into the album
5. Visit the homepage to see your portfolio

## Features

**Public Portfolio:**
- Full-screen hero with featured image
- Masonry gallery with smooth lightbox (keyboard navigation: arrow keys + Escape)
- Filterable albums / categories
- About and Contact pages
- Fully responsive, dark cinematic design

**Admin Panel:**
- Password-protected dashboard
- Create, rename, delete albums
- Multi-image upload
- Drag-and-drop photo reordering
- Edit titles, descriptions, featured status per photo
- Set album covers

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS 4**
- **SQLite** via better-sqlite3 (zero-config, file-based)
- **bcryptjs** for password hashing

## Project Structure

```
src/
├── app/
│   ├── page.tsx            # Homepage with hero + collections
│   ├── gallery/
│   │   ├── page.tsx        # All photos gallery
│   │   └── [slug]/page.tsx # Single album view
│   ├── about/page.tsx      # About page
│   ├── contact/page.tsx    # Contact form
│   ├── admin/
│   │   ├── layout.tsx      # Admin auth wrapper
│   │   ├── page.tsx        # Album management dashboard
│   │   └── albums/[id]/    # Album detail with upload + reorder
│   └── api/
│       ├── auth/           # Login / logout / check
│       ├── albums/         # Album CRUD
│       ├── photos/         # Photo CRUD
│       ├── upload/         # Multi-file upload
│       └── contact/        # Contact form handler
├── components/
│   ├── Header.tsx          # Site navigation
│   ├── Footer.tsx          # Site footer
│   ├── Lightbox.tsx        # Full-screen image viewer
│   └── PhotoGrid.tsx       # Masonry grid with lightbox integration
├── lib/
│   ├── db.ts              # SQLite connection + schema
│   ├── data.ts            # Data access layer (all queries)
│   ├── auth.ts            # Session-based authentication
│   └── types.ts           # TypeScript interfaces
data/
└── portfolio.db            # SQLite database (auto-created)
public/
└── uploads/                # Uploaded photos stored here
```

## Configuration

**Change admin password:**
Log in, then update via the database, or change the default in `src/lib/db.ts`.

**Site settings:**
Edit the defaults in `src/lib/db.ts` under the `initSchema` function — `site_title`, `site_subtitle`, `about_text`, etc.

## Deployment (Vercel)

> Note: SQLite works great locally and on traditional servers. For Vercel (serverless), you'll want to swap SQLite for a hosted database (Turso, PlanetScale, Supabase) and use an object store (Cloudflare R2, S3) for images. The data layer in `src/lib/data.ts` makes this straightforward to swap.

For a VPS or Docker deployment, the app works as-is:

```bash
npm run build
npm start
```

## License

MIT
