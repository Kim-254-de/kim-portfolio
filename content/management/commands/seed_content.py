from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand

from content.models import Project, Experience, Testimonial

SEED_IMAGES_DIR = Path(__file__).resolve().parent.parent.parent / 'seed_data' / 'images'

PROJECTS = [
    dict(
        title='Evoting System',
        image='evoting-1.png',
        desc='An end-to-end electronic voting system with secure authentication, real-time tallying, and an admin dashboard for managing elections. Built with a focus on accessibility and auditability.',
        tech='React, Node.js, MongoDB, WebSocket',
        github='https://github.com/Kim-254-de/VotingSystem',
        order=1,
    ),
    dict(
        title='Agriculture AI Marketplace',
        image='agri-ecom.png',
        desc='An agriculture e-commerce platform with integrated AI insights for crop recommendations, pricing signals and supply-chain forecasting tailored for farmers and buyers.',
        tech='React, Node.js, TensorFlow, Postgres',
        github='https://github.com/Elias-te/agricoolo',
        order=2,
    ),
    dict(
        title='Competency AI Learning',
        image='ai-learning.png',
        desc='An AI-powered competency-based learning platform that personalizes learning paths and assesses skills using adaptive algorithms and analytics.',
        tech='Python, FastAPI, ML, Postgres',
        github='https://github.com/Kim-254-de/LearningSystem',
        order=3,
    ),
    dict(
        title='Campus Shop',
        image='campus-shop.png',
        desc='Online shopping system for campus students featuring campus-wide delivery, student discounts and an intuitive checkout flow for quick purchases.',
        tech='Vue, Node.js, Firebase',
        github='https://github.com/Kim-254-de/Online-shopping-system',
        order=4,
    ),
]

EXPERIENCE = [
    dict(
        role='Senior Full-Stack Engineer — Stellar Labs',
        year='2023 — Present',
        desc='Leading the front-end architecture and building scalable React applications with strong emphasis on performance and observability.',
    ),
    dict(
        role='Software Engineer — NovaTech',
        year='2020 — 2023',
        desc='Worked across the stack on microservices, GraphQL APIs and developer tooling to accelerate delivery across teams.',
    ),
    dict(
        role='Front-end Developer — Pixel Guild',
        year='2018 — 2020',
        desc='Built responsive UI components and early prototypes that evolved into the company design system.',
    ),
]

TESTIMONIALS = [
    dict(
        initials='AM',
        quote="Emmanuel's AI integration transformed our workflow — faster insights and smarter recommendations.",
        name='Alex Maina',
        title='Product Lead',
    ),
    dict(
        initials='JO',
        quote='The competency learning platform was a game-changer for our training program.',
        name="Jamie Ochieng'",
        title='L&D Manager',
    ),
    dict(
        initials='KM',
        quote='Responsive, thoughtful design and clear technical leadership throughout the project.',
        name='K. Mensah',
        title='CTO',
    ),
]


class Command(BaseCommand):
    help = 'Seed the database with the original portfolio content. Skips anything that already exists.'

    def handle(self, *args, **options):
        if not Project.objects.exists():
            for p in PROJECTS:
                obj = Project(
                    title=p['title'],
                    description=p['desc'],
                    tech=p['tech'],
                    github_url=p['github'],
                    order=p['order'],
                )
                image_path = SEED_IMAGES_DIR / p['image']
                if image_path.exists():
                    with open(image_path, 'rb') as f:
                        obj.image.save(p['image'], File(f), save=False)
                obj.save()
                self.stdout.write(f"Created project: {obj.title}")
        else:
            self.stdout.write(self.style.WARNING('Projects already exist — skipping.'))

        if not Experience.objects.exists():
            for i, e in enumerate(EXPERIENCE, start=1):
                Experience.objects.create(
                    role=e['role'], year_range=e['year'], description=e['desc'], order=i
                )
                self.stdout.write(f"Created experience: {e['role']}")
        else:
            self.stdout.write(self.style.WARNING('Experience entries already exist — skipping.'))

        if not Testimonial.objects.exists():
            for i, t in enumerate(TESTIMONIALS, start=1):
                Testimonial.objects.create(
                    initials=t['initials'], quote=t['quote'], name=t['name'], title=t['title'], order=i
                )
                self.stdout.write(f"Created testimonial: {t['name']}")
        else:
            self.stdout.write(self.style.WARNING('Testimonials already exist — skipping.'))

        self.stdout.write(self.style.SUCCESS('Seed complete.'))
