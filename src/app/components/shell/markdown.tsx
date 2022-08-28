import ReactMarkdown, { uriTransformer } from "react-markdown";
import remarkGfm from "remark-gfm";

const publicImages = (href: string) => {
  href = href.replace("%25PUBLIC_URL%25", process.env.PUBLIC_URL);
  return uriTransformer(href);
};

const Markdown = ({ children }: { children: string }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    children={children}
    transformImageUri={publicImages}
  />
);

export default Markdown;
