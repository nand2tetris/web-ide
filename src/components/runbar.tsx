import { t } from "@lingui/macro";
import { Timer } from "../simulator/timer";
import { Icon } from "./pico/icon";

export const Runbar = ({
  runner,
  children,
}: {
  runner: Timer;
  children?: ReactNode;
}) => (
  <div className="input-group">
    <button onClick={() => runner.frame()}>
      <Icon name="skip_next"></Icon>
    </button>
    <button onClick={() => runner.reset()}>
      <Icon name="first_page"></Icon>
    </button>
    <button onClick={() => (runner.running ? runner.stop() : runner.reset())}>
      <Icon name={runner.running ? "pause" : "play_arrow"}></Icon>
    </button>
    <select
      name="speed"
      value={runner.speed}
      onChange={(e) => {
        runner.speed = Number(e.target?.value ?? runner.speed);
      }}
      disabled={runner.running}
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
      name="steps"
      value={runner.steps}
      onChange={(e) => {
        runner.steps = Number(e.target?.value ?? runner.steps);
      }}
      disabled={runner.running}
    >
      {[
        [1, "1 Step"],
        [500, "500"],
        [1000, "1000"],
        [2000, "2000"],
      ].map(([steps, label]) => (
        <option key={steps} value={steps}>
          {label}
        </option>
      ))}
    </select>
    {children}
  </div>
);
