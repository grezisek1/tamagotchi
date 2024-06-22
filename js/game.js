export default class Game {
  static OUTPUT_MAX = "10";
  constructor(state) {
    this.state = state;
    this.state.addEventListener("submit", this.#onStateSubmit);
    this.state.addEventListener("update", this.#onStateUpdate);
    this.#restart();
  }
  #onStateSubmit = (e) => {
    e.preventDefault();
    switch (e.submitter) {
      case restart:
        this.#restart();
        break;
      default:
        console.error("unreachable", e);
        break;
    }
  }
  #restart() {
    this.state.elements.health.value = Game.OUTPUT_MAX;
    this.state.elements.hunger.value = Game.OUTPUT_MAX;
    this.state.elements.energy.value = Game.OUTPUT_MAX;
    this.state.elements.fun.value = Game.OUTPUT_MAX;
    this.state.elements.restart.disabled = true;
    this.state.dispatchEvent(new Event("update"));
  }
  #onStateUpdate = () => {
    this.#updateOutput();
  }
  #updateOutput() {
    this.state.elements.health.classList
      .toggle("is-2digit", this.state.elements.health.value == Game.OUTPUT_MAX);
    this.state.elements.hunger.classList
      .toggle("is-2digit", this.state.elements.hunger.value == Game.OUTPUT_MAX);
    this.state.elements.energy.classList
      .toggle("is-2digit", this.state.elements.energy.value == Game.OUTPUT_MAX);
    this.state.elements.fun.classList
      .toggle("is-2digit", this.state.elements.fun.value == Game.OUTPUT_MAX);
  }
}