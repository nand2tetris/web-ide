import { width } from "@davidsouther/jiffies/lib/esm/dom/css/sizing.js";
import { useCallback, useState } from "react";
import { useStateInitializer } from "./react.js";

const Mode = { VIEW: 0, EDIT: 1 };

export const InlineEdit = (props: {
  mode?: keyof typeof Mode;
  value: string;
  highlight: boolean;
  onChange: (value: string) => void;
  onFocus?: () => void;
}) => {
  const [mode, setMode] = useState(props.mode ?? Mode.VIEW);
  const [value, setValue] = useStateInitializer(props.value);

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
    (target: HTMLInputElement) => {
      setMode(Mode.VIEW);
      setValue(target.value ?? "");
      props.onChange(target.value ?? "");
    },
    [props, setMode, setValue]
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
            color: "var(--text-color)",
          }}
          onFocus={props.onFocus}
          onBlur={({ target }) => doChange(target)}
          onKeyPress={({ key, target }) => {
            if (key === "Enter") {
              doChange(target as HTMLInputElement);
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
