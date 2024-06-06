import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";

const publicUrl = (href: string) => {
  href = href.replace("%25PUBLIC_URL%25", process.env.PUBLIC_URL);
  return defaultUrlTransform(href);
};

const Markdown = ({ children }: { children: string }) => (
  <ReactMarkdown remarkPlugins={[remarkGfm]} urlTransform={publicUrl}>
    {children}
  </ReactMarkdown>
);

export default Markdown;
