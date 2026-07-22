from django.http import JsonResponse
from django.views.decorators.http import require_GET
from .models import Project, Experience, Testimonial, SkillOverride


@require_GET
def site_data(request):
    """
    Returns all portfolio content as JSON, in the same shape the frontend
    previously read from data.js:
    { projects: [...], experience: [...], testimonials: [...], skillLevels: {...} }
    """
    projects = [
        {
            'title': p.title,
            'image': p.image.url if p.image else '',
            'desc': p.description,
            'tech': p.tech_list(),
            'github': p.github_url,
        }
        for p in Project.objects.all()
    ]

    experience = [
        {
            'role': e.role,
            'year': e.year_range,
            'desc': e.description,
        }
        for e in Experience.objects.all()
    ]

    testimonials = [
        {
            'initials': t.initials,
            'quote': t.quote,
            'name': t.name,
            'title': t.title,
        }
        for t in Testimonial.objects.all()
    ]

    skill_levels = {s.name: s.level for s in SkillOverride.objects.all()}

    return JsonResponse({
        'projects': projects,
        'experience': experience,
        'testimonials': testimonials,
        'skillLevels': skill_levels,
    })
