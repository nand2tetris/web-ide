import { useContext, useEffect } from "react";
import { AppContext } from "src/App.context";

export const BitmapEditor = () => {
  const { toolStates } = useContext(AppContext);

  useEffect(() => {
    toolStates.setTool("bitmap");
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <iframe
        style={{ width: "100%", height: "100%" }}
        src="/web-ide/bitmap_editor.html"
      ></iframe>
    </div>
  );
};

export default BitmapEditor;
