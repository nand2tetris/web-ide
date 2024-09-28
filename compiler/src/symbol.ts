/**
 * Generic symbol. Can be used for both class and function symbols
 */
export enum SubroutineType {
    Constructor = "ctor",
    Function = "function",
    Method = "method",
}
export interface SubroutineInfo {
    paramsCount: number;
    type: SubroutineType
}
export interface GenericSymbol {
    subroutineInfo?: SubroutineInfo;
}
export function createSubroutineSymbol(paramsCount: number, type: SubroutineType) {
    return { subroutineInfo: { paramsCount, type } } as GenericSymbol
}

type VariableType = string
export enum ScopeType {
    StaticField,
    Field,
    Argument,
    Local,
}
export class LocalSymbolTable {
    private vars: Record<ScopeType, Record<string, string>> = {
        [ScopeType.StaticField]: {},
        [ScopeType.Field]: {},
        [ScopeType.Argument]: {},
        [ScopeType.Local]: {},
    };
    static readonly functionScopes = [ScopeType.Local, ScopeType.Argument, ScopeType.StaticField];

    existsSymbol(name: string, scopesToSearch = [ScopeType.Local, ScopeType.Argument, ScopeType.Field, ScopeType.StaticField]): boolean {
        for (const scope of scopesToSearch) {
            if (this.vars[scope][name] != undefined) {
                return true;
            }
        }
        return false;
    }
    getType(name: string, scopesToSearch = [ScopeType.Local, ScopeType.Argument, ScopeType.Field, ScopeType.StaticField]) {
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