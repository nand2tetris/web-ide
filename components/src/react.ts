import produce from "immer";
import { Dispatch, useEffect, useReducer, useState } from "react";

export function useImmerReducer<
  T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Reducers extends Record<string, (state: T, action?: any) => T | void>,
>(reducers: Reducers, initialState: T) {
  return useReducer(
    (
      state: T,
      command: {
        action: keyof Reducers;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        payload?: any;
      },
    ): T =>
      produce(state, (draft: T) => {
        reducers[command.action](draft, command.payload);
      }),
    initialState,
  );
}

export function useStateInitializer<T>(init: T): [T, Dispatch<T>] {
  const [state, setState] = useState<T>(init);
  useEffect(() => {
    setState(init);
  }, [init]);
  return [state, setState];
}
