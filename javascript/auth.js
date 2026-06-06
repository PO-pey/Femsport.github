/**
 * auth.js — Authentification simulée + Gestion de session
 * FemSport — Boutique Sport Femme
 */

/* =============================================
   CLÉS LOCALSTORAGE
   ============================================= */
const LS_SESSION  = "femsport_session";
const LS_USERS    = "femsport_users";

/* =============================================
   EXPRESSIONS RÉGULIÈRES (RegEx)
   ============================================= */
const REGEX = {
  email:    /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#\-])[A-Za-z\d@$!%*?&_#\-]{8,}$/,
  name:     /^[a-zA-ZÀ-ÿ\s'\-]{2,50}$/,
  phone:    /^(\+213|0)(5|6|7)\d{8}$/
};

/* =============================================
   MESSAGES D'ERREUR DE VALIDATION
   ============================================= */
const MESSAGES = {
  email:    "Adresse email invalide.",
  password: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial (@$!%*?&_#-).",
  name:     "Le nom doit contenir entre 2 et 50 caractères alphabétiques.",
  phone:    "Numéro de téléphone invalide (ex: 0661234567).",
  required: "Ce champ est obligatoire.",
  match:    "Les mots de passe ne correspondent pas."
};

/* =============================================
   FONCTIONS UTILITAIRES
   ============================================= */

/**
 * Récupère les utilisateurs enregistrés via localStorage.
 * @returns {Array} Liste des utilisateurs enregistrés
 */
function getRegisteredUsers() {
  return JSON.parse(localStorage.getItem(LS_USERS) || "[]");
}

/**
 * Sauvegarde les utilisateurs enregistrés dans localStorage.
 * @param {Array} users
 */
function saveRegisteredUsers(users) {
  localStorage.setItem(LS_USERS, JSON.stringify(users));
}

/**
 * Retourne l'utilisateur de session actuel ou null.
 * @returns {Object|null}
 */
function getCurrentUser() {
  const raw = localStorage.getItem(LS_SESSION);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Ouvre une session et stocke l'utilisateur dans localStorage.
 * @param {Object} user
 */
function setCurrentUser(user) {
  const session = {
    prenom: user.prenom,
    nom:    user.nom,
    email:  user.email,
    avatar: user.avatar || null
  };
  localStorage.setItem(LS_SESSION, JSON.stringify(session));
}

/**
 * Déconnecte l'utilisateur et redirige vers l'accueil.
 */
function logout() {
  localStorage.removeItem(LS_SESSION);
  const isSubPage = window.location.pathname.includes("/content/");
  window.location.href = isSubPage ? "../index.html" : "index.html";
}

/* =============================================
   VALIDATION DES CHAMPS
   ============================================= */

/**
 * Valide un champ et affiche/masque le message d'erreur associé.
 * @param {HTMLInputElement} input
 * @param {RegExp|null} regex - null = uniquement vérification de présence
 * @param {string} errorMsg
 * @returns {boolean}
 */
function validateField(input, regex, errorMsg) {
  const errorEl = document.getElementById(input.id + "-error");
  const val = input.value.trim();

  if (!val) {
    showError(input, errorEl, MESSAGES.required);
    return false;
  }
  if (regex && !regex.test(val)) {
    showError(input, errorEl, errorMsg);
    return false;
  }
  clearError(input, errorEl);
  return true;
}

function showError(input, errorEl, msg) {
  input.classList.add("input-error");
  if (errorEl) { errorEl.textContent = msg; errorEl.hidden = false; }
}

function clearError(input, errorEl) {
  input.classList.remove("input-error");
  if (errorEl) { errorEl.textContent = ""; errorEl.hidden = true; }
}

/* =============================================
   CONNEXION
   ============================================= */

/**
 * Tente de connecter un utilisateur.
 * @param {string} email
 * @param {string} password
 * @returns {{ success: boolean, message?: string, user?: Object }}
 */
function login(email, password) {
  const allUsers = [...STATIC_USERS, ...getRegisteredUsers()];
  const user = allUsers.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (user) {
    setCurrentUser(user);
    return { success: true, user };
  }
  return { success: false, message: "Email ou mot de passe incorrect. Vérifiez vos identifiants." };
}

/* =============================================
   INSCRIPTION
   ============================================= */

/**
 * Crée un nouveau compte utilisateur.
 * @param {Object} data
 * @returns {{ success: boolean, message?: string, user?: Object }}
 */
function register({ prenom, nom, email, password, phone }) {
  const allUsers = [...STATIC_USERS, ...getRegisteredUsers()];

  if (allUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, message: "Cette adresse email est déjà utilisée." };
  }

  const newUser = { prenom, nom, email, password, phone };
  const registered = getRegisteredUsers();
  registered.push(newUser);
  saveRegisteredUsers(registered);
  setCurrentUser(newUser);

  return { success: true, user: newUser };
}

/* =============================================
   INITIALISATION — PAGE CONNEXION
   ============================================= */
function initLoginPage() {
  const form = document.getElementById("login-form");
  if (!form) return;

  /* Rediriger si déjà connecté */
  if (getCurrentUser()) {
    const isSubPage = window.location.pathname.includes("/content/");
    window.location.href = isSubPage ? "../index.html" : "index.html";
    return;
  }

  const emailInput    = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  const globalMsg     = document.getElementById("login-global-msg");

  /* Initialiser les boutons d'affichage de mot de passe */
  initPasswordToggles();

  /* Validation à la saisie */
  emailInput.addEventListener("blur", () => validateField(emailInput, REGEX.email, MESSAGES.email));
  passwordInput.addEventListener("blur", () => validateField(passwordInput, null, ""));

  /* Soumission */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const emailOk    = validateField(emailInput,    REGEX.email, MESSAGES.email);
    const passwordOk = validateField(passwordInput, null, "");

    if (!emailOk || !passwordOk) return;

    const result = login(emailInput.value.trim(), passwordInput.value);

    if (result.success) {
      showGlobalMessage(globalMsg, `Bienvenue, ${result.user.prenom} ! Connexion réussie.`, "success");
      const isSubPage = window.location.pathname.includes("/content/");
      setTimeout(() => { window.location.href = isSubPage ? "../index.html" : "index.html"; }, 1200);
    } else {
      showGlobalMessage(globalMsg, result.message, "error");
    }
  });
}

/* =============================================
   INITIALISATION — PAGE INSCRIPTION
   ============================================= */
function initRegisterPage() {
  const form = document.getElementById("register-form");
  if (!form) return;

  if (getCurrentUser()) {
    const isSubPage = window.location.pathname.includes("/content/");
    window.location.href = isSubPage ? "../index.html" : "index.html";
    return;
  }

  const prenomInput    = document.getElementById("register-prenom");
  const nomInput       = document.getElementById("register-nom");
  const emailInput     = document.getElementById("register-email");
  const phoneInput     = document.getElementById("register-phone");
  const passwordInput  = document.getElementById("register-password");
  const confirmInput   = document.getElementById("register-confirm");
  const globalMsg      = document.getElementById("register-global-msg");

  initPasswordToggles();

  /* Validation à la saisie */
  prenomInput.addEventListener("blur",   () => validateField(prenomInput,   REGEX.name,     MESSAGES.name));
  nomInput.addEventListener("blur",      () => validateField(nomInput,      REGEX.name,     MESSAGES.name));
  emailInput.addEventListener("blur",    () => validateField(emailInput,    REGEX.email,    MESSAGES.email));
  phoneInput.addEventListener("blur",    () => validateField(phoneInput,    REGEX.phone,    MESSAGES.phone));
  passwordInput.addEventListener("blur", () => {
    validateField(passwordInput, REGEX.password, MESSAGES.password);
    updatePasswordStrength(passwordInput.value);
  });
  passwordInput.addEventListener("input", () => updatePasswordStrength(passwordInput.value));

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const prenomOk   = validateField(prenomInput,   REGEX.name,     MESSAGES.name);
    const nomOk      = validateField(nomInput,      REGEX.name,     MESSAGES.name);
    const emailOk    = validateField(emailInput,    REGEX.email,    MESSAGES.email);
    const phoneOk    = validateField(phoneInput,    REGEX.phone,    MESSAGES.phone);
    const passOk     = validateField(passwordInput, REGEX.password, MESSAGES.password);

    /* Vérification de la correspondance des mots de passe */
    const confirmErrorEl = document.getElementById(confirmInput.id + "-error");
    let confirmOk = true;
    if (confirmInput.value !== passwordInput.value) {
      showError(confirmInput, confirmErrorEl, MESSAGES.match);
      confirmOk = false;
    } else {
      clearError(confirmInput, confirmErrorEl);
    }

    if (!prenomOk || !nomOk || !emailOk || !phoneOk || !passOk || !confirmOk) return;

    const result = register({
      prenom:   prenomInput.value.trim(),
      nom:      nomInput.value.trim(),
      email:    emailInput.value.trim(),
      password: passwordInput.value,
      phone:    phoneInput.value.trim()
    });

    if (result.success) {
      showGlobalMessage(globalMsg, `Compte créé avec succès ! Bienvenue, ${result.user.prenom} !`, "success");
      const isSubPage = window.location.pathname.includes("/content/");
      setTimeout(() => { window.location.href = isSubPage ? "../index.html" : "index.html"; }, 1400);
    } else {
      showGlobalMessage(globalMsg, result.message, "error");
    }
  });
}

/* =============================================
   UTILITAIRES UI
   ============================================= */

/**
 * Affiche un message global dans le formulaire.
 */
function showGlobalMessage(el, msg, type) {
  if (!el) return;
  el.textContent = msg;
  el.className = "form-global-msg form-global-msg--" + type;
  el.hidden = false;
}

/**
 * Met à jour l'indicateur de force du mot de passe.
 */
function updatePasswordStrength(val) {
  const bar = document.getElementById("strength-bar");
  const label = document.getElementById("password-strength-label");
  if (!bar || !label) return;

  let score = 0;
  if (val.length >= 8)                  score++;
  if (/[A-Z]/.test(val))               score++;
  if (/[a-z]/.test(val))               score++;
  if (/\d/.test(val))                   score++;
  if (/[@$!%*?&_#\-]/.test(val))       score++;

  const levels = ["", "Très faible", "Faible", "Moyen", "Fort", "Très fort"];
  const classes = ["", "strength-1", "strength-2", "strength-3", "strength-4", "strength-5"];

  bar.className = "strength-bar " + (classes[score] || "");
  bar.style.width = (score * 20) + "%";
  label.textContent = levels[score] || "";
}

/**
 * Initialise les boutons pour afficher/masquer les mots de passe.
 */
function initPasswordToggles() {
  const toggles = document.querySelectorAll(".toggle-password");
  toggles.forEach(btn => {
    btn.onclick = function () {
      const wrap = this.closest(".input-password-wrap");
      if (!wrap) return;
      const input = wrap.querySelector("input");
      if (input) {
        const type = input.getAttribute("type") === "password" ? "text" : "password";
        input.setAttribute("type", type);
        this.innerHTML = type === "password" 
          ? '<span class="eye-icon" aria-hidden="true">👁</span>' 
          : '<span class="eye-icon" aria-hidden="true" style="opacity: 0.5; text-decoration: line-through;">👁</span>';
      }
    };
  });
}

/* =============================================
   LANCEMENT DE L'INITIALISATION
   ============================================= */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    initLoginPage();
    initRegisterPage();
  });
} else {
  initLoginPage();
  initRegisterPage();
}
