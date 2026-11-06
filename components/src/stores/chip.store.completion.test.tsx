import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/fs.ts";
import * as not from "@nand2tetris/projects/project_01/01_not.js";
import { act, renderHook } from "@testing-library/react";
import {
  ReactNode,
  StrictMode,
  useCallback,
  useContext,
  useState,
} from "react";
import { BaseContext, useBaseContext } from "./base.context.js";
import { useChipPageStore } from "./chip.store.js";

function renderChipStore(cmp = not.cmp) {
  const fs = new FileSystem(
    new ObjectFileSystemAdapter({
      "projects/01/Not.hdl": not.hdl,
      "projects/01/Not.tst": not.tst,
      "projects/01/Not.cmp": cmp,
    }),
  );
  const storage = {};
  const statuses = vi.fn<BaseContext["setStatus"]>();
  let replaceFileSystem: (nextFs: FileSystem) => void = vi.fn();
  function Provider({ children }: { children: ReactNode }) {
    const base = useBaseContext();
    const [fileSystem, setFileSystem] = useState(fs);
    replaceFileSystem = setFileSystem;
    const setStatus = useCallback<BaseContext["setStatus"]>(
      (status) => {
        statuses(status);
        base.setStatus(status);
      },
      [base.setStatus],
    );
    return (
      <BaseContext.Provider
        value={{ ...base, fs: fileSystem, storage, setStatus }}
      >
        {children}
      </BaseContext.Provider>
    );
  }
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <StrictMode>
        <Provider>{children}</Provider>
      </StrictMode>
    );
  }
  const hook = renderHook(
    () => ({
      ...useChipPageStore(),
      status: useContext(BaseContext).status,
      setStatus: useContext(BaseContext).setStatus,
    }),
    { wrapper: Wrapper },
  );
  return { ...hook, statuses, replaceFileSystem };
}

describe("chip test completion", () => {
  it("keeps a newer context status when the filesystem changes after completion", async () => {
    const { result, statuses, replaceFileSystem } = renderChipStore();
    await act(async () => {
      await result.current.actions.initialize();
      await result.current.actions.toggleBuiltin();
      while (!(await result.current.actions.stepTest()));
    });
    expect(result.current.status.severity).toBe("SUCCESS");
    statuses.mockClear();

    const newerStatus = {
      message: "Opened a local folder",
      severity: "INFO",
    } as const;
    await act(async () => {
      result.current.setStatus(newerStatus);
      replaceFileSystem(new FileSystem(new ObjectFileSystemAdapter({})));
    });

    expect(result.current.status).toEqual(newerStatus);
    expect(statuses).toHaveBeenCalledExactlyOnceWith(newerStatus);
  });

  it("keeps a later compilation error after the last manual test step", async () => {
    const { result } = renderChipStore();
    await act(async () => {
      await result.current.actions.initialize();
      await result.current.actions.toggleBuiltin();
    });
    await act(async () => {
      while (!(await result.current.actions.stepTest()));
      await result.current.actions.compileChip("CHIP Not {");
    });

    expect(result.current.state.sim.invalid).toBe(true);
    expect(result.current.status.severity).toBe("ERROR");
    expect(result.current.status.message).toContain("Line");
  });

  it("keeps a later successful compilation status", async () => {
    const { result } = renderChipStore();
    await act(async () => {
      await result.current.actions.initialize();
      await result.current.actions.toggleBuiltin();
    });
    await act(async () => {
      while (!(await result.current.actions.stepTest()));
      await result.current.actions.updateFiles({
        hdl: not.hdl,
        cmp: not.cmp,
      });
    });

    expect(result.current.state.sim.invalid).toBe(false);
    expect(result.current.status).toEqual({
      message: "HDL code: No syntax errors",
      severity: "INFO",
    });
  });

  it.each([
    { cmp: not.cmp, severity: "SUCCESS" },
    { cmp: not.cmp.replace("| 1 | 0 |", "| 1 | 1 |"), severity: "ERROR" },
  ])(
    "publishes each manual completion once with severity $severity",
    async ({ cmp, severity }) => {
      const { result, statuses } = renderChipStore(cmp);
      await act(async () => {
        await result.current.actions.initialize();
        await result.current.actions.toggleBuiltin();
      });

      for (let run = 0; run < 2; run++) {
        await act(async () => result.current.actions.reset());
        statuses.mockClear();
        let done = false;
        while (!done) {
          await act(async () => {
            done = await result.current.actions.stepTest();
          });
        }
        expect(result.current.state.files.out).toContain("| 1 | 0 |");
        expect(result.current.status.severity).toBe(severity);
        const completions = statuses.mock.calls.filter(([status]) =>
          typeof status === "object"
            ? status.message.startsWith("Simulation ")
            : false,
        );
        expect(completions).toHaveLength(1);
      }
    },
  );

  it("compares the final output with the edited comparison file before the final frame refresh", async () => {
    const { result } = renderChipStore();
    await act(async () => {
      await result.current.actions.initialize();
      await result.current.actions.toggleBuiltin();
      await result.current.actions.stepTest();
    });
    await act(async () => {
      await result.current.actions.updateFiles({
        cmp: not.cmp.replace("| 1 | 0 |", "| 1 | 1 |"),
      });
      while (!(await result.current.actions.stepTest()));
      result.current.dispatch.current({ action: "updateTestStep" });
    });

    expect(result.current.state.files.out).toContain("| 1 | 0 |");
    expect(result.current.status).toEqual({
      message:
        "Simulation error: The output file differs from the compare file",
      severity: "ERROR",
    });
  });
});
