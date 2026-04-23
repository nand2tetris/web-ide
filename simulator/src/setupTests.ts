import { display } from "@davidsouther/jiffies/lib/esm/display.js";
import {
  Err,
  isErr,
  isOk,
  Ok,
  Result,
} from "@davidsouther/jiffies/lib/esm/result.js";
import type { MatchResult } from "ohm-js";
import { expect } from "vitest";
import { Diff } from "./compare.js";

interface CustomMatchers<R = unknown, T = unknown> {
  toBeOk(expected?: T): R;
  toBeErr(expected?: T): R;
}

interface OhmMatchers<R = unknown> {
  toHaveSucceeded(): R;
  toHaveFailed(message: string): R;
}

interface CmpMatchers<R = unknown> {
  toHaveNoDiff(): R;
}

declare module "vitest" {
  interface Assertion<T>
    extends CustomMatchers<void, T>,
      OhmMatchers<void>,
      CmpMatchers<void> {}
  interface AsymmetricMatchersContaining extends CustomMatchers, OhmMatchers {}
}

expect.extend({
  toBeErr<R>(result: Result<R>, expected?: Err<R>) {
    if (isOk(result)) {
      return {
        pass: false,
        message: () =>
          `Expected Err(${display(expected)}), got Ok(${display(Err(result))})`,
      };
    } else {
      if (expected) {
        expect(Err(result)).toMatchObject(Err(expected) as Error);
      }
    }
    return {
      pass: true,
      message: () => `Err(${display(Err(result))}) is expected`,
    };
  },
  toBeOk<R>(result: Result<R>, expected?: Ok<R>) {
    if (isErr(result)) {
      return {
        pass: false,
        message: () =>
          `Expected Ok(${display(expected)}), got Err(${display(Err(result))})`,
      };
    } else {
      if (expected) {
        expect<R>(Ok(result)).toMatchObject(Ok(expected) as object);
      }
    }
    return {
      pass: true,
      message: () => `Ok(${display(Ok(result))}) is expected`,
    };
  },
  toHaveSucceeded(match: MatchResult) {
    if (match.failed()) {
      return { pass: false, message: () => match.message ?? "Match failed" };
    }
    return { pass: true, message: () => "Match succeeded" };
  },
  toHaveFailed(match: MatchResult, message: string) {
    expect(match.failed()).toBe(true);
    if (match.failed()) {
      expect(match.shortMessage).toBe(message);
    }
    return {
      pass: true,
      message: () => "Failed to parse with correct message",
    };
  },
  toHaveNoDiff(diffs: Diff[]) {
    expect(
      diffs.map(({ a, b, col, row }) => `${a} <> ${b} (${row}:${col})`),
    ).toEqual([]);
    return {
      pass: true,
      message: () => "There were no diffs",
    };
  },
});
