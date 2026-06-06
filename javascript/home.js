document.addEventListener('DOMContentLoaded', () => {
    /* =============================================
       HERO SLIDER (FONDU ENCHAÎNÉ)
       ============================================= */
    const heroSlides = document.querySelectorAll('.hero-slide');
    if (heroSlides.length > 0) {
        let currentHeroSlide = 0;
        const heroIntervalTime = 5000;

        function nextHeroSlide() {
            heroSlides[currentHeroSlide].classList.remove('active');
            currentHeroSlide = (currentHeroSlide + 1) % heroSlides.length;
            heroSlides[currentHeroSlide].classList.add('active');
        }
        setInterval(nextHeroSlide, heroIntervalTime);
    }

    // --- LOGIQUE SLIDER CATÉGORIES (STYLE CHIC) ---
    const catTrack = document.getElementById('cat-track');
    const catDotsContainer = document.getElementById('cat-dots');
    const catBtnPrev = document.getElementById('cat-prev');
    const catBtnNext = document.getElementById('cat-next');
    
    if (catTrack && catDotsContainer) {
        const catSlides = catTrack.children;
        let catIndex = 0;
        let catInterval;

        const updateCatSlider = () => {
            if (catSlides.length === 0) return;
            
            const gap = parseInt(window.getComputedStyle(catTrack).gap) || 20;
            const slideRect = catSlides[0].getBoundingClientRect();
            const slideWidth = slideRect.width + gap;
            
            const viewportWidth = catTrack.parentElement.offsetWidth;
            // On calcule combien de slides entiers tiennent dans le viewport
            const visibleItems = Math.max(1, Math.floor(viewportWidth / slideWidth));
            const maxCatIndex = Math.max(0, catSlides.length - visibleItems);

            if (catIndex > maxCatIndex) catIndex = 0;
            if (catIndex < 0) catIndex = maxCatIndex;

            catTrack.style.transform = `translateX(-${catIndex * slideWidth}px)`;
            
            // Mise à jour visuelle des points
            const dots = catDotsContainer.querySelectorAll('.dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === catIndex);
            });
        };

        // Création propre des points de pagination
        catDotsContainer.innerHTML = '';
        for (let i = 0; i < catSlides.length; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                catIndex = i;
                updateCatSlider();
                restartCatInterval();
            });
            catDotsContainer.appendChild(dot);
        }

        const startCatInterval = () => {
            catInterval = setInterval(() => {
                catIndex++;
                updateCatSlider();
            }, 5000);
        };

        const restartCatInterval = () => {
            clearInterval(catInterval);
            startCatInterval();
        };

        if (catBtnNext && catBtnPrev) {
            catBtnNext.addEventListener('click', () => {
                catIndex++;
                updateCatSlider();
                restartCatInterval();
            });
            catBtnPrev.addEventListener('click', () => {
                catIndex--;
                updateCatSlider();
                restartCatInterval();
            });
        }

        catTrack.addEventListener('mouseenter', () => clearInterval(catInterval));
        catTrack.addEventListener('mouseleave', startCatInterval);
        window.addEventListener('resize', updateCatSlider);
        
        startCatInterval();
        updateCatSlider(); // Appel initial pour caler le slider
    }

    // --- LOGIQUE DU SECOND CARROUSEL (MARQUEE INFINI) ---
    const trendTrack = document.getElementById('product-carousel-track');

    if (trendTrack) {
        // 1. Clonage des éléments pour créer la boucle infinie sans coupure
        const originalItems = Array.from(trendTrack.children);
        originalItems.forEach(item => {
            const clone = item.cloneNode(true);
            // On retire les IDs des clones pour éviter les doublons dans le DOM
            if (clone.id) clone.removeAttribute('id');
            trendTrack.appendChild(clone);
        });

        // 2. Activation de l'animation CSS fluide
        trendTrack.classList.add('marquee-active');
    }

    // Animation au défilement pour les nouvelles sections
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-section').forEach(section => observer.observe(section));

});