# 📚 Dokumentasi LeadershipNasionalAsia.com

Selamat datang di dokumentasi project **LeadershipNasionalAsia.com** — website company profile + Assessment Center portal untuk perusahaan konsultan GRC & leadership.

Dokumentasi ini dibuat khusus untuk developer baru yang akan handle project ini. Baca secara berurutan untuk pemahaman terbaik.

---

## Daftar Isi

| No | File | Deskripsi |
|----|------|-----------|
| 1 | [01-overview.md](./01-overview.md) | Gambaran umum project, tech stack, dan arsitektur |
| 2 | [02-getting-started.md](./02-getting-started.md) | Setup development environment |
| 3 | [03-architecture.md](./03-architecture.md) | Arsitektur aplikasi dan folder structure |
| 4 | [04-database.md](./04-database.md) | Schema database (Prisma), models, dan relationships |
| 5 | [05-authentication.md](./05-authentication.md) | Sistem auth (NextAuth.js), roles, dan permissions |
| 6 | [06-routes.md](./06-routes.md) | Semua routes (pages + API) |
| 7 | [07-features.md](./07-features.md) | Fitur-fitur utama dan business logic |
| 8 | [08-frontend.md](./08-frontend.md) | React + Next.js frontend guide |
| 9 | [09-deployment.md](./09-deployment.md) | Deployment & production |
| 10 | [10-troubleshooting.md](./10-troubleshooting.md) | Common issues dan solusinya |
| 11 | [11-shadcn-mcp.md](./11-shadcn-mcp.md) | Panduan pakai shadcn MCP + aturan main komponen UI project ini |
| 12 | [12-fitur-pembayaran-pelatihan.md](./12-fitur-pembayaran-pelatihan.md) | Fitur pembayaran manual (upload bukti transfer + persetujuan admin) |

---

## Quick Reference

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Database**: SQLite (via Prisma ORM)
- **Auth**: NextAuth.js v4 (Credentials provider)
- **Styling**: Tailwind CSS 4
- **3D**: Three.js + React Three Fiber
- **Animation**: Framer Motion
- **Language**: Bilingual (Indonesia + English)

---

## Cara Menjalankan Project

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev
npm run db:seed

# Jalankan development server
npm run dev
```

Buka browser: **http://localhost:3000**
