/* ==========================================================================
   VIESTILO — ADVANCED GSAP & INTERACTIVE ANIMATIONS (ANIMATIONS.JS)
   Lenis Smooth Scroll, SplitType, Orbital Ingredients, Circular Testimonials
   ========================================================================== */

(function () {
    'use strict';

    let lenis;

    // --------------------------------------------------------------------------
    // 1. LENIS SMOOTH SCROLLING SETUP
    // --------------------------------------------------------------------------
    function initLenis() {
        if (typeof Lenis === 'undefined') return;

        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smoothTouch: true,
            touchMultiplier: 2
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        // Connect Lenis to GSAP ScrollTrigger
        if (typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);

            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });

            gsap.ticker.lagSmoothing(0);
        }
    }

    // --------------------------------------------------------------------------
    // 2. SPLIT TYPE TEXT REVEAL ANIMATIONS
    // --------------------------------------------------------------------------
    function initSplitText() {
        if (typeof SplitType === 'undefined' || typeof gsap === 'undefined') return;

        const splitElements = document.querySelectorAll('.split-text');
        
        splitElements.forEach(el => {
            const split = new SplitType(el, { types: 'words, chars' });

            gsap.from(split.chars, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 0,
                y: 40,
                rotateX: -90,
                stagger: 0.02,
                duration: 1,
                ease: 'power3.out'
            });
        });
    }

    // --------------------------------------------------------------------------
    // 3. ORBITAL INGREDIENTS SYSTEM
    // --------------------------------------------------------------------------
    function initOrbitalIngredients() {
        const orbitingContainer = document.getElementById('orbiting-container');
        const nodes = document.querySelectorAll('.orbit-node');
        const detailNote = document.getElementById('ing-detail-note');
        const detailTitle = document.getElementById('ing-detail-title');
        const detailDesc = document.getElementById('ing-detail-desc');

        if (!nodes.length) return;

        const totalNodes = nodes.length;
        let angleOffset = 0;

        // Position nodes evenly along radius rings
        function positionNodes() {
            const radiusX = window.innerWidth <= 768 ? 140 : 250;
            const radiusY = window.innerWidth <= 768 ? 95 : 155;

            nodes.forEach((node, i) => {
                const angle = (i / totalNodes) * Math.PI * 2 + angleOffset;
                const x = Math.cos(angle) * radiusX;
                const y = Math.sin(angle) * radiusY;

                node.style.transform = `translate(${x}px, ${y}px)`;
            });
        }

        // Slow orbital rotation loop
        function rotateOrbit() {
            angleOffset += 0.002;
            positionNodes();
            requestAnimationFrame(rotateOrbit);
        }

        positionNodes();
        rotateOrbit();

        // Node hover & click interactions
        nodes.forEach(node => {
            node.addEventListener('mouseenter', () => updateNodeDetail(node));
            node.addEventListener('click', () => updateNodeDetail(node));
        });

        function updateNodeDetail(node) {
            nodes.forEach(n => n.classList.remove('active'));
            node.classList.add('active');

            const name = node.getAttribute('data-name');
            const note = node.getAttribute('data-note');
            const desc = node.getAttribute('data-desc');

            if (detailNote) detailNote.textContent = note;
            if (detailTitle) detailTitle.textContent = name;
            if (detailDesc) detailDesc.textContent = desc;
        }
    }

    // --------------------------------------------------------------------------
    // 4. FRAGRANCE TIMELINE SCROLL PROGRESS & GLOWS
    // --------------------------------------------------------------------------
    function initTimelineProgress() {
        const timelineSection = document.getElementById('timeline');
        const progressLine = document.getElementById('timeline-progress');
        const timelineItems = document.querySelectorAll('.timeline-item');

        if (!timelineSection || !progressLine) return;

        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.create({
                trigger: timelineSection,
                start: 'top 70%',
                end: 'bottom 50%',
                scrub: true,
                onUpdate: (self) => {
                    progressLine.style.height = `${self.progress * 100}%`;
                }
            });

            timelineItems.forEach(item => {
                ScrollTrigger.create({
                    trigger: item,
                    start: 'top 80%',
                    onEnter: () => item.classList.add('in-view')
                });
            });
        }
    }

    // --------------------------------------------------------------------------
    // 5. GSAP COUNTER ANIMATION FOR STATISTICS
    // --------------------------------------------------------------------------
    function initCounterStats() {
        const counters = document.querySelectorAll('.counter-num');
        if (!counters.length || typeof ScrollTrigger === 'undefined') return;

        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'), 10);

            ScrollTrigger.create({
                trigger: counter,
                start: 'top 85%',
                onEnter: () => {
                    gsap.to(counter, {
                        innerText: target,
                        duration: 2,
                        ease: 'power2.out',
                        snap: { innerText: 1 }
                    });
                }
            });
        });
    }

    // --------------------------------------------------------------------------
    // 6. CIRCULAR TESTIMONIAL CAROUSEL
    // --------------------------------------------------------------------------
    function initCircularTestimonials() {
        const stage = document.getElementById('circle-stage');
        const cards = document.querySelectorAll('.testimonial-card');
        const dots = document.querySelectorAll('.circle-indicators .dot');
        const prevBtn = document.getElementById('prev-test');
        const nextBtn = document.getElementById('next-test');

        if (!cards.length) return;

        let currentIndex = 0;
        let autoRotateTimer;

        function showTestimonial(index) {
            currentIndex = (index + cards.length) % cards.length;

            cards.forEach((card, i) => {
                if (i === currentIndex) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });

            dots.forEach((dot, i) => {
                if (i === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        function startAutoRotate() {
            stopAutoRotate();
            autoRotateTimer = setInterval(() => {
                showTestimonial(currentIndex + 1);
            }, 6000);
        }

        function stopAutoRotate() {
            if (autoRotateTimer) clearInterval(autoRotateTimer);
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                showTestimonial(currentIndex - 1);
                startAutoRotate();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                showTestimonial(currentIndex + 1);
                startAutoRotate();
            });
        }

        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                showTestimonial(i);
                startAutoRotate();
            });
        });

        // Touch Swipe / Drag support for circular carousel
        let startX = 0;
        if (stage) {
            stage.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
            });

            stage.addEventListener('touchend', (e) => {
                const diffX = e.changedTouches[0].clientX - startX;
                if (Math.abs(diffX) > 40) {
                    if (diffX > 0) showTestimonial(currentIndex - 1);
                    else showTestimonial(currentIndex + 1);
                    startAutoRotate();
                }
            });
        }

        showTestimonial(0);
        startAutoRotate();
    }

    // --------------------------------------------------------------------------
    // 7. MAGNETIC BUTTON EFFECT
    // --------------------------------------------------------------------------
    function initMagneticButtons() {
        const magneticBtns = document.querySelectorAll('.magnetic-btn');

        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                gsap.to(btn, {
                    x: x * 0.35,
                    y: y * 0.35,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: 'elastic.out(1, 0.3)'
                });
            });
        });
    }

    // --------------------------------------------------------------------------
    // 8. 3D TILT EFFECT ON HOVER
    // --------------------------------------------------------------------------
    function init3DTilt() {
        const tiltCards = document.querySelectorAll('.tilt-card');

        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
            });
        });
    }

    // DOM Ready Initializer
    document.addEventListener('DOMContentLoaded', () => {
        initLenis();
        initSplitText();
        initOrbitalIngredients();
        initTimelineProgress();
        initCounterStats();
        initCircularTestimonials();
        initMagneticButtons();
        init3DTilt();
    });

})();
