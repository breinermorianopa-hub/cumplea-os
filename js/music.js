
"use strict";

document.addEventListener("DOMContentLoaded", () => {

  // ========================================
  // MÚSICA DE FONDO
  // ========================================

  const music = new Audio("assets/inthe.mp3");

  music.loop = true;
  music.volume = 0.28;
  music.preload = "auto";

  const welcomeScreen = document.getElementById("welcome");
  const startButton = document.getElementById("start-button");

  // ========================================
  // BOTÓN FLOTANTE DE MÚSICA
  // ========================================

  const musicButton = document.createElement("button");

  musicButton.type = "button";
  musicButton.textContent = "♫ Activar música";
  musicButton.setAttribute("aria-label", "Activar música");
  musicButton.setAttribute("aria-pressed", "false");

  Object.assign(musicButton.style, {
    position: "fixed",
    right: "20px",
    bottom: "20px",
    zIndex: "9999",
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 20px",
    border: "1px solid rgba(226, 190, 247, 0.5)",
    borderRadius: "30px",
    background: "linear-gradient(135deg, #583477, #321c50)",
    color: "#fff0fa",
    fontFamily: "inherit",
    fontSize: "0.9rem",
    cursor: "pointer",
    boxShadow: "0 0 20px rgba(195, 151, 230, 0.25)",
    backdropFilter: "blur(10px)"
  });

  document.body.appendChild(musicButton);

  // ========================================
  // ACTUALIZAR BOTÓN
  // ========================================

  function updateMusicButton() {
    if (music.paused) {
      musicButton.textContent = "♫ Activar música";
      musicButton.setAttribute("aria-label", "Activar música");
      musicButton.setAttribute("aria-pressed", "false");
    } else {
      musicButton.textContent = "Ⅱ Pausar música";
      musicButton.setAttribute("aria-label", "Pausar música");
      musicButton.setAttribute("aria-pressed", "true");
    }
  }

  // ========================================
  // INICIAR MÚSICA CON EL PRIMER TOQUE
  // ========================================

  let musicStarted = false;

  function startMusic() {
    if (musicStarted) return;

    musicStarted = true;
    musicButton.style.display = "flex";

    music.play()
      .then(() => {
        updateMusicButton();
        console.log("💜 Música iniciada correctamente.");
      })
      .catch((error) => {
        musicStarted = false;
        updateMusicButton();
        console.warn("No se pudo iniciar la música:", error);
      });
  }

  if (welcomeScreen) {
    welcomeScreen.addEventListener("pointerdown", startMusic);
    welcomeScreen.addEventListener("keydown", startMusic);
  }

  if (startButton) {
    startButton.addEventListener("click", startMusic);
  }

  // ========================================
  // PAUSAR Y REANUDAR
  // ========================================

  musicButton.addEventListener("click", () => {
    if (music.paused) {
      music.play()
        .then(updateMusicButton)
        .catch((error) => {
          console.warn("No se pudo reproducir la música:", error);
        });
    } else {
      music.pause();
      updateMusicButton();
    }
  });

  music.addEventListener("play", updateMusicButton);
  music.addEventListener("pause", updateMusicButton);

  music.addEventListener("error", () => {
    console.error("No se pudo cargar assets/inthe.mp3");
  });

});
