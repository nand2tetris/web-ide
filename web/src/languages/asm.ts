import type * as monaco from "monaco-editor";
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
