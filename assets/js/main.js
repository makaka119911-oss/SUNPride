(function () {
    const year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());

    const header = document.getElementById('header');
    const scrollHint = document.querySelector('.scroll-hint');
    const isMobile = () => window.matchMedia('(max-width: 767px)').matches;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let swiper = null;

    function initSwiper() {
        if (swiper) {
            swiper.destroy(true, true);
            swiper = null;
        }

        if (isMobile() || prefersReduced || typeof Swiper === 'undefined') {
            document.body.classList.remove('fp-lock');
            return;
        }

        swiper = new Swiper('#fullpage', {
            direction: 'vertical',
            slidesPerView: 1,
            speed: 850,
            parallax: true,
            hashNavigation: { watchState: true },
            mousewheel: {
                sensitivity: 1,
                releaseOnEdges: false,
                eventsTarget: '#fullpage',
            },
            keyboard: { enabled: true, onlyInViewport: true },
            on: {
                slideChange(s) {
                    header.classList.toggle('header--solid', s.activeIndex > 0);
                    if (scrollHint) {
                        scrollHint.classList.toggle('scroll-hint--hide', s.activeIndex > 0);
                    }
                },
            },
        });

        document.body.classList.add('fp-lock');
    }

    initSwiper();
    window.addEventListener('resize', () => {
        clearTimeout(window._fpResize);
        window._fpResize = setTimeout(initSwiper, 200);
    });

    document.querySelectorAll('[data-goto]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const hash = link.getAttribute('data-goto');
            if (!hash || isMobile() || !swiper) return;
            e.preventDefault();
            const idx = Array.from(swiper.slides).findIndex(
                (s) => s.dataset.hash === hash
            );
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
            if (swiper) swiper.mousewheel.disable();
        });
    });

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.hidden = true;
        if (swiper) swiper.mousewheel.enable();
    }

    lightbox?.querySelector('[data-lightbox-close]')?.addEventListener('click', closeLightbox);
    lightbox?.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox && !lightbox.hidden) closeLightbox();
    });

    const wheelIgnore = document.querySelector('[data-slider-wheel-ignore]');
    if (wheelIgnore && swiper) {
        wheelIgnore.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });
    }
})();
