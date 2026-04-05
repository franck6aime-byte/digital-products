/* ============================================
   DigitalBoost AI — Interactive Scripts
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initCounters();
    initFAQ();
    initModal();
    initScrollReveal();
    initSmoothScrollLinks();
});

/* === Navbar Scroll Effect === */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

/* === Mobile Menu === */
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const links = document.getElementById('navLinks');

    if (!btn || !links) return;

    btn.addEventListener('click', () => {
        links.classList.toggle('active');
        btn.classList.toggle('active');
    });

    // Close menu on link click
    links.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            links.classList.remove('active');
            btn.classList.remove('active');
        });
    });
}

/* === Animated Number Counters === */
function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseFloat(counter.getAttribute('data-target'));
                const isDecimal = target % 1 !== 0;
                const duration = 2000;
                const startTime = performance.now();

                function update(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    // Easing function
                    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                    const current = target * easeOutQuart;

                    if (isDecimal) {
                        counter.textContent = current.toFixed(1);
                    } else {
                        counter.textContent = Math.floor(current).toLocaleString();
                    }

                    if (progress < 1) {
                        requestAnimationFrame(update);
                    } else {
                        if (isDecimal) {
                            counter.textContent = target.toFixed(1);
                        } else {
                            counter.textContent = target.toLocaleString();
                        }
                    }
                }

                requestAnimationFrame(update);
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

/* === FAQ Accordion === */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all
            faqItems.forEach(i => i.classList.remove('active'));

            // Toggle current
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

/* === Purchase Modal === */
async function initModal() {
    const modal = document.getElementById('purchaseModal');
    const modalClose = document.getElementById('modalClose');
    const form = document.getElementById('purchaseForm');
    const buyButtons = document.querySelectorAll('.btn-buy');
    let currentProductKey = null;

    let products = {
        prompts: {
            name: 'Pack 100+ Prompts IA Premium',
            displayName: 'Starter — Prompts IA 🔥 Promo',
            price: 2000,
            chariowLink: 'https://ppawzaph.mychariow.shop/prd_cav6sr/checkout'
        },
        ebook: {
            name: 'eBook "Maîtrisez l\'IA"',
            displayName: 'Pro — eBook Premium',
            price: 9900,
            chariowLink: 'https://ppawzaph.mychariow.shop/prd_u83162/checkout'
        },
        bundle: {
            name: 'Bundle Ultime — Tout inclus',
            displayName: 'Bundle Ultime',
            price: 14900,
            chariowLink: 'https://ppawzaph.mychariow.shop/prd_woqpd3/checkout'
        }
    };

    try {
        const res = await fetch('/catalog.json');
        if (res.ok) {
            const dynamicCatalog = await res.json();
            // On fusionne le catalogue en ligne pour remplacer les prix/liens éventuels
            for (const key in dynamicCatalog) {
                if (products[key]) {
                    products[key].price = dynamicCatalog[key].price;
                    products[key].name = dynamicCatalog[key].name;
                    products[key].displayName = dynamicCatalog[key].displayName;
                    products[key].chariowLink = dynamicCatalog[key].chariowLink;
                }
            }
        }
    } catch (e) {
        console.warn("Impossible de charger le catalogue distant. Mode local activé.");
    }

    buyButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const productKey = btn.getAttribute('data-product');
            if (!productKey || !products[productKey]) return;

            const product = products[productKey];

            document.getElementById('modalProduct').textContent = product.displayName;
            document.getElementById('modalItemName').textContent = product.name;
            let conversionText = "";
            if(product.price === 2000) conversionText = " (~3€ / 3.20$)";
            if(product.price === 9900) conversionText = " (~15€ / 16$)";
            if(product.price === 14900) conversionText = " (~23€ / 25$)";
            if(product.price === 2500) conversionText = " (~3.80€ / 4$)";
            if(product.price === 4900) conversionText = " (~7.50€ / 8$)";
            
            document.getElementById('modalItemPrice').textContent = product.price.toLocaleString('fr-FR') + ' FCFA' + conversionText;
            document.getElementById('modalTotal').textContent = product.price.toLocaleString('fr-FR') + ' FCFA' + conversionText;

            currentProductKey = productKey;
            
            // Intégration Chariow Widget Dynamique
            const match = product.chariowLink.match(/prd_[a-zA-Z0-9]+/);
            if (match) {
                loadChariowWidget(match[0]);
                const customBtn = document.getElementById('custom-payment-btn-container');
                const widgetContainer = document.getElementById('chariow-widget-container');
                if (customBtn) customBtn.style.display = 'none';
                if (widgetContainer) widgetContainer.style.display = 'block';
            }

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (modal) {
        const paymentBtns = document.querySelectorAll('.payment-btn');

        paymentBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const method = btn.getAttribute('data-method');
                if (method === 'chariow' && currentProductKey) {
                    const link = products[currentProductKey].chariowLink;
                    if (link) {
                        window.location.href = link;
                    } else {
                        alert('Le lien de paiement n\'est pas encore configuré. L\'administrateur doit le renseigner.');
                    }
                }
            });
        });
    }
}

/* === Scroll Reveal Animations === */
function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        '.product-card, .feature-card, .step-card, .testimonial-card, .pricing-card, .faq-item, .guarantee'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 80);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
}

/* === Smooth Scroll for Navigation Links === */
function initSmoothScrollLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

/* === Chariow Dynamic Widget Loader === */
function loadChariowWidget(productId) {
    const container = document.getElementById('chariow-widget-container');
    if (!container) return;

    container.innerHTML = `
        <div id="chariow-widget" data-product-id="${productId}"
            data-store-domain="ppawzaph.mychariow.shop"
            data-style="showcase"
            data-border-style="rounded"
            data-cta-width="xs"
            data-cta-animation="none"
            data-locale="fr"
            data-primary-color="#D4AF37"
            data-background-color="#FFFFFF"></div>
    `;
    
    // On détruit l'ancien script s'il existe pour forcer le widget à se re-rendre
    const oldScript = document.getElementById('chariow-dynamic-script');
    if (oldScript) oldScript.remove();

    var script = document.createElement('script');
    script.id = 'chariow-dynamic-script';
    script.src = 'https://js.chariow.com/v1/widget.min.js';
    script.async = true;
    document.head.appendChild(script);

    // On charge le CSS dynamiquement une seule fois
    if (!document.getElementById('chariow-dynamic-css')) {
        var link = document.createElement('link');
        link.id = 'chariow-dynamic-css';
        link.rel = 'stylesheet';
        link.href = 'https://js.chariow.com/v1/widget.min.css';
        document.head.appendChild(link);
    }
}
