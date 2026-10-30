import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { BaseContext } from "@nand2tetris/components/stores/base.context.js";
import {
  type Diagnostic,
  DiagnosticCode,
  diagnostic,
  Stage,
} from "@nand2tetris/simulator/languages/diagnostic.js";
import { cleanup, render, waitFor, within } from "@testing-library/react";
import { type ReactNode, useContext } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppContext } from "../App.context";
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

const first = diagnostic(
  DiagnosticCode.Chip.NOT_FOUND,
  { name: "First" },
  { start: 0, end: 1, line: 1 },
);
const second = diagnostic(
  DiagnosticCode.Chip.NOT_FOUND,
  { name: "Second" },
  { start: 2, end: 3, line: 3 },
);
const unlocated = diagnostic(DiagnosticCode.Chip.WRONG_NAME, {});
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

const Context = ({
  children,
  showAll = false,
  monaco = true,
}: {
  children: ReactNode;
  showAll?: boolean;
  monaco?: boolean;
}) => {
  const base = useContext(BaseContext);
  const app = useContext(AppContext);
  return (
    <I18nProvider i18n={i18n}>
      <BaseContext.Provider value={{ ...base, attemptRecovery: showAll }}>
        <AppContext.Provider
          value={{ ...app, monaco: { ...app.monaco, wants: monaco } }}
        >
          {children}
        </AppContext.Provider>
      </BaseContext.Provider>
    </I18nProvider>
  );
};

const sourceEditor = (
  diagnostics?: readonly Diagnostic[],
  dependencyDiagnostics?: Record<string, readonly Diagnostic[]>,
) => (
  <Editor
    value="broken"
    onChange={() => undefined}
    language="hdl"
    path="Top.hdl"
    diagnostics={diagnostics}
    dependencyDiagnostics={dependencyDiagnostics}
  />
);

const messages = (container: HTMLElement) =>
  within(container)
    .queryAllByRole("listitem")
    .map((row) => row.textContent);
const markedMessages = () =>
  fixture.monaco.editor.setModelMarkers.mock.lastCall?.[2].map(
    (marker: { message: string }) => marker.message,
  );

describe("Problems under each editor", () => {
  it("selects the earliest syntax problem for both list and markers, and switches to all in source order", async () => {
    const compile = diagnostic(
      DiagnosticCode.Chip.NOT_FOUND,
      { name: "Compile" },
      { start: 0, end: 1, line: 1 },
      Stage.COMPILE,
    );
    const parse = diagnostic(
      DiagnosticCode.Chip.NOT_FOUND,
      { name: "Parse" },
      { start: 8, end: 9, line: 9 },
      Stage.PARSE,
    );
    const semantic = diagnostic(
      DiagnosticCode.Chip.NOT_FOUND,
      { name: "Semantic" },
      { start: 2, end: 3, line: 3 },
      Stage.SEMANTIC,
    );
    const lex = diagnostic(
      DiagnosticCode.Chip.NOT_FOUND,
      { name: "Lex" },
      { start: 4, end: 5, line: 5 },
      Stage.LEX,
    );
    const found = Object.freeze([parse, unlocated, semantic, lex, compile]);
    const editor = (showAll: boolean) => (
      <Context showAll={showAll}>{sourceEditor(found)}</Context>
    );
    const view = render(editor(false));

    expect(view.getByRole("button", { name: "Problems" })).toBeVisible();
    expect(messages(view.container)).toEqual([
      "First problem: Line 5: Undefined chip name: Lex (and 4 more)",
    ]);
    await waitFor(() =>
      expect(markedMessages()).toEqual(["Line 5: Undefined chip name: Lex"]),
    );

    view.rerender(editor(true));
    expect(messages(view.container)).toEqual([
      "Line 1: Undefined chip name: Compile",
      "Line 3: Undefined chip name: Semantic",
      "Line 5: Undefined chip name: Lex",
      "Line 9: Undefined chip name: Parse",
      "Wrong chip name",
    ]);
    expect(markedMessages()).toEqual([
      "Line 1: Undefined chip name: Compile",
      "Line 3: Undefined chip name: Semantic",
      "Line 5: Undefined chip name: Lex",
      "Line 9: Undefined chip name: Parse",
    ]);
    view.rerender(editor(false));
    expect(messages(view.container)).toEqual([
      "First problem: Line 5: Undefined chip name: Lex (and 4 more)",
    ]);
    expect(markedMessages()).toEqual(["Line 5: Undefined chip name: Lex"]);
  });

  it("prefers wider spans at the same start and preserves input order for equal spans", async () => {
    const problem = (name: string, start: number, end: number) =>
      diagnostic(
        DiagnosticCode.Chip.NOT_FOUND,
        { name },
        { start, end, line: start + 1 },
        Stage.PARSE,
      );
    const narrow = problem("Narrow", 2, 3);
    const wider = problem("Wider", 2, 8);
    const equalSpan = problem("Equal span", 2, 8);
    const later = problem("Later", 3, 20);
    const found = Object.freeze([later, narrow, wider, equalSpan]);
    const editor = (showAll: boolean) => (
      <Context showAll={showAll}>{sourceEditor(found)}</Context>
    );
    const view = render(editor(false));

    expect(messages(view.container)).toEqual([
      "First problem: Line 3: Undefined chip name: Wider (and 3 more)",
    ]);
    await waitFor(() =>
      expect(markedMessages()).toEqual(["Line 3: Undefined chip name: Wider"]),
    );

    view.rerender(editor(true));
    expect(messages(view.container)).toEqual([
      "Line 3: Undefined chip name: Wider",
      "Line 3: Undefined chip name: Equal span",
      "Line 3: Undefined chip name: Narrow",
      "Line 4: Undefined chip name: Later",
    ]);
    expect(markedMessages()).toEqual([
      "Line 3: Undefined chip name: Wider",
      "Line 3: Undefined chip name: Equal span",
      "Line 3: Undefined chip name: Narrow",
      "Line 4: Undefined chip name: Later",
    ]);
  });

  it("falls back to the earliest semantic or compile problem when there is no syntax problem", async () => {
    const compile = { ...second, stage: Stage.COMPILE };
    const semantic = { ...first, stage: Stage.SEMANTIC };
    const view = render(
      <Context>{sourceEditor([compile, unlocated, semantic])}</Context>,
    );

    expect(messages(view.container)).toEqual([
      "First problem: Line 1: Undefined chip name: First (and 2 more)",
    ]);
    await waitFor(() =>
      expect(markedMessages()).toEqual(["Line 1: Undefined chip name: First"]),
    );
  });

  it("keeps an unlocated first problem without promoting a later marker, and clears on valid input", async () => {
    const syntax = { ...unlocated, stage: Stage.PARSE };
    const semantic = { ...first, stage: Stage.SEMANTIC };
    const view = render(<Context>{sourceEditor([semantic, syntax])}</Context>);

    expect(messages(view.container)).toEqual([
      "First problem: Wrong chip name (and 1 more)",
    ]);
    await waitFor(() => expect(markedMessages()).toEqual([]));

    view.rerender(<Context>{sourceEditor([unlocated])}</Context>);
    expect(messages(view.container)).toEqual([
      "First problem: Wrong chip name",
    ]);
    expect(markedMessages()).toEqual([]);
    view.rerender(<Context>{sourceEditor()}</Context>);
    expect(view.queryByRole("button", { name: "Problems" })).toBeNull();
    expect(markedMessages()).toEqual([]);
  });

  it.each([true, false])(
    "keeps dependency messages and counts separate from the editor's own text (Monaco: %s)",
    async (monaco) => {
      const children = {
        "projects/Child.hdl": [second, unlocated],
        "projects/Other.hdl": [unlocated],
      };
      const editor = (showAll: boolean) => (
        <Context monaco={monaco} showAll={showAll}>
          {sourceEditor([first], children)}
        </Context>
      );
      const view = render(editor(false));
      const dependencies = view.container.querySelector<HTMLElement>(
        ".dependency-diagnostics",
      );
      expect(dependencies).not.toBeNull();
      expect(messages(view.container)).toEqual([
        "First problem: Line 1: Undefined chip name: First",
        "First problem: Line 3: Undefined chip name: Second (and 1 more)",
        "First problem: Wrong chip name",
      ]);
      expect(
        within(dependencies as HTMLElement).getByRole("button", {
          name: "Problems in projects/Child.hdl",
        }),
      ).toBeVisible();
      expect(
        within(dependencies as HTMLElement).getByRole("button", {
          name: "Problems in projects/Other.hdl",
        }),
      ).toBeVisible();
      if (monaco)
        await waitFor(() =>
          expect(markedMessages()).toEqual([
            "Line 1: Undefined chip name: First",
          ]),
        );
      else expect(view.getByRole("textbox")).toHaveValue("broken");

      view.rerender(editor(true));
      expect(messages(view.container)).toEqual([
        "Line 1: Undefined chip name: First",
        "Line 3: Undefined chip name: Second",
        "Wrong chip name",
        "Wrong chip name",
      ]);
      if (monaco)
        expect(markedMessages()).toEqual([
          "Line 1: Undefined chip name: First",
        ]);
    },
  );

  it("shows each textarea editor's own list and count", () => {
    const view = render(
      <Context monaco={false}>
        {sourceEditor([first, second])}
        <Editor
          value="other"
          onChange={() => undefined}
          language="hdl"
          path="Other.hdl"
          diagnostics={[unlocated]}
        />
      </Context>,
    );
    const editors = view.container.querySelectorAll<HTMLElement>(".Editor");
    expect(messages(editors[0])).toEqual([
      "First problem: Line 1: Undefined chip name: First (and 1 more)",
    ]);
    expect(messages(editors[1])).toEqual(["First problem: Wrong chip name"]);
  });
});

describe("Problems panel", () => {
  it("lists messages without spans and disappears when there are no problems", () => {
    const panel = (diagnostics?: readonly Diagnostic[]) => (
      <I18nProvider i18n={i18n}>
        <ErrorPanel diagnostics={diagnostics} />
      </I18nProvider>
    );
    const view = render(panel(multiple));
    expect(messages(view.container)).toEqual([
      "Line 1: Undefined chip name: First",
      "Wrong chip name",
      "Line 3: Undefined chip name: Second",
    ]);
    view.rerender(panel());
    expect(view.container.querySelector("details")).toBeNull();
  });
});
