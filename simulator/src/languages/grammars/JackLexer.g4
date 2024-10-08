lexer grammar JackLexer;

CLASS: 'class';
CONSTRUCTOR: 'constructor';
FUNCTION: 'function';
METHOD: 'method';
FIELD: 'field';
STATIC: 'static';
VAR: 'var';
INT: 'int';
CHAR: 'char';
BOOLEAN: 'boolean';
VOID: 'void';

LET: 'let';
DO: 'do';
IF: 'if';
ELSE: 'else';
WHILE: 'while';
RETURN: 'return';


LBRACE: '{';
RBRACE: '}';
LPAREN: '(';
RPAREN: ')';
LBRACKET: '[';
RBRACKET: ']';
DOT: '.';
COMMA: ',';
SEMICOLON: ';';

EQUALS: '=';
PLUS: '+';
MINUS: '-';
MUL: '*';
DIV: '/';
AND: '&';
OR: '|';
TILDE: '~';
LESS_THAN: '<';
GREATER_THAN: '>';

WS: [ \t\r\n]+ -> skip;
COMMENT: '/*' .*? '*/' -> skip;
LINE_COMMENT: '//' ~[\r\n]* -> skip;

INTEGER_LITERAL: [0-9]+;
TRUE: 'true'; 
FALSE: 'false';
NULL_LITERAL: 'null';
THIS_LITERAL: 'this';

IDENTIFIER: [a-zA-Z_] [a-zA-Z0-9_]*;

STRING_LITERAL
  : UnterminatedStringLiteral '"'
  ;
UnterminatedStringLiteral
  : '"' ~["\\\r\n]*
  ;

