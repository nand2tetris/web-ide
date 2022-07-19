import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

export const HdlLanguage: monaco.languages.IMonarchLanguage = {
  defaultToken: "invalid",

  keywords: ["CHIP", "CPU", "IN", "OUT", "PARTS", "BUILTIN", "CLOCKED"],

  chips: [
    "Nand",
    "Nand16",
    "Not",
    "Not16",
    "And",
    "And16",
    "Or",
    "Or16",
    "Or8Way",
    "XOr",
    "XOr16",
    "Xor",
    "Xor16",
    "Mux",
    "Mux16",
    "Mux4Way16",
    "Mux8Way16",
    "DMux",
    "DMux4Way",
    "DMux8Way",
    "HalfAdder",
    "FullAdder",
    "Add16",
    "Inc16",
    "ALU",
    "ALUNoStat",
    "DFF",
    "Bit",
    "Register",
    "ARegister",
    "DRegister",
    "PC",
    "RAM8",
    "RAM64",
    "RAM512",
    "RAM4K",
    "RAM16K",
    "ROM32K",
    "Screen",
    "Keyboard",
    "CPU",
    "Computer",
    "Memory",
    "ARegister",
    "DRegister",
  ],

  operators: ["="],

  // we include these common regular expressions
  symbols: /[=]+/,

  // C# style strings
  escapes:
    /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

  // The main tokenizer for our languages
  tokenizer: {
    root: [
      // identifiers and keywords
      [
        /[a-zA-Z][a-zA-Z0-9]*/,
        {
          cases: {
            "@keywords": "keyword",
            "@chips": "keyword.chip",
            "@default": "identifier",
          },
        },
      ],

      // whitespace
      { include: "@whitespace" },

      // delimiters and operators
      [/[{}()[\]]/, "@brackets"],
      [/[<>](?!@symbols)/, "@brackets"],
      [/@symbols/, { cases: { "@operators": "operator", "@default": "" } }],

      // @ annotations.
      // As an example, we emit a debugging log message on these tokens.
      // Note: message are supressed during the first load -- change some lines to see them.
      [
        /@\s*[a-zA-Z_$][\w$]*/,
        { token: "annotation", log: "annotation token: $0" },
      ],

      // numbers
      [/0[xX][0-9a-fA-F]+/, "number.hex"],
      [/\d+(..\d+)?/, "number"],

      // delimiter: after number because of .\d floats
      [/[;:,.]/, "delimiter"],

      // strings
      [/"([^"\\]|\\.)*$/, "string.invalid"], // non-teminated string
      [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],

      // characters
      [/'[^\\']'/, "string"],
      [/(')(@escapes)(')/, ["string", "string.escape", "string"]],
      [/'/, "string.invalid"],
    ],

    comment: [
      [/[^/*]+/, "comment"],
      [/\/\*/, "comment", "@push"], // nested comment
      ["\\*/", "comment", "@pop"],
      [/[/*]/, "comment"],
    ],

    string: [
      [/[^\\"]+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape.invalid"],
      [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
    ],

    whitespace: [
      [/[ \t\r\n]+/, "white"],
      [/\/\*/, "comment", "@comment"],
      [/\/\/.*$/, "comment"],
    ],
  },
};
