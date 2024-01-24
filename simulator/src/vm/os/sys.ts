export class SysLib {
  private blocked = false;
  private released = false;
  private returnValue = 0;
  shouldHalt = false;

  get isBlocked() {
    return this.blocked;
  }

  get hasReleased() {
    return this.released;
  }

  block() {
    this.blocked = true;
  }

  release(returnValue?: number) {
    this.blocked = false;
    this.returnValue = returnValue ?? 0;
    this.released = true;
  }

  readReturnValue() {
    this.released = false;
    return this.returnValue;
  }

  wait(ms: number) {
    this.block();

    setTimeout(() => {
      this.release();
    }, ms);
  }
}
