
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // =========================================================
  // 1. UNIVERSO: DIEZ PLANETAS INTERACTIVOS
  // =========================================================

  const solarSystem = document.querySelector(".solar-system");
  const planets = document.querySelectorAll(".universe-planet");
  const planetPanel = document.getElementById("planet-message");
  const planetTitle = document.getElementById("planet-message-title");
  const planetText = document.getElementById("planet-message-text");
  const closePlanetButton = document.getElementById("close-planet-message");
  const continueFromPlanet = document.getElementById("continue-from-planet");
  const continueToLetter = document.getElementById("continue-to-letter");

  const discoveredPlanets = new Set();

  // Cada planeta tendrá su propia órbita.


const planetOrbits = [
  { radius: 0.18, speed: 0.34, angle: 0.1 },
  { radius: 0.28, speed: -0.27, angle: 1.2 },
  { radius: 0.38, speed: 0.23, angle: 2.4 },
  { radius: 0.48, speed: -0.19, angle: 3.5 },
  { radius: 0.58, speed: 0.16, angle: 4.6 },
  { radius: 0.66, speed: -0.14, angle: 5.4 },
  { radius: 0.74, speed: 0.12, angle: 0.8 },
  { radius: 0.82, speed: -0.105, angle: 2.0 },
  { radius: 0.90, speed: 0.09, angle: 3.8 },
  { radius: 0.98, speed: -0.075, angle: 5.0 }
];



  let animationFrame = null;
  let lastAnimationTime = 0;
  let animationElapsed = 0;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;


  function positionPlanets(time = 0) {
    if (!solarSystem || planets.length === 0) return;

    const width = solarSystem.clientWidth;
    const height = solarSystem.clientHeight;

    // Si el universo está oculto, esperamos a que sea visible.
    if (!width || !height) return;

    const baseRadius = Math.min(width, height) * 0.50;

    planets.forEach((planet, index) => {
      const orbit = planetOrbits[index % planetOrbits.length];
      const angle = orbit.angle + time * orbit.speed;

      const x = Math.cos(angle) * baseRadius * orbit.radius;
      const y = Math.sin(angle) * baseRadius * orbit.radius;

      planet.style.setProperty("--orbit-x", `${x}px`);
      planet.style.setProperty("--orbit-y", `${y}px`);
    });
  }

  function animatePlanets(timestamp) {
    if (!solarSystem || !solarSystem.clientWidth || !solarSystem.clientHeight) {
      animationFrame = window.requestAnimationFrame(animatePlanets);
      return;
    }

    if (lastAnimationTime === 0) {
      lastAnimationTime = timestamp;
    }

    const delta = Math.min(timestamp - lastAnimationTime, 50);
    lastAnimationTime = timestamp;
    animationElapsed += delta / 1000;

    positionPlanets(animationElapsed);

    animationFrame = window.requestAnimationFrame(animatePlanets);
  }

  function startPlanetAnimation() {
    if (!solarSystem || planets.length === 0) return;

    positionPlanets(animationElapsed);

    if (animationFrame === null) {
      lastAnimationTime = 0;
      animationFrame = window.requestAnimationFrame(animatePlanets);
    }
  }

  function stopPlanetAnimation() {
    if (animationFrame !== null) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    lastAnimationTime = 0;
  }



function updatePlanetProgress() {
  const allDiscovered =
    planets.length === 10 && discoveredPlanets.size === 10;

  if (continueToLetter) {
    continueToLetter.hidden = !allDiscovered;
  }

  if (continueFromPlanet) {
    continueFromPlanet.hidden = !allDiscovered;
  }

  if (allDiscovered) {
    console.log("¡Has descubierto los diez planetas! 💜✨");
  }
}



  function openPlanetMessage(planet) {
    if (!planetPanel || !planetTitle || !planetText) return;

    const planetNumber = planet.dataset.planet;
    const title = planet.dataset.title || `Planeta ${planetNumber}`;
    const message = planet.dataset.message ||
      "Un pequeño secreto del universo te espera aquí. 💜";

    discoveredPlanets.add(planetNumber);

    planetTitle.textContent = title;
    planetText.textContent = message;
    planetPanel.hidden = false;

    updatePlanetProgress();

    planetPanel.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "nearest"
    });
  }

  planets.forEach((planet) => {
    planet.addEventListener("click", () => {
      openPlanetMessage(planet);
    });

    // Permite activar los planetas con teclado si son botones.
    if (planet.tagName !== "BUTTON") {
      planet.setAttribute("role", "button");
      planet.setAttribute("tabindex", "0");

      planet.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openPlanetMessage(planet);
        }
      });
    }
  });

  if (closePlanetButton && planetPanel) {
    closePlanetButton.addEventListener("click", () => {
      planetPanel.hidden = true;
    });
  }

  if (continueFromPlanet) {
    continueFromPlanet.addEventListener("click", () => {
      if (discoveredPlanets.size < planets.length) return;

      window.birthdayApp?.showScreen("letter");
    });
  }

  // Oculta el acceso a la carta hasta descubrir los diez planetas.
  updatePlanetProgress();
  startPlanetAnimation();

  window.addEventListener("resize", () => {
    positionPlanets(animationElapsed);
  });

  // =========================================================
  // 2. MENSAJES SECRETOS DE LOS SOBRES
  // =========================================================

  const envelopes = document.querySelectorAll(".secret-envelope");
  const messagePanel = document.getElementById("secret-message");
  const messageText = document.getElementById("secret-message-text");
  const closeMessageButton = document.getElementById(
    "close-secret-message"
  );

  envelopes.forEach((envelope) => {
    envelope.addEventListener("click", () => {
      if (!messagePanel || !messageText) return;

      messageText.textContent = envelope.dataset.message ||
        "Este pequeño mensaje está guardado para ti. 💜";

      messagePanel.hidden = false;

      messagePanel.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "nearest"
      });
    });
  });

  if (closeMessageButton && messagePanel) {
    closeMessageButton.addEventListener("click", () => {
      messagePanel.hidden = true;
    });
  }

  // =========================================================
  // 3. VELAS DEL PASTEL
  // =========================================================

  const candles = document.querySelectorAll(".candle");
  const blowButton = document.getElementById("blow-candles");
  const wishFeedback = document.getElementById("wish-feedback");
  const finalButton = document.getElementById("continue-to-final");

  function extinguishCandle(candle) {
    if (candle.classList.contains("is-out")) return;

    candle.classList.add("is-out");
    candle.setAttribute("aria-pressed", "true");

    const remainingCandles = document.querySelectorAll(
      ".candle:not(.is-out)"
    );

    if (remainingCandles.length === 0) {
      if (wishFeedback) {
        wishFeedback.textContent =
          "¡Que ese deseo tan bonito encuentre su camino! 💜✨";
      }

      if (blowButton) blowButton.hidden = true;
      if (finalButton) finalButton.hidden = false;
    }
  }

  candles.forEach((candle) => {
    candle.setAttribute("aria-pressed", "false");

    candle.addEventListener("click", () => {
      extinguishCandle(candle);
    });
  });

  if (blowButton) {
    blowButton.addEventListener("click", () => {
      candles.forEach((candle) => extinguishCandle(candle));
    });
  }

  // =========================================================
  // 4. NAVEGACIÓN DE LA SORPRESA
  // =========================================================

  const continueToBirthday = document.getElementById(
    "continue-to-birthday"
  );

  if (continueToBirthday) {
    continueToBirthday.addEventListener("click", () => {
      window.birthdayApp?.showScreen("birthday");
    });
  }

  if (finalButton) {
    finalButton.addEventListener("click", () => {
      window.birthdayApp?.showScreen("final");
    });
  }

  const replayButton = document.getElementById("replay-surprise");

  if (replayButton) {
    replayButton.addEventListener("click", () => {
      stopPlanetAnimation();

      // Reinicia el progreso para volver a vivir la sorpresa.
      discoveredPlanets.clear();
      updatePlanetProgress();

      if (planetPanel) planetPanel.hidden = true;

      window.birthdayApp?.showScreen("welcome");

      animationElapsed = 0;
      startPlanetAnimation();
    });
  }
});

