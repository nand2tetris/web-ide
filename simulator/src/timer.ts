import { Clock } from "./chip/clock.js";

export const MAX_STEPS = 1000;

const clock = Clock.get();

const BUDGET = 8; // ms allowed per tick

export abstract class Timer {
  frame() {
    this.tick();
    this.finishFrame();
  }

  /// Update the simulation state, but DO NOT perform any UI changes.

  // Note: This used to by synchronous for performance reasons,
  // but it caused a problem where a 'ROM32k load' test instruction would not resolve before the next ones,
  // causing the Computer chip to run bad instructions and fail the test script
  abstract tick(): Promise<boolean>;

  /// UI Updates are allowed in finishFrame.
  finishFrame() {
    clock.frame();
  }

  abstract reset(): void;

  abstract toggle(): void;

  _steps = 1; // How many steps to take per update
  _steps_actual = 1;
  get steps() {
    return this._steps;
  }
  set steps(value: number) {
    this._steps = value;
    this._steps_actual = value;
  }

  _speed = 60; // how often to update, in ms
  get speed() {
    return this._speed;
  }
  set speed(value: number) {
    this._speed = value;
  }

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
      let steps = Math.min(this._steps, this._steps_actual);

      const startTime = performance.now();
      while (!done && steps-- > 0) {
        done = await this.tick();
      }
      const endTime = performance.now();

      // Dynamically adjust steps to stay within BUDGET ms per update, to avoid blocking the main thread.
      const duration = endTime - startTime;
      this._steps_actual *= BUDGET / duration;
      this._steps_actual = Math.ceil(this._steps_actual);

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
