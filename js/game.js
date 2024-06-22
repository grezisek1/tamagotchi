export default class Game {
  static STATE_PARAM_MAX = "10";
  static TICK_DELTA_TIME = 1000;
  static #GENERAL_STATE_SPRITE_LUT = {
    happy: ["url('./sprites/happy.svg')"],
    sad: ["url('./sprites/bored.svg')"],
    hungry: ["url('./sprites/hungry.svg')"],
    sleepy: ["url('./sprites/sleepy.svg')"],
  };
  constructor(state) {
    this.state = state;
    this.state.addEventListener("submit", this.#onStateSubmit);
    this.state.addEventListener("update", this.#onStateUpdate);
    this.#restart();
    setInterval(this.#gameTick, Game.TICK_DELTA_TIME);
  }

  #gameTick = () => {

    this.#applyGeneralStateUpdateLogic();
    this.#updateSpriteKeyframe();
  };

  #sprite;
  #setSprite(generalState) {
    this.#sprite = Game.#GENERAL_STATE_SPRITE_LUT[generalState] ?? this.#sprite;
  }

  #keyframe = 0;
  #updateSpriteKeyframe() {
    if (!this.#sprite?.length) {
      return;
    }
    this.#keyframe = (this.#keyframe + 1) % this.#sprite.length;
    this.state.style.setProperty("--sprite", this.#sprite[this.#keyframe]);
  }

  #applyGeneralStateUpdateLogic() {
    if (parseInt(state.elements.energy.value) <= 6) {
      this.#setGeneralState("sleepy");
      return;
    }
    if (parseInt(state.elements.hunger.value) <= 6) {
      this.#setGeneralState("hungry");
      return;
    }
    if (parseInt(state.elements.fun.value) <= 6) {
      this.#setGeneralState("sad");
      return;
    }
    this.#setGeneralState("happy");
  }
  #setGeneralState(generalState) {
    if (this.state.elements.general.value == generalState) {
      return;
    }
    this.state.elements.general.value = generalState;
    const updateEvent = new CustomEvent("update", {
      detail: { general: generalState }
    });
    this.state.dispatchEvent(updateEvent);
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
  #onStateUpdate = (e) => {
    if (e.detail.general) {
      this.#setSprite(e.detail.general);
      return;
    }

    this.#updateIsOutput2Digit();
  }

  #restart() {
    const updateEventDetail = {};
    if (this.state.elements.health.value != Game.STATE_PARAM_MAX) {
      this.state.elements.health.value = Game.STATE_PARAM_MAX;
      updateEventDetail.health = Game.STATE_PARAM_MAX;
    }
    if (this.state.elements.hunger.value != Game.STATE_PARAM_MAX) {
      this.state.elements.hunger.value = Game.STATE_PARAM_MAX;
      updateEventDetail.hunger = Game.STATE_PARAM_MAX;
    }
    if (this.state.elements.energy.value != Game.STATE_PARAM_MAX) {
      this.state.elements.energy.value = Game.STATE_PARAM_MAX;
      updateEventDetail.energy = Game.STATE_PARAM_MAX;
    }
    if (this.state.elements.fun.value != Game.STATE_PARAM_MAX) {
      this.state.elements.fun.value = Game.STATE_PARAM_MAX;
      updateEventDetail.fun = Game.STATE_PARAM_MAX;
    }

    this.state.elements.restart.disabled = true;

    if (Object.keys(updateEventDetail).length) {
      const updateEvent = new CustomEvent("update", { detail: updateEventDetail });
      this.state.dispatchEvent(updateEvent);
    }
  }
  #updateIsOutput2Digit() {
    this.state.elements.health.classList
      .toggle("is-2digit", this.state.elements.health.value == Game.STATE_PARAM_MAX);
    this.state.elements.hunger.classList
      .toggle("is-2digit", this.state.elements.hunger.value == Game.STATE_PARAM_MAX);
    this.state.elements.energy.classList
      .toggle("is-2digit", this.state.elements.energy.value == Game.STATE_PARAM_MAX);
    this.state.elements.fun.classList
      .toggle("is-2digit", this.state.elements.fun.value == Game.STATE_PARAM_MAX);
  }
}