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
import { Dropdown } from "@davidsouther/jiffies/dom/form/form.js";
import { compileFStyle, FStyle } from "@davidsouther/jiffies/dom/css/fstyle.js";
import { Pinout } from "../components/pinout.js";
import { Runbar } from "../components/runbar.js";
import { LOW, Pin } from "../simulator/chip/chip.js";
import { Timer } from "../simulator/timer.js";
import * as make from "../simulator/chip/builder.js";
import * as busses from "../simulator/chip/busses.js";

export const Chip = () => {
  // let chip = getBuiltinChip("And");
  let chip = make.Xor();

  const onToggle = (pin: Pin) => {
    if (pin.width == 1) {
      pin.toggle();
    } else {
      pin.busVoltage += 1;
    }
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
    inPinout.update({ pins: chip.ins });
    outPinout.update({ pins: chip.outs });
    pinsPinout.update({ pins: chip.pins });
  }

  function setChip(name: "Xor" | "And" | "And16") {
    switch (name) {
      case "Xor":
        chip = make.Xor();
        break;
      case "And":
        chip = make.And();
        break;
      case "And16":
        chip = busses.And16();
        break;
    }
    setState();
  }

  const fstyle: FStyle = {
    ".View__Chip": {
      "> section": {
        grid: "auto / 2fr 1fr",
        "> .pinouts": {
          grid: "min-content repeat(2, minmax(200px, 1fr)) / 1fr 1fr",
          "> h2": { gridColumn: "1 / span 2", marginBottom: "0" },
        },
      },
    },
    "@media (max-width: 992px)": {
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
      { class: "grid" },
      div(
        { class: "pinouts grid" },
        h2(
          "Chip: ",
          Dropdown(
            {
              style: {
                display: "inline-block",
              },
              selected: chip.name,
              events: {
                change: (event) => setChip(event.target?.value as unknown),
              },
            },
            "Xor",
            "And",
            "And16"
          )
        ),
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
      ),
      article(header("Test"), textarea({ style: { height: "100%" } }))
    )
  );
};
