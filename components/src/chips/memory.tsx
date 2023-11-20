import { rounded } from "@davidsouther/jiffies/lib/esm/dom/css/border.js";
import {
  ChangeEvent,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Format,
  FORMATS,
  MemoryAdapter,
} from "@nand2tetris/simulator/cpu/memory.js";
import { loadAsm, loadBlob, loadHack } from "@nand2tetris/simulator/loader.js";
import { asm } from "@nand2tetris/simulator/util/asm.js";
import { bin, dec, hex } from "@nand2tetris/simulator/util/twos.js";

import { useClockReset } from "../clockface.js";
import InlineEdit from "../inline_edit.js";
import { useStateInitializer } from "../react.js";
import { BaseContext } from "../stores/base.context.js";
import VirtualScroll, { VirtualScrollSettings } from "../virtual_scroll.js";

const ITEM_HEIGHT = 34;

export const MemoryBlock = ({
  memory,
  jmp = { value: 0 },
  highlight = -1,
  editable = false,
  justifyLeft = false,
  format = dec,
  onChange = () => undefined,
  onFocus = () => undefined,
}: {
  jmp?: { value: number };
  memory: MemoryAdapter;
  highlight?: number;
  editable?: boolean;
  justifyLeft?: boolean;
  format?: (v: number) => string;
  onChange?: (i: number, value: string, previous: number) => void;
  onFocus?: (i: number) => void;
}) => {
  const settings = useMemo<Partial<VirtualScrollSettings>>(
    () => ({
      count: Math.min(memory.size, 25),
      maxIndex: memory.size,
      itemHeight: ITEM_HEIGHT,
      startIndex: jmp.value,
    }),
    [memory.size, jmp]
  );
  const get = useCallback(
    (offset: number, count: number) =>
      memory
        .range(offset, offset + count)
        .map((v, i) => [i + offset, v] as [number, number]),
    [memory]
  );
  const row = useCallback(
    ([i, v]: [number, number]) => (
      <MemoryCell
        index={i}
        value={format(v)}
        size={memory.size}
        editable={editable}
        justifyLeft={justifyLeft}
        highlight={i === highlight}
        onChange={onChange}
        onFocus={onFocus}
      />
    ),
    [format, editable, highlight, onChange]
  );

  return (
    <VirtualScroll<[number, number], ReactNode>
      settings={settings}
      get={get}
      row={row}
      rowKey={([i]) => i}
    />
  );
};

export const MemoryCell = ({
  index,
  value,
  size,
  highlight = false,
  editable = false,
  justifyLeft = false,
  onChange = () => undefined,
  onFocus = () => undefined,
}: {
  index: number;
  value: string;
  size?: number;
  highlight?: boolean;
  editable?: boolean;
  justifyLeft?: boolean;
  onChange?: (i: number, value: string, previous: number) => void;
  onFocus?: (i: number) => void;
}) => (
  <div style={{ display: "flex", height: "100%" }}>
    <code
      style={{
        ...rounded("none"),
        ...(highlight ? { background: "var(--mark-background-color)" } : {}),
        whiteSpace: "pre",
      }}
    >
      {size
        ? dec(index).padStart(Math.ceil(Math.log10(size)), " ")
        : dec(index)}
    </code>
    <code
      style={{
        flex: "1",
        textAlign: justifyLeft ? "left" : "right",
        color: "black",
        ...rounded("none"),
        ...(highlight ? { background: "var(--mark-background-color)" } : {}),
      }}
    >
      {editable ? (
        <InlineEdit
          value={value}
          highlight={highlight}
          onChange={(newValue: string) =>
            onChange(index, newValue, Number(value))
          }
          onFocus={() => onFocus(index)}
        />
      ) : (
        <span style={{ color: "black" }}>{value}</span>
      )}
    </code>
  </div>
);

export const Memory = ({
  name = "Memory",
  displayEnabled = true,
  highlight = -1,
  editable = true,
  memory,
  format = "dec",
  onUpload = undefined,
  onChange = undefined,
}: {
  name?: string;
  displayEnabled?: boolean;
  editable?: boolean;
  highlight?: number;
  memory: MemoryAdapter;
  format: Format;
  onUpload?: (fileName: string) => void;
  onChange?: () => void;
}) => {
  const [fmt, setFormat] = useState(format);
  const [jmp, setJmp] = useState("");
  const [goto, setGoto] = useState({ value: 0 });
  const [highlighted, setHighlighted] = useStateInitializer(highlight);
  const [renderKey, setRenderKey] = useState(0);

  const jumpTo = () => {
    const value =
      !isNaN(parseInt(jmp)) && isFinite(parseInt(jmp)) ? Number(jmp) : 0;
    setHighlighted(value);
    setGoto({
      value: value,
    });
  };

  const fileUploadRef = useRef<HTMLInputElement>(null);
  const doLoad = useCallback(() => {
    onChange?.();
    fileUploadRef.current?.click();
  }, [fileUploadRef]);

  const { setStatus } = useContext(BaseContext);
  const upload = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) {
      setStatus("No file selected");
      return;
    }
    const file = event.target.files[0];
    onUpload?.(file.name);
    const source = await file.text();
    const loader = file.name.endsWith("hack")
      ? loadHack
      : file.name.endsWith("asm")
      ? loadAsm
      : loadBlob;
    const bytes = await loader(source);
    memory.loadBytes(bytes);
    event.target.value = ""; // Clear the input out
    jumpTo();
  }, []);

  const rerenderMemoryBlock = () => {
    setRenderKey(renderKey + 1);
  };

  const clear = () => {
    memory.reset();
    onChange?.();
    rerenderMemoryBlock();
  };

  const doUpdate = (i: number, v: string) => {
    memory.update(i, v, fmt ?? "dec");
    onChange?.();
    rerenderMemoryBlock();
  };

  useClockReset(() => {
    setJmp("");
    setGoto({ value: 0 });
  });

  return (
    <article className={`panel memory ${name}`}>
      <header>
        <div>{name}</div>
        <fieldset role="group">
          <input
            type="file"
            style={{ display: "none" }}
            ref={fileUploadRef}
            onChange={upload}
          />
          <button
            onClick={doLoad}
            className="flex-0"
            data-tooltip={"Load file"}
            data-placement="bottom"
          >
            {/* <Icon name="upload_file" /> */}
            📂
          </button>
          <button
            onClick={clear}
            className="flex-0"
            data-tooltip={"Clear"}
            data-placement="bottom"
          >
            {/* <Icon name="upload_file" /> */}
            🆑
          </button>
          <input
            style={{ width: "4em", height: "100%" }}
            placeholder="Addr"
            value={jmp}
            onKeyDown={({ key }) => key === "Enter" && jumpTo()}
            onChange={({ target: { value } }) => setJmp(value)}
          />
          <button
            onClick={jumpTo}
            className="flex-0"
            data-tooltip={"Scroll to address"}
            data-placement="bottom"
          >
            {/* <Icon name="move_down" /> */}
            ⤵️
          </button>
          <select value={fmt} onChange={(e) => setFormat(e.target.value)}>
            {FORMATS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </fieldset>
      </header>
      {displayEnabled ? (
        <MemoryBlock
          key={renderKey}
          jmp={goto}
          memory={memory}
          highlight={highlighted}
          editable={editable}
          justifyLeft={fmt == "asm"}
          format={(v: number) => doFormat(fmt, v)}
          onChange={doUpdate}
          onFocus={(i) => setHighlighted(i)}
        />
      ) : (
        "Memory display is disabled"
      )}
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
