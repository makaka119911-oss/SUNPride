(function () {
    const year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());

    const header = document.getElementById('header');
    const scrollHint = document.querySelector('.scroll-hint');
    const navLinks = document.querySelectorAll('.nav a[data-goto], .mobile-nav a[data-goto]');
    const isMobile = () => window.matchMedia('(max-width: 767px)').matches;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const SLIDES = ['home', 'about', 'works', 'contact'];
    let swiper = null;

    function setActiveSlide(hash) {
        navLinks.forEach((link) => {
            link.classList.toggle('is-active', link.getAttribute('data-goto') === hash);
        });
    }

    function initSwiper() {
        if (swiper) {
            swiper.destroy(true, true);
            swiper = null;
        }

        if (isMobile() || prefersReduced || typeof Swiper === 'undefined') {
            document.body.classList.remove('fp-lock');
            initMobileObserver();
            return;
        }

        swiper = new Swiper('#fullpage', {
            direction: 'vertical',
            slidesPerView: 1,
            speed: 700,
            hashNavigation: { watchState: true },
            pagination: {
                el: '.fp-pagination',
                clickable: true,
            },
            mousewheel: {
                sensitivity: 1,
                releaseOnEdges: true,
                eventsTarget: '#fullpage',
            },
            keyboard: { enabled: true, onlyInViewport: true },
            on: {
                init(s) {
                    const hash = s.slides[s.activeIndex]?.dataset.hash || 'home';
                    setActiveSlide(hash);
                },
                slideChange(s) {
                    const hash = s.slides[s.activeIndex]?.dataset.hash || 'home';
                    header.classList.toggle('header--solid', s.activeIndex > 0);
                    setActiveSlide(hash);
                    if (scrollHint) {
                        scrollHint.classList.toggle('scroll-hint--hide', s.activeIndex > 0);
                    }
                },
            },
        });

        document.body.classList.add('fp-lock');

        const wheelIgnore = document.querySelector('[data-slider-wheel-ignore]');
        if (wheelIgnore) {
            wheelIgnore.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });
        }
    }

    function initMobileObserver() {
        if (!isMobile()) return;
        const slides = document.querySelectorAll('.fp__slide[data-hash]');
        if (!slides.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
                        const hash = entry.target.dataset.hash;
                        setActiveSlide(hash);
                        header.classList.toggle('header--solid', hash !== 'home');
                    }
                });
            },
            { threshold: [0.4, 0.6] }
        );

        slides.forEach((slide) => observer.observe(slide));
    }

    initSwiper();
    window.addEventListener('resize', () => {
        clearTimeout(window._fpResize);
        window._fpResize = setTimeout(initSwiper, 200);
    });

    document.querySelectorAll('[data-goto]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const hash = link.getAttribute('data-goto');
            if (!hash) return;

            if (isMobile() || !swiper) {
                const target = document.querySelector(`.fp__slide[data-hash="${hash}"]`);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
                return;
            }

            e.preventDefault();
            const idx = SLIDES.indexOf(hash);
            if (idx >= 0) swiper.slideTo(idx);
        });
    });

    const burger = document.querySelector('.burger');
    const mobileNav = document.getElementById('mobileNav');
    if (burger && mobileNav) {
        burger.addEventListener('click', () => {
            const open = burger.getAttribute('aria-expanded') === 'true';
            burger.setAttribute('aria-expanded', open ? 'false' : 'true');
            mobileNav.hidden = open;
        });
        mobileNav.querySelectorAll('a').forEach((a) => {
            a.addEventListener('click', () => {
                burger.setAttribute('aria-expanded', 'false');
                mobileNav.hidden = true;
            });
        });
    }

    const lightbox = document.getElementById('lightbox');
    const lbImg = lightbox?.querySelector('.lightbox__img');
    const lbCaption = lightbox?.querySelector('.lightbox__caption');

    document.querySelectorAll('[data-lightbox]').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (!lightbox || !lbImg) return;
            lbImg.src = btn.getAttribute('data-lightbox') || '';
            lbImg.alt = btn.getAttribute('data-caption') || '';
            if (lbCaption) lbCaption.textContent = btn.getAttribute('data-caption') || '';
            lightbox.hidden = false;
            if (swiper?.mousewheel) swiper.mousewheel.disable();
        });
    });

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.hidden = true;
        if (swiper?.mousewheel) swiper.mousewheel.enable();
    }

    lightbox?.querySelector('[data-lightbox-close]')?.addEventListener('click', closeLightbox);
    lightbox?.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox && !lightbox.hidden) closeLightbox();
    });
})();
