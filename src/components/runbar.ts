import { Select } from "@davidsouther/jiffies/components/select.js";
import { DenormChildren } from "@davidsouther/jiffies/dom/dom.js";
import { FC } from "@davidsouther/jiffies/dom/fc.js";
import { a, div, i } from "@davidsouther/jiffies/dom/html.js";
import { Timer } from "../simulator/timer.js";

const icon = (icon: string) => i({ class: `icon-${icon}` });

export const Runbar = FC(
  "run-bar",
  (el, { runner }: { runner: Timer }, children: DenormChildren[]) =>
    div(
      { class: "input-group" },
      a(
        {
          href: "#",
          role: "button",
          events: {
            click: (e) => {
              e.preventDefault();
              runner.frame();
            },
          },
        },
        icon("fast-fw")
      ),
      a(
        {
          href: "#",
          role: "button",
          events: {
            click: (e) => {
              e.preventDefault();
              runner.reset();
            },
          },
        },
        icon(`to-start`)
      ),
      a(
        {
          href: "#",
          role: "button",
          events: {
            click: (e) => {
              e.preventDefault();
              runner.running ? runner.stop() : runner.start();
            },
          },
        },
        runner.running ? icon(`pause`) : icon(`play`)
      ),
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
      }),
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
      }),
      ...children
    )
);
