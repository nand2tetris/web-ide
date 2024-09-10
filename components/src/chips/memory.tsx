import { rounded } from "@davidsouther/jiffies/lib/esm/dom/css/border.js";
import {
  forwardRef,
  ReactNode,
  useCallback,
  useContext,
  useImperativeHandle,
  useMemo,
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
import { LOADING } from "../messages.js";
import { useStateInitializer } from "../react.js";
import { BaseContext } from "../stores/base.context.js";
import VirtualScroll, { VirtualScrollSettings } from "../virtual_scroll.js";

const ITEM_HEIGHT = 34;

export const MemoryBlock = ({
  memory,
  jmp = { value: 0 },
  highlight = -1,
  editable = false,
  justifyLeft = false, // TODO: handle this in css in the future
  count,
  maxSize,
  offset = 0,
  cellLabels,
  format = dec,
  onChange = () => undefined,
  onFocus = () => undefined,
}: {
  jmp?: { value: number };
  memory: MemoryAdapter;
  highlight?: number;
  editable?: boolean;
  justifyLeft?: boolean;
  count?: number;
  offset?: number;
  maxSize?: number;
  cellLabels?: string[];
  format?: (v: number) => string;
  onChange?: (i: number, value: string, previous: number) => void;
  onFocus?: (i: number) => void;
}) => {
  const settings = useMemo<Partial<VirtualScrollSettings>>(
    () => ({
      count: Math.min(memory.size, count ?? 25),
      maxIndex: maxSize ?? memory.size,
      itemHeight: ITEM_HEIGHT,
      startIndex: jmp.value,
    }),
    [memory.size, jmp],
  );
  const get = useCallback(
    (pos: number, count: number): [number, number][] =>
      memory
        .range(pos + offset, pos + offset + count)
        .map((v, i) => [i + pos + offset, v]),
    [memory],
  );

  const row = useCallback(
    ([i, v]: [number, number]) => (
      <MemoryCell
        index={i}
        value={format(v)}
        label={(cellLabels?.[i] ?? "").padStart(
          cellLabels ? Math.max(...cellLabels.map((label) => label.length)) : 0,
        )}
        showLabel={cellLabels != undefined}
        size={memory.size}
        editable={editable}
        justifyLeft={justifyLeft}
        highlight={i === highlight}
        onChange={onChange}
        onFocus={onFocus}
      />
    ),
    [format, editable, highlight, onChange],
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
  label,
  showLabel = false,
  size,
  highlight = false,
  editable = false,
  justifyLeft = false,
  onChange = () => undefined,
  onFocus = () => undefined,
}: {
  index: number;
  value: string;
  label?: string;
  showLabel?: boolean;
  size?: number;
  highlight?: boolean;
  editable?: boolean;
  justifyLeft?: boolean;
  onChange?: (i: number, value: string, previous: number) => void;
  onFocus?: (i: number) => void;
}) => (
  <div style={{ display: "flex", height: "100%" }}>
    {showLabel && (
      <code
        style={{
          ...rounded("none"),
          ...(highlight ? { background: "var(--mark-background-color)" } : {}),
          whiteSpace: "pre",
        }}
      >
        {label ?? ""}
      </code>
    )}
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
        color: "var(--text-color)",
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
        <span style={{ color: "var(--text-color)" }}>{value}</span>
      )}
    </code>
  </div>
);

export const Memory = forwardRef(
  (
    {
      name = "Memory",
      className,
      displayEnabled = true,
      highlight = -1,
      editable = true,
      memory,
      format = "dec",
      onSetFormat,
      excludedFormats = [],
      count,
      maxSize,
      offset,
      initialAddr,
      cellLabels,
      fileSelect,
      showClear = true,
      onChange = undefined,
      onClear = undefined,
      loadTooltip = undefined,
    }: {
      name?: string;
      className?: string;
      displayEnabled?: boolean;
      editable?: boolean;
      highlight?: number;
      memory: MemoryAdapter;
      count?: number;
      maxSize?: number;
      offset?: number;
      initialAddr?: number;
      format: Format;
      onSetFormat?: (format: Format) => void;
      excludedFormats?: Format[];
      cellLabels?: string[];
      fileSelect?: () => Promise<{ name: string; content: string }>;
      showClear?: boolean;
      onChange?: () => void;
      onClear?: () => void;
      loadTooltip?: { value: string; placement: string };
    },
    ref,
  ) => {
    const [fmt, setFormat] = useStateInitializer(format);
    const [jmp, setJmp] = useState("");
    const [goto, setGoto] = useState({ value: initialAddr ?? 0 });
    const [highlighted, setHighlighted] = useStateInitializer(highlight);
    const [renderKey, setRenderKey] = useState(0);

    const jumpTo = () => {
      const value =
        !isNaN(parseInt(jmp)) && isFinite(parseInt(jmp)) ? Number(jmp) : 0;
      setHighlighted(value);
      setGoto({
        value: value,
      });
      rerenderMemoryBlock();
    };

    const doLoad = async () => {
      onChange?.();
      if (fileSelect) {
        const { name, content } = await fileSelect();
        setStatus(LOADING);
        requestAnimationFrame(async () => {
          const loader = name.endsWith("hack")
            ? loadHack
            : name.endsWith("asm")
              ? loadAsm
              : loadBlob;
          requestAnimationFrame(async () => {
            try {
              const bytes = await loader(content);
              memory.loadBytes(bytes);
              setStatus("");
              setFormat(
                name.endsWith("hack")
                  ? "bin"
                  : name.endsWith("asm")
                    ? "asm"
                    : fmt,
              );
              jumpTo();
            } catch (e) {
              setStatus(`Error loading memory: ${(e as Error).message}`);
              return;
            }
          });
        });
      }
    };

    const { setStatus } = useContext(BaseContext);

    const rerenderMemoryBlock = () => {
      setRenderKey(renderKey + 1);
    };

    useImperativeHandle(ref, () => ({
      rerender: rerenderMemoryBlock,
    }));

    const clear = () => {
      memory.reset();
      onChange?.();
      onClear?.();
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

    const doSetFormat = (format: Format) => {
      setFormat(format);
      onSetFormat?.(format);
    };

    return (
      <article className={`panel memory ${className ?? name}`}>
        <header>
          <div style={{ whiteSpace: "nowrap" }}>{name}</div>
          <fieldset role="group">
            {fileSelect && (
              <button
                onClick={doLoad}
                className="flex-0"
                data-tooltip={loadTooltip?.value ?? "Load file"}
                data-placement={loadTooltip?.placement ?? "bottom"}
              >
                {/* <Icon name="upload_file" /> */}
                📂
              </button>
            )}
            {showClear && (
              <button
                onClick={clear}
                className="flex-0"
                data-tooltip={"Clear"}
                data-placement="bottom"
              >
                {/* <Icon name="upload_file" /> */}
                🆑
              </button>
            )}
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
            <select value={fmt} onChange={(e) => doSetFormat(e.target.value)}>
              {FORMATS.filter(
                (option) => !excludedFormats.includes(option),
              ).map((option) => (
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
            count={count}
            format={(v: number) => doFormat(fmt, v)}
            cellLabels={cellLabels}
            maxSize={maxSize}
            offset={offset}
            onChange={doUpdate}
            onFocus={(i) => setHighlighted(i)}
          />
        ) : (
          "Memory display is disabled"
        )}
      </article>
    );
  },
);
Memory.displayName = "Memory";

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
