import raw from "raw.macro";
import Markdown from "../shell/markdown";

const VERSION =
  document.querySelector("meta[name=version]")?.getAttribute("content") ??
  "unknown";

const useVersion = () => {
  return VERSION;
};

export const About = () => {
  const version = useVersion();
  return (
    <div style={{ overflowY: "scroll" }}>
      <div className="container">
        <Markdown>{raw("./ABOUT.md")}</Markdown>
        <p>
          <b>Version</b> <code>{version}</code>
        </p>
      </div>
    </div>
  );
};

export default About;
