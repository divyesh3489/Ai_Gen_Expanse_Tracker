# Expense Tracker (ExpanseTraker)

Full-stack personal finance app: **Django REST** API with **JWT** auth, **Celery** background jobs, and a **React + Vite + TypeScript** SPA (Tailwind, TanStack Query). The API uses the name “expanse” in URLs and models for historical consistency with the repo.

## What’s in the repo

| Area | Path | Notes |
|------|------|--------|
| Backend | `ExpanseTraker/` | Django 5.2 project `ExpanseTraker`, apps `user`, `expanse`, `core` |
| Frontend | `frontend/` | React 19, Vite 8, proxies `/api` → `http://localhost:8000` in dev |
| Dev containers | `docker-compose.yml` | API, SPA, Postgres, Redis, Celery worker + beat |
| Production | `docker-compose.prod.yml`, `nginx/` | Nginx builds the SPA, serves static UI, proxies `/api` and `/admin` to Gunicorn; Certbot for TLS |

## Architecture

**Backend**

- Django REST Framework, Simple JWT (access/refresh + blacklist logout)
- PostgreSQL when `production=true` in environment; SQLite otherwise
- Redis (Celery broker/result, django-redis cache)
- django-celery-beat (scheduled tasks, e.g. recurring expense/income generation)
- django-storages + S3 for profile pictures and media
- django-cors-headers for allowed browser origins

**Frontend**

- React Router 7, axios with JWT refresh retry, light/dark theme
- Routes: auth (`/login`, `/register`, `/forgot-password`, `/reset-password`), app shell under `/app` (dashboard, expenses, incomes, budgets, recurring, profile, settings, category preferences; `/app/categories` admin-only)

**Celery tasks (high level)**

- Email: verification after register, password reset links (token expires in 15 minutes), cleanup of expired reset tokens
- Recurring: materialize due recurring rows into `Expanse` / `Income` and advance `next_run_date`

## Features

- Register / login / logout (JWT); email verification before login
- Resend verification email; forgot password + reset password (token in email → SPA)
- Profile: read/update `me/`, upload profile picture (S3)
- Categories (global list; create/update/delete **admin only**); per-user category color preferences
- Expenses (“expanses”), incomes, budgets with date range and summary vs spend (`from` / `to`)
- Recurring expense/income with frequency (daily / weekly / monthly / yearly) and Celery-backed processing

## Quick start (Docker, dev)

From the repository root:

```bash
docker compose up --build
```

- API: `http://localhost:8000` (e.g. `http://localhost:8000/api/v1/…`)
- SPA: `http://localhost:3000` (container maps `3000:80`)

Ensure `.env` matches your compose setup (see **Environment** below). Migrations run on the `web` container startup.

**Production-style stack** (Nginx + Gunicorn + TLS hooks): see `docker-compose.prod.yml` and `nginx/Dockerfile` (multi-stage: build `frontend/`, copy `dist` into Nginx).

## Local development without Docker (optional)

1. Python 3.10+, Node 20+, Redis (for Celery if you run workers).
2. Backend: from the repo root, create a venv and `pip install -r requirements.txt`, then `cd ExpanseTraker`, `python manage.py migrate`, `python manage.py runserver`.
3. Frontend: `cd frontend`, `npm ci`, `npm run dev` (Vite dev server proxies `/api` to port 8000).
4. Run Celery worker (and beat if you test schedules): `celery -A ExpanseTraker worker -l info` and `celery -A ExpanseTraker beat -l info` from `ExpanseTraker/`.

Useful management commands (from `ExpanseTraker/`): `wait_for_db`, `categories_seed_data`, `seed_dummy_data`.

## Environment

Typical variables (not exhaustive): `SECRET_KEY`, `DEBUG`, `production` (use Postgres when true: `database`, `user_name`, `password`, `host`, `port`), `REDIS_URL`, `REDIS_CACHE_URL`, `EMAIL_*`, `DOMAIN` (backend base for verification links), `FRONTEND_URL` (for password reset links), `AWS_*` for S3. Docker Postgres defaults are in `docker-compose.yml`.

## Models

### `baseModel` (abstract)

Shared audit fields: `created_at`, `updated_at`, `created_by`, `updated_by` (FK to `User`, `SET_NULL`).

### `User`

Extends `AbstractUser` with `username` disabled; **`USERNAME_FIELD` = `email`**. Notable fields: `email` (unique), `first_name`, `last_name`, `gender`, `dob`, `is_verified`, `profile_picture` (URL, default S3 asset). Managers: `objects`, `active_objects`.

### `VerificationToken`

`user`, `token`, `created_at` — email verification.

### `PasswordResetToken`

`user`, `token`, `expires_at`, `created_at` — short-lived reset tokens consumed by the reset-password API.

### `Category` (extends `baseModel`)

`name` (unique), `icon`, `default_color`, `type` (`expense` | `income`).

### `UserCategoryPreference` (extends `baseModel`)

`user`, `category`, `custom_color`.

### `Expanse` (extends `baseModel`)

Expense line: `user`, `category`, `amount`, `note`, `date`.

### `Income` (extends `baseModel`)

`user`, `category`, `amount`, `note`, `date`.

### `Budget` (extends `baseModel`)

`user`, `category`, `amount`, `start_date`, `end_date`.

### `Recurring` (extends `baseModel`)

`user`, `category`, `amount`, `note`, `start_date`, `end_date`, `next_run_date`, `frequency`, `type` (`expense` | `income`), `is_active`. Custom manager **`recurringObjects`**: active rows only; helpers `due_recurrings()`, `update_next_run_date()`, `stop_recurrings()`.

## API base paths

- Auth / user: `/api/v1/user/`
- Finance resources: `/api/v1/expanse/`

List endpoints use **cursor pagination** (`page_size` 20 by default) unless documented otherwise (e.g. budget summary).

### User (`/api/v1/user/`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `register/` | Register (queues verification email) |
| POST | `login/` | JWT; body uses `email`, `password`; requires verified user |
| POST | `token/refresh/` | New access token (`refresh` in body) |
| POST | `logout/` | Blacklist refresh token |
| GET / PATCH | `me/` | Current user profile |
| GET | `verify/<token>/` | Verify email |
| POST | `resend-verification/` | Body: `email` |
| POST | `upload-profile-picture/` | Multipart profile upload |
| POST | `request-password-reset/` | Body: `email` (rate limited) |
| POST | `reset-password/` | Body: `token`, `new_password` |

### Expanse app (`/api/v1/expanse/`)

Categories, user-category-preferences, expanses, incomes, recurring, budgets — same shapes as in your existing client; budgets summary:

- `GET budgets/summary/?from=YYYY-MM-DD&to=YYYY-MM-DD` — per-budget spend vs cap in the window.

## Frontend integration (JWT)

- Send `Authorization: Bearer <access>` on protected routes.
- Login returns `access` and `refresh`; call `token/refresh/` with `{ "refresh": "..." }` when access expires.
- `logout/` blacklists the refresh token (requires `rest_framework_simplejwt.token_blacklist`).

## Example JSON bodies

**Login**

```json
{ "email": "you@example.com", "password": "your-password" }
```

**Create expense**

```json
{ "category": 1, "amount": "120.50", "note": "Groceries", "date": "2026-05-06" }
```

**Create recurring expense**

```json
{
  "category": 1,
  "amount": "499.00",
  "note": "Subscription",
  "start_date": "2026-05-01",
  "end_date": null,
  "next_run_date": null,
  "frequency": "monthly",
  "type": "expense"
}
```

**Create budget**

```json
{ "category": 1, "amount": "5000.00", "start_date": "2026-05-01", "end_date": "2026-05-31" }
```

**User category preference**

```json
{ "category": 1, "custom_color": "#FF5733" }
```

**Reset password**

```json
{ "token": "<token-from-email>", "new_password": "new-secure-password" }
```

## Deployment diagram (production compose)

```text
Internet
   │
   ▼
Nginx (TLS, static SPA, /api → Gunicorn)
   │
   ├── Django (Gunicorn) :8000
   │        ├── PostgreSQL
   │        ├── Redis
   │        ├── Celery worker
   │        ├── Celery beat
   │        └── S3 (media / profile pictures)
   └── Certbot (certificate renewal)
```

Dev `docker-compose.yml` runs the SPA as its own service on port 3000 instead of baking the build into Nginx.
