// Generated from JackParser.g4 by ANTLR 4.13.1

import * as antlr from "antlr4ng";
import { Token } from "antlr4ng";

import { JackParserListener } from "./JackParserListener.js";
// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;


import { SubroutineScope, LocalSymbolTable } from "../symbol";


export class JackParser extends antlr.Parser {
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
    public static readonly WHITESPACE = 37;
    public static readonly BLOCK_COMMENT = 38;
    public static readonly LINE_COMMENT = 39;
    public static readonly INTEGER_LITERAL = 40;
    public static readonly TRUE = 41;
    public static readonly FALSE = 42;
    public static readonly NULL_LITERAL = 43;
    public static readonly THIS_LITERAL = 44;
    public static readonly IDENTIFIER = 45;
    public static readonly STRING_LITERAL = 46;
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
    public static readonly RULE_statements = 19;
    public static readonly RULE_statement = 20;
    public static readonly RULE_letStatement = 21;
    public static readonly RULE_equals = 22;
    public static readonly RULE_ifElseStatement = 23;
    public static readonly RULE_ifStatement = 24;
    public static readonly RULE_ifExpression = 25;
    public static readonly RULE_elseStatement = 26;
    public static readonly RULE_whileStatement = 27;
    public static readonly RULE_whileExpression = 28;
    public static readonly RULE_doStatement = 29;
    public static readonly RULE_subroutineCall = 30;
    public static readonly RULE_subroutineId = 31;
    public static readonly RULE_returnStatement = 32;
    public static readonly RULE_expressionList = 33;
    public static readonly RULE_expression = 34;
    public static readonly RULE_constant = 35;
    public static readonly RULE_varName = 36;
    public static readonly RULE_arrayAccess = 37;
    public static readonly RULE_unaryOperation = 38;
    public static readonly RULE_groupedExpression = 39;
    public static readonly RULE_booleanLiteral = 40;
    public static readonly RULE_unaryOperator = 41;
    public static readonly RULE_binaryOperator = 42;

    public static readonly literalNames = [
        null, "'class'", "'constructor'", "'function'", "'method'", "'field'", 
        "'static'", "'var'", "'int'", "'char'", "'boolean'", "'void'", "'let'", 
        "'do'", "'if'", "'else'", "'while'", "'return'", "'{'", "'}'", "'('", 
        "')'", "'['", "']'", "'.'", "','", "';'", "'='", "'+'", "'-'", "'*'", 
        "'/'", "'&'", "'|'", "'~'", "'<'", "'>'", null, null, null, null, 
        "'true'", "'false'", "'null'", "'this'"
    ];

    public static readonly symbolicNames = [
        null, "CLASS", "CONSTRUCTOR", "FUNCTION", "METHOD", "FIELD", "STATIC", 
        "VAR", "INT", "CHAR", "BOOLEAN", "VOID", "LET", "DO", "IF", "ELSE", 
        "WHILE", "RETURN", "LBRACE", "RBRACE", "LPAREN", "RPAREN", "LBRACKET", 
        "RBRACKET", "DOT", "COMMA", "SEMICOLON", "EQUALS", "PLUS", "MINUS", 
        "MUL", "DIV", "AND", "OR", "TILDE", "LESS_THAN", "GREATER_THAN", 
        "WHITESPACE", "BLOCK_COMMENT", "LINE_COMMENT", "INTEGER_LITERAL", 
        "TRUE", "FALSE", "NULL_LITERAL", "THIS_LITERAL", "IDENTIFIER", "STRING_LITERAL"
    ];
    public static readonly ruleNames = [
        "program", "classDeclaration", "className", "classVarDec", "fieldList", 
        "fieldName", "subroutineDeclaration", "subroutineType", "subroutineDecWithoutType", 
        "subroutineName", "subroutineReturnType", "varType", "parameterList", 
        "parameter", "parameterName", "subroutineBody", "rBrace", "varDeclaration", 
        "varNameInDeclaration", "statements", "statement", "letStatement", 
        "equals", "ifElseStatement", "ifStatement", "ifExpression", "elseStatement", 
        "whileStatement", "whileExpression", "doStatement", "subroutineCall", 
        "subroutineId", "returnStatement", "expressionList", "expression", 
        "constant", "varName", "arrayAccess", "unaryOperation", "groupedExpression", 
        "booleanLiteral", "unaryOperator", "binaryOperator",
    ];

    public get grammarFileName(): string { return "JackParser.g4"; }
    public get literalNames(): (string | null)[] { return JackParser.literalNames; }
    public get symbolicNames(): (string | null)[] { return JackParser.symbolicNames; }
    public get ruleNames(): string[] { return JackParser.ruleNames; }
    public get serializedATN(): number[] { return JackParser._serializedATN; }

    protected createFailedPredicateException(predicate?: string, message?: string): antlr.FailedPredicateException {
        return new antlr.FailedPredicateException(this, predicate, message);
    }

    public constructor(input: antlr.TokenStream) {
        super(input);
        this.interpreter = new antlr.ParserATNSimulator(this, JackParser._ATN, JackParser.decisionsToDFA, new antlr.PredictionContextCache());
    }
    public program(): ProgramContext {
        let localContext = new ProgramContext(this.context, this.state);
        this.enterRule(localContext, 0, JackParser.RULE_program);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 86;
            this.classDeclaration();
            this.state = 87;
            this.match(JackParser.EOF);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public classDeclaration(): ClassDeclarationContext {
        let localContext = new ClassDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 2, JackParser.RULE_classDeclaration);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 89;
            this.match(JackParser.CLASS);
            this.state = 90;
            this.className();
            this.state = 91;
            this.match(JackParser.LBRACE);
            this.state = 95;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 5 || _la === 6) {
                {
                {
                this.state = 92;
                this.classVarDec();
                }
                }
                this.state = 97;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 101;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 28) !== 0)) {
                {
                {
                this.state = 98;
                this.subroutineDeclaration();
                }
                }
                this.state = 103;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 104;
            this.rBrace();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public className(): ClassNameContext {
        let localContext = new ClassNameContext(this.context, this.state);
        this.enterRule(localContext, 4, JackParser.RULE_className);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 106;
            this.match(JackParser.IDENTIFIER);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public classVarDec(): ClassVarDecContext {
        let localContext = new ClassVarDecContext(this.context, this.state);
        this.enterRule(localContext, 6, JackParser.RULE_classVarDec);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 108;
            _la = this.tokenStream.LA(1);
            if(!(_la === 5 || _la === 6)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            this.state = 109;
            this.fieldList();
            this.state = 110;
            this.match(JackParser.SEMICOLON);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public fieldList(): FieldListContext {
        let localContext = new FieldListContext(this.context, this.state);
        this.enterRule(localContext, 8, JackParser.RULE_fieldList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 112;
            this.varType();
            this.state = 113;
            this.fieldName();
            this.state = 118;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
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
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public fieldName(): FieldNameContext {
        let localContext = new FieldNameContext(this.context, this.state);
        this.enterRule(localContext, 10, JackParser.RULE_fieldName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 121;
            this.match(JackParser.IDENTIFIER);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public subroutineDeclaration(): SubroutineDeclarationContext {
        let localContext = new SubroutineDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 12, JackParser.RULE_subroutineDeclaration);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 123;
            this.subroutineType();
            this.state = 124;
            this.subroutineDecWithoutType();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public subroutineType(): SubroutineTypeContext {
        let localContext = new SubroutineTypeContext(this.context, this.state);
        this.enterRule(localContext, 14, JackParser.RULE_subroutineType);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 126;
            _la = this.tokenStream.LA(1);
            if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 28) !== 0))) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public subroutineDecWithoutType(): SubroutineDecWithoutTypeContext {
        let localContext = new SubroutineDecWithoutTypeContext(this.context, this.state);
        this.enterRule(localContext, 16, JackParser.RULE_subroutineDecWithoutType);
        try {
            this.enterOuterAlt(localContext, 1);
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
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public subroutineName(): SubroutineNameContext {
        let localContext = new SubroutineNameContext(this.context, this.state);
        this.enterRule(localContext, 18, JackParser.RULE_subroutineName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 135;
            this.match(JackParser.IDENTIFIER);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public subroutineReturnType(): SubroutineReturnTypeContext {
        let localContext = new SubroutineReturnTypeContext(this.context, this.state);
        this.enterRule(localContext, 20, JackParser.RULE_subroutineReturnType);
        try {
            this.state = 139;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case JackParser.INT:
            case JackParser.CHAR:
            case JackParser.BOOLEAN:
            case JackParser.IDENTIFIER:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 137;
                this.varType();
                }
                break;
            case JackParser.VOID:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 138;
                this.match(JackParser.VOID);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public varType(): VarTypeContext {
        let localContext = new VarTypeContext(this.context, this.state);
        this.enterRule(localContext, 22, JackParser.RULE_varType);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 141;
            _la = this.tokenStream.LA(1);
            if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 1792) !== 0) || _la === 45)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public parameterList(): ParameterListContext {
        let localContext = new ParameterListContext(this.context, this.state);
        this.enterRule(localContext, 24, JackParser.RULE_parameterList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 151;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 1792) !== 0) || _la === 45) {
                {
                this.state = 143;
                this.parameter();
                this.state = 148;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
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
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public parameter(): ParameterContext {
        let localContext = new ParameterContext(this.context, this.state);
        this.enterRule(localContext, 26, JackParser.RULE_parameter);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 153;
            this.varType();
            this.state = 154;
            this.parameterName();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public parameterName(): ParameterNameContext {
        let localContext = new ParameterNameContext(this.context, this.state);
        this.enterRule(localContext, 28, JackParser.RULE_parameterName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 156;
            this.match(JackParser.IDENTIFIER);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public subroutineBody(): SubroutineBodyContext {
        let localContext = new SubroutineBodyContext(this.context, this.state);
        this.enterRule(localContext, 30, JackParser.RULE_subroutineBody);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 158;
            this.match(JackParser.LBRACE);
            this.state = 162;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 7) {
                {
                {
                this.state = 159;
                this.varDeclaration();
                }
                }
                this.state = 164;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 165;
            this.statements();
            this.state = 166;
            this.rBrace();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public rBrace(): RBraceContext {
        let localContext = new RBraceContext(this.context, this.state);
        this.enterRule(localContext, 32, JackParser.RULE_rBrace);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 168;
            this.match(JackParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public varDeclaration(): VarDeclarationContext {
        let localContext = new VarDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 34, JackParser.RULE_varDeclaration);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 170;
            this.match(JackParser.VAR);
            this.state = 171;
            this.varType();
            this.state = 172;
            this.varNameInDeclaration();
            this.state = 177;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
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
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 180;
            this.match(JackParser.SEMICOLON);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public varNameInDeclaration(): VarNameInDeclarationContext {
        let localContext = new VarNameInDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 36, JackParser.RULE_varNameInDeclaration);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 182;
            this.match(JackParser.IDENTIFIER);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public statements(): StatementsContext {
        let localContext = new StatementsContext(this.context, this.state);
        this.enterRule(localContext, 38, JackParser.RULE_statements);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 187;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 225280) !== 0)) {
                {
                {
                this.state = 184;
                this.statement();
                }
                }
                this.state = 189;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public statement(): StatementContext {
        let localContext = new StatementContext(this.context, this.state);
        this.enterRule(localContext, 40, JackParser.RULE_statement);
        try {
            this.state = 195;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case JackParser.LET:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 190;
                this.letStatement();
                }
                break;
            case JackParser.IF:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 191;
                this.ifElseStatement();
                }
                break;
            case JackParser.WHILE:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 192;
                this.whileStatement();
                }
                break;
            case JackParser.DO:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 193;
                this.doStatement();
                }
                break;
            case JackParser.RETURN:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 194;
                this.returnStatement();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public letStatement(): LetStatementContext {
        let localContext = new LetStatementContext(this.context, this.state);
        this.enterRule(localContext, 42, JackParser.RULE_letStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 197;
            this.match(JackParser.LET);
            this.state = 200;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 10, this.context) ) {
            case 1:
                {
                this.state = 198;
                this.varName();
                }
                break;
            case 2:
                {
                this.state = 199;
                this.arrayAccess();
                }
                break;
            }
            this.state = 202;
            this.equals();
            this.state = 203;
            this.expression(0);
            this.state = 204;
            this.match(JackParser.SEMICOLON);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public equals(): EqualsContext {
        let localContext = new EqualsContext(this.context, this.state);
        this.enterRule(localContext, 44, JackParser.RULE_equals);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 206;
            this.match(JackParser.EQUALS);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public ifElseStatement(): IfElseStatementContext {
        let localContext = new IfElseStatementContext(this.context, this.state);
        this.enterRule(localContext, 46, JackParser.RULE_ifElseStatement);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 208;
            this.ifStatement();
            this.state = 210;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 15) {
                {
                this.state = 209;
                this.elseStatement();
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public ifStatement(): IfStatementContext {
        let localContext = new IfStatementContext(this.context, this.state);
        this.enterRule(localContext, 48, JackParser.RULE_ifStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 212;
            this.match(JackParser.IF);
            this.state = 213;
            this.match(JackParser.LPAREN);
            this.state = 214;
            this.ifExpression();
            this.state = 215;
            this.match(JackParser.RPAREN);
            this.state = 216;
            this.match(JackParser.LBRACE);
            this.state = 217;
            this.statements();
            this.state = 218;
            this.rBrace();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public ifExpression(): IfExpressionContext {
        let localContext = new IfExpressionContext(this.context, this.state);
        this.enterRule(localContext, 50, JackParser.RULE_ifExpression);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 220;
            this.expression(0);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public elseStatement(): ElseStatementContext {
        let localContext = new ElseStatementContext(this.context, this.state);
        this.enterRule(localContext, 52, JackParser.RULE_elseStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 222;
            this.match(JackParser.ELSE);
            this.state = 223;
            this.match(JackParser.LBRACE);
            this.state = 224;
            this.statements();
            this.state = 225;
            this.rBrace();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public whileStatement(): WhileStatementContext {
        let localContext = new WhileStatementContext(this.context, this.state);
        this.enterRule(localContext, 54, JackParser.RULE_whileStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 227;
            this.match(JackParser.WHILE);
            this.state = 228;
            this.match(JackParser.LPAREN);
            this.state = 229;
            this.whileExpression();
            this.state = 230;
            this.match(JackParser.RPAREN);
            this.state = 231;
            this.match(JackParser.LBRACE);
            this.state = 232;
            this.statements();
            this.state = 233;
            this.rBrace();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public whileExpression(): WhileExpressionContext {
        let localContext = new WhileExpressionContext(this.context, this.state);
        this.enterRule(localContext, 56, JackParser.RULE_whileExpression);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 235;
            this.expression(0);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public doStatement(): DoStatementContext {
        let localContext = new DoStatementContext(this.context, this.state);
        this.enterRule(localContext, 58, JackParser.RULE_doStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 237;
            this.match(JackParser.DO);
            this.state = 238;
            this.subroutineCall();
            this.state = 239;
            this.match(JackParser.SEMICOLON);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public subroutineCall(): SubroutineCallContext {
        let localContext = new SubroutineCallContext(this.context, this.state);
        this.enterRule(localContext, 60, JackParser.RULE_subroutineCall);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 241;
            this.subroutineId();
            this.state = 242;
            this.match(JackParser.LPAREN);
            this.state = 243;
            this.expressionList();
            this.state = 244;
            this.match(JackParser.RPAREN);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public subroutineId(): SubroutineIdContext {
        let localContext = new SubroutineIdContext(this.context, this.state);
        this.enterRule(localContext, 62, JackParser.RULE_subroutineId);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 251;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 13, this.context) ) {
            case 1:
                {
                this.state = 248;
                this.errorHandler.sync(this);
                switch (this.tokenStream.LA(1)) {
                case JackParser.IDENTIFIER:
                    {
                    this.state = 246;
                    this.className();
                    }
                    break;
                case JackParser.THIS_LITERAL:
                    {
                    this.state = 247;
                    this.match(JackParser.THIS_LITERAL);
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 250;
                this.match(JackParser.DOT);
                }
                break;
            }
            this.state = 253;
            this.subroutineName();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public returnStatement(): ReturnStatementContext {
        let localContext = new ReturnStatementContext(this.context, this.state);
        this.enterRule(localContext, 64, JackParser.RULE_returnStatement);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 255;
            this.match(JackParser.RETURN);
            this.state = 257;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 20)) & ~0x1F) === 0 && ((1 << (_la - 20)) & 133186049) !== 0)) {
                {
                this.state = 256;
                this.expression(0);
                }
            }

            this.state = 259;
            this.match(JackParser.SEMICOLON);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public expressionList(): ExpressionListContext {
        let localContext = new ExpressionListContext(this.context, this.state);
        this.enterRule(localContext, 66, JackParser.RULE_expressionList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 269;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 20)) & ~0x1F) === 0 && ((1 << (_la - 20)) & 133186049) !== 0)) {
                {
                this.state = 261;
                this.expression(0);
                this.state = 266;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 25) {
                    {
                    {
                    this.state = 262;
                    this.match(JackParser.COMMA);
                    this.state = 263;
                    this.expression(0);
                    }
                    }
                    this.state = 268;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }

    public expression(): ExpressionContext;
    public expression(_p: number): ExpressionContext;
    public expression(_p?: number): ExpressionContext {
        if (_p === undefined) {
            _p = 0;
        }

        let parentContext = this.context;
        let parentState = this.state;
        let localContext = new ExpressionContext(this.context, parentState);
        let previousContext = localContext;
        let _startState = 68;
        this.enterRecursionRule(localContext, 68, JackParser.RULE_expression, _p);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 278;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 17, this.context) ) {
            case 1:
                {
                this.state = 272;
                this.constant();
                }
                break;
            case 2:
                {
                this.state = 273;
                this.varName();
                }
                break;
            case 3:
                {
                this.state = 274;
                this.subroutineCall();
                }
                break;
            case 4:
                {
                this.state = 275;
                this.arrayAccess();
                }
                break;
            case 5:
                {
                this.state = 276;
                this.unaryOperation();
                }
                break;
            case 6:
                {
                this.state = 277;
                this.groupedExpression();
                }
                break;
            }
            this.context!.stop = this.tokenStream.LT(-1);
            this.state = 286;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 18, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    if (this.parseListeners != null) {
                        this.triggerExitRuleEvent();
                    }
                    previousContext = localContext;
                    {
                    {
                    localContext = new ExpressionContext(parentContext, parentState);
                    this.pushNewRecursionContext(localContext, _startState, JackParser.RULE_expression);
                    this.state = 280;
                    if (!(this.precpred(this.context, 2))) {
                        throw this.createFailedPredicateException("this.precpred(this.context, 2)");
                    }
                    this.state = 281;
                    this.binaryOperator();
                    this.state = 282;
                    this.expression(3);
                    }
                    }
                }
                this.state = 288;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 18, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.unrollRecursionContexts(parentContext);
        }
        return localContext;
    }
    public constant(): ConstantContext {
        let localContext = new ConstantContext(this.context, this.state);
        this.enterRule(localContext, 70, JackParser.RULE_constant);
        try {
            this.state = 294;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case JackParser.INTEGER_LITERAL:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 289;
                this.match(JackParser.INTEGER_LITERAL);
                }
                break;
            case JackParser.STRING_LITERAL:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 290;
                this.match(JackParser.STRING_LITERAL);
                }
                break;
            case JackParser.TRUE:
            case JackParser.FALSE:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 291;
                this.booleanLiteral();
                }
                break;
            case JackParser.NULL_LITERAL:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 292;
                this.match(JackParser.NULL_LITERAL);
                }
                break;
            case JackParser.THIS_LITERAL:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 293;
                this.match(JackParser.THIS_LITERAL);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public varName(): VarNameContext {
        let localContext = new VarNameContext(this.context, this.state);
        this.enterRule(localContext, 72, JackParser.RULE_varName);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 296;
            this.match(JackParser.IDENTIFIER);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public arrayAccess(): ArrayAccessContext {
        let localContext = new ArrayAccessContext(this.context, this.state);
        this.enterRule(localContext, 74, JackParser.RULE_arrayAccess);
        try {
            this.enterOuterAlt(localContext, 1);
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
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public unaryOperation(): UnaryOperationContext {
        let localContext = new UnaryOperationContext(this.context, this.state);
        this.enterRule(localContext, 76, JackParser.RULE_unaryOperation);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 303;
            this.unaryOperator();
            this.state = 304;
            this.expression(0);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public groupedExpression(): GroupedExpressionContext {
        let localContext = new GroupedExpressionContext(this.context, this.state);
        this.enterRule(localContext, 78, JackParser.RULE_groupedExpression);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 306;
            this.match(JackParser.LPAREN);
            this.state = 307;
            this.expression(0);
            this.state = 308;
            this.match(JackParser.RPAREN);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public booleanLiteral(): BooleanLiteralContext {
        let localContext = new BooleanLiteralContext(this.context, this.state);
        this.enterRule(localContext, 80, JackParser.RULE_booleanLiteral);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 310;
            _la = this.tokenStream.LA(1);
            if(!(_la === 41 || _la === 42)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public unaryOperator(): UnaryOperatorContext {
        let localContext = new UnaryOperatorContext(this.context, this.state);
        this.enterRule(localContext, 82, JackParser.RULE_unaryOperator);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 312;
            _la = this.tokenStream.LA(1);
            if(!(_la === 29 || _la === 34)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public binaryOperator(): BinaryOperatorContext {
        let localContext = new BinaryOperatorContext(this.context, this.state);
        this.enterRule(localContext, 84, JackParser.RULE_binaryOperator);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 314;
            _la = this.tokenStream.LA(1);
            if(!(((((_la - 27)) & ~0x1F) === 0 && ((1 << (_la - 27)) & 895) !== 0))) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }

    public override sempred(localContext: antlr.ParserRuleContext | null, ruleIndex: number, predIndex: number): boolean {
        switch (ruleIndex) {
        case 34:
            return this.expression_sempred(localContext as ExpressionContext, predIndex);
        }
        return true;
    }
    private expression_sempred(localContext: ExpressionContext | null, predIndex: number): boolean {
        switch (predIndex) {
        case 0:
            return this.precpred(this.context, 2);
        }
        return true;
    }

    public static readonly _serializedATN: number[] = [
        4,1,46,317,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,
        6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,
        2,14,7,14,2,15,7,15,2,16,7,16,2,17,7,17,2,18,7,18,2,19,7,19,2,20,
        7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,24,2,25,7,25,2,26,7,26,
        2,27,7,27,2,28,7,28,2,29,7,29,2,30,7,30,2,31,7,31,2,32,7,32,2,33,
        7,33,2,34,7,34,2,35,7,35,2,36,7,36,2,37,7,37,2,38,7,38,2,39,7,39,
        2,40,7,40,2,41,7,41,2,42,7,42,1,0,1,0,1,0,1,1,1,1,1,1,1,1,5,1,94,
        8,1,10,1,12,1,97,9,1,1,1,5,1,100,8,1,10,1,12,1,103,9,1,1,1,1,1,1,
        2,1,2,1,3,1,3,1,3,1,3,1,4,1,4,1,4,1,4,5,4,117,8,4,10,4,12,4,120,
        9,4,1,5,1,5,1,6,1,6,1,6,1,7,1,7,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,9,
        1,9,1,10,1,10,3,10,140,8,10,1,11,1,11,1,12,1,12,1,12,5,12,147,8,
        12,10,12,12,12,150,9,12,3,12,152,8,12,1,13,1,13,1,13,1,14,1,14,1,
        15,1,15,5,15,161,8,15,10,15,12,15,164,9,15,1,15,1,15,1,15,1,16,1,
        16,1,17,1,17,1,17,1,17,1,17,5,17,176,8,17,10,17,12,17,179,9,17,1,
        17,1,17,1,18,1,18,1,19,5,19,186,8,19,10,19,12,19,189,9,19,1,20,1,
        20,1,20,1,20,1,20,3,20,196,8,20,1,21,1,21,1,21,3,21,201,8,21,1,21,
        1,21,1,21,1,21,1,22,1,22,1,23,1,23,3,23,211,8,23,1,24,1,24,1,24,
        1,24,1,24,1,24,1,24,1,24,1,25,1,25,1,26,1,26,1,26,1,26,1,26,1,27,
        1,27,1,27,1,27,1,27,1,27,1,27,1,27,1,28,1,28,1,29,1,29,1,29,1,29,
        1,30,1,30,1,30,1,30,1,30,1,31,1,31,3,31,249,8,31,1,31,3,31,252,8,
        31,1,31,1,31,1,32,1,32,3,32,258,8,32,1,32,1,32,1,33,1,33,1,33,5,
        33,265,8,33,10,33,12,33,268,9,33,3,33,270,8,33,1,34,1,34,1,34,1,
        34,1,34,1,34,1,34,3,34,279,8,34,1,34,1,34,1,34,1,34,5,34,285,8,34,
        10,34,12,34,288,9,34,1,35,1,35,1,35,1,35,1,35,3,35,295,8,35,1,36,
        1,36,1,37,1,37,1,37,1,37,1,37,1,38,1,38,1,38,1,39,1,39,1,39,1,39,
        1,40,1,40,1,41,1,41,1,42,1,42,1,42,0,1,68,43,0,2,4,6,8,10,12,14,
        16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,
        60,62,64,66,68,70,72,74,76,78,80,82,84,0,6,1,0,5,6,1,0,2,4,2,0,8,
        10,45,45,1,0,41,42,2,0,29,29,34,34,2,0,27,33,35,36,303,0,86,1,0,
        0,0,2,89,1,0,0,0,4,106,1,0,0,0,6,108,1,0,0,0,8,112,1,0,0,0,10,121,
        1,0,0,0,12,123,1,0,0,0,14,126,1,0,0,0,16,128,1,0,0,0,18,135,1,0,
        0,0,20,139,1,0,0,0,22,141,1,0,0,0,24,151,1,0,0,0,26,153,1,0,0,0,
        28,156,1,0,0,0,30,158,1,0,0,0,32,168,1,0,0,0,34,170,1,0,0,0,36,182,
        1,0,0,0,38,187,1,0,0,0,40,195,1,0,0,0,42,197,1,0,0,0,44,206,1,0,
        0,0,46,208,1,0,0,0,48,212,1,0,0,0,50,220,1,0,0,0,52,222,1,0,0,0,
        54,227,1,0,0,0,56,235,1,0,0,0,58,237,1,0,0,0,60,241,1,0,0,0,62,251,
        1,0,0,0,64,255,1,0,0,0,66,269,1,0,0,0,68,278,1,0,0,0,70,294,1,0,
        0,0,72,296,1,0,0,0,74,298,1,0,0,0,76,303,1,0,0,0,78,306,1,0,0,0,
        80,310,1,0,0,0,82,312,1,0,0,0,84,314,1,0,0,0,86,87,3,2,1,0,87,88,
        5,0,0,1,88,1,1,0,0,0,89,90,5,1,0,0,90,91,3,4,2,0,91,95,5,18,0,0,
        92,94,3,6,3,0,93,92,1,0,0,0,94,97,1,0,0,0,95,93,1,0,0,0,95,96,1,
        0,0,0,96,101,1,0,0,0,97,95,1,0,0,0,98,100,3,12,6,0,99,98,1,0,0,0,
        100,103,1,0,0,0,101,99,1,0,0,0,101,102,1,0,0,0,102,104,1,0,0,0,103,
        101,1,0,0,0,104,105,3,32,16,0,105,3,1,0,0,0,106,107,5,45,0,0,107,
        5,1,0,0,0,108,109,7,0,0,0,109,110,3,8,4,0,110,111,5,26,0,0,111,7,
        1,0,0,0,112,113,3,22,11,0,113,118,3,10,5,0,114,115,5,25,0,0,115,
        117,3,10,5,0,116,114,1,0,0,0,117,120,1,0,0,0,118,116,1,0,0,0,118,
        119,1,0,0,0,119,9,1,0,0,0,120,118,1,0,0,0,121,122,5,45,0,0,122,11,
        1,0,0,0,123,124,3,14,7,0,124,125,3,16,8,0,125,13,1,0,0,0,126,127,
        7,1,0,0,127,15,1,0,0,0,128,129,3,20,10,0,129,130,3,18,9,0,130,131,
        5,20,0,0,131,132,3,24,12,0,132,133,5,21,0,0,133,134,3,30,15,0,134,
        17,1,0,0,0,135,136,5,45,0,0,136,19,1,0,0,0,137,140,3,22,11,0,138,
        140,5,11,0,0,139,137,1,0,0,0,139,138,1,0,0,0,140,21,1,0,0,0,141,
        142,7,2,0,0,142,23,1,0,0,0,143,148,3,26,13,0,144,145,5,25,0,0,145,
        147,3,26,13,0,146,144,1,0,0,0,147,150,1,0,0,0,148,146,1,0,0,0,148,
        149,1,0,0,0,149,152,1,0,0,0,150,148,1,0,0,0,151,143,1,0,0,0,151,
        152,1,0,0,0,152,25,1,0,0,0,153,154,3,22,11,0,154,155,3,28,14,0,155,
        27,1,0,0,0,156,157,5,45,0,0,157,29,1,0,0,0,158,162,5,18,0,0,159,
        161,3,34,17,0,160,159,1,0,0,0,161,164,1,0,0,0,162,160,1,0,0,0,162,
        163,1,0,0,0,163,165,1,0,0,0,164,162,1,0,0,0,165,166,3,38,19,0,166,
        167,3,32,16,0,167,31,1,0,0,0,168,169,5,19,0,0,169,33,1,0,0,0,170,
        171,5,7,0,0,171,172,3,22,11,0,172,177,3,36,18,0,173,174,5,25,0,0,
        174,176,3,36,18,0,175,173,1,0,0,0,176,179,1,0,0,0,177,175,1,0,0,
        0,177,178,1,0,0,0,178,180,1,0,0,0,179,177,1,0,0,0,180,181,5,26,0,
        0,181,35,1,0,0,0,182,183,5,45,0,0,183,37,1,0,0,0,184,186,3,40,20,
        0,185,184,1,0,0,0,186,189,1,0,0,0,187,185,1,0,0,0,187,188,1,0,0,
        0,188,39,1,0,0,0,189,187,1,0,0,0,190,196,3,42,21,0,191,196,3,46,
        23,0,192,196,3,54,27,0,193,196,3,58,29,0,194,196,3,64,32,0,195,190,
        1,0,0,0,195,191,1,0,0,0,195,192,1,0,0,0,195,193,1,0,0,0,195,194,
        1,0,0,0,196,41,1,0,0,0,197,200,5,12,0,0,198,201,3,72,36,0,199,201,
        3,74,37,0,200,198,1,0,0,0,200,199,1,0,0,0,201,202,1,0,0,0,202,203,
        3,44,22,0,203,204,3,68,34,0,204,205,5,26,0,0,205,43,1,0,0,0,206,
        207,5,27,0,0,207,45,1,0,0,0,208,210,3,48,24,0,209,211,3,52,26,0,
        210,209,1,0,0,0,210,211,1,0,0,0,211,47,1,0,0,0,212,213,5,14,0,0,
        213,214,5,20,0,0,214,215,3,50,25,0,215,216,5,21,0,0,216,217,5,18,
        0,0,217,218,3,38,19,0,218,219,3,32,16,0,219,49,1,0,0,0,220,221,3,
        68,34,0,221,51,1,0,0,0,222,223,5,15,0,0,223,224,5,18,0,0,224,225,
        3,38,19,0,225,226,3,32,16,0,226,53,1,0,0,0,227,228,5,16,0,0,228,
        229,5,20,0,0,229,230,3,56,28,0,230,231,5,21,0,0,231,232,5,18,0,0,
        232,233,3,38,19,0,233,234,3,32,16,0,234,55,1,0,0,0,235,236,3,68,
        34,0,236,57,1,0,0,0,237,238,5,13,0,0,238,239,3,60,30,0,239,240,5,
        26,0,0,240,59,1,0,0,0,241,242,3,62,31,0,242,243,5,20,0,0,243,244,
        3,66,33,0,244,245,5,21,0,0,245,61,1,0,0,0,246,249,3,4,2,0,247,249,
        5,44,0,0,248,246,1,0,0,0,248,247,1,0,0,0,249,250,1,0,0,0,250,252,
        5,24,0,0,251,248,1,0,0,0,251,252,1,0,0,0,252,253,1,0,0,0,253,254,
        3,18,9,0,254,63,1,0,0,0,255,257,5,17,0,0,256,258,3,68,34,0,257,256,
        1,0,0,0,257,258,1,0,0,0,258,259,1,0,0,0,259,260,5,26,0,0,260,65,
        1,0,0,0,261,266,3,68,34,0,262,263,5,25,0,0,263,265,3,68,34,0,264,
        262,1,0,0,0,265,268,1,0,0,0,266,264,1,0,0,0,266,267,1,0,0,0,267,
        270,1,0,0,0,268,266,1,0,0,0,269,261,1,0,0,0,269,270,1,0,0,0,270,
        67,1,0,0,0,271,272,6,34,-1,0,272,279,3,70,35,0,273,279,3,72,36,0,
        274,279,3,60,30,0,275,279,3,74,37,0,276,279,3,76,38,0,277,279,3,
        78,39,0,278,271,1,0,0,0,278,273,1,0,0,0,278,274,1,0,0,0,278,275,
        1,0,0,0,278,276,1,0,0,0,278,277,1,0,0,0,279,286,1,0,0,0,280,281,
        10,2,0,0,281,282,3,84,42,0,282,283,3,68,34,3,283,285,1,0,0,0,284,
        280,1,0,0,0,285,288,1,0,0,0,286,284,1,0,0,0,286,287,1,0,0,0,287,
        69,1,0,0,0,288,286,1,0,0,0,289,295,5,40,0,0,290,295,5,46,0,0,291,
        295,3,80,40,0,292,295,5,43,0,0,293,295,5,44,0,0,294,289,1,0,0,0,
        294,290,1,0,0,0,294,291,1,0,0,0,294,292,1,0,0,0,294,293,1,0,0,0,
        295,71,1,0,0,0,296,297,5,45,0,0,297,73,1,0,0,0,298,299,3,72,36,0,
        299,300,5,22,0,0,300,301,3,68,34,0,301,302,5,23,0,0,302,75,1,0,0,
        0,303,304,3,82,41,0,304,305,3,68,34,0,305,77,1,0,0,0,306,307,5,20,
        0,0,307,308,3,68,34,0,308,309,5,21,0,0,309,79,1,0,0,0,310,311,7,
        3,0,0,311,81,1,0,0,0,312,313,7,4,0,0,313,83,1,0,0,0,314,315,7,5,
        0,0,315,85,1,0,0,0,20,95,101,118,139,148,151,162,177,187,195,200,
        210,248,251,257,266,269,278,286,294
    ];

    private static __ATN: antlr.ATN;
    public static get _ATN(): antlr.ATN {
        if (!JackParser.__ATN) {
            JackParser.__ATN = new antlr.ATNDeserializer().deserialize(JackParser._serializedATN);
        }

        return JackParser.__ATN;
    }


    private static readonly vocabulary = new antlr.Vocabulary(JackParser.literalNames, JackParser.symbolicNames, []);

    public override get vocabulary(): antlr.Vocabulary {
        return JackParser.vocabulary;
    }

    private static readonly decisionsToDFA = JackParser._ATN.decisionToState.map( (ds: antlr.DecisionState, index: number) => new antlr.DFA(ds, index) );
}

export class ProgramContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public classDeclaration(): ClassDeclarationContext {
        return this.getRuleContext(0, ClassDeclarationContext)!;
    }
    public EOF(): antlr.TerminalNode {
        return this.getToken(JackParser.EOF, 0)!;
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_program;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterProgram) {
             listener.enterProgram(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitProgram) {
             listener.exitProgram(this);
        }
    }
}


export class ClassDeclarationContext extends antlr.ParserRuleContext {
    public localSymbolTable: LocalSymbolTable | undefined;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public CLASS(): antlr.TerminalNode {
        return this.getToken(JackParser.CLASS, 0)!;
    }
    public className(): ClassNameContext {
        return this.getRuleContext(0, ClassNameContext)!;
    }
    public LBRACE(): antlr.TerminalNode {
        return this.getToken(JackParser.LBRACE, 0)!;
    }
    public rBrace(): RBraceContext {
        return this.getRuleContext(0, RBraceContext)!;
    }
    public classVarDec(): ClassVarDecContext[];
    public classVarDec(i: number): ClassVarDecContext | null;
    public classVarDec(i?: number): ClassVarDecContext[] | ClassVarDecContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ClassVarDecContext);
        }

        return this.getRuleContext(i, ClassVarDecContext);
    }
    public subroutineDeclaration(): SubroutineDeclarationContext[];
    public subroutineDeclaration(i: number): SubroutineDeclarationContext | null;
    public subroutineDeclaration(i?: number): SubroutineDeclarationContext[] | SubroutineDeclarationContext | null {
        if (i === undefined) {
            return this.getRuleContexts(SubroutineDeclarationContext);
        }

        return this.getRuleContext(i, SubroutineDeclarationContext);
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_classDeclaration;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterClassDeclaration) {
             listener.enterClassDeclaration(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitClassDeclaration) {
             listener.exitClassDeclaration(this);
        }
    }
}


export class ClassNameContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(JackParser.IDENTIFIER, 0)!;
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_className;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterClassName) {
             listener.enterClassName(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitClassName) {
             listener.exitClassName(this);
        }
    }
}


export class ClassVarDecContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public fieldList(): FieldListContext {
        return this.getRuleContext(0, FieldListContext)!;
    }
    public SEMICOLON(): antlr.TerminalNode {
        return this.getToken(JackParser.SEMICOLON, 0)!;
    }
    public STATIC(): antlr.TerminalNode | null {
        return this.getToken(JackParser.STATIC, 0);
    }
    public FIELD(): antlr.TerminalNode | null {
        return this.getToken(JackParser.FIELD, 0);
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_classVarDec;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterClassVarDec) {
             listener.enterClassVarDec(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitClassVarDec) {
             listener.exitClassVarDec(this);
        }
    }
}


export class FieldListContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public varType(): VarTypeContext {
        return this.getRuleContext(0, VarTypeContext)!;
    }
    public fieldName(): FieldNameContext[];
    public fieldName(i: number): FieldNameContext | null;
    public fieldName(i?: number): FieldNameContext[] | FieldNameContext | null {
        if (i === undefined) {
            return this.getRuleContexts(FieldNameContext);
        }

        return this.getRuleContext(i, FieldNameContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(JackParser.COMMA);
    	} else {
    		return this.getToken(JackParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_fieldList;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterFieldList) {
             listener.enterFieldList(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitFieldList) {
             listener.exitFieldList(this);
        }
    }
}


export class FieldNameContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(JackParser.IDENTIFIER, 0)!;
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_fieldName;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterFieldName) {
             listener.enterFieldName(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitFieldName) {
             listener.exitFieldName(this);
        }
    }
}


export class SubroutineDeclarationContext extends antlr.ParserRuleContext {
    public symbols: SubroutineScope | undefined;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public subroutineType(): SubroutineTypeContext {
        return this.getRuleContext(0, SubroutineTypeContext)!;
    }
    public subroutineDecWithoutType(): SubroutineDecWithoutTypeContext {
        return this.getRuleContext(0, SubroutineDecWithoutTypeContext)!;
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_subroutineDeclaration;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterSubroutineDeclaration) {
             listener.enterSubroutineDeclaration(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitSubroutineDeclaration) {
             listener.exitSubroutineDeclaration(this);
        }
    }
}


export class SubroutineTypeContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public CONSTRUCTOR(): antlr.TerminalNode | null {
        return this.getToken(JackParser.CONSTRUCTOR, 0);
    }
    public METHOD(): antlr.TerminalNode | null {
        return this.getToken(JackParser.METHOD, 0);
    }
    public FUNCTION(): antlr.TerminalNode | null {
        return this.getToken(JackParser.FUNCTION, 0);
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_subroutineType;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterSubroutineType) {
             listener.enterSubroutineType(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitSubroutineType) {
             listener.exitSubroutineType(this);
        }
    }
}


export class SubroutineDecWithoutTypeContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public subroutineReturnType(): SubroutineReturnTypeContext {
        return this.getRuleContext(0, SubroutineReturnTypeContext)!;
    }
    public subroutineName(): SubroutineNameContext {
        return this.getRuleContext(0, SubroutineNameContext)!;
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(JackParser.LPAREN, 0)!;
    }
    public parameterList(): ParameterListContext {
        return this.getRuleContext(0, ParameterListContext)!;
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(JackParser.RPAREN, 0)!;
    }
    public subroutineBody(): SubroutineBodyContext {
        return this.getRuleContext(0, SubroutineBodyContext)!;
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_subroutineDecWithoutType;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterSubroutineDecWithoutType) {
             listener.enterSubroutineDecWithoutType(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitSubroutineDecWithoutType) {
             listener.exitSubroutineDecWithoutType(this);
        }
    }
}


export class SubroutineNameContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(JackParser.IDENTIFIER, 0)!;
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_subroutineName;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterSubroutineName) {
             listener.enterSubroutineName(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitSubroutineName) {
             listener.exitSubroutineName(this);
        }
    }
}


export class SubroutineReturnTypeContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public varType(): VarTypeContext | null {
        return this.getRuleContext(0, VarTypeContext);
    }
    public VOID(): antlr.TerminalNode | null {
        return this.getToken(JackParser.VOID, 0);
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_subroutineReturnType;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterSubroutineReturnType) {
             listener.enterSubroutineReturnType(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitSubroutineReturnType) {
             listener.exitSubroutineReturnType(this);
        }
    }
}


export class VarTypeContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public INT(): antlr.TerminalNode | null {
        return this.getToken(JackParser.INT, 0);
    }
    public CHAR(): antlr.TerminalNode | null {
        return this.getToken(JackParser.CHAR, 0);
    }
    public BOOLEAN(): antlr.TerminalNode | null {
        return this.getToken(JackParser.BOOLEAN, 0);
    }
    public IDENTIFIER(): antlr.TerminalNode | null {
        return this.getToken(JackParser.IDENTIFIER, 0);
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_varType;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterVarType) {
             listener.enterVarType(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitVarType) {
             listener.exitVarType(this);
        }
    }
}


export class ParameterListContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public parameter(): ParameterContext[];
    public parameter(i: number): ParameterContext | null;
    public parameter(i?: number): ParameterContext[] | ParameterContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ParameterContext);
        }

        return this.getRuleContext(i, ParameterContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(JackParser.COMMA);
    	} else {
    		return this.getToken(JackParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_parameterList;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterParameterList) {
             listener.enterParameterList(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitParameterList) {
             listener.exitParameterList(this);
        }
    }
}


export class ParameterContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public varType(): VarTypeContext {
        return this.getRuleContext(0, VarTypeContext)!;
    }
    public parameterName(): ParameterNameContext {
        return this.getRuleContext(0, ParameterNameContext)!;
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_parameter;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterParameter) {
             listener.enterParameter(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitParameter) {
             listener.exitParameter(this);
        }
    }
}


export class ParameterNameContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(JackParser.IDENTIFIER, 0)!;
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_parameterName;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterParameterName) {
             listener.enterParameterName(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitParameterName) {
             listener.exitParameterName(this);
        }
    }
}


export class SubroutineBodyContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LBRACE(): antlr.TerminalNode {
        return this.getToken(JackParser.LBRACE, 0)!;
    }
    public statements(): StatementsContext {
        return this.getRuleContext(0, StatementsContext)!;
    }
    public rBrace(): RBraceContext {
        return this.getRuleContext(0, RBraceContext)!;
    }
    public varDeclaration(): VarDeclarationContext[];
    public varDeclaration(i: number): VarDeclarationContext | null;
    public varDeclaration(i?: number): VarDeclarationContext[] | VarDeclarationContext | null {
        if (i === undefined) {
            return this.getRuleContexts(VarDeclarationContext);
        }

        return this.getRuleContext(i, VarDeclarationContext);
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_subroutineBody;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterSubroutineBody) {
             listener.enterSubroutineBody(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitSubroutineBody) {
             listener.exitSubroutineBody(this);
        }
    }
}


export class RBraceContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public RBRACE(): antlr.TerminalNode {
        return this.getToken(JackParser.RBRACE, 0)!;
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_rBrace;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterRBrace) {
             listener.enterRBrace(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitRBrace) {
             listener.exitRBrace(this);
        }
    }
}


export class VarDeclarationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public VAR(): antlr.TerminalNode {
        return this.getToken(JackParser.VAR, 0)!;
    }
    public varType(): VarTypeContext {
        return this.getRuleContext(0, VarTypeContext)!;
    }
    public varNameInDeclaration(): VarNameInDeclarationContext[];
    public varNameInDeclaration(i: number): VarNameInDeclarationContext | null;
    public varNameInDeclaration(i?: number): VarNameInDeclarationContext[] | VarNameInDeclarationContext | null {
        if (i === undefined) {
            return this.getRuleContexts(VarNameInDeclarationContext);
        }

        return this.getRuleContext(i, VarNameInDeclarationContext);
    }
    public SEMICOLON(): antlr.TerminalNode {
        return this.getToken(JackParser.SEMICOLON, 0)!;
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(JackParser.COMMA);
    	} else {
    		return this.getToken(JackParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_varDeclaration;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterVarDeclaration) {
             listener.enterVarDeclaration(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitVarDeclaration) {
             listener.exitVarDeclaration(this);
        }
    }
}


export class VarNameInDeclarationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(JackParser.IDENTIFIER, 0)!;
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_varNameInDeclaration;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterVarNameInDeclaration) {
             listener.enterVarNameInDeclaration(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitVarNameInDeclaration) {
             listener.exitVarNameInDeclaration(this);
        }
    }
}


export class StatementsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public statement(): StatementContext[];
    public statement(i: number): StatementContext | null;
    public statement(i?: number): StatementContext[] | StatementContext | null {
        if (i === undefined) {
            return this.getRuleContexts(StatementContext);
        }

        return this.getRuleContext(i, StatementContext);
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_statements;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterStatements) {
             listener.enterStatements(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitStatements) {
             listener.exitStatements(this);
        }
    }
}


export class StatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public letStatement(): LetStatementContext | null {
        return this.getRuleContext(0, LetStatementContext);
    }
    public ifElseStatement(): IfElseStatementContext | null {
        return this.getRuleContext(0, IfElseStatementContext);
    }
    public whileStatement(): WhileStatementContext | null {
        return this.getRuleContext(0, WhileStatementContext);
    }
    public doStatement(): DoStatementContext | null {
        return this.getRuleContext(0, DoStatementContext);
    }
    public returnStatement(): ReturnStatementContext | null {
        return this.getRuleContext(0, ReturnStatementContext);
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_statement;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterStatement) {
             listener.enterStatement(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitStatement) {
             listener.exitStatement(this);
        }
    }
}


export class LetStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LET(): antlr.TerminalNode {
        return this.getToken(JackParser.LET, 0)!;
    }
    public equals(): EqualsContext {
        return this.getRuleContext(0, EqualsContext)!;
    }
    public expression(): ExpressionContext {
        return this.getRuleContext(0, ExpressionContext)!;
    }
    public SEMICOLON(): antlr.TerminalNode {
        return this.getToken(JackParser.SEMICOLON, 0)!;
    }
    public varName(): VarNameContext | null {
        return this.getRuleContext(0, VarNameContext);
    }
    public arrayAccess(): ArrayAccessContext | null {
        return this.getRuleContext(0, ArrayAccessContext);
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_letStatement;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterLetStatement) {
             listener.enterLetStatement(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitLetStatement) {
             listener.exitLetStatement(this);
        }
    }
}


export class EqualsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(JackParser.EQUALS, 0)!;
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_equals;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterEquals) {
             listener.enterEquals(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitEquals) {
             listener.exitEquals(this);
        }
    }
}


export class IfElseStatementContext extends antlr.ParserRuleContext {
    public endLabel: string = "";
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ifStatement(): IfStatementContext {
        return this.getRuleContext(0, IfStatementContext)!;
    }
    public elseStatement(): ElseStatementContext | null {
        return this.getRuleContext(0, ElseStatementContext);
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_ifElseStatement;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterIfElseStatement) {
             listener.enterIfElseStatement(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitIfElseStatement) {
             listener.exitIfElseStatement(this);
        }
    }
}


export class IfStatementContext extends antlr.ParserRuleContext {
    public endLabel: string = "";
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IF(): antlr.TerminalNode {
        return this.getToken(JackParser.IF, 0)!;
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(JackParser.LPAREN, 0)!;
    }
    public ifExpression(): IfExpressionContext {
        return this.getRuleContext(0, IfExpressionContext)!;
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(JackParser.RPAREN, 0)!;
    }
    public LBRACE(): antlr.TerminalNode {
        return this.getToken(JackParser.LBRACE, 0)!;
    }
    public statements(): StatementsContext {
        return this.getRuleContext(0, StatementsContext)!;
    }
    public rBrace(): RBraceContext {
        return this.getRuleContext(0, RBraceContext)!;
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_ifStatement;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterIfStatement) {
             listener.enterIfStatement(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitIfStatement) {
             listener.exitIfStatement(this);
        }
    }
}


export class IfExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public expression(): ExpressionContext {
        return this.getRuleContext(0, ExpressionContext)!;
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_ifExpression;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterIfExpression) {
             listener.enterIfExpression(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitIfExpression) {
             listener.exitIfExpression(this);
        }
    }
}


export class ElseStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ELSE(): antlr.TerminalNode {
        return this.getToken(JackParser.ELSE, 0)!;
    }
    public LBRACE(): antlr.TerminalNode {
        return this.getToken(JackParser.LBRACE, 0)!;
    }
    public statements(): StatementsContext {
        return this.getRuleContext(0, StatementsContext)!;
    }
    public rBrace(): RBraceContext {
        return this.getRuleContext(0, RBraceContext)!;
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_elseStatement;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterElseStatement) {
             listener.enterElseStatement(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitElseStatement) {
             listener.exitElseStatement(this);
        }
    }
}


export class WhileStatementContext extends antlr.ParserRuleContext {
    public startLabel: string = "";endLabel:string="";;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public WHILE(): antlr.TerminalNode {
        return this.getToken(JackParser.WHILE, 0)!;
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(JackParser.LPAREN, 0)!;
    }
    public whileExpression(): WhileExpressionContext {
        return this.getRuleContext(0, WhileExpressionContext)!;
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(JackParser.RPAREN, 0)!;
    }
    public LBRACE(): antlr.TerminalNode {
        return this.getToken(JackParser.LBRACE, 0)!;
    }
    public statements(): StatementsContext {
        return this.getRuleContext(0, StatementsContext)!;
    }
    public rBrace(): RBraceContext {
        return this.getRuleContext(0, RBraceContext)!;
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_whileStatement;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterWhileStatement) {
             listener.enterWhileStatement(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitWhileStatement) {
             listener.exitWhileStatement(this);
        }
    }
}


export class WhileExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public expression(): ExpressionContext {
        return this.getRuleContext(0, ExpressionContext)!;
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_whileExpression;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterWhileExpression) {
             listener.enterWhileExpression(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitWhileExpression) {
             listener.exitWhileExpression(this);
        }
    }
}


export class DoStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public DO(): antlr.TerminalNode {
        return this.getToken(JackParser.DO, 0)!;
    }
    public subroutineCall(): SubroutineCallContext {
        return this.getRuleContext(0, SubroutineCallContext)!;
    }
    public SEMICOLON(): antlr.TerminalNode {
        return this.getToken(JackParser.SEMICOLON, 0)!;
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_doStatement;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterDoStatement) {
             listener.enterDoStatement(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitDoStatement) {
             listener.exitDoStatement(this);
        }
    }
}


export class SubroutineCallContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public subroutineId(): SubroutineIdContext {
        return this.getRuleContext(0, SubroutineIdContext)!;
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(JackParser.LPAREN, 0)!;
    }
    public expressionList(): ExpressionListContext {
        return this.getRuleContext(0, ExpressionListContext)!;
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(JackParser.RPAREN, 0)!;
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_subroutineCall;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterSubroutineCall) {
             listener.enterSubroutineCall(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitSubroutineCall) {
             listener.exitSubroutineCall(this);
        }
    }
}


export class SubroutineIdContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public subroutineName(): SubroutineNameContext {
        return this.getRuleContext(0, SubroutineNameContext)!;
    }
    public DOT(): antlr.TerminalNode | null {
        return this.getToken(JackParser.DOT, 0);
    }
    public className(): ClassNameContext | null {
        return this.getRuleContext(0, ClassNameContext);
    }
    public THIS_LITERAL(): antlr.TerminalNode | null {
        return this.getToken(JackParser.THIS_LITERAL, 0);
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_subroutineId;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterSubroutineId) {
             listener.enterSubroutineId(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitSubroutineId) {
             listener.exitSubroutineId(this);
        }
    }
}


export class ReturnStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public RETURN(): antlr.TerminalNode {
        return this.getToken(JackParser.RETURN, 0)!;
    }
    public SEMICOLON(): antlr.TerminalNode {
        return this.getToken(JackParser.SEMICOLON, 0)!;
    }
    public expression(): ExpressionContext | null {
        return this.getRuleContext(0, ExpressionContext);
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_returnStatement;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterReturnStatement) {
             listener.enterReturnStatement(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitReturnStatement) {
             listener.exitReturnStatement(this);
        }
    }
}


export class ExpressionListContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public expression(): ExpressionContext[];
    public expression(i: number): ExpressionContext | null;
    public expression(i?: number): ExpressionContext[] | ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ExpressionContext);
        }

        return this.getRuleContext(i, ExpressionContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(JackParser.COMMA);
    	} else {
    		return this.getToken(JackParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_expressionList;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterExpressionList) {
             listener.enterExpressionList(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitExpressionList) {
             listener.exitExpressionList(this);
        }
    }
}


export class ExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public constant(): ConstantContext | null {
        return this.getRuleContext(0, ConstantContext);
    }
    public varName(): VarNameContext | null {
        return this.getRuleContext(0, VarNameContext);
    }
    public subroutineCall(): SubroutineCallContext | null {
        return this.getRuleContext(0, SubroutineCallContext);
    }
    public arrayAccess(): ArrayAccessContext | null {
        return this.getRuleContext(0, ArrayAccessContext);
    }
    public unaryOperation(): UnaryOperationContext | null {
        return this.getRuleContext(0, UnaryOperationContext);
    }
    public groupedExpression(): GroupedExpressionContext | null {
        return this.getRuleContext(0, GroupedExpressionContext);
    }
    public expression(): ExpressionContext[];
    public expression(i: number): ExpressionContext | null;
    public expression(i?: number): ExpressionContext[] | ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ExpressionContext);
        }

        return this.getRuleContext(i, ExpressionContext);
    }
    public binaryOperator(): BinaryOperatorContext | null {
        return this.getRuleContext(0, BinaryOperatorContext);
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_expression;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterExpression) {
             listener.enterExpression(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitExpression) {
             listener.exitExpression(this);
        }
    }
}


export class ConstantContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public INTEGER_LITERAL(): antlr.TerminalNode | null {
        return this.getToken(JackParser.INTEGER_LITERAL, 0);
    }
    public STRING_LITERAL(): antlr.TerminalNode | null {
        return this.getToken(JackParser.STRING_LITERAL, 0);
    }
    public booleanLiteral(): BooleanLiteralContext | null {
        return this.getRuleContext(0, BooleanLiteralContext);
    }
    public NULL_LITERAL(): antlr.TerminalNode | null {
        return this.getToken(JackParser.NULL_LITERAL, 0);
    }
    public THIS_LITERAL(): antlr.TerminalNode | null {
        return this.getToken(JackParser.THIS_LITERAL, 0);
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_constant;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterConstant) {
             listener.enterConstant(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitConstant) {
             listener.exitConstant(this);
        }
    }
}


export class VarNameContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(JackParser.IDENTIFIER, 0)!;
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_varName;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterVarName) {
             listener.enterVarName(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitVarName) {
             listener.exitVarName(this);
        }
    }
}


export class ArrayAccessContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public varName(): VarNameContext {
        return this.getRuleContext(0, VarNameContext)!;
    }
    public LBRACKET(): antlr.TerminalNode {
        return this.getToken(JackParser.LBRACKET, 0)!;
    }
    public expression(): ExpressionContext {
        return this.getRuleContext(0, ExpressionContext)!;
    }
    public RBRACKET(): antlr.TerminalNode {
        return this.getToken(JackParser.RBRACKET, 0)!;
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_arrayAccess;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterArrayAccess) {
             listener.enterArrayAccess(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitArrayAccess) {
             listener.exitArrayAccess(this);
        }
    }
}


export class UnaryOperationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public unaryOperator(): UnaryOperatorContext {
        return this.getRuleContext(0, UnaryOperatorContext)!;
    }
    public expression(): ExpressionContext {
        return this.getRuleContext(0, ExpressionContext)!;
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_unaryOperation;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterUnaryOperation) {
             listener.enterUnaryOperation(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitUnaryOperation) {
             listener.exitUnaryOperation(this);
        }
    }
}


export class GroupedExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(JackParser.LPAREN, 0)!;
    }
    public expression(): ExpressionContext {
        return this.getRuleContext(0, ExpressionContext)!;
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(JackParser.RPAREN, 0)!;
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_groupedExpression;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterGroupedExpression) {
             listener.enterGroupedExpression(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitGroupedExpression) {
             listener.exitGroupedExpression(this);
        }
    }
}


export class BooleanLiteralContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public TRUE(): antlr.TerminalNode | null {
        return this.getToken(JackParser.TRUE, 0);
    }
    public FALSE(): antlr.TerminalNode | null {
        return this.getToken(JackParser.FALSE, 0);
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_booleanLiteral;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterBooleanLiteral) {
             listener.enterBooleanLiteral(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitBooleanLiteral) {
             listener.exitBooleanLiteral(this);
        }
    }
}


export class UnaryOperatorContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public TILDE(): antlr.TerminalNode | null {
        return this.getToken(JackParser.TILDE, 0);
    }
    public MINUS(): antlr.TerminalNode | null {
        return this.getToken(JackParser.MINUS, 0);
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_unaryOperator;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterUnaryOperator) {
             listener.enterUnaryOperator(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitUnaryOperator) {
             listener.exitUnaryOperator(this);
        }
    }
}


export class BinaryOperatorContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public PLUS(): antlr.TerminalNode | null {
        return this.getToken(JackParser.PLUS, 0);
    }
    public MINUS(): antlr.TerminalNode | null {
        return this.getToken(JackParser.MINUS, 0);
    }
    public MUL(): antlr.TerminalNode | null {
        return this.getToken(JackParser.MUL, 0);
    }
    public DIV(): antlr.TerminalNode | null {
        return this.getToken(JackParser.DIV, 0);
    }
    public AND(): antlr.TerminalNode | null {
        return this.getToken(JackParser.AND, 0);
    }
    public OR(): antlr.TerminalNode | null {
        return this.getToken(JackParser.OR, 0);
    }
    public LESS_THAN(): antlr.TerminalNode | null {
        return this.getToken(JackParser.LESS_THAN, 0);
    }
    public GREATER_THAN(): antlr.TerminalNode | null {
        return this.getToken(JackParser.GREATER_THAN, 0);
    }
    public EQUALS(): antlr.TerminalNode | null {
        return this.getToken(JackParser.EQUALS, 0);
    }
    public override get ruleIndex(): number {
        return JackParser.RULE_binaryOperator;
    }
    public override enterRule(listener: JackParserListener): void {
        if(listener.enterBinaryOperator) {
             listener.enterBinaryOperator(this);
        }
    }
    public override exitRule(listener: JackParserListener): void {
        if(listener.exitBinaryOperator) {
             listener.exitBinaryOperator(this);
        }
    }
}
