// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import ohm from "ohm-js";
import {
  isErr,
  Result,
  Err,
  Ok,
  isOk,
} from "@davidsouther/jiffies/lib/esm/result";
import "@testing-library/jest-dom";
import { i18n } from "@lingui/core";
import { en } from "make-plural/plurals";
import { messages } from "./app/locales/en/messages";
import { display } from "@davidsouther/jiffies/lib/esm/display";
import { Diff } from "./simulator/compare";

i18n.load("en", messages);
i18n.loadLocaleData({
  en: { plurals: en },
});
i18n.activate("en");

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

declare global {
  namespace jest {
    interface Expect extends CustomMatchers {}
    interface Matchers<R, T = {}>
      extends CustomMatchers<R, T>,
        OhmMatchers<R>,
        CmpMatchers<R> {}
    interface InverseAsymmetricMatchers extends CustomMatchers, OhmMatchers {}
  }
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
        expect<R>(Ok(result)).toMatchObject(Ok(expected) as {});
      }
    }
    return {
      pass: true,
      message: () => `Ok(${display(Ok(result))}) is expected`,
    };
  },
  toHaveSucceeded(match: ohm.MatchResult) {
    if (match.succeeded()) {
      return { pass: true, message: () => "Match succeeded" };
    } else {
      return { pass: false, message: () => match.message ?? "Match failed" };
    }
  },
  toHaveFailed(match: ohm.MatchResult, message: string) {
    expect(match.failed()).toBe(true);
    expect(match.shortMessage).toBe(message);
    return {
      pass: true,
      message: () => "Failed to parse with correct message",
    };
  },
  toHaveNoDiff(diffs: Diff[]) {
    expect(
      diffs.map(({ a, b, col, row }) => `${a} <> ${b} (${row}:${col})`)
    ).toEqual([]);
    return {
      pass: true,
      message: () => "There were no diffs",
    };
  },
});
