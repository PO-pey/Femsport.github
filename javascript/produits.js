/**
 * produits.js — Affichage dynamique et filtrage des produits
 * FemSport — Boutique Sport Femme
 */

(function () {
  "use strict";

  /* Gestion des chemins relatifs pour les images */
  var isSubPage = window.location.pathname.indexOf("/content/") > -1;
  var basePath  = isSubPage ? "../" : "";

  function getCorrectImgPath(path) {
    if (!path || path.startsWith("http")) return path;
    return basePath + path;
  }

  /* =============================================
     ÉTAT DE LA PAGE
     ============================================= */
  var state = {
    filter:      "all",
    sortBy:      "default",
    searchQuery: "",
    modalProduct: null
  };

  /* =============================================
     INITIALISATION
     ============================================= */
  function initProduitsPage() {
    if (!document.getElementById("products-grid")) return;

    readURLParams();
    buildFilterBar();
    bindEvents();
    renderProducts();
  }

  /* Lire les paramètres d'URL (ex: ?cat=leggings) */
  function readURLParams() {
    var params = new URLSearchParams(window.location.search);
    var cat    = params.get("cat");
    if (cat) state.filter = cat;
  }

  /* =============================================
     BARRE DE FILTRES
     ============================================= */
  function buildFilterBar() {
    var filterContainer = document.getElementById("filter-buttons");
    if (!filterContainer) return;

    var categories = [
      { id: "all",         label: "Tous les articles", count: PRODUCTS.length },
      { id: "leggings",    label: "Leggings",           count: countByCategory("leggings") },
      { id: "brassieres",  label: "Brassières & Tops",  count: countByCategory("brassieres") },
      { id: "chaussures",  label: "Chaussures",          count: countByCategory("chaussures") },
      { id: "accessoires", label: "Accessoires",         count: countByCategory("accessoires") }
    ];

    var html = "";
    categories.forEach(function (cat) {
      var active = state.filter === cat.id ? " filter-btn--active" : "";
      html +=
        '<button class="filter-btn' + active + '"' +
          ' data-cat="' + cat.id + '"' +
          ' aria-pressed="' + (state.filter === cat.id ? "true" : "false") + '">' +
          escapeHtml(cat.label) +
          ' <span class="filter-count">(' + cat.count + ')</span>' +
        '</button>';
    });

    filterContainer.innerHTML = html;
  }

  function countByCategory(cat) {
    return PRODUCTS.filter(function (p) { return p.category === cat; }).length;
  }

  /* =============================================
     ÉVÉNEMENTS
     ============================================= */
  function bindEvents() {
    /* Filtres de catégorie */
    var filterContainer = document.getElementById("filter-buttons");
    if (filterContainer) {
      filterContainer.addEventListener("click", function (e) {
        var btn = e.target.closest(".filter-btn");
        if (!btn) return;

        document.querySelectorAll(".filter-btn").forEach(function (b) {
          b.classList.remove("filter-btn--active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("filter-btn--active");
        btn.setAttribute("aria-pressed", "true");

        state.filter = btn.dataset.cat;
        renderProducts();
        updatePageTitle();
      });
    }

    /* Tri */
    var sortSelect = document.getElementById("sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        state.sortBy = this.value;
        renderProducts();
      });
    }

    /* Recherche */
    var searchInput = document.getElementById("search-input");
    if (searchInput) {
      var debounceTimer;
      searchInput.addEventListener("input", function () {
        clearTimeout(debounceTimer);
        var val = this.value;
        debounceTimer = setTimeout(function () {
          state.searchQuery = val.trim().toLowerCase();
          renderProducts();
        }, 300);
      });

      /* Bouton effacer */
      var clearBtn = document.getElementById("search-clear");
      if (clearBtn) {
        clearBtn.addEventListener("click", function () {
          searchInput.value = "";
          state.searchQuery = "";
          renderProducts();
          searchInput.focus();
        });
      }
    }

    /* Modal : fermeture */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });

    var closeBtn = document.getElementById("modal-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal);
    }

    document.addEventListener("click", function (e) {
      if (e.target.closest(".modal-close")) {
        closeModal();
      }
    });

    var overlay = document.getElementById("modal-overlay");
    if (overlay) {
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeModal();
      });
    }
  }

  /* =============================================
     FILTRAGE + TRI
     ============================================= */
  function getFilteredProducts() {
    var list = PRODUCTS.slice();

    /* Filtre catégorie */
    if (state.filter !== "all") {
      list = list.filter(function (p) { return p.category === state.filter; });
    }

    /* Recherche textuelle */
    if (state.searchQuery) {
      list = list.filter(function (p) {
        return p.name.toLowerCase().includes(state.searchQuery) ||
               p.description.toLowerCase().includes(state.searchQuery);
      });
    }

    /* Tri */
    switch (state.sortBy) {
      case "price-asc":
        list.sort(function (a, b) { return a.price - b.price; });
        break;
      case "price-desc":
        list.sort(function (a, b) { return b.price - a.price; });
        break;
      case "rating":
        list.sort(function (a, b) { return b.rating - a.rating; });
        break;
      case "name":
        list.sort(function (a, b) { return a.name.localeCompare(b.name, "fr"); });
        break;
    }

    return list;
  }

  /* =============================================
     RENDU DE LA GRILLE
     ============================================= */
  function renderProducts() {
    var grid    = document.getElementById("products-grid");
    var counter = document.getElementById("products-count");
    if (!grid) return;

    var list = getFilteredProducts();

    if (counter) {
      counter.textContent = list.length + " article" + (list.length !== 1 ? "s" : "");
    }

    if (list.length === 0) {
      grid.innerHTML =
        '<div class="no-results">' +
          '<p class="no-results-icon" aria-hidden="true"><i class="fa-solid fa-magnifying-glass"></i></p>' +
          '<h3>Aucun article trouvé</h3>' +
          '<p>Essayez une autre catégorie ou modifiez votre recherche.</p>' +
          '<button class="btn btn-outline" onclick="resetFilters()">Réinitialiser les filtres</button>' +
        '</div>';
      return;
    }

    grid.innerHTML = list.map(renderProductCard).join("");

    /* Animation d'entrée */
    var cards = grid.querySelectorAll(".product-card");
    cards.forEach(function (card, i) {
      card.style.animationDelay = (i * 60) + "ms";
      card.classList.add("card-animate-in");
    });
  }

  function renderProductCard(product) {
    var discountPercent = product.oldPrice
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : null;

    var badgeClass = "product-badge";
    if (product.badge) {
      var bL = product.badge.toLowerCase();
      if (bL === "nouveau") badgeClass += " product-badge--new";
      else if (bL === "bestseller") badgeClass += " product-badge--bestseller";
      else if (bL === "promo") badgeClass += " product-badge--promo";
    }

    var badgeHtml = product.badge
      ? '<span class="' + badgeClass + '">' + escapeHtml(product.badge) + '</span>'
      : "";

    var starsHtml = renderStars(product.rating);

    var colorsHtml = product.colors.map(function (c, idx) {
      return '<button class="color-swatch' + (idx === 0 ? " color-swatch--active" : "") + '"' +
             ' style="background:' + c + ';"' +
             ' data-color="' + c + '"' +
             ' aria-label="Couleur ' + (idx + 1) + '"' +
             ' title="' + c + '">' +
             '</button>';
    }).join("");

    var firstSize = product.sizes[0];

    return (
      '<article class="product-card" data-id="' + product.id + '">' +
        '<div class="product-card-img-wrapper">' +
          badgeHtml +
          (discountPercent ? '<span class="product-discount">-' + discountPercent + '%</span>' : "") +
          '<img class="product-card-img" src="' + getCorrectImgPath(product.image) + '" style="width: 100%; height: 100%; object-fit: contain !important; background: #f5f5f5;"' +
            ' alt="' + escapeHtml(product.name) + '"' +
            ' width="400" height="520" loading="lazy"' +
            ' onerror="this.onerror=null; this.src=\'https://picsum.photos/seed/fs' + product.id + '/400/520\';">' +
          '<button class="btn-quick-view" onclick="openModal(' + product.id + ')" aria-label="Aperçu rapide de ' + escapeHtml(product.name) + '">Aperçu rapide</button>' +
        '</div>' +
        '<div class="product-card-body">' +
          '<p class="product-card-category">' + getCategoryLabel(product.category) + '</p>' +
          '<h3 class="product-card-name">' + escapeHtml(product.name) + '</h3>' +
          '<div class="product-card-rating" aria-label="Note : ' + product.rating + '/5">' +
            starsHtml +
            '<span class="rating-count">(' + product.reviews + ')</span>' +
          '</div>' +
          '<div class="product-card-colors">' + colorsHtml + '</div>' +
          '<div class="product-card-footer">' +
            '<div class="product-card-price">' +
              '<span class="price-current">' + product.price.toFixed(2) + ' €</span>' +
              (product.oldPrice ? '<span class="price-old">' + product.oldPrice.toFixed(2) + ' €</span>' : "") +
            '</div>' +
            '<button class="btn-add-cart"' +
              ' onclick="handleAddToCart(event,' + product.id + ',\'' + firstSize + '\')"' +
              ' aria-label="Ajouter ' + escapeHtml(product.name) + ' au panier">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>' +
              ' Ajouter' +
            '</button>' +
          '</div>' +
            ((product.stock && product.stock <= 5) ? '<p class="product-stock-warning">⏳ Plus que ' + product.stock + ' en stock !</p>' : '') +
        '</div>' +
      '</article>'
    );
  }

  /* =============================================
     MODAL APERÇU RAPIDE
     ============================================= */
  window.openModal = function (productId) {
    var product = PRODUCTS.find(function (p) { return p.id === productId; });
    if (!product) return;
    state.modalProduct = product;

    var overlay = document.getElementById("modal-overlay");
    var modal   = document.getElementById("product-modal");
    if (!overlay || !modal) return;

    var discountPercent = product.oldPrice
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : null;

    var badgeClass = "product-badge product-badge--lg";
    if (product.badge) {
      var bL = product.badge.toLowerCase();
      if (bL === "nouveau") badgeClass += " product-badge--new";
      else if (bL === "bestseller") badgeClass += " product-badge--bestseller";
      else if (bL === "promo") badgeClass += " product-badge--promo";
    }

    var sizesHtml = product.sizes.map(function (s, i) {
      return '<button class="size-btn' + (i === 0 ? " size-btn--active" : "") + '" data-size="' + s + '">' + s + '</button>';
    }).join("");

    var colorsHtml = product.colors.map(function (c, idx) {
      return '<button class="color-swatch color-swatch--lg' + (idx === 0 ? " color-swatch--active" : "") + '"' +
             ' style="background:' + c + ';"' +
             ' data-color="' + c + '"' +
             ' aria-label="Couleur ' + (idx + 1) + '"></button>';
    }).join("");

    modal.innerHTML =
      '<button class="modal-close" aria-label="Fermer">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '</button>' +
      '<div class="modal-grid">' +
        '<div class="modal-img-side" style="position: relative;">' +
          '<img src="' + getCorrectImgPath(product.image) + '" alt="' + escapeHtml(product.name) + '" width="450" height="560" style="width: 100%; height: 100%; max-height: 560px; border-radius: var(--radius-lg); object-fit: contain !important; background: #f5f5f5;"' +
          ' onerror="this.onerror=null; this.src=\'https://picsum.photos/seed/fs' + product.id + '/450/560\';">' +
          (product.badge ? '<span class="' + badgeClass + '">' + escapeHtml(product.badge) + '</span>' : "") +
          (discountPercent ? '<span class="product-discount" style="font-size: var(--fs-sm); padding: 6px 14px;">-' + discountPercent + '%</span>' : "") +
        '</div>' +
        '<div class="modal-info-side">' +
          '<p class="modal-category">' + getCategoryLabel(product.category) + '</p>' +
          '<h2 class="modal-title">' + escapeHtml(product.name) + '</h2>' +
          '<div class="modal-rating">' + renderStars(product.rating) + '<span>(' + product.reviews + ' avis)</span></div>' +
          '<div class="modal-price">' +
            '<span class="price-current">' + product.price.toFixed(2) + ' €</span>' +
            (product.oldPrice ? '<span class="price-old">' + product.oldPrice.toFixed(2) + ' €</span>' : "") +
          '</div>' +
          ((product.stock && product.stock <= 5) ? '<p class="modal-stock-warning"><i class="fa-solid fa-clock"></i> Vite, plus que ' + product.stock + ' article(s) en stock !</p>' : '') +
          '<p class="modal-description">' + escapeHtml(product.description) + '</p>' +
          '<div class="modal-options">' +
            '<div class="option-group">' +
              '<p class="option-label">Couleur</p>' +
              '<div class="option-colors" id="modal-colors">' + colorsHtml + '</div>' +
            '</div>' +
            '<div class="option-group">' +
              '<p class="option-label">' + (product.category === "chaussures" ? "Pointure" : "Taille") + '</p>' +
              '<div class="option-sizes" id="modal-sizes">' + sizesHtml + '</div>' +
            '</div>' +
          '</div>' +
          '<button class="btn btn-primary btn-modal-add" id="modal-add-btn">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>' +
            ' Ajouter au panier' +
          '</button>' +
        '</div>' +
      '</div>';

    overlay.hidden = false;
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("body-modal-open");

    /* Sélection des tailles et couleurs dans la modal */
    modal.querySelectorAll(".size-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        modal.querySelectorAll(".size-btn").forEach(function (b) { b.classList.remove("size-btn--active"); });
        this.classList.add("size-btn--active");
      });
    });
    modal.querySelectorAll(".color-swatch").forEach(function (btn) {
      btn.addEventListener("click", function () {
        modal.querySelectorAll(".color-swatch").forEach(function (b) { b.classList.remove("color-swatch--active"); });
        this.classList.add("color-swatch--active");
      });
    });

    /* Ajouter au panier depuis la modal */
    document.getElementById("modal-add-btn").addEventListener("click", function () {
      var activeSize  = modal.querySelector(".size-btn--active");
      var activeColor = modal.querySelector(".color-swatch--active");
      var size  = activeSize  ? activeSize.dataset.size  : product.sizes[0];
      var color = activeColor ? activeColor.dataset.color : product.colors[0];
      addToCart(product.id, size, color);
    });
  };

  window.closeModal = function () {
    var overlay = document.getElementById("modal-overlay");
    if (overlay) {
      overlay.hidden = true;
      overlay.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("body-modal-open");
    state.modalProduct = null;
  };

  /* =============================================
     AJOUTER AU PANIER (depuis grille)
     ============================================= */
  window.handleAddToCart = function (event, productId, defaultSize) {
    event.stopPropagation();
    var product = PRODUCTS.find(function (p) { return p.id === productId; });
    if (!product) return;

    /* Récupérer la couleur sélectionnée sur la carte */
    var card        = event.target.closest(".product-card");
    var activeColor = card && card.querySelector(".color-swatch--active");
    var color       = activeColor ? activeColor.dataset.color : product.colors[0];

    addToCart(productId, defaultSize, color);

    /* Feedback visuel sur le bouton */
    var btn = event.target.closest(".btn-add-cart");
    if (btn) {
      btn.classList.add("btn-add-cart--added");
      btn.textContent = "C'est prêt !";
      setTimeout(function () {
        btn.classList.remove("btn-add-cart--added");
        btn.innerHTML =
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> Ajouter';
      }, 1500);
    }
  };

  /* Sélection couleur sur la grille */
  document.addEventListener("click", function (e) {
    var swatch = e.target.closest(".product-card .color-swatch");
    if (!swatch) return;
    var card = swatch.closest(".product-card");
    card.querySelectorAll(".color-swatch").forEach(function (b) { b.classList.remove("color-swatch--active"); });
    swatch.classList.add("color-swatch--active");
  });

  /* =============================================
     RESET FILTRES
     ============================================= */
  window.resetFilters = function () {
    state.filter      = "all";
    state.searchQuery = "";
    state.sortBy      = "default";

    var searchInput = document.getElementById("search-input");
    var sortSelect  = document.getElementById("sort-select");
    if (searchInput) searchInput.value = "";
    if (sortSelect)  sortSelect.value  = "default";

    buildFilterBar();
    renderProducts();
    updatePageTitle();
  };

  /* =============================================
     TITRE DE PAGE DYNAMIQUE
     ============================================= */
  function updatePageTitle() {
    var catMap = {
      "all":         "Tous les articles",
      "leggings":    "Leggings",
      "brassieres":  "Brassières & Tops",
      "chaussures":  "Chaussures",
      "accessoires": "Accessoires"
    };
    var titleEl = document.getElementById("products-page-title");
    if (titleEl) {
      titleEl.textContent = catMap[state.filter] || "Tous les articles";
    }
    document.title = (catMap[state.filter] || "Produits") + " — FemSport";
  }

  /* =============================================
     UTILITAIRES
     ============================================= */
  function getCategoryLabel(cat) {
    var map = {
      leggings:    "Leggings",
      brassieres:  "Brassières & Tops",
      chaussures:  "Chaussures",
      accessoires: "Accessoires"
    };
    return map[cat] || cat;
  }

  function renderStars(rating) {
    var full  = Math.floor(rating);
    var half  = rating - full >= 0.5;
    var empty = 5 - full - (half ? 1 : 0);
    var html  = "";
    for (var i = 0; i < full;  i++) html += '<span class="star star--full"  aria-hidden="true">★</span>';
    if (half)                        html += '<span class="star star--half"  aria-hidden="true">⯨</span>';
    for (var j = 0; j < empty; j++) html += '<span class="star star--empty" aria-hidden="true">☆</span>';
    return html;
  }

  function escapeHtml(str) {
    var map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return String(str).replace(/[&<>"']/g, function (c) { return map[c]; });
  }

  /* =============================================
     LANCEMENT
     ============================================= */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProduitsPage);
  } else {
    initProduitsPage();
  }

})();
