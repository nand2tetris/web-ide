import type * as monaco from "monaco-editor";

export const CmpLanguage: monaco.languages.IMonarchLanguage = {
  tokenizer: {
    root: [
      // identifiers and keywords
      [/[a-z_$][\w$]*/, "identifier"],

      // whitespace
      [/[ \t\r\n]+/, "white"],

      // numbers
      [/\d+\+?/, "number"],

      // delimiter: after number because of .\d floats
      [/[|]/, "delimiter"],
    ],
  },
};
