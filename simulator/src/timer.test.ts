import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { Timer } from "./timer.js";

const globals = globalThis as { requestAnimationFrame?: (cb: () => void) => 0 };
let originalRAF: typeof globals.requestAnimationFrame;
beforeAll(() => {
  originalRAF = globals.requestAnimationFrame;
  globals.requestAnimationFrame = () => 0;
});
afterAll(() => {
  globals.requestAnimationFrame = originalRAF;
});

class TestTimer extends Timer {
  publicStepsActual(): number {
    return (this as unknown as { _steps_actual: number })._steps_actual;
  }
  setStepsActual(v: number) {
    (this as unknown as { _steps_actual: number })._steps_actual = v;
  }
  override async tick(): Promise<boolean> {
    return false;
  }
  override reset(): void {
    return;
  }
  override toggle(): void {
    return;
  }
  override finishFrame(): void {
    return;
  }
}

describe("Timer", () => {
  test("setting steps resets the dynamic step budget", () => {
    const timer = new TestTimer();
    timer.steps = 100;
    timer.setStepsActual(1);
    timer.steps = 100;
    expect(timer.publicStepsActual()).toBe(100);
  });

  test("start resets the dynamic step budget", () => {
    const timer = new TestTimer();
    timer.steps = 1000;
    timer.setStepsActual(1);
    timer.start();
    expect(timer.publicStepsActual()).toBe(1000);
    timer.stop();
  });
});
