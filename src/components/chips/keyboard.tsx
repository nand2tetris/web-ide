import { KeyboardEvent, useCallback, useState } from "react";
import { Keyboard as KeyboardChip } from "../../simulator/chip/builtins/computer/computer";
import { Icon } from "../pico/icon";
import { RegisterComponent } from "./register";

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
  if (KeyMap[keypress.key]) {
    return KeyMap[keypress.key]!;
  }
  if (keypress.key.length === 1) {
    const code = keypress.key.charCodeAt(0);
    if (code >= 32 && code <= 126) {
      return code;
    }
  }

  return 0;
}

export const Keyboard = ({ keyboard }: { keyboard: KeyboardChip }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [bits, setBits] = useState(keyboard.out().busVoltage);

  const setKey = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      const key = keyPressToHackCharacter(event);
      if (key === 0) {
        return;
      }
      event.preventDefault();
      keyboard.setKey(key);
      setBits(keyboard.out().busVoltage);
      setShowPicker(false);
    },
    [keyboard, setShowPicker, setBits]
  );

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
          <input ref={(e) => e?.focus()} type="text" onKeyDown={setKey} />
        ) : (
          <button onClick={changeKey}>
            <Icon name="keyboard" />
          </button>
        )}
      </div>
    </div>
  );
};
