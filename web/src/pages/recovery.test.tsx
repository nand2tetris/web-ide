import { useAsmPageStore } from "@nand2tetris/components/stores/asm.store";
import { BaseContext } from "@nand2tetris/components/stores/base.context";
import { useCompilerPageStore } from "@nand2tetris/components/stores/compiler.store";
import { useContext, useState } from "react";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AppContext } from "../App.context";
import { PageContext } from "../Page.context";
import { render, screen, userEvent, waitFor } from "../testing";
import Asm from "./asm";
import Compiler from "./compiler";

const asmSource = "(A)\n@1\nD=Q\n(A)\n";
const validAsmSource = "@1\nD=A\n";
const jackSource = `class Main {
  function void a() { return; let x = 1
  }
  function void b() { let y = 2; return; }
}`;

function RetainedStores({ tool }: { tool: "asm" | "compiler" }) {
  const defaults = useContext(BaseContext);
  const app = useContext(AppContext);
  const [attemptRecovery, setAttemptRecovery] = useState(false);
  return (
    <BaseContext.Provider
      value={{ ...defaults, attemptRecovery, setAttemptRecovery }}
    >
      <AppContext.Provider
        value={{ ...app, monaco: { ...app.monaco, wants: false } }}
      >
        <ToolRoutes tool={tool} />
      </AppContext.Provider>
    </BaseContext.Provider>
  );
}

function ToolRoutes({ tool }: { tool: "asm" | "compiler" }) {
  const defaults = useContext(PageContext);
  const { attemptRecovery, setAttemptRecovery } = useContext(BaseContext);
  const asm = useAsmPageStore();
  const compiler = useCompilerPageStore();
  const [title, setTitle] = useState<string>();
  const diagnostics =
    tool === "asm"
      ? asm.state.diagnostics
      : (compiler.state.compiled.Main?.diagnostics ?? []);
  return (
    <PageContext.Provider
      value={{
        ...defaults,
        title,
        setTool: setTitle,
        stores: { ...defaults.stores, asm, compiler },
      }}
    >
      <button
        onClick={() =>
          tool === "asm"
            ? asm.actions.loadAsm(undefined, asmSource)
            : compiler.actions.loadFiles({ Main: jackSource })
        }
      >
        Load source
      </button>
      {tool === "asm" && (
        <>
          <button
            onClick={() => asm.actions.loadAsm(undefined, validAsmSource)}
          >
            Load valid ASM
          </button>
          <output data-testid="asm-progress">
            {JSON.stringify({
              current: asm.state.current,
              translating: asm.state.translating,
            })}
          </output>
        </>
      )}
      <button onClick={() => setAttemptRecovery(!attemptRecovery)}>
        Toggle recovery
      </button>
      <output data-testid="diagnostics">
        {JSON.stringify(diagnostics.map(({ span }) => span?.line))}
      </output>
      <Link to="/settings">Settings</Link>
      <Link to={`/${tool}`}>Return to tool</Link>
      <Routes>
        <Route path="/asm" element={<Asm />} />
        <Route path="/compiler" element={<Compiler />} />
        <Route path="/settings" element={<div>Settings route</div>} />
      </Routes>
    </PageContext.Provider>
  );
}

describe("retained tool diagnostics", () => {
  it("retains translated ASM output and progress when returning with the same recovery setting", async () => {
    const events = userEvent.setup();
    const view = render(
      <MemoryRouter initialEntries={["/asm"]}>
        <RetainedStores tool="asm" />
      </MemoryRouter>,
    );
    const progress = () =>
      JSON.parse(screen.getByTestId("asm-progress").textContent ?? "{}");
    const snapshot = () => ({
      result:
        view.container.querySelector<HTMLTextAreaElement>(".result textarea")
          ?.value,
      progress: progress(),
    });
    await events.click(screen.getByRole("button", { name: "Load valid ASM" }));
    const translateAll = view.container.querySelector<HTMLButtonElement>(
      'button[data-tooltip="Translate all"]',
    );
    expect(translateAll).not.toBeNull();
    await events.click(translateAll as HTMLButtonElement);
    await waitFor(() =>
      expect(snapshot().result).toMatch(/^[01]{16}\n[01]{16}$/),
    );
    await waitFor(() =>
      expect(translateAll).toHaveAttribute("data-tooltip", "Translate all"),
    );
    const translated = snapshot();
    expect(translated.progress).toEqual({ current: 1, translating: true });

    await events.click(screen.getByRole("link", { name: "Settings" }));
    expect(progress()).toEqual(translated.progress);
    await events.click(screen.getByRole("link", { name: "Return to tool" }));

    expect(snapshot()).toEqual(translated);
  });

  it.each(["asm", "compiler"] as const)(
    "recompiles %s after recovery changes on another route and while active",
    async (tool) => {
      const events = userEvent.setup();
      render(
        <MemoryRouter initialEntries={[`/${tool}`]}>
          <RetainedStores tool={tool} />
        </MemoryRouter>,
      );
      await events.click(screen.getByRole("button", { name: "Load source" }));
      const diagnostics = () =>
        JSON.parse(
          screen.getByTestId("diagnostics").textContent ?? "[]",
        ) as number[];
      await waitFor(() => expect(diagnostics()).toHaveLength(1));
      const [firstLine] = diagnostics();

      await events.click(screen.getByRole("link", { name: "Settings" }));
      await events.click(
        screen.getByRole("button", { name: "Toggle recovery" }),
      );
      expect(diagnostics()).toHaveLength(1);
      await events.click(screen.getByRole("link", { name: "Return to tool" }));
      await waitFor(() => expect(diagnostics()).toHaveLength(2));
      expect(diagnostics()[0]).toBe(firstLine);

      await events.click(
        screen.getByRole("button", { name: "Toggle recovery" }),
      );
      await waitFor(() => expect(diagnostics()).toEqual([firstLine]));
    },
  );
});
