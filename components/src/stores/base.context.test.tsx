import { renderHook } from "@testing-library/react";
import { expect, it } from "vitest";
import { useBaseContext } from "./base.context.js";

it.each([undefined, false, true])(
  "the application context takes recovery %s without changing parser defaults",
  (attemptRecovery) => {
    const { result } = renderHook(() => useBaseContext({ attemptRecovery }));
    expect(result.current.attemptRecovery).toBe(attemptRecovery === true);
  },
);
