import Markdown from "../../shell/markdown";
import hardwareSimulatorGuide from "./HARDWARE_SIMULATOR.md?raw";

const ChipGuide = () => {
  return (
    <div style={{ overflowY: "scroll" }}>
      <div className="container">
        <Markdown>{hardwareSimulatorGuide}</Markdown>
      </div>
    </div>
  );
};

export default ChipGuide;
