import { ERRNO } from "./errors.js";
import { OS } from "./os.js";

export class SysLib {
  private os: OS;

  private _blocked = false;
  private _released = false;
  private _returnValue = 0;
  private _halted = false;
  private _exitCode = 0;

  private cancelWait = false;
  private animationFrameId: number | undefined;

  constructor(os: OS) {
    this.os = os;
  }

  get blocked() {
    return this._blocked;
  }

  get released() {
    return this._released;
  }

  get halted() {
    return this._halted;
  }

  get exitCode() {
    return this._exitCode;
  }

  block() {
    this._blocked = true;
  }

  release(returnValue?: number) {
    this._blocked = false;
    this._returnValue = returnValue ?? 0;
    this._released = true;
  }

  readReturnValue() {
    this._released = false;
    return this._returnValue;
  }

  wait(ms: number) {
    if (ms <= 0) {
      this.error(ERRNO.SYS_WAIT_DURATION_NOT_POSITIVE);
      return;
    }

    this.block();

    (async () => {
      await new Promise((x) => setTimeout(x, ms));
      this.release();
    })();
  }

  halt() {
    this._halted = true;
    this._exitCode = 0;
  }

  error(code: number) {
    this.os.output.printJsString(`ERR${code}`);
    this._halted = true;
    this._exitCode = code;
  }

  dispose() {
    this.cancelWait = true;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
