import {
  Format,
  FORMATS,
  Memory as MemoryChip,
} from "../simulator/cpu/memory"
import { asm } from "../util/asm"
import { bin, dec, hex } from "../util/twos"

import {FC} from 'react';

const ITEM_HEIGHT = 33.5;

const MemoryBlock: FC<
  {
    memory: MemoryChip;
    highlight?: number;
    editable?: boolean;
    format: (v: number) => string;
    onChange: (i: number, value: string, previous: number) => void;
  }
> = 
  ({ memory, highlight = -1, editable = false, format, onChange }) => {
    const state = (el[State] ??= {});
    if (state.virtualScroll) {
      state.virtualScroll?.update();
    } else {
      state.virtualScroll = <VirtualScroll
        settings={{ count: 20, maxIndex: memory.size, itemHeight: ITEM_HEIGHT }}
        get={(o, l) => memory.map((i, v) => [i, v], o, o + l)}
        row={([i, v]) =>
          <MemoryCell
            index={i}
            value={v}
            editable={editable}
            highlight={i === highlight}
            onChange={(value) => onChange(i, `${value}`, v)}></MemoryCell>
      }></VirtualScroll>}
    return state.virtualScroll;
    }

const MemoryCell: FC<{
  index: number;
  value: number;
  highlight?: boolean;
  editable?: boolean;
  onChange: (i: number, value: string, previous: number) => void;
}>=
  (
    { index, value, highlight = false, editable = false, onChange = () => {} }
  ) => <>
      <code style={{
            ...rounded("none"),
            ...(highlight
              ? { background: "var(--code-kbd-background-color)" }
              : {}),
          }}
          >
        {hex(index)}
      </code>
      <code style={{
            flex: "1",
            textAlign: "right",
            ...rounded("none"),
            ...(highlight
              ? { background: "var(--code-kbd-background-color)" }
              : {}),
          }}>
        {editable
          ? InlineEdit({
              value: `${value}`,
              events: {
                // @ts-ignore TODO(FC Events)
                change: (newValue: string) => onChange(index, newValue, value),
              },
            })
          : <span>{value}</span>
          }
      </code>
  </>

const Memory: FC<
  {
    name?: string;
    editable?: boolean;
    highlight?: number;
    memory: MemoryChip;
    format: Format;
  }
> = (
  (
    { name = "Memory", highlight = -1, editable = true, memory, format = "dec" }
  ) => {
    // @ts-ignore
    // el.style.width = "100%";
    const state = (el[State] ??= {});
    state.format ??= format;
    const setFormat = (f: Format) => {
      state.format = f;
      buttonBar.update({ value: state.format });
      // memoryBlock.update();
    };

    const buttonBar = ButtonBar({
      value: state.format,
      values: FORMATS,
      events: { onSelect: setFormat },
    });

    const memoryBlock = MemoryBlock({
      memory,
      highlight,
      editable,
      format: (v) => doFormat(state.format ?? "dec", v),
      onChange: (i, v) => {
        memory.update(i, v, state.format ?? "dec");
        // memoryBlock.update();
      },
    });

    return <article><header><div>{name}</div>{buttonBar}</header>{memoryBlock}</article>;
  }
);

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