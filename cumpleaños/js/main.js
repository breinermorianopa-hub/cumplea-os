
/* ========================================
   UN PEQUEÑO UNIVERSO PARA TI
   Lógica principal de la aplicación
======================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

  // 1. Obtener todas las pantallas
  const screens = document.querySelectorAll(".screen");

  // 2. Función para cambiar de pantalla
  function showScreen(screenId) {
    const targetScreen = document.getElementById(screenId);

    if (!targetScreen || !targetScreen.classList.contains("screen")) {
      console.warn(`No se encontró la pantalla: ${screenId}`);
      return;
    }

    // Ocultar las pantallas
    screens.forEach((screen) => {
      screen.classList.remove("active");
      screen.setAttribute("aria-hidden", "true");
    });

    // Mostrar la pantalla elegida
    targetScreen.classList.add("active");
    targetScreen.setAttribute("aria-hidden", "false");

    // Volver al inicio del contenido
    targetScreen.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  // 3. Conectar los botones de navegación
  const navigation = [
    ["start-button", "universe"],
    ["continue-to-letter", "letter"],
    ["continue-to-messages", "messages"],
    ["continue-to-birthday", "birthday"],
    ["continue-to-final", "final"],
    ["replay-surprise", "welcome"]
  ];

  navigation.forEach(([buttonId, screenId]) => {
    const button = document.getElementById(buttonId);

    if (button) {
      button.addEventListener("click", () => {
        showScreen(screenId);
      });
    } else {
      console.warn(`No se encontró el botón: ${buttonId}`);
    }
  });

  // 4. Estado inicial: mostrar únicamente la bienvenida
  showScreen("welcome");

  // 5. Compartir la navegación con otros archivos
  window.birthdayApp = {
    showScreen
  };

  console.log("💜 La aplicación de cumpleaños está lista.");

});

