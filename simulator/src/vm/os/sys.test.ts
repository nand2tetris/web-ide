import { VmMemory } from "../memory";
import { OS } from "./os";

describe("sys", () => {
  test("it waits", () => {
    let frameId = 0;
    const mockRAF = (callback: FrameRequestCallback) => {
      cb = callback;
      return frameId++;
    };
    const os = new OS(new VmMemory(), mockRAF);
    const sys = os.sys;
    let cb: FrameRequestCallback = () => 0;
    sys.wait(100);
    expect(sys.blocked).toBe(true);
    expect(sys.released).toBe(false);
    expect(cb).toBeDefined();

    cb?.(50);
    expect(sys.blocked).toBe(true);
    expect(sys.released).toBe(false);

    cb?.(75);
    expect(sys.blocked).toBe(false);
    expect(sys.released).toBe(true);

    const ret = sys.readReturnValue();
    expect(ret).toBe(0);
    expect(sys.blocked).toBe(false);
    expect(sys.released).toBe(false);
  });
});
