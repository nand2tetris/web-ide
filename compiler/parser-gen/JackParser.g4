parser grammar JackParser;

options {
	tokenVocab = JackLexer;
}

program: classDeclaration EOF;

classDeclaration:
	CLASS className LBRACE classVarDec* subroutineDeclaration* rBrace;
className: IDENTIFIER;
classVarDec: (STATIC | FIELD) fieldList SEMICOLON;
fieldList: varType fieldName ( COMMA fieldName)*;
fieldName: IDENTIFIER;
subroutineDeclaration: subroutineType subroutineDecWithoutType;
subroutineType: CONSTRUCTOR | METHOD | FUNCTION;
subroutineDecWithoutType:
	subroutineReturnType subroutineName LPAREN parameterList RPAREN subroutineBody;
subroutineName: IDENTIFIER;
subroutineReturnType: varType | VOID;

varType: INT | CHAR | BOOLEAN | IDENTIFIER;

parameterList: (parameter (COMMA parameter)*)?;
parameter: varType parameterName;
parameterName: IDENTIFIER;
subroutineBody: LBRACE varDeclaration* statements rBrace;
rBrace: RBRACE;
varDeclaration:
	VAR varType varNameInDeclaration (COMMA varNameInDeclaration)* SEMICOLON;
varNameInDeclaration: IDENTIFIER;
varName: IDENTIFIER;
statements: statement*;
statement:
	letStatement
	| ifElseStatement
	| whileStatement
	| doStatement
	| returnStatement;

letStatement:
	LET (varName | arrayAccess) EQUALS expression SEMICOLON; //TODO: check if we need right assoc for this

ifElseStatement: ifStatement elseStatement?;
ifStatement:
	IF LPAREN expression RPAREN LBRACE statements rBrace;
elseStatement: ELSE LBRACE statements rBrace;

whileStatement:
	WHILE LPAREN expression RPAREN LBRACE statements rBrace;

doStatement: DO subroutineCall SEMICOLON;

subroutineCall: subroutineId LPAREN expressionList RPAREN;
subroutineId: ((className | THIS_LITERAL) DOT)? subroutineName;
returnStatement: RETURN expression? SEMICOLON;

expressionList: (expression (COMMA expression)*)?;

expression:
	binaryOperation = expression binaryOperator expression
	| constant 
	| varName
	| subroutineCall
	| arrayAccess
	| unaryOp
	| groupedExpression;

groupedExpression: LPAREN expression RPAREN;
unaryOp: unaryOperator expression;
arrayAccess: varName LBRACKET expression RBRACKET;

constant:
	INTEGER_LITERAL
	| STRING_LITERAL
	| BOOLEAN_LITERAL
	| NULL_LITERAL
	| THIS_LITERAL;

unaryOperator: TILDE | MINUS;
binaryOperator:
	PLUS
	| MINUS
	| MUL
	| DIV
	| AND
	| OR
	| LESS_THAN
	| GREATER_THAN
	| EQUALS;