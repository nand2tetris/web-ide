import { width } from "@davidsouther/jiffies/lib/esm/dom/css/sizing";
import { useRef, useState } from "react";

const Mode = { VIEW: 0, EDIT: 1 };

export const InlineEdit = (props: {
  mode?: keyof typeof Mode;
  value: number;
  onChange: (value: string) => void;
}) => {
  const [mode, setMode] = useState(props.mode ?? Mode.VIEW);

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
      {props.value}
    </span>
  );

  const editRef = useRef<HTMLInputElement>();
  const edit = () => {
    const edit = (
      <span style={{ display: "block", position: "relative" }}>
        <input
          ref={(input) => {
            if (input) {
              editRef.current = input;
            }
          }}
          style={{
            zIndex: "10",
            position: "absolute",
            left: "0",
            marginTop: "-0.375rem",
          }}
          onBlur={({ target }) => {
            props.onChange(target.value ?? "");
          }}
          type="text"
          value={props.value}
        />
      </span>
    );
    setTimeout(() => {
      editRef.current?.dispatchEvent(new Event("focus"));
    });
    return edit;
  };

  return render();
};

export default InlineEdit;
