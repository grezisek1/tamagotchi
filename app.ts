import Game from "./js/game";
declare var state: HTMLFormElement;

if (document.readyState == "complete" as DocumentReadyState || document.readyState == "loaded" as DocumentReadyState) {
  new Game(state);
} else {
  document.addEventListener("DOMContentLoaded", () => {
    new Game(state);
  });
}