import { KeyboardAdapter } from "@nand2tetris/simulator/cpu/memory.js";
import { useEffect, useRef, useState } from "react";
import { RegisterComponent } from "./register.js";

const KeyMap: Record<string, number | undefined> = {
  // Delete: 127,
  Enter: 128,
  Backspace: 129,
  ArrowLeft: 130,
  ArrowUp: 131,
  ArrowRight: 132,
  ArrowDown: 133,
  Home: 134,
  End: 135,
  PageUp: 136,
  PageDown: 137,
  Insert: 138,
  Delete: 139,
  Escape: 140,
  F1: 141,
  F2: 142,
  F3: 143,
  F4: 144,
  F5: 145,
  F6: 146,
  F7: 147,
  F8: 148,
  F9: 149,
  F10: 150,
  F11: 151,
  F12: 152,
};

const keyDisplays: Record<string, string> = {
  ArrowLeft: "L-arrow",
  ArrowUp: "U-arrow",
  ArrowRight: "R-arrow",
  ArrowDown: "D-arrow",
};

function getKeyDisplay(key: string) {
  return keyDisplays[key] ?? key;
}

function keyPressToHackCharacter(keypress: KeyboardEvent): number {
  const mapping = KeyMap[keypress.key];
  if (mapping !== undefined) {
    return mapping;
  }
  if (keypress.key.length === 1) {
    const code = keypress.key.charCodeAt(0);
    if (code >= 32 && code <= 126) {
      return code;
    }
  }

  return 0;
}

export const Keyboard = ({
  keyboard,
  update,
}: {
  keyboard: KeyboardAdapter;
  update?: () => void;
}) => {
  const [enabled, setEnabled] = useState(false);
  const [character, setCharacter] = useState("");
  const [bits, setBits] = useState(keyboard.getKey());
  let currentKey = 0;

  const toggleRef = useRef<HTMLButtonElement>(null);

  const toggleEnabled = () => {
    setEnabled(!enabled);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!enabled) {
      return;
    }

    setCharacter(getKeyDisplay(event.key));
    toggleRef.current?.blur();
    const key = keyPressToHackCharacter(event);
    if (key === currentKey) {
      return;
    }
    setKey(key);
    update?.();
  };

  const onKeyUp = (event: KeyboardEvent) => {
    toggleRef.current?.blur();
    if (!enabled) {
      return;
    }

    currentKey = 0;
    keyboard.clearKey();
    update?.();
    setBits(keyboard.getKey());
    setCharacter("");
  };

  // note on setCharacter vs setKey:
  // setCharacter sets the string value that will be displayed in the component,
  // while setKey actually sets and tracks the value that will be stored in the keyboard memory

  const setKey = (key: number) => {
    if (key === 0) {
      return;
    }
    keyboard.setKey(key);
    setBits(keyboard.getKey());
    currentKey = key;
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  });

  return (
    <article className="panel">
      <div className="flex row align-baseline">
        <div className="flex-2">Key: {character}</div>
        <div className="flex-2">
          <RegisterComponent name="Char code" bits={bits} />
        </div>
        <div className="flex-3">
          <button onClick={toggleEnabled} ref={toggleRef}>
            {/* <Icon name="keyboard" /> */}
            {`${enabled ? "Disable" : "Enable"} Keyboard`}
          </button>
        </div>
      </div>
    </article>
  );
};
