import { ClassDeclarationContext, ClassNameContext, SubroutineDecContext } from './generated/JackParser';
import { JackParserVisitor } from './generated/JackParserVisitor';
import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor'

export class Visitor extends AbstractParseTreeVisitor<string> implements JackParserVisitor<string> {
    protected override defaultResult(): string {
        return "";
    }

    override aggregateResult(aggregate: string, nextResult: string) {
        return aggregate + nextResult
    }
    visitSubroutineDec(ctx: SubroutineDecContext): string {
        const c = ctx.parent
        return "" + super.visitChildren(ctx);
    };

}

/**
 * // Compiled Main.jack:
function Main.main 0
    push constant 12
    call String.new 1
    push constant 72
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 108
    call String.appendChar 2
    push constant 108
    call String.appendChar 2
    push constant 111
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 119
    call String.appendChar 2
    push constant 111
    call String.appendChar 2
    push constant 114
    call String.appendChar 2
    push constant 108
    call String.appendChar 2
    push constant 100
    call String.appendChar 2
    push constant 33
    call String.appendChar 2
    call Output.printString 1
    pop temp 0
    call Output.println 0
    pop temp 0
    push constant 0
    return
    */