import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { base } from "./base";

export const CmpLanguage: monaco.languages.IMonarchLanguage = {
  tokenizer: {
    root: [
      // identifiers and keywords
      [/@[\w_]+/, "identifier"],
      [/\([\w_]+)/, "identifier"],
      [
        /([AMD]+=)?(0|-?1|!?[ADM][-+&|][ADM])(;J(GT|EQ|LT|NE|LE|MP))?/,
        "identifier",
      ],

      // whitespace
      { include: "@whitespace" },
    ],
    ...base.tokenizer,
  },
};
