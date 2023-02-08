import { Clock } from "./chip/clock.js";

export const MAX_STEPS = 1000;

const clock = Clock.get();

export abstract class Timer {
  frame() {
    this.tick();
    this.finishFrame();
  }

  /// Update the simulation state, but DO NOT perform any UI changes.
  abstract tick(): boolean;

  /// UI Updates are allowed in finishFrame.
  finishFrame() {
    clock.frame();
  }

  abstract reset(): void;

  abstract toggle(): void;

  steps = 1; // How many steps to take per update
  speed = 1000; // how often to update, in ms
  get running() {
    return this.#running;
  }

  #running = false;
  #sinceLastFrame = 0;
  #lastUpdate = 0;
  #run = async () => {
    if (!this.#running) {
      return;
    }
    const now = Date.now();
    const delta = now - this.#lastUpdate;
    this.#lastUpdate = now;
    this.#sinceLastFrame += delta;
    if (this.#sinceLastFrame > this.speed) {
      let done = false;
      // let steps = Math.min(this.steps, MAX_STEPS);
      let steps = this.steps;
      const timingLabel = `Timing ${steps} steps`;
      console.time(timingLabel);
      while (!done && steps--) {
        // done = await this.tick();
        done = this.tick();
      }
      console.timeEnd(timingLabel);
      this.finishFrame();
      if (done) {
        this.stop();
      }
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
