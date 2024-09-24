// Generated from JackParser.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

import { ConstructorContext } from "./JackParser";
import { MethodContext } from "./JackParser";
import { FunctionContext } from "./JackParser";
import { StaticFieldDeclarationContext } from "./JackParser";
import { FieldDeclarationContext } from "./JackParser";
import { ProgramContext } from "./JackParser";
import { ClassDeclarationContext } from "./JackParser";
import { ClassNameContext } from "./JackParser";
import { ClassVarDecContext } from "./JackParser";
import { FieldListContext } from "./JackParser";
import { FieldNameContext } from "./JackParser";
import { SubroutineDecContext } from "./JackParser";
import { SubroutineDecWithoutTypeContext } from "./JackParser";
import { SubroutineNameContext } from "./JackParser";
import { SubroutineReturnTypeContext } from "./JackParser";
import { VarTypeContext } from "./JackParser";
import { ParameterListContext } from "./JackParser";
import { ParameterContext } from "./JackParser";
import { ParameterNameContext } from "./JackParser";
import { SubroutineBodyContext } from "./JackParser";
import { VarDecContext } from "./JackParser";
import { VarNameContext } from "./JackParser";
import { StatementsContext } from "./JackParser";
import { StatementContext } from "./JackParser";
import { LetStatementContext } from "./JackParser";
import { IfStatementContext } from "./JackParser";
import { WhileStatementContext } from "./JackParser";
import { DoStatementContext } from "./JackParser";
import { SubroutineCallContext } from "./JackParser";
import { ReturnStatementContext } from "./JackParser";
import { ExpressionListContext } from "./JackParser";
import { ExpressionContext } from "./JackParser";
import { GroupedExpressionContext } from "./JackParser";
import { UnaryOpContext } from "./JackParser";
import { ArrayAccessContext } from "./JackParser";
import { ConstantContext } from "./JackParser";
import { UnaryOperatorContext } from "./JackParser";
import { BinaryOperatorContext } from "./JackParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `JackParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface JackParserVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by the `constructor`
	 * labeled alternative in `JackParser.subroutineDec`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConstructor?: (ctx: ConstructorContext) => Result;

	/**
	 * Visit a parse tree produced by the `method`
	 * labeled alternative in `JackParser.subroutineDec`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMethod?: (ctx: MethodContext) => Result;

	/**
	 * Visit a parse tree produced by the `function`
	 * labeled alternative in `JackParser.subroutineDec`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFunction?: (ctx: FunctionContext) => Result;

	/**
	 * Visit a parse tree produced by the `staticFieldDeclaration`
	 * labeled alternative in `JackParser.classVarDec`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStaticFieldDeclaration?: (ctx: StaticFieldDeclarationContext) => Result;

	/**
	 * Visit a parse tree produced by the `fieldDeclaration`
	 * labeled alternative in `JackParser.classVarDec`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFieldDeclaration?: (ctx: FieldDeclarationContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.program`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitProgram?: (ctx: ProgramContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.classDeclaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitClassDeclaration?: (ctx: ClassDeclarationContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.className`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitClassName?: (ctx: ClassNameContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.classVarDec`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitClassVarDec?: (ctx: ClassVarDecContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.fieldList`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFieldList?: (ctx: FieldListContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.fieldName`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFieldName?: (ctx: FieldNameContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.subroutineDec`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSubroutineDec?: (ctx: SubroutineDecContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.subroutineDecWithoutType`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSubroutineDecWithoutType?: (ctx: SubroutineDecWithoutTypeContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.subroutineName`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSubroutineName?: (ctx: SubroutineNameContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.subroutineReturnType`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSubroutineReturnType?: (ctx: SubroutineReturnTypeContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.varType`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitVarType?: (ctx: VarTypeContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.parameterList`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParameterList?: (ctx: ParameterListContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.parameter`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParameter?: (ctx: ParameterContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.parameterName`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParameterName?: (ctx: ParameterNameContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.subroutineBody`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSubroutineBody?: (ctx: SubroutineBodyContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.varDec`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitVarDec?: (ctx: VarDecContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.varName`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitVarName?: (ctx: VarNameContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.statements`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStatements?: (ctx: StatementsContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.statement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStatement?: (ctx: StatementContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.letStatement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLetStatement?: (ctx: LetStatementContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.ifStatement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIfStatement?: (ctx: IfStatementContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.whileStatement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitWhileStatement?: (ctx: WhileStatementContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.doStatement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDoStatement?: (ctx: DoStatementContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.subroutineCall`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSubroutineCall?: (ctx: SubroutineCallContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.returnStatement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitReturnStatement?: (ctx: ReturnStatementContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.expressionList`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpressionList?: (ctx: ExpressionListContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpression?: (ctx: ExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.groupedExpression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitGroupedExpression?: (ctx: GroupedExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.unaryOp`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUnaryOp?: (ctx: UnaryOpContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.arrayAccess`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitArrayAccess?: (ctx: ArrayAccessContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.constant`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConstant?: (ctx: ConstantContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.unaryOperator`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUnaryOperator?: (ctx: UnaryOperatorContext) => Result;

	/**
	 * Visit a parse tree produced by `JackParser.binaryOperator`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBinaryOperator?: (ctx: BinaryOperatorContext) => Result;
}

