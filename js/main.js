/* ==========================================================================
   VIESTILO — MAIN APPLICATION SCRIPT (MAIN.JS)
   Product Catalog, Shopping Bag Drawer, Quick View Modal, Wishlist, Notifications
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    /* ----------------------------------------------------------------------
       1. REAL PRODUCT CATALOG DATA
       ---------------------------------------------------------------------- */
    const PRODUCTS = [
        {
            id: 1,
            name: 'Blood Eclipse',
            type: 'Extrait de Parfum',
            price: 2499,
            priceFormatted: '₹2,499',
            rating: 4.9,
            reviewsCount: 128,
            notes: ['Blood Orange', 'White Floral', 'Sandalwood'],
            desc: 'An enigmatic fusion of Calabrian Blood Orange and French Tuberose rested on a bed of Mysore Sandalwood.',
            badge: 'Bestseller',
            image: 'assets/products/blood_eclipse.jpg',
            category: 'extrait'
        },
        {
            id: 2,
            name: 'Midnight Noir',
            type: 'Parfum Intense',
            price: 2899,
            priceFormatted: '₹2,899',
            rating: 5.0,
            reviewsCount: 214,
            notes: ['Tuscan Leather', 'Black Amber', 'Bourbon Vanilla'],
            desc: 'Sensual aged leather coupled with dark amber and smoky bourbon vanilla bean.',
            badge: 'Rare Reserve',
            image: 'assets/products/midnight_noir.jpg',
            category: 'edp'
        },
        {
            id: 3,
            name: 'Golden Oud',
            type: 'Elixir Pure Oud',
            price: 3499,
            priceFormatted: '₹3,499',
            rating: 4.9,
            reviewsCount: 189,
            notes: ['Cambodian Oud', 'Golden Amber', 'Kashmiri Saffron'],
            desc: 'Authentic Cambodian Oud steeped in golden balsamic resins and precious saffron.',
            badge: 'Limited Edition',
            image: 'assets/products/golden_oud.jpg',
            category: 'reserve'
        },
        {
            id: 4,
            name: 'Velvet Rose',
            type: 'Extrait de Parfum',
            price: 2299,
            priceFormatted: '₹2,299',
            rating: 4.8,
            reviewsCount: 96,
            notes: ['Damask Rose', 'Pink Peony', 'White Musk'],
            desc: 'Hand-picked Bulgarian damask rose petals wrapped in silky white musk.',
            badge: 'Trending',
            image: 'assets/products/velvet_rose.jpg',
            category: 'extrait'
        },
        {
            id: 5,
            name: 'Ocean Mist',
            type: 'Aqua Parfum',
            price: 2199,
            priceFormatted: '₹2,199',
            rating: 4.9,
            reviewsCount: 142,
            notes: ['Marine Mineral', 'Atlas Cedar', 'Bergamot Citrus'],
            desc: 'Invigorating sea breeze accord paired with crisp bergamot and grounding atlas cedarwood.',
            badge: 'Fresh Choice',
            image: 'assets/products/ocean_mist.jpg',
            category: 'edp'
        }
    ];

    /* ----------------------------------------------------------------------
       2. STATE MANAGEMENT (CART & WISHLIST)
       ---------------------------------------------------------------------- */
    let cart = [];
    let wishlist = [];

    // Load from LocalStorage if available
    try {
        const savedCart = localStorage.getItem('viestilo_cart');
        const savedWishlist = localStorage.getItem('viestilo_wishlist');
        if (savedCart) cart = JSON.parse(savedCart);
        if (savedWishlist) wishlist = JSON.parse(savedWishlist);
    } catch (e) {
        console.warn('LocalStorage unavailable', e);
    }

    /* ----------------------------------------------------------------------
       3. NAVBAR SCROLL SHRINK EFFECT
       ---------------------------------------------------------------------- */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    /* ----------------------------------------------------------------------
       4. SPOTLIGHT & CUSTOM CURSOR FOLLOWERS
       ---------------------------------------------------------------------- */
    const spotlight = document.getElementById('spotlight');
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');

    if (spotlight && cursor && follower) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let followerX = mouseX;
        let followerY = mouseY;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
            spotlight.style.transform = `translate(${mouseX - 325}px, ${mouseY - 325}px)`;
        });

        // LERP loop for follower
        function animateFollower() {
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            follower.style.transform = `translate(${followerX}px, ${followerY}px)`;
            requestAnimationFrame(animateFollower);
        }
        animateFollower();

        // Hover expand cursor
        document.querySelectorAll('a, button, .product-card, .bento-card, .orbit-node').forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }

    /* ----------------------------------------------------------------------
       5. PRODUCT FILTERING SYSTEM
       ---------------------------------------------------------------------- */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            productCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.style.display = 'flex';
                    gsap.fromTo(card, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    /* ----------------------------------------------------------------------
       6. QUICK VIEW MODAL
       ---------------------------------------------------------------------- */
    const quickviewModal = document.getElementById('quickview-modal');
    const qvCloseBtn = document.getElementById('modal-close');
    const qvTitle = document.getElementById('qv-title');
    const qvType = document.getElementById('qv-type');
    const qvPrice = document.getElementById('qv-price');
    const qvDesc = document.getElementById('qv-desc');
    const qvImg = document.getElementById('qv-img');
    const qvNotes = document.getElementById('qv-notes');
    const qvAddCartBtn = document.getElementById('qv-add-cart');

    let currentQvProduct = null;

    document.querySelectorAll('.quick-view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-id'));
            const product = PRODUCTS.find(p => p.id === id);
            if (product) {
                currentQvProduct = product;
                qvTitle.textContent = product.name;
                qvType.textContent = product.type;
                qvPrice.textContent = product.priceFormatted;
                qvDesc.textContent = product.desc;
                if (qvImg) qvImg.src = product.image;

                if (qvNotes) {
                    qvNotes.innerHTML = product.notes.map(n => `<span class="note-tag">${n}</span>`).join('');
                }

                quickviewModal.classList.add('active');
            }
        });
    });

    if (qvCloseBtn) {
        qvCloseBtn.addEventListener('click', () => quickviewModal.classList.remove('active'));
    }

    if (quickviewModal) {
        quickviewModal.addEventListener('click', (e) => {
            if (e.target === quickviewModal) quickviewModal.classList.remove('active');
        });
    }

    if (qvAddCartBtn) {
        qvAddCartBtn.addEventListener('click', () => {
            if (currentQvProduct) {
                addToCart(currentQvProduct.id);
                quickviewModal.classList.remove('active');
            }
        });
    }

    /* ----------------------------------------------------------------------
       7. SHOPPING BAG DRAWER & ACTIONS
       ---------------------------------------------------------------------- */
    const cartTrigger = document.getElementById('cart-trigger');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartCloseBtn = document.getElementById('cart-close');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartCountBadges = [document.getElementById('cart-count'), document.getElementById('cart-drawer-count')];
    const cartSubtotalEl = document.getElementById('cart-subtotal');

    function updateCartUI() {
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        cartCountBadges.forEach(b => { if (b) b.textContent = totalItems; });

        // Save to localStorage
        try { localStorage.setItem('viestilo_cart', JSON.stringify(cart)); } catch (e) {}

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-drawer-msg">
                    <i class="fa-solid fa-bag-shopping"></i>
                    <p>Your luxury bag is currently empty.</p>
                    <a href="#collection" class="btn btn-sm btn-gold close-drawer-link">Discover Scents</a>
                </div>
            `;
            if (cartSubtotalEl) cartSubtotalEl.textContent = '₹0';
            
            document.querySelectorAll('.close-drawer-link').forEach(link => {
                link.addEventListener('click', () => cartDrawer.classList.remove('active'));
            });
            return;
        }

        let subtotal = 0;
        cartItemsContainer.innerHTML = cart.map(item => {
            const product = PRODUCTS.find(p => p.id === item.id);
            if (!product) return '';
            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;

            return `
                <div class="cart-item-row" style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <img src="${product.image}" alt="${product.name}" style="width: 60px; height: 60px; object-fit: contain; border-radius: 10px; background: rgba(255,255,255,0.04);">
                    <div style="flex: 1;">
                        <h4 style="font-family: var(--font-heading); font-size: 1.2rem;">${product.name}</h4>
                        <span style="font-size: 0.85rem; color: var(--gold);">${product.priceFormatted}</span>
                        <div style="display: flex; align-items: center; gap: 0.8rem; margin-top: 0.4rem;">
                            <button class="qty-btn dec-qty" data-id="${item.id}" style="width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--glass-border); color: #fff;">-</button>
                            <span style="font-size: 0.85rem;">${item.quantity}</span>
                            <button class="qty-btn inc-qty" data-id="${item.id}" style="width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--glass-border); color: #fff;">+</button>
                        </div>
                    </div>
                    <button class="remove-item-btn" data-id="${item.id}" style="color: var(--text-sub);"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
        }).join('');

        if (cartSubtotalEl) cartSubtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;

        // Rebind quantity and remove handlers
        document.querySelectorAll('.inc-qty').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                const item = cart.find(i => i.id === id);
                if (item) { item.quantity++; updateCartUI(); }
            });
        });

        document.querySelectorAll('.dec-qty').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                const item = cart.find(i => i.id === id);
                if (item) {
                    item.quantity--;
                    if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);
                    updateCartUI();
                }
            });
        });

        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                cart = cart.filter(i => i.id !== id);
                updateCartUI();
                showToast('Item removed from shopping bag');
            });
        });
    }

    function addToCart(id) {
        const existing = cart.find(item => item.id === id);
        if (existing) {
            existing.quantity++;
        } else {
            cart.push({ id: id, quantity: 1 });
        }
        updateCartUI();
        const product = PRODUCTS.find(p => p.id === id);
        showToast(`Added ${product ? product.name : 'Item'} to your Shopping Bag`);
        if (cartDrawer) cartDrawer.classList.add('active');
    }

    document.querySelectorAll('.add-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-id'));
            addToCart(id);
        });
    });

    if (cartTrigger) cartTrigger.addEventListener('click', () => cartDrawer.classList.add('active'));
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', () => cartDrawer.classList.remove('active'));
    if (cartDrawer) {
        cartDrawer.addEventListener('click', (e) => {
            if (e.target === cartDrawer) cartDrawer.classList.remove('active');
        });
    }

    updateCartUI();

    /* ----------------------------------------------------------------------
       8. WISHLIST MANAGEMENT
       ---------------------------------------------------------------------- */
    const wishlistBadge = document.getElementById('wishlist-count');

    function updateWishlistUI() {
        if (wishlistBadge) wishlistBadge.textContent = wishlist.length;
        try { localStorage.setItem('viestilo_wishlist', JSON.stringify(wishlist)); } catch (e) {}
    }

    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-id'));
            const idx = wishlist.indexOf(id);
            const product = PRODUCTS.find(p => p.id === id);

            if (idx > -1) {
                wishlist.splice(idx, 1);
                btn.classList.remove('active');
                btn.style.color = '#fff';
                showToast(`Removed ${product ? product.name : 'Item'} from Wishlist`);
            } else {
                wishlist.push(id);
                btn.classList.add('active');
                btn.style.color = 'var(--gold)';
                showToast(`Saved ${product ? product.name : 'Item'} to Wishlist`);
            }
            updateWishlistUI();
        });
    });

    updateWishlistUI();

    /* ----------------------------------------------------------------------
       9. SEARCH MODAL SYSTEM
       ---------------------------------------------------------------------- */
    const searchTrigger = document.getElementById('search-trigger');
    const searchModal = document.getElementById('search-modal');
    const searchClose = document.getElementById('search-close');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    if (searchTrigger && searchModal) {
        searchTrigger.addEventListener('click', () => {
            searchModal.classList.add('active');
            if (searchInput) searchInput.focus();
        });

        if (searchClose) searchClose.addEventListener('click', () => searchModal.classList.remove('active'));

        if (searchInput && searchResults) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                if (!query) {
                    searchResults.innerHTML = '';
                    return;
                }

                const matches = PRODUCTS.filter(p => 
                    p.name.toLowerCase().includes(query) ||
                    p.desc.toLowerCase().includes(query) ||
                    p.notes.some(n => n.toLowerCase().includes(query))
                );

                if (matches.length === 0) {
                    searchResults.innerHTML = '<p style="grid-column: span 3; text-align: center; color: var(--text-sub);">No fragrances matched your search query.</p>';
                } else {
                    searchResults.innerHTML = matches.map(p => `
                        <div class="search-item glass-card" style="padding: 1rem; display: flex; align-items: center; gap: 1rem; cursor: pointer;">
                            <img src="${p.image}" alt="${p.name}" style="width: 50px; height: 50px; object-fit: contain;">
                            <div>
                                <h4 style="font-family: var(--font-heading); font-size: 1.1rem;">${p.name}</h4>
                                <span style="font-size: 0.8rem; color: var(--gold);">${p.priceFormatted}</span>
                            </div>
                        </div>
                    `).map(html => html).join('');
                }
            });
        }
    }

    /* ----------------------------------------------------------------------
       10. NEWSLETTER SUBMISSION
       ---------------------------------------------------------------------- */
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterFeedback = document.getElementById('newsletter-feedback');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('newsletter-email').value;
            if (email) {
                if (newsletterFeedback) newsletterFeedback.textContent = 'Welcome to the Viestilo Circle. An exclusive invitation has been sent.';
                newsletterForm.reset();
                showToast('Successfully subscribed to Viestilo Private Circle');
            }
        });
    }

    /* ----------------------------------------------------------------------
       11. TOAST NOTIFICATION HELPER
       ---------------------------------------------------------------------- */
    function showToast(message) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fa-solid fa-sparkles"></i> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

});
