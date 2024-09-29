/**
 * Generic symbol. Can be used for both class and function symbols
 */
export enum SubroutineType {
    Constructor,
    Function,
    Method,
}
export interface SubroutineInfo {
    paramsCount: number;
    type: SubroutineType
    localVarsCount?: number;
}
/**
 * Symbol that represents class or a subroutine
 */
export interface GenericSymbol {
    subroutineInfo?: SubroutineInfo;
}
export function createSubroutineSymbol(paramsCount: number, type: SubroutineType, localVarsCount?: number): GenericSymbol {
    const s = { paramsCount, type } as SubroutineInfo;
    if (localVarsCount != undefined) {
        s.localVarsCount = localVarsCount
    }
    return { subroutineInfo: s } as GenericSymbol
}

type VariableType = string
export enum ScopeType {
    Static,
    This,
    Argument,
    Local,
}
/**
 *   Symbol table that provides lookup for variables in different scopes in a file
 */
export class LocalSymbolTable {
    private vars: Record<ScopeType, Record<string, string>> = {
        [ScopeType.Static]: {},
        [ScopeType.This]: {},
        [ScopeType.Argument]: {},
        [ScopeType.Local]: {},
    };
    static readonly functionScopes = [ScopeType.Local, ScopeType.Argument, ScopeType.Static];

    existsSymbol(name: string, scopesToSearch = [ScopeType.Local, ScopeType.Argument, ScopeType.This, ScopeType.Static]): boolean {
        for (const scope of scopesToSearch) {
            if (this.vars[scope][name] != undefined) {
                return true;
            }
        }
        return false;
    }
    getType(name: string, scopesToSearch = [ScopeType.Local, ScopeType.Argument, ScopeType.This, ScopeType.Static]) {
        for (const scope of scopesToSearch) {
            if (this.vars[scope][name] != undefined) {
                return this.vars[scope][name];
            }
        }
        return undefined;
    }
    add(scope: ScopeType, varName: string, type: VariableType) {
        this.vars[scope][varName] = type;
    }
    clearSubroutineVars() {
        this.vars[ScopeType.Argument] = {};
        this.vars[ScopeType.Local] = {};
    }
}