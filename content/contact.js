document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const nameInput = document.getElementById("contact-name");
  const emailInput = document.getElementById("contact-email");
  const subjectInput = document.getElementById("contact-subject");
  const messageInput = document.getElementById("contact-message");
  const globalMsg = document.getElementById("contact-global-msg");

  nameInput.addEventListener("blur", () => validateField(nameInput, REGEX.name, MESSAGES.name));
  emailInput.addEventListener("blur", () => validateField(emailInput, REGEX.email, MESSAGES.email));
  subjectInput.addEventListener("blur", () => validateField(subjectInput, null, MESSAGES.required));
  messageInput.addEventListener("blur", () => validateField(messageInput, null, MESSAGES.required));
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nameOk = validateField(nameInput, REGEX.name, MESSAGES.name);
    const emailOk = validateField(emailInput, REGEX.email, MESSAGES.email);
    const subjectOk = validateField(subjectInput, null, MESSAGES.required);
    const messageOk = validateField(messageInput, null, MESSAGES.required);

    if (!nameOk || !emailOk || !subjectOk || !messageOk) {
      showGlobalMessage(globalMsg, "Veuillez corriger les erreurs dans le formulaire.", "error");
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.textContent = "Envoi en cours...";

    setTimeout(() => {
      showGlobalMessage(globalMsg, "Merci ! Votre message a bien été envoyé. Nous vous répondrons sous 24h.", "success");
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      
      setTimeout(() => {
        globalMsg.hidden = true;
      }, 5000);
    }, 1500);
  });
});

function showGlobalMessage(el, msg, type) {
  if (!el) return;
  el.textContent = msg;
  el.className = "form-global-msg form-global-msg--" + type;
  el.hidden = false;
}