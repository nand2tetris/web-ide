import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { base } from "./base";

export const AsmLanguage: monaco.languages.IMonarchLanguage = {
  tokenizer: {
    root: [
      [/(JGT|JLT|JGE|JLE|JEQ|JMP|[AMD]{1,3}|R\d+)/, "keyword"],
      [/(\+|-|!|=|&&|\|\|)/, "operators"],
      [/[\d]+/, "number"],
      [/[\w_]+/, "identifier"],

      // whitespace
      { include: "@whitespace" },
    ],
    ...base.tokenizer,
  },
};
