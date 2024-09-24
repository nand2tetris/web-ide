trace:
	antlr4-parse  JackLexer.g4 JackParser.g4  program -tokens -trace< Main.jack

tokens:
	antlr4-parse JackLexer.g4 JackParser.g4 program  -tokens < Main.jack

gui:
	antlr4-parse JackLexer.g4  JackParser.g4   program -gui  < Main.jack
gen:
	antlr4 JackLexer.g4 JackParser.g4 -o ./output