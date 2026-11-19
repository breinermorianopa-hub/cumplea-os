
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const screens = document.querySelectorAll(".screen");

  // =========================================================
  // CARGAR CONTENIDO DE LA CARTA DESDE content.js
  // =========================================================

  if (typeof birthdayContent !== "undefined") {
    const letter = birthdayContent.letter;

    const letterTitle = document.getElementById("letter-title");
    const letterGreeting = document.getElementById("letter-greeting");
    const letterParagraphs = document.getElementById("letter-paragraphs");
    const letterClosing = document.getElementById("letter-closing");

    if (letterTitle) {
      letterTitle.textContent = letter.title;
    }

    if (letterGreeting) {
      letterGreeting.textContent = letter.greeting;
    }

    if (letterParagraphs) {
      letterParagraphs.replaceChildren();

      letter.paragraphs.forEach((paragraph) => {
        const p = document.createElement("p");
        p.textContent = paragraph;
        letterParagraphs.appendChild(p);
      });
    }

    if (letterClosing) {
      letterClosing.textContent = letter.closing;
    }
  }

  // =========================================================
  // CARGAR LOS TRES MENSAJES SECRETOS DESDE content.js
  // =========================================================

  if (typeof birthdayContent !== "undefined") {
    const secretEnvelopes = document.querySelectorAll(".secret-envelope");
    const secretMessages = birthdayContent.messages.items;

    secretEnvelopes.forEach((envelope, index) => {
      const message = secretMessages[index];

      if (!message) return;

      const label = envelope.querySelector(".envelope-label");

      if (label) {
        label.textContent = message.title;
      }

      envelope.dataset.message = message.text;
    });
  }


  function showScreen(screenId) {
    const targetScreen = document.getElementById(screenId);

    if (!targetScreen || !targetScreen.classList.contains("screen")) {
      console.warn(`No se encontró la pantalla: ${screenId}`);
      return;
    }

    screens.forEach((screen) => {
      screen.classList.remove("active");
      screen.setAttribute("aria-hidden", "true");
    });

    targetScreen.classList.add("active");
    targetScreen.setAttribute("aria-hidden", "false");

    // Recalcular las posiciones cuando la pantalla ya es visible.
    window.dispatchEvent(new Event("resize"));

    requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
    });

    targetScreen.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  // Compartir la navegación con interactions.js.
  window.birthdayApp = { showScreen };

  // Botón de bienvenida: abre el universo.
  const startButton = document.getElementById("start-button");

  if (startButton) {
    startButton.addEventListener("click", () => {
      showScreen("universe");
    });
  }

  // Botón para abrir la carta desde el universo.
  const letterButton = document.getElementById("continue-to-letter");

  if (letterButton) {
    letterButton.addEventListener("click", () => {
      if (letterButton.hidden) return;
      showScreen("letter");
    });
  }

  // Desde la carta, abrir los mensajes secretos.
  const messagesButton = document.getElementById("continue-to-messages");

  if (messagesButton) {
    messagesButton.addEventListener("click", () => {
      showScreen("messages");
    });
  }

  // Mostrar la bienvenida al cargar.
  showScreen("welcome");

  console.log("💜 Aplicación de cumpleaños lista.");
});

