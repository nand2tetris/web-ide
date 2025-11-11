import { produce } from "immer";
import { Dispatch, useEffect, useReducer, useState } from "react";

export function useImmerReducer<
  T,
  // biome-ignore lint/suspicious/noExplicitAny: reducer really doesn't care
  Reducers extends Record<string, (state: T, action?: any) => T | void>,
>(reducers: Reducers, initialState: T) {
  return useReducer(
    (
      state: T,
      command: {
        action: keyof Reducers;
        // biome-ignore lint/suspicious/noExplicitAny: reducer doesn't care and covariants are hard
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
