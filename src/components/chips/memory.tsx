import { ReactNode, useState } from "react";
import { rounded } from "@davidsouther/jiffies/lib/esm/dom/css/border";

import "../pico/button-group.scss";

import {
  Format,
  FORMATS,
  Memory as MemoryChip,
} from "../../simulator/cpu/memory";
import { asm } from "../../util/asm";
import { bin, dec, hex } from "../../util/twos";
import InlineEdit from "../pico/inline_edit";
import VirtualScroll from "../pico/virtual_scroll";

const ITEM_HEIGHT = 33.5;

export const MemoryBlock = ({
  memory,
  highlight = -1,
  editable = false,
  format = dec,
  onChange,
}: {
  memory: MemoryChip;
  highlight?: number;
  editable?: boolean;
  format?: (v: number) => string;
  onChange?: (i: number, value: string, previous: number) => void;
}) => (
  <VirtualScroll<[number, number], ReactNode>
    settings={{ count: 20, maxIndex: memory.size, itemHeight: ITEM_HEIGHT }}
    get={(o, l) => memory.map<[number, number]>((i, v) => [i, v], o, o + l)}
    row={([i, v]) => (
      <MemoryCell
        index={i}
        value={format(v)}
        editable={editable}
        highlight={i === highlight}
        onChange={(value) => onChange && onChange(i, `${value}`, v)}
      ></MemoryCell>
    )}
  ></VirtualScroll>
);

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
  <>
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
  </>
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

  return (
    <article>
      <header>
        <div>{name}</div>
        <fieldset role="group">
          {FORMATS.map((option) => {
            const opt = option.replace(/\s+/g, "_").toLowerCase();
            const id = `${name}-${opt}`;
            return (
              <>
                <label
                  key={id}
                  role="button"
                  htmlFor={id}
                  aria-current={option === fmt}
                >
                  <input
                    type="radio"
                    id={id}
                    name={name}
                    value={option}
                    checked={option === fmt}
                    onChange={() => setFormat(option)}
                  />
                  {option}
                </label>
              </>
            );
          })}
        </fieldset>
      </header>
      <MemoryBlock
        memory={memory}
        highlight={highlight}
        editable={editable}
        format={(v) => doFormat(fmt ?? "dec", v)}
        onChange={(i, v) => {
          memory.update(i, v, fmt ?? "dec");
        }}
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
