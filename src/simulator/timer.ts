import { Dispatch, MutableRefObject, useMemo, useRef } from "react";
import { useImmerReducer } from "../util/react";

export const MAX_STEPS = 1000;

export abstract class Timer {
  frame() {
    this.tick();
    this.finishFrame();
  }

  abstract tick(): void;

  abstract finishFrame(): void;

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

export interface TimerStoreState {
  steps: number;
  speed: number;
  running: boolean;
}

export type TimerStoreDispatch = Dispatch<{
  action: keyof ReturnType<typeof makeTimerStore>["reducers"];
  payload?: {};
}>;

const makeTimerStore = (
  timer: Timer,
  dispatch: MutableRefObject<TimerStoreDispatch>
) => {
  const initialState: TimerStoreState = {
    running: timer.running,
    speed: timer.speed,
    steps: timer.steps,
  };

  const finishFrame = timer.finishFrame.bind(timer);
  timer.finishFrame = function () {
    finishFrame();
    dispatch.current({ action: "update" });
  };

  const reducers = {
    update(state: TimerStoreState) {
      state.running = timer.running;
      state.speed = timer.speed;
      state.steps = timer.steps;
    },
    setSteps(state: TimerStoreState, steps: number) {
      state.steps = steps;
    },
    setSpeed(state: TimerStoreState, speed: number) {
      state.speed = speed;
    },
  };

  const actions = {
    frame() {
      timer.frame();
    },
    start() {
      timer.start();
      dispatch.current({ action: "update" });
    },
    stop() {
      timer.stop();
      dispatch.current({ action: "update" });
    },
    reset() {
      timer.reset();
      dispatch.current({ action: "update" });
    },
  };

  return { initialState, reducers, actions };
};

export function useTimer(timer: Timer) {
  const dispatch = useRef<TimerStoreDispatch>(() => {});

  const { initialState, reducers, actions } = useMemo(
    () => makeTimerStore(timer, dispatch),
    [timer, dispatch]
  );

  const [state, dispatcher] = useImmerReducer(reducers, initialState);

  dispatch.current = dispatcher;

  return { state, dispatch: dispatch.current, actions };
}
