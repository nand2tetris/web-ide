import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { base } from "./base";

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
      [/@escapes/, "string.escape"],
      [/'/, "string.invalid"],
    ],

    ...base.tokenizer,
  },
};

const HdlSignatures = {
  Add16: "Add16(a = , b = , out = );",
  ALU: "ALU(x= ,y= ,zx= ,nx= ,zy= ,ny= ,f= ,no= ,out= ,zr= ,ng= );",
  And: "And(a= ,b= ,out= );",
  And16: "And16(a= ,b= ,out= );",
  ARegister: "ARegister(in= ,load= ,out= );",
  Bit: "Bit(in= ,load= ,out= );",
  CPU: "CPU(inM= ,instruction= ,reset= ,outM= ,writeM= ,addressM= ,pc= );",
  DFF: "DFF(in= ,out= );",
  DMux: "DMux(in= ,sel= ,a= ,b= );",
  DMux4Way: "DMux4Way(in= ,sel= ,a= ,b= ,c= ,d= );",
  DMux8Way: "DMux8Way(in= ,sel= ,a= ,b= ,c= ,d= ,e= ,f= ,g= ,h= );",
  DRegister: "DRegister(in= ,load= ,out= );",
  HalfAdder: "HalfAdder(a= ,b= ,sum= , carry= );",
  FullAdder: "FullAdder(a= ,b= ,c= ,sum= ,carry= );",
  Inc16: "Inc16(in= ,out= );",
  Keyboard: "Keyboard(out= );",
  Memory: "Memory(in= ,load= ,address= ,out= );",
  Mux: "Mux(a= ,b= ,sel= ,out= );",
  Mux16: "Mux16(a= ,b= ,sel= ,out= );",
  Mux4Way16: "Mux4Way16(a= ,b= ,c= ,d= ,sel= ,out= );",
  Mux8Way16: "Mux8Way16(a= ,b= ,c= ,d= ,e= ,f= ,g= ,h= ,sel= ,out= );",
  Nand: "Nand(a= ,b= ,out= );",
  Not16: "Not16(in= ,out= );",
  Not: "Not(in= ,out= );",
  Or: "Or(a= ,b= ,out= );",
  Or8Way: "Or8Way(in= ,out= );",
  Or16: "Or16(a= ,b= ,out= );",
  PC: "PC(in= ,load= ,inc= ,reset= ,out= );",
  RAM8: "RAM8(in= ,load= ,address= ,out= );",
  RAM64: "RAM64(in= ,load= ,address= ,out= );",
  RAM512: "RAM512(in= ,load= ,address= ,out= );",
  RAM4K: "RAM4K(in= ,load= ,address= ,out= );",
  RAM16K: "RAM16K(in= ,load= ,address= ,out= );",
  Register: "Register(in= ,load= ,out= );",
  ROM32K: "ROM32K(address= ,out= );",
  Screen: "Screen(in= ,load= ,address= ,out= );",
  Xor: "Xor(a = , b = , out = );",
};

export const HdlSnippets = {
  provideCompletionItems: () => {
    return {
      suggestions: Object.entries(HdlSignatures).map(([name, signature]) => ({
        label: name,
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: signature,
      })),
    };
  },
};
