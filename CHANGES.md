# Achievements / Talks & Workshops / Certifications — file changes

Drop these files into your project at the same relative paths, overwriting
what's there. One is brand new (the migration); the rest are edits to
existing files.

```
content/models.py                                    (edit — 3 new models added)
content/admin.py                                      (edit — 3 new admin registrations)
content/views.py                                      (edit — site_data() now includes them)
content/migrations/0002_achievement_certification_talk.py   (new file)
content/management/commands/seed_content.py           (edit — optional sample rows)
templates/index.html                                   (edit — 3 new sections + nav links)
static/script.js                                       (edit — 3 new render functions)
static/styles.css                                       (edit — styles for the 3 new sections)
```

## What each model looks like

**Achievement** — `title`, `description`, `date` (free text, e.g. "2024"), `order`

**Talk** (talks & workshops) — `title`, `event`, `date`, `description`,
`link` (optional — slides/recording URL), `order`

**Certification** — `title`, `issuer`, `date`, `credential_url` (optional —
verify link), `image` (optional badge/certificate image, uploads to
Cloudinary same as project images), `order`

All three follow the same pattern as your existing `Project` /
`Experience` / `Testimonial` models — same admin behavior, same JSON
shape convention, same auto-render-from-API approach on the frontend.

## After copying the files in

```bash
python manage.py makemigrations --check   # confirms migration is already up to date
python manage.py migrate                  # applies 0002_achievement_certification_talk
python manage.py seed_content             # optional — adds one sample row per section
```

On Render: just push. `build.sh` already runs `migrate` and `seed_content`
on every deploy, so nothing extra to configure there.

## Managing content
Same as everything else — log into `/admin/`. You'll see three new
sections in the sidebar: **Achievements**, **Talks & workshops**,
**Certifications**. Add/edit/delete rows, set `order` to control display
order, save — the homepage picks it up on next load via `/api/site-data/`.

## Frontend
New sections were added to the nav and the page in this order: Experience
→ **Achievements** → **Talks & Workshops** → **Certifications** →
Testimonials → Contact. If you want a different order, move the
`<section>` blocks in `index.html` and the matching `<li>` links in the
nav — nothing else depends on their position.
