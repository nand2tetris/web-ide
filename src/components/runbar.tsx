import { FC } from "react";
import { Timer } from "../simulator/timer"

const Icon: FC<{ icon: string }> = ({ icon }) => (
  <i className={`icon-${icon}`}></i>
);

export const Runbar: FC<{ runner: Timer }> = ({ runner }) => (
  <div className="input-group">
    <button click={() => runner.frame()}>
      <Icon icon="fast-fw"></Icon>
    </button>
    <button onClick={() => runner.reset()}>
      <Icon icon="to-start"></Icon>
    </button>
    <button onClick={() => (runner.running ? runner.stop() : runner.reset())}>
      <Icon icon={runner.running ? "pause" : "play"}></Icon>
    </button>
    <Select
      name="speed"
      onChange={(e) => {
        runner.speed = Number(
          (e.target as HTMLSelectElement)?.value ?? runner.speed
        );
      }}
      disabled={runner.running}
      value={runner.speed}
      options={[
        ["16", "60FPS"],
        ["500", "Fast"],
        ["1000", "Normal"],
        ["2000", "Slow"],
      ]}
    ></Select>
    <Select
      name="steps"
      onChange={() => {
        runner.steps = Number(
          (e.target as HTMLSelectElement)?.value ?? runner.steps
        );
      }}
      disabled={runner.running}
      value={runner.steps}
      options={[
        ["1", "1 Step"],
        ["500", "500"],
        ["1000", "1000"],
        ["2000", "2000"],
      ]}
    ></Select>
    {...children}
  </div>
);
