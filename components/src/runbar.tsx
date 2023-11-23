import { Timer } from "@nand2tetris/simulator/timer.js";
import { ChangeEvent, ReactNode, useEffect, useState } from "react";
import { useTimer } from "./timer.js";

export const Runbar = (props: { runner: Timer; children?: ReactNode }) => {
  const runner = useTimer(props.runner);
  const [speedValue, setSpeed] = useState(0);

  const speedValues: Record<number, [number, number]> = {
    0: [1000, 1],
    1: [500, 1],
    2: [16, 1],
    3: [16, 16666],
    4: [16, 16666 * 30],
  };

  useEffect(() => {
    updateSpeed();
  }, [speedValue]);

  const updateSpeed = () => {
    const [speed, steps] = speedValues[speedValue];
    runner.dispatch({ action: "setSpeed", payload: speed });
    runner.dispatch({ action: "setSteps", payload: steps });
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSpeed(Number(e.target.value));
  };

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
        data-tooltip={runner.state.running ? `Pause` : `Run`}
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          fontWeight: "normal",
        }}
      >
        <span style={{ padding: "0.2rem" }}>Slow</span>
        <input
          type="range"
          min={0}
          max={4}
          step={1}
          value={speedValue}
          disabled={runner.state.running}
          onChange={onChange}
          style={{ width: "150px", padding: "0.2rem" }}
          data-tooltip={"Execution speed"}
          data-placement={"bottom"}
        />
        <span style={{ padding: "0.2rem" }}>Fast</span>
      </div>
      {props.children}
    </fieldset>
  );
};
