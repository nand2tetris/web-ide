/** Re-creates `State` before each test by calling `init` from the given hook runner. */
export function cleanState<State extends object>(
  init: () => State | Promise<State>,
  runner: (action: () => Promise<void>) => void,
): State {
  const state = {} as State;
  runner(async () => {
    Object.assign(state, await init());
  });
  return state;
}
