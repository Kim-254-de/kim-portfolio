from django.db import models


class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='projects/', blank=True, null=True)
    tech = models.CharField(
        max_length=300, blank=True,
        help_text="Comma-separated tech tags, e.g. React, Node.js, MongoDB"
    )
    github_url = models.URLField(blank=True)
    order = models.PositiveIntegerField(
        default=0, help_text="Lower numbers appear first."
    )

    class Meta:
        ordering = ['order', 'id']

    def tech_list(self):
        return [t.strip() for t in self.tech.split(',') if t.strip()]

    def __str__(self):
        return self.title


class Experience(models.Model):
    role = models.CharField(
        max_length=200, help_text="e.g. Senior Full-Stack Engineer — Stellar Labs"
    )
    year_range = models.CharField(
        max_length=100, help_text="e.g. 2023 — Present"
    )
    description = models.TextField()
    order = models.PositiveIntegerField(
        default=0, help_text="Lower numbers appear first."
    )

    class Meta:
        ordering = ['order', 'id']
        verbose_name_plural = "Experience entries"

    def __str__(self):
        return self.role


class Testimonial(models.Model):
    initials = models.CharField(max_length=5, help_text="Shown in the avatar circle, e.g. AM")
    quote = models.TextField()
    name = models.CharField(max_length=150)
    title = models.CharField(max_length=150, blank=True, help_text="Their role, e.g. Product Lead")
    order = models.PositiveIntegerField(
        default=0, help_text="Lower numbers appear first."
    )

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.name


class SkillOverride(models.Model):
    """
    Optional. Skills are auto-detected from every Project's tech tags.
    Add a row here only to force a specific proficiency % instead of the
    auto-estimate -- the name must match a tech tag exactly (e.g. "React").
    """
    name = models.CharField(
        max_length=100, unique=True,
        help_text="Must match a project tech tag exactly, e.g. React"
    )
    level = models.PositiveIntegerField(help_text="Proficiency percentage, 0-100")

    class Meta:
        verbose_name = "Skill override"

    def __str__(self):
        return f"{self.name}: {self.level}%"
