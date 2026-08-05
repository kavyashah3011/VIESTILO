/* ==========================================================================
   VIESTILO — APPLE-GRADE FRAME SEQUENCE PLAYER (SCROLL-VIDEO.JS)
   Dedicated FrameSequencePlayer Class with Preloader, Cover Math & Smooth LERP
   ========================================================================== */

class FrameSequencePlayer {
    constructor(options = {}) {
        this.frameCount = options.frameCount || 240;
        this.frameDir = options.frameDir || 'assets/frames/';
        this.canvas = document.getElementById(options.canvasId || 'hero-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.heroSection = document.getElementById(options.heroId || 'hero-section');
        this.loaderOverlay = document.getElementById(options.loaderId || 'canvas-loader');
        this.loadProgressText = document.getElementById(options.progressId || 'load-progress');
        this.scrollFill = document.getElementById(options.scrollFillId || 'scroll-fill');

        // Story overlay containers
        this.storySteps = {
            1: document.getElementById('story-step-1'),
            2: document.getElementById('story-step-2'),
            3: document.getElementById('story-step-3'),
            4: document.getElementById('story-step-4')
        };

        // Frame state
        this.currentFrame = 0;
        this.targetFrame = 0;
        this.framesCache = new Array(this.frameCount);
        this.loadedCount = 0;
        this.isReady = false;
        this.currentProgress = 0;

        // Bindings
        this.animate = this.animate.bind(this);
        this.handleResize = this.handleResize.bind(this);

        this.init();
    }

    // Zero-padded filename generator (0-indexed -> 1-indexed filename)
    getFramePath(index) {
        const frameNum = String(index + 1).padStart(6, '0');
        return `${this.frameDir}frame_${frameNum}.webp`;
    }

    init() {
        // Step 1: Preload frame 0 immediately and draw it on canvas
        const firstImg = new Image();
        firstImg.src = this.getFramePath(0);
        
        firstImg.onload = () => {
            this.framesCache[0] = firstImg;
            this.drawFrame(0); // Draw first frame immediately
            this.loadedCount++;
            
            // Step 2: Start loading remaining frames progressively
            this.preloadAllFrames();
        };

        firstImg.onerror = (err) => {
            console.error('Failed to load initial frame_000001.webp', err);
        };

        // Handle resize events
        window.addEventListener('resize', this.handleResize);
        
        // Start LERP animation loop
        requestAnimationFrame(this.animate);
    }

    // Preload remaining frames
    preloadAllFrames() {
        const promises = [];

        for (let i = 1; i < this.frameCount; i++) {
            const promise = new Promise((resolve) => {
                const img = new Image();
                img.src = this.getFramePath(i);

                img.onload = () => {
                    this.framesCache[i] = img;
                    this.loadedCount++;
                    this.updateProgress();
                    resolve(img);
                };

                img.onerror = () => {
                    console.warn(`Frame ${i + 1} failed to load.`);
                    this.loadedCount++;
                    this.updateProgress();
                    resolve(null);
                };
            });

            promises.push(promise);
        }

        // When all frames loaded or threshold reached, enable scroll
        Promise.all(promises).then(() => {
            this.onAllLoaded();
        });
    }

    updateProgress() {
        const percent = Math.round((this.loadedCount / this.frameCount) * 100);
        if (this.loadProgressText) {
            this.loadProgressText.textContent = `${percent}%`;
        }

        // Enable experience when threshold reached
        if (this.loadedCount >= 40 && !this.isReady) {
            this.revealExperience();
        }
    }

    onAllLoaded() {
        if (!this.isReady) {
            this.revealExperience();
        }
    }

    revealExperience() {
        this.isReady = true;
        
        // Remove loading state from body to unlock scrolling
        document.body.classList.remove('loading');
        
        if (this.loaderOverlay) {
            this.loaderOverlay.classList.add('loaded');
        }

        // Bind GSAP ScrollTrigger
        this.initScrollTrigger();
    }

    // Exact Apple-style cover canvas math
    drawFrame(index) {
        const roundedIndex = Math.max(0, Math.min(this.frameCount - 1, Math.round(index)));
        const img = this.framesCache[roundedIndex];

        if (!img) return;

        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;

        if (this.canvas.width !== width * dpr || this.canvas.height !== height * dpr) {
            this.canvas.width = width * dpr;
            this.canvas.height = height * dpr;
        }

        this.ctx.save();
        this.ctx.scale(dpr, dpr);

        // Exact object-fit: cover scaling
        const scale = Math.max(width / img.width, height / img.height);
        const x = (width - img.width * scale) / 2;
        const y = (height - img.height * scale) / 2;

        this.ctx.clearRect(0, 0, width, height);
        this.ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        this.ctx.restore();

        // Update active frame story overlays & navbar reveal state
        this.updateStoryOverlays(roundedIndex);
    }

    updateStoryOverlays(frame) {
        const navbar = document.getElementById('navbar');

        // Check if user has scrolled past hero section into collection section
        const collectionSection = document.getElementById('collection');
        const collectionTop = collectionSection ? collectionSection.getBoundingClientRect().top : 1000;
        const isPastHero = collectionTop <= window.innerHeight * 0.5;

        // Frame ranges (Minimal single-line luxury reveals):
        // 10 - 65: Step 1 (Living In Style.)
        // 65 - 125: Step 2 (Grasse & Mysore Accords.)
        // 125 - 185: Step 3 (12+ Hours Persistence.)
        // 185 - 240: Step 4 (Own Your Signature.)
        let activeStep = 0;

        if (frame >= 10 && frame < 65) {
            activeStep = 1;
        } else if (frame >= 65 && frame < 125) {
            activeStep = 2;
        } else if (frame >= 125 && frame < 185) {
            activeStep = 3;
        } else if (frame >= 185 && frame <= 240) {
            activeStep = 4;
        }

        // Toggle active story step overlay
        Object.keys(this.storySteps).forEach(stepNum => {
            const stepEl = this.storySteps[stepNum];
            if (!stepEl) return;

            if (parseInt(stepNum) === activeStep) {
                stepEl.classList.add('active');
            } else {
                stepEl.classList.remove('active');
            }
        });

        // Navbar is REMOVED during hero scroll animation!
        // It ONLY reveals when user reaches collection section below!
        if (isPastHero) {
            if (navbar) navbar.classList.add('navbar-visible');
        } else {
            if (navbar) navbar.classList.remove('navbar-visible');
        }
    }

    // 0.05 LERP for buttery smooth Apple-like scroll lag
    animate() {
        if (Math.abs(this.targetFrame - this.currentFrame) > 0.01) {
            this.currentFrame += (this.targetFrame - this.currentFrame) * 0.05;
            this.drawFrame(this.currentFrame);
        }

        requestAnimationFrame(this.animate);
    }

    // Map scroll progress cleanly across 0 to FRAME_COUNT - 1
    initScrollTrigger() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        gsap.registerPlugin(ScrollTrigger);

        ScrollTrigger.create({
            trigger: this.heroSection,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.5, // Buttery smooth synchronization
            onUpdate: (self) => {
                const progress = self.progress;
                this.currentProgress = progress;

                // Exact frame mapping
                this.targetFrame = Math.min(
                    this.frameCount - 1,
                    Math.floor(progress * (this.frameCount - 1))
                );

                if (this.scrollFill) {
                    this.scrollFill.style.width = `${Math.min(100, progress * 100)}%`;
                }

                // Trigger visibility updates
                this.updateStoryOverlays(this.currentFrame);
            }
        });

        // Also add scroll listener to update navbar when crossing sections
        window.addEventListener('scroll', () => {
            this.updateStoryOverlays(this.currentFrame);
        });
    }

    handleResize() {
        this.drawFrame(this.currentFrame);
    }
}

// Initialize Player on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    window.player = new FrameSequencePlayer({
        frameCount: 240,
        frameDir: 'assets/frames/',
        canvasId: 'hero-canvas',
        heroId: 'hero-section',
        loaderId: 'canvas-loader',
        progressId: 'load-progress',
        scrollFillId: 'scroll-fill'
    });
});
