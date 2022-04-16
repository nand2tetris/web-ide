import { Select } from "@jefri/jiffies/components/select.js";
import { DenormChildren } from "@jefri/jiffies/dom/dom.js";
import { FC } from "@jefri/jiffies/dom/fc.js";
import { button, i, li, nav, ul } from "@jefri/jiffies/dom/html.js";
import { Timer } from "../simulator/timer.js";

const icon = (icon: string) => i({ class: `icon-${icon}` });

export const Runbar = FC(
  "run-bar",
  (el, { runner }: { runner: Timer }, children: DenormChildren[]) =>
    nav(
      ul(
        li(
          button(
            {
              events: { click: () => runner.frame() },
            },
            icon("fast-fw")
          )
        ),
        li(
          button(
            {
              events: { click: () => runner.reset() },
            },
            icon(`to-start`)
          )
        ),
        li(
          button(
            {
              events: {
                click: () => (runner.running ? runner.stop() : runner.start()),
              },
            },
            runner.running ? icon(`pause`) : icon(`play`)
          )
        )
      ),
      ul(
        li(
          Select({
            name: "speed",
            events: {
              change: (e: Event) => {
                runner.speed = Number(
                  (e.target as HTMLSelectElement)?.value ?? runner.speed
                );
              },
            },
            disabled: runner.running,
            value: `${runner.speed}`,
            options: [
              ["16", "60FPS"],
              ["500", "Fast"],
              ["1000", "Normal"],
              ["2000", "Slow"],
            ],
          })
        ),
        li(
          Select({
            name: "steps",
            events: {
              change: (e: Event) => {
                runner.steps = Number(
                  (e.target as HTMLSelectElement)?.value ?? runner.steps
                );
              },
            },
            disabled: runner.running,
            value: `${runner.steps}`,
            options: [
              ["1", "1 Step"],
              ["500", "500"],
              ["1000", "1000"],
              ["2000", "2000"],
            ],
          })
        )
      ),
      ...children
    )
);
