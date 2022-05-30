import {
  Format,
  FORMATS,
  Memory as MemoryChip,
} from "../simulator/cpu/memory.js";
import { asm } from "../util/asm.js";
import { bin, dec, hex } from "../util/twos.js";

import ButtonBar from "@davidsouther/jiffies/components/button_bar.js";
import InlineEdit from "@davidsouther/jiffies/components/inline_edit.js";
import VirtualScroll from "@davidsouther/jiffies/components/virtual_scroll.js";
import {
  article,
  code,
  div,
  header,
  span,
} from "@davidsouther/jiffies/dom/html.js";
import { rounded } from "@davidsouther/jiffies/dom/css/border.js";
import { FC, State } from "@davidsouther/jiffies/dom/fc.js";

const ITEM_HEIGHT = 33.5;

const MemoryBlock = FC<
  {
    memory: MemoryChip;
    highlight?: number;
    editable?: boolean;
    format: (v: number) => string;
    onChange: (i: number, value: string, previous: number) => void;
  },
  {
    // @ts-ignore TODO(TFC)
    virtualScroll: VirtualScroll<number, typeof MemoryCell>;
  }
>(
  "memory-block",
  (el, { memory, highlight = -1, editable = false, format, onChange }) => {
    if (el[State].virtualScroll) {
      el[State].virtualScroll?.update();
    } else {
      el[State].virtualScroll = VirtualScroll({
        settings: { count: 20, maxIndex: memory.size, itemHeight: ITEM_HEIGHT },
        get: (o, l) => memory.map((i, v) => [i, v], o, o + l),
        row: ([i, v]) =>
          // @ts-ignore TODO(TFC)
          MemoryCell({
            index: i,
            value: v,
            editable: editable,
            highlight: i === highlight,
            onChange: (value) => onChange(i, `${value}`, v),
          }),
      });
    }
    return el[State].virtualScroll!;
  }
);

const MemoryCell = FC<{
  index: number;
  value: number;
  highlight?: boolean;
  editable?: boolean;
  onChange: (i: number, value: string, previous: number) => void;
}>(
  "memory-cell",
  (
    el,
    { index, value, highlight = false, editable = false, onChange = () => {} }
  ) => {
    el.style.display = "flex";
    return [
      code(
        {
          style: {
            ...rounded("none"),
            ...(highlight
              ? { background: "var(--code-kbd-background-color)" }
              : {}),
          },
        },
        hex(index)
      ),
      code(
        {
          style: {
            flex: "1",
            textAlign: "right",
            ...rounded("none"),
            ...(highlight
              ? { background: "var(--code-kbd-background-color)" }
              : {}),
          },
        },
        editable
          ? InlineEdit({
              value: `${value}`,
              events: {
                // @ts-ignore TODO(FC Events)
                change: (newValue: string) => onChange(index, newValue, value),
              },
            })
          : span(`${value}`)
      ),
    ];
  }
);

const Memory = FC<
  {
    name?: string;
    editable?: boolean;
    highlight?: number;
    memory: MemoryChip;
    format: Format;
  },
  { format: Format }
>(
  "memory-gui",
  (
    el,
    { name = "Memory", highlight = -1, editable = true, memory, format = "dec" }
  ) => {
    el.style.width = "100%";
    const state = el[State];
    state.format ??= format;
    const setFormat = (f: Format) => {
      state.format = f;
      buttonBar.update({ value: state.format });
      memoryBlock.update();
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
        memoryBlock.update();
      },
    });

    return article(header(div(name), buttonBar), memoryBlock);
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
