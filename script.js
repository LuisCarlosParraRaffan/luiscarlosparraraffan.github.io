'use strict';

document.addEventListener('DOMContentLoaded', () => {
    initScrollProgress();
    initGridCanvas();
    initMobileNav();
    initActiveNavOnScroll();
    initCareerLedger();
    initTrajectoryFilter();
    initStudiesFilter();
    initQrToggle();
    initScrollReveal();
});

function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;

    const update = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const pct = maxScroll > 0 ? Math.min(100, (scrollTop / maxScroll) * 100) : 0;
        bar.style.width = `${pct}%`;
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
}

function initGridCanvas() {
    const canvas = document.getElementById('grid-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const hero = canvas.closest('.hero-poster');
    if (!ctx || !hero) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let phase = 0;
    let pointerX = 0.5;
    let pointerY = 0.5;
    let rafId = null;
    let isVisible = true;

    const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = hero.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        canvas.width = Math.max(1, Math.floor(width * dpr));
        canvas.height = Math.max(1, Math.floor(height * dpr));
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawFrame = () => {
        if (!width || !height) return;
        ctx.clearRect(0, 0, width, height);

        const waves = [
            { freq: 0.008, amp: 34, speed: 0.018, yRatio: 0.34, alpha: 0.2 },
            { freq: 0.011, amp: 24, speed: -0.013, yRatio: 0.42, alpha: 0.14 },
            { freq: 0.006, amp: 42, speed: 0.01, yRatio: 0.54, alpha: 0.1 }
        ];

        const modOffset = (pointerY - 0.5) * 45;

        waves.forEach((w, idx) => {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 229, 114, ${w.alpha})`;
            ctx.lineWidth = idx === 0 ? 1.15 : 0.8;

            const baseY = height * w.yRatio + modOffset * (idx + 1) * 0.35;
            for (let x = 0; x <= width; x += 10) {
                const distFromCursor = Math.abs(x / width - pointerX);
                const envelope = 1 + Math.max(0, 0.35 - distFromCursor) * 1.4;
                const y =
                    baseY +
                    Math.sin(x * w.freq + phase * (idx + 1) * 0.7) * w.amp * envelope +
                    Math.cos(x * w.freq * 0.45 - phase * 0.5) * 10;

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        });
    };

    const loop = () => {
        if (!isVisible) {
            rafId = null;
            return;
        }
        phase += 0.015;
        drawFrame();
        rafId = window.requestAnimationFrame(loop);
    };

    resize();
    drawFrame();

    window.addEventListener('resize', () => {
        resize();
        drawFrame();
    });

    if (prefersReduced) return;

    hero.addEventListener('pointermove', (event) => {
        const rect = hero.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            pointerX = (event.clientX - rect.left) / rect.width;
            pointerY = (event.clientY - rect.top) / rect.height;
        }
    });

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                isVisible = entries[0].isIntersecting;
                if (isVisible && rafId === null) {
                    rafId = window.requestAnimationFrame(loop);
                }
            },
            { threshold: 0.01 }
        );
        observer.observe(hero);
    }

    rafId = window.requestAnimationFrame(loop);
}

function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('primary-navigation');
    if (!toggle || !nav) return;

    const closeMenu = () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
    };

    toggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('nav-open', isOpen);
    });

    nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && nav.classList.contains('is-open')) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && nav.classList.contains('is-open')) {
            closeMenu();
            toggle.focus();
        }
    });
}

function initActiveNavOnScroll() {
    const navLinks = Array.from(document.querySelectorAll('.site-nav .nav-link'));
    const sections = navLinks
        .map((link) => {
            const href = link.getAttribute('href');
            return href && href.startsWith('#') ? document.querySelector(href) : null;
        })
        .filter(Boolean);

    if (!sections.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const activeId = `#${entry.target.id}`;
                navLinks.forEach((link) => {
                    link.classList.toggle('is-active', link.getAttribute('href') === activeId);
                });
            });
        },
        { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
}

function initCareerLedger() {
    const rows = document.querySelectorAll('#trajectory-list .ledger-row');
    if (!rows.length) return;

    rows.forEach((row) => {
        const trigger = row.querySelector('.ledger-trigger');
        const panel = row.querySelector('.ledger-panel');
        const icon = row.querySelector('.ledger-icon');
        if (!trigger || !panel || !icon) return;

        trigger.addEventListener('click', () => {
            const expanded = trigger.getAttribute('aria-expanded') === 'true';
            trigger.setAttribute('aria-expanded', String(!expanded));
            row.classList.toggle('is-open', !expanded);
            icon.textContent = expanded ? '+' : '−';
            if (expanded) {
                panel.setAttribute('hidden', '');
            } else {
                panel.removeAttribute('hidden');
            }
        });
    });
}

function initTrajectoryFilter() {
    const buttons = document.querySelectorAll('[data-filter-group="trajectory"]');
    const rows = document.querySelectorAll('#trajectory-list .ledger-row');
    if (!buttons.length || !rows.length) return;

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            buttons.forEach((btn) => btn.classList.toggle('is-active', btn === button));

            rows.forEach((row) => {
                const match = filter === 'all' || row.dataset.category === filter;
                row.classList.toggle('is-hidden', !match);
                if (match) row.classList.add('is-visible');
            });
        });
    });
}

function initStudiesFilter() {
    const buttons = document.querySelectorAll('[data-study-filter]');
    const rows = document.querySelectorAll('#studies-grid .swiss-row');
    if (!buttons.length || !rows.length) return;

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const topic = button.dataset.studyFilter;
            buttons.forEach((btn) => btn.classList.toggle('is-active', btn === button));

            rows.forEach((row) => {
                const match = topic === 'all' || row.dataset.studyTopic === topic;
                row.classList.toggle('is-hidden', !match);
            });
        });
    });
}

function initQrToggle() {
    const toggle = document.getElementById('qr-toggle');
    const panel = document.getElementById('qr-panel');
    if (!toggle || !panel) return;

    toggle.addEventListener('click', () => {
        const isHidden = panel.hasAttribute('hidden');
        if (isHidden) {
            panel.removeAttribute('hidden');
            toggle.setAttribute('aria-expanded', 'true');
            toggle.textContent = 'Ocultar código QR';
        } else {
            panel.setAttribute('hidden', '');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.textContent = 'Código QR';
        }
    });
}

function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !('IntersectionObserver' in window)) {
        revealEls.forEach((el) => el.classList.add('is-visible'));
        return;
    }

    const viewportBottom = window.innerHeight || document.documentElement.clientHeight;
    revealEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < viewportBottom * 0.96) {
            el.classList.add('is-visible');
        }
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.06, rootMargin: '0px 0px -24px 0px' }
    );

    revealEls.forEach((el) => {
        if (!el.classList.contains('is-visible')) {
            observer.observe(el);
        }
    });
}
