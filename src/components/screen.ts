import { assertExists } from "@jefri/jiffies/assert.js";
import { Updatable } from "@jefri/jiffies/dom/dom.js";
import { FC, State } from "@jefri/jiffies/dom/fc.js";
import { article, canvas, figure, header } from "@jefri/jiffies/dom/html.js";
import { Memory, SCREEN } from "../simulator/cpu/memory.js";

const WHITE = "white";
const BLACK = "black";
type COLOR = typeof WHITE | typeof BLACK;

function get(mem: Memory, x: number, y: number): COLOR {
  const byte = mem.get(SCREEN + 32 * y + ((x / 16) | 0));
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

export const Screen = FC<
  { memory: Memory },
  { screen: Updatable<HTMLCanvasElement>; ctx: CanvasRenderingContext2D }
>("hack-screen", (el, { memory }) => {
  const screen = (el[State].screen ??= canvas({ width: 512, height: 256 }));
  const ctx = (el[State].ctx ??= screen.getContext("2d") ?? undefined);
  el.style.width = "518px";

  if (ctx) {
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

  return article(
    { class: "no-shadow panel" },
    header("Display"),
    figure(
      {
        style: {
          borderTop: "2px solid gray",
          borderLeft: "2px solid gray",
          borderBottom: "2px solid lightgray",
          borderRight: "2px solid lightgray",
          marginBottom: "0",
        },
      },
      screen
    )
  );
});
