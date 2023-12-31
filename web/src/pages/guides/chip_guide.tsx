import raw from "raw.macro";
import Markdown from "../../shell/markdown";

const ChipGuide = () => {
  return (
    <div style={{ overflowY: "scroll" }}>
      <div className="container">
        <Markdown>{raw("./HARDWARE_SIMULATOR.md")}</Markdown>
      </div>
    </div>
  );
};

export default ChipGuide;
