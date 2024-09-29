// Generated from JackParser.g4 by ANTLR 4.9.0-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { FailedPredicateException } from "antlr4ts/FailedPredicateException";
import { NotNull } from "antlr4ts/Decorators";
import { NoViableAltException } from "antlr4ts/NoViableAltException";
import { Override } from "antlr4ts/Decorators";
import { Parser } from "antlr4ts/Parser";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext";
import { ParserATNSimulator } from "antlr4ts/atn/ParserATNSimulator";
import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";
import { RecognitionException } from "antlr4ts/RecognitionException";
import { RuleContext } from "antlr4ts/RuleContext";
//import { RuleVersion } from "antlr4ts/RuleVersion";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { Token } from "antlr4ts/Token";
import { TokenStream } from "antlr4ts/TokenStream";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";

import { JackParserListener } from "./JackParserListener";
import { JackParserVisitor } from "./JackParserVisitor";


export class JackParser extends Parser {
	public static readonly CLASS = 1;
	public static readonly CONSTRUCTOR = 2;
	public static readonly FUNCTION = 3;
	public static readonly METHOD = 4;
	public static readonly FIELD = 5;
	public static readonly STATIC = 6;
	public static readonly VAR = 7;
	public static readonly INT = 8;
	public static readonly CHAR = 9;
	public static readonly BOOLEAN = 10;
	public static readonly VOID = 11;
	public static readonly LET = 12;
	public static readonly DO = 13;
	public static readonly IF = 14;
	public static readonly ELSE = 15;
	public static readonly WHILE = 16;
	public static readonly RETURN = 17;
	public static readonly LBRACE = 18;
	public static readonly RBRACE = 19;
	public static readonly LPAREN = 20;
	public static readonly RPAREN = 21;
	public static readonly LBRACKET = 22;
	public static readonly RBRACKET = 23;
	public static readonly DOT = 24;
	public static readonly COMMA = 25;
	public static readonly SEMICOLON = 26;
	public static readonly EQUALS = 27;
	public static readonly PLUS = 28;
	public static readonly MINUS = 29;
	public static readonly MUL = 30;
	public static readonly DIV = 31;
	public static readonly AND = 32;
	public static readonly OR = 33;
	public static readonly TILDE = 34;
	public static readonly LESS_THAN = 35;
	public static readonly GREATER_THAN = 36;
	public static readonly WS = 37;
	public static readonly COMMENT = 38;
	public static readonly LINE_COMMENT = 39;
	public static readonly INTEGER_LITERAL = 40;
	public static readonly BOOLEAN_LITERAL = 41;
	public static readonly NULL_LITERAL = 42;
	public static readonly THIS_LITERAL = 43;
	public static readonly IDENTIFIER = 44;
	public static readonly STRING_LITERAL = 45;
	public static readonly UnterminatedStringLiteral = 46;
	public static readonly RULE_program = 0;
	public static readonly RULE_classDeclaration = 1;
	public static readonly RULE_className = 2;
	public static readonly RULE_classVarDec = 3;
	public static readonly RULE_fieldList = 4;
	public static readonly RULE_fieldName = 5;
	public static readonly RULE_subroutineDeclaration = 6;
	public static readonly RULE_subroutineType = 7;
	public static readonly RULE_subroutineDecWithoutType = 8;
	public static readonly RULE_subroutineName = 9;
	public static readonly RULE_subroutineReturnType = 10;
	public static readonly RULE_varType = 11;
	public static readonly RULE_parameterList = 12;
	public static readonly RULE_parameter = 13;
	public static readonly RULE_parameterName = 14;
	public static readonly RULE_subroutineBody = 15;
	public static readonly RULE_rBrace = 16;
	public static readonly RULE_varDeclaration = 17;
	public static readonly RULE_varNameInDeclaration = 18;
	public static readonly RULE_varName = 19;
	public static readonly RULE_statements = 20;
	public static readonly RULE_statement = 21;
	public static readonly RULE_letStatement = 22;
	public static readonly RULE_ifElseStatement = 23;
	public static readonly RULE_ifStatement = 24;
	public static readonly RULE_elseStatement = 25;
	public static readonly RULE_whileStatement = 26;
	public static readonly RULE_doStatement = 27;
	public static readonly RULE_subroutineCall = 28;
	public static readonly RULE_subroutineId = 29;
	public static readonly RULE_returnStatement = 30;
	public static readonly RULE_expressionList = 31;
	public static readonly RULE_expression = 32;
	public static readonly RULE_groupedExpression = 33;
	public static readonly RULE_unaryOperation = 34;
	public static readonly RULE_arrayAccess = 35;
	public static readonly RULE_constant = 36;
	public static readonly RULE_unaryOperator = 37;
	public static readonly RULE_binaryOperator = 38;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"program", "classDeclaration", "className", "classVarDec", "fieldList", 
		"fieldName", "subroutineDeclaration", "subroutineType", "subroutineDecWithoutType", 
		"subroutineName", "subroutineReturnType", "varType", "parameterList", 
		"parameter", "parameterName", "subroutineBody", "rBrace", "varDeclaration", 
		"varNameInDeclaration", "varName", "statements", "statement", "letStatement", 
		"ifElseStatement", "ifStatement", "elseStatement", "whileStatement", "doStatement", 
		"subroutineCall", "subroutineId", "returnStatement", "expressionList", 
		"expression", "groupedExpression", "unaryOperation", "arrayAccess", "constant", 
		"unaryOperator", "binaryOperator",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'class'", "'constructor'", "'function'", "'method'", "'field'", 
		"'static'", "'var'", "'int'", "'char'", "'boolean'", "'void'", "'let'", 
		"'do'", "'if'", "'else'", "'while'", "'return'", "'{'", "'}'", "'('", 
		"')'", "'['", "']'", "'.'", "','", "';'", "'='", "'+'", "'-'", "'*'", 
		"'/'", "'&'", "'|'", "'~'", "'<'", "'>'", undefined, undefined, undefined, 
		undefined, undefined, "'null'", "'this'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "CLASS", "CONSTRUCTOR", "FUNCTION", "METHOD", "FIELD", "STATIC", 
		"VAR", "INT", "CHAR", "BOOLEAN", "VOID", "LET", "DO", "IF", "ELSE", "WHILE", 
		"RETURN", "LBRACE", "RBRACE", "LPAREN", "RPAREN", "LBRACKET", "RBRACKET", 
		"DOT", "COMMA", "SEMICOLON", "EQUALS", "PLUS", "MINUS", "MUL", "DIV", 
		"AND", "OR", "TILDE", "LESS_THAN", "GREATER_THAN", "WS", "COMMENT", "LINE_COMMENT", 
		"INTEGER_LITERAL", "BOOLEAN_LITERAL", "NULL_LITERAL", "THIS_LITERAL", 
		"IDENTIFIER", "STRING_LITERAL", "UnterminatedStringLiteral",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(JackParser._LITERAL_NAMES, JackParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return JackParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "JackParser.g4"; }

	// @Override
	public get ruleNames(): string[] { return JackParser.ruleNames; }

	// @Override
	public override get serializedATN(): string { return JackParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(JackParser._ATN, this);
	}
	// @RuleVersion(0)
	public program(): ProgramContext {
		let _localctx: ProgramContext = new ProgramContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, JackParser.RULE_program);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 78;
			this.classDeclaration();
			this.state = 79;
			this.match(JackParser.EOF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public classDeclaration(): ClassDeclarationContext {
		let _localctx: ClassDeclarationContext = new ClassDeclarationContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, JackParser.RULE_classDeclaration);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 81;
			this.match(JackParser.CLASS);
			this.state = 82;
			this.className();
			this.state = 83;
			this.match(JackParser.LBRACE);
			this.state = 87;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === JackParser.FIELD || _la === JackParser.STATIC) {
				{
				{
				this.state = 84;
				this.classVarDec();
				}
				}
				this.state = 89;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 93;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << JackParser.CONSTRUCTOR) | (1 << JackParser.FUNCTION) | (1 << JackParser.METHOD))) !== 0)) {
				{
				{
				this.state = 90;
				this.subroutineDeclaration();
				}
				}
				this.state = 95;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 96;
			this.rBrace();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public className(): ClassNameContext {
		let _localctx: ClassNameContext = new ClassNameContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, JackParser.RULE_className);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 98;
			this.match(JackParser.IDENTIFIER);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public classVarDec(): ClassVarDecContext {
		let _localctx: ClassVarDecContext = new ClassVarDecContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, JackParser.RULE_classVarDec);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 100;
			_la = this._input.LA(1);
			if (!(_la === JackParser.FIELD || _la === JackParser.STATIC)) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			this.state = 101;
			this.fieldList();
			this.state = 102;
			this.match(JackParser.SEMICOLON);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public fieldList(): FieldListContext {
		let _localctx: FieldListContext = new FieldListContext(this._ctx, this.state);
		this.enterRule(_localctx, 8, JackParser.RULE_fieldList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 104;
			this.varType();
			this.state = 105;
			this.fieldName();
			this.state = 110;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === JackParser.COMMA) {
				{
				{
				this.state = 106;
				this.match(JackParser.COMMA);
				this.state = 107;
				this.fieldName();
				}
				}
				this.state = 112;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public fieldName(): FieldNameContext {
		let _localctx: FieldNameContext = new FieldNameContext(this._ctx, this.state);
		this.enterRule(_localctx, 10, JackParser.RULE_fieldName);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 113;
			this.match(JackParser.IDENTIFIER);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public subroutineDeclaration(): SubroutineDeclarationContext {
		let _localctx: SubroutineDeclarationContext = new SubroutineDeclarationContext(this._ctx, this.state);
		this.enterRule(_localctx, 12, JackParser.RULE_subroutineDeclaration);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 115;
			this.subroutineType();
			this.state = 116;
			this.subroutineDecWithoutType();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public subroutineType(): SubroutineTypeContext {
		let _localctx: SubroutineTypeContext = new SubroutineTypeContext(this._ctx, this.state);
		this.enterRule(_localctx, 14, JackParser.RULE_subroutineType);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 118;
			_la = this._input.LA(1);
			if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << JackParser.CONSTRUCTOR) | (1 << JackParser.FUNCTION) | (1 << JackParser.METHOD))) !== 0))) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public subroutineDecWithoutType(): SubroutineDecWithoutTypeContext {
		let _localctx: SubroutineDecWithoutTypeContext = new SubroutineDecWithoutTypeContext(this._ctx, this.state);
		this.enterRule(_localctx, 16, JackParser.RULE_subroutineDecWithoutType);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 120;
			this.subroutineReturnType();
			this.state = 121;
			this.subroutineName();
			this.state = 122;
			this.match(JackParser.LPAREN);
			this.state = 123;
			this.parameterList();
			this.state = 124;
			this.match(JackParser.RPAREN);
			this.state = 125;
			this.subroutineBody();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public subroutineName(): SubroutineNameContext {
		let _localctx: SubroutineNameContext = new SubroutineNameContext(this._ctx, this.state);
		this.enterRule(_localctx, 18, JackParser.RULE_subroutineName);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 127;
			this.match(JackParser.IDENTIFIER);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public subroutineReturnType(): SubroutineReturnTypeContext {
		let _localctx: SubroutineReturnTypeContext = new SubroutineReturnTypeContext(this._ctx, this.state);
		this.enterRule(_localctx, 20, JackParser.RULE_subroutineReturnType);
		try {
			this.state = 131;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case JackParser.INT:
			case JackParser.CHAR:
			case JackParser.BOOLEAN:
			case JackParser.IDENTIFIER:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 129;
				this.varType();
				}
				break;
			case JackParser.VOID:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 130;
				this.match(JackParser.VOID);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public varType(): VarTypeContext {
		let _localctx: VarTypeContext = new VarTypeContext(this._ctx, this.state);
		this.enterRule(_localctx, 22, JackParser.RULE_varType);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 133;
			_la = this._input.LA(1);
			if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << JackParser.INT) | (1 << JackParser.CHAR) | (1 << JackParser.BOOLEAN))) !== 0) || _la === JackParser.IDENTIFIER)) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public parameterList(): ParameterListContext {
		let _localctx: ParameterListContext = new ParameterListContext(this._ctx, this.state);
		this.enterRule(_localctx, 24, JackParser.RULE_parameterList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 143;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << JackParser.INT) | (1 << JackParser.CHAR) | (1 << JackParser.BOOLEAN))) !== 0) || _la === JackParser.IDENTIFIER) {
				{
				this.state = 135;
				this.parameter();
				this.state = 140;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === JackParser.COMMA) {
					{
					{
					this.state = 136;
					this.match(JackParser.COMMA);
					this.state = 137;
					this.parameter();
					}
					}
					this.state = 142;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public parameter(): ParameterContext {
		let _localctx: ParameterContext = new ParameterContext(this._ctx, this.state);
		this.enterRule(_localctx, 26, JackParser.RULE_parameter);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 145;
			this.varType();
			this.state = 146;
			this.parameterName();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public parameterName(): ParameterNameContext {
		let _localctx: ParameterNameContext = new ParameterNameContext(this._ctx, this.state);
		this.enterRule(_localctx, 28, JackParser.RULE_parameterName);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 148;
			this.match(JackParser.IDENTIFIER);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public subroutineBody(): SubroutineBodyContext {
		let _localctx: SubroutineBodyContext = new SubroutineBodyContext(this._ctx, this.state);
		this.enterRule(_localctx, 30, JackParser.RULE_subroutineBody);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 150;
			this.match(JackParser.LBRACE);
			this.state = 154;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === JackParser.VAR) {
				{
				{
				this.state = 151;
				this.varDeclaration();
				}
				}
				this.state = 156;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 157;
			this.statements();
			this.state = 158;
			this.rBrace();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public rBrace(): RBraceContext {
		let _localctx: RBraceContext = new RBraceContext(this._ctx, this.state);
		this.enterRule(_localctx, 32, JackParser.RULE_rBrace);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 160;
			this.match(JackParser.RBRACE);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public varDeclaration(): VarDeclarationContext {
		let _localctx: VarDeclarationContext = new VarDeclarationContext(this._ctx, this.state);
		this.enterRule(_localctx, 34, JackParser.RULE_varDeclaration);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 162;
			this.match(JackParser.VAR);
			this.state = 163;
			this.varType();
			this.state = 164;
			this.varNameInDeclaration();
			this.state = 169;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === JackParser.COMMA) {
				{
				{
				this.state = 165;
				this.match(JackParser.COMMA);
				this.state = 166;
				this.varNameInDeclaration();
				}
				}
				this.state = 171;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 172;
			this.match(JackParser.SEMICOLON);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public varNameInDeclaration(): VarNameInDeclarationContext {
		let _localctx: VarNameInDeclarationContext = new VarNameInDeclarationContext(this._ctx, this.state);
		this.enterRule(_localctx, 36, JackParser.RULE_varNameInDeclaration);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 174;
			this.match(JackParser.IDENTIFIER);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public varName(): VarNameContext {
		let _localctx: VarNameContext = new VarNameContext(this._ctx, this.state);
		this.enterRule(_localctx, 38, JackParser.RULE_varName);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 176;
			this.match(JackParser.IDENTIFIER);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public statements(): StatementsContext {
		let _localctx: StatementsContext = new StatementsContext(this._ctx, this.state);
		this.enterRule(_localctx, 40, JackParser.RULE_statements);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 181;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << JackParser.LET) | (1 << JackParser.DO) | (1 << JackParser.IF) | (1 << JackParser.WHILE) | (1 << JackParser.RETURN))) !== 0)) {
				{
				{
				this.state = 178;
				this.statement();
				}
				}
				this.state = 183;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public statement(): StatementContext {
		let _localctx: StatementContext = new StatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 42, JackParser.RULE_statement);
		try {
			this.state = 189;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case JackParser.LET:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 184;
				this.letStatement();
				}
				break;
			case JackParser.IF:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 185;
				this.ifElseStatement();
				}
				break;
			case JackParser.WHILE:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 186;
				this.whileStatement();
				}
				break;
			case JackParser.DO:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 187;
				this.doStatement();
				}
				break;
			case JackParser.RETURN:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 188;
				this.returnStatement();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public letStatement(): LetStatementContext {
		let _localctx: LetStatementContext = new LetStatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 44, JackParser.RULE_letStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 191;
			this.match(JackParser.LET);
			this.state = 194;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 10, this._ctx) ) {
			case 1:
				{
				this.state = 192;
				this.varName();
				}
				break;

			case 2:
				{
				this.state = 193;
				this.arrayAccess();
				}
				break;
			}
			this.state = 196;
			this.match(JackParser.EQUALS);
			this.state = 197;
			this.expression(0);
			this.state = 198;
			this.match(JackParser.SEMICOLON);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public ifElseStatement(): IfElseStatementContext {
		let _localctx: IfElseStatementContext = new IfElseStatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 46, JackParser.RULE_ifElseStatement);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 200;
			this.ifStatement();
			this.state = 202;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === JackParser.ELSE) {
				{
				this.state = 201;
				this.elseStatement();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public ifStatement(): IfStatementContext {
		let _localctx: IfStatementContext = new IfStatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 48, JackParser.RULE_ifStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 204;
			this.match(JackParser.IF);
			this.state = 205;
			this.match(JackParser.LPAREN);
			this.state = 206;
			this.expression(0);
			this.state = 207;
			this.match(JackParser.RPAREN);
			this.state = 208;
			this.match(JackParser.LBRACE);
			this.state = 209;
			this.statements();
			this.state = 210;
			this.rBrace();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public elseStatement(): ElseStatementContext {
		let _localctx: ElseStatementContext = new ElseStatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 50, JackParser.RULE_elseStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 212;
			this.match(JackParser.ELSE);
			this.state = 213;
			this.match(JackParser.LBRACE);
			this.state = 214;
			this.statements();
			this.state = 215;
			this.rBrace();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public whileStatement(): WhileStatementContext {
		let _localctx: WhileStatementContext = new WhileStatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 52, JackParser.RULE_whileStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 217;
			this.match(JackParser.WHILE);
			this.state = 218;
			this.match(JackParser.LPAREN);
			this.state = 219;
			this.expression(0);
			this.state = 220;
			this.match(JackParser.RPAREN);
			this.state = 221;
			this.match(JackParser.LBRACE);
			this.state = 222;
			this.statements();
			this.state = 223;
			this.rBrace();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public doStatement(): DoStatementContext {
		let _localctx: DoStatementContext = new DoStatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 54, JackParser.RULE_doStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 225;
			this.match(JackParser.DO);
			this.state = 226;
			this.subroutineCall();
			this.state = 227;
			this.match(JackParser.SEMICOLON);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public subroutineCall(): SubroutineCallContext {
		let _localctx: SubroutineCallContext = new SubroutineCallContext(this._ctx, this.state);
		this.enterRule(_localctx, 56, JackParser.RULE_subroutineCall);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 229;
			this.subroutineId();
			this.state = 230;
			this.match(JackParser.LPAREN);
			this.state = 231;
			this.expressionList();
			this.state = 232;
			this.match(JackParser.RPAREN);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public subroutineId(): SubroutineIdContext {
		let _localctx: SubroutineIdContext = new SubroutineIdContext(this._ctx, this.state);
		this.enterRule(_localctx, 58, JackParser.RULE_subroutineId);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 239;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 13, this._ctx) ) {
			case 1:
				{
				this.state = 236;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case JackParser.IDENTIFIER:
					{
					this.state = 234;
					this.className();
					}
					break;
				case JackParser.THIS_LITERAL:
					{
					this.state = 235;
					this.match(JackParser.THIS_LITERAL);
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 238;
				this.match(JackParser.DOT);
				}
				break;
			}
			this.state = 241;
			this.subroutineName();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public returnStatement(): ReturnStatementContext {
		let _localctx: ReturnStatementContext = new ReturnStatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 60, JackParser.RULE_returnStatement);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 243;
			this.match(JackParser.RETURN);
			this.state = 245;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (((((_la - 20)) & ~0x1F) === 0 && ((1 << (_la - 20)) & ((1 << (JackParser.LPAREN - 20)) | (1 << (JackParser.MINUS - 20)) | (1 << (JackParser.TILDE - 20)) | (1 << (JackParser.INTEGER_LITERAL - 20)) | (1 << (JackParser.BOOLEAN_LITERAL - 20)) | (1 << (JackParser.NULL_LITERAL - 20)) | (1 << (JackParser.THIS_LITERAL - 20)) | (1 << (JackParser.IDENTIFIER - 20)) | (1 << (JackParser.STRING_LITERAL - 20)))) !== 0)) {
				{
				this.state = 244;
				this.expression(0);
				}
			}

			this.state = 247;
			this.match(JackParser.SEMICOLON);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public expressionList(): ExpressionListContext {
		let _localctx: ExpressionListContext = new ExpressionListContext(this._ctx, this.state);
		this.enterRule(_localctx, 62, JackParser.RULE_expressionList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 257;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (((((_la - 20)) & ~0x1F) === 0 && ((1 << (_la - 20)) & ((1 << (JackParser.LPAREN - 20)) | (1 << (JackParser.MINUS - 20)) | (1 << (JackParser.TILDE - 20)) | (1 << (JackParser.INTEGER_LITERAL - 20)) | (1 << (JackParser.BOOLEAN_LITERAL - 20)) | (1 << (JackParser.NULL_LITERAL - 20)) | (1 << (JackParser.THIS_LITERAL - 20)) | (1 << (JackParser.IDENTIFIER - 20)) | (1 << (JackParser.STRING_LITERAL - 20)))) !== 0)) {
				{
				this.state = 249;
				this.expression(0);
				this.state = 254;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === JackParser.COMMA) {
					{
					{
					this.state = 250;
					this.match(JackParser.COMMA);
					this.state = 251;
					this.expression(0);
					}
					}
					this.state = 256;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public expression(): ExpressionContext;
	public expression(_p: number): ExpressionContext;
	// @RuleVersion(0)
	public expression(_p?: number): ExpressionContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let _localctx: ExpressionContext = new ExpressionContext(this._ctx, _parentState);
		let _prevctx: ExpressionContext = _localctx;
		let _startState: number = 64;
		this.enterRecursionRule(_localctx, 64, JackParser.RULE_expression, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 266;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 17, this._ctx) ) {
			case 1:
				{
				this.state = 260;
				this.constant();
				}
				break;

			case 2:
				{
				this.state = 261;
				this.varName();
				}
				break;

			case 3:
				{
				this.state = 262;
				this.subroutineCall();
				}
				break;

			case 4:
				{
				this.state = 263;
				this.arrayAccess();
				}
				break;

			case 5:
				{
				this.state = 264;
				this.unaryOperation();
				}
				break;

			case 6:
				{
				this.state = 265;
				this.groupedExpression();
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 274;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 18, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					{
					_localctx = new ExpressionContext(_parentctx, _parentState);
					this.pushNewRecursionContext(_localctx, _startState, JackParser.RULE_expression);
					this.state = 268;
					if (!(this.precpred(this._ctx, 7))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 7)");
					}
					this.state = 269;
					this.binaryOperator();
					this.state = 270;
					this.expression(8);
					}
					}
				}
				this.state = 276;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 18, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public groupedExpression(): GroupedExpressionContext {
		let _localctx: GroupedExpressionContext = new GroupedExpressionContext(this._ctx, this.state);
		this.enterRule(_localctx, 66, JackParser.RULE_groupedExpression);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 277;
			this.match(JackParser.LPAREN);
			this.state = 278;
			this.expression(0);
			this.state = 279;
			this.match(JackParser.RPAREN);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public unaryOperation(): UnaryOperationContext {
		let _localctx: UnaryOperationContext = new UnaryOperationContext(this._ctx, this.state);
		this.enterRule(_localctx, 68, JackParser.RULE_unaryOperation);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 281;
			this.unaryOperator();
			this.state = 282;
			this.expression(0);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public arrayAccess(): ArrayAccessContext {
		let _localctx: ArrayAccessContext = new ArrayAccessContext(this._ctx, this.state);
		this.enterRule(_localctx, 70, JackParser.RULE_arrayAccess);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 284;
			this.varName();
			this.state = 285;
			this.match(JackParser.LBRACKET);
			this.state = 286;
			this.expression(0);
			this.state = 287;
			this.match(JackParser.RBRACKET);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public constant(): ConstantContext {
		let _localctx: ConstantContext = new ConstantContext(this._ctx, this.state);
		this.enterRule(_localctx, 72, JackParser.RULE_constant);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 289;
			_la = this._input.LA(1);
			if (!(((((_la - 40)) & ~0x1F) === 0 && ((1 << (_la - 40)) & ((1 << (JackParser.INTEGER_LITERAL - 40)) | (1 << (JackParser.BOOLEAN_LITERAL - 40)) | (1 << (JackParser.NULL_LITERAL - 40)) | (1 << (JackParser.THIS_LITERAL - 40)) | (1 << (JackParser.STRING_LITERAL - 40)))) !== 0))) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public unaryOperator(): UnaryOperatorContext {
		let _localctx: UnaryOperatorContext = new UnaryOperatorContext(this._ctx, this.state);
		this.enterRule(_localctx, 74, JackParser.RULE_unaryOperator);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 291;
			_la = this._input.LA(1);
			if (!(_la === JackParser.MINUS || _la === JackParser.TILDE)) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public binaryOperator(): BinaryOperatorContext {
		let _localctx: BinaryOperatorContext = new BinaryOperatorContext(this._ctx, this.state);
		this.enterRule(_localctx, 76, JackParser.RULE_binaryOperator);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 293;
			_la = this._input.LA(1);
			if (!(((((_la - 27)) & ~0x1F) === 0 && ((1 << (_la - 27)) & ((1 << (JackParser.EQUALS - 27)) | (1 << (JackParser.PLUS - 27)) | (1 << (JackParser.MINUS - 27)) | (1 << (JackParser.MUL - 27)) | (1 << (JackParser.DIV - 27)) | (1 << (JackParser.AND - 27)) | (1 << (JackParser.OR - 27)) | (1 << (JackParser.LESS_THAN - 27)) | (1 << (JackParser.GREATER_THAN - 27)))) !== 0))) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public override sempred(_localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 32:
			return this.expression_sempred(_localctx as ExpressionContext, predIndex);
		}
		return true;
	}
	private expression_sempred(_localctx: ExpressionContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 7);
		}
		return true;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x030\u012A\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
		"\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t\x17\x04" +
		"\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B\t\x1B\x04\x1C\t\x1C\x04" +
		"\x1D\t\x1D\x04\x1E\t\x1E\x04\x1F\t\x1F\x04 \t \x04!\t!\x04\"\t\"\x04#" +
		"\t#\x04$\t$\x04%\t%\x04&\t&\x04\'\t\'\x04(\t(\x03\x02\x03\x02\x03\x02" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x07\x03X\n\x03\f\x03\x0E\x03[\v\x03\x03" +
		"\x03\x07\x03^\n\x03\f\x03\x0E\x03a\v\x03\x03\x03\x03\x03\x03\x04\x03\x04" +
		"\x03\x05\x03\x05\x03\x05\x03\x05\x03\x06\x03\x06\x03\x06\x03\x06\x07\x06" +
		"o\n\x06\f\x06\x0E\x06r\v\x06\x03\x07\x03\x07\x03\b\x03\b\x03\b\x03\t\x03" +
		"\t\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\v\x03\v\x03\f\x03\f\x05" +
		"\f\x86\n\f\x03\r\x03\r\x03\x0E\x03\x0E\x03\x0E\x07\x0E\x8D\n\x0E\f\x0E" +
		"\x0E\x0E\x90\v\x0E\x05\x0E\x92\n\x0E\x03\x0F\x03\x0F\x03\x0F\x03\x10\x03" +
		"\x10\x03\x11\x03\x11\x07\x11\x9B\n\x11\f\x11\x0E\x11\x9E\v\x11\x03\x11" +
		"\x03\x11\x03\x11\x03\x12\x03\x12\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13" +
		"\x07\x13\xAA\n\x13\f\x13\x0E\x13\xAD\v\x13\x03\x13\x03\x13\x03\x14\x03" +
		"\x14\x03\x15\x03\x15\x03\x16\x07\x16\xB6\n\x16\f\x16\x0E\x16\xB9\v\x16" +
		"\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x05\x17\xC0\n\x17\x03\x18\x03" +
		"\x18\x03\x18\x05\x18\xC5\n\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x19" +
		"\x03\x19\x05\x19\xCD\n\x19\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03" +
		"\x1A\x03\x1A\x03\x1A\x03\x1B\x03\x1B\x03\x1B\x03\x1B\x03\x1B\x03\x1C\x03" +
		"\x1C\x03\x1C\x03\x1C\x03\x1C\x03\x1C\x03\x1C\x03\x1C\x03\x1D\x03\x1D\x03" +
		"\x1D\x03\x1D\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x03\x1F\x03\x1F\x05" +
		"\x1F\xEF\n\x1F\x03\x1F\x05\x1F\xF2\n\x1F\x03\x1F\x03\x1F\x03 \x03 \x05" +
		" \xF8\n \x03 \x03 \x03!\x03!\x03!\x07!\xFF\n!\f!\x0E!\u0102\v!\x05!\u0104" +
		"\n!\x03\"\x03\"\x03\"\x03\"\x03\"\x03\"\x03\"\x05\"\u010D\n\"\x03\"\x03" +
		"\"\x03\"\x03\"\x07\"\u0113\n\"\f\"\x0E\"\u0116\v\"\x03#\x03#\x03#\x03" +
		"#\x03$\x03$\x03$\x03%\x03%\x03%\x03%\x03%\x03&\x03&\x03\'\x03\'\x03(\x03" +
		"(\x03(\x02\x02\x03B)\x02\x02\x04\x02\x06\x02\b\x02\n\x02\f\x02\x0E\x02" +
		"\x10\x02\x12\x02\x14\x02\x16\x02\x18\x02\x1A\x02\x1C\x02\x1E\x02 \x02" +
		"\"\x02$\x02&\x02(\x02*\x02,\x02.\x020\x022\x024\x026\x028\x02:\x02<\x02" +
		">\x02@\x02B\x02D\x02F\x02H\x02J\x02L\x02N\x02\x02\b\x03\x02\x07\b\x03" +
		"\x02\x04\x06\x04\x02\n\f..\x04\x02*-//\x04\x02\x1F\x1F$$\x04\x02\x1D#" +
		"%&\x02\u011C\x02P\x03\x02\x02\x02\x04S\x03\x02\x02\x02\x06d\x03\x02\x02" +
		"\x02\bf\x03\x02\x02\x02\nj\x03\x02\x02\x02\fs\x03\x02\x02\x02\x0Eu\x03" +
		"\x02\x02\x02\x10x\x03\x02\x02\x02\x12z\x03\x02\x02\x02\x14\x81\x03\x02" +
		"\x02\x02\x16\x85\x03\x02\x02\x02\x18\x87\x03\x02\x02\x02\x1A\x91\x03\x02" +
		"\x02\x02\x1C\x93\x03\x02\x02\x02\x1E\x96\x03\x02\x02\x02 \x98\x03\x02" +
		"\x02\x02\"\xA2\x03\x02\x02\x02$\xA4\x03\x02\x02\x02&\xB0\x03\x02\x02\x02" +
		"(\xB2\x03\x02\x02\x02*\xB7\x03\x02\x02\x02,\xBF\x03\x02\x02\x02.\xC1\x03" +
		"\x02\x02\x020\xCA\x03\x02\x02\x022\xCE\x03\x02\x02\x024\xD6\x03\x02\x02" +
		"\x026\xDB\x03\x02\x02\x028\xE3\x03\x02\x02\x02:\xE7\x03\x02\x02\x02<\xF1" +
		"\x03\x02\x02\x02>\xF5\x03\x02\x02\x02@\u0103\x03\x02\x02\x02B\u010C\x03" +
		"\x02\x02\x02D\u0117\x03\x02\x02\x02F\u011B\x03\x02\x02\x02H\u011E\x03" +
		"\x02\x02\x02J\u0123\x03\x02\x02\x02L\u0125\x03\x02\x02\x02N\u0127\x03" +
		"\x02\x02\x02PQ\x05\x04\x03\x02QR\x07\x02\x02\x03R\x03\x03\x02\x02\x02" +
		"ST\x07\x03\x02\x02TU\x05\x06\x04\x02UY\x07\x14\x02\x02VX\x05\b\x05\x02" +
		"WV\x03\x02\x02\x02X[\x03\x02\x02\x02YW\x03\x02\x02\x02YZ\x03\x02\x02\x02" +
		"Z_\x03\x02\x02\x02[Y\x03\x02\x02\x02\\^\x05\x0E\b\x02]\\\x03\x02\x02\x02" +
		"^a\x03\x02\x02\x02_]\x03\x02\x02\x02_`\x03\x02\x02\x02`b\x03\x02\x02\x02" +
		"a_\x03\x02\x02\x02bc\x05\"\x12\x02c\x05\x03\x02\x02\x02de\x07.\x02\x02" +
		"e\x07\x03\x02\x02\x02fg\t\x02\x02\x02gh\x05\n\x06\x02hi\x07\x1C\x02\x02" +
		"i\t\x03\x02\x02\x02jk\x05\x18\r\x02kp\x05\f\x07\x02lm\x07\x1B\x02\x02" +
		"mo\x05\f\x07\x02nl\x03\x02\x02\x02or\x03\x02\x02\x02pn\x03\x02\x02\x02" +
		"pq\x03\x02\x02\x02q\v\x03\x02\x02\x02rp\x03\x02\x02\x02st\x07.\x02\x02" +
		"t\r\x03\x02\x02\x02uv\x05\x10\t\x02vw\x05\x12\n\x02w\x0F\x03\x02\x02\x02" +
		"xy\t\x03\x02\x02y\x11\x03\x02\x02\x02z{\x05\x16\f\x02{|\x05\x14\v\x02" +
		"|}\x07\x16\x02\x02}~\x05\x1A\x0E\x02~\x7F\x07\x17\x02\x02\x7F\x80\x05" +
		" \x11\x02\x80\x13\x03\x02\x02\x02\x81\x82\x07.\x02\x02\x82\x15\x03\x02" +
		"\x02\x02\x83\x86\x05\x18\r\x02\x84\x86\x07\r\x02\x02\x85\x83\x03\x02\x02" +
		"\x02\x85\x84\x03\x02\x02\x02\x86\x17\x03\x02\x02\x02\x87\x88\t\x04\x02" +
		"\x02\x88\x19\x03\x02\x02\x02\x89\x8E\x05\x1C\x0F\x02\x8A\x8B\x07\x1B\x02" +
		"\x02\x8B\x8D\x05\x1C\x0F\x02\x8C\x8A\x03\x02\x02\x02\x8D\x90\x03\x02\x02" +
		"\x02\x8E\x8C\x03\x02\x02\x02\x8E\x8F\x03\x02\x02\x02\x8F\x92\x03\x02\x02" +
		"\x02\x90\x8E\x03\x02\x02\x02\x91\x89\x03\x02\x02\x02\x91\x92\x03\x02\x02" +
		"\x02\x92\x1B\x03\x02\x02\x02\x93\x94\x05\x18\r\x02\x94\x95\x05\x1E\x10" +
		"\x02\x95\x1D\x03\x02\x02\x02\x96\x97\x07.\x02\x02\x97\x1F\x03\x02\x02" +
		"\x02\x98\x9C\x07\x14\x02\x02\x99\x9B\x05$\x13\x02\x9A\x99\x03\x02\x02" +
		"\x02\x9B\x9E\x03\x02\x02\x02\x9C\x9A\x03\x02\x02\x02\x9C\x9D\x03\x02\x02" +
		"\x02\x9D\x9F\x03\x02\x02\x02\x9E\x9C\x03\x02\x02\x02\x9F\xA0\x05*\x16" +
		"\x02\xA0\xA1\x05\"\x12\x02\xA1!\x03\x02\x02\x02\xA2\xA3\x07\x15\x02\x02" +
		"\xA3#\x03\x02\x02\x02\xA4\xA5\x07\t\x02\x02\xA5\xA6\x05\x18\r\x02\xA6" +
		"\xAB\x05&\x14\x02\xA7\xA8\x07\x1B\x02\x02\xA8\xAA\x05&\x14\x02\xA9\xA7" +
		"\x03\x02\x02\x02\xAA\xAD\x03\x02\x02\x02\xAB\xA9\x03\x02\x02\x02\xAB\xAC" +
		"\x03\x02\x02\x02\xAC\xAE\x03\x02\x02\x02\xAD\xAB\x03\x02\x02\x02\xAE\xAF" +
		"\x07\x1C\x02\x02\xAF%\x03\x02\x02\x02\xB0\xB1\x07.\x02\x02\xB1\'\x03\x02" +
		"\x02\x02\xB2\xB3\x07.\x02\x02\xB3)\x03\x02\x02\x02\xB4\xB6\x05,\x17\x02" +
		"\xB5\xB4\x03\x02\x02\x02\xB6\xB9\x03\x02\x02\x02\xB7\xB5\x03\x02\x02\x02" +
		"\xB7\xB8\x03\x02\x02\x02\xB8+\x03\x02\x02\x02\xB9\xB7\x03\x02\x02\x02" +
		"\xBA\xC0\x05.\x18\x02\xBB\xC0\x050\x19\x02\xBC\xC0\x056\x1C\x02\xBD\xC0" +
		"\x058\x1D\x02\xBE\xC0\x05> \x02\xBF\xBA\x03\x02\x02\x02\xBF\xBB\x03\x02" +
		"\x02\x02\xBF\xBC\x03\x02\x02\x02\xBF\xBD\x03\x02\x02\x02\xBF\xBE\x03\x02" +
		"\x02\x02\xC0-\x03\x02\x02\x02\xC1\xC4\x07\x0E\x02\x02\xC2\xC5\x05(\x15" +
		"\x02\xC3\xC5\x05H%\x02\xC4\xC2\x03\x02\x02\x02\xC4\xC3\x03\x02\x02\x02" +
		"\xC5\xC6\x03\x02\x02\x02\xC6\xC7\x07\x1D\x02\x02\xC7\xC8\x05B\"\x02\xC8" +
		"\xC9\x07\x1C\x02\x02\xC9/\x03\x02\x02\x02\xCA\xCC\x052\x1A\x02\xCB\xCD" +
		"\x054\x1B\x02\xCC\xCB\x03\x02\x02\x02\xCC\xCD\x03\x02\x02\x02\xCD1\x03" +
		"\x02\x02\x02\xCE\xCF\x07\x10\x02\x02\xCF\xD0\x07\x16\x02\x02\xD0\xD1\x05" +
		"B\"\x02\xD1\xD2\x07\x17\x02\x02\xD2\xD3\x07\x14\x02\x02\xD3\xD4\x05*\x16" +
		"\x02\xD4\xD5\x05\"\x12\x02\xD53\x03\x02\x02\x02\xD6\xD7\x07\x11\x02\x02" +
		"\xD7\xD8\x07\x14\x02\x02\xD8\xD9\x05*\x16\x02\xD9\xDA\x05\"\x12\x02\xDA" +
		"5\x03\x02\x02\x02\xDB\xDC\x07\x12\x02\x02\xDC\xDD\x07\x16\x02\x02\xDD" +
		"\xDE\x05B\"\x02\xDE\xDF\x07\x17\x02\x02\xDF\xE0\x07\x14\x02\x02\xE0\xE1" +
		"\x05*\x16\x02\xE1\xE2\x05\"\x12\x02\xE27\x03\x02\x02\x02\xE3\xE4\x07\x0F" +
		"\x02\x02\xE4\xE5\x05:\x1E\x02\xE5\xE6\x07\x1C\x02\x02\xE69\x03\x02\x02" +
		"\x02\xE7\xE8\x05<\x1F\x02\xE8\xE9\x07\x16\x02\x02\xE9\xEA\x05@!\x02\xEA" +
		"\xEB\x07\x17\x02\x02\xEB;\x03\x02\x02\x02\xEC\xEF\x05\x06\x04\x02\xED" +
		"\xEF\x07-\x02\x02\xEE\xEC\x03\x02\x02\x02\xEE\xED\x03\x02\x02\x02\xEF" +
		"\xF0\x03\x02\x02\x02\xF0\xF2\x07\x1A\x02\x02\xF1\xEE\x03\x02\x02\x02\xF1" +
		"\xF2\x03\x02\x02\x02\xF2\xF3\x03\x02\x02\x02\xF3\xF4\x05\x14\v\x02\xF4" +
		"=\x03\x02\x02\x02\xF5\xF7\x07\x13\x02\x02\xF6\xF8\x05B\"\x02\xF7\xF6\x03" +
		"\x02\x02\x02\xF7\xF8\x03\x02\x02\x02\xF8\xF9\x03\x02\x02\x02\xF9\xFA\x07" +
		"\x1C\x02\x02\xFA?\x03\x02\x02\x02\xFB\u0100\x05B\"\x02\xFC\xFD\x07\x1B" +
		"\x02\x02\xFD\xFF\x05B\"\x02\xFE\xFC\x03\x02\x02\x02\xFF\u0102\x03\x02" +
		"\x02\x02\u0100\xFE\x03\x02\x02\x02\u0100\u0101\x03\x02\x02\x02\u0101\u0104" +
		"\x03\x02\x02\x02\u0102\u0100\x03\x02\x02\x02\u0103\xFB\x03\x02\x02\x02" +
		"\u0103\u0104\x03\x02\x02\x02\u0104A\x03\x02\x02\x02\u0105\u0106\b\"\x01" +
		"\x02\u0106\u010D\x05J&\x02\u0107\u010D\x05(\x15\x02\u0108\u010D\x05:\x1E" +
		"\x02\u0109\u010D\x05H%\x02\u010A\u010D\x05F$\x02\u010B\u010D\x05D#\x02" +
		"\u010C\u0105\x03\x02\x02\x02\u010C\u0107\x03\x02\x02\x02\u010C\u0108\x03" +
		"\x02\x02\x02\u010C\u0109\x03\x02\x02\x02\u010C\u010A\x03\x02\x02\x02\u010C" +
		"\u010B\x03\x02\x02\x02\u010D\u0114\x03\x02\x02\x02\u010E\u010F\f\t\x02" +
		"\x02\u010F\u0110\x05N(\x02\u0110\u0111\x05B\"\n\u0111\u0113\x03\x02\x02" +
		"\x02\u0112\u010E\x03\x02\x02\x02\u0113\u0116\x03\x02\x02\x02\u0114\u0112" +
		"\x03\x02\x02\x02\u0114\u0115\x03\x02\x02\x02\u0115C\x03\x02\x02\x02\u0116" +
		"\u0114\x03\x02\x02\x02\u0117\u0118\x07\x16\x02\x02\u0118\u0119\x05B\"" +
		"\x02\u0119\u011A\x07\x17\x02\x02\u011AE\x03\x02\x02\x02\u011B\u011C\x05" +
		"L\'\x02\u011C\u011D\x05B\"\x02\u011DG\x03\x02\x02\x02\u011E\u011F\x05" +
		"(\x15\x02\u011F\u0120\x07\x18\x02\x02\u0120\u0121\x05B\"\x02\u0121\u0122" +
		"\x07\x19\x02\x02\u0122I\x03\x02\x02\x02\u0123\u0124\t\x05\x02\x02\u0124" +
		"K\x03\x02\x02\x02\u0125\u0126\t\x06\x02\x02\u0126M\x03\x02\x02\x02\u0127" +
		"\u0128\t\x07\x02\x02\u0128O\x03\x02\x02\x02\x15Y_p\x85\x8E\x91\x9C\xAB" +
		"\xB7\xBF\xC4\xCC\xEE\xF1\xF7\u0100\u0103\u010C\u0114";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!JackParser.__ATN) {
			JackParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(JackParser._serializedATN));
		}

		return JackParser.__ATN;
	}

}

export class ProgramContext extends ParserRuleContext {
	public classDeclaration(): ClassDeclarationContext {
		return this.getRuleContext(0, ClassDeclarationContext);
	}
	public EOF(): TerminalNode { return this.getToken(JackParser.EOF, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_program; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterProgram) {
			listener.enterProgram(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitProgram) {
			listener.exitProgram(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitProgram) {
			return visitor.visitProgram(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ClassDeclarationContext extends ParserRuleContext {
	public CLASS(): TerminalNode { return this.getToken(JackParser.CLASS, 0); }
	public className(): ClassNameContext {
		return this.getRuleContext(0, ClassNameContext);
	}
	public LBRACE(): TerminalNode { return this.getToken(JackParser.LBRACE, 0); }
	public rBrace(): RBraceContext {
		return this.getRuleContext(0, RBraceContext);
	}
	public classVarDec(): ClassVarDecContext[];
	public classVarDec(i: number): ClassVarDecContext;
	public classVarDec(i?: number): ClassVarDecContext | ClassVarDecContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ClassVarDecContext);
		} else {
			return this.getRuleContext(i, ClassVarDecContext);
		}
	}
	public subroutineDeclaration(): SubroutineDeclarationContext[];
	public subroutineDeclaration(i: number): SubroutineDeclarationContext;
	public subroutineDeclaration(i?: number): SubroutineDeclarationContext | SubroutineDeclarationContext[] {
		if (i === undefined) {
			return this.getRuleContexts(SubroutineDeclarationContext);
		} else {
			return this.getRuleContext(i, SubroutineDeclarationContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_classDeclaration; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterClassDeclaration) {
			listener.enterClassDeclaration(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitClassDeclaration) {
			listener.exitClassDeclaration(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitClassDeclaration) {
			return visitor.visitClassDeclaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ClassNameContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(JackParser.IDENTIFIER, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_className; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterClassName) {
			listener.enterClassName(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitClassName) {
			listener.exitClassName(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitClassName) {
			return visitor.visitClassName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ClassVarDecContext extends ParserRuleContext {
	public fieldList(): FieldListContext {
		return this.getRuleContext(0, FieldListContext);
	}
	public SEMICOLON(): TerminalNode { return this.getToken(JackParser.SEMICOLON, 0); }
	public STATIC(): TerminalNode | undefined { return this.tryGetToken(JackParser.STATIC, 0); }
	public FIELD(): TerminalNode | undefined { return this.tryGetToken(JackParser.FIELD, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_classVarDec; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterClassVarDec) {
			listener.enterClassVarDec(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitClassVarDec) {
			listener.exitClassVarDec(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitClassVarDec) {
			return visitor.visitClassVarDec(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FieldListContext extends ParserRuleContext {
	public varType(): VarTypeContext {
		return this.getRuleContext(0, VarTypeContext);
	}
	public fieldName(): FieldNameContext[];
	public fieldName(i: number): FieldNameContext;
	public fieldName(i?: number): FieldNameContext | FieldNameContext[] {
		if (i === undefined) {
			return this.getRuleContexts(FieldNameContext);
		} else {
			return this.getRuleContext(i, FieldNameContext);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(JackParser.COMMA);
		} else {
			return this.getToken(JackParser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_fieldList; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterFieldList) {
			listener.enterFieldList(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitFieldList) {
			listener.exitFieldList(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitFieldList) {
			return visitor.visitFieldList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FieldNameContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(JackParser.IDENTIFIER, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_fieldName; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterFieldName) {
			listener.enterFieldName(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitFieldName) {
			listener.exitFieldName(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitFieldName) {
			return visitor.visitFieldName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SubroutineDeclarationContext extends ParserRuleContext {
	public subroutineType(): SubroutineTypeContext {
		return this.getRuleContext(0, SubroutineTypeContext);
	}
	public subroutineDecWithoutType(): SubroutineDecWithoutTypeContext {
		return this.getRuleContext(0, SubroutineDecWithoutTypeContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_subroutineDeclaration; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterSubroutineDeclaration) {
			listener.enterSubroutineDeclaration(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitSubroutineDeclaration) {
			listener.exitSubroutineDeclaration(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitSubroutineDeclaration) {
			return visitor.visitSubroutineDeclaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SubroutineTypeContext extends ParserRuleContext {
	public CONSTRUCTOR(): TerminalNode | undefined { return this.tryGetToken(JackParser.CONSTRUCTOR, 0); }
	public METHOD(): TerminalNode | undefined { return this.tryGetToken(JackParser.METHOD, 0); }
	public FUNCTION(): TerminalNode | undefined { return this.tryGetToken(JackParser.FUNCTION, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_subroutineType; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterSubroutineType) {
			listener.enterSubroutineType(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitSubroutineType) {
			listener.exitSubroutineType(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitSubroutineType) {
			return visitor.visitSubroutineType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SubroutineDecWithoutTypeContext extends ParserRuleContext {
	public subroutineReturnType(): SubroutineReturnTypeContext {
		return this.getRuleContext(0, SubroutineReturnTypeContext);
	}
	public subroutineName(): SubroutineNameContext {
		return this.getRuleContext(0, SubroutineNameContext);
	}
	public LPAREN(): TerminalNode { return this.getToken(JackParser.LPAREN, 0); }
	public parameterList(): ParameterListContext {
		return this.getRuleContext(0, ParameterListContext);
	}
	public RPAREN(): TerminalNode { return this.getToken(JackParser.RPAREN, 0); }
	public subroutineBody(): SubroutineBodyContext {
		return this.getRuleContext(0, SubroutineBodyContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_subroutineDecWithoutType; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterSubroutineDecWithoutType) {
			listener.enterSubroutineDecWithoutType(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitSubroutineDecWithoutType) {
			listener.exitSubroutineDecWithoutType(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitSubroutineDecWithoutType) {
			return visitor.visitSubroutineDecWithoutType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SubroutineNameContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(JackParser.IDENTIFIER, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_subroutineName; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterSubroutineName) {
			listener.enterSubroutineName(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitSubroutineName) {
			listener.exitSubroutineName(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitSubroutineName) {
			return visitor.visitSubroutineName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SubroutineReturnTypeContext extends ParserRuleContext {
	public varType(): VarTypeContext | undefined {
		return this.tryGetRuleContext(0, VarTypeContext);
	}
	public VOID(): TerminalNode | undefined { return this.tryGetToken(JackParser.VOID, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_subroutineReturnType; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterSubroutineReturnType) {
			listener.enterSubroutineReturnType(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitSubroutineReturnType) {
			listener.exitSubroutineReturnType(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitSubroutineReturnType) {
			return visitor.visitSubroutineReturnType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class VarTypeContext extends ParserRuleContext {
	public INT(): TerminalNode | undefined { return this.tryGetToken(JackParser.INT, 0); }
	public CHAR(): TerminalNode | undefined { return this.tryGetToken(JackParser.CHAR, 0); }
	public BOOLEAN(): TerminalNode | undefined { return this.tryGetToken(JackParser.BOOLEAN, 0); }
	public IDENTIFIER(): TerminalNode | undefined { return this.tryGetToken(JackParser.IDENTIFIER, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_varType; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterVarType) {
			listener.enterVarType(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitVarType) {
			listener.exitVarType(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitVarType) {
			return visitor.visitVarType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ParameterListContext extends ParserRuleContext {
	public parameter(): ParameterContext[];
	public parameter(i: number): ParameterContext;
	public parameter(i?: number): ParameterContext | ParameterContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ParameterContext);
		} else {
			return this.getRuleContext(i, ParameterContext);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(JackParser.COMMA);
		} else {
			return this.getToken(JackParser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_parameterList; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterParameterList) {
			listener.enterParameterList(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitParameterList) {
			listener.exitParameterList(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitParameterList) {
			return visitor.visitParameterList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ParameterContext extends ParserRuleContext {
	public varType(): VarTypeContext {
		return this.getRuleContext(0, VarTypeContext);
	}
	public parameterName(): ParameterNameContext {
		return this.getRuleContext(0, ParameterNameContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_parameter; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterParameter) {
			listener.enterParameter(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitParameter) {
			listener.exitParameter(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitParameter) {
			return visitor.visitParameter(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ParameterNameContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(JackParser.IDENTIFIER, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_parameterName; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterParameterName) {
			listener.enterParameterName(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitParameterName) {
			listener.exitParameterName(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitParameterName) {
			return visitor.visitParameterName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SubroutineBodyContext extends ParserRuleContext {
	public LBRACE(): TerminalNode { return this.getToken(JackParser.LBRACE, 0); }
	public statements(): StatementsContext {
		return this.getRuleContext(0, StatementsContext);
	}
	public rBrace(): RBraceContext {
		return this.getRuleContext(0, RBraceContext);
	}
	public varDeclaration(): VarDeclarationContext[];
	public varDeclaration(i: number): VarDeclarationContext;
	public varDeclaration(i?: number): VarDeclarationContext | VarDeclarationContext[] {
		if (i === undefined) {
			return this.getRuleContexts(VarDeclarationContext);
		} else {
			return this.getRuleContext(i, VarDeclarationContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_subroutineBody; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterSubroutineBody) {
			listener.enterSubroutineBody(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitSubroutineBody) {
			listener.exitSubroutineBody(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitSubroutineBody) {
			return visitor.visitSubroutineBody(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class RBraceContext extends ParserRuleContext {
	public RBRACE(): TerminalNode { return this.getToken(JackParser.RBRACE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_rBrace; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterRBrace) {
			listener.enterRBrace(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitRBrace) {
			listener.exitRBrace(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitRBrace) {
			return visitor.visitRBrace(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class VarDeclarationContext extends ParserRuleContext {
	public VAR(): TerminalNode { return this.getToken(JackParser.VAR, 0); }
	public varType(): VarTypeContext {
		return this.getRuleContext(0, VarTypeContext);
	}
	public varNameInDeclaration(): VarNameInDeclarationContext[];
	public varNameInDeclaration(i: number): VarNameInDeclarationContext;
	public varNameInDeclaration(i?: number): VarNameInDeclarationContext | VarNameInDeclarationContext[] {
		if (i === undefined) {
			return this.getRuleContexts(VarNameInDeclarationContext);
		} else {
			return this.getRuleContext(i, VarNameInDeclarationContext);
		}
	}
	public SEMICOLON(): TerminalNode { return this.getToken(JackParser.SEMICOLON, 0); }
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(JackParser.COMMA);
		} else {
			return this.getToken(JackParser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_varDeclaration; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterVarDeclaration) {
			listener.enterVarDeclaration(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitVarDeclaration) {
			listener.exitVarDeclaration(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitVarDeclaration) {
			return visitor.visitVarDeclaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class VarNameInDeclarationContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(JackParser.IDENTIFIER, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_varNameInDeclaration; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterVarNameInDeclaration) {
			listener.enterVarNameInDeclaration(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitVarNameInDeclaration) {
			listener.exitVarNameInDeclaration(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitVarNameInDeclaration) {
			return visitor.visitVarNameInDeclaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class VarNameContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(JackParser.IDENTIFIER, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_varName; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterVarName) {
			listener.enterVarName(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitVarName) {
			listener.exitVarName(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitVarName) {
			return visitor.visitVarName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StatementsContext extends ParserRuleContext {
	public statement(): StatementContext[];
	public statement(i: number): StatementContext;
	public statement(i?: number): StatementContext | StatementContext[] {
		if (i === undefined) {
			return this.getRuleContexts(StatementContext);
		} else {
			return this.getRuleContext(i, StatementContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_statements; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterStatements) {
			listener.enterStatements(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitStatements) {
			listener.exitStatements(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitStatements) {
			return visitor.visitStatements(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StatementContext extends ParserRuleContext {
	public letStatement(): LetStatementContext | undefined {
		return this.tryGetRuleContext(0, LetStatementContext);
	}
	public ifElseStatement(): IfElseStatementContext | undefined {
		return this.tryGetRuleContext(0, IfElseStatementContext);
	}
	public whileStatement(): WhileStatementContext | undefined {
		return this.tryGetRuleContext(0, WhileStatementContext);
	}
	public doStatement(): DoStatementContext | undefined {
		return this.tryGetRuleContext(0, DoStatementContext);
	}
	public returnStatement(): ReturnStatementContext | undefined {
		return this.tryGetRuleContext(0, ReturnStatementContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_statement; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterStatement) {
			listener.enterStatement(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitStatement) {
			listener.exitStatement(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitStatement) {
			return visitor.visitStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class LetStatementContext extends ParserRuleContext {
	public LET(): TerminalNode { return this.getToken(JackParser.LET, 0); }
	public EQUALS(): TerminalNode { return this.getToken(JackParser.EQUALS, 0); }
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	public SEMICOLON(): TerminalNode { return this.getToken(JackParser.SEMICOLON, 0); }
	public varName(): VarNameContext | undefined {
		return this.tryGetRuleContext(0, VarNameContext);
	}
	public arrayAccess(): ArrayAccessContext | undefined {
		return this.tryGetRuleContext(0, ArrayAccessContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_letStatement; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterLetStatement) {
			listener.enterLetStatement(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitLetStatement) {
			listener.exitLetStatement(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitLetStatement) {
			return visitor.visitLetStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class IfElseStatementContext extends ParserRuleContext {
	public ifStatement(): IfStatementContext {
		return this.getRuleContext(0, IfStatementContext);
	}
	public elseStatement(): ElseStatementContext | undefined {
		return this.tryGetRuleContext(0, ElseStatementContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_ifElseStatement; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterIfElseStatement) {
			listener.enterIfElseStatement(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitIfElseStatement) {
			listener.exitIfElseStatement(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitIfElseStatement) {
			return visitor.visitIfElseStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class IfStatementContext extends ParserRuleContext {
	public IF(): TerminalNode { return this.getToken(JackParser.IF, 0); }
	public LPAREN(): TerminalNode { return this.getToken(JackParser.LPAREN, 0); }
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	public RPAREN(): TerminalNode { return this.getToken(JackParser.RPAREN, 0); }
	public LBRACE(): TerminalNode { return this.getToken(JackParser.LBRACE, 0); }
	public statements(): StatementsContext {
		return this.getRuleContext(0, StatementsContext);
	}
	public rBrace(): RBraceContext {
		return this.getRuleContext(0, RBraceContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_ifStatement; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterIfStatement) {
			listener.enterIfStatement(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitIfStatement) {
			listener.exitIfStatement(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitIfStatement) {
			return visitor.visitIfStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ElseStatementContext extends ParserRuleContext {
	public ELSE(): TerminalNode { return this.getToken(JackParser.ELSE, 0); }
	public LBRACE(): TerminalNode { return this.getToken(JackParser.LBRACE, 0); }
	public statements(): StatementsContext {
		return this.getRuleContext(0, StatementsContext);
	}
	public rBrace(): RBraceContext {
		return this.getRuleContext(0, RBraceContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_elseStatement; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterElseStatement) {
			listener.enterElseStatement(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitElseStatement) {
			listener.exitElseStatement(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitElseStatement) {
			return visitor.visitElseStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class WhileStatementContext extends ParserRuleContext {
	public WHILE(): TerminalNode { return this.getToken(JackParser.WHILE, 0); }
	public LPAREN(): TerminalNode { return this.getToken(JackParser.LPAREN, 0); }
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	public RPAREN(): TerminalNode { return this.getToken(JackParser.RPAREN, 0); }
	public LBRACE(): TerminalNode { return this.getToken(JackParser.LBRACE, 0); }
	public statements(): StatementsContext {
		return this.getRuleContext(0, StatementsContext);
	}
	public rBrace(): RBraceContext {
		return this.getRuleContext(0, RBraceContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_whileStatement; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterWhileStatement) {
			listener.enterWhileStatement(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitWhileStatement) {
			listener.exitWhileStatement(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitWhileStatement) {
			return visitor.visitWhileStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DoStatementContext extends ParserRuleContext {
	public DO(): TerminalNode { return this.getToken(JackParser.DO, 0); }
	public subroutineCall(): SubroutineCallContext {
		return this.getRuleContext(0, SubroutineCallContext);
	}
	public SEMICOLON(): TerminalNode { return this.getToken(JackParser.SEMICOLON, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_doStatement; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterDoStatement) {
			listener.enterDoStatement(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitDoStatement) {
			listener.exitDoStatement(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitDoStatement) {
			return visitor.visitDoStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SubroutineCallContext extends ParserRuleContext {
	public subroutineId(): SubroutineIdContext {
		return this.getRuleContext(0, SubroutineIdContext);
	}
	public LPAREN(): TerminalNode { return this.getToken(JackParser.LPAREN, 0); }
	public expressionList(): ExpressionListContext {
		return this.getRuleContext(0, ExpressionListContext);
	}
	public RPAREN(): TerminalNode { return this.getToken(JackParser.RPAREN, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_subroutineCall; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterSubroutineCall) {
			listener.enterSubroutineCall(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitSubroutineCall) {
			listener.exitSubroutineCall(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitSubroutineCall) {
			return visitor.visitSubroutineCall(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SubroutineIdContext extends ParserRuleContext {
	public subroutineName(): SubroutineNameContext {
		return this.getRuleContext(0, SubroutineNameContext);
	}
	public DOT(): TerminalNode | undefined { return this.tryGetToken(JackParser.DOT, 0); }
	public className(): ClassNameContext | undefined {
		return this.tryGetRuleContext(0, ClassNameContext);
	}
	public THIS_LITERAL(): TerminalNode | undefined { return this.tryGetToken(JackParser.THIS_LITERAL, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_subroutineId; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterSubroutineId) {
			listener.enterSubroutineId(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitSubroutineId) {
			listener.exitSubroutineId(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitSubroutineId) {
			return visitor.visitSubroutineId(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ReturnStatementContext extends ParserRuleContext {
	public RETURN(): TerminalNode { return this.getToken(JackParser.RETURN, 0); }
	public SEMICOLON(): TerminalNode { return this.getToken(JackParser.SEMICOLON, 0); }
	public expression(): ExpressionContext | undefined {
		return this.tryGetRuleContext(0, ExpressionContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_returnStatement; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterReturnStatement) {
			listener.enterReturnStatement(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitReturnStatement) {
			listener.exitReturnStatement(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitReturnStatement) {
			return visitor.visitReturnStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExpressionListContext extends ParserRuleContext {
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(JackParser.COMMA);
		} else {
			return this.getToken(JackParser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_expressionList; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterExpressionList) {
			listener.enterExpressionList(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitExpressionList) {
			listener.exitExpressionList(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitExpressionList) {
			return visitor.visitExpressionList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExpressionContext extends ParserRuleContext {
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public binaryOperator(): BinaryOperatorContext | undefined {
		return this.tryGetRuleContext(0, BinaryOperatorContext);
	}
	public constant(): ConstantContext | undefined {
		return this.tryGetRuleContext(0, ConstantContext);
	}
	public varName(): VarNameContext | undefined {
		return this.tryGetRuleContext(0, VarNameContext);
	}
	public subroutineCall(): SubroutineCallContext | undefined {
		return this.tryGetRuleContext(0, SubroutineCallContext);
	}
	public arrayAccess(): ArrayAccessContext | undefined {
		return this.tryGetRuleContext(0, ArrayAccessContext);
	}
	public unaryOperation(): UnaryOperationContext | undefined {
		return this.tryGetRuleContext(0, UnaryOperationContext);
	}
	public groupedExpression(): GroupedExpressionContext | undefined {
		return this.tryGetRuleContext(0, GroupedExpressionContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_expression; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterExpression) {
			listener.enterExpression(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitExpression) {
			listener.exitExpression(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitExpression) {
			return visitor.visitExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class GroupedExpressionContext extends ParserRuleContext {
	public LPAREN(): TerminalNode { return this.getToken(JackParser.LPAREN, 0); }
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	public RPAREN(): TerminalNode { return this.getToken(JackParser.RPAREN, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_groupedExpression; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterGroupedExpression) {
			listener.enterGroupedExpression(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitGroupedExpression) {
			listener.exitGroupedExpression(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitGroupedExpression) {
			return visitor.visitGroupedExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class UnaryOperationContext extends ParserRuleContext {
	public unaryOperator(): UnaryOperatorContext {
		return this.getRuleContext(0, UnaryOperatorContext);
	}
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_unaryOperation; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterUnaryOperation) {
			listener.enterUnaryOperation(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitUnaryOperation) {
			listener.exitUnaryOperation(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitUnaryOperation) {
			return visitor.visitUnaryOperation(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ArrayAccessContext extends ParserRuleContext {
	public varName(): VarNameContext {
		return this.getRuleContext(0, VarNameContext);
	}
	public LBRACKET(): TerminalNode { return this.getToken(JackParser.LBRACKET, 0); }
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	public RBRACKET(): TerminalNode { return this.getToken(JackParser.RBRACKET, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_arrayAccess; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterArrayAccess) {
			listener.enterArrayAccess(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitArrayAccess) {
			listener.exitArrayAccess(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitArrayAccess) {
			return visitor.visitArrayAccess(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ConstantContext extends ParserRuleContext {
	public INTEGER_LITERAL(): TerminalNode | undefined { return this.tryGetToken(JackParser.INTEGER_LITERAL, 0); }
	public STRING_LITERAL(): TerminalNode | undefined { return this.tryGetToken(JackParser.STRING_LITERAL, 0); }
	public BOOLEAN_LITERAL(): TerminalNode | undefined { return this.tryGetToken(JackParser.BOOLEAN_LITERAL, 0); }
	public NULL_LITERAL(): TerminalNode | undefined { return this.tryGetToken(JackParser.NULL_LITERAL, 0); }
	public THIS_LITERAL(): TerminalNode | undefined { return this.tryGetToken(JackParser.THIS_LITERAL, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_constant; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterConstant) {
			listener.enterConstant(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitConstant) {
			listener.exitConstant(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitConstant) {
			return visitor.visitConstant(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class UnaryOperatorContext extends ParserRuleContext {
	public TILDE(): TerminalNode | undefined { return this.tryGetToken(JackParser.TILDE, 0); }
	public MINUS(): TerminalNode | undefined { return this.tryGetToken(JackParser.MINUS, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_unaryOperator; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterUnaryOperator) {
			listener.enterUnaryOperator(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitUnaryOperator) {
			listener.exitUnaryOperator(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitUnaryOperator) {
			return visitor.visitUnaryOperator(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class BinaryOperatorContext extends ParserRuleContext {
	public PLUS(): TerminalNode | undefined { return this.tryGetToken(JackParser.PLUS, 0); }
	public MINUS(): TerminalNode | undefined { return this.tryGetToken(JackParser.MINUS, 0); }
	public MUL(): TerminalNode | undefined { return this.tryGetToken(JackParser.MUL, 0); }
	public DIV(): TerminalNode | undefined { return this.tryGetToken(JackParser.DIV, 0); }
	public AND(): TerminalNode | undefined { return this.tryGetToken(JackParser.AND, 0); }
	public OR(): TerminalNode | undefined { return this.tryGetToken(JackParser.OR, 0); }
	public LESS_THAN(): TerminalNode | undefined { return this.tryGetToken(JackParser.LESS_THAN, 0); }
	public GREATER_THAN(): TerminalNode | undefined { return this.tryGetToken(JackParser.GREATER_THAN, 0); }
	public EQUALS(): TerminalNode | undefined { return this.tryGetToken(JackParser.EQUALS, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public override get ruleIndex(): number { return JackParser.RULE_binaryOperator; }
	// @Override
	public override enterRule(listener: JackParserListener): void {
		if (listener.enterBinaryOperator) {
			listener.enterBinaryOperator(this);
		}
	}
	// @Override
	public override exitRule(listener: JackParserListener): void {
		if (listener.exitBinaryOperator) {
			listener.exitBinaryOperator(this);
		}
	}
	// @Override
	public override accept<Result>(visitor: JackParserVisitor<Result>): Result {
		if (visitor.visitBinaryOperator) {
			return visitor.visitBinaryOperator(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


