import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { base } from "./base";

export const AsmLanguage: monaco.languages.IMonarchLanguage = {
  tokenizer: {
    root: [
      [/(@)([A-Za-z]\w+)/, ["operator", "keyword"]],
      { include: "@whitespace" },
    ],
    ...base.tokenizer,
  },
};
