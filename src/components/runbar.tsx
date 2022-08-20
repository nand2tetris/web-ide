import { ReactNode } from "react";
import { t } from "@lingui/macro";
import { Timer, useTimer } from "../simulator/timer";
import { Icon } from "./pico/icon";

export const Runbar = (props: { runner: Timer; children?: ReactNode }) => {
  const runner = useTimer(props.runner);
  return (
    <fieldset role="group">
      <button
        className="flex-0"
        onClick={() => runner.actions.frame()}
        data-tooltip={t`Next`}
      >
        <Icon name="skip_next"></Icon>
      </button>
      <button
        className="flex-0"
        onClick={() => runner.actions.reset()}
        data-tooltip={t`Reset`}
      >
        <Icon name="first_page"></Icon>
      </button>
      <button
        className="flex-0"
        onClick={() =>
          runner.state.running ? runner.actions.stop() : runner.actions.start()
        }
        data-tooltip={runner.state.running ? t`Stop` : t`Run`}
      >
        <Icon name={runner.state.running ? "pause" : "play_arrow"}></Icon>
      </button>
      <select
        className="flex-1"
        name="speed"
        value={runner.state.speed}
        onChange={(e) => {
          runner.dispatch({
            action: "setSpeed",
            payload: Number(e.target?.value ?? runner.state.speed),
          });
        }}
        disabled={runner.state.running}
      >
        {[
          [16, t`60FPS`],
          [500, t`Fast`],
          [1000, t`Normal`],
          [2000, t`Slow`],
        ].map(([speed, label]) => (
          <option key={speed} value={speed}>
            {label}
          </option>
        ))}
      </select>
      <select
        className="flex-1"
        name="steps"
        value={runner.state.steps}
        onChange={(e) => {
          runner.dispatch({
            action: "setSteps",
            payload: Number(e.target?.value ?? runner.state.steps),
          });
        }}
        disabled={runner.state.running}
      >
        {[
          [1, t`1 Step`],
          [500, "500"],
          [1000, "1000"],
          [2000, "2000"],
        ].map(([steps, label]) => (
          <option key={steps} value={steps}>
            {label}
          </option>
        ))}
      </select>
      {props.children}
    </fieldset>
  );
};
