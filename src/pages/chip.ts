import {
  article,
  div,
  footer,
  h2,
  header,
  section,
  span,
  style,
  textarea,
} from "@davidsouther/jiffies/dom/html.js";
import { Dropdown } from "@davidsouther/jiffies/dom/form/form.js";
import { compileFStyle, FStyle } from "@davidsouther/jiffies/dom/css/fstyle.js";
import { retrieve } from "@davidsouther/jiffies/dom/provide.js";
import { FileSystem } from "@davidsouther/jiffies/fs.js";
import { isErr, Ok, unwrap } from "@davidsouther/jiffies/result.js";
import { Pinout } from "../components/pinout.js";
import { Runbar } from "../components/runbar.js";
import { LOW, Pin } from "../simulator/chip/chip.js";
import { Timer } from "../simulator/timer.js";
import { Chip as SimChip } from "../simulator/chip/chip.js";
import * as make from "../simulator/chip/builder.js";
import { getBuiltinChip } from "../simulator/chip/builtins/index.js";

export const Chip = () => {
  const fs = unwrap(retrieve<FileSystem>("fs"));

  let project = "01";
  let chips: string[] = [];
  let chip: SimChip = getBuiltinChip("And");

  (async function init() {
    await setProject("01");
    await setChip("And");
  })();

  const onToggle = (pin: Pin) => {
    if (pin.width == 1) {
      pin.toggle();
    } else {
      pin.busVoltage += 1;
    }
    chip.eval();
    setState();
  };

  const chipsDropdown = span();
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

  async function setChip(name: string) {
    const hdl = await fs.readFile(`/projects/${project}/${name}/${name}.hdl`);
    const tst = await fs.readFile(`/projects/${project}/${name}/${name}.tst`);
    const cmp = await fs.readFile(`/projects/${project}/${name}/${name}.cmp`);
    hdlTextarea.value = hdl;
    tstTextarea.value = tst;
    cmpTextarea.value = cmp;
    compileChip(hdl);
  }

  function compileChip(text: string) {
    const maybeChip = make.parse(text);
    if (isErr(maybeChip)) return;
    chip = Ok(maybeChip);
    setState();
  }

  async function saveChip(project: string, name: string, text: string) {
    await fs.writeFile(`/projects/${project}/${name}/${name}.hdl`, text);
  }

  async function setProject(proj: "01" | "02" | "03" | "04" | "05") {
    project = proj;
    chips = [...new Set(await fs.readdir(`/projects/${project}`))].sort();
    chipsDropdown.update(
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
        chips
      )
    );
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
              selected: project,
              events: {
                change: (event) => setProject(event.target?.value as unknown),
              },
            },
            {
              "01": "Logic",
              "02": "Arithmetic",
              "03": "Memory",
              "04": "Assembly",
              "05": "Architecture",
            }
          ),
          "Chip: ",
          chipsDropdown
        ),
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
