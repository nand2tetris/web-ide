import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { base } from "./base";

export const JackLanguage: monaco.languages.IMonarchLanguage = {
  keywords: [
    "class",
    "int",
    "char",
    "bool",
    "void",
    "let",
    "function",
    "method",
    "constructor",
    "var",
    "if",
    "do",
    "while",
    "else",
    "return",
    "true",
    "false",
    "null",
    "this",
    "field",
    "static",
  ],
  tokenizer: {
    root: [
      [
        /[a-zA-Z_][a-zA-Z0-9_]*/,
        {
          cases: {
            "@keywords": "keyword",
            "@default": "identifier",
          },
        },
      ],
      [/\d+/, "number"],
      [/"[^"\n]*"/, "string"],
      { include: "@whitespace" },
    ],
    ...base.tokenizer,
  },
};
