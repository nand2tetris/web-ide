import produce from "immer";
import { useReducer } from "react";

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
