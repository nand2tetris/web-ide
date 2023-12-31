import raw from "raw.macro";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../App.context";
import Markdown from "../shell/markdown";

const UserGuide = () => {
  const { toolStates } = useContext(AppContext);

  const [guide, setGuide] = useState<string>();

  useEffect(() => {
    if (toolStates.tool == "chip") {
      setGuide(raw("./guides/HARDWARE_SIMULATOR.md"));
    }
  }, [toolStates]);

  return guide ? (
    <div style={{ overflowY: "scroll" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <Markdown>{guide}</Markdown>
      </div>
    </div>
  ) : (
    <span>To be added later</span>
  );
};

export default UserGuide;
