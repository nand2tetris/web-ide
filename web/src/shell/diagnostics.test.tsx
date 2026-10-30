import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import {
  type Diagnostic,
  diagnostic,
} from "@nand2tetris/simulator/languages/base.js";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorPanel } from "./editor";
import { Monaco } from "./Monaco";

const fixture = vi.hoisted(() => {
  const model = {
    getPositionAt: (offset: number) => ({ lineNumber: offset + 1, column: 1 }),
    setEOL: vi.fn(),
  };
  return {
    model,
    editor: {
      getModel: () => model,
      updateOptions: vi.fn(),
      deltaDecorations: () => [],
      onDidChangeCursorPosition: vi.fn(),
    },
    monaco: {
      Range: { fromPositions: () => ({}) },
      editor: { setModelMarkers: vi.fn(), remeasureFonts: vi.fn() },
    },
  };
});

vi.mock("../App.context", async () => {
  const { createContext } = await import("react");
  return {
    AppContext: createContext({
      theme: "light",
      monaco: { canUse: true, wants: true },
    }),
  };
});
vi.mock("./monacoSetup", () => ({}));
vi.mock("monaco-editor", () => ({ editor: { EndOfLineSequence: { LF: 0 } } }));
vi.mock("@monaco-editor/react", async () => {
  const { useEffect } = await import("react");
  return {
    default: ({
      onMount,
    }: {
      onMount: (editor: unknown, monaco: unknown) => void;
    }) => {
      useEffect(() => onMount(fixture.editor, fixture.monaco), [onMount]);
      return null;
    },
  };
});

const first = diagnostic(
  "chip.notFound",
  { name: "First" },
  { start: 0, end: 1, line: 1 },
);
const second = diagnostic(
  "chip.notFound",
  { name: "Second" },
  { start: 2, end: 3, line: 3 },
);
const unlocated = diagnostic("chip.wrongName", {});
const multiple = [first, unlocated, second];

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: { ready: Promise.resolve() },
  });
});

describe("parser diagnostic markers", () => {
  const editor = (diagnostics?: readonly Diagnostic[]) => (
    <Monaco
      value="broken"
      onChange={() => undefined}
      language="hdl"
      path="Chip.hdl"
      diagnostics={diagnostics}
    />
  );

  it("marks every located diagnostic and ignores diagnostics without spans", async () => {
    render(editor(multiple));
    await waitFor(() =>
      expect(fixture.monaco.editor.setModelMarkers).toHaveBeenLastCalledWith(
        fixture.model,
        "hdl",
        [
          {
            message: "Line 1: Undefined chip name: First",
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 2,
            endColumn: 1,
            severity: 8,
          },
          {
            message: "Line 3: Undefined chip name: Second",
            startLineNumber: 3,
            startColumn: 1,
            endLineNumber: 4,
            endColumn: 1,
            severity: 8,
          },
        ],
      ),
    );
  });

  it("supports a single error and clears stale markers", async () => {
    const view = render(editor([first]));
    await waitFor(() =>
      expect(
        fixture.monaco.editor.setModelMarkers.mock.lastCall?.[2],
      ).toHaveLength(1),
    );
    view.rerender(editor([unlocated]));
    expect(fixture.monaco.editor.setModelMarkers).toHaveBeenLastCalledWith(
      fixture.model,
      "hdl",
      [],
    );
    view.rerender(editor(multiple));
    expect(
      fixture.monaco.editor.setModelMarkers.mock.lastCall?.[2],
    ).toHaveLength(2);
    view.rerender(editor());
    expect(fixture.monaco.editor.setModelMarkers).toHaveBeenLastCalledWith(
      fixture.model,
      "hdl",
      [],
    );
  });
});

describe("parser diagnostic panel", () => {
  const panel = (diagnostics?: readonly Diagnostic[]) => (
    <I18nProvider i18n={i18n}>
      <ErrorPanel diagnostics={diagnostics} />
    </I18nProvider>
  );

  it("shows all messages, including errors without spans", () => {
    const view = render(panel(multiple));
    expect(view.container.querySelector("code")?.textContent).toBe(
      "Line 1: Undefined chip name: First\nWrong chip name\nLine 3: Undefined chip name: Second",
    );
  });

  it("supports a single error and clears on valid input", () => {
    const view = render(panel([first]));
    expect(view.container.querySelector("code")?.textContent).toBe(
      "Line 1: Undefined chip name: First",
    );
    view.rerender(panel());
    expect(view.container.querySelector("details")).toBeNull();
  });
});
