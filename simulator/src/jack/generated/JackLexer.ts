// Generated from JackLexer.g4 by ANTLR 4.13.2
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols
import {
	ATN,
	ATNDeserializer,
	CharStream,
	DecisionState, DFA,
	Lexer,
	LexerATNSimulator,
	RuleContext,
	PredictionContextCache,
	Token
} from "antlr4";
export default class JackLexer extends Lexer {
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
	public static readonly EOF = Token.EOF;

	public static readonly channelNames: string[] = [ "DEFAULT_TOKEN_CHANNEL", "HIDDEN" ];
	public static readonly literalNames: (string | null)[] = [ null, "'class'", 
                                                            "'constructor'", 
                                                            "'function'", 
                                                            "'method'", 
                                                            "'field'", "'static'", 
                                                            "'var'", "'int'", 
                                                            "'char'", "'boolean'", 
                                                            "'void'", "'let'", 
                                                            "'do'", "'if'", 
                                                            "'else'", "'while'", 
                                                            "'return'", 
                                                            "'{'", "'}'", 
                                                            "'('", "')'", 
                                                            "'['", "']'", 
                                                            "'.'", "','", 
                                                            "';'", "'='", 
                                                            "'+'", "'-'", 
                                                            "'*'", "'/'", 
                                                            "'&'", "'|'", 
                                                            "'~'", "'<'", 
                                                            "'>'", null, 
                                                            null, null, 
                                                            null, "'true'", 
                                                            "'false'", "'null'", 
                                                            "'this'" ];
	public static readonly symbolicNames: (string | null)[] = [ null, "CLASS", 
                                                             "CONSTRUCTOR", 
                                                             "FUNCTION", 
                                                             "METHOD", "FIELD", 
                                                             "STATIC", "VAR", 
                                                             "INT", "CHAR", 
                                                             "BOOLEAN", 
                                                             "VOID", "LET", 
                                                             "DO", "IF", 
                                                             "ELSE", "WHILE", 
                                                             "RETURN", "LBRACE", 
                                                             "RBRACE", "LPAREN", 
                                                             "RPAREN", "LBRACKET", 
                                                             "RBRACKET", 
                                                             "DOT", "COMMA", 
                                                             "SEMICOLON", 
                                                             "EQUALS", "PLUS", 
                                                             "MINUS", "MUL", 
                                                             "DIV", "AND", 
                                                             "OR", "TILDE", 
                                                             "LESS_THAN", 
                                                             "GREATER_THAN", 
                                                             "WHITESPACE", 
                                                             "BLOCK_COMMENT", 
                                                             "LINE_COMMENT", 
                                                             "INTEGER_LITERAL", 
                                                             "TRUE", "FALSE", 
                                                             "NULL_LITERAL", 
                                                             "THIS_LITERAL", 
                                                             "IDENTIFIER", 
                                                             "STRING_LITERAL" ];
	public static readonly modeNames: string[] = [ "DEFAULT_MODE", ];

	public static readonly ruleNames: string[] = [
		"CLASS", "CONSTRUCTOR", "FUNCTION", "METHOD", "FIELD", "STATIC", "VAR", 
		"INT", "CHAR", "BOOLEAN", "VOID", "LET", "DO", "IF", "ELSE", "WHILE", 
		"RETURN", "LBRACE", "RBRACE", "LPAREN", "RPAREN", "LBRACKET", "RBRACKET", 
		"DOT", "COMMA", "SEMICOLON", "EQUALS", "PLUS", "MINUS", "MUL", "DIV", 
		"AND", "OR", "TILDE", "LESS_THAN", "GREATER_THAN", "WHITESPACE", "BLOCK_COMMENT", 
		"LINE_COMMENT", "INTEGER_LITERAL", "TRUE", "FALSE", "NULL_LITERAL", "THIS_LITERAL", 
		"IDENTIFIER", "STRING_LITERAL",
	];


	constructor(input: CharStream) {
		super(input);
		this._interp = new LexerATNSimulator(this, JackLexer._ATN, JackLexer.DecisionsToDFA, new PredictionContextCache());
	}

	public get grammarFileName(): string { return "JackLexer.g4"; }

	public get literalNames(): (string | null)[] { return JackLexer.literalNames; }
	public get symbolicNames(): (string | null)[] { return JackLexer.symbolicNames; }
	public get ruleNames(): string[] { return JackLexer.ruleNames; }

	public get serializedATN(): number[] { return JackLexer._serializedATN; }

	public get channelNames(): string[] { return JackLexer.channelNames; }

	public get modeNames(): string[] { return JackLexer.modeNames; }

	public static readonly _serializedATN: number[] = [4,0,46,308,6,-1,2,0,
	7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,
	7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,
	16,2,17,7,17,2,18,7,18,2,19,7,19,2,20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,
	2,24,7,24,2,25,7,25,2,26,7,26,2,27,7,27,2,28,7,28,2,29,7,29,2,30,7,30,2,
	31,7,31,2,32,7,32,2,33,7,33,2,34,7,34,2,35,7,35,2,36,7,36,2,37,7,37,2,38,
	7,38,2,39,7,39,2,40,7,40,2,41,7,41,2,42,7,42,2,43,7,43,2,44,7,44,2,45,7,
	45,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
	1,1,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,4,
	1,4,1,4,1,4,1,4,1,4,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,6,1,6,1,6,1,6,1,7,1,7,
	1,7,1,7,1,8,1,8,1,8,1,8,1,8,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,10,1,10,1,
	10,1,10,1,10,1,11,1,11,1,11,1,11,1,12,1,12,1,12,1,13,1,13,1,13,1,14,1,14,
	1,14,1,14,1,14,1,15,1,15,1,15,1,15,1,15,1,15,1,16,1,16,1,16,1,16,1,16,1,
	16,1,16,1,17,1,17,1,18,1,18,1,19,1,19,1,20,1,20,1,21,1,21,1,22,1,22,1,23,
	1,23,1,24,1,24,1,25,1,25,1,26,1,26,1,27,1,27,1,28,1,28,1,29,1,29,1,30,1,
	30,1,31,1,31,1,32,1,32,1,33,1,33,1,34,1,34,1,35,1,35,1,36,4,36,234,8,36,
	11,36,12,36,235,1,36,1,36,1,37,1,37,1,37,1,37,5,37,244,8,37,10,37,12,37,
	247,9,37,1,37,1,37,1,37,3,37,252,8,37,1,37,1,37,1,38,1,38,1,38,1,38,5,38,
	260,8,38,10,38,12,38,263,9,38,1,38,1,38,1,39,4,39,268,8,39,11,39,12,39,
	269,1,40,1,40,1,40,1,40,1,40,1,41,1,41,1,41,1,41,1,41,1,41,1,42,1,42,1,
	42,1,42,1,42,1,43,1,43,1,43,1,43,1,43,1,44,1,44,5,44,295,8,44,10,44,12,
	44,298,9,44,1,45,1,45,5,45,302,8,45,10,45,12,45,305,9,45,1,45,1,45,1,245,
	0,46,1,1,3,2,5,3,7,4,9,5,11,6,13,7,15,8,17,9,19,10,21,11,23,12,25,13,27,
	14,29,15,31,16,33,17,35,18,37,19,39,20,41,21,43,22,45,23,47,24,49,25,51,
	26,53,27,55,28,57,29,59,30,61,31,63,32,65,33,67,34,69,35,71,36,73,37,75,
	38,77,39,79,40,81,41,83,42,85,43,87,44,89,45,91,46,1,0,6,3,0,9,10,12,13,
	32,32,2,0,10,10,13,13,1,0,48,57,3,0,65,90,95,95,97,122,4,0,48,57,65,90,
	95,95,97,122,3,0,10,10,13,13,34,34,314,0,1,1,0,0,0,0,3,1,0,0,0,0,5,1,0,
	0,0,0,7,1,0,0,0,0,9,1,0,0,0,0,11,1,0,0,0,0,13,1,0,0,0,0,15,1,0,0,0,0,17,
	1,0,0,0,0,19,1,0,0,0,0,21,1,0,0,0,0,23,1,0,0,0,0,25,1,0,0,0,0,27,1,0,0,
	0,0,29,1,0,0,0,0,31,1,0,0,0,0,33,1,0,0,0,0,35,1,0,0,0,0,37,1,0,0,0,0,39,
	1,0,0,0,0,41,1,0,0,0,0,43,1,0,0,0,0,45,1,0,0,0,0,47,1,0,0,0,0,49,1,0,0,
	0,0,51,1,0,0,0,0,53,1,0,0,0,0,55,1,0,0,0,0,57,1,0,0,0,0,59,1,0,0,0,0,61,
	1,0,0,0,0,63,1,0,0,0,0,65,1,0,0,0,0,67,1,0,0,0,0,69,1,0,0,0,0,71,1,0,0,
	0,0,73,1,0,0,0,0,75,1,0,0,0,0,77,1,0,0,0,0,79,1,0,0,0,0,81,1,0,0,0,0,83,
	1,0,0,0,0,85,1,0,0,0,0,87,1,0,0,0,0,89,1,0,0,0,0,91,1,0,0,0,1,93,1,0,0,
	0,3,99,1,0,0,0,5,111,1,0,0,0,7,120,1,0,0,0,9,127,1,0,0,0,11,133,1,0,0,0,
	13,140,1,0,0,0,15,144,1,0,0,0,17,148,1,0,0,0,19,153,1,0,0,0,21,161,1,0,
	0,0,23,166,1,0,0,0,25,170,1,0,0,0,27,173,1,0,0,0,29,176,1,0,0,0,31,181,
	1,0,0,0,33,187,1,0,0,0,35,194,1,0,0,0,37,196,1,0,0,0,39,198,1,0,0,0,41,
	200,1,0,0,0,43,202,1,0,0,0,45,204,1,0,0,0,47,206,1,0,0,0,49,208,1,0,0,0,
	51,210,1,0,0,0,53,212,1,0,0,0,55,214,1,0,0,0,57,216,1,0,0,0,59,218,1,0,
	0,0,61,220,1,0,0,0,63,222,1,0,0,0,65,224,1,0,0,0,67,226,1,0,0,0,69,228,
	1,0,0,0,71,230,1,0,0,0,73,233,1,0,0,0,75,239,1,0,0,0,77,255,1,0,0,0,79,
	267,1,0,0,0,81,271,1,0,0,0,83,276,1,0,0,0,85,282,1,0,0,0,87,287,1,0,0,0,
	89,292,1,0,0,0,91,299,1,0,0,0,93,94,5,99,0,0,94,95,5,108,0,0,95,96,5,97,
	0,0,96,97,5,115,0,0,97,98,5,115,0,0,98,2,1,0,0,0,99,100,5,99,0,0,100,101,
	5,111,0,0,101,102,5,110,0,0,102,103,5,115,0,0,103,104,5,116,0,0,104,105,
	5,114,0,0,105,106,5,117,0,0,106,107,5,99,0,0,107,108,5,116,0,0,108,109,
	5,111,0,0,109,110,5,114,0,0,110,4,1,0,0,0,111,112,5,102,0,0,112,113,5,117,
	0,0,113,114,5,110,0,0,114,115,5,99,0,0,115,116,5,116,0,0,116,117,5,105,
	0,0,117,118,5,111,0,0,118,119,5,110,0,0,119,6,1,0,0,0,120,121,5,109,0,0,
	121,122,5,101,0,0,122,123,5,116,0,0,123,124,5,104,0,0,124,125,5,111,0,0,
	125,126,5,100,0,0,126,8,1,0,0,0,127,128,5,102,0,0,128,129,5,105,0,0,129,
	130,5,101,0,0,130,131,5,108,0,0,131,132,5,100,0,0,132,10,1,0,0,0,133,134,
	5,115,0,0,134,135,5,116,0,0,135,136,5,97,0,0,136,137,5,116,0,0,137,138,
	5,105,0,0,138,139,5,99,0,0,139,12,1,0,0,0,140,141,5,118,0,0,141,142,5,97,
	0,0,142,143,5,114,0,0,143,14,1,0,0,0,144,145,5,105,0,0,145,146,5,110,0,
	0,146,147,5,116,0,0,147,16,1,0,0,0,148,149,5,99,0,0,149,150,5,104,0,0,150,
	151,5,97,0,0,151,152,5,114,0,0,152,18,1,0,0,0,153,154,5,98,0,0,154,155,
	5,111,0,0,155,156,5,111,0,0,156,157,5,108,0,0,157,158,5,101,0,0,158,159,
	5,97,0,0,159,160,5,110,0,0,160,20,1,0,0,0,161,162,5,118,0,0,162,163,5,111,
	0,0,163,164,5,105,0,0,164,165,5,100,0,0,165,22,1,0,0,0,166,167,5,108,0,
	0,167,168,5,101,0,0,168,169,5,116,0,0,169,24,1,0,0,0,170,171,5,100,0,0,
	171,172,5,111,0,0,172,26,1,0,0,0,173,174,5,105,0,0,174,175,5,102,0,0,175,
	28,1,0,0,0,176,177,5,101,0,0,177,178,5,108,0,0,178,179,5,115,0,0,179,180,
	5,101,0,0,180,30,1,0,0,0,181,182,5,119,0,0,182,183,5,104,0,0,183,184,5,
	105,0,0,184,185,5,108,0,0,185,186,5,101,0,0,186,32,1,0,0,0,187,188,5,114,
	0,0,188,189,5,101,0,0,189,190,5,116,0,0,190,191,5,117,0,0,191,192,5,114,
	0,0,192,193,5,110,0,0,193,34,1,0,0,0,194,195,5,123,0,0,195,36,1,0,0,0,196,
	197,5,125,0,0,197,38,1,0,0,0,198,199,5,40,0,0,199,40,1,0,0,0,200,201,5,
	41,0,0,201,42,1,0,0,0,202,203,5,91,0,0,203,44,1,0,0,0,204,205,5,93,0,0,
	205,46,1,0,0,0,206,207,5,46,0,0,207,48,1,0,0,0,208,209,5,44,0,0,209,50,
	1,0,0,0,210,211,5,59,0,0,211,52,1,0,0,0,212,213,5,61,0,0,213,54,1,0,0,0,
	214,215,5,43,0,0,215,56,1,0,0,0,216,217,5,45,0,0,217,58,1,0,0,0,218,219,
	5,42,0,0,219,60,1,0,0,0,220,221,5,47,0,0,221,62,1,0,0,0,222,223,5,38,0,
	0,223,64,1,0,0,0,224,225,5,124,0,0,225,66,1,0,0,0,226,227,5,126,0,0,227,
	68,1,0,0,0,228,229,5,60,0,0,229,70,1,0,0,0,230,231,5,62,0,0,231,72,1,0,
	0,0,232,234,7,0,0,0,233,232,1,0,0,0,234,235,1,0,0,0,235,233,1,0,0,0,235,
	236,1,0,0,0,236,237,1,0,0,0,237,238,6,36,0,0,238,74,1,0,0,0,239,240,5,47,
	0,0,240,241,5,42,0,0,241,245,1,0,0,0,242,244,9,0,0,0,243,242,1,0,0,0,244,
	247,1,0,0,0,245,246,1,0,0,0,245,243,1,0,0,0,246,251,1,0,0,0,247,245,1,0,
	0,0,248,249,5,42,0,0,249,252,5,47,0,0,250,252,5,0,0,1,251,248,1,0,0,0,251,
	250,1,0,0,0,252,253,1,0,0,0,253,254,6,37,0,0,254,76,1,0,0,0,255,256,5,47,
	0,0,256,257,5,47,0,0,257,261,1,0,0,0,258,260,8,1,0,0,259,258,1,0,0,0,260,
	263,1,0,0,0,261,259,1,0,0,0,261,262,1,0,0,0,262,264,1,0,0,0,263,261,1,0,
	0,0,264,265,6,38,0,0,265,78,1,0,0,0,266,268,7,2,0,0,267,266,1,0,0,0,268,
	269,1,0,0,0,269,267,1,0,0,0,269,270,1,0,0,0,270,80,1,0,0,0,271,272,5,116,
	0,0,272,273,5,114,0,0,273,274,5,117,0,0,274,275,5,101,0,0,275,82,1,0,0,
	0,276,277,5,102,0,0,277,278,5,97,0,0,278,279,5,108,0,0,279,280,5,115,0,
	0,280,281,5,101,0,0,281,84,1,0,0,0,282,283,5,110,0,0,283,284,5,117,0,0,
	284,285,5,108,0,0,285,286,5,108,0,0,286,86,1,0,0,0,287,288,5,116,0,0,288,
	289,5,104,0,0,289,290,5,105,0,0,290,291,5,115,0,0,291,88,1,0,0,0,292,296,
	7,3,0,0,293,295,7,4,0,0,294,293,1,0,0,0,295,298,1,0,0,0,296,294,1,0,0,0,
	296,297,1,0,0,0,297,90,1,0,0,0,298,296,1,0,0,0,299,303,5,34,0,0,300,302,
	8,5,0,0,301,300,1,0,0,0,302,305,1,0,0,0,303,301,1,0,0,0,303,304,1,0,0,0,
	304,306,1,0,0,0,305,303,1,0,0,0,306,307,5,34,0,0,307,92,1,0,0,0,8,0,235,
	245,251,261,269,296,303,1,0,1,0];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!JackLexer.__ATN) {
			JackLexer.__ATN = new ATNDeserializer().deserialize(JackLexer._serializedATN);
		}

		return JackLexer.__ATN;
	}


	static DecisionsToDFA = JackLexer._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );
}