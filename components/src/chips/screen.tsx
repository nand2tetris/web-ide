import { assertExists } from "@davidsouther/jiffies/lib/esm/assert.js";
import { Memory } from "@nand2tetris/simulator/cpu/memory.js";
import { useCallback, useRef, useState } from "react";
import { useClockFrame, useClockReset } from "../clockface.js";

const WHITE = "white";
const BLACK = "black";
type COLOR = typeof WHITE | typeof BLACK;

export interface ScreenMemory {
  get(idx: number): number;
}

export function reduceScreen(memory: Memory, offset = 0): ScreenMemory {
  return {
    get(idx: number): number {
      return memory.get(offset + idx);
    },
  };
}

function get(mem: ScreenMemory, x: number, y: number): COLOR {
  const byte = mem.get(32 * y + ((x / 16) | 0));
  const bit = byte & (1 << x % 16);
  return bit === 0 ? WHITE : BLACK;
}

function set(data: Uint8ClampedArray, x: number, y: number, value: COLOR) {
  const pixel = (y * 512 + x) * 4;
  const color = value === WHITE ? 255 : 0;
  data[pixel] = color;
  data[pixel + 1] = color;
  data[pixel + 2] = color;
  data[pixel + 3] = 255;
}

function drawImage(ctx: CanvasRenderingContext2D, memory: ScreenMemory) {
  const image = assertExists(
    ctx.getImageData(0, 0, 512, 256),
    "Failed to create Context2d"
  );
  for (let col = 0; col < 512; col++) {
    for (let row = 0; row < 256; row++) {
      const color = get(memory, col, row);
      set(image.data, col, row, color);
    }
  }
  ctx.putImageData(image, 0, 0);
}

export type ScreenScales = 0 | 1 | 2;

export const Screen = ({
  memory,
  showScaleControls = false,
  scale = 1,
  onScale,
}: {
  memory: ScreenMemory;
  showScaleControls?: boolean;
  scale?: ScreenScales;
  onScale?: (scale: ScreenScales) => void;
}) => {
  const canvas = useRef<HTMLCanvasElement>();
  const [screenScale, setScreenScale] = useState<ScreenScales>(scale);

  const onScaleCB = (scale: ScreenScales) => {
    onScale?.(scale);
    setScreenScale(scale);
  };

  const draw = useCallback(() => {
    const ctx = canvas.current?.getContext("2d") ?? undefined;

    if (ctx) {
      drawImage(ctx, memory);
    }
  }, [memory]);

  const ctxRef = useCallback(
    (ref: HTMLCanvasElement | null) => {
      canvas.current = ref ?? undefined;
      draw();
    },
    [canvas, draw]
  );

  useClockFrame(draw);
  useClockReset(() => {
    canvas.current
      ?.getContext("2d")
      ?.clearRect(0, 0, canvas.current.width, canvas.current.height);
  });

  return (
    <article className="panel">
      <header>
        <div>Screen</div>
        {showScaleControls && (
          <fieldset role="group">
            <button onClick={() => onScaleCB(0)}>x0</button>
            <button onClick={() => onScaleCB(1)}>x1</button>
            <button onClick={() => onScaleCB(2)}>x2</button>
          </fieldset>
        )}
      </header>
      {screenScale > 0 && (
        <main style={{ backgroundColor: "var(--code-background-color)" }}>
          <figure
            style={{
              width: `${512 * screenScale}px`,
              height: `${256 * screenScale}px`,
              boxSizing: "content-box",
              marginInline: "auto",
              margin: "auto",
              borderTop: "2px solid gray",
              borderLeft: "2px solid gray",
              borderBottom: "2px solid lightgray",
              borderRight: "2px solid lightgray",
            }}
          >
            <canvas
              ref={ctxRef}
              width={512}
              height={256}
              style={{
                transform: `translate(-50%, -50%) scale(${screenScale}) translate(50%, 50%)`,
                imageRendering: "pixelated",
              }}
            ></canvas>
          </figure>
        </main>
      )}
    </article>
  );
};
