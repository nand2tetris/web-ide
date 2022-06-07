import { display } from "@davidsouther/jiffies/display.js";
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
import { Clock } from "../simulator/chip/clock.js";
import { bin } from "../util/twos.js";

export const Pinout = FC(
  "pin-out",
  (
    el,
    {
      pins,
      toggle,
      clocked = false,
    }: { pins: Pins; toggle?: (pin: Pin) => void; clocked?: boolean }
  ) => {
    const t = table(
      thead(tr(th({ tabIndex: 0 }, "Name"), th({ tabIndex: 0 }, "Voltage"))),
      tbody(
        ...[
          clocked
            ? tr(
                td({ tabIndex: 0 }, "Clock"),
                td(
                  code(
                    {
                      style: { cursor: toggle ? "pointer" : "inherit" },
                      events: {
                        click: () => Clock.get().toggle(),
                      },
                    },
                    display(Clock.get())
                  )
                )
              )
            : undefined,
        ].filter((row) => row !== undefined),
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
                  : bin(pin.busVoltage, pin.width)
              )
            )
          )
        )
      )
    );
    return t;
  }
);
