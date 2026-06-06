/**
 * panier.js — Gestion du panier d'achat (localStorage)
 * FemSport — Boutique Sport Femme
 */

"use strict";

var CART_KEY  = "femsport_cart";
var PROMO_KEY = "femsport_promo";

/* Codes promo valides */
// Note: Les codes promo sont maintenant en minuscules pour la saisie, mais la logique les convertit en majuscules.
var PROMO_CODES = {
  "FEMSPORT20": { label: "FemSport \u221220%", percent: 20 },
  "SPORT10":    { label: "Sport \u221210%",    percent: 10 },
  "BIENVENUE":  { label: "Bienvenue \u221215%", percent: 15 }
};

/* Utilitaire pour corriger le chemin des images */
function getCorrectImgPath(path) {
  if (!path || path.startsWith("http")) return path;
  var isSub = window.location.pathname.indexOf("/content/") > -1;
  return (isSub ? "../" : "") + path;
}

/* =============================================
   CRUD PANIER
   ============================================= */

// Fonction pour récupérer le panier depuis le localStorage
// Gère les erreurs de parsing JSON pour éviter de bloquer l'application
// Retourne un tableau vide si aucune donnée ou si erreur
// @returns {Array} Le contenu du panier
function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
  catch (e) { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  // Met à jour le badge du panier dans la navigation si la fonction existe
  if (typeof window.updateNavCartBadge === "function") window.updateNavCartBadge();
}

// Ajoute un produit au panier ou incrémente sa quantité s'il existe déjà
// @param {number} productId - L'ID du produit
// @param {string} size - La taille du produit
// @param {string} color - La couleur du produit
function addToCart(productId, size, color) {
  // Vérifie si la liste des produits est disponible (dépend de data.js)
  if (typeof PRODUCTS === "undefined") { console.error("data.js requis"); return; }
  var product = PRODUCTS.find(function (p) { return p.id === productId; });
  if (!product) return;
  var cart = getCart();
  var idx  = cart.findIndex(function (i) {
    return i.id === productId && i.size === size && i.color === color;
  });
  if (idx > -1) {
    cart[idx].quantity += 1;
  } else {
    cart.push({
      id: productId, name: product.name, category: product.category,
      price: product.price, image: product.image,
      size:  size  || (product.sizes  && product.sizes[0])  || "M",
      color: color || (product.colors && product.colors[0]) || "#000",
      quantity: 1
    });
  }
  saveCart(cart);
  showCartToast(product.name);
}

// Supprime un article spécifique du panier
// @param {number} productId - L'ID du produit
// @param {string} size - La taille du produit
// @param {string} color - La couleur du produit
function removeFromCart(productId, size, color) {
  saveCart(getCart().filter(function (i) {
    return !(i.id === productId && i.size === size && i.color === color);
  }));
}
// Met à jour la quantité d'un article spécifique dans le panier
// Si la quantité est <= 0, l'article est supprimé
function updateCartQuantity(productId, size, color, quantity) {
  if (quantity <= 0) { removeFromCart(productId, size, color); return; }
  var cart = getCart();
  var item = cart.find(function (i) { return i.id===productId && i.size===size && i.color===color; });
  if (item) { item.quantity = quantity; saveCart(cart); }
}

// Vide entièrement le panier et supprime le code promo appliqué
function clearCart() {
  localStorage.removeItem(CART_KEY);
  localStorage.removeItem(PROMO_KEY);
  if (typeof window.updateNavCartBadge === "function") window.updateNavCartBadge();
}

// Calcule le nombre total d'articles dans le panier
// @returns {number} Le nombre total d'articles
function getCartCount() {
  return getCart().reduce(function (s, i) { return s + i.quantity; }, 0);
}

// Calcule le sous-total du panier (avant réductions, livraison, TVA)
function getCartTotal() {
  return getCart().reduce(function (s, i) { return s + i.price * i.quantity; }, 0);
}

/* =============================================
   TOAST
   ============================================= */

// Affiche un toast de confirmation après l'ajout d'un produit au panier
function showCartToast(productName) {
  var old = document.querySelector(".cart-toast");
  if (old) old.remove();
  var isSubPage = window.location.pathname.indexOf("/content/") > -1;
  var href = isSubPage ? "panier.html" : "content/panier.html";
  var toast = document.createElement("div");
  toast.className = "cart-toast";
  toast.setAttribute("role", "alert");
  toast.innerHTML =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>' +
    '<span><strong>' + escapeHtml(productName) + '</strong> ajout\u00e9 au panier</span>' +
    '<a href="' + href + '" class="toast-link">Voir le panier \u2192</a>';
  document.body.appendChild(toast);
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { toast.classList.add("cart-toast--visible"); });
  });
  var t = setTimeout(function () { dismissToast(toast); }, 3500);
  toast.addEventListener("click", function () { clearTimeout(t); dismissToast(toast); });
}

// Masque et supprime un toast
function dismissToast(toast) {
  toast.classList.remove("cart-toast--visible");
  setTimeout(function () { if (toast.parentNode) toast.remove(); }, 350);
}

/* =============================================
   PAGE PANIER
   ============================================= */

// Initialise la page panier
function initPanierPage() {
  if (!document.getElementById("cart-layout")) return; // Vérifie si l'élément principal du panier est présent
  renderCart();
  updateSummary();

  /* Bouton vider */
  var bc = document.getElementById("btn-clear-cart");
  if (bc) bc.addEventListener("click", function () {
    if (window.confirm("Vider tout le panier ?")) { clearCart(); renderCart(); }
  });

  /* Bouton commander */
  var bco = document.getElementById("btn-checkout");
  if (bco) bco.addEventListener("click", placeOrder);

  /* Promo */
  var bp = document.getElementById("btn-apply-promo");
  if (bp) bp.addEventListener("click", applyPromoCode);

  /* Écouteurs sur les choix de livraison */
  var shippingRadios = document.querySelectorAll('input[name="shipping-method"]');
  shippingRadios.forEach(function(radio) {
    radio.addEventListener("change", updateSummary);
  });
}

// Rend le contenu du panier (liste des articles, résumé, état vide/plein)
function renderCart() {
  var cart             = getCart();
  var cartCount        = getCartCount();
  var emptyEl          = document.getElementById("cart-empty");
  var cartItemsSection = document.getElementById("cart-items-section");
  var confirmEl        = document.getElementById("order-confirm");
  var listEl           = document.getElementById("cart-list");
  var headerCountEl    = document.getElementById("cart-page-header-count");
  var sectionTitleEl   = document.getElementById("cart-items-title");
  var btnCheckout      = document.getElementById("btn-checkout");

  // Mise à jour des compteurs (Titres)
  if (headerCountEl) headerCountEl.textContent = `(${cartCount})`;
  if (sectionTitleEl) sectionTitleEl.textContent = `Articles (${cartCount})`;

  if (confirmEl && !confirmEl.hidden) return;

  // LOGIQUE D'AFFICHAGE : ÉVITE LE BUG "VIDE" + "ARTICLES"
  if (cartCount === 0) {
    if (emptyEl) emptyEl.hidden = false;
    if (cartItemsSection) cartItemsSection.hidden = true;
    if (btnCheckout) btnCheckout.disabled = true; // Désactive le bouton si vide
    updateSummary(); // Remet les prix à zéro
    return;
  } else {
    if (emptyEl) emptyEl.hidden = true;
    if (cartItemsSection) cartItemsSection.hidden = false;
    if (btnCheckout) btnCheckout.disabled = false;
  }

  var html = "";
  cart.forEach(function (item) {
    var sub = (item.price * item.quantity).toLocaleString("fr-FR");
    html +=
      `<li class="cart-item">
        <img src="${getCorrectImgPath(item.image)}" alt="${escapeHtml(item.name)}" class="cart-item-img">
        <div class="cart-item-info">
          <h3>${escapeHtml(item.name)}</h3>
          <p class="cart-item-meta">${item.category === 'chaussures' ? 'Pointure' : 'Taille'} : <strong>${item.size}</strong> | Couleur : <span class="color-dot" style="background:${item.color}"></span></p>
          <p class="cart-item-price-unit">${item.price.toLocaleString("fr-FR")} € / unité</p>
        </div>
        <div class="cart-item-controls">
          <div class="qty-control">
            <button type="button" class="qty-btn" onclick="changeQty(${item.id},'${item.size}','${item.color}',-1)">−</button>
            <span class="qty-value">${item.quantity}</span>
            <button type="button" class="qty-btn" onclick="changeQty(${item.id},'${item.size}','${item.color}',1)">+</button>
          </div>
          <p class="cart-item-subtotal">${sub} €</p>
          <button type="button" class="btn-remove" onclick="removeItem(${item.id},'${item.size}','${item.color}')" title="Supprimer">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </li>`;
  });
  listEl.innerHTML = html;
  updateSummary();
}

// Met à jour le récapitulatif de la commande (sous-total, livraison, TVA, total)
function updateSummary() {
  var subtotal = getCartTotal();
  var promo    = getActivePromo();
  var discount = promo ? (subtotal * promo.percent / 100) : 0;
  var afterDiscount = subtotal - discount;

  // Livraison
  var shippingEl = document.querySelector('input[name="shipping-method"]:checked');
  var shipping   = shippingEl ? parseFloat(shippingEl.value) : 0;

  // Calcul TVA (sur le montant après remise + port)
  var totalHT        = afterDiscount + shipping;
  var tva            = totalHT * 0.20; 
  var total          = totalHT + tva;

  setText("summary-subtotal", subtotal.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " €");
  setText("summary-discount", "-" + discount.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " €"); // Display discount
  setText("summary-shipping", shipping === 0 ? "Gratuit" : shipping.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " €");
  setText("summary-vat",      tva.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €");
  setText("summary-total",    total.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " €");

  // Hide discount line if no discount
  var discountLine = document.getElementById("summary-discount");
  if (discountLine) {
    var parentLine = discountLine.closest(".summary-line");
    if (parentLine) parentLine.hidden = (discount === 0);
  }
  var promoLine = document.getElementById("promo-line");
  var promoVal  = document.getElementById("summary-promo");
  if (promoLine && promoVal) {
    // Affiche la ligne de promo seulement si un promo est actif ET qu'il y a une réduction
    promoLine.hidden = !(promo && discount > 0);
    if (promo && discount > 0) promoVal.textContent = "\u2212" + discount.toLocaleString("fr-FR") + " € (" + promo.label + ")";
  }
}

function setText(id, val) { var el=document.getElementById(id); if(el) el.textContent=val; }

// Récupère le code promo actif depuis le localStorage
/* Promo */
function getActivePromo() {
  try { return JSON.parse(localStorage.getItem(PROMO_KEY)); } catch(e) { return null; }
}

function applyPromoCode() {
  var input = document.getElementById("promo-code");
  var msgEl = document.getElementById("promo-msg");
  if (!input || !msgEl) return;
  var code  = input.value.trim().toUpperCase();
  var promo = PROMO_CODES[code]; // Vérifie si le code existe dans la liste des codes valides
  if (!code) { showPromoMsg(msgEl, "Veuillez saisir un code.", "error"); return; } // Si le champ est vide
  if (!promo) { showPromoMsg(msgEl, "Code invalide ou expir\u00e9.", "error"); return; } // Si le code n'est pas reconnu
  localStorage.setItem(PROMO_KEY, JSON.stringify(promo)); // Sauvegarde le code promo actif
  showPromoMsg(msgEl, "Code " + code + " appliqu\u00e9 : " + promo.label, "success");
  updateSummary();
}

function showPromoMsg(el, msg, type) {
  el.textContent = msg;
  el.className   = "promo-msg promo-msg--" + type;
}

// Traite la commande lorsque l'utilisateur clique sur "Commander maintenant"
/* Commande */
window.placeOrder = function () {
  var user = null;
  try { user = JSON.parse(localStorage.getItem("femsport_session")); } catch(e){}
  if (!user) {
    // Redirige vers la page de connexion si l'utilisateur n'est pas connecté
    var sub = window.location.pathname.indexOf("/content/") > -1;
    window.location.href = (sub ? "" : "content/") + "connexion.html?redirect=panier";
    return;
  }
  if (getCart().length === 0) {
    alert("Votre panier est vide. Veuillez ajouter des articles avant de commander.");
    return;
  }

  var subtotal = getCartTotal();
  var promo    = getActivePromo();
  var discount = promo ? (subtotal * promo.percent / 100) : 0;
  var afterDiscount = subtotal - discount;

  // Récupère le coût de livraison sélectionné
  var shippingEl = document.querySelector('input[name="shipping-method"]:checked');
  var sh         = shippingEl ? parseFloat(shippingEl.value) : 0;

  var totalBeforeTVA = afterDiscount + sh;
  var tva            = totalBeforeTVA * 0.20;
  var total          = totalBeforeTVA + tva; // Total final TTC
  var orderNumber    = "FS-" + Date.now().toString().slice(-8).toUpperCase(); // Génère un numéro de commande unique

  /* Sauvegarde de la commande dans l'historique */
  var order = {
    id: orderNumber, date: new Date().toISOString(), total: total,
    items: getCart(), userEmail: user.email, status: "En préparation"
  };

  var orders = JSON.parse(localStorage.getItem("femsport_orders") || "[]");
  orders.push(order);
  localStorage.setItem("femsport_orders", JSON.stringify(orders));

  clearCart();
  var emptyEl = document.getElementById("cart-empty");
  var contEl  = document.getElementById("cart-container");
  if (emptyEl) emptyEl.hidden = true; // Cache le message "panier vide"
  if (contEl)  contEl.hidden  = true; // Cache la section des articles (si elle était visible)
  var confirmEl  = document.getElementById("order-confirm");
  var orderNumEl = document.getElementById("order-number");
  if (confirmEl) {
    if (orderNumEl) orderNumEl.textContent = "N\u00b0 " + orderNumber + " — Total : " + total.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " €";
    confirmEl.hidden = false;
    confirmEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};

/* Actions inline */
window.changeQty = function (id, size, color, delta) {
  var item = getCart().find(function (i) { return i.id===id && i.size===size && i.color===color; });
  if (!item) return;
  updateCartQuantity(id, size, color, item.quantity + delta);
  renderCart();
};

window.removeItem = function (id, size, color) {
  removeFromCart(id, size, color);
  renderCart();
};

// Fonction utilitaire pour échapper les caractères HTML
function escapeHtml(str) {
  var map = {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};
  return String(str).replace(/[&<>"']/g, function (c) { return map[c]; });
}

window.addToCart = addToCart;

document.addEventListener("DOMContentLoaded", initPanierPage);
