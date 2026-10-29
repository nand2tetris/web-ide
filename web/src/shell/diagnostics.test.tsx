import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import type { Diagnostic } from "@nand2tetris/simulator/languages/base.js";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Editor, ErrorPanel } from "./editor";
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

const first: Diagnostic = {
  message: "First error",
  span: { start: 0, end: 1, line: 1 },
};
const second: Diagnostic = {
  message: "Second error",
  span: { start: 2, end: 3, line: 3 },
};
const unlocated: Diagnostic = { message: "No location" };
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
            message: "First error",
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 2,
            endColumn: 1,
            severity: 8,
          },
          {
            message: "Second error",
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
      "First error\nNo location\nSecond error",
    );
  });

  it("supports a single error and clears on valid input", () => {
    const view = render(panel([first]));
    expect(view.container.querySelector("code")?.textContent).toBe(
      "First error",
    );
    view.rerender(panel());
    expect(view.container.querySelector("details")).toBeNull();
  });
});

describe("diagnostics of a file the editor does not show", () => {
  it("marks only this file's spans, and names the other file above its messages", async () => {
    const view = render(
      <I18nProvider i18n={i18n}>
        <Editor
          value="broken"
          onChange={() => undefined}
          language="hdl"
          path="Top.hdl"
          diagnostics={[first]}
          dependencyDiagnostics={{ "projects/Child.hdl": [second, unlocated] }}
        />
      </I18nProvider>,
    );

    await waitFor(() =>
      expect(fixture.monaco.editor.setModelMarkers).toHaveBeenLastCalledWith(
        fixture.model,
        "hdl",
        [expect.objectContaining({ message: "First error" })],
      ),
    );
    const panel = view.container.querySelector(".dependency-diagnostics");
    expect(panel?.querySelector("summary")?.textContent).toBe(
      "Errors in projects/Child.hdl",
    );
    expect(panel?.querySelector("code")?.textContent).toBe(
      "Second error\nNo location",
    );
  });
});
