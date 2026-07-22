from django.contrib import admin
from django.utils.html import format_html
from .models import Project, Experience, Testimonial, SkillOverride


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'order', 'thumb', 'github_url')
    list_editable = ('order',)
    ordering = ('order',)
    search_fields = ('title', 'tech')

    def thumb(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:36px;border-radius:4px;">', obj.image.url)
        return '—'
    thumb.short_description = 'Preview'


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ('role', 'year_range', 'order')
    list_editable = ('order',)
    ordering = ('order',)


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('name', 'title', 'initials', 'order')
    list_editable = ('order',)
    ordering = ('order',)


@admin.register(SkillOverride)
class SkillOverrideAdmin(admin.ModelAdmin):
    list_display = ('name', 'level')
