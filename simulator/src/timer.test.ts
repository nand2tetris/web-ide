import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
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
  tickGate?: Promise<void>;
  override async tick(): Promise<boolean> {
    await this.tickGate;
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

  test("does not reschedule a frame when stopped during an in-flight tick", async () => {
    let rafCalls = 0;
    globals.requestAnimationFrame = () => {
      rafCalls++;
      return 0;
    };
    try {
      const timer = new TestTimer();
      let release!: () => void;
      timer.tickGate = new Promise<void>((resolve) => {
        release = resolve;
      });
      // start() seeds lastUpdate from one Date.now() call; #run reads a second
      // one. A millisecond passing between them (a timing race in real runs)
      // is what makes #run enter its awaiting tick loop, so force it.
      const now = vi.spyOn(Date, "now");
      now.mockReturnValueOnce(1000).mockReturnValue(1001);
      timer.start();
      now.mockRestore();
      timer.stop();
      release();
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(rafCalls).toBe(0);
    } finally {
      globals.requestAnimationFrame = () => 0;
    }
  });
});
