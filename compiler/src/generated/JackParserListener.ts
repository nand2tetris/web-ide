// Generated from JackParser.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

import { ProgramContext } from "./JackParser";
import { ClassDeclarationContext } from "./JackParser";
import { ClassNameContext } from "./JackParser";
import { ClassVarDecContext } from "./JackParser";
import { FieldListContext } from "./JackParser";
import { FieldNameContext } from "./JackParser";
import { SubroutineDeclarationContext } from "./JackParser";
import { SubroutineTypeContext } from "./JackParser";
import { SubroutineDecWithoutTypeContext } from "./JackParser";
import { SubroutineNameContext } from "./JackParser";
import { SubroutineReturnTypeContext } from "./JackParser";
import { VarTypeContext } from "./JackParser";
import { ParameterListContext } from "./JackParser";
import { ParameterContext } from "./JackParser";
import { ParameterNameContext } from "./JackParser";
import { SubroutineBodyContext } from "./JackParser";
import { RBraceContext } from "./JackParser";
import { VarDeclarationContext } from "./JackParser";
import { VarNameInDeclarationContext } from "./JackParser";
import { VarNameContext } from "./JackParser";
import { StatementsContext } from "./JackParser";
import { StatementContext } from "./JackParser";
import { LetStatementContext } from "./JackParser";
import { IfElseStatementContext } from "./JackParser";
import { IfStatementContext } from "./JackParser";
import { ElseStatementContext } from "./JackParser";
import { WhileStatementContext } from "./JackParser";
import { DoStatementContext } from "./JackParser";
import { SubroutineCallContext } from "./JackParser";
import { SubroutineIdContext } from "./JackParser";
import { ReturnStatementContext } from "./JackParser";
import { ExpressionListContext } from "./JackParser";
import { ExpressionContext } from "./JackParser";
import { GroupedExpressionContext } from "./JackParser";
import { UnaryOperationContext } from "./JackParser";
import { ArrayAccessContext } from "./JackParser";
import { ConstantContext } from "./JackParser";
import { UnaryOperatorContext } from "./JackParser";
import { BinaryOperatorContext } from "./JackParser";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `JackParser`.
 */
export interface JackParserListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by `JackParser.program`.
	 * @param ctx the parse tree
	 */
	enterProgram?: (ctx: ProgramContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.program`.
	 * @param ctx the parse tree
	 */
	exitProgram?: (ctx: ProgramContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.classDeclaration`.
	 * @param ctx the parse tree
	 */
	enterClassDeclaration?: (ctx: ClassDeclarationContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.classDeclaration`.
	 * @param ctx the parse tree
	 */
	exitClassDeclaration?: (ctx: ClassDeclarationContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.className`.
	 * @param ctx the parse tree
	 */
	enterClassName?: (ctx: ClassNameContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.className`.
	 * @param ctx the parse tree
	 */
	exitClassName?: (ctx: ClassNameContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.classVarDec`.
	 * @param ctx the parse tree
	 */
	enterClassVarDec?: (ctx: ClassVarDecContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.classVarDec`.
	 * @param ctx the parse tree
	 */
	exitClassVarDec?: (ctx: ClassVarDecContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.fieldList`.
	 * @param ctx the parse tree
	 */
	enterFieldList?: (ctx: FieldListContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.fieldList`.
	 * @param ctx the parse tree
	 */
	exitFieldList?: (ctx: FieldListContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.fieldName`.
	 * @param ctx the parse tree
	 */
	enterFieldName?: (ctx: FieldNameContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.fieldName`.
	 * @param ctx the parse tree
	 */
	exitFieldName?: (ctx: FieldNameContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.subroutineDeclaration`.
	 * @param ctx the parse tree
	 */
	enterSubroutineDeclaration?: (ctx: SubroutineDeclarationContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.subroutineDeclaration`.
	 * @param ctx the parse tree
	 */
	exitSubroutineDeclaration?: (ctx: SubroutineDeclarationContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.subroutineType`.
	 * @param ctx the parse tree
	 */
	enterSubroutineType?: (ctx: SubroutineTypeContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.subroutineType`.
	 * @param ctx the parse tree
	 */
	exitSubroutineType?: (ctx: SubroutineTypeContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.subroutineDecWithoutType`.
	 * @param ctx the parse tree
	 */
	enterSubroutineDecWithoutType?: (ctx: SubroutineDecWithoutTypeContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.subroutineDecWithoutType`.
	 * @param ctx the parse tree
	 */
	exitSubroutineDecWithoutType?: (ctx: SubroutineDecWithoutTypeContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.subroutineName`.
	 * @param ctx the parse tree
	 */
	enterSubroutineName?: (ctx: SubroutineNameContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.subroutineName`.
	 * @param ctx the parse tree
	 */
	exitSubroutineName?: (ctx: SubroutineNameContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.subroutineReturnType`.
	 * @param ctx the parse tree
	 */
	enterSubroutineReturnType?: (ctx: SubroutineReturnTypeContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.subroutineReturnType`.
	 * @param ctx the parse tree
	 */
	exitSubroutineReturnType?: (ctx: SubroutineReturnTypeContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.varType`.
	 * @param ctx the parse tree
	 */
	enterVarType?: (ctx: VarTypeContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.varType`.
	 * @param ctx the parse tree
	 */
	exitVarType?: (ctx: VarTypeContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.parameterList`.
	 * @param ctx the parse tree
	 */
	enterParameterList?: (ctx: ParameterListContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.parameterList`.
	 * @param ctx the parse tree
	 */
	exitParameterList?: (ctx: ParameterListContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.parameter`.
	 * @param ctx the parse tree
	 */
	enterParameter?: (ctx: ParameterContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.parameter`.
	 * @param ctx the parse tree
	 */
	exitParameter?: (ctx: ParameterContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.parameterName`.
	 * @param ctx the parse tree
	 */
	enterParameterName?: (ctx: ParameterNameContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.parameterName`.
	 * @param ctx the parse tree
	 */
	exitParameterName?: (ctx: ParameterNameContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.subroutineBody`.
	 * @param ctx the parse tree
	 */
	enterSubroutineBody?: (ctx: SubroutineBodyContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.subroutineBody`.
	 * @param ctx the parse tree
	 */
	exitSubroutineBody?: (ctx: SubroutineBodyContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.rBrace`.
	 * @param ctx the parse tree
	 */
	enterRBrace?: (ctx: RBraceContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.rBrace`.
	 * @param ctx the parse tree
	 */
	exitRBrace?: (ctx: RBraceContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.varDeclaration`.
	 * @param ctx the parse tree
	 */
	enterVarDeclaration?: (ctx: VarDeclarationContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.varDeclaration`.
	 * @param ctx the parse tree
	 */
	exitVarDeclaration?: (ctx: VarDeclarationContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.varNameInDeclaration`.
	 * @param ctx the parse tree
	 */
	enterVarNameInDeclaration?: (ctx: VarNameInDeclarationContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.varNameInDeclaration`.
	 * @param ctx the parse tree
	 */
	exitVarNameInDeclaration?: (ctx: VarNameInDeclarationContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.varName`.
	 * @param ctx the parse tree
	 */
	enterVarName?: (ctx: VarNameContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.varName`.
	 * @param ctx the parse tree
	 */
	exitVarName?: (ctx: VarNameContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.statements`.
	 * @param ctx the parse tree
	 */
	enterStatements?: (ctx: StatementsContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.statements`.
	 * @param ctx the parse tree
	 */
	exitStatements?: (ctx: StatementsContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.statement`.
	 * @param ctx the parse tree
	 */
	enterStatement?: (ctx: StatementContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.statement`.
	 * @param ctx the parse tree
	 */
	exitStatement?: (ctx: StatementContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.letStatement`.
	 * @param ctx the parse tree
	 */
	enterLetStatement?: (ctx: LetStatementContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.letStatement`.
	 * @param ctx the parse tree
	 */
	exitLetStatement?: (ctx: LetStatementContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.ifElseStatement`.
	 * @param ctx the parse tree
	 */
	enterIfElseStatement?: (ctx: IfElseStatementContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.ifElseStatement`.
	 * @param ctx the parse tree
	 */
	exitIfElseStatement?: (ctx: IfElseStatementContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.ifStatement`.
	 * @param ctx the parse tree
	 */
	enterIfStatement?: (ctx: IfStatementContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.ifStatement`.
	 * @param ctx the parse tree
	 */
	exitIfStatement?: (ctx: IfStatementContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.elseStatement`.
	 * @param ctx the parse tree
	 */
	enterElseStatement?: (ctx: ElseStatementContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.elseStatement`.
	 * @param ctx the parse tree
	 */
	exitElseStatement?: (ctx: ElseStatementContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.whileStatement`.
	 * @param ctx the parse tree
	 */
	enterWhileStatement?: (ctx: WhileStatementContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.whileStatement`.
	 * @param ctx the parse tree
	 */
	exitWhileStatement?: (ctx: WhileStatementContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.doStatement`.
	 * @param ctx the parse tree
	 */
	enterDoStatement?: (ctx: DoStatementContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.doStatement`.
	 * @param ctx the parse tree
	 */
	exitDoStatement?: (ctx: DoStatementContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.subroutineCall`.
	 * @param ctx the parse tree
	 */
	enterSubroutineCall?: (ctx: SubroutineCallContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.subroutineCall`.
	 * @param ctx the parse tree
	 */
	exitSubroutineCall?: (ctx: SubroutineCallContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.subroutineId`.
	 * @param ctx the parse tree
	 */
	enterSubroutineId?: (ctx: SubroutineIdContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.subroutineId`.
	 * @param ctx the parse tree
	 */
	exitSubroutineId?: (ctx: SubroutineIdContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.returnStatement`.
	 * @param ctx the parse tree
	 */
	enterReturnStatement?: (ctx: ReturnStatementContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.returnStatement`.
	 * @param ctx the parse tree
	 */
	exitReturnStatement?: (ctx: ReturnStatementContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.expressionList`.
	 * @param ctx the parse tree
	 */
	enterExpressionList?: (ctx: ExpressionListContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.expressionList`.
	 * @param ctx the parse tree
	 */
	exitExpressionList?: (ctx: ExpressionListContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.expression`.
	 * @param ctx the parse tree
	 */
	enterExpression?: (ctx: ExpressionContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.expression`.
	 * @param ctx the parse tree
	 */
	exitExpression?: (ctx: ExpressionContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.groupedExpression`.
	 * @param ctx the parse tree
	 */
	enterGroupedExpression?: (ctx: GroupedExpressionContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.groupedExpression`.
	 * @param ctx the parse tree
	 */
	exitGroupedExpression?: (ctx: GroupedExpressionContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.unaryOperation`.
	 * @param ctx the parse tree
	 */
	enterUnaryOperation?: (ctx: UnaryOperationContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.unaryOperation`.
	 * @param ctx the parse tree
	 */
	exitUnaryOperation?: (ctx: UnaryOperationContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.arrayAccess`.
	 * @param ctx the parse tree
	 */
	enterArrayAccess?: (ctx: ArrayAccessContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.arrayAccess`.
	 * @param ctx the parse tree
	 */
	exitArrayAccess?: (ctx: ArrayAccessContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.constant`.
	 * @param ctx the parse tree
	 */
	enterConstant?: (ctx: ConstantContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.constant`.
	 * @param ctx the parse tree
	 */
	exitConstant?: (ctx: ConstantContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.unaryOperator`.
	 * @param ctx the parse tree
	 */
	enterUnaryOperator?: (ctx: UnaryOperatorContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.unaryOperator`.
	 * @param ctx the parse tree
	 */
	exitUnaryOperator?: (ctx: UnaryOperatorContext) => void;

	/**
	 * Enter a parse tree produced by `JackParser.binaryOperator`.
	 * @param ctx the parse tree
	 */
	enterBinaryOperator?: (ctx: BinaryOperatorContext) => void;
	/**
	 * Exit a parse tree produced by `JackParser.binaryOperator`.
	 * @param ctx the parse tree
	 */
	exitBinaryOperator?: (ctx: BinaryOperatorContext) => void;
}

