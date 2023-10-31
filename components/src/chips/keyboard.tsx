import { KeyboardEvent, useState } from "react";
import { KeyboardAdapter } from "@nand2tetris/simulator/cpu/memory.js";
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
  // const [showPicker, setShowPicker] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [character, setCharacter] = useState("");
  const [bits, setBits] = useState(keyboard.getKey());
  let currentKey = 0;

  const toggleEnabled = () => {
    setEnabled(!enabled);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!enabled) {
      return;
    }

    setCharacter(event.key);
    const key = keyPressToHackCharacter(event);
    if (key === currentKey) {
      return;
    }
    setKey(key);
    update?.();
  };

  const onKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!enabled) {
      return;
    }

    currentKey = 0;
    keyboard.clearKey();
    update?.();
    setBits(keyboard.getKey());
    setCharacter("");
  };

  const setKey = (key: number) => {
    if (key === 0) {
      return;
    }
    keyboard.setKey(key);
    setBits(keyboard.getKey());
    currentKey = key;
  };

  return (
    <div className="flex row align-baseline">
      <div className="flex-1">
        <RegisterComponent name="Keyboard" bits={bits} />
      </div>
      <div className="flex-1">{`Character: ${character}`}</div>
      <div className="flex-1">
        <button onClick={toggleEnabled} onKeyDown={onKeyDown} onKeyUp={onKeyUp}>
          {/* <Icon name="keyboard" /> */}
          {enabled ? "Disable   " : "Enable   "}⌨️
        </button>
      </div>
    </div>
  );
};
