import { FC } from "@davidsouther/jiffies/dom/fc.js";
import {
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
  (el, { pins, toggle }: { pins: Pins; toggle?: (pin: Pin) => void }) =>
    table(
      thead(tr(th("Name"), th("Voltage"))),
      tbody(
        ...[...pins.entries()].map((pin) =>
          tr(
            td(pin.name),
            td(
              {
                style: { cursor: toggle ? "pointer" : "inherit" },
                events: {
                  ...(toggle ? { click: () => toggle(pin) } : {}),
                },
              },
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
