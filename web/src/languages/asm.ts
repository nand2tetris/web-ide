import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { base } from "./base";

export const AsmLanguage: monaco.languages.IMonarchLanguage = {
  tokenizer: {
    root: [
      [/(@)(.+)/, ["operator", "keyword"]],
      [/(\()(.+)(\))/, ["operator", "keyword", "operator"]],
      { include: "@whitespace" },
    ],
    ...base.tokenizer,
  },
};
