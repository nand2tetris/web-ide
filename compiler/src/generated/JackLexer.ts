// Generated from JackLexer.g4 by ANTLR 4.9.0-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { CharStream } from "antlr4ts/CharStream";
import { Lexer } from "antlr4ts/Lexer";
import { LexerATNSimulator } from "antlr4ts/atn/LexerATNSimulator";
import { NotNull } from "antlr4ts/Decorators";
import { Override } from "antlr4ts/Decorators";
import { RuleContext } from "antlr4ts/RuleContext";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";


export class JackLexer extends Lexer {
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

	// tslint:disable:no-trailing-whitespace
	public static readonly channelNames: string[] = [
		"DEFAULT_TOKEN_CHANNEL", "HIDDEN",
	];

	// tslint:disable:no-trailing-whitespace
	public static readonly modeNames: string[] = [
		"DEFAULT_MODE",
	];

	public static readonly ruleNames: string[] = [
		"CLASS", "CONSTRUCTOR", "FUNCTION", "METHOD", "FIELD", "STATIC", "VAR", 
		"INT", "CHAR", "BOOLEAN", "VOID", "LET", "DO", "IF", "ELSE", "WHILE", 
		"RETURN", "LBRACE", "RBRACE", "LPAREN", "RPAREN", "LBRACKET", "RBRACKET", 
		"DOT", "COMMA", "SEMICOLON", "EQUALS", "PLUS", "MINUS", "MUL", "DIV", 
		"AND", "OR", "TILDE", "LESS_THAN", "GREATER_THAN", "WS", "COMMENT", "LINE_COMMENT", 
		"INTEGER_LITERAL", "BOOLEAN_LITERAL", "NULL_LITERAL", "THIS_LITERAL", 
		"IDENTIFIER", "STRING_LITERAL", "UnterminatedStringLiteral",
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
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(JackLexer._LITERAL_NAMES, JackLexer._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return JackLexer.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace


	constructor(input: CharStream) {
		super(input);
		this._interp = new LexerATNSimulator(JackLexer._ATN, this);
	}

	// @Override
	public get grammarFileName(): string { return "JackLexer.g4"; }

	// @Override
	public get ruleNames(): string[] { return JackLexer.ruleNames; }

	// @Override
	public override get serializedATN(): string { return JackLexer._serializedATN; }

	// @Override
	public get channelNames(): string[] { return JackLexer.channelNames; }

	// @Override
	public get modeNames(): string[] { return JackLexer.modeNames; }

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x020\u0135\b\x01" +
		"\x04\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06" +
		"\x04\x07\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r" +
		"\t\r\x04\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t" +
		"\x12\x04\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t" +
		"\x17\x04\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B\t\x1B\x04\x1C\t" +
		"\x1C\x04\x1D\t\x1D\x04\x1E\t\x1E\x04\x1F\t\x1F\x04 \t \x04!\t!\x04\"\t" +
		"\"\x04#\t#\x04$\t$\x04%\t%\x04&\t&\x04\'\t\'\x04(\t(\x04)\t)\x04*\t*\x04" +
		"+\t+\x04,\t,\x04-\t-\x04.\t.\x04/\t/\x03\x02\x03\x02\x03\x02\x03\x02\x03" +
		"\x02\x03\x02\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x04\x03\x04\x03\x04\x03\x04\x03" +
		"\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x05\x03\x05\x03\x05\x03\x05\x03" +
		"\x05\x03\x05\x03\x05\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03" +
		"\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\b\x03\b\x03\b" +
		"\x03\b\x03\t\x03\t\x03\t\x03\t\x03\n\x03\n\x03\n\x03\n\x03\n\x03\v\x03" +
		"\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\f\x03\f\x03\f\x03\f\x03\f\x03" +
		"\r\x03\r\x03\r\x03\r\x03\x0E\x03\x0E\x03\x0E\x03\x0F\x03\x0F\x03\x0F\x03" +
		"\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x11\x03\x11\x03\x11\x03\x11\x03" +
		"\x11\x03\x11\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03" +
		"\x13\x03\x13\x03\x14\x03\x14\x03\x15\x03\x15\x03\x16\x03\x16\x03\x17\x03" +
		"\x17\x03\x18\x03\x18\x03\x19\x03\x19\x03\x1A\x03\x1A\x03\x1B\x03\x1B\x03" +
		"\x1C\x03\x1C\x03\x1D\x03\x1D\x03\x1E\x03\x1E\x03\x1F\x03\x1F\x03 \x03" +
		" \x03!\x03!\x03\"\x03\"\x03#\x03#\x03$\x03$\x03%\x03%\x03&\x06&\xEC\n" +
		"&\r&\x0E&\xED\x03&\x03&\x03\'\x03\'\x03\'\x03\'\x07\'\xF6\n\'\f\'\x0E" +
		"\'\xF9\v\'\x03\'\x03\'\x03\'\x03\'\x03\'\x03(\x03(\x03(\x03(\x07(\u0104" +
		"\n(\f(\x0E(\u0107\v(\x03(\x03(\x03)\x06)\u010C\n)\r)\x0E)\u010D\x03*\x03" +
		"*\x03*\x03*\x03*\x03*\x03*\x03*\x03*\x05*\u0119\n*\x03+\x03+\x03+\x03" +
		"+\x03+\x03,\x03,\x03,\x03,\x03,\x03-\x03-\x07-\u0127\n-\f-\x0E-\u012A" +
		"\v-\x03.\x03.\x03.\x03/\x03/\x07/\u0131\n/\f/\x0E/\u0134\v/\x03\xF7\x02" +
		"\x020\x03\x02\x03\x05\x02\x04\x07\x02\x05\t\x02\x06\v\x02\x07\r\x02\b" +
		"\x0F\x02\t\x11\x02\n\x13\x02\v\x15\x02\f\x17\x02\r\x19\x02\x0E\x1B\x02" +
		"\x0F\x1D\x02\x10\x1F\x02\x11!\x02\x12#\x02\x13%\x02\x14\'\x02\x15)\x02" +
		"\x16+\x02\x17-\x02\x18/\x02\x191\x02\x1A3\x02\x1B5\x02\x1C7\x02\x1D9\x02" +
		"\x1E;\x02\x1F=\x02 ?\x02!A\x02\"C\x02#E\x02$G\x02%I\x02&K\x02\'M\x02(" +
		"O\x02)Q\x02*S\x02+U\x02,W\x02-Y\x02.[\x02/]\x020\x03\x02\b\x05\x02\v\f" +
		"\x0F\x0F\"\"\x04\x02\f\f\x0F\x0F\x03\x022;\x05\x02C\\aac|\x06\x022;C\\" +
		"aac|\x06\x02\f\f\x0F\x0F$$^^\x02\u013B\x02\x03\x03\x02\x02\x02\x02\x05" +
		"\x03\x02\x02\x02\x02\x07\x03\x02\x02\x02\x02\t\x03\x02\x02\x02\x02\v\x03" +
		"\x02\x02\x02\x02\r\x03\x02\x02\x02\x02\x0F\x03\x02\x02\x02\x02\x11\x03" +
		"\x02\x02\x02\x02\x13\x03\x02\x02\x02\x02\x15\x03\x02\x02\x02\x02\x17\x03" +
		"\x02\x02\x02\x02\x19\x03\x02\x02\x02\x02\x1B\x03\x02\x02\x02\x02\x1D\x03" +
		"\x02\x02\x02\x02\x1F\x03\x02\x02\x02\x02!\x03\x02\x02\x02\x02#\x03\x02" +
		"\x02\x02\x02%\x03\x02\x02\x02\x02\'\x03\x02\x02\x02\x02)\x03\x02\x02\x02" +
		"\x02+\x03\x02\x02\x02\x02-\x03\x02\x02\x02\x02/\x03\x02\x02\x02\x021\x03" +
		"\x02\x02\x02\x023\x03\x02\x02\x02\x025\x03\x02\x02\x02\x027\x03\x02\x02" +
		"\x02\x029\x03\x02\x02\x02\x02;\x03\x02\x02\x02\x02=\x03\x02\x02\x02\x02" +
		"?\x03\x02\x02\x02\x02A\x03\x02\x02\x02\x02C\x03\x02\x02\x02\x02E\x03\x02" +
		"\x02\x02\x02G\x03\x02\x02\x02\x02I\x03\x02\x02\x02\x02K\x03\x02\x02\x02" +
		"\x02M\x03\x02\x02\x02\x02O\x03\x02\x02\x02\x02Q\x03\x02\x02\x02\x02S\x03" +
		"\x02\x02\x02\x02U\x03\x02\x02\x02\x02W\x03\x02\x02\x02\x02Y\x03\x02\x02" +
		"\x02\x02[\x03\x02\x02\x02\x02]\x03\x02\x02\x02\x03_\x03\x02\x02\x02\x05" +
		"e\x03\x02\x02\x02\x07q\x03\x02\x02\x02\tz\x03\x02\x02\x02\v\x81\x03\x02" +
		"\x02\x02\r\x87\x03\x02\x02\x02\x0F\x8E\x03\x02\x02\x02\x11\x92\x03\x02" +
		"\x02\x02\x13\x96\x03\x02\x02\x02\x15\x9B\x03\x02\x02\x02\x17\xA3\x03\x02" +
		"\x02\x02\x19\xA8\x03\x02\x02\x02\x1B\xAC\x03\x02\x02\x02\x1D\xAF\x03\x02" +
		"\x02\x02\x1F\xB2\x03\x02\x02\x02!\xB7\x03\x02\x02\x02#\xBD\x03\x02\x02" +
		"\x02%\xC4\x03\x02\x02\x02\'\xC6\x03\x02\x02\x02)\xC8\x03\x02\x02\x02+" +
		"\xCA\x03\x02\x02\x02-\xCC\x03\x02\x02\x02/\xCE\x03\x02\x02\x021\xD0\x03" +
		"\x02\x02\x023\xD2\x03\x02\x02\x025\xD4\x03\x02\x02\x027\xD6\x03\x02\x02" +
		"\x029\xD8\x03\x02\x02\x02;\xDA\x03\x02\x02\x02=\xDC\x03\x02\x02\x02?\xDE" +
		"\x03\x02\x02\x02A\xE0\x03\x02\x02\x02C\xE2\x03\x02\x02\x02E\xE4\x03\x02" +
		"\x02\x02G\xE6\x03\x02\x02\x02I\xE8\x03\x02\x02\x02K\xEB\x03\x02\x02\x02" +
		"M\xF1\x03\x02\x02\x02O\xFF\x03\x02\x02\x02Q\u010B\x03\x02\x02\x02S\u0118" +
		"\x03\x02\x02\x02U\u011A\x03\x02\x02\x02W\u011F\x03\x02\x02\x02Y\u0124" +
		"\x03\x02\x02\x02[\u012B\x03\x02\x02\x02]\u012E\x03\x02\x02\x02_`\x07e" +
		"\x02\x02`a\x07n\x02\x02ab\x07c\x02\x02bc\x07u\x02\x02cd\x07u\x02\x02d" +
		"\x04\x03\x02\x02\x02ef\x07e\x02\x02fg\x07q\x02\x02gh\x07p\x02\x02hi\x07" +
		"u\x02\x02ij\x07v\x02\x02jk\x07t\x02\x02kl\x07w\x02\x02lm\x07e\x02\x02" +
		"mn\x07v\x02\x02no\x07q\x02\x02op\x07t\x02\x02p\x06\x03\x02\x02\x02qr\x07" +
		"h\x02\x02rs\x07w\x02\x02st\x07p\x02\x02tu\x07e\x02\x02uv\x07v\x02\x02" +
		"vw\x07k\x02\x02wx\x07q\x02\x02xy\x07p\x02\x02y\b\x03\x02\x02\x02z{\x07" +
		"o\x02\x02{|\x07g\x02\x02|}\x07v\x02\x02}~\x07j\x02\x02~\x7F\x07q\x02\x02" +
		"\x7F\x80\x07f\x02\x02\x80\n\x03\x02\x02\x02\x81\x82\x07h\x02\x02\x82\x83" +
		"\x07k\x02\x02\x83\x84\x07g\x02\x02\x84\x85\x07n\x02\x02\x85\x86\x07f\x02" +
		"\x02\x86\f\x03\x02\x02\x02\x87\x88\x07u\x02\x02\x88\x89\x07v\x02\x02\x89" +
		"\x8A\x07c\x02\x02\x8A\x8B\x07v\x02\x02\x8B\x8C\x07k\x02\x02\x8C\x8D\x07" +
		"e\x02\x02\x8D\x0E\x03\x02\x02\x02\x8E\x8F\x07x\x02\x02\x8F\x90\x07c\x02" +
		"\x02\x90\x91\x07t\x02\x02\x91\x10\x03\x02\x02\x02\x92\x93\x07k\x02\x02" +
		"\x93\x94\x07p\x02\x02\x94\x95\x07v\x02\x02\x95\x12\x03\x02\x02\x02\x96" +
		"\x97\x07e\x02\x02\x97\x98\x07j\x02\x02\x98\x99\x07c\x02\x02\x99\x9A\x07" +
		"t\x02\x02\x9A\x14\x03\x02\x02\x02\x9B\x9C\x07d\x02\x02\x9C\x9D\x07q\x02" +
		"\x02\x9D\x9E\x07q\x02\x02\x9E\x9F\x07n\x02\x02\x9F\xA0\x07g\x02\x02\xA0" +
		"\xA1\x07c\x02\x02\xA1\xA2\x07p\x02\x02\xA2\x16\x03\x02\x02\x02\xA3\xA4" +
		"\x07x\x02\x02\xA4\xA5\x07q\x02\x02\xA5\xA6\x07k\x02\x02\xA6\xA7\x07f\x02" +
		"\x02\xA7\x18\x03\x02\x02\x02\xA8\xA9\x07n\x02\x02\xA9\xAA\x07g\x02\x02" +
		"\xAA\xAB\x07v\x02\x02\xAB\x1A\x03\x02\x02\x02\xAC\xAD\x07f\x02\x02\xAD" +
		"\xAE\x07q\x02\x02\xAE\x1C\x03\x02\x02\x02\xAF\xB0\x07k\x02\x02\xB0\xB1" +
		"\x07h\x02\x02\xB1\x1E\x03\x02\x02\x02\xB2\xB3\x07g\x02\x02\xB3\xB4\x07" +
		"n\x02\x02\xB4\xB5\x07u\x02\x02\xB5\xB6\x07g\x02\x02\xB6 \x03\x02\x02\x02" +
		"\xB7\xB8\x07y\x02\x02\xB8\xB9\x07j\x02\x02\xB9\xBA\x07k\x02\x02\xBA\xBB" +
		"\x07n\x02\x02\xBB\xBC\x07g\x02\x02\xBC\"\x03\x02\x02\x02\xBD\xBE\x07t" +
		"\x02\x02\xBE\xBF\x07g\x02\x02\xBF\xC0\x07v\x02\x02\xC0\xC1\x07w\x02\x02" +
		"\xC1\xC2\x07t\x02\x02\xC2\xC3\x07p\x02\x02\xC3$\x03\x02\x02\x02\xC4\xC5" +
		"\x07}\x02\x02\xC5&\x03\x02\x02\x02\xC6\xC7\x07\x7F\x02\x02\xC7(\x03\x02" +
		"\x02\x02\xC8\xC9\x07*\x02\x02\xC9*\x03\x02\x02\x02\xCA\xCB\x07+\x02\x02" +
		"\xCB,\x03\x02\x02\x02\xCC\xCD\x07]\x02\x02\xCD.\x03\x02\x02\x02\xCE\xCF" +
		"\x07_\x02\x02\xCF0\x03\x02\x02\x02\xD0\xD1\x070\x02\x02\xD12\x03\x02\x02" +
		"\x02\xD2\xD3\x07.\x02\x02\xD34\x03\x02\x02\x02\xD4\xD5\x07=\x02\x02\xD5" +
		"6\x03\x02\x02\x02\xD6\xD7\x07?\x02\x02\xD78\x03\x02\x02\x02\xD8\xD9\x07" +
		"-\x02\x02\xD9:\x03\x02\x02\x02\xDA\xDB\x07/\x02\x02\xDB<\x03\x02\x02\x02" +
		"\xDC\xDD\x07,\x02\x02\xDD>\x03\x02\x02\x02\xDE\xDF\x071\x02\x02\xDF@\x03" +
		"\x02\x02\x02\xE0\xE1\x07(\x02\x02\xE1B\x03\x02\x02\x02\xE2\xE3\x07~\x02" +
		"\x02\xE3D\x03\x02\x02\x02\xE4\xE5\x07\x80\x02\x02\xE5F\x03\x02\x02\x02" +
		"\xE6\xE7\x07>\x02\x02\xE7H\x03\x02\x02\x02\xE8\xE9\x07@\x02\x02\xE9J\x03" +
		"\x02\x02\x02\xEA\xEC\t\x02\x02\x02\xEB\xEA\x03\x02\x02\x02\xEC\xED\x03" +
		"\x02\x02\x02\xED\xEB\x03\x02\x02\x02\xED\xEE\x03\x02\x02\x02\xEE\xEF\x03" +
		"\x02\x02\x02\xEF\xF0\b&\x02\x02\xF0L\x03\x02\x02\x02\xF1\xF2\x071\x02" +
		"\x02\xF2\xF3\x07,\x02\x02\xF3\xF7\x03\x02\x02\x02\xF4\xF6\v\x02\x02\x02" +
		"\xF5\xF4\x03\x02\x02\x02\xF6\xF9\x03\x02\x02\x02\xF7\xF8\x03\x02\x02\x02" +
		"\xF7\xF5\x03\x02\x02\x02\xF8\xFA\x03\x02\x02\x02\xF9\xF7\x03\x02\x02\x02" +
		"\xFA\xFB\x07,\x02\x02\xFB\xFC\x071\x02\x02\xFC\xFD\x03\x02\x02\x02\xFD" +
		"\xFE\b\'\x02\x02\xFEN\x03\x02\x02\x02\xFF\u0100\x071\x02\x02\u0100\u0101" +
		"\x071\x02\x02\u0101\u0105\x03\x02\x02\x02\u0102\u0104\n\x03\x02\x02\u0103" +
		"\u0102\x03\x02\x02\x02\u0104\u0107\x03\x02\x02\x02\u0105\u0103\x03\x02" +
		"\x02\x02\u0105\u0106\x03\x02\x02\x02\u0106\u0108\x03\x02\x02\x02\u0107" +
		"\u0105\x03\x02\x02\x02\u0108\u0109\b(\x02\x02\u0109P\x03\x02\x02\x02\u010A" +
		"\u010C\t\x04\x02\x02\u010B\u010A\x03\x02\x02\x02\u010C\u010D\x03\x02\x02" +
		"\x02\u010D\u010B\x03\x02\x02\x02\u010D\u010E\x03\x02\x02\x02\u010ER\x03" +
		"\x02\x02\x02\u010F\u0110\x07v\x02\x02\u0110\u0111\x07t\x02\x02\u0111\u0112" +
		"\x07w\x02\x02\u0112\u0119\x07g\x02\x02\u0113\u0114\x07h\x02\x02\u0114" +
		"\u0115\x07c\x02\x02\u0115\u0116\x07n\x02\x02\u0116\u0117\x07u\x02\x02" +
		"\u0117\u0119\x07g\x02\x02\u0118\u010F\x03\x02\x02\x02\u0118\u0113\x03" +
		"\x02\x02\x02\u0119T\x03\x02\x02\x02\u011A\u011B\x07p\x02\x02\u011B\u011C" +
		"\x07w\x02\x02\u011C\u011D\x07n\x02\x02\u011D\u011E\x07n\x02\x02\u011E" +
		"V\x03\x02\x02\x02\u011F\u0120\x07v\x02\x02\u0120\u0121\x07j\x02\x02\u0121" +
		"\u0122\x07k\x02\x02\u0122\u0123\x07u\x02\x02\u0123X\x03\x02\x02\x02\u0124" +
		"\u0128\t\x05\x02\x02\u0125\u0127\t\x06\x02\x02\u0126\u0125\x03\x02\x02" +
		"\x02\u0127\u012A\x03\x02\x02\x02\u0128\u0126\x03\x02\x02\x02\u0128\u0129" +
		"\x03\x02\x02\x02\u0129Z\x03\x02\x02\x02\u012A\u0128\x03\x02\x02\x02\u012B" +
		"\u012C\x05]/\x02\u012C\u012D\x07$\x02\x02\u012D\\\x03\x02\x02\x02\u012E" +
		"\u0132\x07$\x02\x02\u012F\u0131\n\x07\x02\x02\u0130\u012F\x03\x02\x02" +
		"\x02\u0131\u0134\x03\x02\x02\x02\u0132\u0130\x03\x02\x02\x02\u0132\u0133" +
		"\x03\x02\x02\x02\u0133^\x03\x02\x02\x02\u0134\u0132\x03\x02\x02\x02\n" +
		"\x02\xED\xF7\u0105\u010D\u0118\u0128\u0132\x03\b\x02\x02";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!JackLexer.__ATN) {
			JackLexer.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(JackLexer._serializedATN));
		}

		return JackLexer.__ATN;
	}

}

