================================================================================
  FemSport — Boutique Sport Femme
  Projet Web — Développement d'Applications Web
  Université Mouloud MAMMERI de Tizi-Ouzou | 2025-2026
================================================================================

────────────────────────────────────────────────────────────────────────────────
  DESCRIPTION DU SITE
────────────────────────────────────────────────────────────────────────────────

FemSport est un mini site e-commerce spécialisé dans les articles et vêtements
de sport pour femmes. La boutique propose quatre catégories de produits :

  • Leggings      — Tenues confortables et performantes
  • Brassières    — Support et style pour chaque activité
  • Chaussures    — Running, training et lifestyle
  • Accessoires   — Gourdes, sacs, bandanas et plus

Le site est entièrement côté client (HTML5 / CSS3 / JavaScript vanille).
Toutes les données sont stockées dans le navigateur via localStorage.

────────────────────────────────────────────────────────────────────────────────
  ARBORESCENCE DU PROJET
────────────────────────────────────────────────────────────────────────────────

FemSport/
│
├── index.html                  Page d'accueil
│
├── content/
│   ├── connexion.html          Page de connexion
│   ├── inscription.html        Page d'inscription
│   ├── produits.html           Catalogue produits (filtrage dynamique)
│   └── panier.html             Panier & commande
│
├── style/
│   ├── main.css                Variables CSS, reset, composants globaux
│   ├── nav.css                 Barre de navigation
│   ├── home.css                Page d'accueil
│   ├── produits.css            Page catalogue + modal produit
│   ├── auth.css                Pages connexion et inscription
│   └── panier.css              Page panier et commande
│
├── javascript/
│   ├── data.js                 Données produits (12 articles) et utilisateurs
│   ├── auth.js                 Authentification, validation RegEx, session
│   ├── nav.js                  Navigation dynamique commune à toutes les pages
│   ├── panier.js               Gestion du panier (CRUD, codes promo, commande)
│   ├── produits.js             Affichage et filtrage dynamique des produits
│   └── home.js                 Animations, produits vedettes, newsletter
│
├── images/                     Dossier images (URLs externes picsum.photos)
└── readme.txt                  Ce fichier

────────────────────────────────────────────────────────────────────────────────
  INSTRUCTIONS D'UTILISATION
────────────────────────────────────────────────────────────────────────────────

LANCEMENT DU SITE
  Ouvrir le fichier index.html dans un navigateur web moderne.
  (Chrome, Firefox, Edge, Safari — version récente recommandée)

  Remarque : Certaines fonctionnalités (chargement de polices Google Fonts,
  images picsum.photos) nécessitent une connexion internet.

NAVIGATION
  • Le menu de navigation est présent et fonctionnel sur toutes les pages.
  • Cliquer sur le logo « FemSport » revient toujours à l'accueil.
  • L'icône 🛒 en haut à droite indique le nombre d'articles dans le panier.

COMPTES DE DÉMONSTRATION (prédéfinis)
  ┌─────────────────────────────┬─────────────┐
  │ Email                       │ Mot de passe│
  ├─────────────────────────────┼─────────────┤
  │ admin@femsport.com          │ Admin123!   │
  │ test@femsport.com           │ Test123!    │
  │ sara@sport.com              │ Sara456@    │
  └─────────────────────────────┴─────────────┘

INSCRIPTION
  • Accéder à la page « Inscription ».
  • Remplir le formulaire : Prénom, Nom, Email, Téléphone (facultatif),
    Mot de passe (8+ car., 1 majuscule, 1 chiffre, 1 caractère spécial).
  • Valider et accepter les conditions d'utilisation.
  • Le compte est sauvegardé dans localStorage.

CONNEXION
  • Utiliser un compte de démonstration ou un compte créé via l'inscription.
  • La session est maintenue dans localStorage jusqu'à la déconnexion.

CATALOGUE PRODUITS
  • Filtrer par catégorie grâce aux boutons de filtrage (Tous / Leggings /
    Brassières / Chaussures / Accessoires).
  • Rechercher un produit via la barre de recherche.
  • Trier par prix, note ou nom.
  • Cliquer sur « Voir le produit » pour ouvrir la fiche détaillée.
  • Choisir une taille et une couleur, puis ajouter au panier.

PANIER
  • Modifier les quantités avec les boutons − et +.
  • Supprimer des articles ou vider tout le panier.
  • Appliquer un code promotionnel :
      FEMSPORT20  →  −20%
      SPORT10     →  −10%
      BIENVENUE   →  −15%
  • Livraison gratuite à partir de 50 €.
  • Cliquer sur « Passer la commande » (connexion requise).

────────────────────────────────────────────────────────────────────────────────
  FONCTIONNALITÉS TECHNIQUES IMPLÉMENTÉES
────────────────────────────────────────────────────────────────────────────────

  ✅ Manipulation du DOM (injection navbar, produits, modal, panier)
  ✅ Filtrage dynamique des produits côté client (aucune page par catégorie)
  ✅ Validation des formulaires avec expressions régulières (RegEx)
  ✅ Session utilisateur simulée via localStorage
  ✅ Indicateur de force du mot de passe en temps réel
  ✅ Balises sémantiques HTML5 (header, main, section, article, nav, footer…)
  ✅ Design responsive (mobile-first, CSS Grid, Flexbox)
  ✅ Accessibilité (ARIA labels, rôles, live regions, navigation clavier)
  ✅ Codes promo avec réduction dynamique
  ✅ Animations CSS et IntersectionObserver
  ✅ Fichiers HTML, CSS et JS strictement séparés

────────────────────────────────────────────────────────────────────────────────
  MEMBRES DU GROUPE
────────────────────────────────────────────────────────────────────────────────

  1. LABED AMINA     — Section :1      Groupe :7
  2. TOUAT MUSTAPHA  — Section :2      Groupe :2

================================================================================
  FemSport © 2025-2026 — Université Mouloud MAMMERI de Tizi-Ouzou
================================================================================
