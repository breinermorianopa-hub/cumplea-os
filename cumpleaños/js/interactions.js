
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const envelopes = document.querySelectorAll(".secret-envelope");
  const messagePanel = document.getElementById("secret-message");
  const messageText = document.getElementById("secret-message-text");
  const closeButton = document.getElementById("close-secret-message");
  const continueButton = document.getElementById("continue-to-birthday");

  envelopes.forEach((envelope) => {
    envelope.addEventListener("click", () => {
      messageText.textContent = envelope.dataset.message;
      messagePanel.hidden = false;
      messagePanel.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    });
  });

  closeButton.addEventListener("click", () => {
    messagePanel.hidden = true;
  });

  continueButton.addEventListener("click", () => {
    window.birthdayApp?.showScreen("birthday");
  });
  
const candles = document.querySelectorAll(".candle");
const blowButton = document.getElementById("blow-candles");
const wishFeedback = document.getElementById("wish-feedback");
const finalButton = document.getElementById("continue-to-final");

function extinguishCandle(candle) {
  candle.classList.add("is-out");
  candle.setAttribute("aria-pressed", "true");

  const remainingCandles = document.querySelectorAll(
    ".candle:not(.is-out)"
  );

  if (remainingCandles.length === 0) {
    wishFeedback.textContent =
      "¡Que ese deseo tan bonito encuentre su camino! 💜✨";

    blowButton.hidden = true;
    finalButton.hidden = false;
  }
}

candles.forEach((candle) => {
  candle.setAttribute("aria-pressed", "false");

  candle.addEventListener("click", () => {
    extinguishCandle(candle);
  });
});

blowButton.addEventListener("click", () => {
  candles.forEach((candle) => extinguishCandle(candle));
});

finalButton.addEventListener("click", () => {
  window.birthdayApp?.showScreen("final");
});

const replayButton = document.getElementById("replay-surprise");

replayButton.addEventListener("click", () => {
  window.birthdayApp?.showScreen("welcome");
});


});

