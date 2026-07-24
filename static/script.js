async function fetchSiteData() {
  try {
    const res = await fetch('/api/site-data/');
    if (!res.ok) throw new Error('Bad response from /api/site-data/: ' + res.status);
    return await res.json();
  } catch (err) {
    console.error('Failed to load portfolio content from the API:', err);
    return { projects: [], experience: [], testimonials: [], skillLevels: {} };
  }
}

document.addEventListener('DOMContentLoaded', async function () {
  // ===== RENDER CONTENT FROM the Django backend =====
  // Projects, experience and testimonials all come from /api/site-data/,
  // which is backed by the database and managed through /admin/. This runs
  // first so every other feature below — the skills auto-detection, the
  // terminal's `projects` command, and the testimonials carousel — sees the
  // real content already in the DOM.
  const siteData = await fetchSiteData();

  (function renderProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    grid.innerHTML = '';
    (siteData.projects || []).forEach(p => {
      const article = document.createElement('article');
      article.className = 'project';

      const h3 = document.createElement('h3');
      h3.textContent = p.title;

      const inner = document.createElement('div');
      inner.className = 'project-inner';

      const img = document.createElement('img');
      img.className = 'project-img';
      img.src = p.image || '';
      img.alt = (p.title || '') + ' screenshot';

      const content = document.createElement('div');
      content.className = 'project-content';

      const desc = document.createElement('p');
      desc.textContent = p.desc || '';

      const tech = document.createElement('div');
      tech.className = 'tech';
      (p.tech || []).forEach(t => {
        const span = document.createElement('span');
        span.textContent = t;
        tech.appendChild(span);
      });

      const actions = document.createElement('div');
      actions.className = 'project-actions';

      if (p.github) {
        const ghLink = document.createElement('a');
        ghLink.className = 'btn backdrop-blur-sm bg-white/5 text-white border border-white/10 hover:bg-white/10 transition';
        ghLink.href = p.github;
        ghLink.target = '_blank';
        ghLink.rel = 'noopener';
        ghLink.textContent = 'View on GitHub';
        actions.appendChild(ghLink);
      }

      const detailsLink = document.createElement('a');
      detailsLink.className = 'btn btn-ghost-blue';
      detailsLink.href = p.detailsHref || '#projects';
      detailsLink.textContent = 'View details';
      actions.appendChild(detailsLink);

      content.appendChild(desc);
      content.appendChild(tech);
      content.appendChild(actions);
      inner.appendChild(img);
      inner.appendChild(content);
      article.appendChild(h3);
      article.appendChild(inner);
      grid.appendChild(article);
    });
  })();

  (function renderExperience() {
    const list = document.getElementById('experience-list');
    if (!list) return;
    list.innerHTML = '';
    (siteData.experience || []).forEach(e => {
      const item = document.createElement('div');
      item.className = 'exp-item';

      const marker = document.createElement('div');
      marker.className = 'exp-marker';

      const content = document.createElement('div');
      content.className = 'exp-content';

      const h4 = document.createElement('h4');
      h4.textContent = e.role;

      const year = document.createElement('p');
      year.className = 'exp-year';
      year.textContent = e.year;

      const desc = document.createElement('p');
      desc.textContent = e.desc;

      content.appendChild(h4);
      content.appendChild(year);
      content.appendChild(desc);
      item.appendChild(marker);
      item.appendChild(content);
      list.appendChild(item);
    });
  })();

  (function renderTestimonials() {
    const track = document.getElementById('testimonials-track');
    if (!track) return;
    track.innerHTML = '';
    (siteData.testimonials || []).forEach((t, i) => {
      const card = document.createElement('blockquote');
      card.className = 'testimonial-card';
      card.setAttribute('data-index', String(i));

      const meta = document.createElement('div');
      meta.className = 'testimonial-meta';

      const avatar = document.createElement('div');
      avatar.className = 'avatar-initials';
      avatar.textContent = t.initials || '';

      const textWrap = document.createElement('div');

      const body = document.createElement('p');
      body.className = 'testimonial-body';
      body.textContent = '"' + t.quote + '"';

      const cite = document.createElement('cite');
      cite.textContent = '— ' + t.name + (t.title ? ', ' + t.title : '');

      textWrap.appendChild(body);
      textWrap.appendChild(cite);
      meta.appendChild(avatar);
      meta.appendChild(textWrap);
      card.appendChild(meta);
      track.appendChild(card);
    });
  })();

  (function renderAchievements() {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;
    grid.innerHTML = '';
    (siteData.achievements || []).forEach(a => {
      const card = document.createElement('div');
      card.className = 'achievement-card';

      const h4 = document.createElement('h4');
      h4.textContent = a.title;

      const desc = document.createElement('p');
      desc.textContent = a.desc || '';

      card.appendChild(h4);
      if (a.date) {
        const date = document.createElement('p');
        date.className = 'achievement-date';
        date.textContent = a.date;
        card.appendChild(date);
      }
      card.appendChild(desc);
      grid.appendChild(card);
    });
  })();

  (function renderTalks() {
    const list = document.getElementById('talks-list');
    if (!list) return;
    list.innerHTML = '';
    (siteData.talks || []).forEach(t => {
      const item = document.createElement('div');
      item.className = 'talk-item';

      const marker = document.createElement('div');
      marker.className = 'talk-marker';

      const content = document.createElement('div');
      content.className = 'talk-content';

      const h4 = document.createElement('h4');
      h4.textContent = t.title;

      const meta = document.createElement('p');
      meta.className = 'talk-meta';
      meta.textContent = [t.event, t.date].filter(Boolean).join(' — ');

      const desc = document.createElement('p');
      desc.textContent = t.desc || '';

      content.appendChild(h4);
      if (t.event || t.date) content.appendChild(meta);
      if (t.desc) content.appendChild(desc);

      if (t.link) {
        const link = document.createElement('a');
        link.className = 'talk-link';
        link.href = t.link;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = 'View slides / recording';
        content.appendChild(link);
      }

      item.appendChild(marker);
      item.appendChild(content);
      list.appendChild(item);
    });
  })();

  (function renderCertifications() {
    const grid = document.getElementById('certifications-grid');
    if (!grid) return;
    grid.innerHTML = '';
    (siteData.certifications || []).forEach(c => {
      const card = document.createElement('div');
      card.className = 'certification-card';

      if (c.image) {
        const img = document.createElement('img');
        img.className = 'certification-img';
        img.src = c.image;
        img.alt = c.title + ' badge';
        card.appendChild(img);
      }

      const h4 = document.createElement('h4');
      h4.textContent = c.title;
      card.appendChild(h4);

      const meta = document.createElement('p');
      meta.className = 'certification-meta';
      meta.textContent = [c.issuer, c.date].filter(Boolean).join(' — ');
      if (c.issuer || c.date) card.appendChild(meta);

      if (c.credentialUrl) {
        const link = document.createElement('a');
        link.className = 'certification-link';
        link.href = c.credentialUrl;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = 'Verify credential';
        card.appendChild(link);
      }

      grid.appendChild(card);
    });
  })();

  // ===== PARTICLES ANIMATION =====
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 50;
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 1.5 + 0.5;
        this.color = Math.random() > 0.5 ? 'rgba(0,255,255,' : 'rgba(255,0,255,';
        this.alpha = Math.random() * 0.5 + 0.3;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.fillStyle = this.color + this.alpha + ')';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }

  // ===== SCROLL INDICATOR =====
  const scrollIndicator = document.getElementById('scroll-indicator');
  if (scrollIndicator) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 100) {
        scrollIndicator.classList.add('hidden');
      } else {
        scrollIndicator.classList.remove('hidden');
      }
    });

    // click to scroll down
    scrollIndicator.addEventListener('click', function () {
      window.scrollBy({ top: window.innerHeight * 0.6, behavior: 'smooth' });
    });
  }

  // ===== SCROLL TO TOP BUTTON =====
  const scrollToTopBtn = document.getElementById('scroll-to-top');
  if (scrollToTopBtn) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('visible');
      } else {
        scrollToTopBtn.classList.remove('visible');
      }
    });

    scrollToTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // NAV TOGGLE (if present)
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    // Toggle menu open/close
    toggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('nav-links--open');
      // ensure aria-expanded is a string "true"/"false"
      toggle.setAttribute('aria-expanded', String(isOpen));
      // lock body scrolling when menu is open on mobile
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu when a link is clicked (mobile)
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('nav-links--open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    // Accessibility: close menu on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        navLinks.classList.remove('nav-links--open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    // Close menu when clicking/tapping outside the nav (mobile)
    document.addEventListener('click', function (e) {
      const isOpen = navLinks.classList.contains('nav-links--open');
      if (!isOpen) return;
      // if the click target is not inside the nav or the toggle, close the menu
      if (!navLinks.contains(e.target) && !toggle.contains(e.target)) {
        navLinks.classList.remove('nav-links--open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // ====== SKILLS: data, rendering and interactions ======
  const skillsGrid = document.getElementById('skills-grid');
  const skillsControls = document.getElementById('skills-controls');

  // placeholder for projects data (populated later). Declare here so skills code can reference it safely.
  let projectsData = [];

  // Build skills data from project tech tags when possible. Fallback to reasonable defaults.
  function normalizeTech(t) {
    return (t || '').toString().trim().replace(/\s+/g, ' ');
  }

  const knownLevel = {
    'JavaScript': 92,
    'TypeScript': 88,
    'React': 90,
    'Node.js': 88,
    'Python': 80,
    'Docker': 75,
    'Kubernetes': 62,
    'GraphQL': 78
  };

  function categorizeTech(name) {
    const n = (name || '').toLowerCase();
    if (/javascript|typescript|python|java|c#|c\+\+|go|rust/.test(n)) return 'Languages';
    if (/react|vue|angular|svelte|next|express|node|django|flask|graphql/.test(n)) return 'Frameworks';
    return 'Tools';
  }

  // mapping for nicer display names / normalization
  function displayTech(t) {
    const map = {
      'js': 'JavaScript',
      'javascript': 'JavaScript',
      'node': 'Node.js',
      'node.js': 'Node.js',
      'ts': 'TypeScript',
      'k8s': 'Kubernetes'
    };
    const key = t.toLowerCase();
    return map[key] || t;
  }

  // icons map: small SVG per common tech (fallback is a circle)
  const skillIcons = {
    'JavaScript': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2h20v20H2z" fill="none" stroke="currentColor" stroke-width="1" /></svg>',
    'TypeScript': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1"/></svg>',
    'React': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="2" stroke="currentColor" stroke-width="1"/><path d="M2 12c4-6 8-6 10-6s6 0 10 6" stroke="currentColor" stroke-width="1" fill="none"/></svg>',
    'Node.js': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 7v10l8 4 8-4V7l-8-4z" stroke="currentColor" stroke-width="1" fill="none"/></svg>',
    'Python': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 3h6v4" stroke="currentColor" stroke-width="1"/><path d="M18 21h-6v-4" stroke="currentColor" stroke-width="1"/></svg>',
    'Docker': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="8" width="18" height="8" rx="1" stroke="currentColor" stroke-width="1"/></svg>',
    'Kubernetes': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1"/></svg>',
    'GraphQL': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><polygon points="12,2 22,8 17,22 7,22 2,8" stroke="currentColor" stroke-width="1" fill="none"/></svg>'
  };

  let skillsData = [];
  try {
    const techSet = new Map();
    if (projectsData && projectsData.length) {
      projectsData.forEach(p => {
        (p.tech || []).forEach(raw => {
          const tNorm = normalizeTech(raw);
          if (!tNorm) return;
          const display = displayTech(tNorm);
          if (!techSet.has(display)) techSet.set(display, { name: display, count: 0 });
          techSet.get(display).count += 1;
        });
      });
    }
    // convert set to array of skills
    techSet.forEach((val, key) => {
      const name = val.name;
      const category = categorizeTech(name);
      const overrideLevel = (siteData.skillLevels || {})[name];
      const level = overrideLevel || knownLevel[name] || Math.max(65, Math.min(92, 70 + (val.count * 4)));
      skillsData.push({ name, category, level, years: undefined, tags: [name] });
    });
  } catch (err) {
    skillsData = [];
  }

  // ensure some common skills are present as fallbacks
  const ensure = ['JavaScript','React','Node.js','Python','Docker'];
  ensure.forEach(s => {
    if (!skillsData.find(x => x.name === s)) {
      skillsData.push({ name: s, category: categorizeTech(s), level: knownLevel[s] || 72, years: undefined, tags: [s] });
    }
  });

  function renderSkills(filter = 'All') {
    if (!skillsGrid) return;
    skillsGrid.innerHTML = '';
    const list = skillsData.filter(s => filter === 'All' ? true : s.category === filter);
    list.forEach(s => {
      const card = document.createElement('div');
      card.className = 'skill-card';

      const head = document.createElement('div'); head.className = 'skill-head';
  const icon = document.createElement('div'); icon.className = 'skill-icon';
  // use a specific icon if available
  icon.innerHTML = skillIcons[s.name] || '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1"/></svg>';
      const name = document.createElement('div'); name.className = 'skill-name'; name.textContent = s.name;
      head.appendChild(icon); head.appendChild(name);

      const meta = document.createElement('div'); meta.className = 'skill-meta';
      meta.textContent = (s.years ? s.years + ' yrs' : '') ;

      const barLabel = document.createElement('div'); barLabel.className = 'skill-bar-label';
      const labelLeft = document.createElement('span'); labelLeft.textContent = s.category;
      const labelRight = document.createElement('span'); labelRight.textContent = s.level + '%';
      barLabel.appendChild(labelLeft); barLabel.appendChild(labelRight);

      const bar = document.createElement('div'); bar.className = 'skill-bar';
      const fill = document.createElement('div'); fill.className = 'skill-bar-fill';
      fill.setAttribute('role','progressbar');
      fill.setAttribute('aria-valuemin','0');
      fill.setAttribute('aria-valuemax','100');
      fill.setAttribute('aria-valuenow', String(s.level));
      fill.style.width = '0%';
      // animate to target after a short delay
      setTimeout(()=>{ fill.style.width = s.level + '%'; }, 80);
      bar.appendChild(fill);

      const actions = document.createElement('div'); actions.className = 'skill-actions';
      const viewBtn = document.createElement('button');
      viewBtn.className = 'view-projects';
      viewBtn.textContent = 'Used in projects';
      // Determine if any projects match this skill's tags
      const matches = (projectsData || []).filter(p => (p.tech || []).some(t => s.tags.map(x=>x.toLowerCase()).includes((t||'').toLowerCase())));
      if (!matches.length) viewBtn.setAttribute('disabled','');
      viewBtn.addEventListener('click', function () {
        // highlight projects by the skill tags
        highlightProjects(s.tags);
      });
      actions.appendChild(viewBtn);

      card.appendChild(head);
      card.appendChild(meta);
      card.appendChild(barLabel);
      card.appendChild(bar);
      card.appendChild(actions);

      skillsGrid.appendChild(card);
    });
  }

  // build filters (attach listeners)
  if (skillsControls) {
    skillsControls.addEventListener('click', function (e) {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      const filter = btn.getAttribute('data-filter');
      // toggle active
      skillsControls.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active'); b.setAttribute('aria-selected','false');
      });
      btn.classList.add('active'); btn.setAttribute('aria-selected','true');
      renderSkills(filter);
    });
  }

  // highlight projects by tags and scroll to the first matched project
  function highlightProjects(tags) {
    if (!tags || !tags.length) return;
    const projectsContainer = document.querySelector('#projects');
    if (!projectsContainer) return;
    const nodes = Array.from(projectsContainer.querySelectorAll('.project, article'));
    const matches = nodes.filter(node => {
      const techEls = Array.from(node.querySelectorAll('.tech span, .tech li'))
        .map(n => n.textContent.trim().toLowerCase());
      return tags.some(t => techEls.includes(t.toLowerCase()));
    });
    // clear previous highlights
    nodes.forEach(n => n.classList.remove('highlight'));
    if (matches.length === 0) {
      // no matches: scroll to projects top
      const top = document.querySelector('#projects');
      if (top) top.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    // highlight matches and scroll to first
    matches.forEach(m => m.classList.add('highlight'));
    matches[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    // remove highlight after a short timeout
    setTimeout(()=>{ matches.forEach(m=>m.classList.remove('highlight')); }, 4200);
  }

  // initial render
  renderSkills('All');

  // ===== Terminal typewriter effect =====
  const termEl = document.getElementById('term-lines');
  const caret = document.getElementById('term-caret');
  const termInput = document.getElementById('term-input');

  if (termEl && caret) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lines = [
      { type: 'cmd', text: 'kimeddy@portfolio:~$ whoami' },
      { type: 'out', text: 'Kim Eddy — Futuristic Full-Stack Developer' },
      { type: 'cmd', text: 'kimeddy@portfolio:~$ skills --top' },
      { type: 'out', text: 'JavaScript • Node.js • React • Python • DevOps' },
      { type: 'cmd', text: 'kimeddy@portfolio:~$ open projects' },
      // mark this output with a link target so we can make it clickable
      { type: 'out', text: 'Showing latest projects... ', link: '#projects', linkText: 'Open projects' }
    ];

  // If reduced motion, render all lines statically
  // Disable input while intro renders, enable/focus after
  if (termInput) termInput.disabled = true;
  if (prefersReduced) {
      lines.forEach(line => {
        const div = document.createElement('div');
        div.className = 'term-line ' + (line.type === 'cmd' ? 'cmd' : 'out');
        div.textContent = line.text;
        // if the line has a link, append it
        if (line.link) {
          const a = document.createElement('a');
          a.href = line.link;
          a.className = 'term-link';
          a.textContent = line.linkText || line.link;
          a.addEventListener('click', function (ev) {
            ev.preventDefault();
            const target = document.querySelector(line.link);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
          });
          div.appendChild(document.createTextNode(' '));
          div.appendChild(a);
        }
        termEl.appendChild(div);
      });
      caret.classList.add('blink');
      // enable prompt for interaction
      if (termInput) {
        termInput.disabled = false;
        termInput.focus();
      }
      // hide the decorative typing caret since input provides native caret
      if (caret) caret.style.display = 'none';
    } else {
      // typing animation
      let lineIdx = 0;

      const typeSpeed = 28; // ms per char
      const pauseAfterLine = 700; // ms

      function typeLine(line, cb) {
        const div = document.createElement('div');
        div.className = 'term-line ' + (line.type === 'cmd' ? 'cmd' : 'out');
        termEl.appendChild(div);
        let i = 0;
        function step() {
          if (i <= line.text.length - 1) {
            div.textContent += line.text.charAt(i);
            i += 1;
            setTimeout(step, typeSpeed);
            // ensure caret visible while typing
            caret.classList.add('blink');
          } else {
            // done
            // if this line includes a link, append a clickable element after typing
            if (line.link) {
              const a = document.createElement('a');
              a.href = line.link;
              a.className = 'term-link';
              a.textContent = line.linkText || line.link;
              a.addEventListener('click', function (ev) {
                ev.preventDefault();
                const target = document.querySelector(line.link);
                if (target) target.scrollIntoView({ behavior: 'smooth' });
              });
              div.appendChild(document.createTextNode(' '));
              div.appendChild(a);
            }
            if (typeof cb === 'function') cb();
          }
        }
        step();
      }

      function runSequence() {
        if (lineIdx >= lines.length) {
          // intro finished: enable prompt and focus
          if (termInput) {
            termInput.disabled = false;
            termInput.focus();
          }
          if (caret) {
            caret.classList.add('blink');
            // hide decorative caret since input has native caret
            caret.style.display = 'none';
          }
          return;
        }
        const current = lines[lineIdx];
        typeLine(current, function () {
          lineIdx += 1;
          setTimeout(runSequence, pauseAfterLine);
        });
      }

      // kick off
      runSequence();
    }

    // --- CLI: basic interactive behavior ---
    if (termInput) {
      // session-backed history
      const STORAGE_KEY = 'terminalHistory_v1';
      let history = [];
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        history = raw ? JSON.parse(raw) : [];
      } catch (err) {
        history = [];
      }
      let histIndex = history.length;

      // autocomplete commands
      const COMMANDS = ['help','projects','open','skills','about','contact','resume','clear'];

  // try to load projects from the #projects DOM; fall back to sample data
  projectsData = (function loadProjectsFromDOM() {
        try {
          const container = document.querySelector('#projects');
          const found = [];
          if (container) {
            // look for common project item selectors
            const items = container.querySelectorAll('.project, .project-card, .project-item, article');
            items.forEach(node => {
              // title: h2/h3/h4 or data-title or first anchor text
              let titleEl = node.querySelector('h3, h2, h4');
              let title = titleEl ? titleEl.textContent.trim() : (node.getAttribute('data-title') || '').trim();
              if (!title) {
                const a = node.querySelector('a');
                if (a) title = a.textContent.trim();
              }
              // description: p or data-desc
              let descEl = node.querySelector('p');
              let desc = descEl ? descEl.textContent.trim() : (node.getAttribute('data-desc') || '').trim();
              // tech: .tech list items or data-tech
              const tech = [];
              const techNodes = node.querySelectorAll('.tech li, .tech span');
              if (techNodes && techNodes.length) {
                techNodes.forEach(tn => tech.push(tn.textContent.trim()));
              } else if (node.getAttribute('data-tech')) {
                node.getAttribute('data-tech').split(',').forEach(t => tech.push(t.trim()));
              }
              // href: first anchor href or data-href or default to #projects
              let href = '#projects';
              const linkEl = node.querySelector('a');
              if (linkEl && linkEl.getAttribute('href')) href = linkEl.getAttribute('href');
              if (title) {
                found.push({ title: title, desc: desc || '', tech: tech.length ? tech : ['Website'], href: href });
              }
            });
          }
          if (found.length) return found;
        } catch (err) {
          // ignore and fall back
        }
        // fallback sample data
        return [
          {
            title: 'Neon Tasks',
            desc: 'A realtime task manager with WebSocket sync and offline-first support.',
            tech: ['React','Node.js','WebSocket'],
            href: '#projects'
          },
          {
            title: 'Orbital UI',
            desc: 'Design system and component library for futuristic interfaces.',
            tech: ['TypeScript','Styled Components'],
            href: '#projects'
          },
          {
            title: 'Photon API',
            desc: 'High-performance GraphQL API with caching and observability.',
            tech: ['GraphQL','Kubernetes'],
            href: '#projects'
          }
        ];
      })();

        // Re-render skills now that `projectsData` is populated so buttons enable/disable correctly
        try {
          const activeBtn = document.querySelector('#skills-controls .filter-btn.active');
          const activeFilter = activeBtn ? activeBtn.getAttribute('data-filter') : 'All';
          renderSkills(activeFilter);
        } catch (err) {
          /* ignore if skills not present */
        }

      function appendLine(text, kind = 'out') {
        const d = document.createElement('div');
        d.className = 'term-line ' + (kind === 'cmd' ? 'cmd' : 'out');
        d.textContent = text;
        termEl.appendChild(d);
        // keep view scrolled to bottom
        d.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }

      function appendProjectCard(p) {
        const d = document.createElement('div');
        d.className = 'term-line out project-card';

        const title = document.createElement('div');
        title.className = 'project-title';
        title.textContent = p.title;

        const desc = document.createElement('div');
        desc.className = 'project-desc';
        desc.textContent = p.desc;

        const meta = document.createElement('div');
        meta.className = 'project-meta';
        p.tech.forEach(t => {
          const b = document.createElement('span');
          b.className = 'project-tech';
          b.textContent = t;
          meta.appendChild(b);
        });

        const link = document.createElement('a');
        link.className = 'project-link';
        link.href = p.href || '#projects';
        link.textContent = 'View →';
        link.addEventListener('click', function(ev){
          ev.preventDefault();
          if (p.href && p.href.startsWith('#')) {
            const target = document.querySelector(p.href);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
          } else if (p.href) {
            // external link: open in new tab
            window.open(p.href, '_blank', 'noopener');
          }
        });

        d.appendChild(title);
        d.appendChild(desc);
        d.appendChild(meta);
        d.appendChild(link);
        termEl.appendChild(d);
        d.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }

      function appendLinkLine(text, href, linkText) {
        const d = document.createElement('div');
        d.className = 'term-line out';
        d.textContent = text + ' ';
        const a = document.createElement('a');
        a.href = href;
        a.className = 'term-link';
        a.textContent = linkText || href;
        a.addEventListener('click', function (ev) {
          ev.preventDefault();
          const target = document.querySelector(href);
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
        d.appendChild(a);
        termEl.appendChild(d);
        d.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }

      function handleCommand(raw) {
        const cmd = (raw || '').trim();
        if (!cmd) return;
        // echo command
        appendLine('kimeddy@portfolio:~$ ' + cmd, 'cmd');

        const parts = cmd.split(/\s+/);
        const base = parts[0].toLowerCase();

        switch (base) {
          case 'help':
            appendLine('Available commands: help, projects, open <section>, skills, about, contact, resume, clear');
            break;
          case 'projects':
            appendLine('Showing projects:');
            // render project cards in-terminal
            projectsData.forEach(p => appendProjectCard(p));
            break;
          case 'open':
            if (parts[1]) {
              const target = document.querySelector('#' + parts[1]);
              if (target) {
                appendLine('Opening ' + parts[1] + '...');
                target.scrollIntoView({ behavior: 'smooth' });
              } else {
                appendLine('Section not found: ' + parts[1]);
              }
            } else {
              appendLine('Usage: open <section>');
            }
            break;
          case 'skills':
            appendLine('JavaScript • Node.js • React • Python • DevOps');
            break;
          case 'about':
            appendLine('I build futuristic web apps — scroll to About for more.');
            const about = document.querySelector('#about');
            if (about) about.scrollIntoView({ behavior: 'smooth' });
            break;
          case 'contact':
            appendLine('Email: ');
            // mailto link
            const mailDiv = document.createElement('div');
            mailDiv.className = 'term-line out';
            const mailA = document.createElement('a');
            mailA.href = 'mailto:kim@example.com';
            mailA.textContent = 'kim@example.com';
            mailA.className = 'term-link';
            mailDiv.appendChild(mailA);
            termEl.appendChild(mailDiv);
            mailDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
            break;
          case 'resume':
            appendLinkLine('Resume:', '/assets/resume.pdf', 'Download resume');
            break;
          case 'clear':
            termEl.innerHTML = '';
            break;
          default:
            appendLine("Command not found: '" + cmd + "'. Try 'help'.");
        }
      }

      // key handling (Enter, ArrowUp/Down for history, Tab for autocomplete)
      termInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          const v = termInput.value;
          // push to history (and store in sessionStorage)
          if (v.trim()) {
            history.push(v);
            histIndex = history.length;
            try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history)); } catch (err) { /* ignore */ }
          }
          handleCommand(v);
          termInput.value = '';
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (history.length === 0) return;
          histIndex = Math.max(0, (histIndex <= 0 ? history.length - 1 : histIndex - 1));
          termInput.value = history[histIndex] || '';
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (history.length === 0) return;
          histIndex = Math.min(history.length - 1, histIndex + 1);
          termInput.value = history[histIndex] || '';
        } else if (e.key === 'Tab') {
          // autocomplete
          e.preventDefault();
          const cur = termInput.value.trim();
          if (!cur) return;
          const matches = COMMANDS.filter(c => c.startsWith(cur.toLowerCase()));
          if (matches.length === 1) {
            termInput.value = matches[0] + (matches[0] === 'open' ? ' ' : ' ');
          } else if (matches.length > 1) {
            // show suggestion line
            appendLine('Suggestions: ' + matches.join(', '));
          }
        }
      });
    }
  }

  // ===== Testimonials carousel behavior =====
  (function initTestimonialsCarousel() {
    const carousel = document.getElementById('testimonials-carousel');
    const track = document.getElementById('testimonials-track');
    if (!carousel || !track) return;
    const slides = Array.from(track.children);
    if (!slides.length) return;

    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    let currentIndex = 0;
    let timer = null;
    const INTERVAL = 5000;

    function clampIndex(i) {
      const n = slides.length;
      return ((i % n) + n) % n;
    }

    function update(idx, { smooth = true } = {}) {
      idx = clampIndex(idx);
      currentIndex = idx;
      const slide = slides[idx];
      const carouselRect = carousel.getBoundingClientRect();
      const slideRect = slide.getBoundingClientRect();
      const offset = (slideRect.left - carouselRect.left) - (carouselRect.width - slideRect.width) / 2;
      if (!smooth) track.style.transition = 'none';
      requestAnimationFrame(() => {
        track.style.transform = `translateX(${-offset}px)`;
        if (!smooth) {
          requestAnimationFrame(() => { track.style.transition = ''; });
        }
      });
      slides.forEach((s, i) => s.setAttribute('aria-hidden', i === idx ? 'false' : 'true'));
    }

    function showNext() { update(currentIndex + 1); }
    function showPrev() { update(currentIndex - 1); }

    function start() { stop(); timer = setInterval(showNext, INTERVAL); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    // wire buttons
    if (nextBtn) nextBtn.addEventListener('click', () => { showNext(); start(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { showPrev(); start(); });

    // pause on hover/focus
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    carousel.addEventListener('focusin', stop);
    carousel.addEventListener('focusout', start);

    // keyboard support
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); showNext(); start(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); showPrev(); start(); }
      if (e.key === 'Home') { e.preventDefault(); update(0); start(); }
      if (e.key === 'End') { e.preventDefault(); update(slides.length - 1); start(); }
    });

    // accessibility attributes on slides
    slides.forEach((s, i) => {
      s.setAttribute('role', 'group');
      s.setAttribute('aria-roledescription', 'slide');
      s.setAttribute('aria-label', `Testimonial ${i+1} of ${slides.length}`);
      s.setAttribute('tabindex', '-1');
    });
    carousel.setAttribute('aria-live', 'polite');

    // initialize position and start
    update(0, { smooth: false });
    start();

    // recompute position on resize
    window.addEventListener('resize', () => update(currentIndex, { smooth: false }));
  })();

});
