/**
 * profil.js — Gestion de l'espace membre et de l'historique
 * FemSport — Boutique Sport Femme
 */

(function () {
  "use strict";

  function initProfilPage() {
    var currentUser = JSON.parse(localStorage.getItem("femsport_session") || "null");
    
    // Sécurité : redirection si l'utilisateur n'est pas connecté
    if (!currentUser) {
      window.location.href = "connexion.html";
      return;
    }

    // Injection des données personnelles
    var nomEl = document.getElementById("profil-nom");
    var emailEl = document.getElementById("profil-email");
    if (nomEl) nomEl.textContent = currentUser.prenom + " " + currentUser.nom;
    if (emailEl) emailEl.textContent = currentUser.email;

    // Gestion de l'avatar
    var defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23A0A0AE'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
    var avatarImg = document.getElementById("profil-avatar-img");
    var avatarInput = document.getElementById("profil-avatar-input");
    
    if (avatarImg) {
      avatarImg.src = currentUser.avatar || defaultAvatar;
    }

    if (avatarInput) {
      avatarInput.addEventListener("change", function(e) {
        var file = e.target.files[0];
        if (!file) return;
        
        // Lecture du fichier image
        var reader = new FileReader();
        reader.onload = function(event) {
          var base64Str = event.target.result;
          if (avatarImg) avatarImg.src = base64Str;
          
          // Sauvegarde dans la session actuelle
          currentUser.avatar = base64Str;
          localStorage.setItem("femsport_session", JSON.stringify(currentUser));
          
          // Sauvegarde dans la base de données utilisateurs (localStorage)
          var allUsers = JSON.parse(localStorage.getItem("femsport_users") || "[]");
          var uIndex = allUsers.findIndex(function(u) { return u.email === currentUser.email; });
          if (uIndex > -1) {
            allUsers[uIndex].avatar = base64Str;
            localStorage.setItem("femsport_users", JSON.stringify(allUsers));
          }
          
          // Met à jour la barre de navigation instantanément
          if (typeof window.updateNavAvatar === "function") window.updateNavAvatar(base64Str);
        };
        reader.readAsDataURL(file);
      });
    }

    // Chargement de l'historique
    var ordersContainer = document.getElementById("profil-orders");
    if (!ordersContainer) return;

    var allOrders = JSON.parse(localStorage.getItem("femsport_orders") || "[]");
    var userOrders = allOrders.filter(function (o) { return o.userEmail === currentUser.email; });

    if (userOrders.length === 0) {
      ordersContainer.innerHTML = "<p>Vous n'avez pas encore passé de commande.</p><a href=\"produits.html\" class=\"btn btn--primary\" style=\"margin-top: 1rem;\">Découvrir nos produits</a>";
      return;
    }

    // Affichage des commandes de la plus récente à la plus ancienne
    var html = "";
    userOrders.reverse().forEach(function (order) {
      var dateObj = new Date(order.date);
      var dateStr = dateObj.toLocaleDateString("fr-FR", { day: '2-digit', month: 'long', year: 'numeric' }) + " à " + dateObj.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' });
      
      var itemsHtml = order.items.map(function (item) {
        return "<li><span class=\"order-item-qty\">" + item.quantity + "x</span> " + escapeHtml(item.name) + " <small>(" + item.size + " - " + item.price.toLocaleString("fr-FR", { style: 'currency', currency: 'EUR' }) + ")</small></li>";
      }).join("");

      html += 
        '<div class="order-card" role="listitem">' +
          '<div class="order-header">' +
            '<div><span class="order-id">Commande n° ' + escapeHtml(order.id) + '</span><span class="order-date">Passée le ' + dateStr + '</span></div>' +
            '<span class="order-status">' + escapeHtml(order.status) + '</span>' +
          '</div>' +
          '<ul class="order-items">' + itemsHtml + '</ul>' +
          '<div class="order-footer"><span>Total TTC</span><span>' + order.total.toLocaleString("fr-FR", { style: 'currency', currency: 'EUR' }) + '</span></div>' +
        '</div>';
    });

    ordersContainer.innerHTML = html;
  }

  function escapeHtml(str) { var map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }; return String(str).replace(/[&<>"']/g, function (c) { return map[c]; }); }

  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", initProfilPage) : initProfilPage();
})();