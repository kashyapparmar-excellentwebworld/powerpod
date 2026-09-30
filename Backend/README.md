# Wasla API

> **Wasla** is a centralized digital wholesale marketplace where suppliers list products in bulk with MOQ rules, and retailers across Kuwait and the wider Gulf region can browse, compare, and order directly. The platform operates on a commission-based revenue model and is delivered as a mobile-responsive web platform alongside iOS and Android mobile applications.

---

This repository is the backend REST API that powers:

- **Admin Panel**
- **Supplier Web**
- **Supplier App**
- **Buyer Web**
- **Buyer App**

---

## Getting Started

### Clone the repository

```bash
cd existing_repo
git remote add origin https://gitlab.excellentwebworld.co/excellent-webworld/wasla/api.git
```

### Install dependencies

```bash
npm install
```

### Setup environment

```bash
cp .env.example .env
# open .env and fill in your values
```

### Setup database

```bash
npm run db:generate       # generate Prisma client
npm run db:migrate        # run all migrations
npm run db:seed           # seed default roles + admin user
```

### Start development server

```bash
npm run dev
```

Server starts at `http://localhost:8080`<br>
Health check at `http://localhost:8080/health`

---

## Requirements

| Tool       | Version   |
| ---------- | --------- |
| Node.js    | >= 22.0.0 |
| PostgreSQL | >= 16     |
| Redis      | >= 7      |
| npm        | >= 10     |

---

## Tech Stack

| Layer           | Technology                   |
| --------------- | ---------------------------- |
| Runtime         | Node.js 22 LTS               |
| Framework       | Express v5                   |
| Language        | TypeScript 6                 |
| ORM             | Prisma v7                    |
| Database        | PostgreSQL                   |
| Cache / Session | Redis (ioredis)              |
| Job Queue       | BullMQ                       |
| Authentication  | JWT (access + refresh token) |
| Validation      | Zod v3                       |
| Logger          | Pino                         |
| Localization    | i18next (English + Arabic)   |

---

## API Base URLs

| Platform | Base URL            |
| -------- | ------------------- |
| Admin    | `/api/v1/admin/`    |
| Supplier | `/api/v1/supplier/` |
| Buyer    | `/api/v1/buyer/`    |
| Health   | `/health`           |

---

## Localization

Send `Accept-Language` header with every request.

| Header Value | Language          |
| ------------ | ----------------- |
| `en`         | English (default) |
| `ar`         | Arabic            |

---

## Scripts

```bash
# Development
npm run dev                  # start server with hot reload
npm run build                # compile TypeScript → dist/
npm start                    # run compiled production build

# Code quality
npm run lint                 # auto-fix ESLint errors
npm run format               # auto-fix Prettier formatting

# Database
npm run db:migrate           # create + run new migration (dev only)
npm run db:migrate:prod      # run pending migrations (production)
npm run db:migrate:reset     # drop all tables + re-migrate (dev only)
npm run db:migrate:status    # show migration history
npm run db:generate          # regenerate Prisma client after schema change
npm run db:studio            # open Prisma Studio at localhost:5555
npm run db:seed              # seed default roles + admin user
npm run db:fresh             # reset DB + re-seed (dev only)
```

---

## Database Migrations

### Development workflow

```bash
# 1. edit prisma/schema.prisma
# 2. create + apply migration
npm run db:migrate
# enter a name e.g: add_phone_to_admins

# 3. regenerate client
npm run db:generate
```

### Production deployment

```bash
npm install
npm run db:generate
npm run db:migrate:prod      # safe — no prompts, no reset
npm start
```

> ⚠️ Never run `db:migrate` or `db:fresh` in production.

---
