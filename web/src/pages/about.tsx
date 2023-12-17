import raw from "raw.macro";
import Markdown from "../shell/markdown";

export const About = () => {
  return (
    <div style={{ overflowY: "scroll" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <Markdown>{raw("./ABOUT.md")}</Markdown>
      </div>
    </div>
  );
};

export default About;
