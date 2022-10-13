import { Timer } from "@computron5k/simulator/timer.js";
import { useImmerReducer } from "../util/react";

export interface TimerStoreState {
  steps: number;
  speed: number;
  running: boolean;
}

import { Dispatch, MutableRefObject, useMemo, useRef } from "react";
export type TimerStoreDispatch = Dispatch<{
  action: keyof ReturnType<typeof makeTimerStore>["reducers"];
  payload?: unknown;
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
      timer.steps = steps;
    },
    setSpeed(state: TimerStoreState, speed: number) {
      state.speed = speed;
      timer.speed = speed;
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
  const dispatch = useRef<TimerStoreDispatch>(() => undefined);

  const { initialState, reducers, actions } = useMemo(
    () => makeTimerStore(timer, dispatch),
    [timer, dispatch]
  );

  const [state, dispatcher] = useImmerReducer(reducers, initialState);

  dispatch.current = dispatcher;

  return { state, dispatch: dispatch.current, actions };
}
