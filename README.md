# Portfolio — Django backend

Content lives in a database, editing happens through Django's built-in
admin (with login), and project screenshots are uploaded as real files.
This version is set up to run:
- **locally** with SQLite + local file storage — no accounts or env vars needed, or
- **in production** with Postgres hosted on **Aiven**, images on
  **Cloudinary**, and the app itself on **Render**.

Which mode it runs in is controlled entirely by environment variables —
same codebase either way.

## Project layout
```
templates/index.html   → the page shell (Django TemplateView)
static/script.js       → fetches /api/site-data/, renders projects/
                          experience/testimonials, runs the rest of the
                          site's existing behavior unchanged
content/models.py       → Project, Experience, Testimonial, SkillOverride
content/views.py        → site_data() — serializes the DB to JSON
content/admin.py        → registers the models with Django admin
media/projects/         → local uploads (dev only — Cloudinary in prod)
build.sh                → Render's build step (install, collectstatic, migrate)
Procfile                → Render's start command (gunicorn)
.env.example             → every environment variable this project reads
```

---

## 1. Local development (no accounts needed)

```bash
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

python manage.py migrate
python manage.py seed_content     # loads your original projects/experience/testimonials
python manage.py createsuperuser
python manage.py runserver
```

Visit `http://127.0.0.1:8000/` for the site and `/admin/` to manage content.
With no `DATABASE_URL` or `CLOUDINARY_URL` set, this uses SQLite and local
disk storage automatically — nothing to configure.

---

## 2. Set up Aiven (Postgres)

1. Create a **PostgreSQL** service in Aiven (any plan — the free/starter tier is fine to start).
2. Once it's running, open the service's **Overview** page and copy the
   **Service URI** under "Connection information". It looks like:
   ```
   postgres://avnadmin:PASSWORD@your-service-name.aivencloud.com:12345/defaultdb?sslmode=require
   ```
   Aiven requires SSL — the `sslmode=require` in that URI is expected and
   this project honors it automatically.
3. That whole URI is your `DATABASE_URL` — you'll paste it into Render's
   environment variables in step 4.

You don't need to run migrations against it manually — Render's build step
(below) does that on every deploy.

## 3. Set up Cloudinary (image storage)

1. Create a free Cloudinary account.
2. On your Cloudinary **Dashboard**, find **API Environment variable**
   under Account Details — it's a single string:
   ```
   CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
   ```
3. Copy the whole `cloudinary://...` value (without the `CLOUDINARY_URL=`
   prefix) — that's what you'll paste into Render as `CLOUDINARY_URL`.

Once this is set, every image uploaded through `/admin/` is stored on
Cloudinary instead of local disk, and `content.image.url` in the API
response will point straight at Cloudinary's CDN.

## 4. Deploy on Render

1. Push this project to a GitHub repo (Render deploys from a repo).
2. In Render, **New → Web Service**, connect the repo.
3. Configure:
   - **Runtime:** Python 3
   - **Build Command:** `./build.sh`
   - **Start Command:** `gunicorn portfolio_backend.wsgi:application`
     (this also lives in `Procfile`, which Render can auto-detect)
4. Under **Environment**, add these variables:

   | Key | Value |
   |---|---|
   | `SECRET_KEY` | generate one — e.g. `python -c "import secrets; print(secrets.token_urlsafe(50))"` |
   | `DEBUG` | `False` |
   | `DATABASE_URL` | your Aiven Service URI from step 2 |
   | `CLOUDINARY_URL` | your Cloudinary URL from step 3 |
   | `ALLOWED_HOSTS` | `your-app-name.onrender.com` (use the hostname Render assigns — you'll see it after the first deploy, or set it after) |
   | `DJANGO_SUPERUSER_USERNAME` | your chosen admin username |
   | `DJANGO_SUPERUSER_EMAIL` | your email |
   | `DJANGO_SUPERUSER_PASSWORD` | a strong password |

   Render also sets `RENDER_EXTERNAL_HOSTNAME` automatically at runtime —
   this project already adds it to `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS`
   for you, so the `ALLOWED_HOSTS` variable above is mostly a belt-and-
   suspenders safety net.

5. Deploy. **The free tier has no Shell access**, so `build.sh` does
   everything a shell session normally would, on every build:
   installs dependencies, runs `collectstatic`, runs `migrate`, runs
   `seed_content` (loads your original projects/experience/testimonials —
   skips if they already exist), and runs `create_admin` (creates the
   superuser from the `DJANGO_SUPERUSER_*` vars above — skips if that
   username already exists). All four are safe to re-run on every deploy.
6. Once live, visit `https://your-app-name.onrender.com/` for the site and
   `/admin/` to log in with the `DJANGO_SUPERUSER_USERNAME` /
   `DJANGO_SUPERUSER_PASSWORD` you set — uploads now go to Cloudinary, data
   to Aiven.

   You can leave the `DJANGO_SUPERUSER_*` variables set indefinitely (each
   build just confirms the user already exists and moves on), or remove
   them after the first successful deploy if you'd rather not keep the
   password sitting in an env var — just change your password from inside
   `/admin/` first if you do.

### Redeploys
Every subsequent push to your connected branch re-runs `build.sh` (install →
collectstatic → migrate → seed_content → create_admin) and restarts
gunicorn. All four management commands are idempotent, so this stays safe
and shell-free on every deploy — no manual steps for routine content or
code changes.

### A couple of free-tier things worth knowing
- No Shell access is exactly why `seed_content` and `create_admin` run
  inside `build.sh` instead of being one-off commands you'd run by hand.
- Free-tier services spin down after periods of inactivity and take a
  few seconds to wake back up on the next request — normal, not a bug.

---

## Environment variables reference

See `.env.example` for the full list with example values. Summary:

| Variable | Required? | Purpose |
|---|---|---|
| `SECRET_KEY` | Yes in prod | Django's cryptographic signing key |
| `DEBUG` | No (defaults `True`) | Set `False` in production |
| `ALLOWED_HOSTS` | Yes in prod | Comma-separated hostnames allowed to serve the app |
| `DATABASE_URL` | No (defaults to SQLite) | Aiven Postgres connection string |
| `CLOUDINARY_URL` | No (defaults to local disk) | Cloudinary connection string |
| `DJANGO_SUPERUSER_USERNAME` / `_EMAIL` / `_PASSWORD` | No | Used by `create_admin` in `build.sh` to create your admin login without shell access |
| `RENDER_EXTERNAL_HOSTNAME` | Set by Render automatically | Used to fill in `ALLOWED_HOSTS`/CSRF trust |

## Notes on what changed for this setup
- `settings.py` now reads all of the above from the environment via
  `os.environ`, with `dj-database-url` parsing `DATABASE_URL` and forcing
  SSL (`ssl_require=True`) since Aiven requires it.
- Static files (`styles.css`, `script.js`, `assets/`) are served directly
  by **WhiteNoise** — no separate static host needed.
- Media (project screenshots) use `django-cloudinary-storage`'s
  `MediaCloudinaryStorage` backend when `CLOUDINARY_URL` is set, and plain
  local disk storage otherwise — so local dev never touches Cloudinary.
- `SECURE_SSL_REDIRECT` turns on automatically once `DEBUG=False`. Render
  terminates TLS at its proxy and forwards HTTP internally, so
  `SECURE_PROXY_SSL_HEADER` is set to trust Render's
  `X-Forwarded-Proto` header — without it you'd get a redirect loop.
