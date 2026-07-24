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


class Achievement(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    date = models.CharField(max_length=100, blank=True, help_text="e.g. 2024 or March 2024")
    order = models.PositiveIntegerField(
        default=0, help_text="Lower numbers appear first."
    )

    class Meta:
        ordering = ['order', 'id']
        verbose_name_plural = "Achievements"

    def __str__(self):
        return self.title


class Talk(models.Model):
    title = models.CharField(max_length=200, help_text="Talk or workshop title")
    event = models.CharField(max_length=200, blank=True, help_text="e.g. PyCon Kenya 2024")
    date = models.CharField(max_length=100, blank=True, help_text="e.g. March 2024")
    description = models.TextField(blank=True)
    link = models.URLField(blank=True, help_text="Slides, recording, or event page")
    order = models.PositiveIntegerField(
        default=0, help_text="Lower numbers appear first."
    )

    class Meta:
        ordering = ['order', 'id']
        verbose_name_plural = "Talks & workshops"

    def __str__(self):
        return self.title


class Certification(models.Model):
    title = models.CharField(max_length=200)
    issuer = models.CharField(max_length=200, blank=True)
    date = models.CharField(max_length=100, blank=True, help_text="e.g. 2024")
    credential_url = models.URLField(blank=True, help_text="Link to verify the credential")
    image = models.ImageField(
        upload_to='certifications/', blank=True, null=True,
        help_text="Badge or certificate image"
    )
    order = models.PositiveIntegerField(
        default=0, help_text="Lower numbers appear first."
    )

    class Meta:
        ordering = ['order', 'id']
        verbose_name_plural = "Certifications"

    def __str__(self):
        return self.title
