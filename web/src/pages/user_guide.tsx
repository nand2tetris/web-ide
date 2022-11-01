import raw from "raw.macro";
import Markdown from "../shell/markdown";

const UserGuide = () => (
  <div
    className="container"
    style={{ maxWidth: "900px", margin: "0 auto", overflow: "none" }}
  >
    <Markdown>{raw("./USER_GUIDE.md")}</Markdown>
  </div>
);

export default UserGuide;
