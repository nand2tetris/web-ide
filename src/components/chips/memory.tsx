import { ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { rounded } from "@davidsouther/jiffies/lib/esm/dom/css/border";

import {
  Format,
  FORMATS,
  Memory as MemoryChip,
} from "../../simulator/cpu/memory";
import { asm } from "../../util/asm";
import { bin, dec, hex } from "../../util/twos";
import InlineEdit from "../pico/inline_edit";
import VirtualScroll from "../pico/virtual_scroll";
import { Icon } from "../pico/icon";
import { AppContext } from "../../App.context";

const ITEM_HEIGHT = 34;

export const MemoryBlock = ({
  memory,
  highlight = -1,
  editable = false,
  format = dec,
  onChange = () => {},
}: {
  memory: MemoryChip;
  highlight?: number;
  editable?: boolean;
  format?: (v: number) => string;
  onChange?: (i: number, value: string, previous: number) => void;
}) => {
  const settings = useMemo(
    () => ({ count: 20, maxIndex: memory.size, itemHeight: ITEM_HEIGHT }),
    [memory.size]
  );
  const get = useCallback(
    (offset: number, count: number) =>
      memory
        .range(offset, offset + count)
        .map((v, i) => [i, v] as [number, number]),
    [memory]
  );
  const row = useCallback(
    ([i, v]: [number, number]) => (
      <MemoryCell
        index={i}
        value={format(v)}
        editable={editable}
        highlight={i === highlight}
        onChange={onChange}
      />
    ),
    [format, editable, highlight, onChange]
  );

  return (
    <VirtualScroll<[number, number], ReactNode>
      settings={settings}
      get={get}
      row={row}
    />
  );
};

export const MemoryCell = ({
  index,
  value,
  highlight = false,
  editable = false,
  onChange = () => {},
}: {
  index: number;
  value: string;
  highlight?: boolean;
  editable?: boolean;
  onChange?: (i: number, value: string, previous: number) => void;
}) => (
  <div style={{ display: "flex", height: "100%" }}>
    <code
      style={{
        ...rounded("none"),
        ...(highlight
          ? { background: "var(--code-kbd-background-color)" }
          : {}),
      }}
    >
      {hex(index)}
    </code>
    <code
      style={{
        flex: "1",
        textAlign: "right",
        ...rounded("none"),
        ...(highlight
          ? { background: "var(--code-kbd-background-color)" }
          : {}),
      }}
    >
      {editable ? (
        <InlineEdit
          value={value}
          onChange={(newValue: string) =>
            onChange(index, newValue, Number(value))
          }
        />
      ) : (
        <span>{value}</span>
      )}
    </code>
  </div>
);

export const Memory = ({
  name = "Memory",
  highlight = -1,
  editable = true,
  memory,
  format = "dec",
}: {
  name?: string;
  editable?: boolean;
  highlight?: number;
  memory: MemoryChip;
  format: Format;
}) => {
  const [fmt, setFormat] = useState(format);
  const [jmp, setJmp] = useState("0");

  const jumpTo = () => {
    console.log(`Jumping to ${jmp}`);
  };

  const { filePicker, fs, setStatus } = useContext(AppContext);
  const doLoad = useCallback(async () => {
    try {
      const file = await filePicker.select();
      await memory.load(fs, file);
    } catch (e) {
      console.error(e);
      setStatus(`Failed to load into memory`);
    }
  }, [fs, filePicker, memory, setStatus]);

  return (
    <article className="panel">
      <header>
        <div>{name}</div>
        <fieldset role="group">
          <button onClick={doLoad} className="flex-0">
            <Icon name="upload_file" />
          </button>
          <input
            className="flex-1"
            placeholder="Jump..."
            onChange={(e) => setJmp(e.target.value ?? "0")}
          />
          <button onClick={jumpTo} className="flex-0">
            <Icon name="move_down" />
          </button>
        </fieldset>
        <fieldset role="group">
          {FORMATS.map((option) => {
            return (
              <label key={option} role="button" aria-current={option === fmt}>
                <input
                  type="radio"
                  name={name}
                  value={option}
                  checked={option === fmt}
                  onChange={() => setFormat(option)}
                />
                {option}
              </label>
            );
          })}
        </fieldset>
      </header>
      <MemoryBlock
        memory={memory}
        highlight={highlight}
        editable={editable}
        format={(v: number) => doFormat(fmt, v)}
        onChange={(i: number, v: string) => memory.update(i, v, fmt ?? "dec")}
      />
    </article>
  );
};

export default Memory;

function doFormat(format: Format, v: number): string {
  switch (format) {
    case "bin":
      return bin(v);
    case "hex":
      return hex(v);
    case "asm":
      return asm(v);
    case "dec":
    default:
      return dec(v);
  }
}
