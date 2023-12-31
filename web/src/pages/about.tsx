import raw from "raw.macro";
import Markdown from "../shell/markdown";

export const About = () => {
  return (
    <div style={{ overflowY: "scroll" }}>
      <div className="container">
        <Markdown>{raw("./ABOUT.md")}</Markdown>
      </div>
    </div>
  );
};

export default About;
