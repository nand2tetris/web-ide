import { vi } from "vitest";

vi.mock("@monaco-editor/react", () => {
  const FakeEditor = vi.fn((props) => {
    return (
      <textarea
        data-auto={props.wrapperClassName}
        data-testid={`editor-${props.language}`}
        onChange={(e) => props.onChange(e.target.value)}
        value={props.value}
      ></textarea>
    );
  });
  return FakeEditor;
});

export {};
