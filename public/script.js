// ========================================
// Campus Helper - Interactive Features
// ========================================

document.addEventListener('DOMContentLoaded', () => {

    // ---- Navbar scroll effect ----
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    });

    // ---- Mobile navigation toggle ----
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileToggle.classList.toggle('active');

            // Animate hamburger to X
            const spans = mobileToggle.querySelectorAll('span');
            if (mobileToggle.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // ---- Animated stat counters ----
    const statNumbers = document.querySelectorAll('.stat-number');
    const statsSection = document.getElementById('stats-section');
    let hasAnimated = false;

    function animateCounter(element, target, suffix = '') {
        const duration = 1500;
        const startTime = performance.now();
        const start = 0;

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * eased);

            element.textContent = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    function checkStatsVisibility() {
        if (hasAnimated || !statsSection) return;

        const rect = statsSection.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

        if (isVisible) {
            hasAnimated = true;

            statNumbers.forEach(stat => {
                const text = stat.textContent;
                if (text.includes('1000')) {
                    animateCounter(stat, 1000, '+');
                } else if (text.includes('500')) {
                    animateCounter(stat, 500, '+');
                } else if (text.includes('95')) {
                    animateCounter(stat, 95, '%');
                }
            });
        }
    }

    window.addEventListener('scroll', checkStatsVisibility);
    // Check on load as well
    setTimeout(checkStatsVisibility, 600);

    // ---- Smooth parallax effect on images ----
    const imageTop = document.getElementById('image-card-top');
    const imageBottom = document.getElementById('image-card-bottom');

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        const speed = 0.03;

        if (imageTop) {
            imageTop.style.transform = `translateY(${scrollY * speed}px)`;
        }
        if (imageBottom) {
            imageBottom.style.transform = `translateY(${scrollY * -speed}px)`;
        }
    });

    // ---- Close mobile menu on link click ----
    const navLinkItems = document.querySelectorAll('.nav-link, .nav-btn-signup');
    navLinkItems.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileToggle.classList.remove('active');
                const spans = mobileToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    });

    // ---- About page scroll reveal animations ----
    const revealElements = document.querySelectorAll('.about-reveal');
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }

});
