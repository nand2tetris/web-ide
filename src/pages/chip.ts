import {
  article,
  div,
  footer,
  h2,
  header,
  section,
  style,
  textarea,
} from "@davidsouther/jiffies/dom/html.js";
import { compileFStyle, FStyle } from "@davidsouther/jiffies/dom/css/fstyle.js";
import { Pinout } from "../components/pinout.js";
import { Runbar } from "../components/runbar.js";
import { LOW, Pin } from "../simulator/chip/chip.js";
import { Timer } from "../simulator/timer.js";
import * as make from "../simulator/chip/builder.js";

export const Chip = () => {
  // let chip = getBuiltinChip("And");
  let chip = make.Xor();

  const onToggle = (pin: Pin) => {
    pin.toggle();
    chip.eval();
    setState();
  };

  const inPinout = Pinout({ pins: chip.ins, toggle: onToggle });
  const outPinout = Pinout({ pins: chip.outs });
  const pinsPinout = Pinout({ pins: chip.pins });
  const runner = new (class ChipRunner extends Timer {
    tick() {
      chip.eval();
      // tickScreen();
    }

    finishFrame() {
      setState();
    }

    reset() {
      for (const pin of chip.ins.entries()) {
        pin.pull(LOW);
      }
      chip.eval();
      setState();
    }

    toggle() {
      runbar.update();
    }
  })();

  const runbar = Runbar({ runner });

  function setState() {
    inPinout.update();
    outPinout.update();
    pinsPinout.update();
  }

  const fstyle: FStyle = {
    ".View__Chip": {
      "> section": {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "var(--block-spacing-vertical) var(--block-spacing-horizontal)",
        "> .pinouts": {
          display: "grid",
          grid: "1fr 1fr / fit-content repeat(2, minmax(200, 1fr))",
          gap: "var(--block-spacing-vertical) var(--block-spacing-horizontal)",
          "> h2": { gridColumn: "1 / span 2", marginBottom: "0" },
          "> article": {
            display: "flex",
            flexDirection: "column",
            "> pin-out": { flexGrow: "1" },
          },
        },
      },
    },
    "@media (max-width: 1023px)": {
      ".View__Chip > section": {
        display: "flex",
        flexDirection: "column",
      },
    },
    "@media (max-width: 576px)": {
      ".View__Chip > section > .pinouts": {
        display: "flex",
        flexDirection: "column",
        "> h2": { order: "0" },
        "> article:not(nth-of-type(3))": { order: "1" },
        "> article:nth-of-type(3)": { order: "2" },
      },
    },
  };

  return div(
    { class: "View__Chip" },
    style(compileFStyle(fstyle)),
    runbar,
    section(
      div(
        { class: "pinouts" },
        h2(`Chip: ${chip.name}`),
        article({ class: "no-shadow panel" }, header("Input pins"), inPinout),
        article({ class: "no-shadow panel" }, header("Output pins"), outPinout),
        article(
          { class: "no-shadow panel" },
          header("HDL"),
          textarea({ rows: 10, style: { height: "100%" } })
        ),
        article(
          { class: "no-shadow panel" },
          header("Internal Pins"),
          pinsPinout,
          footer()
        )
      )
    )
  );
};
