declare var restart: HTMLButtonElement;
declare var feed: HTMLButtonElement;
declare var sleep: HTMLButtonElement;
declare var play: HTMLButtonElement;
export default class Game {
  static STATE_PARAM_MIN = "0";
  static STATE_PARAM_MAX = "10";
  static TICK_DELTA_TIME = 1000;
  static #GENERAL_STATE_SPRITE_LUT = {
    happy: ["url('./sprites/happy.svg')"],
    sad: ["url('./sprites/bored.svg')"],
    hungry: ["url('./sprites/hungry.svg')"],
    sleepy: ["url('./sprites/sleepy.svg')"],
    dead: ["url('./sprites/dead.svg')"],
    eating: ["url('./sprites/eating_0.svg')", "url('./sprites/eating_1.svg')"],
    sleeping: ["url('./sprites/sleeping_0.svg')", "url('./sprites/sleeping_1.svg')"],
    playing: ["url('./sprites/playing_0.svg')", "url('./sprites/playing_1.svg')"],
  };
  static #ACTION_ID_GENERAL_STATE_LUT = {
    feed: "eating",
    sleep: "sleeping",
    play: "playing",
  };
  static #GENERAL_STATE_GAMEOVER = "dead";
  state: HTMLFormElement;
  constructor(state: HTMLFormElement) {
    this.state = state;
    this.state.addEventListener("submit", this.#onStateSubmit);
    this.state.addEventListener("update", this.#onStateUpdate as (e: Event) => {});
    this.#gameInterval = setInterval(this.#gameTick, Game.TICK_DELTA_TIME);
    this.#restart();
  }

  #gameInterval: number;
  #gameTick = () => {
    this.#applyParametersStateUpdateLogic();
    this.#applyGeneralStateUpdateLogic();
    this.#updateSpriteKeyframe();
  };

  #sprite: string[];
  #setSprite(generalState: string) {
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

  #even = true;
  #applyParametersStateUpdateLogic() {
    const updateEventDetail: {[key: string]: string} = {};
    let newVal: string | number = parseInt(this.state.elements["energy"].value);
    if (this.#action == play) {
      newVal--;
      if (this.#even) {
        newVal--;
      }
    } else if (this.#action == sleep) {
      newVal += 2;
    } else if (this.#even) {
      newVal--;
    }
    newVal = Math.max(0, Math.min(newVal, parseInt(Game.STATE_PARAM_MAX))).toString();
    if (this.state.elements["energy"].value != newVal) {
      updateEventDetail.energy = newVal;
      this.state.elements["energy"].value = newVal;
    }
    
    newVal = parseInt(this.state.elements["hunger"].value) + (this.#action == feed ? 2 : -1);
    newVal = Math.max(0, Math.min(newVal, parseInt(Game.STATE_PARAM_MAX))).toString();
    if (this.state.elements["hunger"].value != newVal) {
      updateEventDetail.hunger = newVal;
      this.state.elements["hunger"].value = newVal;
    }

    newVal = parseInt(this.state.elements["fun"].value) + (this.#action == play ? 2 : -1);
    newVal = Math.max(0, Math.min(newVal, parseInt(Game.STATE_PARAM_MAX))).toString();
    if (this.state.elements["fun"].value != newVal) {
      updateEventDetail.fun = newVal;
      this.state.elements["fun"].value = newVal;
    }

    if (this.state.elements["hunger"].value == Game.STATE_PARAM_MIN || this.state.elements["energy"].value == Game.STATE_PARAM_MIN) {
      newVal = Math.max(0, parseInt(this.state.elements["health"].value) - 1).toString();
      if (this.state.elements["health"].value != newVal) {
        updateEventDetail.health = newVal;
        this.state.elements["health"].value = newVal;
      }
    }

    if (this.#even) {
      if (this.state.elements["fun"].value == Game.STATE_PARAM_MIN) {
        newVal = Math.max(0, parseInt(this.state.elements["energy"].value) - 1).toString();
        if (this.state.elements["energy"].value != newVal) {
          updateEventDetail.energy = newVal;
          this.state.elements["energy"].value = newVal;
        }
      }
    }
    this.#even = !this.#even;
    
    if (Object.keys(updateEventDetail).length) {
      const updateEvent = new CustomEvent("update", { detail: updateEventDetail });
      this.state.dispatchEvent(updateEvent);
    }
  }
  #applyGeneralStateUpdateLogic() {
    if (parseInt(this.state.elements["health"].value) == 0) {
      this.#setGeneralState("dead");
      return;
    }
    if (this.#action !== null) {
      this.#setGeneralState(Game.#ACTION_ID_GENERAL_STATE_LUT[this.#action.id]);
      return;
    }
    if (parseInt(this.state.elements["energy"].value) <= 6) {
      this.#setGeneralState("sleepy");
      return;
    }
    if (parseInt(this.state.elements["hunger"].value) <= 6) {
      this.#setGeneralState("hungry");
      return;
    }
    if (parseInt(this.state.elements["fun"].value) <= 6) {
      this.#setGeneralState("sad");
      return;
    }
    this.#setGeneralState("happy");
  }
  #setGeneralState(generalState: string) {
    if (this.state.elements["general"].value == generalState) {
      return;
    }
    this.state.elements["general"].value = generalState;
    const updateEvent = new CustomEvent("update", {
      detail: { general: generalState }
    });
    this.state.dispatchEvent(updateEvent);
  }

  #action: HTMLElement | null = null;

  #onStateSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    switch (e.submitter) {
      case restart:
        this.#restart();
        break;
      case feed:
        this.#toggleFeeding();
        break;
      case sleep:
        this.#toggleSleeping();
        break;
      case play:
        this.#togglePlaying();
        break;
      default:
        console.error("unreachable", e);
        break;
    }
  }
  #onStateUpdate = (e: CustomEvent) => {
    if (e.detail.general) {
      this.#setSprite(e.detail.general);
      if (e.detail.general == Game.#GENERAL_STATE_GAMEOVER) {
        this.state.elements["restart"].disabled = false;
      }
      return;
    }

    this.#updateIsOutput2Digit();
  }

  #restart() {
    const updateEventDetail: {[key: string]: string} = {};
    if (this.state.elements["health"].value != Game.STATE_PARAM_MAX) {
      this.state.elements["health"].value = Game.STATE_PARAM_MAX;
      updateEventDetail.health = Game.STATE_PARAM_MAX;
    }
    if (this.state.elements["hunger"].value != Game.STATE_PARAM_MAX) {
      this.state.elements["hunger"].value = Game.STATE_PARAM_MAX;
      updateEventDetail.hunger = Game.STATE_PARAM_MAX;
    }
    if (this.state.elements["energy"].value != Game.STATE_PARAM_MAX) {
      this.state.elements["energy"].value = Game.STATE_PARAM_MAX;
      updateEventDetail.energy = Game.STATE_PARAM_MAX;
    }
    if (this.state.elements["fun"].value != Game.STATE_PARAM_MAX) {
      this.state.elements["fun"].value = Game.STATE_PARAM_MAX;
      updateEventDetail.fun = Game.STATE_PARAM_MAX;
    }

    this.state.elements["restart"].disabled = true;
    this.#action = null;

    clearInterval(this.#gameInterval);
    this.#gameInterval = setInterval(this.#gameTick, Game.TICK_DELTA_TIME);

    if (Object.keys(updateEventDetail).length) {
      const updateEvent = new CustomEvent("update", { detail: updateEventDetail });
      this.state.dispatchEvent(updateEvent);
    }
  }

  #toggleFeeding() {
    if (this.#action == feed) {
      this.#action = null;
    } else {
      this.#action = feed;
    }
  }
  #toggleSleeping() {
    if (this.#action == sleep) {
      this.#action = null;
    } else {
      this.#action = sleep;
    }
  }
  #togglePlaying() {
    if (this.#action == play) {
      this.#action = null;
    } else {
      this.#action = play;
    }
  }

  #updateIsOutput2Digit() {
    this.state.elements["health"].classList
      .toggle("is-2digit", this.state.elements["health"].value == Game.STATE_PARAM_MAX);
    this.state.elements["hunger"].classList
      .toggle("is-2digit", this.state.elements["hunger"].value == Game.STATE_PARAM_MAX);
    this.state.elements["energy"].classList
      .toggle("is-2digit", this.state.elements["energy"].value == Game.STATE_PARAM_MAX);
    this.state.elements["fun"].classList
      .toggle("is-2digit", this.state.elements["fun"].value == Game.STATE_PARAM_MAX);
  }
}