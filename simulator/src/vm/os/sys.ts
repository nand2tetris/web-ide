import { ERRNO } from "./errors.js";
import { OS } from "./os";

export class SysLib {
  private _blocked = false;
  private _released = false;
  private _returnValue = 0;
  private _halted = false;
  private _exitCode = 0;

  private cancelWait = false;
  private animationFrameId: number | undefined;

  constructor(
    private os: OS,
    private raf: (
      cb: FrameRequestCallback
    ) => number = window.requestAnimationFrame
  ) {}

  // true when the OS indicates the system should not make progress.
  get blocked() {
    return this._blocked;
  }

  // true for one tick after the system has been unblocked.
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

  release(returnValue = 0) {
    this._blocked = false;
    this._released = true;
    this._returnValue = returnValue;
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

    let waited = 0;
    const loop = (delta: number) => {
      if (this.cancelWait) {
        this.release();
      }

      waited += delta;

      if (waited >= ms) {
        this.release();
      } else {
        this.animationFrameId = this.raf(loop);
      }
    };

    loop(0);
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
