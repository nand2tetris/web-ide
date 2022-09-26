jest.mock("@monaco-editor/react", () => {
  const FakeEditor = jest.fn((props) => {
    console.log(props);
    console.log("Used FakeEditor");
    return (
      <textarea
        data-auto={props.wrapperClassName}
        data-testid={`editor-${props.language}`}
        onChange={(e) => props.onChange(e.target.value)}
        value={props.value}
      ></textarea>
    );
  });
  console.log("mocked fake editor");
  return FakeEditor;
});

export {};
