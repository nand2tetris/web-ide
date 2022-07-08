// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import {
  isErr,
  Result,
  Err,
  Ok,
  isOk,
} from "@davidsouther/jiffies/lib/esm/result";
import "@testing-library/jest-dom";

expect.extend({
  toBeErr(result: Result<unknown>, expected: Ok<unknown>) {
    if (isOk(result)) {
      return {
        pass: false,
        message: () => `Expected Err(${expected}), got Ok(${Err(result)})`,
      };
    } else {
      expect(Err(result)).toMatchObject(Err(expected));
    }
    return { pass: true };
  },
  toBeOk(result: Result<unknown>, expected: Ok<unknown>) {
    if (isErr(result)) {
      return {
        pass: false,
        message: () => `Expected Ok(${expected}), got Err(${Err(result)})`,
      };
    } else {
      expect(Ok(result)).toMatchObject(Ok(expected));
    }
    return { pass: true };
  },
});

interface CustomMatchers<R = unknown, T = unknown> {
  toBeOk(result: T): R;
  toBeErr(result: T): R;
}

declare global {
  namespace jest {
    interface Expect extends CustomMatchers {}
    interface Matchers<R, T = {}> extends CustomMatchers<R, T> {}
    interface InverseAsymmetricMatchers extends CustomMatchers {}
  }
}
