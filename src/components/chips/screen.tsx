import { assertExists } from "@davidsouther/jiffies/lib/esm/assert";
import { Trans } from "@lingui/macro";
import { useEffect, useRef } from "react";
import { Memory, SCREEN } from "../../simulator/cpu/memory";
import { Panel } from "../shell/panel";

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

export const Screen = ({ memory }: { memory: Memory }) => {
  let canvas = useRef<HTMLCanvasElement>();
  useEffect(() => {
    const ctx = canvas.current?.getContext("2d") ?? undefined;

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
  }, [memory]);

  return (
    <Panel className="fill" header={<Trans>Display</Trans>}>
      <figure
        style={{
          width: "100%",
          maxWidth: "512px",
          boxSizing: "content-box",
          marginInline: "auto",
          borderTop: "2px solid gray",
          borderLeft: "2px solid gray",
          borderBottom: "2px solid lightgray",
          borderRight: "2px solid lightgray",
        }}
      >
        <canvas
          ref={(ref) => (canvas.current = ref ?? undefined)}
          width={512}
          height={256}
        ></canvas>
      </figure>
    </Panel>
  );
};
