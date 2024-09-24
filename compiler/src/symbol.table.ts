export enum Scope {
    local,
    static,
    argument,
}
export class SymbolTableEntry {
    constructor(public name: string, public type: string, public scope: Scope) {

    }
}
export class SymbolTable {
    constructor(private entries: SymbolTableEntry[] = [], private scopes: Scope[] = [], private scopeStack: Scope[] = []) { }
    insert(entry: SymbolTableEntry) {
        this.entries.push(entry);
    }
    lookup(name: string) {
        //TODO: look for entries in enclosed scopes
        return this.entries.find(entry => entry.name === name);
    }
    pushScope(scope: Scope) {
        this.scopeStack.push(scope);
    }
    popScope() {
        this.scopeStack.pop();
    }
}