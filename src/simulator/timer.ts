export const MAX_STEPS = 1000;
export class Timer {
  frame() {
    this.tick();
    this.finishFrame();
  }

  tick() {}

  finishFrame() {}

  reset() {}

  toggle() {}

  steps = 1; // How many steps to take per update
  speed = 1000; // how often to update, in ms
  get running() {
    return this.#running;
  }

  #running = false;
  #sinceLastFrame = 0;
  #lastUpdate = 0;
  #run = () => {
    if (!this.#running) {
      return;
    }
    const now = Date.now();
    const delta = now - this.#lastUpdate;
    this.#lastUpdate = now;
    this.#sinceLastFrame += delta;
    if (this.#sinceLastFrame > this.speed) {
      for (let i = 0; i < Math.min(this.steps, MAX_STEPS); i++) {
        this.tick();
      }
      this.finishFrame();
      this.#sinceLastFrame -= this.speed;
    }
    requestAnimationFrame(this.#run);
  };

  start() {
    this.#running = true;
    this.#lastUpdate = Date.now() - this.speed;
    this.#run();
    this.toggle();
  }

  stop() {
    this.#running = false;
    this.toggle();
  }
}
