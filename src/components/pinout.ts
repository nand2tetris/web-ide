import { FC } from "@davidsouther/jiffies/dom/fc.js";
import {
  code,
  table,
  tbody,
  td,
  th,
  thead,
  tr,
} from "@davidsouther/jiffies/dom/html.js";
import { Pin, Pins } from "../simulator/chip/chip.js";
import { bin } from "../util/twos.js";

export const Pinout = FC(
  "pin-out",
  (el, { pins, toggle }: { pins: Pins; toggle?: (pin: Pin) => void }) => {
    const t = table(
      thead(tr(th({ tabIndex: 0 }, "Name"), th({ tabIndex: 0 }, "Voltage"))),
      tbody(
        ...[...pins.entries()].map((pin) =>
          tr(
            td({ tabIndex: 0 }, pin.name),
            td(
              {
                style: { cursor: toggle ? "pointer" : "inherit" },
                events: {
                  ...(toggle
                    ? { click: () => toggle(pin), keypress: () => toggle(pin) }
                    : {}),
                },
              },
              code(
                { tabIndex: 0 },
                pin.width == 1
                  ? pin.voltage() == 0
                    ? "Low"
                    : "High"
                  : bin(pin.busVoltage)
              )
            )
          )
        )
      )
    );
    return t;
  }
);
