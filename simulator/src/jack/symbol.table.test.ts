import {
  LocalSymbolTable,
  VariableSymbol,
  ScopeType,
  SubroutineScope,
} from "./symbol";

describe("Jack local symbol table", () => {
  const jestConsole = console;

  beforeEach(() => {
    global.console = require("console");
  });

  afterEach(() => {
    global.console = jestConsole;
  });

  test("add", () => {
    const localSymbolTable = new LocalSymbolTable();
    const symbols = [
      {
        name: "a1",
        type: "int",
        scope: ScopeType.Local,
        index: 0,
      } as VariableSymbol,
      {
        name: "a2",
        type: "char",
        scope: ScopeType.Local,
        index: 1,
      } as VariableSymbol,

      {
        name: "a3",
        type: "boolean",
        scope: ScopeType.Argument,
        index: 0,
      } as VariableSymbol,
      {
        name: "a4",
        type: "char",
        scope: ScopeType.Argument,
        index: 1,
      } as VariableSymbol,

      {
        name: "a5",
        type: "int",
        scope: ScopeType.This,
        index: 0,
      } as VariableSymbol,
      {
        name: "a6",
        type: "String",
        scope: ScopeType.This,
        index: 1,
      } as VariableSymbol,

      {
        name: "a7",
        type: "A",
        scope: ScopeType.Static,
        index: 0,
      } as VariableSymbol,
      {
        name: "a8",
        type: "B",
        scope: ScopeType.Static,
        index: 1,
      } as VariableSymbol,
    ];
    for (const s of symbols) {
      if (s.scope == ScopeType.Argument) {
        localSymbolTable.defineArgument(s.name, s.type, false);
      } else {
        localSymbolTable.define(s.scope, s.name, s.type);
      }
    }
    for (const s of symbols) {
      expect(localSymbolTable.lookup(s.name)).toEqual(s);
      expect(localSymbolTable.lookup(s.name + "_")).toBeUndefined();
    }
    expect(localSymbolTable.fieldsCount()).toBe(2);
  });

  test("shadowing", () => {
    const localSymbolTable = new LocalSymbolTable();
    const symbols = [
      {
        name: "a",
        type: "char",
        scope: ScopeType.This,
        index: 0,
      } as VariableSymbol,
      {
        name: "a",
        type: "int",
        scope: ScopeType.Local,
        index: 0,
      } as VariableSymbol,
    ];
    for (const s of symbols) {
      localSymbolTable.define(s.scope, s.name, s.type);
    }
    expect(localSymbolTable.lookup("a")).toEqual(symbols[1]);
  });

  test("pop stack", () => {
    const localSymbolTable = new LocalSymbolTable();
    const symbols = [
      {
        name: "a",
        type: "int",
        scope: ScopeType.Local,
        index: 0,
      } as VariableSymbol,
    ];
    for (const s of symbols) {
      localSymbolTable.define(s.scope, s.name, s.type);
    }
    localSymbolTable.popStack();
    expect(localSymbolTable.lookup("a")).toBeUndefined();
  });

  test("function vars", () => {
    const localSymbolTable = new LocalSymbolTable();
    const symbols = [
      {
        name: "a",
        type: "int",
        scope: ScopeType.Local,
        index: 0,
      } as VariableSymbol,
      {
        name: "b",
        type: "char",
        scope: ScopeType.Argument,
        index: 1,
      } as VariableSymbol,
    ];

    for (const s of symbols) {
      if (s.scope == ScopeType.Argument) {
        localSymbolTable.defineArgument(s.name, s.type, true);
      } else {
        localSymbolTable.define(s.scope, s.name, s.type);
      }
    }
    expect(localSymbolTable.popStack()).toEqual({
      arguments: [symbols[1]],
      locals: [symbols[0]],
    } as SubroutineScope);
  });
});
