import Game from "./js/game.js";

if (document.readyState === "complete" || document.readyState === "loaded") {
  new Game(state);
} else {
  document.addEventListener("DOMContentLoaded", () => {
    new Game(state);
  });
}