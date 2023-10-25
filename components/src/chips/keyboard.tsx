import { Keyboard as KeyboardChip } from "@nand2tetris/simulator/chip/builtins/computer/computer.js";
import { KeyboardEvent, useCallback, useState } from "react";
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
  keyboard: KeyboardChip;
  update?: () => void;
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [bits, setBits] = useState(keyboard.out().busVoltage);
  let currentKey = 0;

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const key = keyPressToHackCharacter(event);
    if (key === currentKey) {
      return;
    }
    setKey(key);
    update?.();
  };

  const onKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
    currentKey = 0;
    keyboard.clearKey();
    update?.();
    setBits(keyboard.out().busVoltage);
  };

  const setKey = (key: number) => {
    if (key === 0) {
      return;
    }
    keyboard.setKey(key);
    setBits(keyboard.out().busVoltage);
    currentKey = key;
    // setShowPicker(false);
  };

  const changeKey = useCallback(() => {
    setShowPicker(true);
  }, []);

  return (
    <div className="flex row align-baseline">
      <div className="flex-1">
        <RegisterComponent name="Keyboard" bits={bits} />
      </div>
      <div className="flex-1">
        {showPicker ? (
          <input
            ref={(e) => e?.focus()}
            type="text"
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
          />
        ) : (
          <button onClick={changeKey}>
            {/* <Icon name="keyboard" /> */}
            ⌨️
          </button>
        )}
      </div>
    </div>
  );
};
