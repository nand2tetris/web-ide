// Generated from JackParser.g4 by ANTLR 4.13.2
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import {
	ATN,
	ATNDeserializer,
	DecisionState,
	DFA,
	FailedPredicateException,
	NoViableAltException,
	Parser,
	ParserATNSimulator,
	ParserRuleContext,
	PredictionContextCache,
	RecognitionException,
	RuleContext,
	TerminalNode,
	Token,
	TokenStream
} from "antlr4";
import JackParserListener from "./JackParserListener.js";
// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars

import { LocalSymbolTable, SubroutineScope } from "../symbol.js";

export default class JackParser extends Parser {
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
  public static readonly TRUE = 41;
  public static readonly FALSE = 42;
  public static readonly NULL_LITERAL = 43;
  public static readonly THIS_LITERAL = 44;
  public static readonly IDENTIFIER = 45;
  public static readonly STRING_LITERAL = 46;
  public static readonly UnterminatedStringLiteral = 47;
  public static override readonly EOF = Token.EOF;
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
  public static readonly RULE_equals = 23;
  public static readonly RULE_ifElseStatement = 24;
  public static readonly RULE_ifStatement = 25;
  public static readonly RULE_ifExpression = 26;
  public static readonly RULE_elseStatement = 27;
  public static readonly RULE_whileStatement = 28;
  public static readonly RULE_whileExpression = 29;
  public static readonly RULE_doStatement = 30;
  public static readonly RULE_subroutineCall = 31;
  public static readonly RULE_subroutineId = 32;
  public static readonly RULE_returnStatement = 33;
  public static readonly RULE_expressionList = 34;
  public static readonly RULE_expression = 35;
  public static readonly RULE_groupedExpression = 36;
  public static readonly RULE_unaryOperation = 37;
  public static readonly RULE_arrayAccess = 38;
  public static readonly RULE_constant = 39;
  public static readonly RULE_booleanLiteral = 40;
  public static readonly RULE_unaryOperator = 41;
  public static readonly RULE_binaryOperator = 42;
  public static readonly literalNames: (string | null)[] = [
    null,
    "'class'",
    "'constructor'",
    "'function'",
    "'method'",
    "'field'",
    "'static'",
    "'var'",
    "'int'",
    "'char'",
    "'boolean'",
    "'void'",
    "'let'",
    "'do'",
    "'if'",
    "'else'",
    "'while'",
    "'return'",
    "'{'",
    "'}'",
    "'('",
    "')'",
    "'['",
    "']'",
    "'.'",
    "','",
    "';'",
    "'='",
    "'+'",
    "'-'",
    "'*'",
    "'/'",
    "'&'",
    "'|'",
    "'~'",
    "'<'",
    "'>'",
    null,
    null,
    null,
    null,
    "'true'",
    "'false'",
    "'null'",
    "'this'",
  ];
  public static readonly symbolicNames: (string | null)[] = [
    null,
    "CLASS",
    "CONSTRUCTOR",
    "FUNCTION",
    "METHOD",
    "FIELD",
    "STATIC",
    "VAR",
    "INT",
    "CHAR",
    "BOOLEAN",
    "VOID",
    "LET",
    "DO",
    "IF",
    "ELSE",
    "WHILE",
    "RETURN",
    "LBRACE",
    "RBRACE",
    "LPAREN",
    "RPAREN",
    "LBRACKET",
    "RBRACKET",
    "DOT",
    "COMMA",
    "SEMICOLON",
    "EQUALS",
    "PLUS",
    "MINUS",
    "MUL",
    "DIV",
    "AND",
    "OR",
    "TILDE",
    "LESS_THAN",
    "GREATER_THAN",
    "WS",
    "COMMENT",
    "LINE_COMMENT",
    "INTEGER_LITERAL",
    "TRUE",
    "FALSE",
    "NULL_LITERAL",
    "THIS_LITERAL",
    "IDENTIFIER",
    "STRING_LITERAL",
    "UnterminatedStringLiteral",
  ];
  // tslint:disable:no-trailing-whitespace
  public static readonly ruleNames: string[] = [
    "program",
    "classDeclaration",
    "className",
    "classVarDec",
    "fieldList",
    "fieldName",
    "subroutineDeclaration",
    "subroutineType",
    "subroutineDecWithoutType",
    "subroutineName",
    "subroutineReturnType",
    "varType",
    "parameterList",
    "parameter",
    "parameterName",
    "subroutineBody",
    "rBrace",
    "varDeclaration",
    "varNameInDeclaration",
    "varName",
    "statements",
    "statement",
    "letStatement",
    "equals",
    "ifElseStatement",
    "ifStatement",
    "ifExpression",
    "elseStatement",
    "whileStatement",
    "whileExpression",
    "doStatement",
    "subroutineCall",
    "subroutineId",
    "returnStatement",
    "expressionList",
    "expression",
    "groupedExpression",
    "unaryOperation",
    "arrayAccess",
    "constant",
    "booleanLiteral",
    "unaryOperator",
    "binaryOperator",
  ];
  public get grammarFileName(): string {
    return "JackParser.g4";
  }
  public get literalNames(): (string | null)[] {
    return JackParser.literalNames;
  }
  public get symbolicNames(): (string | null)[] {
    return JackParser.symbolicNames;
  }
  public get ruleNames(): string[] {
    return JackParser.ruleNames;
  }
  public get serializedATN(): number[] {
    return JackParser._serializedATN;
  }

  protected createFailedPredicateException(
    predicate?: string,
    message?: string,
  ): FailedPredicateException {
    return new FailedPredicateException(this, predicate, message);
  }

  constructor(input: TokenStream) {
    super(input);
    this._interp = new ParserATNSimulator(
      this,
      JackParser._ATN,
      JackParser.DecisionsToDFA,
      new PredictionContextCache(),
    );
  }
  // @RuleVersion(0)
  public program(): ProgramContext {
    const localctx: ProgramContext = new ProgramContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 0, JackParser.RULE_program);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 86;
        this.classDeclaration();
        this.state = 87;
        this.match(JackParser.EOF);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public classDeclaration(): ClassDeclarationContext {
    const localctx: ClassDeclarationContext = new ClassDeclarationContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 2, JackParser.RULE_classDeclaration);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 89;
        this.match(JackParser.CLASS);
        this.state = 90;
        this.className();
        this.state = 91;
        this.match(JackParser.LBRACE);
        this.state = 95;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while (_la === 5 || _la === 6) {
          {
            {
              this.state = 92;
              this.classVarDec();
            }
          }
          this.state = 97;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
        this.state = 101;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while ((_la & ~0x1f) === 0 && ((1 << _la) & 28) !== 0) {
          {
            {
              this.state = 98;
              this.subroutineDeclaration();
            }
          }
          this.state = 103;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
        this.state = 104;
        this.rBrace();
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public className(): ClassNameContext {
    const localctx: ClassNameContext = new ClassNameContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 4, JackParser.RULE_className);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 106;
        this.match(JackParser.IDENTIFIER);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public classVarDec(): ClassVarDecContext {
    const localctx: ClassVarDecContext = new ClassVarDecContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 6, JackParser.RULE_classVarDec);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 108;
        _la = this._input.LA(1);
        if (!(_la === 5 || _la === 6)) {
          this._errHandler.recoverInline(this);
        } else {
          this._errHandler.reportMatch(this);
          this.consume();
        }
        this.state = 109;
        this.fieldList();
        this.state = 110;
        this.match(JackParser.SEMICOLON);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public fieldList(): FieldListContext {
    const localctx: FieldListContext = new FieldListContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 8, JackParser.RULE_fieldList);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 112;
        this.varType();
        this.state = 113;
        this.fieldName();
        this.state = 118;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while (_la === 25) {
          {
            {
              this.state = 114;
              this.match(JackParser.COMMA);
              this.state = 115;
              this.fieldName();
            }
          }
          this.state = 120;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public fieldName(): FieldNameContext {
    const localctx: FieldNameContext = new FieldNameContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 10, JackParser.RULE_fieldName);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 121;
        this.match(JackParser.IDENTIFIER);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public subroutineDeclaration(): SubroutineDeclarationContext {
    const localctx: SubroutineDeclarationContext =
      new SubroutineDeclarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 12, JackParser.RULE_subroutineDeclaration);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 123;
        this.subroutineType();
        this.state = 124;
        this.subroutineDecWithoutType();
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public subroutineType(): SubroutineTypeContext {
    const localctx: SubroutineTypeContext = new SubroutineTypeContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 14, JackParser.RULE_subroutineType);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 126;
        _la = this._input.LA(1);
        if (!((_la & ~0x1f) === 0 && ((1 << _la) & 28) !== 0)) {
          this._errHandler.recoverInline(this);
        } else {
          this._errHandler.reportMatch(this);
          this.consume();
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public subroutineDecWithoutType(): SubroutineDecWithoutTypeContext {
    const localctx: SubroutineDecWithoutTypeContext =
      new SubroutineDecWithoutTypeContext(this, this._ctx, this.state);
    this.enterRule(localctx, 16, JackParser.RULE_subroutineDecWithoutType);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 128;
        this.subroutineReturnType();
        this.state = 129;
        this.subroutineName();
        this.state = 130;
        this.match(JackParser.LPAREN);
        this.state = 131;
        this.parameterList();
        this.state = 132;
        this.match(JackParser.RPAREN);
        this.state = 133;
        this.subroutineBody();
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public subroutineName(): SubroutineNameContext {
    const localctx: SubroutineNameContext = new SubroutineNameContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 18, JackParser.RULE_subroutineName);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 135;
        this.match(JackParser.IDENTIFIER);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public subroutineReturnType(): SubroutineReturnTypeContext {
    const localctx: SubroutineReturnTypeContext =
      new SubroutineReturnTypeContext(this, this._ctx, this.state);
    this.enterRule(localctx, 20, JackParser.RULE_subroutineReturnType);
    try {
      this.state = 139;
      this._errHandler.sync(this);
      switch (this._input.LA(1)) {
        case 8:
        case 9:
        case 10:
        case 45:
          this.enterOuterAlt(localctx, 1);
          {
            this.state = 137;
            this.varType();
          }
          break;
        case 11:
          this.enterOuterAlt(localctx, 2);
          {
            this.state = 138;
            this.match(JackParser.VOID);
          }
          break;
        default:
          throw new NoViableAltException(this);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public varType(): VarTypeContext {
    const localctx: VarTypeContext = new VarTypeContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 22, JackParser.RULE_varType);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 141;
        _la = this._input.LA(1);
        if (
          !(((_la & ~0x1f) === 0 && ((1 << _la) & 1792) !== 0) || _la === 45)
        ) {
          this._errHandler.recoverInline(this);
        } else {
          this._errHandler.reportMatch(this);
          this.consume();
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public parameterList(): ParameterListContext {
    const localctx: ParameterListContext = new ParameterListContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 24, JackParser.RULE_parameterList);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 151;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (((_la & ~0x1f) === 0 && ((1 << _la) & 1792) !== 0) || _la === 45) {
          {
            this.state = 143;
            this.parameter();
            this.state = 148;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            while (_la === 25) {
              {
                {
                  this.state = 144;
                  this.match(JackParser.COMMA);
                  this.state = 145;
                  this.parameter();
                }
              }
              this.state = 150;
              this._errHandler.sync(this);
              _la = this._input.LA(1);
            }
          }
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public parameter(): ParameterContext {
    const localctx: ParameterContext = new ParameterContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 26, JackParser.RULE_parameter);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 153;
        this.varType();
        this.state = 154;
        this.parameterName();
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public parameterName(): ParameterNameContext {
    const localctx: ParameterNameContext = new ParameterNameContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 28, JackParser.RULE_parameterName);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 156;
        this.match(JackParser.IDENTIFIER);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public subroutineBody(): SubroutineBodyContext {
    const localctx: SubroutineBodyContext = new SubroutineBodyContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 30, JackParser.RULE_subroutineBody);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 158;
        this.match(JackParser.LBRACE);
        this.state = 162;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while (_la === 7) {
          {
            {
              this.state = 159;
              this.varDeclaration();
            }
          }
          this.state = 164;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
        this.state = 165;
        this.statements();
        this.state = 166;
        this.rBrace();
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public rBrace(): RBraceContext {
    const localctx: RBraceContext = new RBraceContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 32, JackParser.RULE_rBrace);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 168;
        this.match(JackParser.RBRACE);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public varDeclaration(): VarDeclarationContext {
    const localctx: VarDeclarationContext = new VarDeclarationContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 34, JackParser.RULE_varDeclaration);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 170;
        this.match(JackParser.VAR);
        this.state = 171;
        this.varType();
        this.state = 172;
        this.varNameInDeclaration();
        this.state = 177;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while (_la === 25) {
          {
            {
              this.state = 173;
              this.match(JackParser.COMMA);
              this.state = 174;
              this.varNameInDeclaration();
            }
          }
          this.state = 179;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
        this.state = 180;
        this.match(JackParser.SEMICOLON);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public varNameInDeclaration(): VarNameInDeclarationContext {
    const localctx: VarNameInDeclarationContext =
      new VarNameInDeclarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 36, JackParser.RULE_varNameInDeclaration);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 182;
        this.match(JackParser.IDENTIFIER);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public varName(): VarNameContext {
    const localctx: VarNameContext = new VarNameContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 38, JackParser.RULE_varName);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 184;
        this.match(JackParser.IDENTIFIER);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public statements(): StatementsContext {
    const localctx: StatementsContext = new StatementsContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 40, JackParser.RULE_statements);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 189;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while ((_la & ~0x1f) === 0 && ((1 << _la) & 225280) !== 0) {
          {
            {
              this.state = 186;
              this.statement();
            }
          }
          this.state = 191;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public statement(): StatementContext {
    const localctx: StatementContext = new StatementContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 42, JackParser.RULE_statement);
    try {
      this.state = 197;
      this._errHandler.sync(this);
      switch (this._input.LA(1)) {
        case 12:
          this.enterOuterAlt(localctx, 1);
          {
            this.state = 192;
            this.letStatement();
          }
          break;
        case 14:
          this.enterOuterAlt(localctx, 2);
          {
            this.state = 193;
            this.ifElseStatement();
          }
          break;
        case 16:
          this.enterOuterAlt(localctx, 3);
          {
            this.state = 194;
            this.whileStatement();
          }
          break;
        case 13:
          this.enterOuterAlt(localctx, 4);
          {
            this.state = 195;
            this.doStatement();
          }
          break;
        case 17:
          this.enterOuterAlt(localctx, 5);
          {
            this.state = 196;
            this.returnStatement();
          }
          break;
        default:
          throw new NoViableAltException(this);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public letStatement(): LetStatementContext {
    const localctx: LetStatementContext = new LetStatementContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 44, JackParser.RULE_letStatement);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 199;
        this.match(JackParser.LET);
        this.state = 202;
        this._errHandler.sync(this);
        switch (this._interp.adaptivePredict(this._input, 10, this._ctx)) {
          case 1:
            {
              this.state = 200;
              this.varName();
            }
            break;
          case 2:
            {
              this.state = 201;
              this.arrayAccess();
            }
            break;
        }
        this.state = 204;
        this.equals();
        this.state = 205;
        this.expression(0);
        this.state = 206;
        this.match(JackParser.SEMICOLON);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public equals(): EqualsContext {
    const localctx: EqualsContext = new EqualsContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 46, JackParser.RULE_equals);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 208;
        this.match(JackParser.EQUALS);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public ifElseStatement(): IfElseStatementContext {
    const localctx: IfElseStatementContext = new IfElseStatementContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 48, JackParser.RULE_ifElseStatement);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 210;
        this.ifStatement();
        this.state = 212;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (_la === 15) {
          {
            this.state = 211;
            this.elseStatement();
          }
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public ifStatement(): IfStatementContext {
    const localctx: IfStatementContext = new IfStatementContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 50, JackParser.RULE_ifStatement);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 214;
        this.match(JackParser.IF);
        this.state = 215;
        this.match(JackParser.LPAREN);
        this.state = 216;
        this.ifExpression();
        this.state = 217;
        this.match(JackParser.RPAREN);
        this.state = 218;
        this.match(JackParser.LBRACE);
        this.state = 219;
        this.statements();
        this.state = 220;
        this.rBrace();
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public ifExpression(): IfExpressionContext {
    const localctx: IfExpressionContext = new IfExpressionContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 52, JackParser.RULE_ifExpression);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 222;
        this.expression(0);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public elseStatement(): ElseStatementContext {
    const localctx: ElseStatementContext = new ElseStatementContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 54, JackParser.RULE_elseStatement);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 224;
        this.match(JackParser.ELSE);
        this.state = 225;
        this.match(JackParser.LBRACE);
        this.state = 226;
        this.statements();
        this.state = 227;
        this.rBrace();
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public whileStatement(): WhileStatementContext {
    const localctx: WhileStatementContext = new WhileStatementContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 56, JackParser.RULE_whileStatement);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 229;
        this.match(JackParser.WHILE);
        this.state = 230;
        this.match(JackParser.LPAREN);
        this.state = 231;
        this.whileExpression();
        this.state = 232;
        this.match(JackParser.RPAREN);
        this.state = 233;
        this.match(JackParser.LBRACE);
        this.state = 234;
        this.statements();
        this.state = 235;
        this.rBrace();
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public whileExpression(): WhileExpressionContext {
    const localctx: WhileExpressionContext = new WhileExpressionContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 58, JackParser.RULE_whileExpression);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 237;
        this.expression(0);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public doStatement(): DoStatementContext {
    const localctx: DoStatementContext = new DoStatementContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 60, JackParser.RULE_doStatement);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 239;
        this.match(JackParser.DO);
        this.state = 240;
        this.subroutineCall();
        this.state = 241;
        this.match(JackParser.SEMICOLON);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public subroutineCall(): SubroutineCallContext {
    const localctx: SubroutineCallContext = new SubroutineCallContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 62, JackParser.RULE_subroutineCall);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 243;
        this.subroutineId();
        this.state = 244;
        this.match(JackParser.LPAREN);
        this.state = 245;
        this.expressionList();
        this.state = 246;
        this.match(JackParser.RPAREN);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public subroutineId(): SubroutineIdContext {
    const localctx: SubroutineIdContext = new SubroutineIdContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 64, JackParser.RULE_subroutineId);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 253;
        this._errHandler.sync(this);
        switch (this._interp.adaptivePredict(this._input, 13, this._ctx)) {
          case 1:
            {
              this.state = 250;
              this._errHandler.sync(this);
              switch (this._input.LA(1)) {
                case 45:
                  {
                    this.state = 248;
                    this.className();
                  }
                  break;
                case 44:
                  {
                    this.state = 249;
                    this.match(JackParser.THIS_LITERAL);
                  }
                  break;
                default:
                  throw new NoViableAltException(this);
              }
              this.state = 252;
              this.match(JackParser.DOT);
            }
            break;
        }
        this.state = 255;
        this.subroutineName();
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public returnStatement(): ReturnStatementContext {
    const localctx: ReturnStatementContext = new ReturnStatementContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 66, JackParser.RULE_returnStatement);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 257;
        this.match(JackParser.RETURN);
        this.state = 259;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (
          ((_la - 20) & ~0x1f) === 0 &&
          ((1 << (_la - 20)) & 133186049) !== 0
        ) {
          {
            this.state = 258;
            this.expression(0);
          }
        }

        this.state = 261;
        this.match(JackParser.SEMICOLON);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public expressionList(): ExpressionListContext {
    const localctx: ExpressionListContext = new ExpressionListContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 68, JackParser.RULE_expressionList);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 271;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (
          ((_la - 20) & ~0x1f) === 0 &&
          ((1 << (_la - 20)) & 133186049) !== 0
        ) {
          {
            this.state = 263;
            this.expression(0);
            this.state = 268;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            while (_la === 25) {
              {
                {
                  this.state = 264;
                  this.match(JackParser.COMMA);
                  this.state = 265;
                  this.expression(0);
                }
              }
              this.state = 270;
              this._errHandler.sync(this);
              _la = this._input.LA(1);
            }
          }
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  public expression(): ExpressionContext;
  public expression(_p: number): ExpressionContext;
  // @RuleVersion(0)
  public expression(_p?: number): ExpressionContext {
    if (_p === undefined) {
      _p = 0;
    }

    const _parentctx: ParserRuleContext = this._ctx;
    const _parentState: number = this.state;
    let localctx: ExpressionContext = new ExpressionContext(
      this,
      this._ctx,
      _parentState,
    );
    const _startState = 70;
    this.enterRecursionRule(localctx, 70, JackParser.RULE_expression, _p);
    try {
      let _alt: number;
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 280;
        this._errHandler.sync(this);
        switch (this._interp.adaptivePredict(this._input, 17, this._ctx)) {
          case 1:
            {
              this.state = 274;
              this.constant();
            }
            break;
          case 2:
            {
              this.state = 275;
              this.varName();
            }
            break;
          case 3:
            {
              this.state = 276;
              this.subroutineCall();
            }
            break;
          case 4:
            {
              this.state = 277;
              this.arrayAccess();
            }
            break;
          case 5:
            {
              this.state = 278;
              this.unaryOperation();
            }
            break;
          case 6:
            {
              this.state = 279;
              this.groupedExpression();
            }
            break;
        }
        this._ctx.stop = this._input.LT(-1);
        this.state = 288;
        this._errHandler.sync(this);
        _alt = this._interp.adaptivePredict(this._input, 18, this._ctx);
        while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
          if (_alt === 1) {
            if (this._parseListeners != null) {
              this.triggerExitRuleEvent();
            }
            {
              {
                localctx = new ExpressionContext(
                  this,
                  _parentctx,
                  _parentState,
                );
                this.pushNewRecursionContext(
                  localctx,
                  _startState,
                  JackParser.RULE_expression,
                );
                this.state = 282;
                if (!this.precpred(this._ctx, 2)) {
                  throw this.createFailedPredicateException(
                    "this.precpred(this._ctx, 2)",
                  );
                }
                this.state = 283;
                this.binaryOperator();
                this.state = 284;
                this.expression(3);
              }
            }
          }
          this.state = 290;
          this._errHandler.sync(this);
          _alt = this._interp.adaptivePredict(this._input, 18, this._ctx);
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.unrollRecursionContexts(_parentctx);
    }
    return localctx;
  }
  // @RuleVersion(0)
  public groupedExpression(): GroupedExpressionContext {
    const localctx: GroupedExpressionContext = new GroupedExpressionContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 72, JackParser.RULE_groupedExpression);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 291;
        this.match(JackParser.LPAREN);
        this.state = 292;
        this.expression(0);
        this.state = 293;
        this.match(JackParser.RPAREN);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public unaryOperation(): UnaryOperationContext {
    const localctx: UnaryOperationContext = new UnaryOperationContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 74, JackParser.RULE_unaryOperation);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 295;
        this.unaryOperator();
        this.state = 296;
        this.expression(0);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public arrayAccess(): ArrayAccessContext {
    const localctx: ArrayAccessContext = new ArrayAccessContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 76, JackParser.RULE_arrayAccess);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 298;
        this.varName();
        this.state = 299;
        this.match(JackParser.LBRACKET);
        this.state = 300;
        this.expression(0);
        this.state = 301;
        this.match(JackParser.RBRACKET);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public constant(): ConstantContext {
    const localctx: ConstantContext = new ConstantContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 78, JackParser.RULE_constant);
    try {
      this.state = 308;
      this._errHandler.sync(this);
      switch (this._input.LA(1)) {
        case 40:
          this.enterOuterAlt(localctx, 1);
          {
            this.state = 303;
            this.match(JackParser.INTEGER_LITERAL);
          }
          break;
        case 46:
          this.enterOuterAlt(localctx, 2);
          {
            this.state = 304;
            this.match(JackParser.STRING_LITERAL);
          }
          break;
        case 41:
        case 42:
          this.enterOuterAlt(localctx, 3);
          {
            this.state = 305;
            this.booleanLiteral();
          }
          break;
        case 43:
          this.enterOuterAlt(localctx, 4);
          {
            this.state = 306;
            this.match(JackParser.NULL_LITERAL);
          }
          break;
        case 44:
          this.enterOuterAlt(localctx, 5);
          {
            this.state = 307;
            this.match(JackParser.THIS_LITERAL);
          }
          break;
        default:
          throw new NoViableAltException(this);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public booleanLiteral(): BooleanLiteralContext {
    const localctx: BooleanLiteralContext = new BooleanLiteralContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 80, JackParser.RULE_booleanLiteral);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 310;
        _la = this._input.LA(1);
        if (!(_la === 41 || _la === 42)) {
          this._errHandler.recoverInline(this);
        } else {
          this._errHandler.reportMatch(this);
          this.consume();
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public unaryOperator(): UnaryOperatorContext {
    const localctx: UnaryOperatorContext = new UnaryOperatorContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 82, JackParser.RULE_unaryOperator);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 312;
        _la = this._input.LA(1);
        if (!(_la === 29 || _la === 34)) {
          this._errHandler.recoverInline(this);
        } else {
          this._errHandler.reportMatch(this);
          this.consume();
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public binaryOperator(): BinaryOperatorContext {
    const localctx: BinaryOperatorContext = new BinaryOperatorContext(
      this,
      this._ctx,
      this.state,
    );
    this.enterRule(localctx, 84, JackParser.RULE_binaryOperator);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 314;
        _la = this._input.LA(1);
        if (!(((_la - 27) & ~0x1f) === 0 && ((1 << (_la - 27)) & 895) !== 0)) {
          this._errHandler.recoverInline(this);
        } else {
          this._errHandler.reportMatch(this);
          this.consume();
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  public sempred(
    localctx: RuleContext,
    ruleIndex: number,
    predIndex: number,
  ): boolean {
    switch (ruleIndex) {
      case 35:
        return this.expression_sempred(
          localctx as ExpressionContext,
          predIndex,
        );
    }
    return true;
  }
  private expression_sempred(
    localctx: ExpressionContext,
    predIndex: number,
  ): boolean {
    switch (predIndex) {
      case 0:
        return this.precpred(this._ctx, 2);
    }
    return true;
  }

  public static readonly _serializedATN: number[] = [
    4, 1, 47, 317, 2, 0, 7, 0, 2, 1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3, 2, 4, 7, 4,
    2, 5, 7, 5, 2, 6, 7, 6, 2, 7, 7, 7, 2, 8, 7, 8, 2, 9, 7, 9, 2, 10, 7, 10, 2,
    11, 7, 11, 2, 12, 7, 12, 2, 13, 7, 13, 2, 14, 7, 14, 2, 15, 7, 15, 2, 16, 7,
    16, 2, 17, 7, 17, 2, 18, 7, 18, 2, 19, 7, 19, 2, 20, 7, 20, 2, 21, 7, 21, 2,
    22, 7, 22, 2, 23, 7, 23, 2, 24, 7, 24, 2, 25, 7, 25, 2, 26, 7, 26, 2, 27, 7,
    27, 2, 28, 7, 28, 2, 29, 7, 29, 2, 30, 7, 30, 2, 31, 7, 31, 2, 32, 7, 32, 2,
    33, 7, 33, 2, 34, 7, 34, 2, 35, 7, 35, 2, 36, 7, 36, 2, 37, 7, 37, 2, 38, 7,
    38, 2, 39, 7, 39, 2, 40, 7, 40, 2, 41, 7, 41, 2, 42, 7, 42, 1, 0, 1, 0, 1,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 94, 8, 1, 10, 1, 12, 1, 97, 9, 1, 1, 1, 5,
    1, 100, 8, 1, 10, 1, 12, 1, 103, 9, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 3, 1, 3,
    1, 3, 1, 3, 1, 4, 1, 4, 1, 4, 1, 4, 5, 4, 117, 8, 4, 10, 4, 12, 4, 120, 9,
    4, 1, 5, 1, 5, 1, 6, 1, 6, 1, 6, 1, 7, 1, 7, 1, 8, 1, 8, 1, 8, 1, 8, 1, 8,
    1, 8, 1, 8, 1, 9, 1, 9, 1, 10, 1, 10, 3, 10, 140, 8, 10, 1, 11, 1, 11, 1,
    12, 1, 12, 1, 12, 5, 12, 147, 8, 12, 10, 12, 12, 12, 150, 9, 12, 3, 12, 152,
    8, 12, 1, 13, 1, 13, 1, 13, 1, 14, 1, 14, 1, 15, 1, 15, 5, 15, 161, 8, 15,
    10, 15, 12, 15, 164, 9, 15, 1, 15, 1, 15, 1, 15, 1, 16, 1, 16, 1, 17, 1, 17,
    1, 17, 1, 17, 1, 17, 5, 17, 176, 8, 17, 10, 17, 12, 17, 179, 9, 17, 1, 17,
    1, 17, 1, 18, 1, 18, 1, 19, 1, 19, 1, 20, 5, 20, 188, 8, 20, 10, 20, 12, 20,
    191, 9, 20, 1, 21, 1, 21, 1, 21, 1, 21, 1, 21, 3, 21, 198, 8, 21, 1, 22, 1,
    22, 1, 22, 3, 22, 203, 8, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 23, 1, 23, 1,
    24, 1, 24, 3, 24, 213, 8, 24, 1, 25, 1, 25, 1, 25, 1, 25, 1, 25, 1, 25, 1,
    25, 1, 25, 1, 26, 1, 26, 1, 27, 1, 27, 1, 27, 1, 27, 1, 27, 1, 28, 1, 28, 1,
    28, 1, 28, 1, 28, 1, 28, 1, 28, 1, 28, 1, 29, 1, 29, 1, 30, 1, 30, 1, 30, 1,
    30, 1, 31, 1, 31, 1, 31, 1, 31, 1, 31, 1, 32, 1, 32, 3, 32, 251, 8, 32, 1,
    32, 3, 32, 254, 8, 32, 1, 32, 1, 32, 1, 33, 1, 33, 3, 33, 260, 8, 33, 1, 33,
    1, 33, 1, 34, 1, 34, 1, 34, 5, 34, 267, 8, 34, 10, 34, 12, 34, 270, 9, 34,
    3, 34, 272, 8, 34, 1, 35, 1, 35, 1, 35, 1, 35, 1, 35, 1, 35, 1, 35, 3, 35,
    281, 8, 35, 1, 35, 1, 35, 1, 35, 1, 35, 5, 35, 287, 8, 35, 10, 35, 12, 35,
    290, 9, 35, 1, 36, 1, 36, 1, 36, 1, 36, 1, 37, 1, 37, 1, 37, 1, 38, 1, 38,
    1, 38, 1, 38, 1, 38, 1, 39, 1, 39, 1, 39, 1, 39, 1, 39, 3, 39, 309, 8, 39,
    1, 40, 1, 40, 1, 41, 1, 41, 1, 42, 1, 42, 1, 42, 0, 1, 70, 43, 0, 2, 4, 6,
    8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44,
    46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82,
    84, 0, 6, 1, 0, 5, 6, 1, 0, 2, 4, 2, 0, 8, 10, 45, 45, 1, 0, 41, 42, 2, 0,
    29, 29, 34, 34, 2, 0, 27, 33, 35, 36, 303, 0, 86, 1, 0, 0, 0, 2, 89, 1, 0,
    0, 0, 4, 106, 1, 0, 0, 0, 6, 108, 1, 0, 0, 0, 8, 112, 1, 0, 0, 0, 10, 121,
    1, 0, 0, 0, 12, 123, 1, 0, 0, 0, 14, 126, 1, 0, 0, 0, 16, 128, 1, 0, 0, 0,
    18, 135, 1, 0, 0, 0, 20, 139, 1, 0, 0, 0, 22, 141, 1, 0, 0, 0, 24, 151, 1,
    0, 0, 0, 26, 153, 1, 0, 0, 0, 28, 156, 1, 0, 0, 0, 30, 158, 1, 0, 0, 0, 32,
    168, 1, 0, 0, 0, 34, 170, 1, 0, 0, 0, 36, 182, 1, 0, 0, 0, 38, 184, 1, 0, 0,
    0, 40, 189, 1, 0, 0, 0, 42, 197, 1, 0, 0, 0, 44, 199, 1, 0, 0, 0, 46, 208,
    1, 0, 0, 0, 48, 210, 1, 0, 0, 0, 50, 214, 1, 0, 0, 0, 52, 222, 1, 0, 0, 0,
    54, 224, 1, 0, 0, 0, 56, 229, 1, 0, 0, 0, 58, 237, 1, 0, 0, 0, 60, 239, 1,
    0, 0, 0, 62, 243, 1, 0, 0, 0, 64, 253, 1, 0, 0, 0, 66, 257, 1, 0, 0, 0, 68,
    271, 1, 0, 0, 0, 70, 280, 1, 0, 0, 0, 72, 291, 1, 0, 0, 0, 74, 295, 1, 0, 0,
    0, 76, 298, 1, 0, 0, 0, 78, 308, 1, 0, 0, 0, 80, 310, 1, 0, 0, 0, 82, 312,
    1, 0, 0, 0, 84, 314, 1, 0, 0, 0, 86, 87, 3, 2, 1, 0, 87, 88, 5, 0, 0, 1, 88,
    1, 1, 0, 0, 0, 89, 90, 5, 1, 0, 0, 90, 91, 3, 4, 2, 0, 91, 95, 5, 18, 0, 0,
    92, 94, 3, 6, 3, 0, 93, 92, 1, 0, 0, 0, 94, 97, 1, 0, 0, 0, 95, 93, 1, 0, 0,
    0, 95, 96, 1, 0, 0, 0, 96, 101, 1, 0, 0, 0, 97, 95, 1, 0, 0, 0, 98, 100, 3,
    12, 6, 0, 99, 98, 1, 0, 0, 0, 100, 103, 1, 0, 0, 0, 101, 99, 1, 0, 0, 0,
    101, 102, 1, 0, 0, 0, 102, 104, 1, 0, 0, 0, 103, 101, 1, 0, 0, 0, 104, 105,
    3, 32, 16, 0, 105, 3, 1, 0, 0, 0, 106, 107, 5, 45, 0, 0, 107, 5, 1, 0, 0, 0,
    108, 109, 7, 0, 0, 0, 109, 110, 3, 8, 4, 0, 110, 111, 5, 26, 0, 0, 111, 7,
    1, 0, 0, 0, 112, 113, 3, 22, 11, 0, 113, 118, 3, 10, 5, 0, 114, 115, 5, 25,
    0, 0, 115, 117, 3, 10, 5, 0, 116, 114, 1, 0, 0, 0, 117, 120, 1, 0, 0, 0,
    118, 116, 1, 0, 0, 0, 118, 119, 1, 0, 0, 0, 119, 9, 1, 0, 0, 0, 120, 118, 1,
    0, 0, 0, 121, 122, 5, 45, 0, 0, 122, 11, 1, 0, 0, 0, 123, 124, 3, 14, 7, 0,
    124, 125, 3, 16, 8, 0, 125, 13, 1, 0, 0, 0, 126, 127, 7, 1, 0, 0, 127, 15,
    1, 0, 0, 0, 128, 129, 3, 20, 10, 0, 129, 130, 3, 18, 9, 0, 130, 131, 5, 20,
    0, 0, 131, 132, 3, 24, 12, 0, 132, 133, 5, 21, 0, 0, 133, 134, 3, 30, 15, 0,
    134, 17, 1, 0, 0, 0, 135, 136, 5, 45, 0, 0, 136, 19, 1, 0, 0, 0, 137, 140,
    3, 22, 11, 0, 138, 140, 5, 11, 0, 0, 139, 137, 1, 0, 0, 0, 139, 138, 1, 0,
    0, 0, 140, 21, 1, 0, 0, 0, 141, 142, 7, 2, 0, 0, 142, 23, 1, 0, 0, 0, 143,
    148, 3, 26, 13, 0, 144, 145, 5, 25, 0, 0, 145, 147, 3, 26, 13, 0, 146, 144,
    1, 0, 0, 0, 147, 150, 1, 0, 0, 0, 148, 146, 1, 0, 0, 0, 148, 149, 1, 0, 0,
    0, 149, 152, 1, 0, 0, 0, 150, 148, 1, 0, 0, 0, 151, 143, 1, 0, 0, 0, 151,
    152, 1, 0, 0, 0, 152, 25, 1, 0, 0, 0, 153, 154, 3, 22, 11, 0, 154, 155, 3,
    28, 14, 0, 155, 27, 1, 0, 0, 0, 156, 157, 5, 45, 0, 0, 157, 29, 1, 0, 0, 0,
    158, 162, 5, 18, 0, 0, 159, 161, 3, 34, 17, 0, 160, 159, 1, 0, 0, 0, 161,
    164, 1, 0, 0, 0, 162, 160, 1, 0, 0, 0, 162, 163, 1, 0, 0, 0, 163, 165, 1, 0,
    0, 0, 164, 162, 1, 0, 0, 0, 165, 166, 3, 40, 20, 0, 166, 167, 3, 32, 16, 0,
    167, 31, 1, 0, 0, 0, 168, 169, 5, 19, 0, 0, 169, 33, 1, 0, 0, 0, 170, 171,
    5, 7, 0, 0, 171, 172, 3, 22, 11, 0, 172, 177, 3, 36, 18, 0, 173, 174, 5, 25,
    0, 0, 174, 176, 3, 36, 18, 0, 175, 173, 1, 0, 0, 0, 176, 179, 1, 0, 0, 0,
    177, 175, 1, 0, 0, 0, 177, 178, 1, 0, 0, 0, 178, 180, 1, 0, 0, 0, 179, 177,
    1, 0, 0, 0, 180, 181, 5, 26, 0, 0, 181, 35, 1, 0, 0, 0, 182, 183, 5, 45, 0,
    0, 183, 37, 1, 0, 0, 0, 184, 185, 5, 45, 0, 0, 185, 39, 1, 0, 0, 0, 186,
    188, 3, 42, 21, 0, 187, 186, 1, 0, 0, 0, 188, 191, 1, 0, 0, 0, 189, 187, 1,
    0, 0, 0, 189, 190, 1, 0, 0, 0, 190, 41, 1, 0, 0, 0, 191, 189, 1, 0, 0, 0,
    192, 198, 3, 44, 22, 0, 193, 198, 3, 48, 24, 0, 194, 198, 3, 56, 28, 0, 195,
    198, 3, 60, 30, 0, 196, 198, 3, 66, 33, 0, 197, 192, 1, 0, 0, 0, 197, 193,
    1, 0, 0, 0, 197, 194, 1, 0, 0, 0, 197, 195, 1, 0, 0, 0, 197, 196, 1, 0, 0,
    0, 198, 43, 1, 0, 0, 0, 199, 202, 5, 12, 0, 0, 200, 203, 3, 38, 19, 0, 201,
    203, 3, 76, 38, 0, 202, 200, 1, 0, 0, 0, 202, 201, 1, 0, 0, 0, 203, 204, 1,
    0, 0, 0, 204, 205, 3, 46, 23, 0, 205, 206, 3, 70, 35, 0, 206, 207, 5, 26, 0,
    0, 207, 45, 1, 0, 0, 0, 208, 209, 5, 27, 0, 0, 209, 47, 1, 0, 0, 0, 210,
    212, 3, 50, 25, 0, 211, 213, 3, 54, 27, 0, 212, 211, 1, 0, 0, 0, 212, 213,
    1, 0, 0, 0, 213, 49, 1, 0, 0, 0, 214, 215, 5, 14, 0, 0, 215, 216, 5, 20, 0,
    0, 216, 217, 3, 52, 26, 0, 217, 218, 5, 21, 0, 0, 218, 219, 5, 18, 0, 0,
    219, 220, 3, 40, 20, 0, 220, 221, 3, 32, 16, 0, 221, 51, 1, 0, 0, 0, 222,
    223, 3, 70, 35, 0, 223, 53, 1, 0, 0, 0, 224, 225, 5, 15, 0, 0, 225, 226, 5,
    18, 0, 0, 226, 227, 3, 40, 20, 0, 227, 228, 3, 32, 16, 0, 228, 55, 1, 0, 0,
    0, 229, 230, 5, 16, 0, 0, 230, 231, 5, 20, 0, 0, 231, 232, 3, 58, 29, 0,
    232, 233, 5, 21, 0, 0, 233, 234, 5, 18, 0, 0, 234, 235, 3, 40, 20, 0, 235,
    236, 3, 32, 16, 0, 236, 57, 1, 0, 0, 0, 237, 238, 3, 70, 35, 0, 238, 59, 1,
    0, 0, 0, 239, 240, 5, 13, 0, 0, 240, 241, 3, 62, 31, 0, 241, 242, 5, 26, 0,
    0, 242, 61, 1, 0, 0, 0, 243, 244, 3, 64, 32, 0, 244, 245, 5, 20, 0, 0, 245,
    246, 3, 68, 34, 0, 246, 247, 5, 21, 0, 0, 247, 63, 1, 0, 0, 0, 248, 251, 3,
    4, 2, 0, 249, 251, 5, 44, 0, 0, 250, 248, 1, 0, 0, 0, 250, 249, 1, 0, 0, 0,
    251, 252, 1, 0, 0, 0, 252, 254, 5, 24, 0, 0, 253, 250, 1, 0, 0, 0, 253, 254,
    1, 0, 0, 0, 254, 255, 1, 0, 0, 0, 255, 256, 3, 18, 9, 0, 256, 65, 1, 0, 0,
    0, 257, 259, 5, 17, 0, 0, 258, 260, 3, 70, 35, 0, 259, 258, 1, 0, 0, 0, 259,
    260, 1, 0, 0, 0, 260, 261, 1, 0, 0, 0, 261, 262, 5, 26, 0, 0, 262, 67, 1, 0,
    0, 0, 263, 268, 3, 70, 35, 0, 264, 265, 5, 25, 0, 0, 265, 267, 3, 70, 35, 0,
    266, 264, 1, 0, 0, 0, 267, 270, 1, 0, 0, 0, 268, 266, 1, 0, 0, 0, 268, 269,
    1, 0, 0, 0, 269, 272, 1, 0, 0, 0, 270, 268, 1, 0, 0, 0, 271, 263, 1, 0, 0,
    0, 271, 272, 1, 0, 0, 0, 272, 69, 1, 0, 0, 0, 273, 274, 6, 35, -1, 0, 274,
    281, 3, 78, 39, 0, 275, 281, 3, 38, 19, 0, 276, 281, 3, 62, 31, 0, 277, 281,
    3, 76, 38, 0, 278, 281, 3, 74, 37, 0, 279, 281, 3, 72, 36, 0, 280, 273, 1,
    0, 0, 0, 280, 275, 1, 0, 0, 0, 280, 276, 1, 0, 0, 0, 280, 277, 1, 0, 0, 0,
    280, 278, 1, 0, 0, 0, 280, 279, 1, 0, 0, 0, 281, 288, 1, 0, 0, 0, 282, 283,
    10, 2, 0, 0, 283, 284, 3, 84, 42, 0, 284, 285, 3, 70, 35, 3, 285, 287, 1, 0,
    0, 0, 286, 282, 1, 0, 0, 0, 287, 290, 1, 0, 0, 0, 288, 286, 1, 0, 0, 0, 288,
    289, 1, 0, 0, 0, 289, 71, 1, 0, 0, 0, 290, 288, 1, 0, 0, 0, 291, 292, 5, 20,
    0, 0, 292, 293, 3, 70, 35, 0, 293, 294, 5, 21, 0, 0, 294, 73, 1, 0, 0, 0,
    295, 296, 3, 82, 41, 0, 296, 297, 3, 70, 35, 0, 297, 75, 1, 0, 0, 0, 298,
    299, 3, 38, 19, 0, 299, 300, 5, 22, 0, 0, 300, 301, 3, 70, 35, 0, 301, 302,
    5, 23, 0, 0, 302, 77, 1, 0, 0, 0, 303, 309, 5, 40, 0, 0, 304, 309, 5, 46, 0,
    0, 305, 309, 3, 80, 40, 0, 306, 309, 5, 43, 0, 0, 307, 309, 5, 44, 0, 0,
    308, 303, 1, 0, 0, 0, 308, 304, 1, 0, 0, 0, 308, 305, 1, 0, 0, 0, 308, 306,
    1, 0, 0, 0, 308, 307, 1, 0, 0, 0, 309, 79, 1, 0, 0, 0, 310, 311, 7, 3, 0, 0,
    311, 81, 1, 0, 0, 0, 312, 313, 7, 4, 0, 0, 313, 83, 1, 0, 0, 0, 314, 315, 7,
    5, 0, 0, 315, 85, 1, 0, 0, 0, 20, 95, 101, 118, 139, 148, 151, 162, 177,
    189, 197, 202, 212, 250, 253, 259, 268, 271, 280, 288, 308,
  ];

  private static __ATN: ATN;
  public static get _ATN(): ATN {
    if (!JackParser.__ATN) {
      JackParser.__ATN = new ATNDeserializer().deserialize(
        JackParser._serializedATN,
      );
    }

    return JackParser.__ATN;
  }

  static DecisionsToDFA = JackParser._ATN.decisionToState.map(
    (ds: DecisionState, index: number) => new DFA(ds, index),
  );
}

export class ProgramContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public classDeclaration(): ClassDeclarationContext {
    return this.getTypedRuleContext(
      ClassDeclarationContext,
      0,
    ) as ClassDeclarationContext;
  }
  public EOF(): TerminalNode {
    return this.getToken(JackParser.EOF, 0);
  }
  public get ruleIndex(): number {
    return JackParser.RULE_program;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterProgram) {
      listener.enterProgram(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitProgram) {
      listener.exitProgram(this);
    }
  }
}

export class ClassDeclarationContext extends ParserRuleContext {
  public localSymbolTable: LocalSymbolTable | undefined;
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public CLASS(): TerminalNode {
    return this.getToken(JackParser.CLASS, 0);
  }
  public className(): ClassNameContext {
    return this.getTypedRuleContext(ClassNameContext, 0) as ClassNameContext;
  }
  public LBRACE(): TerminalNode {
    return this.getToken(JackParser.LBRACE, 0);
  }
  public rBrace(): RBraceContext {
    return this.getTypedRuleContext(RBraceContext, 0) as RBraceContext;
  }
  public classVarDec_list(): ClassVarDecContext[] {
    return this.getTypedRuleContexts(
      ClassVarDecContext,
    ) as ClassVarDecContext[];
  }
  public classVarDec(i: number): ClassVarDecContext {
    return this.getTypedRuleContext(
      ClassVarDecContext,
      i,
    ) as ClassVarDecContext;
  }
  public subroutineDeclaration_list(): SubroutineDeclarationContext[] {
    return this.getTypedRuleContexts(
      SubroutineDeclarationContext,
    ) as SubroutineDeclarationContext[];
  }
  public subroutineDeclaration(i: number): SubroutineDeclarationContext {
    return this.getTypedRuleContext(
      SubroutineDeclarationContext,
      i,
    ) as SubroutineDeclarationContext;
  }
  public get ruleIndex(): number {
    return JackParser.RULE_classDeclaration;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterClassDeclaration) {
      listener.enterClassDeclaration(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitClassDeclaration) {
      listener.exitClassDeclaration(this);
    }
  }
}

export class ClassNameContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public IDENTIFIER(): TerminalNode {
    return this.getToken(JackParser.IDENTIFIER, 0);
  }
  public get ruleIndex(): number {
    return JackParser.RULE_className;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterClassName) {
      listener.enterClassName(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitClassName) {
      listener.exitClassName(this);
    }
  }
}

export class ClassVarDecContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public fieldList(): FieldListContext {
    return this.getTypedRuleContext(FieldListContext, 0) as FieldListContext;
  }
  public SEMICOLON(): TerminalNode {
    return this.getToken(JackParser.SEMICOLON, 0);
  }
  public STATIC(): TerminalNode {
    return this.getToken(JackParser.STATIC, 0);
  }
  public FIELD(): TerminalNode {
    return this.getToken(JackParser.FIELD, 0);
  }
  public get ruleIndex(): number {
    return JackParser.RULE_classVarDec;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterClassVarDec) {
      listener.enterClassVarDec(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitClassVarDec) {
      listener.exitClassVarDec(this);
    }
  }
}

export class FieldListContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public varType(): VarTypeContext {
    return this.getTypedRuleContext(VarTypeContext, 0) as VarTypeContext;
  }
  public fieldName_list(): FieldNameContext[] {
    return this.getTypedRuleContexts(FieldNameContext) as FieldNameContext[];
  }
  public fieldName(i: number): FieldNameContext {
    return this.getTypedRuleContext(FieldNameContext, i) as FieldNameContext;
  }
  public COMMA_list(): TerminalNode[] {
    return this.getTokens(JackParser.COMMA);
  }
  public COMMA(i: number): TerminalNode {
    return this.getToken(JackParser.COMMA, i);
  }
  public get ruleIndex(): number {
    return JackParser.RULE_fieldList;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterFieldList) {
      listener.enterFieldList(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitFieldList) {
      listener.exitFieldList(this);
    }
  }
}

export class FieldNameContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public IDENTIFIER(): TerminalNode {
    return this.getToken(JackParser.IDENTIFIER, 0);
  }
  public get ruleIndex(): number {
    return JackParser.RULE_fieldName;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterFieldName) {
      listener.enterFieldName(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitFieldName) {
      listener.exitFieldName(this);
    }
  }
}

export class SubroutineDeclarationContext extends ParserRuleContext {
  public symbols: SubroutineScope | undefined;
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public subroutineType(): SubroutineTypeContext {
    return this.getTypedRuleContext(
      SubroutineTypeContext,
      0,
    ) as SubroutineTypeContext;
  }
  public subroutineDecWithoutType(): SubroutineDecWithoutTypeContext {
    return this.getTypedRuleContext(
      SubroutineDecWithoutTypeContext,
      0,
    ) as SubroutineDecWithoutTypeContext;
  }
  public get ruleIndex(): number {
    return JackParser.RULE_subroutineDeclaration;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterSubroutineDeclaration) {
      listener.enterSubroutineDeclaration(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitSubroutineDeclaration) {
      listener.exitSubroutineDeclaration(this);
    }
  }
}

export class SubroutineTypeContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public CONSTRUCTOR(): TerminalNode {
    return this.getToken(JackParser.CONSTRUCTOR, 0);
  }
  public METHOD(): TerminalNode {
    return this.getToken(JackParser.METHOD, 0);
  }
  public FUNCTION(): TerminalNode {
    return this.getToken(JackParser.FUNCTION, 0);
  }
  public get ruleIndex(): number {
    return JackParser.RULE_subroutineType;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterSubroutineType) {
      listener.enterSubroutineType(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitSubroutineType) {
      listener.exitSubroutineType(this);
    }
  }
}

export class SubroutineDecWithoutTypeContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public subroutineReturnType(): SubroutineReturnTypeContext {
    return this.getTypedRuleContext(
      SubroutineReturnTypeContext,
      0,
    ) as SubroutineReturnTypeContext;
  }
  public subroutineName(): SubroutineNameContext {
    return this.getTypedRuleContext(
      SubroutineNameContext,
      0,
    ) as SubroutineNameContext;
  }
  public LPAREN(): TerminalNode {
    return this.getToken(JackParser.LPAREN, 0);
  }
  public parameterList(): ParameterListContext {
    return this.getTypedRuleContext(
      ParameterListContext,
      0,
    ) as ParameterListContext;
  }
  public RPAREN(): TerminalNode {
    return this.getToken(JackParser.RPAREN, 0);
  }
  public subroutineBody(): SubroutineBodyContext {
    return this.getTypedRuleContext(
      SubroutineBodyContext,
      0,
    ) as SubroutineBodyContext;
  }
  public get ruleIndex(): number {
    return JackParser.RULE_subroutineDecWithoutType;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterSubroutineDecWithoutType) {
      listener.enterSubroutineDecWithoutType(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitSubroutineDecWithoutType) {
      listener.exitSubroutineDecWithoutType(this);
    }
  }
}

export class SubroutineNameContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public IDENTIFIER(): TerminalNode {
    return this.getToken(JackParser.IDENTIFIER, 0);
  }
  public get ruleIndex(): number {
    return JackParser.RULE_subroutineName;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterSubroutineName) {
      listener.enterSubroutineName(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitSubroutineName) {
      listener.exitSubroutineName(this);
    }
  }
}

export class SubroutineReturnTypeContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public varType(): VarTypeContext {
    return this.getTypedRuleContext(VarTypeContext, 0) as VarTypeContext;
  }
  public VOID(): TerminalNode {
    return this.getToken(JackParser.VOID, 0);
  }
  public get ruleIndex(): number {
    return JackParser.RULE_subroutineReturnType;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterSubroutineReturnType) {
      listener.enterSubroutineReturnType(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitSubroutineReturnType) {
      listener.exitSubroutineReturnType(this);
    }
  }
}

export class VarTypeContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public INT(): TerminalNode {
    return this.getToken(JackParser.INT, 0);
  }
  public CHAR(): TerminalNode {
    return this.getToken(JackParser.CHAR, 0);
  }
  public BOOLEAN(): TerminalNode {
    return this.getToken(JackParser.BOOLEAN, 0);
  }
  public IDENTIFIER(): TerminalNode {
    return this.getToken(JackParser.IDENTIFIER, 0);
  }
  public get ruleIndex(): number {
    return JackParser.RULE_varType;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterVarType) {
      listener.enterVarType(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitVarType) {
      listener.exitVarType(this);
    }
  }
}

export class ParameterListContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public parameter_list(): ParameterContext[] {
    return this.getTypedRuleContexts(ParameterContext) as ParameterContext[];
  }
  public parameter(i: number): ParameterContext {
    return this.getTypedRuleContext(ParameterContext, i) as ParameterContext;
  }
  public COMMA_list(): TerminalNode[] {
    return this.getTokens(JackParser.COMMA);
  }
  public COMMA(i: number): TerminalNode {
    return this.getToken(JackParser.COMMA, i);
  }
  public get ruleIndex(): number {
    return JackParser.RULE_parameterList;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterParameterList) {
      listener.enterParameterList(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitParameterList) {
      listener.exitParameterList(this);
    }
  }
}

export class ParameterContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public varType(): VarTypeContext {
    return this.getTypedRuleContext(VarTypeContext, 0) as VarTypeContext;
  }
  public parameterName(): ParameterNameContext {
    return this.getTypedRuleContext(
      ParameterNameContext,
      0,
    ) as ParameterNameContext;
  }
  public get ruleIndex(): number {
    return JackParser.RULE_parameter;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterParameter) {
      listener.enterParameter(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitParameter) {
      listener.exitParameter(this);
    }
  }
}

export class ParameterNameContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public IDENTIFIER(): TerminalNode {
    return this.getToken(JackParser.IDENTIFIER, 0);
  }
  public get ruleIndex(): number {
    return JackParser.RULE_parameterName;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterParameterName) {
      listener.enterParameterName(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitParameterName) {
      listener.exitParameterName(this);
    }
  }
}

export class SubroutineBodyContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public LBRACE(): TerminalNode {
    return this.getToken(JackParser.LBRACE, 0);
  }
  public statements(): StatementsContext {
    return this.getTypedRuleContext(StatementsContext, 0) as StatementsContext;
  }
  public rBrace(): RBraceContext {
    return this.getTypedRuleContext(RBraceContext, 0) as RBraceContext;
  }
  public varDeclaration_list(): VarDeclarationContext[] {
    return this.getTypedRuleContexts(
      VarDeclarationContext,
    ) as VarDeclarationContext[];
  }
  public varDeclaration(i: number): VarDeclarationContext {
    return this.getTypedRuleContext(
      VarDeclarationContext,
      i,
    ) as VarDeclarationContext;
  }
  public get ruleIndex(): number {
    return JackParser.RULE_subroutineBody;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterSubroutineBody) {
      listener.enterSubroutineBody(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitSubroutineBody) {
      listener.exitSubroutineBody(this);
    }
  }
}

export class RBraceContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public RBRACE(): TerminalNode {
    return this.getToken(JackParser.RBRACE, 0);
  }
  public get ruleIndex(): number {
    return JackParser.RULE_rBrace;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterRBrace) {
      listener.enterRBrace(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitRBrace) {
      listener.exitRBrace(this);
    }
  }
}

export class VarDeclarationContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public VAR(): TerminalNode {
    return this.getToken(JackParser.VAR, 0);
  }
  public varType(): VarTypeContext {
    return this.getTypedRuleContext(VarTypeContext, 0) as VarTypeContext;
  }
  public varNameInDeclaration_list(): VarNameInDeclarationContext[] {
    return this.getTypedRuleContexts(
      VarNameInDeclarationContext,
    ) as VarNameInDeclarationContext[];
  }
  public varNameInDeclaration(i: number): VarNameInDeclarationContext {
    return this.getTypedRuleContext(
      VarNameInDeclarationContext,
      i,
    ) as VarNameInDeclarationContext;
  }
  public SEMICOLON(): TerminalNode {
    return this.getToken(JackParser.SEMICOLON, 0);
  }
  public COMMA_list(): TerminalNode[] {
    return this.getTokens(JackParser.COMMA);
  }
  public COMMA(i: number): TerminalNode {
    return this.getToken(JackParser.COMMA, i);
  }
  public get ruleIndex(): number {
    return JackParser.RULE_varDeclaration;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterVarDeclaration) {
      listener.enterVarDeclaration(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitVarDeclaration) {
      listener.exitVarDeclaration(this);
    }
  }
}

export class VarNameInDeclarationContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public IDENTIFIER(): TerminalNode {
    return this.getToken(JackParser.IDENTIFIER, 0);
  }
  public get ruleIndex(): number {
    return JackParser.RULE_varNameInDeclaration;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterVarNameInDeclaration) {
      listener.enterVarNameInDeclaration(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitVarNameInDeclaration) {
      listener.exitVarNameInDeclaration(this);
    }
  }
}

export class VarNameContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public IDENTIFIER(): TerminalNode {
    return this.getToken(JackParser.IDENTIFIER, 0);
  }
  public get ruleIndex(): number {
    return JackParser.RULE_varName;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterVarName) {
      listener.enterVarName(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitVarName) {
      listener.exitVarName(this);
    }
  }
}

export class StatementsContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public statement_list(): StatementContext[] {
    return this.getTypedRuleContexts(StatementContext) as StatementContext[];
  }
  public statement(i: number): StatementContext {
    return this.getTypedRuleContext(StatementContext, i) as StatementContext;
  }
  public get ruleIndex(): number {
    return JackParser.RULE_statements;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterStatements) {
      listener.enterStatements(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitStatements) {
      listener.exitStatements(this);
    }
  }
}

export class StatementContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public letStatement(): LetStatementContext {
    return this.getTypedRuleContext(
      LetStatementContext,
      0,
    ) as LetStatementContext;
  }
  public ifElseStatement(): IfElseStatementContext {
    return this.getTypedRuleContext(
      IfElseStatementContext,
      0,
    ) as IfElseStatementContext;
  }
  public whileStatement(): WhileStatementContext {
    return this.getTypedRuleContext(
      WhileStatementContext,
      0,
    ) as WhileStatementContext;
  }
  public doStatement(): DoStatementContext {
    return this.getTypedRuleContext(
      DoStatementContext,
      0,
    ) as DoStatementContext;
  }
  public returnStatement(): ReturnStatementContext {
    return this.getTypedRuleContext(
      ReturnStatementContext,
      0,
    ) as ReturnStatementContext;
  }
  public get ruleIndex(): number {
    return JackParser.RULE_statement;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterStatement) {
      listener.enterStatement(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitStatement) {
      listener.exitStatement(this);
    }
  }
}

export class LetStatementContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public LET(): TerminalNode {
    return this.getToken(JackParser.LET, 0);
  }
  public equals(): EqualsContext {
    return this.getTypedRuleContext(EqualsContext, 0) as EqualsContext;
  }
  public expression(): ExpressionContext {
    return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
  }
  public SEMICOLON(): TerminalNode {
    return this.getToken(JackParser.SEMICOLON, 0);
  }
  public varName(): VarNameContext {
    return this.getTypedRuleContext(VarNameContext, 0) as VarNameContext;
  }
  public arrayAccess(): ArrayAccessContext {
    return this.getTypedRuleContext(
      ArrayAccessContext,
      0,
    ) as ArrayAccessContext;
  }
  public get ruleIndex(): number {
    return JackParser.RULE_letStatement;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterLetStatement) {
      listener.enterLetStatement(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitLetStatement) {
      listener.exitLetStatement(this);
    }
  }
}

export class EqualsContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public EQUALS(): TerminalNode {
    return this.getToken(JackParser.EQUALS, 0);
  }
  public get ruleIndex(): number {
    return JackParser.RULE_equals;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterEquals) {
      listener.enterEquals(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitEquals) {
      listener.exitEquals(this);
    }
  }
}

export class IfElseStatementContext extends ParserRuleContext {
  public endLabel = "";
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public ifStatement(): IfStatementContext {
    return this.getTypedRuleContext(
      IfStatementContext,
      0,
    ) as IfStatementContext;
  }
  public elseStatement(): ElseStatementContext {
    return this.getTypedRuleContext(
      ElseStatementContext,
      0,
    ) as ElseStatementContext;
  }
  public get ruleIndex(): number {
    return JackParser.RULE_ifElseStatement;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterIfElseStatement) {
      listener.enterIfElseStatement(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitIfElseStatement) {
      listener.exitIfElseStatement(this);
    }
  }
}

export class IfStatementContext extends ParserRuleContext {
  public endLabel = "";
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public IF(): TerminalNode {
    return this.getToken(JackParser.IF, 0);
  }
  public LPAREN(): TerminalNode {
    return this.getToken(JackParser.LPAREN, 0);
  }
  public ifExpression(): IfExpressionContext {
    return this.getTypedRuleContext(
      IfExpressionContext,
      0,
    ) as IfExpressionContext;
  }
  public RPAREN(): TerminalNode {
    return this.getToken(JackParser.RPAREN, 0);
  }
  public LBRACE(): TerminalNode {
    return this.getToken(JackParser.LBRACE, 0);
  }
  public statements(): StatementsContext {
    return this.getTypedRuleContext(StatementsContext, 0) as StatementsContext;
  }
  public rBrace(): RBraceContext {
    return this.getTypedRuleContext(RBraceContext, 0) as RBraceContext;
  }
  public get ruleIndex(): number {
    return JackParser.RULE_ifStatement;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterIfStatement) {
      listener.enterIfStatement(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitIfStatement) {
      listener.exitIfStatement(this);
    }
  }
}

export class IfExpressionContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public expression(): ExpressionContext {
    return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
  }
  public get ruleIndex(): number {
    return JackParser.RULE_ifExpression;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterIfExpression) {
      listener.enterIfExpression(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitIfExpression) {
      listener.exitIfExpression(this);
    }
  }
}

export class ElseStatementContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public ELSE(): TerminalNode {
    return this.getToken(JackParser.ELSE, 0);
  }
  public LBRACE(): TerminalNode {
    return this.getToken(JackParser.LBRACE, 0);
  }
  public statements(): StatementsContext {
    return this.getTypedRuleContext(StatementsContext, 0) as StatementsContext;
  }
  public rBrace(): RBraceContext {
    return this.getTypedRuleContext(RBraceContext, 0) as RBraceContext;
  }
  public get ruleIndex(): number {
    return JackParser.RULE_elseStatement;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterElseStatement) {
      listener.enterElseStatement(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitElseStatement) {
      listener.exitElseStatement(this);
    }
  }
}

export class WhileStatementContext extends ParserRuleContext {
  public startLabel = "";
  endLabel = "";
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public WHILE(): TerminalNode {
    return this.getToken(JackParser.WHILE, 0);
  }
  public LPAREN(): TerminalNode {
    return this.getToken(JackParser.LPAREN, 0);
  }
  public whileExpression(): WhileExpressionContext {
    return this.getTypedRuleContext(
      WhileExpressionContext,
      0,
    ) as WhileExpressionContext;
  }
  public RPAREN(): TerminalNode {
    return this.getToken(JackParser.RPAREN, 0);
  }
  public LBRACE(): TerminalNode {
    return this.getToken(JackParser.LBRACE, 0);
  }
  public statements(): StatementsContext {
    return this.getTypedRuleContext(StatementsContext, 0) as StatementsContext;
  }
  public rBrace(): RBraceContext {
    return this.getTypedRuleContext(RBraceContext, 0) as RBraceContext;
  }
  public get ruleIndex(): number {
    return JackParser.RULE_whileStatement;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterWhileStatement) {
      listener.enterWhileStatement(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitWhileStatement) {
      listener.exitWhileStatement(this);
    }
  }
}

export class WhileExpressionContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public expression(): ExpressionContext {
    return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
  }
  public get ruleIndex(): number {
    return JackParser.RULE_whileExpression;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterWhileExpression) {
      listener.enterWhileExpression(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitWhileExpression) {
      listener.exitWhileExpression(this);
    }
  }
}

export class DoStatementContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public DO(): TerminalNode {
    return this.getToken(JackParser.DO, 0);
  }
  public subroutineCall(): SubroutineCallContext {
    return this.getTypedRuleContext(
      SubroutineCallContext,
      0,
    ) as SubroutineCallContext;
  }
  public SEMICOLON(): TerminalNode {
    return this.getToken(JackParser.SEMICOLON, 0);
  }
  public get ruleIndex(): number {
    return JackParser.RULE_doStatement;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterDoStatement) {
      listener.enterDoStatement(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitDoStatement) {
      listener.exitDoStatement(this);
    }
  }
}

export class SubroutineCallContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public subroutineId(): SubroutineIdContext {
    return this.getTypedRuleContext(
      SubroutineIdContext,
      0,
    ) as SubroutineIdContext;
  }
  public LPAREN(): TerminalNode {
    return this.getToken(JackParser.LPAREN, 0);
  }
  public expressionList(): ExpressionListContext {
    return this.getTypedRuleContext(
      ExpressionListContext,
      0,
    ) as ExpressionListContext;
  }
  public RPAREN(): TerminalNode {
    return this.getToken(JackParser.RPAREN, 0);
  }
  public get ruleIndex(): number {
    return JackParser.RULE_subroutineCall;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterSubroutineCall) {
      listener.enterSubroutineCall(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitSubroutineCall) {
      listener.exitSubroutineCall(this);
    }
  }
}

export class SubroutineIdContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public subroutineName(): SubroutineNameContext {
    return this.getTypedRuleContext(
      SubroutineNameContext,
      0,
    ) as SubroutineNameContext;
  }
  public DOT(): TerminalNode {
    return this.getToken(JackParser.DOT, 0);
  }
  public className(): ClassNameContext {
    return this.getTypedRuleContext(ClassNameContext, 0) as ClassNameContext;
  }
  public THIS_LITERAL(): TerminalNode {
    return this.getToken(JackParser.THIS_LITERAL, 0);
  }
  public get ruleIndex(): number {
    return JackParser.RULE_subroutineId;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterSubroutineId) {
      listener.enterSubroutineId(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitSubroutineId) {
      listener.exitSubroutineId(this);
    }
  }
}

export class ReturnStatementContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public RETURN(): TerminalNode {
    return this.getToken(JackParser.RETURN, 0);
  }
  public SEMICOLON(): TerminalNode {
    return this.getToken(JackParser.SEMICOLON, 0);
  }
  public expression(): ExpressionContext {
    return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
  }
  public get ruleIndex(): number {
    return JackParser.RULE_returnStatement;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterReturnStatement) {
      listener.enterReturnStatement(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitReturnStatement) {
      listener.exitReturnStatement(this);
    }
  }
}

export class ExpressionListContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public expression_list(): ExpressionContext[] {
    return this.getTypedRuleContexts(ExpressionContext) as ExpressionContext[];
  }
  public expression(i: number): ExpressionContext {
    return this.getTypedRuleContext(ExpressionContext, i) as ExpressionContext;
  }
  public COMMA_list(): TerminalNode[] {
    return this.getTokens(JackParser.COMMA);
  }
  public COMMA(i: number): TerminalNode {
    return this.getToken(JackParser.COMMA, i);
  }
  public get ruleIndex(): number {
    return JackParser.RULE_expressionList;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterExpressionList) {
      listener.enterExpressionList(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitExpressionList) {
      listener.exitExpressionList(this);
    }
  }
}

export class ExpressionContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public constant(): ConstantContext {
    return this.getTypedRuleContext(ConstantContext, 0) as ConstantContext;
  }
  public varName(): VarNameContext {
    return this.getTypedRuleContext(VarNameContext, 0) as VarNameContext;
  }
  public subroutineCall(): SubroutineCallContext {
    return this.getTypedRuleContext(
      SubroutineCallContext,
      0,
    ) as SubroutineCallContext;
  }
  public arrayAccess(): ArrayAccessContext {
    return this.getTypedRuleContext(
      ArrayAccessContext,
      0,
    ) as ArrayAccessContext;
  }
  public unaryOperation(): UnaryOperationContext {
    return this.getTypedRuleContext(
      UnaryOperationContext,
      0,
    ) as UnaryOperationContext;
  }
  public groupedExpression(): GroupedExpressionContext {
    return this.getTypedRuleContext(
      GroupedExpressionContext,
      0,
    ) as GroupedExpressionContext;
  }
  public expression_list(): ExpressionContext[] {
    return this.getTypedRuleContexts(ExpressionContext) as ExpressionContext[];
  }
  public expression(i: number): ExpressionContext {
    return this.getTypedRuleContext(ExpressionContext, i) as ExpressionContext;
  }
  public binaryOperator(): BinaryOperatorContext {
    return this.getTypedRuleContext(
      BinaryOperatorContext,
      0,
    ) as BinaryOperatorContext;
  }
  public get ruleIndex(): number {
    return JackParser.RULE_expression;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterExpression) {
      listener.enterExpression(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitExpression) {
      listener.exitExpression(this);
    }
  }
}

export class GroupedExpressionContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public LPAREN(): TerminalNode {
    return this.getToken(JackParser.LPAREN, 0);
  }
  public expression(): ExpressionContext {
    return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
  }
  public RPAREN(): TerminalNode {
    return this.getToken(JackParser.RPAREN, 0);
  }
  public get ruleIndex(): number {
    return JackParser.RULE_groupedExpression;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterGroupedExpression) {
      listener.enterGroupedExpression(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitGroupedExpression) {
      listener.exitGroupedExpression(this);
    }
  }
}

export class UnaryOperationContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public unaryOperator(): UnaryOperatorContext {
    return this.getTypedRuleContext(
      UnaryOperatorContext,
      0,
    ) as UnaryOperatorContext;
  }
  public expression(): ExpressionContext {
    return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
  }
  public get ruleIndex(): number {
    return JackParser.RULE_unaryOperation;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterUnaryOperation) {
      listener.enterUnaryOperation(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitUnaryOperation) {
      listener.exitUnaryOperation(this);
    }
  }
}

export class ArrayAccessContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public varName(): VarNameContext {
    return this.getTypedRuleContext(VarNameContext, 0) as VarNameContext;
  }
  public LBRACKET(): TerminalNode {
    return this.getToken(JackParser.LBRACKET, 0);
  }
  public expression(): ExpressionContext {
    return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
  }
  public RBRACKET(): TerminalNode {
    return this.getToken(JackParser.RBRACKET, 0);
  }
  public get ruleIndex(): number {
    return JackParser.RULE_arrayAccess;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterArrayAccess) {
      listener.enterArrayAccess(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitArrayAccess) {
      listener.exitArrayAccess(this);
    }
  }
}

export class ConstantContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public INTEGER_LITERAL(): TerminalNode {
    return this.getToken(JackParser.INTEGER_LITERAL, 0);
  }
  public STRING_LITERAL(): TerminalNode {
    return this.getToken(JackParser.STRING_LITERAL, 0);
  }
  public booleanLiteral(): BooleanLiteralContext {
    return this.getTypedRuleContext(
      BooleanLiteralContext,
      0,
    ) as BooleanLiteralContext;
  }
  public NULL_LITERAL(): TerminalNode {
    return this.getToken(JackParser.NULL_LITERAL, 0);
  }
  public THIS_LITERAL(): TerminalNode {
    return this.getToken(JackParser.THIS_LITERAL, 0);
  }
  public get ruleIndex(): number {
    return JackParser.RULE_constant;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterConstant) {
      listener.enterConstant(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitConstant) {
      listener.exitConstant(this);
    }
  }
}

export class BooleanLiteralContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public TRUE(): TerminalNode {
    return this.getToken(JackParser.TRUE, 0);
  }
  public FALSE(): TerminalNode {
    return this.getToken(JackParser.FALSE, 0);
  }
  public get ruleIndex(): number {
    return JackParser.RULE_booleanLiteral;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterBooleanLiteral) {
      listener.enterBooleanLiteral(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitBooleanLiteral) {
      listener.exitBooleanLiteral(this);
    }
  }
}

export class UnaryOperatorContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public TILDE(): TerminalNode {
    return this.getToken(JackParser.TILDE, 0);
  }
  public MINUS(): TerminalNode {
    return this.getToken(JackParser.MINUS, 0);
  }
  public get ruleIndex(): number {
    return JackParser.RULE_unaryOperator;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterUnaryOperator) {
      listener.enterUnaryOperator(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitUnaryOperator) {
      listener.exitUnaryOperator(this);
    }
  }
}

export class BinaryOperatorContext extends ParserRuleContext {
  constructor(
    parser?: JackParser,
    parent?: ParserRuleContext,
    invokingState?: number,
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public PLUS(): TerminalNode {
    return this.getToken(JackParser.PLUS, 0);
  }
  public MINUS(): TerminalNode {
    return this.getToken(JackParser.MINUS, 0);
  }
  public MUL(): TerminalNode {
    return this.getToken(JackParser.MUL, 0);
  }
  public DIV(): TerminalNode {
    return this.getToken(JackParser.DIV, 0);
  }
  public AND(): TerminalNode {
    return this.getToken(JackParser.AND, 0);
  }
  public OR(): TerminalNode {
    return this.getToken(JackParser.OR, 0);
  }
  public LESS_THAN(): TerminalNode {
    return this.getToken(JackParser.LESS_THAN, 0);
  }
  public GREATER_THAN(): TerminalNode {
    return this.getToken(JackParser.GREATER_THAN, 0);
  }
  public EQUALS(): TerminalNode {
    return this.getToken(JackParser.EQUALS, 0);
  }
  public get ruleIndex(): number {
    return JackParser.RULE_binaryOperator;
  }
  public enterRule(listener: JackParserListener): void {
    if (listener.enterBinaryOperator) {
      listener.enterBinaryOperator(this);
    }
  }
  public exitRule(listener: JackParserListener): void {
    if (listener.exitBinaryOperator) {
      listener.exitBinaryOperator(this);
    }
  }
}
