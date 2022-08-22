import { width } from "@davidsouther/jiffies/lib/esm/dom/css/sizing";
import { useCallback, useState } from "react";

const Mode = { VIEW: 0, EDIT: 1 };

export const InlineEdit = (props: {
  mode?: keyof typeof Mode;
  value: string;
  onChange: (value: string) => void;
}) => {
  const [mode, setMode] = useState(props.mode ?? Mode.VIEW);
  const [value, setValue] = useState(props.value);

  const render = () => {
    switch (mode) {
      case Mode.EDIT:
        return edit();
      case Mode.VIEW:
        return view();
      default:
        return <span />;
    }
  };

  const view = () => (
    <span
      style={{ cursor: "text", ...width("full", "inline") }}
      onClick={() => {
        setMode(Mode.EDIT);
      }}
    >
      {value}
    </span>
  );

  const doSelect = useCallback(
    (ref: HTMLInputElement | null) => ref?.select(),
    []
  );
  const doChange = useCallback(
    (target: EventTarget & HTMLInputElement) => {
      setMode(Mode.VIEW);
      setValue(target.value ?? "");
      props.onChange(target.value ?? "");
    },
    [props]
  );
  const edit = () => {
    const edit = (
      <span style={{ display: "block", position: "relative" }}>
        <input
          ref={doSelect}
          style={{
            zIndex: "10",
            position: "absolute",
            left: "0",
            marginTop: "-0.375rem",
          }}
          onBlur={({ target }) => doChange(target)}
          onKeyPress={({ key, target }) => {
            if (key === "Enter") {
              doChange(target);
            }
          }}
          type="text"
          defaultValue={value}
        />
      </span>
    );
    return edit;
  };

  return render();
};

export default InlineEdit;
