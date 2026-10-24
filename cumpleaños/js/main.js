
/* ========================================
   UN PEQUEÑO UNIVERSO PARA TI
   Lógica principal de la aplicación
======================================== */

"use strict";

// 1. Esperar a que el HTML esté preparado
document.addEventListener("DOMContentLoaded", () => {

  // 2. Obtener todas las pantallas
  const screens = document.querySelectorAll(".screen");

  // 3. Obtener el botón de bienvenida
  const startButton = document.getElementById("start-button");

  // 4. Función para mostrar una pantalla
  function showScreen(screenId) {
    const targetScreen = document.getElementById(screenId);

    // Comprobar que la pantalla exista
    if (!targetScreen || !targetScreen.classList.contains("screen")) {
      console.warn(`No se encontró la pantalla: ${screenId}`);
      return;
    }

    // Ocultar todas las pantallas
    screens.forEach((screen) => {
      screen.classList.remove("active");
      screen.setAttribute("aria-hidden", "true");
    });

    // Mostrar la pantalla solicitada
    targetScreen.classList.add("active");
    targetScreen.setAttribute("aria-hidden", "false");
  }

  // 5. Conectar el botón de bienvenida
  if (startButton) {
    startButton.addEventListener("click", () => {
      showScreen("universe");
    });
    
const messagesButton = document.getElementById("continue-to-messages");

if (messagesButton) {
  messagesButton.addEventListener("click", () => {
    showScreen("messages");
  });
}

  }

const continueButton = document.getElementById("continue-to-letter");

if (continueButton) {
  continueButton.addEventListener("click", () => {
    showScreen("letter");
  });
}

  // 6. Dejar visible únicamente la bienvenida al iniciar
  showScreen("welcome");

  // 7. Permitir que otros archivos utilicen esta función
  window.birthdayApp = {
    showScreen
  };

  console.log("💜 La aplicación de cumpleaños está lista.");
});

