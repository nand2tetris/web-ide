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

export class LocalSymbolTable {
    constructor(private scopeVarDecs: Record<string, string>[] = [{}]) {

    }
    existsSymbol(name: string): boolean {
        for (let i = this.scopeVarDecs.length - 1; i >= 0; i--) {
            if (this.scopeVarDecs[i][name] != undefined) {
                return true;
            }
        }
        return false;
    }
    getType(name: string) {
        for (let i = this.scopeVarDecs.length - 1; i >= 0; i--) {
            if (this.scopeVarDecs[i][name] != undefined) {
                return this.scopeVarDecs[i][name];
            }
        }
        return undefined;
    }
    add(varName: string, type: VariableType) {
        this.scopeVarDecs[this.scopeVarDecs.length - 1][varName] = type;
    }
    pushStack() {
        this.scopeVarDecs.push({});
    }
    popStack() {
        this.scopeVarDecs.pop();
    }

}