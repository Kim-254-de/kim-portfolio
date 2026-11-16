# Portfolio — Django backend

Content lives in a database, editing happens through Django's built-in
admin (with login), and project screenshots are uploaded as real files.
This version is set up to run:
- **locally** with SQLite + local file storage — no accounts or env vars needed, or
- **in production** on **Railway** (app + Postgres), with images on **Cloudinary**.
  Live at https://emmanuel-kimathi.tech (Railway address:
  https://web-production-0d7452f0.up.railway.app).

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
Procfile                → start command (gunicorn); Railway's service settings mirror it
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

## 2. Set up Cloudinary (image storage)

Railway's disk is wiped on every deploy, so uploaded images must live on
Cloudinary.

1. Create a free Cloudinary account.
2. On your Cloudinary **Dashboard**, find **API Environment variable**
   under Account Details — it's a single string:
   ```
   CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
   ```
3. Copy the whole `cloudinary://...` value (without the `CLOUDINARY_URL=`
   prefix) — that's what goes into Railway as `CLOUDINARY_URL`.

Once this is set, every image uploaded through `/admin/` is stored on
Cloudinary instead of local disk, and `content.image.url` in the API
response points straight at Cloudinary's CDN.

## 3. Deploy on Railway

The live project is **kim-portfolio** on Railway, with two services:
**Postgres** (from Railway's Postgres template) and **web** (this repo,
`main` branch). Every push to `main` deploys automatically.

To recreate it from scratch:

1. **New Project → Deploy PostgreSQL**.
2. **New → GitHub Repo →** this repo, branch `main`. Railway's builder
   (Railpack) detects Python from `requirements.txt`.
3. In the web service's **Settings**:
   - **Start command:**
     ```
     sh -c "python manage.py collectstatic --noinput && gunicorn portfolio_backend.wsgi:application --bind 0.0.0.0:$PORT"
     ```
   - **Pre-deploy command** (runs before each deploy, with database access):
     ```
     sh -c 'python manage.py migrate --noinput && python manage.py create_admin && if [ -n "$CLOUDINARY_URL" ]; then python manage.py seed_content; else echo "CLOUDINARY_URL not set: skipping seed_content until images have permanent storage"; fi'
     ```
     `seed_content` waits for `CLOUDINARY_URL` on purpose: it only seeds
     projects once, and without Cloudinary their images would be saved to
     a disk that's thrown away.
   - **Networking → Generate Domain** for a `*.up.railway.app` address.
4. Under **Variables**, add:

   | Key | Value |
   |---|---|
   | `SECRET_KEY` | generate one — e.g. `python -c "import secrets; print(secrets.token_urlsafe(50))"` |
   | `DEBUG` | `False` |
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (a reference to the Postgres service) |
   | `ALLOWED_HOSTS` | every hostname the site answers on, comma-separated: `web-production-0d7452f0.up.railway.app,emmanuel-kimathi.tech,www.emmanuel-kimathi.tech` |
   | `CLOUDINARY_URL` | your Cloudinary URL from step 2 |
   | `DJANGO_SUPERUSER_USERNAME` | your chosen admin username |
   | `DJANGO_SUPERUSER_EMAIL` | your email |
   | `DJANGO_SUPERUSER_PASSWORD` | a strong password |

   List the `*.up.railway.app` address explicitly: Railway's
   `RAILWAY_PUBLIC_DOMAIN` can switch to a custom domain once one is
   attached, and any hostname missing from `ALLOWED_HOSTS` gets a 400.
   Every allowed host is trusted for CSRF over HTTPS, so admin logins work
   on each domain.

5. Once live, visit the site and `/admin/` to log in with the
   `DJANGO_SUPERUSER_*` credentials. You can leave those variables set
   (`create_admin` skips once the user exists) or remove them after the
   first deploy — change your password inside `/admin/` first if you do.

### Custom domain

The service has `emmanuel-kimathi.tech` and `www.emmanuel-kimathi.tech`
attached under **Settings → Networking**. Railway shows the exact DNS
records to add at your DNS provider for each one: a `CNAME` for the
traffic and a `_railway-verify` `TXT` record for ownership. A `CNAME` on
the bare (apex) domain needs a DNS provider that supports CNAME
flattening or `ALIAS` records (e.g. Cloudflare). Railway issues the HTTPS
certificate once the records resolve.

### Redeploys
Every push to `main` rebuilds, runs the pre-deploy command (migrate →
create_admin → seed_content) and restarts gunicorn. All three management
commands are idempotent, so this is safe on every deploy.

---

## Environment variables reference

See `.env.example` for the full list with example values. Summary:

| Variable | Required? | Purpose |
|---|---|---|
| `SECRET_KEY` | Yes in prod | Django's cryptographic signing key |
| `DEBUG` | No (defaults `True`) | Set `False` in production |
| `ALLOWED_HOSTS` | Yes for custom domains | Comma-separated hostnames allowed to serve the app (also trusted for CSRF) |
| `CSRF_TRUSTED_ORIGINS` | No | Extra origins to trust beyond `ALLOWED_HOSTS` |
| `DATABASE_URL` | No (defaults to SQLite) | Postgres connection string |
| `CLOUDINARY_URL` | No (defaults to local disk) | Cloudinary connection string |
| `DJANGO_SUPERUSER_USERNAME` / `_EMAIL` / `_PASSWORD` | No | Used by `create_admin` (pre-deploy) to create your admin login |
| `RAILWAY_PUBLIC_DOMAIN` | Set by Railway automatically | Fallback addition to `ALLOWED_HOSTS`/CSRF trust |

## Notes on what changed for this setup
- `settings.py` now reads all of the above from the environment via
  `os.environ`, with `dj-database-url` parsing `DATABASE_URL` and forcing
  SSL (`ssl_require=True`).
- Static files (`styles.css`, `script.js`, `assets/`) are served directly
  by **WhiteNoise** — no separate static host needed.
- Media (project screenshots) use `django-cloudinary-storage`'s
  `MediaCloudinaryStorage` backend when `CLOUDINARY_URL` is set, and plain
  local disk storage otherwise — so local dev never touches Cloudinary.
- `SECURE_SSL_REDIRECT` turns on automatically once `DEBUG=False`. Railway
  terminates TLS at its proxy and forwards HTTP internally, so
  `SECURE_PROXY_SSL_HEADER` is set to trust the proxy's
  `X-Forwarded-Proto` header — without it you'd get a redirect loop.
