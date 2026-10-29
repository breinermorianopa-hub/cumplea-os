
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const screens = document.querySelectorAll(".screen");

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

