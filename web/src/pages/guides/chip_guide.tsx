import raw from "raw.macro";
import Markdown from "../../shell/markdown";

const ChipGuide = () => {
  return (
    <div style={{ overflowY: "scroll" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <Markdown>{raw("./HARDWARE_SIMULATOR.md")}</Markdown>
      </div>
    </div>
  );
};

export default ChipGuide;
