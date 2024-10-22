/**
 * Generic symbol. Can be used for both class and function symbols
 */
export const SubroutineType = {
  Constructor: 1,
  Function: 2,
  Method: 3,
} as const;
export type SubroutineType =
  (typeof SubroutineType)[keyof typeof SubroutineType];
export interface SubroutineInfo {
  paramsCount: number;
  type: SubroutineType;
  localVarsCount?: number;
}

export type GlobalSymbolTable = Record<string, GenericSymbol>;
/**
 * Symbol that represents class or a subroutine
 */
export interface GenericSymbol {
  subroutineInfo?: SubroutineInfo;
}
export function createSubroutineSymbol(
  paramsCount: number,
  type: SubroutineType,
  localVarsCount?: number
): GenericSymbol {
  const s = { paramsCount, type } as SubroutineInfo;
  if (localVarsCount != undefined) {
    s.localVarsCount = localVarsCount;
  }
  return { subroutineInfo: s } as GenericSymbol;
}

type VariableType = string;

export const ScopeType = {
  Static: 1,
  This: 2,
  Argument: 3,
  Local: 4,
};
export type ScopeType = (typeof ScopeType)[keyof typeof ScopeType];

const scopeTypeToStringMap: Record<ScopeType, string> = {
  [ScopeType.Static]: "static",
  [ScopeType.This]: "this",
  [ScopeType.Argument]: "argument",
  [ScopeType.Local]: "local",
};
export function scopeTypeToString(scopeType: ScopeType): string {
  if (scopeTypeToStringMap[scopeType] === undefined) {
    throw new Error(`Unknown scope type: ${scopeType}`);
  }
  return scopeTypeToStringMap[scopeType];
}
export type VariableSymbol = {
  name: string;
  type: VariableType;
  scope: ScopeType;
  index: number;
};

export type SubroutineScope = {
  arguments: VariableSymbol[];
  locals: VariableSymbol[];
};
/**
 *   Symbol table that provides lookup for variables in different scopes in a file
 */
export class LocalSymbolTable {
  private scopes: Record<ScopeType, VariableSymbol[]> = {
    [ScopeType.Static]: [],
    [ScopeType.This]: [],
    [ScopeType.Argument]: [],
    [ScopeType.Local]: [],
  };
  private static scopesLookupOrder = [
    ScopeType.Local,
    ScopeType.Argument,
    ScopeType.This,
    ScopeType.Static,
  ];
  lookup(name: string): VariableSymbol | undefined {
    for (const scope of LocalSymbolTable.scopesLookupOrder) {
      const symbol = this.scopes[scope].find((v) => v.name == name);
      if (symbol != undefined) return symbol;
    }
    return undefined;
  }
  defineArgument(name: string, type: VariableType, inMethod: boolean) {
    let index = this.scopes[ScopeType.Argument].length;
    if (inMethod) {
      //in a method first arg is this
      index++;
    }
    this.scopes[ScopeType.Argument].push({
      name,
      type,
      scope: ScopeType.Argument,
      index,
    });
  }
  //define symbol in scope
  define(scope: ScopeType, varName: string, type: VariableType) {
    if (scope == ScopeType.Argument) {
      throw new Error(
        "Please use defineArgument method to define function arguments"
      );
    }
    this.scopes[scope].push({
      name: varName,
      type,
      scope,
      index: this.scopes[scope].length,
    });
  }

  popStack() {
    const f = {
      arguments: this.scopes[ScopeType.Argument],
      locals: this.scopes[ScopeType.Local],
    } as SubroutineScope;
    this.scopes[ScopeType.Local] = [];
    this.scopes[ScopeType.Argument] = [];
    return f;
  }
  setSubroutineScope(subroutineScope: SubroutineScope) {
    this.scopes[ScopeType.Argument] = subroutineScope.arguments;
    this.scopes[ScopeType.Local] = subroutineScope.locals;
  }
  fieldsCount() {
    return this.scopes[ScopeType.This].length;
  }
}
