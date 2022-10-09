import produce from "immer";
import { Dispatch, useEffect, useReducer, useState } from "react";

export function useImmerReducer<T, Reducers extends Record<string, Function>>(
  reducers: Reducers,
  initialState: T
) {
  return useReducer(
    (
      state: T,
      command: {
        action: keyof Reducers;
        payload?: {};
      }
    ) =>
      produce(state, (draft: T) => {
        reducers[command.action](draft, command.payload as any);
      }),
    initialState
  );
}

export function useStateInitializer<T>(init: T): [T, Dispatch<T>] {
  const [state, setState] = useState<T>(init);
  useEffect(() => {
    setState(init);
  }, [init]);
  return [state, setState];
}
