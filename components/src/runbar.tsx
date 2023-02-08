import { ReactNode } from "react";
import { Timer } from "@nand2tetris/simulator/timer.js";
import { useTimer } from "./timer.js";

export const Runbar = (props: { runner: Timer; children?: ReactNode }) => {
  const runner = useTimer(props.runner);
  return (
    <fieldset role="group">
      <button
        className="flex-0"
        onClick={() => runner.actions.frame()}
        data-tooltip={`Step`}
        data-placement="bottom"
      >
        {/* <Icon name="play_arrow" /> */}
        ➡️
      </button>
      <button
        className="flex-0"
        onClick={() =>
          runner.state.running ? runner.actions.stop() : runner.actions.start()
        }
        data-tooltip={runner.state.running ? `Pause` : `Play`}
        data-placement="bottom"
      >
        {/* <Icon name={runner.state.running ? "pause" : "fast_forward"} /> */}
        {runner.state.running ? "⏸" : "️⏩"}
      </button>
      <button
        className="flex-0"
        onClick={() => runner.actions.reset()}
        data-tooltip={`Reset`}
        data-placement="bottom"
      >
        {/* <Icon name="fast_rewind" /> */}⏮
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
          // [2000, `Debug`], // For debugging, basically the same as clicking through
          [1000, `Slow`],
          [500, `Fast`],
          [16, `Faster`], // 16ms, or 60fps
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
          ...[
            [1, `1 Step`],
            [500, "500"],
            [1000, "1000"],
            [2000, "2000"],
            [8000, "8000"],
          ],
          ...(runner.state.speed === 16
            ? [
                // 60fps
                [16666, "1MHz"],
                [16666 * 30, "30MHz"],
              ]
            : []),
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
