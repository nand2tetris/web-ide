import type * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { base } from "./base";

export const VmLanguage: monaco.languages.IMonarchLanguage = {
  keywords: [
    "push",
    "pop",
    "add",
    "sub",
    "neg",
    "lt",
    "gt",
    "eq",
    "and",
    "or",
    "not",
    "function",
    "call",
    "return",
    "label",
    "goto",
    "if-goto",
    "argument",
    "local",
    "static",
    "constant",
    "this",
    "that",
    "pointer",
    "temp",
  ],

  tokenizer: {
    root: [
      [/if-goto/, "keyword"], // next rule doesn't catch this because of the hyphen
      [
        /[_a-zA-Z][_a-zA-Z0-9.$]*/,
        {
          cases: {
            "@keywords": "keyword",
            "@default": "identifier",
          },
        },
      ],

      [/\d+/, "number"],

      // whitespace
      { include: "@whitespace" },
    ],

    ...base.tokenizer,
  },
};
