/**
 * nav.js — Navigation dynamique injectée sur toutes les pages
 * FemSport — Boutique Sport Femme
 */

(function () {
  "use strict";

  /* =============================================
     CONFIGURATION DES CHEMINS
     ============================================= */
  const isSubPage = window.location.pathname.includes("/content/");
  const base      = isSubPage ? "../" : "";

  /* =============================================
     DONNÉES DE SESSION & PANIER
     ============================================= */
  const currentUser = JSON.parse(localStorage.getItem("femsport_session") || "null");
  const cart        = JSON.parse(localStorage.getItem("femsport_cart")    || "[]");
  const cartCount   = cart.reduce(function (sum, item) { return sum + item.quantity; }, 0);

  /* =============================================
     CONSTRUCTION DU HTML DE NAVIGATION
     ============================================= */
  function buildNav() {
    const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23111111'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
    const avatarSrc = currentUser && currentUser.avatar ? currentUser.avatar : defaultAvatar;

    const userBlock = currentUser
      ? `<div class="nav-user-block">
           <a href="${base}content/profil.html" class="nav-user-name" aria-label="Accéder à mon profil"><img src="${avatarSrc}" alt="" class="nav-avatar" id="nav-avatar-img" aria-hidden="true" /> <span>Bonjour, <strong>${escapeHtml(currentUser.prenom)}</strong></span></a>
           <button class="btn-logout" onclick="logout()">Déconnexion</button>
         </div>`
      : `<a href="${base}content/connexion.html" class="nav-auth-link">Connexion</a>
         <a href="${base}content/inscription.html" class="nav-auth-link nav-auth-link--register">Créer un compte</a>`;

    const badgeHtml = cartCount > 0
      ? `<span class="cart-badge" aria-label="${cartCount} article(s) dans le panier">${cartCount}</span>`
      : `<span class="cart-badge cart-badge--hidden" aria-hidden="true">0</span>`;

    return `
      <nav class="navbar" role="navigation" aria-label="Navigation principale">
        <div class="nav-container">

          <!-- Logo -->
          <a href="${base}index.html" class="nav-logo" aria-label="FemSport — Accueil">
            <span class="logo-fem">FEM</span><span class="logo-sport">SPORT</span>
          </a>

          <!-- Liens de navigation (desktop) -->
          <ul class="nav-links" id="nav-links" role="menubar">
            <li role="none">
              <a href="${base}index.html"
                 class="nav-link"
                 role="menuitem"
                 data-page="index">Accueil</a>
            </li>
            <li class="nav-dropdown" role="none">
              <a href="${base}content/produits.html"
                 class="nav-link nav-link--dropdown"
                 role="menuitem"
                 aria-haspopup="true"
                 aria-expanded="false"
                 data-page="produits">
                Produits
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                </svg>
              </a>
              <ul class="dropdown-menu" role="menu" aria-label="Catégories">
                <li role="none"><a href="${base}content/produits.html?cat=leggings"   role="menuitem">Leggings</a></li>
                <li role="none"><a href="${base}content/produits.html?cat=brassieres" role="menuitem">Brassières &amp; Tops</a></li>
                <li role="none"><a href="${base}content/produits.html?cat=chaussures" role="menuitem">Chaussures</a></li>
                <li role="none"><a href="${base}content/produits.html?cat=accessoires" role="menuitem">Accessoires</a></li>
              </ul>
            </li>
            <li role="none">
              <a href="${base}content/contact.html"
                 class="nav-link"
                 role="menuitem"
                 data-page="contact">Contact</a>
            </li>
          </ul>

          <!-- Actions -->
          <div class="nav-actions">
            ${userBlock}
            <a href="${base}content/panier.html"
               class="nav-cart"
               aria-label="Panier (${cartCount} article${cartCount !== 1 ? "s" : ""})">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              ${badgeHtml}
            </a>
          </div>

          <!-- Bouton menu mobile -->
          <button class="nav-toggle" id="nav-toggle"
                  aria-label="Ouvrir le menu" aria-expanded="false"
                  aria-controls="nav-links">
            <span class="burger-bar"></span>
            <span class="burger-bar"></span>
            <span class="burger-bar"></span>
          </button>

        </div>
      </nav>`;
  }

  /* =============================================
     INJECTION ET INITIALISATION
     ============================================= */
  function init() {
    const header = document.getElementById("main-header");
    if (!header) return;

    header.innerHTML = buildNav();
    setActiveLink();
    initMobileMenu();
    initDropdown();
    initScrollEffect();
    initBackToTop();
  }

  /* =============================================
     LIEN ACTIF
     ============================================= */
  function setActiveLink() {
    const path    = window.location.pathname;
    const search  = window.location.search;
    const links   = document.querySelectorAll(".nav-link");

    links.forEach(function (link) {
      const href = link.getAttribute("href") || "";
      const page = link.dataset.page;

      if (page === "index" && (path.endsWith("index.html") || path.endsWith("/"))) {
        link.classList.add("nav-link--active");
      } else if (page === "produits" && path.includes("produits.html")) {
        link.classList.add("nav-link--active");
        } else if (page === "contact" && path.includes("contact.html")) {
          link.classList.add("nav-link--active");
      }
    });
  }

  /* =============================================
     MENU MOBILE
     ============================================= */
  function initMobileMenu() {
    const toggle   = document.getElementById("nav-toggle");
    const navLinks = document.getElementById("nav-links");
    if (!toggle || !navLinks) return;

    toggle.addEventListener("click", function () {
      const isOpen = navLinks.classList.toggle("nav-links--open");
      this.setAttribute("aria-expanded", isOpen.toString());
      this.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
      this.classList.toggle("nav-toggle--active", isOpen);
    });

    /* Fermer le menu au clic en dehors */
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".navbar")) {
        navLinks.classList.remove("nav-links--open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.classList.remove("nav-toggle--active");
      }
    });
  }

  /* =============================================
     DROPDOWN CATÉGORIES (desktop)
     ============================================= */
  function initDropdown() {
    const dropdownItem = document.querySelector(".nav-dropdown");
    if (!dropdownItem) return;
    const dropdownLink = dropdownItem.querySelector(".nav-link--dropdown");

    dropdownItem.addEventListener("mouseenter", function () {
      dropdownLink && dropdownLink.setAttribute("aria-expanded", "true");
    });
    dropdownItem.addEventListener("mouseleave", function () {
      dropdownLink && dropdownLink.setAttribute("aria-expanded", "false");
    });
  }

  /* =============================================
     EFFET DE SCROLL SUR LA NAVBAR
     ============================================= */
  function initScrollEffect() {
    const header = document.getElementById("main-header");
    if (!header) return;

    function onScroll() {
      header.classList.toggle("navbar-scrolled", window.scrollY > 50);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* =============================================
     BOUTON RETOUR EN HAUT
     ============================================= */
  function initBackToTop() {
    const btn = document.createElement("button");
    btn.className = "back-to-top";
    btn.setAttribute("aria-label", "Retour en haut de la page");
    btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"></polyline></svg>';
    
    document.body.appendChild(btn);

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", function () {
      btn.classList.toggle("back-to-top--visible", window.scrollY > 300);
    }, { passive: true });
  }

  /* =============================================
     MISE À JOUR DE L'AVATAR (appelé depuis le profil)
     ============================================= */
  window.updateNavAvatar = function (src) {
    const img = document.getElementById("nav-avatar-img");
    if (img) img.src = src;
  };

  /* =============================================
     UTILITAIRES
     ============================================= */
  function escapeHtml(str) {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return String(str).replace(/[&<>"']/g, function (c) { return map[c]; });
  }

  /* =============================================
     MISE À JOUR DU BADGE PANIER
     (appelée depuis panier.js après ajout)
     ============================================= */
  window.updateNavCartBadge = function () {
    const cart    = JSON.parse(localStorage.getItem("femsport_cart") || "[]");
    const count   = cart.reduce(function (s, i) { return s + i.quantity; }, 0);
    const badge   = document.querySelector(".cart-badge");
    if (!badge) return;
    badge.textContent = count;
    badge.classList.toggle("cart-badge--hidden", count === 0);
    badge.setAttribute("aria-label", count + " article" + (count !== 1 ? "s" : "") + " dans le panier");
    const cartLink = document.querySelector(".nav-cart");
    if (cartLink) cartLink.setAttribute("aria-label", "Panier (" + count + " article" + (count !== 1 ? "s" : "") + ")");
  };

  /* =============================================
     DÉCONNEXION (exposée globalement)
     ============================================= */
  window.logout = function () {
    localStorage.removeItem("femsport_session");
    window.location.href = base + "index.html";
  };

  /* Lancer l'initialisation */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
