document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('themeToggle');
  const navMenu = document.getElementById('navMenu');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');
  const currentYearSpan = document.getElementById('currentYear');

  // Dynamic copyright year
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  /* --------------------------------------------------------------------------
     THEME TOGGLE & SYNCHRONIZED CSS PFP CROSSFADE
     -------------------------------------------------------------------------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  // Pre-decode avatar images to prevent initial toggle stutter
  const avatarImages = document.querySelectorAll('.avatar-img');
  avatarImages.forEach((img) => {
    if (img.complete) {
      img.decode().catch(() => {});
    } else {
      img.addEventListener('load', () => img.decode().catch(() => {}));
    }
  });

  // Detect saved preference or system theme
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme) {
    applyTheme(savedTheme);
  } else if (systemPrefersDark) {
    applyTheme('dark');
  } else {
    applyTheme('dark');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  }

  /* --------------------------------------------------------------------------
     MOBILE NAVIGATION
     -------------------------------------------------------------------------- */
  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }

  /* --------------------------------------------------------------------------
     ACTIVE SCROLL SPY & BRAND LOGO TRANSITION
     -------------------------------------------------------------------------- */
  const brandLogo = document.getElementById('brandLogo');
  const aboutSection = document.getElementById('about');

  function checkBrandLogoTransition() {
    if (aboutSection && brandLogo) {
      const aboutBottom = aboutSection.offsetTop + aboutSection.offsetHeight - 160;
      if (window.pageYOffset > aboutBottom) {
        brandLogo.classList.add('scrolled-past-about');
      } else {
        brandLogo.classList.remove('scrolled-past-about');
      }
    }
  }

  window.addEventListener('scroll', () => {
    let currentSectionId = '';
    const scrollPosition = window.pageYOffset + 140;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });

    checkBrandLogoTransition();
  });

  checkBrandLogoTransition();

  /* --------------------------------------------------------------------------
     SLIDING NAV INDICATOR (DESKTOP)
     -------------------------------------------------------------------------- */
  const navMenuContainer = document.getElementById('navMenu');
  if (navMenuContainer) {
    let indicator = navMenuContainer.querySelector('.nav-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'nav-indicator';
      navMenuContainer.insertBefore(indicator, navMenuContainer.firstChild);
    }

    function updateNavIndicator(targetEl) {
      if (window.innerWidth <= 768) {
        indicator.style.opacity = '0';
        return;
      }

      const activeEl = targetEl || navMenuContainer.querySelector('.nav-link.active');
      if (activeEl) {
        const menuRect = navMenuContainer.getBoundingClientRect();
        const linkRect = activeEl.getBoundingClientRect();
        const leftOffset = linkRect.left - menuRect.left;

        indicator.style.width = `${linkRect.width}px`;
        indicator.style.transform = `translate3d(${leftOffset}px, -50%, 0)`;
        indicator.style.opacity = '1';
      } else {
        indicator.style.opacity = '0';
      }
    }

    window.addEventListener('resize', () => updateNavIndicator());

    const navObserver = new MutationObserver(() => updateNavIndicator());
    navLinks.forEach((link) => {
      navObserver.observe(link, { attributes: true, attributeFilter: ['class'] });
    });

    setTimeout(() => updateNavIndicator(), 150);
  }

  /* --------------------------------------------------------------------------
     JSON CONTENT SYNC (content/sectionname.json)
     -------------------------------------------------------------------------- */
  async function loadSectionContent() {
    const sectionList = ['about', 'experience', 'projects', 'skills', 'certifications', 'contact'];

    for (const sec of sectionList) {
      try {
        const response = await fetch(`content/${sec}.json`);
        if (!response.ok) continue;
        const data = await response.json();

        switch (sec) {
          case 'about':
            renderAbout(data);
            break;
          case 'experience':
            renderExperience(data);
            break;
          case 'projects':
            renderProjects(data);
            break;
          case 'skills':
            renderSkills(data);
            break;
          case 'certifications':
            renderCertifications(data);
            break;
          case 'contact':
            renderContact(data);
            break;
        }
      } catch (err) {
        // Fallback gracefully to static HTML if fetching fails
      }
    }
  }

  function renderAbout(data) {
    const section = document.getElementById('about');
    if (!section) return;

    const eyebrow = section.querySelector('.eyebrow');
    if (eyebrow && data.eyebrow) {
      eyebrow.innerHTML = `<i class="fa-solid fa-terminal"></i> ${data.eyebrow}`;
    }

    const name = section.querySelector('.about-name');
    if (name && data.name) name.textContent = data.name;

    const role = section.querySelector('.about-role');
    if (role && data.title) role.textContent = data.title;

    const summary = section.querySelector('.about-summary');
    if (summary && data.summary) summary.textContent = data.summary;

    if (data.ctaPrimary) {
      const ctaPrimary = section.querySelector('.about-cta-group .btn-primary');
      if (ctaPrimary) {
        ctaPrimary.href = data.ctaPrimary.href;
        ctaPrimary.innerHTML = `<span>${data.ctaPrimary.text}</span> <i class="fa-solid fa-arrow-down-long"></i>`;
      }
    }

    if (data.ctaSecondary) {
      const ctaSecondary = section.querySelector('.about-cta-group .btn-secondary');
      if (ctaSecondary) {
        ctaSecondary.href = data.ctaSecondary.href || 'Rowell_Cruz_CV.pdf';
        if (data.ctaSecondary.download) {
          ctaSecondary.setAttribute('download', typeof data.ctaSecondary.download === 'string' ? data.ctaSecondary.download : 'Rowell_Cruz_CV.pdf');
        } else {
          ctaSecondary.removeAttribute('download');
        }
        if (data.ctaSecondary.target) {
          ctaSecondary.setAttribute('target', data.ctaSecondary.target);
          ctaSecondary.setAttribute('rel', 'noopener noreferrer');
        }
        const iconClass = data.ctaSecondary.icon || 'fa-solid fa-download';
        ctaSecondary.innerHTML = `<i class="${iconClass}"></i> ${data.ctaSecondary.text}`;
      }
    }

    if (data.socials) {
      const socialsContainer = section.querySelector('.about-socials');
      if (socialsContainer) {
        socialsContainer.innerHTML = data.socials.map((s) => {
          const isExternal = s.url.startsWith('http://') || s.url.startsWith('https://');
          const targetAttr = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';
          return `<a href="${s.url}" ${targetAttr} aria-label="${s.name}"><i class="${s.icon}"></i></a>`;
        }).join('');
      }
    }
  }

  function renderExperience(data) {
    const section = document.getElementById('experience');
    if (!section) return;

    const eyebrow = section.querySelector('.eyebrow');
    if (eyebrow && data.eyebrow) eyebrow.textContent = data.eyebrow;

    const title = section.querySelector('.section-title');
    if (title && data.title) title.textContent = data.title;

    if (data.items) {
      const timeline = section.querySelector('.timeline');
      if (timeline) {
        timeline.innerHTML = data.items.map((item) => `
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-card">
              <div class="card-meta">
                <span class="company-name"><i class="fa-regular fa-building"></i> ${item.company}</span>
                <span class="timeline-date"><i class="fa-regular fa-calendar"></i> ${item.date}</span>
              </div>
              <h3 class="role-title">${item.role}</h3>
              ${item.responsibilities ? `
                <ul class="experience-list">
                  ${item.responsibilities.map((resp) => `<li><i class="fa-solid fa-check"></i> ${resp}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          </div>
        `).join('');
      }
    }
  }

  function renderProjects(data) {
    const section = document.getElementById('projects');
    if (!section) return;

    const eyebrow = section.querySelector('.eyebrow');
    if (eyebrow && data.eyebrow) eyebrow.textContent = data.eyebrow;

    const title = section.querySelector('.section-title');
    if (title && data.title) title.textContent = data.title;

    if (data.items) {
      const grid = section.querySelector('.grid');
      if (grid) {
        grid.innerHTML = data.items.map((item) => `
          <div class="card project-card">
            <div class="project-header">
              <div class="folder-icon"><i class="fa-regular fa-folder-open"></i></div>
              <div class="project-links">
                <a href="${item.githubUrl || '#'}" target="_blank" rel="noopener noreferrer" aria-label="GitHub Source"><i class="fa-brands fa-github"></i></a>
                <a href="${item.demoUrl || '#'}" target="_blank" rel="noopener noreferrer" aria-label="Live Demo"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
              </div>
            </div>
            <h3 class="card-title">${item.title}</h3>
            <p class="card-text">${item.description}</p>
            <div class="tag-cloud">
              ${item.technologies.map((tech) => `<span class="badge">${tech}</span>`).join('')}
            </div>
          </div>
        `).join('');
      }
    }
  }

  function renderSkills(data) {
    const section = document.getElementById('skills');
    if (!section) return;

    const eyebrow = section.querySelector('.eyebrow');
    if (eyebrow && data.eyebrow) eyebrow.textContent = data.eyebrow;

    const title = section.querySelector('.section-title');
    if (title && data.title) title.textContent = data.title;

    if (data.categories) {
      const grid = section.querySelector('.grid');
      if (grid) {
        grid.innerHTML = data.categories.map((cat) => `
          <div class="card skill-card">
            <div class="skill-head">
              <i class="${cat.icon} category-icon"></i>
              <h3 class="card-title">${cat.title}</h3>
            </div>
            <ul class="skill-list">
              ${cat.skills.map((skill) => `<li><i class="fa-solid fa-check"></i> ${skill}</li>`).join('')}
            </ul>
          </div>
        `).join('');
      }
    }
  }

  function renderCertifications(data) {
    const section = document.getElementById('certifications');
    if (!section) return;

    const eyebrow = section.querySelector('.eyebrow');
    if (eyebrow && data.eyebrow) eyebrow.textContent = data.eyebrow;

    const title = section.querySelector('.section-title');
    if (title && data.title) title.textContent = data.title;

    if (data.items) {
      const grid = section.querySelector('.grid');
      if (grid) {
        grid.innerHTML = data.items.map((item) => `
          <div class="card cert-card">
            <div class="cert-icon-wrap">
              <i class="${item.icon}"></i>
            </div>
            <div class="cert-info">
              <h3 class="card-title">${item.title}</h3>
              <p class="cert-issuer">${item.issuer}</p>
              <p class="cert-date">${item.date}</p>
            </div>
          </div>
        `).join('');
      }
    }
  }

  function renderContact(data) {
    const section = document.getElementById('contact');
    if (!section) return;

    const eyebrow = section.querySelector('.eyebrow');
    if (eyebrow && data.eyebrow) eyebrow.textContent = data.eyebrow;

    const title = section.querySelector('.section-title');
    if (title && data.title) title.textContent = data.title;

    const subtitle = section.querySelector('.section-subtitle');
    if (subtitle && data.subtitle) subtitle.textContent = data.subtitle;

    if (data.items) {
      const grid = section.querySelector('.contact-list-grid');
      if (grid) {
        grid.innerHTML = data.items.map((item) => {
          if (item.url) {
            const isExternal = item.url.startsWith('http://') || item.url.startsWith('https://');
            const targetAttr = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';
            return `
              <a href="${item.url}" ${targetAttr} class="card contact-item-card contact-link-card">
                <div class="contact-icon-box">
                  <i class="${item.icon}"></i>
                </div>
                <div class="contact-details">
                  <span class="contact-label">${item.label}</span>
                  <span class="contact-value">${item.value}</span>
                </div>
                <i class="fa-solid fa-arrow-up-right-from-square card-external-icon"></i>
              </a>
            `;
          } else {
            return `
              <div class="card contact-item-card">
                <div class="contact-icon-box">
                  <i class="${item.icon}"></i>
                </div>
                <div class="contact-details">
                  <span class="contact-label">${item.label}</span>
                  <span class="contact-value">${item.value}</span>
                </div>
              </div>
            `;
          }
        }).join('');
      }
    }
  }

  // Trigger JSON content synchronization
  loadSectionContent();
});